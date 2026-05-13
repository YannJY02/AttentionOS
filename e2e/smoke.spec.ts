import { expect, test } from '@playwright/test';

test('runs the Phase 1 ritual to execution workflow', async ({ page }) => {
  await page.goto('/');

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
