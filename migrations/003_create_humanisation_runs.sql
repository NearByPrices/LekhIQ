-- Migration 003: Create humanisation_runs table
-- Stores humanisation/rewrite results

CREATE TABLE IF NOT EXISTS humanisation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_document_id UUID NOT NULL REFERENCES content_documents(id) ON DELETE CASCADE,
  analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('light', 'natural', 'deep')),
  tone TEXT NOT NULL,
  original_text TEXT NOT NULL,
  rewritten_text TEXT NOT NULL,
  validation_json JSONB,
  before_score NUMERIC(4,2),
  after_score NUMERIC(4,2),
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_humanisation_runs_content_id ON humanisation_runs(content_document_id);
CREATE INDEX IF NOT EXISTS idx_humanisation_runs_analysis_id ON humanisation_runs(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_humanisation_runs_created ON humanisation_runs(created_at DESC);
