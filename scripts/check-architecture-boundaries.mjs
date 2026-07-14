import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const legacyPackages = ['ai', 'attention-engine', 'core', 'machines'];

for (const packageName of legacyPackages) {
  if (existsSync(path.join(root, 'packages', packageName))) {
    failures.push(`Legacy package still exists: packages/${packageName}`);
  }
}

function sourceFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ['.turbo', 'coverage', 'dist', 'node_modules'].includes(entry.name)
        ? []
        : sourceFiles(entryPath);
    }
    return /\.(?:js|mjs|ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

function importSpecifiers(file) {
  const source = readFileSync(file, 'utf8');
  const specifiers = [];
  const pattern = /(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)['"]([^'"]+)['"]/g;

  for (const match of source.matchAll(pattern)) {
    if (match[1]) specifiers.push(match[1]);
  }

  return specifiers;
}

const surfaces = [
  ['desktop', path.join(root, 'apps', 'desktop')],
  ['guidance', path.join(root, 'packages', 'guidance')],
  ['workflow', path.join(root, 'packages', 'workflow')],
  ['other', path.join(root, 'e2e')],
  ['other', path.join(root, 'scripts')],
];

for (const [surface, directory] of surfaces) {
  for (const file of sourceFiles(directory)) {
    for (const specifier of importSpecifiers(file)) {
      const packageMatch = specifier.match(/^@attentionos\/([^/]+)(\/.*)?$/);
      if (packageMatch?.[2]?.startsWith('/src')) {
        failures.push(`${path.relative(root, file)} imports private package source ${specifier}`);
      }

      if (
        ['guidance', 'workflow'].includes(surface) &&
        specifier.startsWith('.') &&
        path.resolve(path.dirname(file), specifier).startsWith(path.join(root, 'apps', 'desktop'))
      ) {
        failures.push(`${path.relative(root, file)} imports desktop code through ${specifier}`);
      }

      if (!packageMatch) continue;
      const importedPackage = packageMatch[1];

      if (surface === 'desktop' && !['guidance', 'workflow'].includes(importedPackage)) {
        failures.push(
          `${path.relative(root, file)} imports disallowed AttentionOS package ${specifier}`,
        );
      }

      if (surface === 'guidance' && importedPackage !== 'workflow') {
        failures.push(
          `${path.relative(root, file)} may only import @attentionos/workflow, found ${specifier}`,
        );
      }

      if (surface === 'workflow') {
        failures.push(
          `${path.relative(root, file)} must not import another AttentionOS package, found ${specifier}`,
        );
      }
    }
  }
}

function attentionDependencies(packagePath) {
  const manifest = JSON.parse(readFileSync(packagePath, 'utf8'));
  return Object.keys(manifest.dependencies ?? {}).filter((name) =>
    name.startsWith('@attentionos/'),
  );
}

const dependencyRules = [
  ['apps/desktop/package.json', new Set(['@attentionos/guidance', '@attentionos/workflow'])],
  ['packages/guidance/package.json', new Set(['@attentionos/workflow'])],
  ['packages/workflow/package.json', new Set()],
];

for (const [manifestPath, allowed] of dependencyRules) {
  for (const dependency of attentionDependencies(path.join(root, manifestPath))) {
    if (!allowed.has(dependency)) {
      failures.push(`${manifestPath} contains disallowed dependency ${dependency}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Architecture boundary check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  'Architecture boundary check passed: desktop -> Workflow/Guidance; Guidance -> Workflow.',
);
