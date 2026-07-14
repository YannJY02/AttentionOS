import type { V2AttentionObservationRecord } from '@attentionos/guidance';
import type { V2AuditLogEntry, V2Entity } from '@attentionos/workflow';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { AI_SUGGESTIONS_STORAGE_KEY } from '../adapters/storage/aiSuggestions';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../adapters/storage/audit';
import { DEFAULT_HIERARCHY_ENTITIES, HIERARCHY_STORAGE_KEY } from '../adapters/storage/hierarchy';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from '../adapters/storage/learning';
import { REFLECTION_STORAGE_KEY } from '../adapters/storage/reflections';
import { REMINDER_SETTINGS_STORAGE_KEY } from '../adapters/storage/reminderSettings';
import { TASK_RUNTIME_STORAGE_KEY } from '../adapters/storage/taskRuntime';

interface RenderOverviewPageOptions {
  readonly aiSuggestions?: readonly unknown[];
  readonly auditEntries?: readonly V2AuditLogEntry[];
  readonly hierarchyEntities?: readonly V2Entity[];
  readonly learningObservations?: readonly V2AttentionObservationRecord[];
  readonly reminderSettings?: Record<string, unknown>;
  readonly reflections?: readonly V2Entity[];
  readonly taskRuntime?: Record<string, unknown>;
}

function renderOverviewPage(options: RenderOverviewPageOptions = {}) {
  localStorage.removeItem(HIERARCHY_STORAGE_KEY);
  localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);
  localStorage.removeItem(AI_SUGGESTIONS_STORAGE_KEY);
  localStorage.removeItem(REFLECTION_STORAGE_KEY);
  localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);
  localStorage.removeItem(REMINDER_SETTINGS_STORAGE_KEY);
  localStorage.removeItem(TASK_RUNTIME_STORAGE_KEY);

  if (options.hierarchyEntities) {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(options.hierarchyEntities));
  }

  if (options.learningObservations) {
    localStorage.setItem(
      LEARNING_OBSERVATIONS_STORAGE_KEY,
      JSON.stringify(options.learningObservations),
    );
  }

  if (options.reflections) {
    localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify(options.reflections));
  }

  if (options.auditEntries) {
    localStorage.setItem(EXECUTION_AUDIT_STORAGE_KEY, JSON.stringify(options.auditEntries));
  }

  if (options.aiSuggestions) {
    localStorage.setItem(AI_SUGGESTIONS_STORAGE_KEY, JSON.stringify(options.aiSuggestions));
  }

  if (options.reminderSettings) {
    localStorage.setItem(REMINDER_SETTINGS_STORAGE_KEY, JSON.stringify(options.reminderSettings));
  }

  if (options.taskRuntime) {
    localStorage.setItem(TASK_RUNTIME_STORAGE_KEY, JSON.stringify(options.taskRuntime));
  }

  render(
    <MemoryRouter initialEntries={['/overview']}>
      <App />
    </MemoryRouter>,
  );
}

describe('OverviewPage hierarchy workflow', () => {
  it('renders a read-only five-layer overview with breadcrumb navigation', () => {
    renderOverviewPage();

    expect(screen.getByRole('heading', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /overview scan context/i })).toHaveTextContent(
      /current layer: vision/i,
    );
    expect(screen.getByText(/judge long-horizon direction/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /vision timeline/i })).toBeInTheDocument();
    expect(screen.getByText(/timeline-first vision scan/i)).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: /overview risks, trends, and context signals/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /learning snapshot/i })).toBeInTheDocument();
    expect(screen.getByText(/attention trend/i)).toBeInTheDocument();
    expect(screen.queryByText(/deterministic|workflow scaffold|wire overview/i)).toBeNull();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /create|edit|delete|decompose|approve/i }),
    ).toBeNull();

    const timeline = screen.getByRole('region', { name: /vision timeline/i });
    const learningSnapshot = screen.getByRole('region', { name: /learning snapshot/i });
    expect(
      timeline.compareDocumentPosition(learningSnapshot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    expect(screen.getByText(/current layer: area/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /hierarchy breadcrumb/i })).toHaveTextContent(
      /personal context os/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /back to parent/i }));
    expect(screen.getByText(/current layer: vision/i)).toBeInTheDocument();
  });

  it('loads persisted custom five-layer hierarchy data with layer-specific semantics', () => {
    const now = '2026-05-24T01:00:00.000Z';
    const hierarchy: V2Entity[] = [
      {
        content: 'A custom vision loaded from persisted hierarchy storage.',
        createdAt: now,
        entityType: 'task',
        hierarchyLayer: 'vision',
        id: 'vision-custom',
        properties: {
          horizon: 'Custom 2026 horizon',
        },
        status: 'active',
        title: 'Custom Vision',
        updatedAt: now,
        workflowStage: 'overview',
      },
      {
        content: 'A custom area under the vision.',
        createdAt: now,
        entityType: 'task',
        hierarchyLayer: 'area',
        id: 'area-custom',
        parentId: 'vision-custom',
        properties: {},
        status: 'active',
        title: 'Research Area',
        updatedAt: now,
        workflowStage: 'overview',
      },
      {
        content: 'A custom goal under the area.',
        createdAt: now,
        entityType: 'task',
        hierarchyLayer: 'goal',
        id: 'goal-custom',
        parentId: 'area-custom',
        properties: {},
        status: 'active',
        title: 'Finish Thesis Goal',
        updatedAt: now,
        workflowStage: 'overview',
      },
      {
        content: 'A custom project under the goal.',
        createdAt: now,
        entityType: 'task',
        hierarchyLayer: 'project',
        id: 'project-custom',
        parentId: 'goal-custom',
        properties: {},
        status: 'active',
        title: 'Method Chapter Project',
        updatedAt: now,
        workflowStage: 'overview',
      },
      {
        content: 'A custom executable task under the project.',
        createdAt: now,
        entityType: 'task',
        hierarchyLayer: 'task',
        id: 'task-custom',
        parentId: 'project-custom',
        properties: {
          estimatedMinutes: 45,
          importance: 'high',
          scheduledFor: '2026-05-24T11:00:00.000Z',
        },
        status: 'active',
        title: 'Write method note',
        updatedAt: now,
        workflowStage: 'overview',
      },
    ];

    renderOverviewPage({ hierarchyEntities: hierarchy });

    expect(screen.getByText(/current layer: vision/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /vision timeline/i })).toHaveTextContent(
      /custom vision/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /open custom vision/i }));
    expect(screen.getByText(/current layer: area/i)).toBeInTheDocument();
    expect(screen.getByText(/scan the life or work domain/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /hierarchy breadcrumb/i })).toHaveTextContent(
      /custom vision/i,
    );

    fireEvent.click(screen.getByRole('button', { name: /open research area/i }));
    expect(screen.getByText(/current layer: goal/i)).toBeInTheDocument();
    expect(screen.getByText(/check the outcome and constraints/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /open finish thesis goal/i }));
    expect(screen.getByText(/current layer: project/i)).toBeInTheDocument();
    expect(screen.getByText(/review the active project path/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /open method chapter project/i }));
    expect(screen.getByText(/current layer: task/i)).toBeInTheDocument();
    expect(screen.getByText(/confirm the executable unit/i)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /task overview browsing/i })).toHaveTextContent(
      /write method note/i,
    );
    expect(
      screen.getByRole('button', { name: /start execution for write method note/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows a stage-specific empty state when a hierarchy layer has no entities', () => {
    renderOverviewPage({ hierarchyEntities: [] });

    const emptyState = screen.getByRole('region', { name: /vision empty state/i });
    expect(emptyState).toHaveTextContent(/no visions to scan/i);
    expect(emptyState).toHaveTextContent(/restore or import a hierarchy/i);
    expect(
      screen.getByRole('region', { name: /overview risks, trends, and context signals/i }),
    ).toHaveTextContent(/0 vision items visible/i);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('surfaces read-only risk, trend, and context signals from local evidence', () => {
    renderOverviewPage({
      learningObservations: [
        {
          source: 'manual_calibration',
          breakdown: {
            reportedPerformanceScore: 0.38,
            reportedBehaviorScore: 0.4,
            subjectiveScore: 0.36,
          },
          confidence: 0.84,
          id: 'obs-test-overload',
          observedAt: '2026-05-24T01:00:00.000Z',
          reasons: ['rapid context switching'],
          score: 0.38,
          state: 'overloaded',
        },
      ],
      reflections: [
        {
          content: 'Carry the budgeting thought into planning.',
          createdAt: '2026-05-24T01:00:00.000Z',
          entityType: 'reflection',
          id: 'reflection-test-follow-up',
          properties: {
            ritualFollowUpTargets: ['task'],
            ritualInputKind: 'reflection',
            source: 'ritual',
          },
          status: 'completed',
          title: 'Ritual reflection',
          updatedAt: '2026-05-24T01:00:00.000Z',
          workflowStage: 'ritual',
        },
      ],
    });

    const signals = screen.getByRole('region', {
      name: /overview risks, trends, and context signals/i,
    });

    expect(signals).toHaveTextContent(/elevated risk/i);
    expect(signals).toHaveTextContent(/100% overloaded or fatigued samples/i);
    expect(signals).toHaveTextContent(/38% average attention/i);
    expect(signals).toHaveTextContent(/1 user-provided attention sample/i);
    expect(signals).toHaveTextContent(/1 marked ritual input/i);
    expect(signals).toHaveTextContent(/1 vision item visible/i);
    expect(signals).toHaveTextContent(/read-only orientation/i);
    expect(
      within(signals).queryByRole('button', { name: /create|edit|delete|decompose|approve/i }),
    ).toBeNull();
  });

  it('surfaces release metrics and guardrails from local workflow evidence', () => {
    const now = '2026-05-24T02:20:00.000Z';
    const taskOne: V2Entity = {
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'task',
      id: 'task-metrics-done',
      properties: {
        estimatedMinutes: 25,
      },
      status: 'completed',
      title: 'Completed focus task',
      updatedAt: now,
      workflowStage: 'execution',
    };
    const taskTwo: V2Entity = {
      ...taskOne,
      id: 'task-metrics-active',
      status: 'active',
      title: 'Active focus task',
    };
    const lifecycleEntry = (id: string, details: V2AuditLogEntry['details']): V2AuditLogEntry => ({
      action: 'task.lifecycle.transition',
      actor: 'user',
      createdAt: now,
      details,
      id,
      targetId: 'task-metrics-done',
    });

    renderOverviewPage({
      aiSuggestions: [
        {
          approvalRequired: true,
          context: [],
          createdAt: now,
          createdBy: 'agent:test',
          id: 'suggestion-rejected',
          kind: 'workflow_optimization',
          payload: {
            actions: [],
            confidence: 0.5,
            evidence: ['test'],
            privacyLevel: 'L1',
          },
          rationale: 'Rejected by user.',
          status: 'rejected',
          title: 'Rejected suggestion',
          updatedAt: now,
        },
      ],
      auditEntries: [
        lifecycleEntry('audit-start-1', {
          event: 'START_EXECUTION',
          from: 'planning',
          to: 'executing',
        }),
        lifecycleEntry('audit-resume-1', {
          event: 'RESUME',
          from: 'paused',
          to: 'executing',
        }),
        lifecycleEntry('audit-complete-1', {
          event: 'COMPLETE',
          from: 'reviewing',
          to: 'done',
        }),
        lifecycleEntry('audit-start-2', {
          event: 'START_EXECUTION',
          from: 'planning',
          to: 'executing',
        }),
      ],
      hierarchyEntities: [taskOne, taskTwo],
      learningObservations: [
        {
          source: 'manual_calibration',
          breakdown: {
            reportedPerformanceScore: 0.88,
            reportedBehaviorScore: 0.8,
            subjectiveScore: 0.92,
          },
          confidence: 0.9,
          id: 'obs-focused',
          observedAt: now,
          reasons: ['completed a bounded task block'],
          score: 0.86,
          state: 'focused',
        },
        {
          source: 'manual_calibration',
          breakdown: {
            reportedPerformanceScore: 0.38,
            reportedBehaviorScore: 0.36,
            subjectiveScore: 0.4,
          },
          confidence: 0.55,
          id: 'obs-switching',
          observedAt: now,
          reasons: ['rapid context switching'],
          score: 0.38,
          state: 'overloaded',
        },
      ],
      reflections: [
        {
          createdAt: now,
          entityType: 'reflection',
          id: 'reflection-metrics',
          properties: {},
          status: 'completed',
          title: 'Metrics reflection',
          updatedAt: now,
        },
      ],
      reminderSettings: {
        dailyPromptLimit: 6,
        frequencyMinutes: 60,
        nativePermissionConsentVersion: 1,
        priorityOverrideEnabled: false,
        quietHoursEnd: '09:00',
        quietHoursStart: '21:00',
        remindersEnabled: true,
        updatedAt: now,
      },
    });

    const metrics = screen.getByRole('region', { name: /release metrics and guardrails/i });

    expect(metrics).toHaveTextContent(/attention ratio/i);
    expect(metrics).toHaveTextContent(/50%/i);
    expect(metrics).toHaveTextContent(/switching pressure/i);
    expect(metrics).toHaveTextContent(/recovery cues/i);
    expect(metrics).toHaveTextContent(/focus success/i);
    expect(metrics).toHaveTextContent(/plan fulfillment/i);
    expect(metrics).toHaveTextContent(/reminder load/i);
    expect(metrics).toHaveTextContent(/6\/day/i);
    expect(metrics).toHaveTextContent(/recording friction/i);
    expect(metrics).toHaveTextContent(/autonomy kept/i);
    expect(metrics).toHaveTextContent(/0 auto/i);
    expect(metrics).toHaveTextContent(/misjudgment signal/i);
    expect(within(metrics).queryByRole('button')).toBeNull();
  });

  it('shows calibration states instead of fabricated attention outcomes on fresh data', () => {
    renderOverviewPage({ hierarchyEntities: [] });

    const signals = screen.getByRole('region', {
      name: /overview risks, trends, and context signals/i,
    });
    expect(signals).toHaveTextContent(/needs calibration/i);
    expect(signals).toHaveTextContent(/no user-provided attention observations/i);
    expect(signals).not.toHaveTextContent(/0% average attention/i);

    const learningSnapshot = screen.getByRole('region', { name: /learning snapshot/i });
    expect(learningSnapshot).toHaveTextContent(/attention trend/i);
    expect(learningSnapshot).toHaveTextContent(/no data/i);
    expect(learningSnapshot).toHaveTextContent(/complete a manual calibration/i);

    const metrics = screen.getByRole('region', { name: /release metrics and guardrails/i });
    expect(metrics).toHaveTextContent(/manual calibration/i);
    expect(metrics).toHaveTextContent(/no data/i);
  });

  it('shows a bounded interruption recovery cue when returning to Overview', async () => {
    renderOverviewPage({
      taskRuntime: {
        actualMinutes: 5,
        state: 'paused',
        taskId: 'task-wire-overview',
        updatedAt: '2026-05-24T02:30:00.000Z',
      },
    });

    const cue = screen.getByRole('region', { name: /interruption recovery cue/i });

    expect(cue).toHaveTextContent(/clarify overview scan/i);
    expect(cue).toHaveTextContent(/5 saved minutes in paused/i);
    expect(within(cue).queryByRole('button', { name: /create|edit|delete|approve/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /review recovery in execution/i }));

    expect(await screen.findByRole('heading', { name: /execution plan/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /interruption recovery cue/i })).toHaveTextContent(
      /paused focus is ready to resume/i,
    );
  });

  it('shows start execution only at the task layer and routes through daily flow', async () => {
    renderOverviewPage();

    expect(screen.queryByRole('button', { name: /start execution/i })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    fireEvent.click(screen.getByRole('button', { name: /open product development/i }));
    fireEvent.click(screen.getByRole('button', { name: /open coherent stage experience/i }));
    fireEvent.click(screen.getByRole('button', { name: /open overview scan redesign/i }));

    expect(screen.getByText(/current layer: task/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /start execution for clarify overview scan/i }),
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /execution/i })).toBeInTheDocument();
    });
  });

  it('supports day week month, project grouping, and four-quadrant task browsing', () => {
    const now = '2026-05-24T01:00:00.000Z';
    const project: V2Entity = {
      content: 'Second project for task overview grouping.',
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'project',
      id: 'project-context-capture',
      parentId: 'goal-phase-1-deterministic-core',
      properties: {},
      status: 'active',
      title: 'Context capture project',
      updatedAt: now,
      workflowStage: 'overview',
    };
    const urgentImportantTask: V2Entity = {
      content: 'Handle the current urgent and important task.',
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'task',
      id: 'task-urgent-important',
      parentId: 'project-desktop-workflow-scaffold',
      properties: {
        dueDate: '2026-05-25T12:00:00.000Z',
        importance: 'high',
        scheduledFor: '2026-05-24T09:00:00.000Z',
      },
      status: 'active',
      title: 'Submit grant draft',
      updatedAt: now,
      workflowStage: 'overview',
    };
    const importantLaterTask: V2Entity = {
      content: 'Important but not urgent.',
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'task',
      id: 'task-important-later',
      parentId: 'project-context-capture',
      properties: {
        dueDate: '2026-07-01T12:00:00.000Z',
        importance: 'high',
        scheduledFor: '2026-05-24T13:00:00.000Z',
      },
      status: 'active',
      title: 'Outline context archive',
      updatedAt: now,
      workflowStage: 'overview',
    };
    const urgentSmallTask: V2Entity = {
      content: 'Urgent but not important enough to displace focus.',
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'task',
      id: 'task-urgent-small',
      parentId: 'project-context-capture',
      properties: {
        dueDate: '2026-05-25T12:00:00.000Z',
        scheduledFor: '2026-05-24T15:00:00.000Z',
      },
      status: 'active',
      title: 'Reply to scheduling note',
      updatedAt: now,
      workflowStage: 'overview',
    };
    const laterTask: V2Entity = {
      content: 'A low-risk later-list task.',
      createdAt: now,
      entityType: 'task',
      hierarchyLayer: 'task',
      id: 'task-later-list',
      parentId: 'project-context-capture',
      properties: {
        dueDate: '2026-08-01T12:00:00.000Z',
        scheduledFor: '2026-05-24T16:00:00.000Z',
      },
      status: 'active',
      title: 'Clean reference inbox',
      updatedAt: now,
      workflowStage: 'overview',
    };

    renderOverviewPage({
      hierarchyEntities: [
        ...DEFAULT_HIERARCHY_ENTITIES,
        project,
        urgentImportantTask,
        importantLaterTask,
        urgentSmallTask,
        laterTask,
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /open personal context os/i }));
    fireEvent.click(screen.getByRole('button', { name: /open product development/i }));
    fireEvent.click(screen.getByRole('button', { name: /open coherent stage experience/i }));
    fireEvent.click(screen.getByRole('button', { name: /open overview scan redesign/i }));

    const taskOverview = screen.getByRole('region', { name: /task overview browsing/i });

    expect(taskOverview).toHaveTextContent(/browse tasks without leaving overview/i);
    expect(taskOverview).toHaveTextContent(/day by project/i);
    expect(taskOverview).toHaveTextContent(/2026-05-24/i);
    expect(taskOverview).toHaveTextContent(/overview scan redesign/i);
    expect(taskOverview).toHaveTextContent(/context capture project/i);
    expect(taskOverview).toHaveTextContent(/submit grant draft/i);
    expect(taskOverview).toHaveTextContent(/outline context archive/i);

    fireEvent.click(within(taskOverview).getByRole('button', { name: /week/i }));
    expect(taskOverview).toHaveTextContent(/week by project/i);
    expect(taskOverview).toHaveTextContent(/week of 2026-05-18/i);

    fireEvent.click(within(taskOverview).getByRole('button', { name: /month/i }));
    expect(taskOverview).toHaveTextContent(/month by project/i);
    expect(taskOverview).toHaveTextContent(/may 2026/i);

    expect(taskOverview).toHaveTextContent(/four-quadrant scan/i);
    expect(taskOverview).toHaveTextContent(/do next/i);
    expect(taskOverview).toHaveTextContent(/schedule/i);
    expect(taskOverview).toHaveTextContent(/shrink or delegate/i);
    expect(taskOverview).toHaveTextContent(/later list/i);
    expect(taskOverview).toHaveTextContent(/reply to scheduling note/i);
    expect(taskOverview).toHaveTextContent(/clean reference inbox/i);
  });
});
