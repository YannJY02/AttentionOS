-- Migration: 0001_create_entities.sql
-- Phase 1 entities table with indexes and full-text search

-- ── Entities table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS entities (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     TEXT        NOT NULL
                              CHECK (entity_type IN ('task','note','meeting','habit','reflection','contact','event')),
  hierarchy_layer INT         CHECK (hierarchy_layer BETWEEN 1 AND 5),
  title           TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  content         TEXT,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','completed','archived','cancelled')),
  properties      JSONB       NOT NULL DEFAULT '{}',
  workflow_stage  TEXT        CHECK (workflow_stage IN ('ritual','overview','execution')),
  parent_id       UUID        REFERENCES entities(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_entities_type        ON entities(entity_type);
CREATE INDEX idx_entities_hierarchy   ON entities(hierarchy_layer) WHERE hierarchy_layer IS NOT NULL;
CREATE INDEX idx_entities_status      ON entities(status);
CREATE INDEX idx_entities_parent      ON entities(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_entities_workflow    ON entities(workflow_stage) WHERE workflow_stage IS NOT NULL;
CREATE INDEX idx_entities_created_at  ON entities(created_at DESC);

-- ── Full-text search (generated column) ─────────────────────────────────────

ALTER TABLE entities
  ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(title, '') || ' ' || coalesce(content, '')
    )
  ) STORED;

CREATE INDEX idx_entities_fts ON entities USING gin(fts);

-- ── Auto-update updated_at ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
