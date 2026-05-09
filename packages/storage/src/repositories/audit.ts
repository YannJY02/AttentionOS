import type { CreateAuditLogInput, LearningWindow, V2AuditLogEntry } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuditRow {
  id: string;
  actor: string;
  action: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

function rowToAudit(row: AuditRow): V2AuditLogEntry {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    targetId: row.target_id ?? undefined,
    details: row.details ?? {},
    createdAt: row.created_at,
  };
}

export class AuditRepository {
  constructor(private readonly db: SupabaseClient) {}

  async log(input: CreateAuditLogInput): Promise<V2AuditLogEntry> {
    const { data, error } = await this.db
      .from('audit_log')
      .insert({
        actor: input.actor,
        action: input.action,
        target_id: input.targetId ?? null,
        details: input.details ?? {},
      })
      .select('*')
      .single();

    if (error) throw new Error(`AuditRepository.log: ${error.message}`);
    return rowToAudit(data);
  }

  async findByTarget(targetId: string): Promise<V2AuditLogEntry[]> {
    const { data, error } = await this.db
      .from('audit_log')
      .select('*')
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`AuditRepository.findByTarget: ${error.message}`);
    return (data ?? []).map(rowToAudit);
  }

  async findByActor(actor: string): Promise<V2AuditLogEntry[]> {
    const { data, error } = await this.db
      .from('audit_log')
      .select('*')
      .eq('actor', actor)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`AuditRepository.findByActor: ${error.message}`);
    return (data ?? []).map(rowToAudit);
  }

  async findWindow(window: LearningWindow): Promise<V2AuditLogEntry[]> {
    const { data, error } = await this.db
      .from('audit_log')
      .select('*')
      .gte('created_at', window.startedAt)
      .lte('created_at', window.endedAt)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`AuditRepository.findWindow: ${error.message}`);
    return (data ?? []).map(rowToAudit);
  }
}
