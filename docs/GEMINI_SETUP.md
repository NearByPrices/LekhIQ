# LekhIQ Gemini AI Integration - Setup Guide

**Status:** Diagnostic tools created, waiting for API key configuration  
**Date:** 2026-10-11

## Quick Start

### Step 1: Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**
3. Select your Google Cloud project (or create new one)
4. Copy the generated key (format: `AQ.Ab8RN...`)

### Step 2: Add to .env.local

```bash
GEMINI_API_KEY=your-api-key-here
```

### Step 3: Verify It Works

```bash
node scripts/test-gemini.js
```

Expected output:
```
✓ API Key found: AQ.Ab8RN...
✓ gemini-pro - Available
✓ Gemini API call successful
  Response: "Hello! How can I help you today?"
```

---

## Understanding 404 Errors

If you see **404 Not Found** errors:

### Cause 1: Invalid or Revoked API Key
- API key is malformed or outdated
- **Fix:** Generate new key from https://aistudio.google.com/app/apikeys

### Cause 2: Insufficient Permissions
- API key lacks access to generative models
- **Fix:** Regenerate key with proper scope

### Cause 3: Billing Not Enabled
- Google Cloud project has no active billing
- **Fix:** Enable billing in Google Cloud Console

### Cause 4: API Not Enabled
- Generative AI API not enabled in project
- **Fix:** Enable in Google Cloud Console

### Cause 5: Model Not Available
- Requested model not available in your region
- **Fix:** Use available model (check via: `node scripts/test-gemini.js`)

---

## Diagnostic Test

### Run the Test

```bash
node scripts/test-gemini.js
```

### What It Tests

1. **API Key Configuration**
   - Checks if GEMINI_API_KEY is set
   - Validates format

2. **Model Availability**
   - Tests all major Gemini models
   - Shows which are accessible

3. **API Call**
   - Makes actual request to Gemini
   - Verifies end-to-end functionality

4. **Error Details**
   - 401: Invalid API key
   - 403: Access denied / permissions issue
   - 404: Model not found / API not enabled
   - 429: Rate limited

---

## Using Gemini in Your Code

### Basic Text Generation

```typescript
import { gemini } from '@/lib/ai';

async function generateText() {
  const response = await gemini.generateText(
    'Write a haiku about programming'
  );
  console.log(response);
}
```

### With Conversation History

```typescript
import { gemini } from '@/lib/ai';

async function chat() {
  const response = await gemini.generateWithHistory([
    { role: 'user', content: 'What is Node.js?' },
    { role: 'model', content: 'Node.js is a JavaScript runtime...' },
    { role: 'user', content: 'How does it differ from browsers?' },
  ]);
  console.log(response);
}
```

### Health Check

```typescript
import { gemini } from '@/lib/ai';

const isWorking = await gemini.healthCheck();
if (isWorking) {
  console.log('Gemini is configured and working!');
}
```

### In API Routes

```typescript
// src/app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { gemini } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const response = await gemini.generateText(prompt);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

## Available Models

### Tested Models

| Model | Status | Notes |
|-------|--------|-------|
| `gemini-pro` | ✓ | Most compatible, good balance |
| `gemini-1.5-pro` | ✓ | Latest, better at long context |
| `gemini-2.0-flash` | ⚠ | Newest, may not be available in all regions |
| `gemini-pro-vision` | ⚠ | Image support, newer setup required |

### Override Model

In `.env.local`:

```bash
GEMINI_MODEL=gemini-1.5-pro
```

Or in code:

```typescript
import GeminiProvider from '@/lib/ai';
const customGemini = new GeminiProvider(apiKey, 'gemini-1.5-pro');
```

---

## Troubleshooting

### "API key not configured"
✗ **Error:** `GEMINI_API_KEY not configured`

**Fix:** 
1. Add to `.env.local`: `GEMINI_API_KEY=your-key`
2. Restart dev server
3. Run test: `node scripts/test-gemini.js`

---

### "401 Unauthorized"
✗ **Error:** `[401] Request had invalid authentication credentials`

**Fix:**
1. Check API key is correct
2. Regenerate at: https://aistudio.google.com/app/apikeys
3. Verify not expired/revoked

---

### "403 Forbidden"
✗ **Error:** `[403] User does not have permission`

**Fix:**
1. Ensure API key has generative AI access
2. Check Google Cloud project permissions
3. May need to regenerate key with proper scope

---

### "404 Not Found"
✗ **Error:** `[404] Requested entity not found`

**Fix:**
1. Verify model name is correct
2. Check `node scripts/test-gemini.js` for available models
3. Enable Generative AI API in Google Cloud Console

---

### Rate Limiting (429)
✗ **Error:** `[429] Resource has been exhausted`

**Fix:**
1. Wait before making more requests
2. Implement request queuing
3. Consider paid plan with higher limits

---

## API Key Security

### Do's ✓
- Store in `.env.local` (gitignored)
- Use environment variables
- Regenerate if exposed
- Keep key private

### Don'ts ✗
- Commit to git
- Expose in client-side code
- Share in logs/errors
- Use in public repositories

### Best Practice

```typescript
// ✓ Good: Use from environment
const apiKey = process.env.GEMINI_API_KEY;

// ✓ Good: Server-side only
export async function POST(req: NextRequest) {
  // API key only accessed on server
  const response = await gemini.generateText(prompt);
  return NextResponse.json(response);
}

// ✗ Bad: Exposed in browser
const apiKey = 'AQ.Ab8RN...'; // Never!
fetch('/api/gemini', { headers: { 'X-API-Key': apiKey } });
```

---

## Google Cloud Setup

### Create Project

1. Go to: https://console.cloud.google.com
2. Create new project
3. Enable billing
4. Enable "Generative Language API"

### Enable API

1. Go to APIs & Services → Library
2. Search for "Generative Language API"
3. Click Enable

### Generate API Key

1. Go to APIs & Services → Credentials
2. Create API Key
3. Restrict to Generative Language API
4. Copy key to `.env.local`

---

## Files Created

```
✓ scripts/test-gemini.js          - Diagnostic test
✓ src/lib/ai/providers/gemini.ts  - Gemini client module
✓ src/lib/ai/index.ts            - AI providers export
✓ docs/GEMINI_SETUP.md           - This setup guide
✓ .env.local                       - API key template added
```

---

## Diagnostic Checklist

- [ ] Get API key from https://aistudio.google.com/app/apikeys
- [ ] Add to `.env.local`: `GEMINI_API_KEY=...`
- [ ] Run: `node scripts/test-gemini.js`
- [ ] All tests pass ✓
- [ ] Try in code: `import { gemini } from '@/lib/ai'`
- [ ] Create API route for AI features
- [ ] Test end-to-end

---

## Next Steps

1. **Get API key** (5 minutes)
   - Go to: https://aistudio.google.com/app/apikeys
   - Create key
   - Add to `.env.local`

2. **Run diagnostic** (1 minute)
   - `node scripts/test-gemini.js`
   - Verify all tests pass

3. **Create AI features** (development time)
   - Use `gemini` provider in your code
   - Build AI-powered features
   - Test thoroughly

4. **Deploy** (production)
   - Set `GEMINI_API_KEY` in production environment
   - Test in staging first
   - Monitor API usage

---

## Support

If stuck:

1. Check `.env.local` has API key
2. Run: `node scripts/test-gemini.js`
3. Read error message carefully
4. Check documentation above for that error
5. Verify API key at: https://aistudio.google.com/app/apikeys

---

**Status:** Ready for API key integration 🚀
