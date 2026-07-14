import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { AI_SUGGESTIONS_STORAGE_KEY } from '../adapters/storage/aiSuggestions';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../adapters/storage/audit';
import { CONTEXT_CAPTURE_STORAGE_KEY } from '../adapters/storage/contextCapture';
import {
  DEFAULT_HIERARCHY_ENTITIES,
  EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY,
  HIERARCHY_STORAGE_KEY,
} from '../adapters/storage/hierarchy';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from '../adapters/storage/learning';
import { REFLECTION_STORAGE_KEY } from '../adapters/storage/reflections';
import { TASK_RUNTIME_STORAGE_KEY } from '../adapters/storage/taskRuntime';

function renderApp(
  initialEntry: string,
  options: {
    hierarchyEntities?: readonly unknown[];
    keepContextCaptures?: boolean;
    keepReflections?: boolean;
  } = {},
) {
  localStorage.removeItem(AI_SUGGESTIONS_STORAGE_KEY);
  if (!options.keepContextCaptures) {
    localStorage.removeItem(CONTEXT_CAPTURE_STORAGE_KEY);
  }
  localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);
  localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);
  localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);
  localStorage.removeItem(TASK_RUNTIME_STORAGE_KEY);
  if (!options.keepReflections) {
    localStorage.removeItem(REFLECTION_STORAGE_KEY);
  }
  if (options.hierarchyEntities) {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(options.hierarchyEntities));
  }

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
    renderApp('/execution', {
      hierarchyEntities: DEFAULT_HIERARCHY_ENTITIES.filter(
        (entity) => entity.id !== 'task-wire-overview',
      ),
    });

    expect(await screen.findByText(/no focus candidate/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /ritual follow-up inputs/i })).toHaveTextContent(
      /no ritual inputs waiting for planning/i,
    );
    expect(screen.getByText(/no planned actions for this project yet/i)).toHaveTextContent(
      /create a clarified task/i,
    );
    fireEvent.click(screen.getByRole('button', { name: /back to overview/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    });
  });

  it('surfaces ritual follow-up inputs in Execution Plan without creating tasks', async () => {
    localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'reflection-follow-up',
          entityType: 'reflection',
          title: 'Ritual reflection',
          content: 'Convert the unresolved launch worry into one concrete next action.',
          status: 'completed',
          properties: {
            ritualFollowUpTargets: ['task', 'project'],
            source: 'ritual',
          },
          workflowStage: 'ritual',
          createdAt: '2026-05-23T00:00:00.000Z',
          updatedAt: '2026-05-23T00:00:00.000Z',
          completedAt: '2026-05-23T00:00:00.000Z',
        },
      ]),
    );
    renderApp('/execution/plan', { keepReflections: true });

    expect(
      await screen.findByRole('region', { name: /ritual follow-up inputs/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/convert the unresolved launch worry/i)).toBeInTheDocument();
    expect(screen.getByText(/task input/i)).toBeInTheDocument();
    expect(screen.getByText(/project input/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /draft task from ritual input/i }));
    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toContain(
      'Convert the unresolved launch worry',
    );
    expect(screen.getByLabelText(/clarification/i)).toHaveValue(
      'Convert the unresolved launch worry into one concrete next action.',
    );

    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          properties: expect.objectContaining({
            source: 'ritual',
          }),
        }),
      ]),
    );
  });

  it('surfaces captured context inputs in Execution Plan without auto-creating work', async () => {
    localStorage.setItem(
      CONTEXT_CAPTURE_STORAGE_KEY,
      JSON.stringify([
        {
          channels: ['idea', 'task', 'project', 'calendar'],
          content: 'Turn this inbox note into a project and next action.',
          createdAt: '2026-05-24T02:40:00.000Z',
          id: 'capture-test',
        },
      ]),
    );
    renderApp('/execution/plan', { keepContextCaptures: true });

    const captures = await screen.findByRole('region', { name: /captured context inputs/i });

    expect(captures).toHaveTextContent(/turn this inbox note/i);
    fireEvent.click(screen.getByRole('button', { name: /draft task from capture/i }));
    expect(screen.getByLabelText(/title/i)).toHaveValue(
      'Turn this inbox note into a project and next action.',
    );
    expect(screen.getByLabelText(/clarification/i)).toHaveValue(
      'Turn this inbox note into a project and next action.',
    );

    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          properties: expect.objectContaining({
            source: 'capture',
          }),
        }),
      ]),
    );
  });

  it('creates a clarified current action and selects it as the only focus candidate', async () => {
    renderApp('/execution/plan');

    fireEvent.change(await screen.findByLabelText(/title/i), {
      target: { value: 'Write release candidate checklist' },
    });
    fireEvent.change(screen.getByLabelText(/clarification/i), {
      target: { value: 'Define the next verifiable release checks before packaging.' },
    });
    fireEvent.change(screen.getByLabelText(/estimated minutes/i), {
      target: { value: '45' },
    });
    fireEvent.change(screen.getByLabelText(/planning role/i), {
      target: { value: 'current' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create work item/i }));

    expect(await screen.findByText(/task created as current next action/i)).toBeInTheDocument();
    expect(screen.getAllByText(/write release candidate checklist/i)).not.toHaveLength(0);
    expect(screen.getByText(/selected for focus/i)).toBeInTheDocument();

    const focusCandidateId = localStorage.getItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
    expect(focusCandidateId).toBeTruthy();
    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: focusCandidateId,
          title: 'Write release candidate checklist',
          properties: expect.objectContaining({
            clarification: 'Define the next verifiable release checks before packaging.',
            executionRole: 'current',
          }),
        }),
      ]),
    );
    expect(
      entities.filter(
        (entity: { properties?: { executionRole?: string } }) =>
          entity.properties?.executionRole === 'current',
      ),
    ).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    expect(await screen.findByRole('heading', { name: /execution focus/i })).toBeInTheDocument();
    expect(screen.getByText(/write release candidate checklist/i)).toBeInTheDocument();

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'execution.plan.entity.created',
          targetId: focusCandidateId,
        }),
      ]),
    );
  });

  it('blocks task creation when project signals show the item is a project', async () => {
    renderApp('/execution/plan');

    fireEvent.change(await screen.findByLabelText(/title/i), {
      target: { value: 'Launch packaged macOS release' },
    });
    fireEvent.change(screen.getByLabelText(/clarification/i), {
      target: { value: 'Coordinate the release work without treating it as one sitting.' },
    });
    fireEvent.click(screen.getByLabelText(/clear deliverable/i));
    fireEvent.click(screen.getByLabelText(/needs 2\+ work blocks/i));
    fireEvent.click(screen.getByRole('button', { name: /create work item/i }));

    expect(await screen.findByText(/create a project instead/i)).toBeInTheDocument();
    expect(localStorage.getItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY)).toBeNull();
  });

  it('blocks non-startable or overlong task creation before persistence', async () => {
    renderApp('/execution/plan');

    fireEvent.change(await screen.findByLabelText(/title/i), {
      target: { value: 'Ambiguous release work' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create work item/i }));

    expect(await screen.findByText(/clarification or first start note/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/clarification/i), {
      target: { value: 'Turn the work into one observable release check.' },
    });
    fireEvent.change(screen.getByLabelText(/estimated minutes/i), {
      target: { value: '180' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create work item/i }));

    expect(await screen.findByText(/two-hour bound/i)).toBeInTheDocument();
    expect(localStorage.getItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY)).toBeNull();
    const entities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(entities).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Ambiguous release work',
        }),
      ]),
    );
  });

  it('drives the active task through planning, execution, review, and completion', async () => {
    renderApp('/overview');
    await startOverviewTask();

    expect(screen.getAllByText(/clarify overview scan/i)).not.toHaveLength(0);
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
    const lifecycleEntries = auditEntries.filter(
      (entry: { action?: string }) => entry.action === 'task.lifecycle.transition',
    );
    expect(lifecycleEntries).toHaveLength(3);
    expect(lifecycleEntries[2].details).toMatchObject({ event: 'COMPLETE', to: 'done' });
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

  it('makes intentional focus exit explicit and preserves paused progress', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    fireEvent.click(await screen.findByRole('button', { name: /start task/i }));
    fireEvent.click(screen.getByRole('button', { name: /add 5 minutes/i }));
    fireEvent.click(screen.getByRole('button', { name: /pause and exit focus/i }));

    expect(await screen.findByRole('heading', { name: /execution plan/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /interruption recovery cue/i })).toHaveTextContent(
      /paused focus is ready to resume/i,
    );
    expect(screen.getByRole('button', { name: /continue in focus/i })).toBeInTheDocument();
    expect(screen.getByText(/state: paused/i)).toBeInTheDocument();

    const runtime = JSON.parse(localStorage.getItem(TASK_RUNTIME_STORAGE_KEY) ?? '{}');
    expect(runtime).toMatchObject({
      actualMinutes: 5,
      state: 'paused',
      taskId: 'task-wire-overview',
    });

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'task.lifecycle.transition',
          details: expect.objectContaining({
            event: 'PAUSE',
            from: 'executing',
            to: 'paused',
          }),
          targetId: 'task-wire-overview',
        }),
      ]),
    );

    fireEvent.click(screen.getByRole('button', { name: /enter focus/i }));
    expect(await screen.findByRole('heading', { name: /execution focus/i })).toBeInTheDocument();
    expect(screen.getByText(/state: paused/i)).toBeInTheDocument();
    expect(screen.getAllByText(/actual: 5 min/i)).toHaveLength(2);
  });

  it('generates and applies an AI task decomposition suggestion', async () => {
    renderApp('/overview');
    await startOverviewTask();

    expect(screen.getByText(/suggestions stay pending until you decide/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/clarification for ai split/i), {
      target: { value: 'Keep the split focused on a reviewable checklist.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draft task split/i }));

    expect(await screen.findByText(/task decomposition review/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pending your review/i)).not.toHaveLength(0);
    expect(screen.getByText(/nothing is added to overview until you approve/i)).toBeInTheDocument();
    expect(screen.getByText(/human clarification/i)).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: /undo ai-created tasks/i }));

    await waitFor(() => {
      expect(screen.getByText(/archived 3 ai-created tasks/i)).toBeInTheDocument();
    });

    const rolledBackEntities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(rolledBackEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          properties: expect.objectContaining({
            rollbackReason: 'ai.suggestion.rollback',
          }),
          status: 'archived',
          title: 'Clarify outcome for Clarify overview scan',
        }),
      ]),
    );

    let rollbackAuditEntries = JSON.parse(
      localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]',
    );
    expect(rollbackAuditEntries.at(-1)).toMatchObject({
      action: 'ai.suggestion.rollback',
      details: expect.objectContaining({
        archivedTaskIds: expect.arrayContaining([expect.stringContaining('-step-1')]),
        archivedTaskSnapshots: expect.arrayContaining([
          expect.objectContaining({
            status: 'active',
            title: 'Clarify outcome for Clarify overview scan',
          }),
        ]),
      }),
    });

    fireEvent.click(screen.getByRole('button', { name: /restore ai-created tasks/i }));

    await waitFor(() => {
      expect(screen.getByText(/restored 3 ai-created tasks/i)).toBeInTheDocument();
    });

    const restoredEntities = JSON.parse(localStorage.getItem(HIERARCHY_STORAGE_KEY) ?? '[]');
    expect(restoredEntities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          properties: expect.objectContaining({
            restoredFromRollbackAt: expect.any(String),
          }),
          status: 'active',
          title: 'Clarify outcome for Clarify overview scan',
        }),
      ]),
    );

    rollbackAuditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(rollbackAuditEntries.at(-1)).toMatchObject({
      action: 'ai.suggestion.rollback.restored',
      details: expect.objectContaining({
        restoredTaskIds: expect.arrayContaining([expect.stringContaining('-step-1')]),
      }),
    });
  });

  it('rejects an AI task decomposition suggestion without creating tasks', async () => {
    renderApp('/overview');
    await startOverviewTask();

    fireEvent.change(screen.getByLabelText(/clarification for ai split/i), {
      target: { value: 'Only keep startable steps.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draft task split/i }));
    expect(await screen.findAllByText(/pending your review/i)).not.toHaveLength(0);

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
