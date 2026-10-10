#!/usr/bin/env node

/**
 * Minimal Gemini Connectivity Test
 * Tests current API key and model availability
 *
 * Usage: node scripts/test-gemini.js
 */

const fs = require('fs');
const path = require('path');

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

const apiKey = env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

// SDK info
const { GoogleGenerativeAI } = require('@google/generative-ai');
console.log('📦 Gemini SDK: @google/generative-ai');
console.log(`🔐 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(-5)}`);
console.log('');

// Test models in order of preference
const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

(async () => {
  const client = new GoogleGenerativeAI(apiKey);

  for (const modelName of modelsToTest) {
    process.stdout.write(`Testing ${modelName}... `);

    try {
      const model = client.getGenerativeModel({ model: modelName });
      const response = await model.generateContent('Return exactly: OK');
      const text = response.response.text();

      if (text.includes('OK')) {
        console.log('✅ WORKS');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ RECOMMENDED MODEL: ${modelName}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('Update .env.local:');
        console.log(`  GEMINI_ANALYSIS_MODEL=${modelName}`);
        console.log(`  GEMINI_REWRITE_MODEL=${modelName}`);
        console.log('');
        process.exit(0);
      } else {
        console.log('⚠️  Unexpected response: ' + text.substring(0, 30));
      }
    } catch (error) {
      const msg = error?.message || String(error);

      // Categorize error
      if (msg.includes('404')) {
        console.log('❌ 404 Not Found');
      } else if (msg.includes('permission') || msg.includes('PERMISSION')) {
        console.log('❌ Permission Denied');
      } else if (msg.includes('authenticate') || msg.includes('invalid')) {
        console.log('❌ Authentication Failed');
      } else if (msg.includes('quota')) {
        console.log('❌ Quota Exceeded');
      } else {
        console.log(`❌ ${msg.substring(0, 40)}`);
      }
    }
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ NO WORKING MODELS FOUND');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Possible causes:');
  console.log('1. API key is invalid or expired');
  console.log('2. API key does not have generative model access');
  console.log('3. Account has no active billing');
  console.log('4. Project is restricted to specific models');
  console.log('5. API access is disabled');
  console.log('');
  console.log('Action required:');
  console.log('- Verify API key in Google Cloud Console');
  console.log('- Confirm generative AI API is enabled');
  console.log('- Check project quotas and billing');
  console.log('- Review API access permissions');
  console.log('');
  process.exit(1);
})();
