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
  fireEvent.click(screen.getByRole('button', { name: /open coherent stage experience/i }));
  fireEvent.click(screen.getByRole('button', { name: /open overview scan redesign/i }));
  fireEvent.click(
    screen.getByRole('button', { name: /start execution for clarify overview scan/i }),
  );

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

    expect(screen.getByText(/clarify overview scan/i)).toBeInTheDocument();
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
    expect(screen.queryByRole('region', { name: /task suggestion review/i })).toBeNull();
    expect(screen.queryByRole('region', { name: /workflow suggestion review/i })).toBeNull();
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

    expect(screen.getByText(/suggestions stay pending until you decide/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /draft task split/i }));

    expect(await screen.findByText(/task decomposition review/i)).toBeInTheDocument();
    expect(screen.getByText(/pending your review/i)).toBeInTheDocument();
    expect(screen.getByText(/nothing is added to overview until you approve/i)).toBeInTheDocument();
    expect(screen.getByText(/clarify outcome for clarify overview scan/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /approve suggestion/i }));

    await waitFor(() => {
      expect(screen.getByText(/applied by you/i)).toBeInTheDocument();
    });

    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          parentId: 'project-desktop-workflow-scaffold',
          title: 'Clarify outcome for Clarify overview scan',
        }),
        expect.objectContaining({
          parentId: 'project-desktop-workflow-scaffold',
          title: 'Draft execution checklist for Clarify overview scan',
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

  it('rejects an AI task decomposition suggestion without creating tasks', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /draft task split/i }));
    expect(await screen.findByText(/pending your review/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reject suggestion/i }));

    await waitFor(() => {
      expect(screen.getByText(/rejected by you/i)).toBeInTheDocument();
    });

    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          properties: expect.objectContaining({
            sourceSuggestionId: expect.any(String),
          }),
        }),
      ]),
    );

    const suggestions = JSON.parse(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY) ?? '[]');
    expect(suggestions.at(-1)).toMatchObject({
      kind: 'task_decomposition',
      status: 'rejected',
      reviewedBy: 'user',
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries.at(-1)).toMatchObject({
      action: 'ai.suggestion.rejected',
      targetId: 'task-wire-overview',
      details: expect.objectContaining({
        kind: 'task_decomposition',
      }),
    });
  });

  it('reviews a Phase 3 workflow optimization suggestion through HITL controls', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /review workflow pattern/i }));

    expect(await screen.findByText(/adjust the next workflow cycle/i)).toBeInTheDocument();
    expect(screen.getByText(/pending your review/i)).toBeInTheDocument();
    expect(screen.getByText(/does not change the workflow automatically/i)).toBeInTheDocument();
    expect(screen.getByText(/protect the next execution block/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark reviewed as useful/i }));

    await waitFor(() => {
      expect(screen.getByText(/marked approved by you/i)).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /review workflow pattern/i }));

    expect(await screen.findByText(/adjust the next workflow cycle/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /mark reviewed as not useful/i }));

    await waitFor(() => {
      expect(screen.getByText(/marked rejected by you/i)).toBeInTheDocument();
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
