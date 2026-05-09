import {
  AttentionObservationRepository,
  AuditRepository,
  EntityRepository,
  getSupabaseClient,
  SuggestionRepository,
} from '@attentionos/storage';
import { createAISuggestionService } from './ai-suggestions';
import { createLearningRuntime } from './learning-runtime';

export function createSupabaseAISuggestionService() {
  const db = getSupabaseClient();

  return createAISuggestionService({
    audit: new AuditRepository(db),
    entities: new EntityRepository(db),
    suggestions: new SuggestionRepository(db),
  });
}

export function createSupabaseLearningRuntime() {
  const db = getSupabaseClient();

  return createLearningRuntime({
    attention: new AttentionObservationRepository(db),
    audit: new AuditRepository(db),
    entities: new EntityRepository(db),
    suggestions: new SuggestionRepository(db),
  });
}
