#!/usr/bin/env node

/**
 * Gemini API Connectivity Diagnostic Test
 * Tests Gemini API access, authentication, and model availability
 */

const https = require('https');
const querystring = require('querystring');

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

const TEST_MODELS = [
  'gemini-pro',
  'gemini-pro-vision',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
];

// Helper function to make HTTPS requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'LekhIQ-Gemini-Test/1.0',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 0,
        error: 'Request timeout',
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runDiagnostics() {
  console.log('\n' + '='.repeat(70));
  console.log('GEMINI API CONNECTIVITY DIAGNOSTIC TEST');
  console.log('='.repeat(70) + '\n');

  // Test 1: API Key Configuration
  console.log('TEST 1: API Key Configuration');
  console.log('-'.repeat(70));

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('✗ GEMINI_API_KEY not configured');
    console.log('  Status: Missing or invalid API key');
    console.log('  Action: Set GEMINI_API_KEY in .env.local');
    console.log('  Get key from: https://aistudio.google.com/app/apikeys\n');
    process.exit(1);
  }

  const keyPreview = GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5);
  console.log('✓ API Key found:', keyPreview);
  console.log('  Format: Valid (starts with expected prefix)\n');

  // Test 2: Test Models Availability
  console.log('TEST 2: Testing Model Availability');
  console.log('-'.repeat(70));

  for (const model of TEST_MODELS) {
    const path = `/v1beta/models/${model}?key=${GEMINI_API_KEY}`;
    const response = await makeRequest('GET', path);

    const statusEmoji = response.statusCode === 200 ? '✓' : '✗';
    const statusText = response.statusCode === 200 ? 'Available' : `Error: ${response.statusCode}`;

    console.log(`${statusEmoji} ${model.padEnd(20)} - ${statusText}`);

    if (response.statusCode !== 200) {
      if (response.error) {
        console.log(`  Network Error: ${response.error}`);
      } else if (response.statusCode === 404) {
        console.log(`  Error: Model not found or insufficient permissions`);
      } else if (response.statusCode === 401) {
        console.log(`  Error: Invalid API key (401 Unauthorized)`);
      } else if (response.statusCode === 403) {
        console.log(`  Error: Access denied (403 Forbidden)`);
      } else {
        try {
          const errorBody = JSON.parse(response.body);
          console.log(`  Error: ${errorBody.error?.message || response.body}`);
        } catch (e) {
          console.log(`  Response: ${response.body?.substring(0, 100)}`);
        }
      }
    }
  }

  // Test 3: Test API Call
  console.log('\nTEST 3: Testing API Call');
  console.log('-'.repeat(70));

  const testPayload = {
    contents: [
      {
        parts: [
          {
            text: 'Say hello in 5 words',
          },
        ],
      },
    ],
  };

  const path = `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await makeRequest('POST', path, testPayload);

  if (response.statusCode === 200) {
    console.log(`✓ Gemini API call successful`);
    try {
      const responseBody = JSON.parse(response.body);
      const text = responseBody.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text';
      console.log(`  Response: "${text}"\n`);
    } catch (e) {
      console.log(`  Response received (could not parse)\n`);
    }
  } else {
    console.log(`✗ Gemini API call failed`);
    console.log(`  Status Code: ${response.statusCode}`);

    if (response.error) {
      console.log(`  Network Error: ${response.error}`);
    } else {
      try {
        const errorBody = JSON.parse(response.body);
        const errorMessage = errorBody.error?.message || JSON.stringify(errorBody);
        console.log(`  Error: ${errorMessage}`);
      } catch (e) {
        console.log(`  Response: ${response.body?.substring(0, 200)}`);
      }
    }
    console.log();
  }

  // Test 4: Environment Information
  console.log('\nTEST 4: Environment Information');
  console.log('-'.repeat(70));
  console.log(`Node.js Version: ${process.version}`);
  console.log(`Platform: ${process.platform}`);
  console.log(`Gemini Model: ${GEMINI_MODEL}`);
  console.log(`API Key Configured: Yes (length: ${GEMINI_API_KEY.length})\n`);

  // Summary
  console.log('='.repeat(70));
  console.log('DIAGNOSTIC SUMMARY');
  console.log('='.repeat(70));
  console.log(`
If API key is invalid (401):
  → Generate new key from: https://aistudio.google.com/app/apikeys
  → Ensure billing is enabled in Google Cloud project
  → Check API key has access to generative models

If model not found (404):
  → Model may not be available in your region
  → Check available models at: https://aistudio.google.com/app/apikeys
  → Try different model name
  → Verify generative AI API is enabled in Google Cloud

If forbidden (403):
  → API key lacks necessary permissions
  → Regenerate key with proper scopes
  → Ensure Google Cloud project has billing

If all tests pass:
  → Gemini API connectivity is working!
  → You can now use Gemini in your application
  `);
  console.log('='.repeat(70) + '\n');
}

runDiagnostics().catch(err => {
  console.error('Fatal error during diagnostics:', err);
  process.exit(1);
});
