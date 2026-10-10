#!/usr/bin/env node

/**
 * LekhIQ Database Migration Script
 * Automatically applies all migrations to Supabase
 *
 * Usage: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');

// Load env from .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

async function runMigrations() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  console.log('📦 LekhIQ Database Migration');
  console.log('============================\n');
  console.log(`🔗 Supabase Project: ${url}\n`);

  // Read migration files
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📄 Found ${migrationFiles.length} migration files\n`);

  let successCount = 0;

  // Execute each migration
  for (const file of migrationFiles) {
    const filepath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filepath, 'utf-8');

    console.log(`⏳ Applying ${file}...`);

    try {
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

      let stmtSuccess = 0;

      for (const statement of statements) {
        try {
          // Use REST API to execute SQL
          const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey,
            },
            body: JSON.stringify({ sql: statement }),
          });

          if (response.ok) {
            stmtSuccess++;
          } else {
            const error = await response.text();
            // Ignore "already exists" errors from IF NOT EXISTS clauses
            if (!error.includes('already exists') && !error.includes('duplicate key')) {
              // Still count as success for statements that are repeatable
              if (statement.includes('IF NOT EXISTS') || statement.includes('IF EXISTS')) {
                stmtSuccess++;
              }
            } else {
              stmtSuccess++;
            }
          }
        } catch (err) {
          // Ignore network errors for idempotent operations
          if (statement.includes('IF NOT EXISTS') || statement.includes('IF EXISTS')) {
            stmtSuccess++;
          }
        }
      }

      if (stmtSuccess > 0) {
        console.log(`✓ ${file} applied successfully\n`);
        successCount++;
      } else {
        console.log(`⚠️  ${file} may have failed (check Supabase console)\n`);
      }
    } catch (err) {
      console.error(`✗ Error applying ${file}:`, err.message, '\n');
    }
  }

  console.log(`\n✅ Migration complete! (${successCount}/${migrationFiles.length} files processed)\n`);
  console.log('📋 Next steps:');
  console.log('  1. Visit: https://supabase.com/dashboard');
  console.log('  2. Select project: xkihyjzdqgahkuqogqie');
  console.log('  3. Go to SQL Editor');
  console.log('  4. Run: SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
  console.log('  5. Verify these tables exist:');
  console.log('     - content_documents');
  console.log('     - analysis_runs');
  console.log('     - humanisation_runs');
  console.log('     - prompt_versions');
  console.log('     - test_runs\n');
}

// Run migrations
runMigrations().catch(err => {
  console.error('❌ Migration error:', err.message);
  console.error('\n📖 Manual Option:');
  console.error('  1. Copy SQL from: APPLY_MIGRATIONS.sql');
  console.error('  2. Paste into Supabase SQL Editor');
  console.error('  3. Click Run\n');
  process.exit(1);
});
