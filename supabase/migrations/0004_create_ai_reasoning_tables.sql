-- Migration: 0004_create_ai_reasoning_tables.sql
-- Phase 2: AI reasoning, prompt templates, RAG embeddings, HITL suggestions

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Privacy helpers ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION privacy_level_rank(level TEXT)
RETURNS INT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE level
    WHEN 'L0' THEN 0
    WHEN 'L1' THEN 1
    WHEN 'L2' THEN 2
    WHEN 'L3' THEN 3
    ELSE 99
  END
$$;

-- ── Prompt templates ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prompt_templates (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key               TEXT        NOT NULL CHECK (char_length(key) BETWEEN 1 AND 120),
  version           TEXT        NOT NULL CHECK (char_length(version) BETWEEN 1 AND 80),
  description       TEXT,
  template          TEXT        NOT NULL CHECK (char_length(template) > 0),
  variables         TEXT[]      NOT NULL DEFAULT '{}',
  max_privacy_level TEXT        NOT NULL DEFAULT 'L1'
                                    CHECK (max_privacy_level IN ('L0','L1','L2','L3')),
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_prompt_templates_key_version UNIQUE (key, version)
);

CREATE INDEX idx_prompt_templates_key ON prompt_templates(key);
CREATE UNIQUE INDEX uq_prompt_templates_active_key
  ON prompt_templates(key)
  WHERE is_active;

CREATE TRIGGER trg_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Embeddings / RAG ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS embeddings (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id        UUID        REFERENCES entities(id) ON DELETE CASCADE,
  content_hash     TEXT        NOT NULL CHECK (char_length(content_hash) BETWEEN 1 AND 128),
  content          TEXT        NOT NULL CHECK (char_length(content) > 0),
  embedding        vector(1536) NOT NULL,
  metadata         JSONB       NOT NULL DEFAULT '{}',
  model_id         TEXT        NOT NULL CHECK (char_length(model_id) BETWEEN 1 AND 120),
  model_version    TEXT        NOT NULL CHECK (char_length(model_version) BETWEEN 1 AND 120),
  model_dimensions INT         NOT NULL DEFAULT 1536 CHECK (model_dimensions > 0),
  privacy_level    TEXT        NOT NULL DEFAULT 'L1'
                                  CHECK (privacy_level IN ('L0','L1','L2','L3')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_embeddings_content_model UNIQUE (content_hash, model_id, model_version)
);

CREATE INDEX idx_embeddings_entity ON embeddings(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_embeddings_model ON embeddings(model_id, model_version);
CREATE INDEX idx_embeddings_privacy ON embeddings(privacy_level);
CREATE INDEX idx_embeddings_vector_cosine
  ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TRIGGER trg_embeddings_updated_at
  BEFORE UPDATE ON embeddings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5,
  max_privacy_level TEXT DEFAULT 'L1',
  query_model_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  entity_id UUID,
  content TEXT,
  metadata JSONB,
  model_id TEXT,
  model_version TEXT,
  model_dimensions INT,
  privacy_level TEXT,
  similarity FLOAT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql STABLE AS $$
  SELECT
    embeddings.id,
    embeddings.entity_id,
    embeddings.content,
    embeddings.metadata,
    embeddings.model_id,
    embeddings.model_version,
    embeddings.model_dimensions,
    embeddings.privacy_level,
    1 - (embeddings.embedding <=> query_embedding) AS similarity,
    embeddings.created_at,
    embeddings.updated_at
  FROM embeddings
  WHERE (query_model_id IS NULL OR embeddings.model_id = query_model_id)
    AND embeddings.privacy_level <> 'L3'
    AND privacy_level_rank(embeddings.privacy_level) <= privacy_level_rank(max_privacy_level)
    AND 1 - (embeddings.embedding <=> query_embedding) >= match_threshold
  ORDER BY embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── HITL suggestions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_suggestions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  kind              TEXT        NOT NULL
                                    CHECK (kind IN ('task_decomposition','context_link','workflow_transition')),
  status            TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending','approved','rejected','applied')),
  target_id         UUID        REFERENCES entities(id) ON DELETE SET NULL,
  title             TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  rationale         TEXT        NOT NULL DEFAULT '',
  payload           JSONB       NOT NULL DEFAULT '{}',
  context           JSONB       NOT NULL DEFAULT '[]',
  created_by        TEXT        NOT NULL CHECK (char_length(created_by) BETWEEN 1 AND 100),
  model_id          TEXT,
  model_version     TEXT,
  approval_required BOOLEAN     NOT NULL DEFAULT true,
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_kind ON ai_suggestions(kind);
CREATE INDEX idx_ai_suggestions_target ON ai_suggestions(target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_ai_suggestions_created_at ON ai_suggestions(created_at DESC);

CREATE TRIGGER trg_ai_suggestions_updated_at
  BEFORE UPDATE ON ai_suggestions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Agent tool-call audit boundary ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_tool_calls (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name         TEXT        NOT NULL CHECK (char_length(tool_name) BETWEEN 1 AND 120),
  input             JSONB       NOT NULL DEFAULT '{}',
  privacy_level     TEXT        NOT NULL DEFAULT 'L1'
                                    CHECK (privacy_level IN ('L0','L1','L2','L3')),
  approval_required BOOLEAN     NOT NULL DEFAULT true,
  status            TEXT        NOT NULL DEFAULT 'requested'
                                    CHECK (status IN ('requested','approved','rejected','executed','failed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_tool_calls_tool ON agent_tool_calls(tool_name);
CREATE INDEX idx_agent_tool_calls_status ON agent_tool_calls(status);
CREATE INDEX idx_agent_tool_calls_created_at ON agent_tool_calls(created_at DESC);

-- ── RLS: same Phase 1 single-user policy, tightened later in Phase 4 ─────────

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "phase2_prompt_templates_all"
  ON prompt_templates FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase2_embeddings_all"
  ON embeddings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase2_ai_suggestions_all"
  ON ai_suggestions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "phase2_agent_tool_calls_all"
  ON agent_tool_calls FOR ALL
  USING (true)
  WITH CHECK (true);
