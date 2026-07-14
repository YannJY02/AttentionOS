import { expect, type Page, test } from '@playwright/test';

const APP_STATE_SNAPSHOT_STORAGE_KEY = 'attentionos.persistence.snapshot.v1';

const budgets = {
  corruptRecoveryWarning: 3_000,
  focusControls: 1_500,
  launchRouteReady: 5_000,
  onboardingToRitual: 1_500,
  planToFocus: 2_500,
  ritualToOverview: 2_500,
  settingsSnapshot: 2_000,
  stageNavigation: 1_500,
} as const;

async function measureWithinBudget(
  label: keyof typeof budgets,
  page: Page,
  action: () => Promise<void>,
) {
  const startedAt = Date.now();

  await action();

  const durationMs = Date.now() - startedAt;
  const budgetMs = budgets[label];

  console.log(`[performance] ${label}: ${durationMs}ms / ${budgetMs}ms`);
  await page.evaluate(
    ([metricName, metricDuration]) => {
      window.sessionStorage.setItem(
        `attentionos.performance.${metricName}`,
        String(metricDuration),
      );
    },
    [label, durationMs] as const,
  );

  expect(durationMs).toBeLessThanOrEqual(budgetMs);
}

test.describe('release-candidate performance smoke', () => {
  test('keeps the daily workflow responsive under local budgets', async ({ page }) => {
    await measureWithinBudget('launchRouteReady', page, async () => {
      await page.goto('/onboarding');
      await expect(
        page.getByRole('heading', { name: /set up attentionos around the workflow it protects/i }),
      ).toBeVisible();
    });

    await measureWithinBudget('onboardingToRitual', page, async () => {
      await page.getByLabel(/workspace starts local to this Mac/i).check();
      await page.getByLabel(/not medical advice or clinical diagnosis/i).check();
      await page.getByRole('button', { name: 'Begin with Ritual' }).click();
      await expect(page.getByRole('heading', { name: 'Ritual' })).toBeVisible();
    });

    await measureWithinBudget('ritualToOverview', page, async () => {
      await page.getByRole('button', { name: 'Start meditation' }).click();
      await page.getByRole('button', { name: 'Complete meditation' }).click();
      await page.getByLabel('Reflection').fill('Performance smoke reflection.');
      await page.getByRole('button', { name: 'Save reflection' }).click();
      await page.getByRole('button', { name: 'Complete ritual' }).click();
      await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    });

    await measureWithinBudget('stageNavigation', page, async () => {
      await page.getByRole('link', { name: 'Execution' }).click();
      await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();
    });

    await measureWithinBudget('planToFocus', page, async () => {
      await page.getByLabel('Title').fill('Performance focus candidate');
      await page
        .getByLabel('Clarification')
        .fill('Measure the local Plan to Focus path without external services.');
      await page.getByLabel('Planning role').selectOption('current');
      await page.getByRole('button', { name: 'Create work item' }).click();
      await page.getByRole('button', { name: 'Enter focus' }).click();
      await expect(page.getByRole('heading', { name: 'Execution Focus' })).toBeVisible();
    });

    await measureWithinBudget('focusControls', page, async () => {
      await page.getByRole('button', { name: 'Start task' }).click();
      await expect(page.getByText('State: executing')).toBeVisible();
      await page.getByRole('button', { name: 'Add 5 minutes' }).click();
      await expect(page.getByText('Actual: 5 min').first()).toBeVisible();
    });

    await measureWithinBudget('settingsSnapshot', page, async () => {
      await page.getByRole('link', { name: 'Data & Settings' }).click();
      await expect(page.getByRole('heading', { name: 'Data & Settings' })).toBeVisible();
      await page.getByRole('button', { name: 'Save snapshot' }).click();
      await expect(page.getByRole('status')).toContainText('Saved');
    });
  });

  test('surfaces corrupt browser snapshot recovery under local budget', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Data & Settings' })).toBeVisible();

    await page.evaluate((snapshotKey) => {
      window.localStorage.clear();
      window.localStorage.setItem(snapshotKey, 'not valid json');
    }, APP_STATE_SNAPSHOT_STORAGE_KEY);

    await measureWithinBudget('corruptRecoveryWarning', page, async () => {
      await page.reload();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Local data recovery needs attention' }),
      ).toBeVisible();
      await expect(page.getByText('Saved workspace was quarantined')).toBeVisible();
    });
  });
});
