import type {
  AISuggestion,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Entity,
  WorkflowOptimizationPayload,
} from '@attentionos/core';
import { describe, expect, it } from 'vitest';
import { createLearningRuntime } from './learning-runtime';

const WINDOW = {
  endedAt: '2026-05-09T12:00:00.000Z',
  startedAt: '2026-05-09T08:00:00.000Z',
};

const attention: V2AttentionObservationRecord[] = [
  {
    id: 'obs-1',
    state: 'overloaded',
    score: 0.35,
    confidence: 0.9,
    breakdown: { behavioralScore: 0.3, passiveScore: 0.35, subjectiveScore: 0.4 },
    reasons: ['rapid switching'],
    observedAt: '2026-05-09T09:00:00.000Z',
  },
];

const tasks: V2Entity[] = [
  {
    id: 'task-1',
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Large project task',
    status: 'active',
    properties: { estimatedMinutes: 180 },
    workflowStage: 'overview',
    createdAt: '2026-05-09T08:30:00.000Z',
    updatedAt: '2026-05-09T08:30:00.000Z',
  },
];

const priorSuggestions: AISuggestion<object>[] = [
  {
    id: 'sug-prior',
    kind: 'task_decomposition',
    status: 'pending',
    title: 'Prior suggestion',
    rationale: 'Pending does not count as accepted.',
    payload: {},
    context: [],
    createdBy: 'agent:phase2',
    approvalRequired: true,
    createdAt: '2026-05-09T09:00:00.000Z',
    updatedAt: '2026-05-09T09:00:00.000Z',
  },
];

describe('Phase 3 learning runtime', () => {
  it('creates pending workflow optimization suggestions and logs analysis', async () => {
    const auditEntries: V2AuditLogEntry[] = [];
    const auditWindowCalls: Array<typeof WINDOW> = [];
    const createdSuggestions: AISuggestion<WorkflowOptimizationPayload>[] = [];
    const runtime = createLearningRuntime({
      audit: {
        findWindow: async (window) => {
          auditWindowCalls.push(window);
          return [
            {
              id: 'audit-complete-1',
              actor: 'user',
              action: 'task.lifecycle.transition',
              targetId: 'task-1',
              details: { from: 'reviewing', to: 'done' },
              createdAt: '2026-05-09T10:00:00.000Z',
            },
          ];
        },
        log: async (input) => {
          const entry: V2AuditLogEntry = {
            id: `audit-${auditEntries.length + 1}`,
            createdAt: '2026-05-09T12:00:00.000Z',
            ...input,
          };
          auditEntries.push(entry);
          return entry;
        },
      },
      attention: { findWindow: async () => attention },
      entities: { findAll: async () => tasks },
      suggestions: {
        create: async (input) => {
          const suggestion: AISuggestion<WorkflowOptimizationPayload> = {
            id: `sug-${createdSuggestions.length + 1}`,
            createdAt: '2026-05-09T12:00:00.000Z',
            updatedAt: '2026-05-09T12:00:00.000Z',
            ...input,
          };
          createdSuggestions.push(suggestion);
          return suggestion;
        },
        findRecent: async () => priorSuggestions,
      },
    });

    const result = await runtime.analyzeWindow(WINDOW);

    expect(result.report.tasks.oversizedActiveTaskCount).toBe(1);
    expect(auditWindowCalls).toEqual([WINDOW]);
    expect(result.report.evidence).toContain('1 completion transition(s) recorded');
    expect(result.createdSuggestions).toEqual([
      expect.objectContaining({
        kind: 'workflow_optimization',
        status: 'pending',
        approvalRequired: true,
      }),
    ]);
    expect(auditEntries).toEqual([
      expect.objectContaining({
        action: 'learning.analysis.completed',
        actor: 'agent:phase3',
      }),
    ]);
  });
});
