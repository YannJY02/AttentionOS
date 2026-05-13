import { expect, test } from '@playwright/test';

test('reviews a Phase 3 workflow optimization suggestion', async ({ page }) => {
  await page.goto('/overview');
  await page.evaluate(() => {
    localStorage.clear();
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
  await page.getByRole('button', { name: 'Analyze workflow' }).click();

  await expect(page.getByText('Adjust the next workflow cycle')).toBeVisible();
  await expect(page.getByText('Protect the next execution block')).toBeVisible();

  await page.getByRole('button', { name: 'Approve optimization' }).click();
  await expect(page.getByText('approved')).toBeVisible();

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
