import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const srcTauriDir = path.join(repoRoot, 'apps/desktop/src-tauri');
const configPath = path.join(srcTauriDir, 'tauri.conf.json');
const capabilityPath = path.join(srcTauriDir, 'capabilities/default.json');
const appPath = path.join(srcTauriDir, 'target/release/bundle/macos/AttentionOS.app');
const dmgPath = path.join(srcTauriDir, 'target/release/bundle/dmg/AttentionOS_0.1.0_aarch64.dmg');
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

function blocked(label, details) {
  results.push({ details, label, status: 'EXTERNAL_BLOCKER' });
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

function plistJson(filePath) {
  const output = execFileSync('plutil', ['-convert', 'json', '-o', '-', filePath], {
    encoding: 'utf8',
  });
  return JSON.parse(output);
}

const config = readJson(configPath);
const capability = readJson(capabilityPath);

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
expectEqual('Tauri capability surface', capability.permissions?.join(','), 'core:default');

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
  blocked(
    'Distribution signing identity',
    'current artifact is ad-hoc/linker signed only; Developer ID or Apple Distribution signing requires owner credentials',
  );
} else if (signature.code === 0 && signature.output.includes('TeamIdentifier=')) {
  pass(
    'Distribution signing identity',
    signature.output.match(/TeamIdentifier=.*/)?.[0] ?? 'present',
  );
} else {
  blocked(
    'Distribution signing identity',
    signature.output || 'codesign metadata unavailable until owner signs the bundle',
  );
}

const verification = run('codesign', ['--verify', '--deep', '--strict', '--verbose=4', appPath]);
if (verification.code === 0) {
  pass('Bundle code signature verifies', 'codesign --verify --deep --strict passed');
} else {
  blocked(
    'Bundle code signature verifies',
    `${verification.output || `exit ${verification.code}`} (expected until a real signed build is produced)`,
  );
}

const entitlements = run('codesign', ['-d', '--entitlements', ':-', appPath]);
if (entitlements.code === 0 && entitlements.output.includes('com.apple.security.app-sandbox')) {
  pass('Signed entitlements include App Sandbox', 'com.apple.security.app-sandbox');
} else {
  blocked(
    'Signed entitlements include App Sandbox',
    'entitlements are configured in Tauri but only apply after a signed build with owner-provided signing identity/profile',
  );
}

blocked(
  'Notarization and App Store upload',
  'requires Apple Developer credentials, distribution certificate/profile, notary/App Store Connect auth, and explicit owner authorization',
);

for (const result of results) {
  console.log(`${result.status.padEnd(16)} ${result.label}: ${result.details ?? ''}`);
}

const failures = results.filter((result) => result.status === 'FAIL');
const blockers = results.filter((result) => result.status === 'EXTERNAL_BLOCKER');

console.log('');
console.log(
  `Summary: ${results.length} checks, ${failures.length} failures, ${blockers.length} external blockers.`,
);

if (failures.length > 0) {
  process.exitCode = 1;
}
