-- Migration: 0002_create_edges_and_audit.sql
-- Phase 1 edges, audit_log, and attention_observations tables

-- ── Edges table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS edges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id     UUID        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  target_id     UUID        NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  relation_type TEXT        NOT NULL
                            CHECK (relation_type IN ('parent_of','blocks','relates_to','spawned_from','scheduled_in')),
  weight        REAL        NOT NULL DEFAULT 1.0 CHECK (weight >= 0),
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate directed edges of the same type
  CONSTRAINT uq_edges_directed UNIQUE (source_id, target_id, relation_type)
);

CREATE INDEX idx_edges_source   ON edges(source_id);
CREATE INDEX idx_edges_target   ON edges(target_id);
CREATE INDEX idx_edges_type     ON edges(relation_type);

-- ── Audit log table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'user' | 'agent:<name>'
  actor      TEXT        NOT NULL CHECK (char_length(actor) BETWEEN 1 AND 100),
  -- 'entity.create' | 'workflow.transition' | 'task.complete' | ...
  action     TEXT        NOT NULL CHECK (char_length(action) BETWEEN 1 AND 100),
  target_id  UUID,
  details    JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor     ON audit_log(actor);
CREATE INDEX idx_audit_action    ON audit_log(action);
CREATE INDEX idx_audit_target    ON audit_log(target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_audit_time      ON audit_log(created_at DESC);

-- ── Attention observations table (Phase 1 schema, Phase 2 usage) ─────────────

CREATE TABLE IF NOT EXISTS attention_observations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  state      TEXT        NOT NULL
                         CHECK (state IN ('focused','drifting','overloaded','fatigued')),
  score      REAL        NOT NULL CHECK (score BETWEEN 0 AND 1),
  confidence REAL        NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  breakdown  JSONB       NOT NULL,
  reasons    TEXT[]      NOT NULL DEFAULT '{}',
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attention_state ON attention_observations(state);
CREATE INDEX idx_attention_time  ON attention_observations(observed_at DESC);
