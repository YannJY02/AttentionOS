import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const srcTauriDir = path.join(repoRoot, 'apps/desktop/src-tauri');
const appPath = path.join(srcTauriDir, 'target/release/bundle/macos/AttentionOS.app');
const binaryPath = path.join(appPath, 'Contents/MacOS/attentionos-desktop');
const appDataDir = path.join(os.homedir(), 'Library/Application Support/com.yannjy.attentionos');
const webkitDir = path.join(os.homedir(), 'Library/WebKit/com.yannjy.attentionos');
const cacheDir = path.join(os.homedir(), 'Library/Caches/com.yannjy.attentionos');
const stateFile = path.join(appDataDir, 'attentionos-state.json');
const qaDir = path.join(os.tmpdir(), `attentionos-native-performance-${Date.now()}`);
const backupDir = `${qaDir}-app-data-backup`;

const budgets = {
  corruptSnapshotRecovery: 10_000,
  validSnapshotReady: 8_000,
};

const hierarchyEntries = [
  {
    id: 'vision-native-perf',
    entityType: 'task',
    hierarchyLayer: 'vision',
    title: 'Native performance vision',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'area-native-perf',
    entityType: 'task',
    hierarchyLayer: 'area',
    title: 'Native performance area',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'vision-native-perf',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'goal-native-perf',
    entityType: 'task',
    hierarchyLayer: 'goal',
    title: 'Native performance goal',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'area-native-perf',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'project-native-perf',
    entityType: 'task',
    hierarchyLayer: 'project',
    title: 'Native performance project',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'goal-native-perf',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
  {
    id: 'task-native-perf',
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Native performance task',
    status: 'active',
    properties: {
      estimatedMinutes: 25,
    },
    workflowStage: 'overview',
    parentId: 'project-native-perf',
    createdAt: '2026-05-24T00:00:00.000Z',
    updatedAt: '2026-05-24T00:00:00.000Z',
  },
];

function run(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function killExistingApp() {
  run('pkill', ['-x', 'attentionos-desktop']);
}

function validSnapshot() {
  return JSON.stringify(
    {
      appVersion: '0.1.0',
      entries: {
        'attentionos.hierarchy.v1': JSON.stringify(hierarchyEntries),
        'attentionos.onboarding.v1': JSON.stringify({
          completedAt: '2026-05-24T00:00:00.000Z',
          localDataAcknowledged: true,
          nonMedicalAcknowledged: true,
        }),
      },
      exportedAt: '2026-05-24T00:00:00.000Z',
      schemaVersion: 1,
    },
    null,
    2,
  );
}

function resetAppData(payload) {
  rmSync(appDataDir, { force: true, recursive: true });
  clearRuntimeWebViewData();
  mkdirSync(appDataDir, { recursive: true });
  writeFileSync(stateFile, payload, 'utf8');
}

function clearRuntimeWebViewData() {
  rmSync(webkitDir, { force: true, recursive: true });
  rmSync(cacheDir, { force: true, recursive: true });
}

function preserveAppData() {
  rmSync(qaDir, { force: true, recursive: true });
  rmSync(backupDir, { force: true, recursive: true });
  mkdirSync(qaDir, { recursive: true });

  if (existsSync(appDataDir)) {
    cpSync(appDataDir, backupDir, { recursive: true });
  }
}

function restoreAppData() {
  killExistingApp();
  rmSync(appDataDir, { force: true, recursive: true });
  clearRuntimeWebViewData();

  if (existsSync(backupDir)) {
    cpSync(backupDir, appDataDir, { recursive: true });
  }

  rmSync(qaDir, { force: true, recursive: true });
  rmSync(backupDir, { force: true, recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMarker(markerPath, child, budgetMs) {
  const startedAt = Date.now();
  let exited = false;
  let exitDetails = '';

  child.on('exit', (code, signal) => {
    exited = true;
    exitDetails = `process exited before readiness marker: code=${code} signal=${signal}`;
  });

  while (Date.now() - startedAt <= budgetMs) {
    if (existsSync(markerPath)) {
      return Date.now() - startedAt;
    }

    if (exited) {
      throw new Error(exitDetails);
    }

    await sleep(100);
  }

  throw new Error(`readiness marker was not written within ${budgetMs}ms`);
}

async function terminate(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  await sleep(500);

  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
  }
}

async function runScenario({ afterReady, label, payload }) {
  const budgetMs = budgets[label];
  const markerPath = path.join(qaDir, `${label}.json`);
  resetAppData(payload);

  const child = spawn(binaryPath, [], {
    cwd: path.dirname(binaryPath),
    env: {
      ...process.env,
      ATTENTIONOS_QA_READY_FILE: markerPath,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  try {
    const durationMs = await waitForMarker(markerPath, child, budgetMs);
    const marker = JSON.parse(readFileSync(markerPath, 'utf8'));

    if (!['app-ready', 'onboarding-ready'].includes(marker.label)) {
      throw new Error(`unexpected readiness label: ${marker.label}`);
    }

    await afterReady?.();

    console.log(`[native-performance] ${label}: ${durationMs}ms / ${budgetMs}ms`);
    return { durationMs, marker };
  } catch (error) {
    const details = output.trim();
    throw new Error(
      `${label} failed: ${error instanceof Error ? error.message : String(error)}${
        details ? `\n${details}` : ''
      }`,
    );
  } finally {
    await terminate(child);
    killExistingApp();
  }
}

async function main() {
  if (!existsSync(binaryPath)) {
    throw new Error(`Packaged AttentionOS binary not found: ${binaryPath}`);
  }

  preserveAppData();
  killExistingApp();

  try {
    await runScenario({
      label: 'validSnapshotReady',
      payload: validSnapshot(),
    });

    await runScenario({
      afterReady: async () => {
        const state = readFileSync(stateFile, 'utf8');
        if (!state.includes('"schemaVersion": 1')) {
          throw new Error('corrupt recovery did not rewrite a valid app-state snapshot');
        }

        const recoveryDir = path.join(appDataDir, 'recovery');
        if (!existsSync(recoveryDir)) {
          throw new Error('corrupt recovery directory was not created');
        }
      },
      label: 'corruptSnapshotRecovery',
      payload: 'not valid json',
    });

    console.log('Native performance check passed with current packaged app.');
  } finally {
    restoreAppData();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
