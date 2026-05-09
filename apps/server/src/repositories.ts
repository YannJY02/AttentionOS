import {
  AuditRepository,
  EntityRepository,
  getSupabaseClient,
  SuggestionRepository,
} from '@attentionos/storage';
import { createAISuggestionService } from './ai-suggestions';

export function createSupabaseAISuggestionService() {
  const db = getSupabaseClient();

  return createAISuggestionService({
    audit: new AuditRepository(db),
    entities: new EntityRepository(db),
    suggestions: new SuggestionRepository(db),
  });
}
