#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];

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

const allowedRootDocs = new Set(['README.md', 'AGENTS.md']);
const allowedDocsRoot = new Set(['docs/README.md']);
const requiredFiles = [
  'AGENTS.md',
  'README.md',
  'docs/README.md',
  'docs/work/todo.md',
  'docs/governance/project-state.md',
  'docs/governance/ai-generated-doc-workflow.md',
  'docs/governance/development-document-lifecycle.md',
  'docs/governance/documentation-automation.md',
];

const stableGovernanceFiles = new Set([
  'docs/governance/README.md',
  'docs/governance/ai-generated-doc-workflow.md',
  'docs/governance/changelog.md',
  'docs/governance/development-document-lifecycle.md',
  'docs/governance/documentation-automation.md',
  'docs/governance/maintenance-log.md',
  'docs/governance/project-state.md',
  'docs/governance/stale-report.md',
]);

const dateSlugPattern = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*(?:\.zh-CN)?\.md$/;

function toRel(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
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

function fileContent(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function checkRequiredFiles() {
  for (const file of requiredFiles) {
    if (!existsSync(path.join(root, file))) {
      errors.push(`Missing required documentation governance file: ${file}`);
    }
  }
}

function checkRootBoundaries(files) {
  const rootDocs = files.filter((file) => !file.includes('/') && isDocFile(file));
  for (const file of rootDocs) {
    if (!allowedRootDocs.has(file)) {
      errors.push(`Root documentation file is not allowed: ${file}`);
    }
  }

  const forbiddenRootDirs = ['plans', 'decisions', 'sources-or-raw', 'work', 'archive', '.ai'];
  for (const dir of forbiddenRootDirs) {
    const fullPath = path.join(root, dir);
    if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
      errors.push(`Forbidden root-level documentation directory exists: ${dir}/`);
    }
  }
}

function checkDocsRoot(files) {
  const docsRootFiles = files.filter((file) => path.dirname(file) === 'docs' && isDocFile(file));
  for (const file of docsRootFiles) {
    if (!allowedDocsRoot.has(file)) {
      errors.push(`Only docs/README.md may live directly under docs/: ${file}`);
    }
  }
}

function checkTodo(files) {
  const todoFiles = files.filter((file) => path.basename(file).toLowerCase() === 'todo.md');
  if (todoFiles.length !== 1 || todoFiles[0] !== 'docs/work/todo.md') {
    errors.push(
      `Expected exactly one todo file at docs/work/todo.md; found: ${todoFiles.join(', ') || 'none'}`,
    );
  }
}

function checkCodeAdjacentDocs(files) {
  for (const file of files) {
    if (isDocFile(file) && (file.startsWith('apps/') || file.startsWith('packages/'))) {
      errors.push(`Long-lived docs must be under docs/, not beside code: ${file}`);
    }
  }
}

function checkGeneratedDocNames(files) {
  const routeRules = [
    { prefix: 'docs/work/', allow: new Set(['docs/work/README.md', 'docs/work/todo.md']) },
    { prefix: 'docs/plans/', allow: new Set(['docs/plans/README.md']) },
    { prefix: 'docs/decisions/', allow: new Set(['docs/decisions/README.txt']) },
    {
      prefix: 'docs/governance/proposed-updates/',
      allow: new Set(['docs/governance/proposed-updates/README.md']),
    },
    {
      prefix: 'docs/governance/evolution-proposals/',
      allow: new Set(['docs/governance/evolution-proposals/README.md']),
    },
  ];

  for (const file of files) {
    if (!file.endsWith('.md')) {
      continue;
    }

    if (file.startsWith('docs/governance/') && path.dirname(file) === 'docs/governance') {
      if (!stableGovernanceFiles.has(file) && !dateSlugPattern.test(path.basename(file))) {
        errors.push(
          `Governance doc needs a stable allowed name or YYYY-MM-DD-lower-kebab-slug.md: ${file}`,
        );
      }
    }

    for (const rule of routeRules) {
      if (!file.startsWith(rule.prefix) || rule.allow.has(file)) {
        continue;
      }

      if (!dateSlugPattern.test(path.basename(file))) {
        errors.push(`Generated doc name must be YYYY-MM-DD-lower-kebab-slug.md: ${file}`);
      }
    }
  }
}

function checkDecisions(files) {
  const decisions = files.filter(
    (file) => file.startsWith('docs/decisions/') && file.endsWith('.md'),
  );
  for (const file of decisions) {
    const content = fileContent(file);
    if (!/^status:\s*\S+/m.test(content)) {
      errors.push(`Decision file is missing frontmatter status: ${file}`);
    }
    if (!/^date:\s*\S+/m.test(content)) {
      errors.push(`Decision file is missing frontmatter date: ${file}`);
    }
    if (!content.includes('## Rationale')) {
      errors.push(`Decision file is missing Rationale section: ${file}`);
    }
  }
}

function checkPendingProposals(files) {
  const proposals = files.filter(
    (file) =>
      file.startsWith('docs/governance/proposed-updates/') &&
      file.endsWith('.md') &&
      path.basename(file) !== 'README.md',
  );

  for (const file of proposals) {
    const content = fileContent(file);
    if (/^status:\s*(accepted|applied|rejected|superseded)\s*$/im.test(content)) {
      errors.push(`Resolved proposal should be archived, not left pending: ${file}`);
    }
    if (!/^status:\s*proposed\s*$/im.test(content)) {
      warnings.push(`Pending proposal has no explicit status: proposed frontmatter: ${file}`);
    }
  }
}

const files = walk(root).filter(isDocFile);

checkRequiredFiles();
checkRootBoundaries(files);
checkDocsRoot(files);
checkTodo(files);
checkCodeAdjacentDocs(files);
checkGeneratedDocNames(files);
checkDecisions(files);
checkPendingProposals(files);

if (errors.length > 0) {
  console.error('Documentation governance check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  if (warnings.length > 0) {
    console.error('\nWarnings:');
    for (const warning of warnings) {
      console.error(`- ${warning}`);
    }
  }
  process.exit(1);
}

console.log('Documentation governance check passed.');

if (warnings.length > 0) {
  console.log('\nWarnings:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}
