#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const ignoredDirs = new Set([
  '.git',
  'node_modules',
  '.turbo',
  'dist',
  'build',
  'coverage',
  'playwright-report',
  'test-results',
  '.playwright-cli',
  '.pnpm-store',
]);

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CONTEXT-MAP.md',
  'docs/README.md',
  'docs/adr/README.md',
  'docs/adr/0001-two-context-desktop-architecture.md',
  'docs/adr/0002-matt-documentation-control-plane.md',
  'docs/product/README.md',
  'docs/product/MASTER_PRODUCT_PLAN.zh-CN.md',
  'docs/workflow/README.md',
  'docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md',
  'docs/sources-or-raw/README.md',
  'docs/sources-or-raw/user-original-long-prompts.zh-CN.md',
  'docs/agents/README.md',
  'docs/agents/domain.md',
  'docs/agents/issue-tracker.md',
  'docs/agents/triage-labels.md',
  'packages/workflow/CONTEXT.md',
  'packages/workflow/docs/adr/README.md',
  'packages/workflow/docs/adr/0001-workflow-state-authority.md',
  'packages/guidance/CONTEXT.md',
  'packages/guidance/docs/adr/README.md',
  'packages/guidance/docs/adr/0001-guidance-facts-and-suggestions.md',
];

const allowedRootDocs = new Set(['README.md', 'AGENTS.md', 'CONTEXT-MAP.md']);
const allowedDocsDirectories = new Set(['adr', 'agents', 'product', 'sources-or-raw', 'workflow']);
const forbiddenDocsDirectories = [
  'apps',
  'archive',
  'decisions',
  'governance',
  'plans',
  'roadmap-execution',
  'work',
];
const forbiddenRootDirectories = ['.ai', 'archive', 'decisions', 'plans', 'sources-or-raw', 'work'];
const forbiddenLegacyPathPrefixes = forbiddenDocsDirectories.map((dir) => `docs/${dir}/`);
const contextDocs = new Set(['packages/workflow/CONTEXT.md', 'packages/guidance/CONTEXT.md']);
const contextAdrPrefixes = ['packages/workflow/docs/adr/', 'packages/guidance/docs/adr/'];

function toRel(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(toRel(fullPath));
    }
  }

  return files;
}

function isDocFile(file) {
  return file.endsWith('.md') || file.endsWith('.txt');
}

function isManagedDoc(file) {
  return (
    allowedRootDocs.has(file) ||
    file.startsWith('docs/') ||
    contextDocs.has(file) ||
    contextAdrPrefixes.some((prefix) => file.startsWith(prefix))
  );
}

function read(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function checkRequiredFiles() {
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      errors.push(`Missing required Matt workflow document: ${file}`);
    }
  }
}

function checkRootBoundary(files) {
  for (const file of files.filter(
    (candidate) => !candidate.includes('/') && isDocFile(candidate),
  )) {
    if (!allowedRootDocs.has(file)) {
      errors.push(`Root documentation file is not allowed: ${file}`);
    }
  }

  for (const dir of forbiddenRootDirectories) {
    const fullPath = path.join(root, dir);
    if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
      errors.push(`Forbidden root-level documentation directory exists: ${dir}/`);
    }
  }

  for (const file of ['project-state.md', 'changelog.md', 'todo.md']) {
    if (existsSync(path.join(root, file))) {
      errors.push(`Forbidden root-level control-plane file exists: ${file}`);
    }
  }
}

function checkDocsBoundary() {
  const entries = readdirSync(path.join(root, 'docs'), { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && !allowedDocsDirectories.has(entry.name)) {
      errors.push(`Unexpected top-level docs directory: docs/${entry.name}/`);
    }
    if (entry.isFile() && isDocFile(entry.name) && entry.name !== 'README.md') {
      errors.push(`Only docs/README.md may live directly under docs/: docs/${entry.name}`);
    }
  }

  for (const dir of forbiddenDocsDirectories) {
    if (existsSync(path.join(root, 'docs', dir))) {
      errors.push(`Legacy documentation control plane still exists: docs/${dir}/`);
    }
  }
}

function checkContextLayout(files) {
  const foundContexts = files.filter((file) => path.basename(file) === 'CONTEXT.md');
  const unexpectedContexts = foundContexts.filter((file) => !contextDocs.has(file));

  if (foundContexts.length !== contextDocs.size || unexpectedContexts.length > 0) {
    errors.push(
      `Expected exactly the Workflow and Guidance contexts; found: ${foundContexts.join(', ') || 'none'}`,
    );
  }

  for (const file of files) {
    if (!isDocFile(file) || (!file.startsWith('apps/') && !file.startsWith('packages/'))) {
      continue;
    }

    const isAllowedContext = contextDocs.has(file);
    const isAllowedAdr =
      file.endsWith('.md') && contextAdrPrefixes.some((prefix) => file.startsWith(prefix));
    if (!isAllowedContext && !isAllowedAdr) {
      errors.push(`Unexpected code-adjacent documentation: ${file}`);
    }
  }
}

function checkNoParallelTracker(files) {
  const todoFiles = files.filter(
    (file) => isManagedDoc(file) && path.basename(file).toLowerCase() === 'todo.md',
  );
  if (todoFiles.length > 0) {
    errors.push(`Todo documents are not an active-work authority: ${todoFiles.join(', ')}`);
  }

  for (const file of files.filter((candidate) => isDocFile(candidate) && isManagedDoc(candidate))) {
    if (file.startsWith('docs/sources-or-raw/')) {
      continue;
    }

    const content = read(file);
    for (const prefix of forbiddenLegacyPathPrefixes) {
      if (content.includes(prefix)) {
        errors.push(`Current document references retired control-plane path ${prefix}: ${file}`);
      }
    }
  }

  const docsIndex = read('docs/README.md');
  if (!docsIndex.includes('https://github.com/YannJY02/AttentionOS/issues')) {
    errors.push('docs/README.md must route active work to GitHub Issues.');
  }

  const agentInstructions = read('AGENTS.md');
  if (
    !agentInstructions.includes('automatically commit only') ||
    !agentInstructions.includes('push the current task branch')
  ) {
    errors.push('AGENTS.md must preserve the automatic scoped commit-and-push completion rule.');
  }
}

function checkAdrs(files) {
  const adrFiles = files.filter(
    (file) =>
      file.endsWith('.md') &&
      path.basename(file) !== 'README.md' &&
      (file.startsWith('docs/adr/') ||
        contextAdrPrefixes.some((prefix) => file.startsWith(prefix))),
  );

  for (const file of adrFiles) {
    const content = read(file);
    if (!content.startsWith('---\n')) {
      errors.push(`ADR is missing YAML frontmatter: ${file}`);
    }
    if (!/^status:\s*(accepted|proposed|superseded|rejected)\s*$/m.test(content)) {
      errors.push(`ADR has no recognized status: ${file}`);
    }
    if (!/^date:\s*\d{4}-\d{2}-\d{2}\s*$/m.test(content)) {
      errors.push(`ADR is missing an ISO date: ${file}`);
    }
    for (const heading of ['## Context', '## Decision', '## Consequences']) {
      if (!content.includes(heading)) {
        errors.push(`ADR is missing ${heading}: ${file}`);
      }
    }
  }
}

function checkLocalLinks(files) {
  const markdownLinkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  for (const file of files.filter(
    (candidate) => candidate.endsWith('.md') && isManagedDoc(candidate),
  )) {
    const content = read(file);
    for (const match of content.matchAll(markdownLinkPattern)) {
      const target = match[1];
      if (target.startsWith('#') || target.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
        continue;
      }

      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(target.split('#')[0].split('?')[0]);
      } catch {
        errors.push(`Malformed local Markdown link in ${file}: ${target}`);
        continue;
      }

      const resolved = path.resolve(root, path.dirname(file), decodedTarget);
      if (!existsSync(resolved)) {
        errors.push(`Broken local Markdown link in ${file}: ${target}`);
      }
    }
  }
}

const files = walk(root);

checkRequiredFiles();
checkRootBoundary(files);
checkDocsBoundary();
checkContextLayout(files);
checkNoParallelTracker(files);
checkAdrs(files);
checkLocalLinks(files);

if (errors.length > 0) {
  console.error('Matt documentation workflow check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Matt documentation workflow check passed.');
