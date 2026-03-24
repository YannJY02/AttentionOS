import type { CreateEntityInput, UpdateEntityInput, V2Entity } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { entityToRow, rowToEntity } from '../mappers/entity';

export interface EntityFilter {
  entityType?: V2Entity['entityType'];
  status?: V2Entity['status'];
  hierarchyLayer?: V2Entity['hierarchyLayer'];
  parentId?: string;
  workflowStage?: V2Entity['workflowStage'];
}

export class EntityRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: string): Promise<V2Entity | null> {
    const { data, error } = await this.db.from('entities').select('*').eq('id', id).maybeSingle();

    if (error) throw new Error(`EntityRepository.findById: ${error.message}`);
    if (!data) return null;
    return rowToEntity(data);
  }

  async findAll(filter: EntityFilter = {}): Promise<V2Entity[]> {
    let query = this.db.from('entities').select('*');

    if (filter.entityType) query = query.eq('entity_type', filter.entityType);
    if (filter.status) query = query.eq('status', filter.status);
    if (filter.workflowStage) query = query.eq('workflow_stage', filter.workflowStage);
    if (filter.parentId) query = query.eq('parent_id', filter.parentId);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`EntityRepository.findAll: ${error.message}`);
    return (data ?? []).map(rowToEntity);
  }

  async create(input: CreateEntityInput): Promise<V2Entity> {
    const { data, error } = await this.db
      .from('entities')
      .insert(entityToRow(input))
      .select('*')
      .single();

    if (error) throw new Error(`EntityRepository.create: ${error.message}`);
    return rowToEntity(data);
  }

  async update(id: string, patch: UpdateEntityInput): Promise<V2Entity | null> {
    const { data, error } = await this.db
      .from('entities')
      .update(entityToRow(patch))
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(`EntityRepository.update: ${error.message}`);
    if (!data) return null;
    return rowToEntity(data);
  }

  async archive(id: string): Promise<V2Entity | null> {
    return this.update(id, { status: 'archived' });
  }
}
