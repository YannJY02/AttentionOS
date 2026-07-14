import { createReleaseMetricsSnapshot, type ReleaseMetricsSnapshot } from '@attentionos/guidance';
import { readAISuggestions } from './aiSuggestions';
import { readExecutionAuditEntries } from './audit';
import { readHierarchyEntities } from './hierarchy';
import { getLearningSnapshot, readLearningObservations } from './learning';
import { readReflections } from './reflections';
import { readReminderSettings } from './reminderSettings';

export type { ReleaseMetric, ReleaseMetricsSnapshot } from '@attentionos/guidance';

export function getReleaseMetricsSnapshot(): ReleaseMetricsSnapshot {
  return createReleaseMetricsSnapshot({
    generatedAt: new Date().toISOString(),
    learningReport: getLearningSnapshot().report,
    manualReflectionCount: readReflections().length,
    observations: readLearningObservations(),
    reminderSettings: readReminderSettings(),
    suggestions: readAISuggestions(),
    workflow: {
      auditEntries: readExecutionAuditEntries(),
      entities: readHierarchyEntities(),
    },
  });
}
