-- Migration 004: Create prompt_versions and test_runs tables

-- Store versions of prompts for reproducibility
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,
  version TEXT NOT NULL,
  prompt_text_or_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_name, version)
);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_name_version ON prompt_versions(prompt_name, version);

-- Store results of internal testing
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
