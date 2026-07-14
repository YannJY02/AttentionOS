#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const rootUrl = new URL('../', import.meta.url);
const rootPath = fileURLToPath(rootUrl);
const baseUrl = process.env.ATTENTIONOS_QA_BASE_URL ?? 'http://127.0.0.1:1422';
const parsedBaseUrl = new URL(baseUrl);
const previewHost = parsedBaseUrl.hostname || '127.0.0.1';
const previewPort = parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? '443' : '80');
const runStartedAt = new Date();
const runSlug = process.env.ATTENTIONOS_QA_RUN_ID ?? localTimestampSlug(runStartedAt);
const reportDir = new URL(
  `../.gstack/qa-reports/release-candidate-browser-workflow-${runSlug}/`,
  import.meta.url,
);
const screenshotsDir = new URL('screenshots/', reportDir);

const workflowSteps = [];
const screenshots = [];
const consoleMessages = [];
const pageErrors = [];
let spawnedServer;
let stoppingServer = false;

function localTimestampSlug(date) {
  const pad = (value) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('-');
}

async function isReachable(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await isReachable(url)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureServer() {
  if (await isReachable(baseUrl)) {
    return 'reused';
  }

  await runCommand('pnpm', ['--filter', '@attentionos/desktop', 'build'], 'build');

  spawnedServer = spawn(
    'pnpm',
    [
      '--filter',
      '@attentionos/desktop',
      'preview',
      '--host',
      previewHost,
      '--port',
      previewPort,
      '--strictPort',
    ],
    {
      cwd: rootPath,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  spawnedServer.stdout.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      if (isExpectedServerStopText(text)) {
        return;
      }
      console.log(`[vite] ${text}`);
    }
  });
  spawnedServer.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      if (isExpectedServerStopText(text)) {
        return;
      }
      console.error(`[vite] ${text}`);
    }
  });

  spawnedServer.on('exit', (code, signal) => {
    if (stoppingServer && (code === 143 || signal === 'SIGTERM')) {
      return;
    }
    if (code !== null && code !== 0) {
      console.error(`[vite] exited with code ${code}`);
    }
    if (signal) {
      console.error(`[vite] exited with signal ${signal}`);
    }
  });

  await waitForServer(baseUrl);
  return 'started';
}

async function stopServerIfStarted() {
  if (!spawnedServer || spawnedServer.killed) {
    return;
  }

  stoppingServer = true;
  spawnedServer.kill('SIGTERM');

  try {
    await Promise.race([
      once(spawnedServer, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 2_000)),
    ]);
  } finally {
    if (!spawnedServer.killed) {
      spawnedServer.kill('SIGKILL');
    }
  }
}

async function runCommand(command, args, label) {
  const child = spawn(command, args, {
    cwd: rootPath,
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.log(`[${label}] ${text}`);
    }
  });
  child.stderr.on('data', (chunk) => {
    const text = chunk.toString().trim();
    if (text) {
      console.error(`[${label}] ${text}`);
    }
  });

  const [code, signal] = await once(child, 'exit');
  if (code !== 0) {
    throw new Error(`${label} failed with code ${code ?? 'null'} signal ${signal ?? 'null'}`);
  }
}

function recordStep(label) {
  workflowSteps.push({ label, at: new Date().toISOString() });
}

function isExpectedServerStopText(text) {
  return (
    stoppingServer &&
    (text.includes('ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL') || text.includes('Exit status 143'))
  );
}

function escapeMarkdown(value) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

async function verifyPng(pathUrl) {
  const fileStat = await stat(pathUrl);
  if (fileStat.size < 10_000) {
    throw new Error(`${fileURLToPath(pathUrl)} is unexpectedly small (${fileStat.size} bytes)`);
  }
}

async function capture(page, name) {
  const path = new URL(`${name}.png`, screenshotsDir);
  await page.screenshot({ fullPage: true, path: fileURLToPath(path) });
  await verifyPng(path);
  screenshots.push({
    name,
    path: fileURLToPath(path).replace(rootPath, ''),
  });
}

async function writeReport({ serverMode }) {
  const errorMessages = consoleMessages.filter((message) => message.type === 'error');
  const report = [
    '# Release-Candidate Browser Workflow QA',
    '',
    `Date: ${runStartedAt.toISOString()}`,
    `Target: \`${baseUrl}\``,
    `Server: ${serverMode === 'started' ? 'production preview started by script' : 'existing server reused'}`,
    'Tooling: Playwright Chromium fallback against the production desktop web bundle.',
    '',
    '## Result',
    '',
    'Pass. The browser surface completed the release-candidate daily workflow without page errors or console errors.',
    '',
    '## Workflow Evidence',
    '',
    ...workflowSteps.map((step, index) => `${index + 1}. ${step.label}`),
    '',
    '## Screenshots',
    '',
    ...screenshots.map((screenshot) => `- \`${screenshot.path}\``),
    '',
    '## Console Evidence',
    '',
    `- Console messages captured: ${consoleMessages.length}`,
    `- Console errors captured: ${errorMessages.length}`,
    `- Page errors captured: ${pageErrors.length}`,
    '',
    '| Type | Text | Source |',
    '|---|---|---|',
    ...consoleMessages.map(
      (message) =>
        `| ${escapeMarkdown(message.type)} | ${escapeMarkdown(message.text)} | ${escapeMarkdown(
          message.location,
        )} |`,
    ),
    '',
    '## Boundary',
    '',
    'This verifies the Chromium/browser-rendered product surface, screenshots, and console health. It does not replace final packaged native GUI inspection, VoiceOver checks, App Store signing/notarization, or owner decisions for fullscreen launch and native notifications.',
    '',
  ].join('\n');

  await writeFile(new URL('report.md', reportDir), report);
  await writeFile(
    new URL('console.json', reportDir),
    `${JSON.stringify({ consoleMessages, pageErrors }, null, 2)}\n`,
  );
}

async function runWorkflow() {
  await mkdir(screenshotsDir, { recursive: true });

  const serverMode = await ensureServer();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  page.on('console', (message) => {
    const location = message.location();
    consoleMessages.push({
      type: message.type(),
      text: message.text(),
      location: `${location.url}:${location.lineNumber}:${location.columnNumber}`,
    });
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.stack ?? error.message);
  });

  try {
    await page.goto(`${baseUrl}/`);
    await expect(
      page.getByRole('heading', { name: /set up attentionos around the workflow it protects/i }),
    ).toBeVisible();
    await capture(page, '01-onboarding-local-first-consent');
    recordStep('Opened first-run onboarding with local-first and non-medical consent.');

    await page.getByLabel(/workspace starts local to this Mac/i).check();
    await page.getByLabel(/not medical advice or clinical diagnosis/i).check();
    await page.getByRole('button', { name: 'Begin with Ritual' }).click();
    await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();
    await capture(page, '02-ritual-meditation');
    recordStep('Entered Ritual and verified meditation is the first protected surface.');

    await page.getByRole('button', { name: 'Start meditation' }).click();
    await page.getByRole('button', { name: 'Complete meditation' }).click();
    await expect(page.getByRole('heading', { name: 'Reflection' })).toBeVisible();
    await page.getByLabel('Reflection').fill('Browser release QA reflection for the daily flow.');
    await page.getByLabel('Use as task input').check();
    await page.getByLabel('Use as project input').check();
    await page.getByRole('button', { name: 'Save reflection' }).click();
    await expect(page.getByRole('heading', { name: 'Dedication' })).toBeVisible();
    await page.getByLabel('Use dedication as task input').check();
    await capture(page, '03-ritual-dedication-follow-up');
    recordStep('Saved reflection and marked Ritual output for later task/project input.');

    await page.getByRole('button', { name: 'Complete ritual' }).click();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await capture(page, '04-overview-vision');
    recordStep('Completed Ritual and landed in read-only Overview.');

    await page.getByRole('button', { name: 'Open Personal Context OS' }).click();
    await page.getByRole('button', { name: 'Open Product development' }).click();
    await page.getByRole('button', { name: 'Open Coherent stage experience' }).click();
    await page.getByRole('button', { name: 'Open Overview scan redesign' }).click();
    await expect(page.getByText('Current layer: Task')).toBeVisible();
    await capture(page, '05-overview-task-layer');
    recordStep('Navigated the five-layer Vision -> Area -> Goal -> Project -> Task hierarchy.');

    await page.getByRole('button', { name: 'Start execution for Clarify overview scan' }).click();
    await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Ritual follow-up inputs' })).toBeVisible();
    await capture(page, '06-execution-plan-selected-candidate');
    recordStep('Bridged from Overview into Execution Plan with a single focus candidate.');

    await page.getByRole('button', { name: 'Enter focus' }).click();
    await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
    await expect(page.getByText('State: planning')).toBeVisible();
    await capture(page, '07-execution-focus-planning');
    recordStep(
      'Entered Execution Focus and verified planning state is isolated from planning lanes.',
    );

    await page.getByRole('button', { name: 'Start task' }).click();
    await expect(page.getByText('State: executing')).toBeVisible();
    await page.getByRole('button', { name: 'Add 5 minutes' }).click();
    await expect(page.getByText('Actual: 5 min').first()).toBeVisible();
    await page.getByRole('button', { name: 'Submit for review' }).click();
    await expect(page.getByText('State: reviewing')).toBeVisible();
    await capture(page, '08-execution-focus-reviewing');
    recordStep('Ran Focus timer/progress controls through executing and reviewing states.');

    await page.getByRole('button', { name: 'Complete task' }).click();
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await capture(page, '09-completed-return-overview');
    recordStep('Completed the protected action and returned to Overview.');

    await page.getByRole('link', { name: 'Data & Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Data & Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Save snapshot' }).click();
    await expect(page.getByRole('status')).toContainText('Saved');
    await capture(page, '10-settings-local-snapshot');
    recordStep('Verified Settings local snapshot control after workflow completion.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/overview`);
    await expect(page.getByRole('link', { name: 'Ritual' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Execution' })).toBeVisible();
    await capture(page, '11-mobile-stage-navigation');
    recordStep('Verified mobile-width stage navigation remains visible.');

    const errorMessages = consoleMessages.filter((message) => message.type === 'error');
    if (pageErrors.length > 0 || errorMessages.length > 0) {
      throw new Error(
        `Browser QA found ${pageErrors.length} page errors and ${errorMessages.length} console errors.`,
      );
    }

    await writeReport({ serverMode });
    console.log(`Browser release QA passed: ${fileURLToPath(reportDir)}`);
  } finally {
    await context.close();
    await browser.close();
    await stopServerIfStarted();
  }
}

runWorkflow().catch(async (error) => {
  try {
    await mkdir(reportDir, { recursive: true });
    await writeFile(
      new URL('failure.json', reportDir),
      `${JSON.stringify(
        {
          error: error.stack ?? error.message,
          consoleMessages,
          pageErrors,
          workflowSteps,
          screenshots,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await stopServerIfStarted();
  }
  console.error(error);
  process.exitCode = 1;
});
