import { expect, test } from '@playwright/test';

test('reviews a Phase 3 workflow optimization suggestion', async ({ page }) => {
  await page.goto('/overview');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'attentionos.learning.observations.v1',
      JSON.stringify([
        {
          breakdown: {
            behavioralScore: 0.38,
            reportedBehaviorScore: 0.36,
            subjectiveScore: 0.4,
          },
          confidence: 0.7,
          id: 'e2e-manual-calibration',
          observedAt: '2026-05-24T02:20:00.000Z',
          reasons: ['User-reported switching is high.'],
          score: 0.38,
          source: 'manual_calibration',
          state: 'overloaded',
        },
      ]),
    );
  });
  await page.reload();

  await expect(page.getByRole('region', { name: 'Learning snapshot' })).toBeVisible();
  await expect(page.getByText('Attention trend')).toBeVisible();

  await page.getByRole('button', { name: 'Open Personal Context OS' }).click();
  await page.getByRole('button', { name: 'Open Product development' }).click();
  await page.getByRole('button', { name: 'Open Coherent stage experience' }).click();
  await page.getByRole('button', { name: 'Open Overview scan redesign' }).click();
  await page.getByRole('button', { name: 'Start execution for Clarify overview scan' }).click();

  await expect(page.getByRole('heading', { name: 'Execution Plan' })).toBeVisible();
  await page.getByRole('button', { name: 'Review workflow pattern' }).click();

  await expect(page.getByText('Adjust the next workflow cycle')).toBeVisible();
  await expect(page.getByText('Protect the next execution block')).toBeVisible();
  await expect(page.getByText('Pending your review')).toBeVisible();

  await page.getByRole('button', { name: 'Mark reviewed as useful' }).click();
  await expect(page.getByText('Marked approved by you')).toBeVisible();

  const state = await page.evaluate(() => {
    const suggestions = JSON.parse(localStorage.getItem('attentionos.ai.suggestions.v1') ?? '[]');
    const audit = JSON.parse(localStorage.getItem('attentionos.execution.audit.v1') ?? '[]');
    return { audit, suggestions };
  });

  expect(state.suggestions.at(-1)).toMatchObject({
    kind: 'workflow_optimization',
    status: 'approved',
  });
  expect(state.audit.at(-1)).toMatchObject({
    action: 'learning.suggestion.approved',
  });
});
