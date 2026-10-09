-- Migration 001: Create content_documents table
-- Stores source documents for analysis

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
