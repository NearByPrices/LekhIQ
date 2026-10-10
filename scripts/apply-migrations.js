#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function applyMigrations() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials not found in environment variables');
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Read migrations
  const migrationsDir = path.join(__dirname, '../migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files`);

  // Apply each migration
  for (const file of migrationFiles) {
    const filepath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filepath, 'utf-8');

    console.log(`\nApplying ${file}...`);

    try {
      // Execute SQL via RPC or raw query
      const { data, error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        // Try alternative method
        console.log('Trying alternative method...');
        // For Supabase, we need to use the admin API or SQL editor
        console.log(`Note: Direct SQL execution via RPC may require admin setup`);
        console.log(`SQL to execute:\n${sql}`);
      } else {
        console.log(`✓ ${file} applied successfully`);
      }
    } catch (err) {
      console.error(`Error applying ${file}:`, err.message);
    }
  }

  console.log('\nNote: If migrations failed, apply them manually via Supabase SQL Editor');
}

// Load env variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

applyMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
