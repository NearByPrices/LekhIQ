# LekhIQ - Database Schema

**Status**: Schema design phase (migrations not yet created)
**Provider**: Supabase PostgreSQL

## Tables

### content_documents
Stores source documents for analysis.

```sql
CREATE TABLE content_documents (
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
```

### analysis_runs
Stores analysis results for each document.

```sql
CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_document_id UUID NOT NULL REFERENCES content_documents(id),
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
```

### humanisation_runs
Stores humanisation/rewrite results.

```sql
CREATE TABLE humanisation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_document_id UUID NOT NULL REFERENCES content_documents(id),
  analysis_run_id UUID REFERENCES analysis_runs(id),
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
```

### prompt_versions
Stores versions of prompts for reproducibility.

```sql
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_name TEXT NOT NULL,
  version TEXT NOT NULL,
  prompt_text_or_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_name, version)
);
```

### test_runs
Stores results of internal testing.

```sql
CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_reference TEXT NOT NULL,
  output_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Indexes
(To be created for performance)

```sql
CREATE INDEX idx_analysis_runs_content_id ON analysis_runs(content_document_id);
CREATE INDEX idx_humanisation_runs_content_id ON humanisation_runs(content_document_id);
CREATE INDEX idx_content_documents_created ON content_documents(created_at DESC);
CREATE INDEX idx_analysis_runs_created ON analysis_runs(created_at DESC);
```

## Migration Strategy
1. Use SQL migration files (stored in repo)
2. Manual application via Supabase dashboard during development
3. Document each schema change in CHANGELOG.md
