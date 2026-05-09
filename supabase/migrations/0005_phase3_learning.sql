-- Migration: 0005_phase3_learning.sql
-- Phase 3: evolutionary learning and workflow optimization suggestions

ALTER TABLE ai_suggestions
  DROP CONSTRAINT IF EXISTS ai_suggestions_kind_check;

ALTER TABLE ai_suggestions
  ADD CONSTRAINT ai_suggestions_kind_check
  CHECK (kind IN (
    'task_decomposition',
    'context_link',
    'workflow_transition',
    'workflow_optimization'
  ));

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_workflow_optimization_pending
  ON ai_suggestions(updated_at DESC)
  WHERE kind = 'workflow_optimization' AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_attention_observations_window
  ON attention_observations(observed_at DESC, state);
