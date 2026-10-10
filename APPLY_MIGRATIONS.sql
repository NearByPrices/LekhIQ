-- LekhIQ Database Migrations
-- Apply all SQL statements below to your Supabase database
-- Use Supabase SQL Editor: https://supabase.com/dashboard -> SQL Editor

-- ============================================
-- Migration 001: Create content_documents table
-- ============================================
CREATE TABLE IF NOT EXISTS content_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('paste', 'url', 'file')),
  source_url TEXT,
  title TEXT,
  raw_text TEXT NOT NULL,
  clean_text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  character_count INTEGER NOT NULL,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_documents_created ON content_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_documents_source_type ON content_documents(source_type);

-- ============================================
-- Migration 002: Create analysis_runs table
-- ============================================
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

-- ============================================
-- Migration 003: Create humanisation_runs table
-- ============================================
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

-- ============================================
-- Migration 004: Create supporting tables
-- ============================================
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,
  version TEXT NOT NULL,
  prompt_text_or_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_name, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_name_version ON prompt_versions(prompt_name, version);

CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_reference TEXT NOT NULL,
  output_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_runs_name ON test_runs(test_name);
CREATE INDEX IF NOT EXISTS idx_test_runs_created ON test_runs(created_at DESC);

-- ============================================
-- Verify migrations
-- ============================================
-- Run this to verify all tables were created:
-- \dt
