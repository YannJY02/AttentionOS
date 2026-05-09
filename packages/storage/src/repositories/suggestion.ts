import type {
  AISuggestion,
  AISuggestionKind,
  CreateAISuggestionInput,
  SuggestionStatus,
} from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SuggestionTargetFilter {
  readonly kind?: AISuggestionKind;
  readonly limit?: number;
  readonly status?: SuggestionStatus;
}

interface SuggestionRow {
  id: string;
  kind: AISuggestion['kind'];
  status: SuggestionStatus;
  target_id: string | null;
  title: string;
  rationale: string;
  payload: object;
  context: AISuggestion['context'];
  created_by: string;
  model_id: string | null;
  model_version: string | null;
  approval_required: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToSuggestion<TPayload extends object = Record<string, unknown>>(
  row: SuggestionRow,
): AISuggestion<TPayload> {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    targetId: row.target_id ?? undefined,
    title: row.title,
    rationale: row.rationale,
    payload: (row.payload ?? {}) as TPayload,
    context: row.context ?? [],
    createdBy: row.created_by,
    modelId: row.model_id ?? undefined,
    modelVersion: row.model_version ?? undefined,
    approvalRequired: row.approval_required,
    reviewedBy: row.reviewed_by ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SuggestionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTarget<TPayload extends object = Record<string, unknown>>(
    targetId: string,
    filter: SuggestionTargetFilter = {},
  ): Promise<AISuggestion<TPayload>[]> {
    let query = this.db.from('ai_suggestions').select('*').eq('target_id', targetId);

    if (filter.kind) query = query.eq('kind', filter.kind);
    if (filter.status) query = query.eq('status', filter.status);

    query = query.order('updated_at', { ascending: false });
    if (filter.limit) query = query.limit(filter.limit);

    const { data, error } = await query;

    if (error) throw new Error(`SuggestionRepository.findByTarget: ${error.message}`);
    return (data ?? []).map((row) => rowToSuggestion<TPayload>(row));
  }

  async create<TPayload extends object = Record<string, unknown>>(
    input: CreateAISuggestionInput<TPayload>,
  ): Promise<AISuggestion<TPayload>> {
    const { data, error } = await this.db
      .from('ai_suggestions')
      .insert({
        kind: input.kind,
        status: input.status,
        target_id: input.targetId ?? null,
        title: input.title,
        rationale: input.rationale,
        payload: input.payload,
        context: input.context,
        created_by: input.createdBy,
        model_id: input.modelId ?? null,
        model_version: input.modelVersion ?? null,
        approval_required: input.approvalRequired,
      })
      .select('*')
      .single();

    if (error) throw new Error(`SuggestionRepository.create: ${error.message}`);
    return rowToSuggestion<TPayload>(data);
  }

  async approve<TPayload extends object = Record<string, unknown>>(
    id: string,
    reviewer: string,
  ): Promise<AISuggestion<TPayload> | null> {
    return this.review(id, 'approved', reviewer);
  }

  async reject<TPayload extends object = Record<string, unknown>>(
    id: string,
    reviewer: string,
  ): Promise<AISuggestion<TPayload> | null> {
    return this.review(id, 'rejected', reviewer);
  }

  async markApplied<TPayload extends object = Record<string, unknown>>(
    id: string,
    reviewer: string,
  ): Promise<AISuggestion<TPayload> | null> {
    return this.review(id, 'applied', reviewer);
  }

  private async review<TPayload extends object = Record<string, unknown>>(
    id: string,
    status: Extract<SuggestionStatus, 'approved' | 'rejected' | 'applied'>,
    reviewer: string,
  ): Promise<AISuggestion<TPayload> | null> {
    const { data, error } = await this.db
      .from('ai_suggestions')
      .update({
        status,
        reviewed_by: reviewer,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(`SuggestionRepository.review: ${error.message}`);
    if (!data) return null;
    return rowToSuggestion<TPayload>(data);
  }
}
