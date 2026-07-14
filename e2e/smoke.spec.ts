import { expect, test } from '@playwright/test';

test('runs the Phase 1 ritual to execution workflow', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /set up attentionos around the workflow it protects/i }),
  ).toBeVisible();
  await page.getByLabel(/workspace starts local to this Mac/i).check();
  await page.getByLabel(/not medical advice or clinical diagnosis/i).check();
  await page.getByRole('button', { name: 'Begin with Ritual' }).click();

  await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Meditation' })).toBeVisible();

  await page.getByRole('button', { name: 'Start meditation' }).click();
  await page.getByRole('button', { name: 'Complete meditation' }).click();
  await expect(page.getByRole('heading', { name: 'Reflection' })).toBeVisible();

  await page.getByLabel('Reflection').fill('E2E reflection for the Phase 1 workflow.');
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByRole('heading', { name: 'Dedication' })).toBeVisible();

  await page.getByRole('button', { name: 'Complete ritual' }).click();
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

  await page.getByRole('button', { name: 'Open Personal Context OS' }).click();
  await page.getByRole('button', { name: 'Open Product development' }).click();
  await page.getByRole('button', { name: 'Open Coherent stage experience' }).click();
  await page.getByRole('button', { name: 'Open Overview scan redesign' }).click();
  await expect(page.getByText('Current layer: Task')).toBeVisible();

  await page.getByRole('button', { name: 'Start execution for Clarify overview scan' }).click();
  await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();
  await page.getByRole('button', { name: 'Enter focus' }).click();
  await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
  await expect(page.getByText('State: planning')).toBeVisible();

  await page.getByRole('button', { name: 'Start task' }).click();
  await expect(page.getByText('State: executing')).toBeVisible();
  await page.getByRole('button', { name: 'Add 5 minutes' }).click();
  await expect(page.getByText('Actual: 5 min').first()).toBeVisible();

  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page.getByText('State: reviewing')).toBeVisible();

  await page.getByRole('button', { name: 'Complete task' }).click();
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
});

test('keeps the canonical stage navigation usable at 390px width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/overview');

  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ritual' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Execution' })).toBeVisible();

  const mainWidth = await page.locator('main').evaluate((element) => element.clientWidth);
  expect(mainWidth).toBeGreaterThanOrEqual(350);
});

test('opens data settings without leaving the workflow model', async ({ page }) => {
  await page.goto('/settings');

  await expect(page.getByRole('heading', { name: 'Data & Settings' })).toBeVisible();
  await expect(page.getByText('Local-first data controls are ready.')).toBeVisible();

  await page.getByRole('button', { name: 'Save snapshot' }).click();
  await expect(page.getByRole('status')).toContainText('Saved');

  await page.getByRole('link', { name: 'Ritual' }).click();
  await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();
});

test('applies ritual settings to the meditation and dedication flow', async ({ page }) => {
  await page.goto('/settings');

  await page.getByLabel('Intention / prayer').fill('Open with one clean breath.');
  await page.getByLabel('Meditation duration').fill('6');
  await page.getByLabel('Guidance mode').selectOption('body_scan');
  await page.getByLabel('Sound cue').selectOption('none');
  await page.getByLabel('Ritual cadence').selectOption('morning_evening');
  await page.getByLabel('Morning ritual time').fill('07:15');
  await page.getByLabel('Evening ritual time').fill('20:45');
  await page.getByLabel('Dedication / 回向').fill('Carry the attention into the next action.');
  await page.getByRole('button', { name: 'Save ritual settings' }).click();
  await expect(page.getByRole('status')).toContainText('Ritual settings saved');

  await page.getByRole('link', { name: 'Ritual' }).click();
  await expect(page.getByText('Open with one clean breath.')).toBeVisible();
  await expect(
    page.getByText(/Morning and evening ritual cadence .* 07:15 \/ 20:45/i),
  ).toBeVisible();
  await expect(page.getByText('6:00')).toBeVisible();
  await expect(page.getByText('Body scan')).toBeVisible();
  await expect(page.getByText('No sound cue')).toBeVisible();

  await page.getByRole('button', { name: 'Start meditation' }).click();
  await page.getByRole('button', { name: 'Complete meditation' }).click();
  await page.getByLabel('Reflection').fill('The session started with a steady body scan.');
  await page.getByLabel('Use as task input').check();
  await page.getByLabel('Use as project input').check();
  await page.getByRole('button', { name: 'Save reflection' }).click();

  await expect(page.getByText('Carry the attention into the next action.')).toBeVisible();
  await page.getByLabel('Use dedication as task input').check();
  await page.getByRole('button', { name: 'Complete ritual' }).click();
  await page.getByRole('link', { name: 'Execution' }).click();
  await expect(page.getByRole('region', { name: 'Ritual follow-up inputs' })).toBeVisible();
  await expect(page.getByText('The session started with a steady body scan.')).toBeVisible();
  await expect(page.getByText('Ritual dedication')).toBeVisible();
  await expect(page.getByText('Carry the attention into the next action.')).toBeVisible();
});

test('creates and focuses a clarified execution plan action', async ({ page }) => {
  await page.goto('/execution/plan');

  await page.getByLabel('Title').fill('Draft package readiness checklist');
  await page
    .getByLabel('Clarification')
    .fill('Write the smallest checklist needed before native package validation.');
  await page.getByLabel('Estimated minutes').fill('40');
  await page.getByLabel('Planning role').selectOption('current');
  await page.getByRole('button', { name: 'Create work item' }).click();

  await expect(page.getByText('Task created as current next action.')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Draft package readiness checklist' }),
  ).toBeVisible();
  await expect(page.getByText(/selected for Focus/i)).toBeVisible();

  await page
    .getByLabel('Clarification for AI split')
    .fill('Keep the split under the release checklist boundary.');
  await page.getByRole('button', { name: 'Draft task split' }).click();
  await expect(page.getByText(/Human clarification/i)).toBeVisible();
  await page.getByRole('button', { name: 'Reject suggestion' }).click();
  await expect(page.getByText('Rejected by you')).toBeVisible();

  await page.getByRole('button', { name: 'Enter focus' }).click();
  await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Draft package readiness checklist' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start task' }).click();
  await page.getByRole('button', { name: 'Add 5 minutes' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
  await expect(page.getByText('State: executing')).toBeVisible();
  await expect(page.getByText('Actual: 5 min').first()).toBeVisible();

  await page.getByRole('button', { name: 'Pause and exit focus' }).click();
  await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();
  await expect(page.getByText(/State:\s+paused/i)).toBeVisible();
  await page.getByRole('button', { name: 'Enter focus' }).click();
  await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
  await expect(page.getByText('State: paused')).toBeVisible();
  await expect(page.getByText('Actual: 5 min').first()).toBeVisible();
});
