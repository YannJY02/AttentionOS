import { analyzeBehaviorPatterns, createWorkflowOptimizationSuggestions } from '@attentionos/ai';
import type {
  AISuggestion,
  BehaviorPatternReport,
  CreateAuditLogInput,
  CreateWorkflowOptimizationSuggestionInput,
  LearningWindow,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Entity,
  WorkflowOptimizationPayload,
} from '@attentionos/core';

interface AttentionObservationRepositoryPort {
  readonly findWindow: (window: LearningWindow) => Promise<readonly V2AttentionObservationRecord[]>;
}

interface EntityRepositoryPort {
  readonly findAll: (filter?: {
    readonly entityType?: V2Entity['entityType'];
    readonly hierarchyLayer?: V2Entity['hierarchyLayer'];
  }) => Promise<readonly V2Entity[]>;
}

interface AuditRepositoryPort {
  readonly findByTarget?: (targetId: string) => Promise<readonly V2AuditLogEntry[]>;
  readonly log: (input: CreateAuditLogInput) => Promise<V2AuditLogEntry>;
}

interface SuggestionRepositoryPort {
  readonly create: (
    input: CreateWorkflowOptimizationSuggestionInput,
  ) => Promise<AISuggestion<WorkflowOptimizationPayload>>;
  readonly findRecent: (filter: {
    readonly limit?: number;
    readonly since?: string;
  }) => Promise<readonly AISuggestion<object>[]>;
}

export interface LearningRuntimeDependencies {
  readonly attention: AttentionObservationRepositoryPort;
  readonly audit: AuditRepositoryPort;
  readonly entities: EntityRepositoryPort;
  readonly suggestions: SuggestionRepositoryPort;
}

export interface AnalyzeLearningWindowResult {
  readonly createdSuggestions: readonly AISuggestion<WorkflowOptimizationPayload>[];
  readonly report: BehaviorPatternReport;
}

export interface LearningRuntime {
  readonly analyzeWindow: (window: LearningWindow) => Promise<AnalyzeLearningWindowResult>;
}

export function createLearningRuntime(deps: LearningRuntimeDependencies): LearningRuntime {
  return {
    async analyzeWindow(window) {
      const [attention, tasks, suggestions] = await Promise.all([
        deps.attention.findWindow(window),
        deps.entities.findAll({ entityType: 'task', hierarchyLayer: 'task' }),
        deps.suggestions.findRecent({ since: window.startedAt }),
      ]);

      const report = analyzeBehaviorPatterns({
        attention,
        audit: [],
        suggestions,
        tasks,
        window,
      });
      const candidates = createWorkflowOptimizationSuggestions(report);
      const createdSuggestions = [];

      for (const candidate of candidates) {
        createdSuggestions.push(await deps.suggestions.create(candidate));
      }

      await deps.audit.log({
        actor: 'agent:phase3',
        action: 'learning.analysis.completed',
        details: {
          attentionSamples: report.attention.sampleCount,
          createdSuggestionCount: createdSuggestions.length,
          oversizedActiveTaskCount: report.tasks.oversizedActiveTaskCount,
          window,
        },
      });

      return { createdSuggestions, report };
    },
  };
}
