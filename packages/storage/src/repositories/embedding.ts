import type {
  ContextSearchResult,
  CreateEmbeddingInput,
  EmbeddingRecord,
  PrivacyLevel,
} from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface EmbeddingRow {
  id: string;
  entity_id: string | null;
  content_hash: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  model_id: string;
  model_version: string;
  model_dimensions: number;
  privacy_level: PrivacyLevel;
  similarity?: number;
  score?: number;
  created_at: string;
  updated_at: string;
}

function rowToEmbedding(row: EmbeddingRow): EmbeddingRecord {
  return {
    id: row.id,
    entityId: row.entity_id ?? undefined,
    contentHash: row.content_hash,
    content: row.content,
    embedding: row.embedding ?? [],
    metadata: row.metadata ?? {},
    modelId: row.model_id,
    modelVersion: row.model_version,
    modelDimensions: row.model_dimensions,
    privacyLevel: row.privacy_level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToContextResult(row: EmbeddingRow): ContextSearchResult {
  return {
    id: row.id,
    entityId: row.entity_id ?? undefined,
    text: row.content,
    score: row.score ?? row.similarity ?? 1,
    metadata: row.metadata ?? {},
    modelId: row.model_id,
    modelVersion: row.model_version,
    privacyLevel: row.privacy_level,
  };
}

export interface EmbeddingSearchInput {
  readonly embedding: readonly number[];
  readonly matchThreshold?: number;
  readonly matchCount?: number;
  readonly maxPrivacyLevel?: PrivacyLevel;
  readonly modelId?: string;
}

export class EmbeddingRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateEmbeddingInput): Promise<EmbeddingRecord> {
    const { data, error } = await this.db
      .from('embeddings')
      .insert({
        entity_id: input.entityId ?? null,
        content_hash: input.contentHash,
        content: input.content,
        embedding: input.embedding,
        metadata: input.metadata ?? {},
        model_id: input.modelId,
        model_version: input.modelVersion,
        model_dimensions: input.modelDimensions,
        privacy_level: input.privacyLevel,
      })
      .select('*')
      .single();

    if (error) throw new Error(`EmbeddingRepository.create: ${error.message}`);
    return rowToEmbedding(data);
  }

  async search(input: EmbeddingSearchInput): Promise<ContextSearchResult[]> {
    const { data, error } = await this.db.rpc('match_embeddings', {
      query_embedding: input.embedding,
      match_threshold: input.matchThreshold ?? 0.75,
      match_count: input.matchCount ?? 5,
      max_privacy_level: input.maxPrivacyLevel ?? 'L1',
      query_model_id: input.modelId ?? null,
    });

    if (error) throw new Error(`EmbeddingRepository.search: ${error.message}`);
    return (data ?? []).map(rowToContextResult);
  }
}
