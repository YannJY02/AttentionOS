import type { CreatePromptTemplateInput, PromptTemplate } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface PromptRow {
  id: string;
  key: string;
  version: string;
  description: string | null;
  template: string;
  variables: string[];
  max_privacy_level: PromptTemplate['maxPrivacyLevel'];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function rowToPrompt(row: PromptRow): PromptTemplate {
  return {
    id: row.id,
    key: row.key,
    version: row.version,
    description: row.description ?? undefined,
    template: row.template,
    variables: row.variables ?? [],
    maxPrivacyLevel: row.max_privacy_level,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PromptRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findActiveByKey(key: string): Promise<PromptTemplate | null> {
    const { data, error } = await this.db
      .from('prompt_templates')
      .select('*')
      .eq('key', key)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(`PromptRepository.findActiveByKey: ${error.message}`);
    if (!data) return null;
    return rowToPrompt(data);
  }

  async create(input: CreatePromptTemplateInput): Promise<PromptTemplate> {
    const { data, error } = await this.db
      .from('prompt_templates')
      .insert({
        key: input.key,
        version: input.version,
        description: input.description ?? null,
        template: input.template,
        variables: input.variables,
        max_privacy_level: input.maxPrivacyLevel,
        is_active: input.isActive,
      })
      .select('*')
      .single();

    if (error) throw new Error(`PromptRepository.create: ${error.message}`);
    return rowToPrompt(data);
  }
}
