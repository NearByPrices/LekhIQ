# LekhIQ Database Migration Guide

## Overview

LekhIQ uses Supabase PostgreSQL as its database. The migrations create 5 tables to store:
- Content documents (original text for analysis)
- Analysis results (scores, metrics, signals)
- Humanisation results (rewritten text, validation)
- Prompt versions (for reproducibility)
- Test runs (internal testing data)

## Migration Files

Located in `/migrations/`:

1. **001_create_content_documents.sql** - Main table for storing content
2. **002_create_analysis_runs.sql** - Analysis results and scores
3. **003_create_humanisation_runs.sql** - Rewritten content and validation
4. **004_create_supporting_tables.sql** - Prompts and test runs

## How to Apply Migrations

### Option 1: Supabase Web Console (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project (`xkihyjzdqgahkuqogqie`)
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Copy-paste the contents of each migration file in order:
   - First: `001_create_content_documents.sql`
   - Then: `002_create_analysis_runs.sql`
   - Then: `003_create_humanisation_runs.sql`
   - Finally: `004_create_supporting_tables.sql`
6. Click **Run** after each file
7. Verify success (no error messages)

### Option 2: psql Command Line

```bash
cd /home/user/LekhIQ
source .env.local

# Apply all migrations
psql "$DATABASE_URL" < migrations/001_create_content_documents.sql
psql "$DATABASE_URL" < migrations/002_create_analysis_runs.sql
psql "$DATABASE_URL" < migrations/003_create_humanisation_runs.sql
psql "$DATABASE_URL" < migrations/004_create_supporting_tables.sql
```

### Option 3: Single psql Command

```bash
cd /home/user/LekhIQ
source .env.local

cat migrations/*.sql | psql "$DATABASE_URL"
```

## Verify Migrations

After applying, verify tables were created:

```bash
source .env.local
psql "$DATABASE_URL" -c "\dt"
```

Expected output should show:
- content_documents
- analysis_runs
- humanisation_runs
- prompt_versions
- test_runs

## Table Schemas

### content_documents
```
- id: UUID (primary key)
- source_type: 'paste' | 'url' | 'file'
- source_url: TEXT (optional)
- title: TEXT (optional)
- raw_text: TEXT (original)
- clean_text: TEXT (normalised)
- word_count: INTEGER
- character_count: INTEGER
- metadata_json: JSONB
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### analysis_runs
```
- id: UUID (primary key)
- content_document_id: UUID (foreign key)
- scoring_version: TEXT
- statistical_score: NUMERIC(4,2)
- rule_score: NUMERIC(4,2)
- gemini_score: NUMERIC(4,2)
- final_ai_likeness_score: NUMERIC(4,2)
- content_quality_score: NUMERIC(4,2)
- readability_score: NUMERIC(4,2)
- repetition_score: NUMERIC(4,2)
- information_density_score: NUMERIC(4,2)
- result_json: JSONB
- model_name: TEXT
- prompt_version: TEXT
- created_at: TIMESTAMPTZ
```

### humanisation_runs
```
- id: UUID (primary key)
- content_document_id: UUID (foreign key)
- analysis_run_id: UUID (foreign key, optional)
- mode: 'light' | 'natural' | 'deep'
- tone: TEXT
- original_text: TEXT
- rewritten_text: TEXT
- validation_json: JSONB
- before_score: NUMERIC(4,2)
- after_score: NUMERIC(4,2)
- model_name: TEXT
- prompt_version: TEXT
- created_at: TIMESTAMPTZ
```

### prompt_versions
```
- id: UUID (primary key)
- prompt_name: TEXT
- version: TEXT
- prompt_text_or_reference: TEXT
- created_at: TIMESTAMPTZ
- UNIQUE(prompt_name, version)
```

### test_runs
```
- id: UUID (primary key)
- test_name: TEXT
- model_name: TEXT
- prompt_version: TEXT
- input_reference: TEXT
- output_json: JSONB
- created_at: TIMESTAMPTZ
```

## Troubleshooting

### Connection Error
- Verify DATABASE_URL in .env.local
- Check Supabase project is active
- Verify IP is whitelisted (usually automatic for Supabase)

### Table Already Exists
- Migrations use `CREATE TABLE IF NOT EXISTS`
- Safe to re-run migrations multiple times
- Existing data will not be affected

### Index Already Exists
- Migrations use `CREATE INDEX IF NOT EXISTS`
- Safe to re-apply

### Permission Denied
- Use service role key (SUPABASE_SERVICE_ROLE_KEY)
- Ensure key has proper permissions in Supabase project

## Next Steps After Migrations

1. Test database connection from application:
   ```bash
   npm run dev
   # API calls should work
   ```

2. Implement save functionality in API:
   - Update `/api/analyse` to save results
   - Save content_documents
   - Save analysis_runs

3. Implement history page:
   - Query content_documents
   - Query analysis_runs
   - Display results

4. Implement humanisation:
   - Save humanisation_runs
   - Track before/after scores

## Rollback (if needed)

```bash
source .env.local
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS test_runs CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS prompt_versions CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS humanisation_runs CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS analysis_runs CASCADE;"
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS content_documents CASCADE;"
```

**Warning**: This will delete all data. Use only for development/testing.
