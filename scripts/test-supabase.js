#!/usr/bin/env node

/**
 * Minimal Supabase Connectivity Test
 * Tests: DNS, client init, read, write, delete
 *
 * Usage: node scripts/test-supabase.js
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

// Load environment
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  console.error(`   URL: ${url ? '✓' : '✗'}`);
  console.error(`   ANON_KEY: ${anonKey ? '✓' : '✗'}`);
  console.error(`   SERVICE_ROLE_KEY: ${serviceKey ? '✓' : '✗'}`);
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

console.log('📦 Testing Supabase Connectivity');
console.log(`🔗 URL: ${url}`);
console.log(`🔑 Keys: ${anonKey ? 'anon' : 'missing'}, ${serviceKey ? 'service-role' : 'missing'}`);
console.log('');

(async () => {
  // Step 1: DNS/Network test
  console.log('Step 1: DNS Resolution...');
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const ips = await dns.resolve4(hostname);
    console.log(`✅ DNS resolved ${hostname} to ${ips[0]}`);
  } catch (error) {
    console.log(`❌ DNS Failed: ${error.message}`);
    console.log('   This is a network/environment issue');
    process.exit(1);
  }

  console.log('');
  console.log('Step 2: Client Initialization...');
  try {
    // Use service role key for server-side operations
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    console.log('✅ Client initialized');

    // Step 3: Simple read test
    console.log('');
    console.log('Step 3: Test Query (SELECT from content_documents)...');
    const { data, error: readError } = await supabase
      .from('content_documents')
      .select('id')
      .limit(1);

    if (readError) {
      console.log(`❌ Read failed: ${readError.message}`);
      console.log(`   Code: ${readError.code}`);
      if (readError.message.includes('does not exist')) {
        console.log('   Issue: Table does not exist (migration not applied?)');
      } else if (readError.message.includes('permission')) {
        console.log('   Issue: RLS policy blocks read');
      }
      process.exit(1);
    } else {
      console.log(`✅ Read successful (found ${data?.length || 0} records)`);
    }

    // Step 4: Test write
    console.log('');
    console.log('Step 4: Test Write (INSERT test record)...');
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('content_documents')
      .insert([{
        source_type: 'paste',
        title: 'TEST_RECORD_' + testId,
        raw_text: 'test content',
        clean_text: 'test content',
        word_count: 2,
        character_count: 12,
      }])
      .select('id')
      .single();

    if (insertError) {
      console.log(`❌ Insert failed: ${insertError.message}`);
      console.log(`   Code: ${insertError.code}`);
      if (insertError.message.includes('permission')) {
        console.log('   Issue: RLS policy blocks write');
      } else if (insertError.message.includes('column')) {
        console.log('   Issue: Schema mismatch (column does not exist)');
      }
      process.exit(1);
    } else {
      console.log(`✅ Insert successful (ID: ${insertData.id})`);

      // Step 5: Verify write
      console.log('');
      console.log('Step 5: Verify Written Record...');
      const { data: verifyData, error: verifyError } = await supabase
        .from('content_documents')
        .select('id, title')
        .eq('id', insertData.id)
        .single();

      if (verifyError) {
        console.log(`❌ Verify failed: ${verifyError.message}`);
        process.exit(1);
      } else {
        console.log(`✅ Verified: ${verifyData.title}`);

        // Step 6: Clean up
        console.log('');
        console.log('Step 6: Cleanup (DELETE test record)...');
        const { error: deleteError } = await supabase
          .from('content_documents')
          .delete()
          .eq('id', insertData.id);

        if (deleteError) {
          console.log(`⚠️  Delete failed: ${deleteError.message}`);
          console.log('   (test record may remain in database)');
        } else {
          console.log('✅ Cleanup successful');
        }
      }
    }

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    if (error.message.includes('fetch')) {
      console.log('   Issue: Network/fetch error (environment issue)');
    }
    process.exit(1);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SUPABASE CONNECTIVITY: WORKING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
})();
