-- Migration 002: Create analysis_runs table
-- Stores analysis results for each document

CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_document_id UUID NOT NULL REFERENCES content_documents(id) ON DELETE CASCADE,
  scoring_version TEXT NOT NULL,
  statistical_score NUMERIC(4,2),
  rule_score NUMERIC(4,2),
  gemini_score NUMERIC(4,2),
  final_ai_likeness_score NUMERIC(4,2) NOT NULL,
  content_quality_score NUMERIC(4,2),
  readability_score NUMERIC(4,2),
  repetition_score NUMERIC(4,2),
  information_density_score NUMERIC(4,2),
  result_json JSONB NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_content_id ON analysis_runs(content_document_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_created ON analysis_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_ai_likeness ON analysis_runs(final_ai_likeness_score DESC);
