import type { V2AttentionObservationRecord } from '@attentionos/guidance';
import type { V2AuditLogEntry, V2Entity } from '@attentionos/workflow';
import { beforeEach, describe, expect, it } from 'vitest';
import { AI_SUGGESTIONS_STORAGE_KEY } from './aiSuggestions';
import { EXECUTION_AUDIT_STORAGE_KEY } from './audit';
import {
  DEFAULT_HIERARCHY_ENTITIES,
  HIERARCHY_STORAGE_KEY,
  readUserHierarchyEntities,
} from './hierarchy';
import { LEARNING_OBSERVATIONS_STORAGE_KEY } from './learning';
import { REFLECTION_STORAGE_KEY } from './reflections';
import { getReleaseMetricsSnapshot } from './releaseMetrics';
import { REMINDER_SETTINGS_STORAGE_KEY } from './reminderSettings';

const NOW = '2026-05-24T02:20:00.000Z';

function task(id: string, status: V2Entity['status']): V2Entity {
  return {
    createdAt: NOW,
    entityType: 'task',
    hierarchyLayer: 'task',
    id,
    properties: {
      estimatedMinutes: 25,
    },
    status,
    title: id,
    updatedAt: NOW,
    workflowStage: 'execution',
  };
}

function lifecycleEntry(id: string, details: V2AuditLogEntry['details']): V2AuditLogEntry {
  return {
    action: 'task.lifecycle.transition',
    actor: 'user',
    createdAt: NOW,
    details,
    id,
    targetId: 'task-1',
  };
}

describe('release metrics snapshot', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reports no data instead of outcome percentages without supporting evidence', () => {
    const snapshot = getReleaseMetricsSnapshot();

    expect(snapshot.outcomeMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'attention-ratio', status: 'no-data', value: 'No data' }),
        expect.objectContaining({ id: 'switching-pressure', status: 'no-data', value: 'No data' }),
        expect.objectContaining({ id: 'focus-success', status: 'no-data', value: 'No data' }),
        expect.objectContaining({ id: 'plan-fulfillment', status: 'no-data', value: 'No data' }),
      ]),
    );
    expect(snapshot.guardrailMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'misjudgment', status: 'no-data', value: 'No data' }),
      ]),
    );
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).toContain(
      DEFAULT_HIERARCHY_ENTITIES[0]?.id,
    );
    expect(readUserHierarchyEntities()).toEqual([]);
    expect(snapshot.outcomeMetrics.find((metric) => metric.id === 'attention-ratio')?.detail).toBe(
      'No user-provided attention observations.',
    );
  });

  it('derives outcome and guardrail metrics from local observations, audit, tasks, and settings', () => {
    const observations: V2AttentionObservationRecord[] = [
      {
        source: 'manual_calibration',
        breakdown: {
          reportedPerformanceScore: 0.88,
          reportedBehaviorScore: 0.8,
          subjectiveScore: 0.92,
        },
        confidence: 0.9,
        id: 'obs-focused',
        observedAt: NOW,
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
        observedAt: NOW,
        reasons: ['rapid context switching'],
        score: 0.38,
        state: 'overloaded',
      },
    ];
    const audit: V2AuditLogEntry[] = [
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
    ];

    localStorage.setItem(LEARNING_OBSERVATIONS_STORAGE_KEY, JSON.stringify(observations));
    localStorage.setItem(
      HIERARCHY_STORAGE_KEY,
      JSON.stringify([task('task-1', 'completed'), task('task-2', 'active')]),
    );
    localStorage.setItem(EXECUTION_AUDIT_STORAGE_KEY, JSON.stringify(audit));
    localStorage.setItem(
      AI_SUGGESTIONS_STORAGE_KEY,
      JSON.stringify([
        {
          approvalRequired: true,
          context: [],
          createdAt: NOW,
          createdBy: 'agent:test',
          id: 'suggestion-1',
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
          updatedAt: NOW,
        },
      ]),
    );
    localStorage.setItem(
      REMINDER_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        frequencyMinutes: 60,
        priorityOverrideEnabled: false,
        quietHoursEnd: '09:00',
        quietHoursStart: '21:00',
        remindersEnabled: true,
        updatedAt: NOW,
      }),
    );
    localStorage.setItem(
      REFLECTION_STORAGE_KEY,
      JSON.stringify([
        {
          createdAt: NOW,
          entityType: 'reflection',
          id: 'reflection-1',
          properties: {},
          status: 'completed',
          title: 'Reflection',
          updatedAt: NOW,
        },
      ]),
    );

    const snapshot = getReleaseMetricsSnapshot();

    expect(snapshot.outcomeMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'attention-ratio', value: '50%' }),
        expect.objectContaining({ id: 'switching-pressure', value: '50%' }),
        expect.objectContaining({ id: 'recovery-cues', value: '1' }),
        expect.objectContaining({ id: 'focus-success', value: '50%' }),
        expect.objectContaining({ id: 'plan-fulfillment', value: '50%' }),
      ]),
    );
    expect(snapshot.guardrailMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'reminder-fatigue', value: '12/day' }),
        expect.objectContaining({ id: 'recording-friction', value: '1' }),
        expect.objectContaining({ id: 'autonomy', value: '0 auto' }),
        expect.objectContaining({ id: 'misjudgment', value: '100%' }),
      ]),
    );
  });

  it('caps integration reminder load to the configured daily limit', () => {
    localStorage.setItem(
      REMINDER_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        frequencyMinutes: 30,
        integration: {
          appAutoOpenTarget: 'Calendar',
          auditTrailEnabled: true,
          channels: ['calendar-file', 'focus-handoff', 'app-auto-open'],
          dailyPromptLimit: 4,
          enabled: true,
          permissionStatementAccepted: true,
        },
        priorityOverrideEnabled: true,
        quietHoursEnd: '08:00',
        quietHoursStart: '22:00',
        remindersEnabled: true,
        updatedAt: NOW,
      }),
    );

    const snapshot = getReleaseMetricsSnapshot();

    expect(snapshot.guardrailMetrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          detail: expect.stringContaining('integration cap 4/day across 3 channels'),
          id: 'reminder-fatigue',
          value: '4/day',
        }),
      ]),
    );
  });
});
