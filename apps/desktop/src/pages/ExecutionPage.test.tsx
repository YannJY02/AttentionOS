import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { AI_SUGGESTIONS_STORAGE_KEY } from '../storage/aiSuggestions';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../storage/audit';
import { HIERARCHY_STORAGE_KEY } from '../storage/hierarchy';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from '../storage/learning';

function renderApp(initialEntry: string) {
  localStorage.removeItem(AI_SUGGESTIONS_STORAGE_KEY);
  localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);
  localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  );
}

async function startOverviewTask() {
  fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
  fireEvent.click(screen.getByRole('button', { name: /open product development/i }));
  fireEvent.click(screen.getByRole('button', { name: /open phase 1 deterministic core/i }));
  fireEvent.click(screen.getByRole('button', { name: /open desktop workflow scaffold/i }));
  fireEvent.click(screen.getByRole('button', { name: /start execution for wire overview/i }));

  await screen.findByRole('heading', { name: /execution plan/i });
}

describe('ExecutionPage task workflow', () => {
  it('shows an empty execution state when no task is active', async () => {
    renderApp('/execution');

    expect(await screen.findByText(/no focus candidate/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /back to overview/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });
  });

  it('drives the active task through planning, execution, review, and completion', async () => {
    renderApp('/overview');
    await startOverviewTask();

    expect(screen.getByText(/wire overview/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    expect(await screen.findByRole('heading', { name: /execution focus/i })).toBeInTheDocument();
    expect(screen.getByText(/state: planning/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start task/i }));
    expect(screen.getByText(/state: executing/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add 5 minutes/i }));
    expect(screen.getAllByText(/actual: 5 min/i)).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: /submit for review/i }));
    expect(screen.getByText(/state: reviewing/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /complete task/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toHaveLength(3);
    expect(auditEntries[2].details).toMatchObject({ event: 'COMPLETE', to: 'done' });
  });

  it('redirects a direct focus route without a focus target back to plan mode', async () => {
    renderApp('/execution/focus');

    expect(await screen.findByRole('heading', { name: /execution plan/i })).toBeInTheDocument();
    expect(
      screen.getByText(/choose one task from overview before entering focus/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no focus candidate/i)).toBeInTheDocument();
  });

  it('keeps AI suggestion queues out of focus mode by default', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));

    expect(await screen.findByRole('heading', { name: /execution focus/i })).toBeInTheDocument();
    expect(screen.queryByText(/ai task decomposition/i)).toBeNull();
    expect(screen.queryByText(/evolution suggestions/i)).toBeNull();
  });

  it('keeps task lifecycle state when returning from focus to plan', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    fireEvent.click(await screen.findByRole('button', { name: /start task/i }));
    expect(screen.getByText(/state: executing/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /back to execution plan/i }));
    expect(await screen.findByRole('heading', { name: /execution plan/i })).toBeInTheDocument();
    expect(screen.getByText(/state: executing/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    expect(await screen.findByRole('heading', { name: /execution focus/i })).toBeInTheDocument();
    expect(screen.getByText(/state: executing/i)).toBeInTheDocument();
  });

  it('generates and applies an AI task decomposition suggestion', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /ai decompose task/i }));

    expect(await screen.findByText(/ai task decomposition/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/clarify outcome for wire overview/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /approve suggestion/i }));

    await waitFor(() => {
      expect(screen.getByText(/applied/i)).toBeInTheDocument();
    });

    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parentId: 'project-desktop-workflow-scaffold',
          title: 'Clarify outcome for Wire overview',
        }),
        expect.objectContaining({
          parentId: 'project-desktop-workflow-scaffold',
          title: 'Draft execution checklist for Wire overview',
        }),
      ]),
    );

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries.at(-1)).toMatchObject({
      action: 'ai.suggestion.approved',
      targetId: 'task-wire-overview',
      details: expect.objectContaining({
        createdTaskIds: expect.arrayContaining([
          expect.stringContaining('-step-1'),
          expect.stringContaining('-step-2'),
        ]),
        stepCount: 3,
      }),
    });

    const suggestions = JSON.parse(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY) ?? '[]');
    expect(suggestions.at(-1)).toMatchObject({
      status: 'applied',
      reviewedBy: 'user',
    });
  });

  it('reviews a Phase 3 workflow optimization suggestion through HITL controls', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /analyze workflow/i }));

    expect(await screen.findByText(/adjust the next workflow cycle/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByText(/protect the next execution block/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /approve optimization/i }));

    await waitFor(() => {
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
    });

    const suggestions = JSON.parse(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY) ?? '[]');
    expect(suggestions.at(-1)).toMatchObject({
      kind: 'workflow_optimization',
      status: 'approved',
      reviewedBy: 'user',
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries.at(-1)).toMatchObject({
      action: 'learning.suggestion.approved',
      details: expect.objectContaining({
        kind: 'workflow_optimization',
      }),
    });
  });

  it('rejects a Phase 3 workflow optimization suggestion through HITL controls', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /analyze workflow/i }));

    expect(await screen.findByText(/adjust the next workflow cycle/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reject/i }));

    await waitFor(() => {
      expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    });

    const suggestions = JSON.parse(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY) ?? '[]');
    expect(suggestions.at(-1)).toMatchObject({
      kind: 'workflow_optimization',
      status: 'rejected',
      reviewedBy: 'user',
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries.at(-1)).toMatchObject({
      action: 'learning.suggestion.rejected',
      details: expect.objectContaining({
        kind: 'workflow_optimization',
      }),
    });
  });
});
