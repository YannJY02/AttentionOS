import type { CreateEdgeInput, RelationType, V2Edge } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface EdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: string;
  weight: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

function rowToEdge(row: EdgeRow): V2Edge {
  return {
    id: row.id,
    sourceId: row.source_id,
    targetId: row.target_id,
    relationType: row.relation_type as RelationType,
    weight: row.weight,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export class EdgeRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findBySource(sourceId: string): Promise<V2Edge[]> {
    const { data, error } = await this.db
      .from('edges')
      .select('*')
      .eq('source_id', sourceId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`EdgeRepository.findBySource: ${error.message}`);
    return (data ?? []).map(rowToEdge);
  }

  async findByTarget(targetId: string): Promise<V2Edge[]> {
    const { data, error } = await this.db
      .from('edges')
      .select('*')
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`EdgeRepository.findByTarget: ${error.message}`);
    return (data ?? []).map(rowToEdge);
  }

  async create(input: CreateEdgeInput): Promise<V2Edge> {
    const { data, error } = await this.db
      .from('edges')
      .insert({
        source_id: input.sourceId,
        target_id: input.targetId,
        relation_type: input.relationType,
        weight: input.weight ?? 1.0,
        metadata: input.metadata ?? {},
      })
      .select('*')
      .single();

    if (error) throw new Error(`EdgeRepository.create: ${error.message}`);
    return rowToEdge(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from('edges').delete().eq('id', id);
    if (error) throw new Error(`EdgeRepository.delete: ${error.message}`);
  }
}
