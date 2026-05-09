import type {
  AISuggestion,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Entity,
} from '@attentionos/core';
import { describe, expect, it } from 'vitest';
import {
  analyzeBehaviorPatterns,
  createWorkflowOptimizationSuggestions,
  measureSuggestionAdoption,
} from './evolution';

const WINDOW = {
  endedAt: '2026-05-09T12:00:00.000Z',
  startedAt: '2026-05-09T08:00:00.000Z',
};

const attention: V2AttentionObservationRecord[] = [
  {
    id: 'obs-1',
    state: 'focused',
    score: 0.82,
    confidence: 0.9,
    breakdown: { behavioralScore: 0.8, passiveScore: 0.75, subjectiveScore: 0.9 },
    reasons: ['timer completed'],
    observedAt: '2026-05-09T08:30:00.000Z',
  },
  {
    id: 'obs-2',
    state: 'overloaded',
    score: 0.34,
    confidence: 0.86,
    breakdown: { behavioralScore: 0.3, passiveScore: 0.4, subjectiveScore: 0.32 },
    reasons: ['rapid task switching'],
    observedAt: '2026-05-09T10:30:00.000Z',
  },
];

const tasks: V2Entity[] = [
  {
    id: 'task-1',
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Write design note',
    status: 'completed',
    properties: { estimatedMinutes: 30 },
    workflowStage: 'overview',
    createdAt: '2026-05-09T08:00:00.000Z',
    updatedAt: '2026-05-09T09:00:00.000Z',
    completedAt: '2026-05-09T09:00:00.000Z',
  },
  {
    id: 'task-2',
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Large implementation',
    status: 'active',
    properties: { estimatedMinutes: 180 },
    workflowStage: 'overview',
    createdAt: '2026-05-09T08:00:00.000Z',
    updatedAt: '2026-05-09T11:00:00.000Z',
  },
];

const audit: V2AuditLogEntry[] = [
  {
    id: 'audit-1',
    actor: 'user',
    action: 'task.lifecycle.transition',
    targetId: 'task-1',
    details: { event: 'COMPLETE', from: 'reviewing', to: 'done' },
    createdAt: '2026-05-09T09:00:00.000Z',
  },
];

const suggestions: AISuggestion[] = [
  {
    id: 'sug-1',
    kind: 'task_decomposition',
    status: 'applied',
    title: 'Split large implementation',
    rationale: 'The task is too large.',
    payload: {},
    context: [],
    createdBy: 'agent:phase2',
    approvalRequired: true,
    reviewedBy: 'user',
    reviewedAt: '2026-05-09T09:30:00.000Z',
    createdAt: '2026-05-09T09:15:00.000Z',
    updatedAt: '2026-05-09T09:30:00.000Z',
  },
  {
    id: 'sug-2',
    kind: 'workflow_transition',
    status: 'rejected',
    title: 'Move back to overview',
    rationale: 'User rejected it.',
    payload: {},
    context: [],
    createdBy: 'agent:phase2',
    approvalRequired: true,
    reviewedBy: 'user',
    reviewedAt: '2026-05-09T10:00:00.000Z',
    createdAt: '2026-05-09T09:45:00.000Z',
    updatedAt: '2026-05-09T10:00:00.000Z',
  },
];

describe('Phase 3 evolutionary learning', () => {
  it('analyzes attention, task completion, and adoption patterns in one window', () => {
    const report = analyzeBehaviorPatterns({
      attention,
      audit,
      suggestions,
      tasks,
      window: WINDOW,
    });

    expect(report.attention.averageScore).toBeCloseTo(0.58);
    expect(report.attention.dominantState).toBe('focused');
    expect(report.tasks.completionRatio).toBe(0.5);
    expect(report.tasks.oversizedActiveTaskCount).toBe(1);
    expect(report.adoption.appliedSuggestions).toBe(1);
    expect(report.adoption.adoptionRate).toBe(0.5);
  });

  it('creates pending HITL workflow optimization suggestions from weak patterns', () => {
    const report = analyzeBehaviorPatterns({
      attention,
      audit,
      suggestions,
      tasks,
      window: WINDOW,
    });
    const generated = createWorkflowOptimizationSuggestions(report);

    expect(generated).toEqual([
      expect.objectContaining({
        kind: 'workflow_optimization',
        status: 'pending',
        approvalRequired: true,
        createdBy: 'agent:phase3',
        payload: expect.objectContaining({
          actions: expect.arrayContaining([expect.objectContaining({ type: 'task.split' })]),
          privacyLevel: 'L1',
        }),
      }),
    ]);
  });

  it('calculates adoption rate without treating pending suggestions as accepted', () => {
    expect(measureSuggestionAdoption(suggestions)).toMatchObject({
      acceptedSuggestions: 1,
      appliedSuggestions: 1,
      rejectedSuggestions: 1,
      reviewableSuggestions: 2,
      adoptionRate: 0.5,
    });
  });
});
