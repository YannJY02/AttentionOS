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
  await page.getByRole('button', { name: 'Open Phase 1 deterministic core' }).click();
  await page.getByRole('button', { name: 'Open Desktop workflow scaffold' }).click();
  await expect(page.getByText('Current layer: task')).toBeVisible();

  await page.getByRole('button', { name: 'Start execution for Wire overview' }).click();
  await expect(page.getByRole('heading', { name: 'Execution' })).toBeVisible();
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
