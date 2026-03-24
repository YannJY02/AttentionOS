-- Migration: 0003_enable_rls.sql
-- Phase 1: Enable RLS on all tables
-- Strategy: service_role bypasses RLS for server-side operations.
-- anon/authenticated roles get full access via open policy (single-user desktop app).
-- Phase 4 will tighten these policies with user-scoped auth.uid() checks.

ALTER TABLE entities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges                ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE attention_observations ENABLE ROW LEVEL SECURITY;

-- Open policies for Phase 1 (single-user app, no multi-tenancy)
-- Authenticated users can read/write all rows in their own session
CREATE POLICY "phase1_entities_all"
  ON entities FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase1_edges_all"
  ON edges FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase1_audit_log_all"
  ON audit_log FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase1_attention_observations_all"
  ON attention_observations FOR ALL
  USING (true)
  WITH CHECK (true);
