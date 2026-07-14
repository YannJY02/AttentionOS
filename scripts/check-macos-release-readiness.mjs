import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const srcTauriDir = path.join(repoRoot, 'apps/desktop/src-tauri');
const configPath = path.join(srcTauriDir, 'tauri.conf.json');
const capabilityPath = path.join(srcTauriDir, 'capabilities/default.json');
const appPath = path.join(srcTauriDir, 'target/release/bundle/macos/AttentionOS.app');
const tauriArchitecture = process.arch === 'arm64' ? 'aarch64' : process.arch;
const dmgPath = path.join(
  srcTauriDir,
  `target/release/bundle/dmg/AttentionOS_0.1.0_${tauriArchitecture}.dmg`,
);
const plistPath = path.join(appPath, 'Contents/Info.plist');
const binaryPath = path.join(appPath, 'Contents/MacOS/attentionos-desktop');

const results = [];

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  });

  return {
    code: result.status ?? 1,
    output: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
  };
}

function pass(label, details) {
  results.push({ details, label, status: 'PASS' });
}

function warn(label, details) {
  results.push({ details, label, status: 'WARN' });
}

function fail(label, details) {
  results.push({ details, label, status: 'FAIL' });
}

function outOfScope(label, details) {
  results.push({ details, label, status: 'OUT_OF_SCOPE' });
}

function expectEqual(label, actual, expected) {
  if (actual === expected) {
    pass(label, `${actual}`);
  } else {
    fail(label, `expected ${expected}, found ${actual ?? '<missing>'}`);
  }
}

function expectTruthy(label, actual, details) {
  if (actual) {
    pass(label, details ?? `${actual}`);
  } else {
    fail(label, details ?? 'missing');
  }
}

function verifyFreshness(label, artifactPath, sourceCommitTimeMs) {
  if (!existsSync(artifactPath)) {
    return;
  }

  const modifiedAt = statSync(artifactPath).mtime;
  if (modifiedAt.getTime() >= sourceCommitTimeMs) {
    pass(label, modifiedAt.toISOString());
  } else {
    fail(
      label,
      `${modifiedAt.toISOString()} predates source commit ${new Date(sourceCommitTimeMs).toISOString()}`,
    );
  }
}

function recordSha256(label, artifactPath) {
  if (!existsSync(artifactPath)) {
    return;
  }

  const digest = run('shasum', ['-a', '256', artifactPath]);
  if (digest.code === 0) {
    pass(label, digest.output.split(/\s+/)[0]);
  } else {
    fail(label, digest.output || `exit ${digest.code}`);
  }
}

function plistJson(filePath) {
  const output = execFileSync('plutil', ['-convert', 'json', '-o', '-', filePath], {
    encoding: 'utf8',
  });
  return JSON.parse(output);
}

const config = readJson(configPath);
const capability = readJson(capabilityPath);
const revision = run('git', ['rev-parse', 'HEAD']);
const sourceCommitTime = run('git', ['show', '-s', '--format=%ct', 'HEAD']);
const sourceTreeChanges = run('git', ['status', '--porcelain']);

if (revision.code === 0 && sourceCommitTime.code === 0) {
  pass('Source revision', revision.output);
} else {
  fail('Source revision', revision.output || sourceCommitTime.output || 'git metadata unavailable');
}

if (sourceTreeChanges.code === 0 && sourceTreeChanges.output === '') {
  pass('Source tree is clean', 'artifact can be traced to HEAD');
} else {
  fail('Source tree is clean', sourceTreeChanges.output || 'git status failed');
}

expectEqual('Tauri product name', config.productName, 'AttentionOS');
expectEqual('Tauri bundle identifier', config.identifier, 'com.yannjy.attentionos');
expectEqual('Tauri bundle version', config.version, '0.1.0');
expectEqual('Tauri App Store category', config.bundle?.category, 'Productivity');
expectTruthy(
  'Tauri CSP configured',
  config.app?.security?.csp && config.app.security.csp !== 'null',
);
expectEqual('Main window title', config.app?.windows?.[0]?.title, 'AttentionOS');
expectTruthy(
  'Main window has release-sized minimum bounds',
  config.app?.windows?.[0]?.minWidth >= 900,
);
expectEqual('Tauri macOS hardened runtime flag', config.bundle?.macOS?.hardenedRuntime, true);
expectTruthy(
  'Tauri macOS entitlements file exists',
  existsSync(path.join(srcTauriDir, config.bundle?.macOS?.entitlements ?? '')),
  config.bundle?.macOS?.entitlements,
);
expectTruthy(
  'Tauri macOS Info.plist merge file exists',
  existsSync(path.join(srcTauriDir, config.bundle?.macOS?.infoPlist ?? '')),
  config.bundle?.macOS?.infoPlist,
);
expectEqual(
  'Tauri capability surface',
  [...(capability.permissions ?? [])].sort().join(','),
  [
    'core:default',
    'notification:allow-is-permission-granted',
    'notification:allow-notify',
    'notification:allow-request-permission',
  ]
    .sort()
    .join(','),
);

if (existsSync(appPath)) {
  pass('macOS app bundle exists', path.relative(repoRoot, appPath));
  const plist = plistJson(plistPath);
  expectEqual('Bundle display name', plist.CFBundleDisplayName, 'AttentionOS');
  expectEqual('Bundle identifier', plist.CFBundleIdentifier, 'com.yannjy.attentionos');
  expectEqual('Bundle executable', plist.CFBundleExecutable, 'attentionos-desktop');
  expectEqual('Bundle short version', plist.CFBundleShortVersionString, '0.1.0');
  expectEqual('Bundle version', plist.CFBundleVersion, '0.1.0');
  expectEqual(
    'Bundle App Store category',
    plist.LSApplicationCategoryType,
    'public.app-category.productivity',
  );
  expectEqual('Bundle encryption export flag', plist.ITSAppUsesNonExemptEncryption, false);
  expectTruthy('Bundle icon file configured', plist.CFBundleIconFile);
  expectTruthy('Bundle high resolution flag configured', plist.NSHighResolutionCapable);
} else {
  fail('macOS app bundle exists', path.relative(repoRoot, appPath));
}

if (existsSync(dmgPath)) {
  const dmgInfo = run('hdiutil', ['imageinfo', dmgPath]);
  if (dmgInfo.code === 0 && dmgInfo.output.includes('UDIF read-only compressed')) {
    pass('DMG imageinfo validates', path.relative(repoRoot, dmgPath));
  } else {
    fail('DMG imageinfo validates', dmgInfo.output || `exit ${dmgInfo.code}`);
  }
} else {
  fail('DMG exists', path.relative(repoRoot, dmgPath));
}

if (sourceCommitTime.code === 0) {
  const sourceCommitTimeMs = Number(sourceCommitTime.output) * 1000;
  if (Number.isFinite(sourceCommitTimeMs)) {
    verifyFreshness('App binary is fresh for source revision', binaryPath, sourceCommitTimeMs);
    verifyFreshness('DMG is fresh for source revision', dmgPath, sourceCommitTimeMs);
  } else {
    fail('Source commit timestamp', sourceCommitTime.output);
  }
}

recordSha256('App binary SHA-256', binaryPath);
recordSha256('DMG SHA-256', dmgPath);

if (existsSync(binaryPath)) {
  const otool = run('otool', ['-L', binaryPath]);
  if (otool.code === 0 && !otool.output.includes('@rpath')) {
    pass('Mach-O dependencies are system-resolved', 'no unresolved @rpath entries');
  } else if (otool.code === 0) {
    warn('Mach-O dependencies include @rpath', otool.output);
  } else {
    fail('Mach-O dependency inspection', otool.output || `exit ${otool.code}`);
  }
}

const signature = run('codesign', ['-dv', '--verbose=4', appPath]);
if (signature.code === 0 && signature.output.includes('Signature=adhoc')) {
  pass(
    'Unsigned local artifact scope',
    'artifact is ad-hoc/linker signed only; distribution signing was intentionally not performed',
  );
} else if (signature.code === 0 && signature.output.includes('TeamIdentifier=')) {
  fail(
    'Unsigned local artifact scope',
    `unexpected distribution-signed artifact: ${
      signature.output.match(/TeamIdentifier=.*/)?.[0] ?? 'TeamIdentifier present'
    }`,
  );
} else {
  outOfScope(
    'Distribution signing identity',
    signature.output || 'not required for this unsigned local release-candidate artifact',
  );
}

const verification = run('codesign', ['--verify', '--deep', '--strict', '--verbose=4', appPath]);
if (verification.code === 0) {
  pass('Bundle code signature verifies', 'codesign --verify --deep --strict passed');
} else {
  outOfScope(
    'Bundle code signature verifies',
    `${verification.output || `exit ${verification.code}`} (distribution signature is outside this ticket)`,
  );
}

const entitlements = run('codesign', ['-d', '--entitlements', ':-', appPath]);
if (entitlements.code === 0 && entitlements.output.includes('com.apple.security.app-sandbox')) {
  pass('Signed entitlements include App Sandbox', 'com.apple.security.app-sandbox');
} else {
  outOfScope(
    'Signed entitlements include App Sandbox',
    'entitlements are configured but only applied by a signed distribution build',
  );
}

outOfScope(
  'Notarization and App Store upload',
  'explicitly excluded from this unsigned local release-candidate verification',
);

for (const result of results) {
  console.log(`${result.status.padEnd(16)} ${result.label}: ${result.details ?? ''}`);
}

const failures = results.filter((result) => result.status === 'FAIL');
const outOfScopeResults = results.filter((result) => result.status === 'OUT_OF_SCOPE');

console.log('');
console.log(
  `Summary: ${results.length} checks, ${failures.length} failures, ${outOfScopeResults.length} out of scope.`,
);

if (failures.length > 0) {
  process.exitCode = 1;
}
