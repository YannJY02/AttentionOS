import type { AISuggestion, CreateAISuggestionInput, SuggestionStatus } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface SuggestionRow {
  id: string;
  kind: AISuggestion['kind'];
  status: SuggestionStatus;
  target_id: string | null;
  title: string;
  rationale: string;
  payload: Record<string, unknown>;
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

function rowToSuggestion(row: SuggestionRow): AISuggestion {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    targetId: row.target_id ?? undefined,
    title: row.title,
    rationale: row.rationale,
    payload: row.payload ?? {},
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

  async create(input: CreateAISuggestionInput): Promise<AISuggestion> {
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
    return rowToSuggestion(data);
  }

  async approve(id: string, reviewer: string): Promise<AISuggestion | null> {
    return this.review(id, 'approved', reviewer);
  }

  async reject(id: string, reviewer: string): Promise<AISuggestion | null> {
    return this.review(id, 'rejected', reviewer);
  }

  private async review(
    id: string,
    status: Extract<SuggestionStatus, 'approved' | 'rejected'>,
    reviewer: string,
  ): Promise<AISuggestion | null> {
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
    return rowToSuggestion(data);
  }
}
