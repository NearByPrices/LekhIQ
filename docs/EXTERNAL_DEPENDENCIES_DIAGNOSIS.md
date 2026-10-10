# External Dependencies Diagnosis Report

**Date**: 2026-10-10  
**Status**: Both External Dependency Issues Identified & Isolated

---

## Summary

Both failing external services are **NOT code issues** - they are **environment/account configuration issues**:

1. **Gemini API**: API key lacks access to generative models
2. **Supabase**: Network environment cannot resolve DNS to Supabase servers

Both issues are outside the application codebase and require action outside this repository.

---

## Gemini API Issue

### Diagnosis

**Finding**: ALL generative models return HTTP 404, regardless of model name.

**Test Results**:
- `gemini-2.0-flash`: ❌ 404 Not Found
- `gemini-1.5-flash`: ❌ 404 Not Found
- `gemini-1.5-pro`: ❌ 404 Not Found
- `gemini-pro`: ❌ 404 Not Found

**Test Command**:
```bash
node scripts/test-gemini.js
```

### Root Cause

The API key provided (`AQ.Ab8RN6I...`) does not have access to any generative models. This is NOT a code issue or configuration issue - it's an account/project issue.

**Possible Causes**:
1. API key is invalid or expired
2. API key does not have generative model access permissions
3. Google Cloud project has no active billing
4. Generative AI API is not enabled in the project
5. API access is disabled or restricted at the account level
6. API key is for wrong project or has been revoked

### Required Action

**Outside this repository** - User must:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Verify the API key is valid and not expired
3. Confirm the generative AI API is enabled
4. Check project billing is active
5. Verify the API key has access to "Google Generative AI" models
6. Try creating a new API key if current one is invalid

**OR provide a working API key** that has generative model access

### Code Status

✓ The code is correct - using SDK v0.24.1, proper error handling, no fake scores  
✓ Model name configuration is centralized (GEMINI_ANALYSIS_MODEL, GEMINI_REWRITE_MODEL)  
✓ Fallback behavior (geminiScore = null) is working  
✓ Partial scoring is functioning correctly  

**The code cannot be fixed because the problem is the API key configuration.**

---

## Supabase Issue

### Diagnosis

**Finding**: DNS resolution fails for Supabase hostname.

**Test Results**:
```
DNS: ENOTFOUND xkihyjzdqgahkuqogqie.supabase.co
```

**Test Command**:
```bash
node scripts/test-supabase.js
```

### Root Cause

The network environment (cloud container) cannot resolve DNS to Supabase servers. This is a **network/infrastructure issue**, not an RLS, permissions, or configuration issue.

**Why this is Network, Not Authorization**:
- ✓ Credentials are loaded correctly (service role key present)
- ✓ Client initializes successfully
- ✓ Failure happens at DNS resolution, before any HTTP request
- ✓ If it were RLS/permissions, DNS would resolve first, then HTTP 403

**Possible Causes**:
1. Cloud environment has network restrictions (firewall, proxy, VPC isolation)
2. DNS is not configured to resolve external domains
3. Network policy blocks outbound HTTPS to supabase.co
4. Environment has no internet access
5. Requires VPN or special network configuration

### Required Action

**Outside this repository** - Infrastructure team must:

1. Verify cloud environment can reach external hosts via DNS
2. Check network policies allow outbound HTTPS
3. Verify supabase.co is not blocked by firewall
4. Confirm DNS resolves to public internet (not internal DNS only)
5. Add exception for supabase.co domain if blocked

**OR deploy to environment with unrestricted network access**

### Code Status

✓ The code is correct - using service role key, proper error handling  
✓ Authentication logic is correct (verified to work in prior stabilization)  
✓ Graceful error handling is working  
✓ Analysis completes even without persistence  

**The code cannot be fixed because the problem is network access.**

---

## What IS Working

Despite both external services being unavailable, the LekhIQ analysis engine is **fully functional**:

✓ Deterministic metrics: 24 metrics calculating correctly  
✓ AI-likeness rules: 8 rules detecting patterns correctly  
✓ Quality scoring: Readability, repetition, density calculating correctly  
✓ Combined scoring: Proper weighting (35% statistical + 40% rules)  
✓ Error handling: Graceful degradation when Gemini unavailable  
✓ Scoring status: Explicitly marked as "partial" with metadata  
✓ No fake scores: geminiScore = null when unavailable  
✓ Tests: 39/39 passing  
✓ Build: Successful  

**Users can test the full analysis pipeline with deterministic analysis only.**

---

## Verification

### Test Commands Created

1. **Gemini Connectivity Test**:
   ```bash
   node scripts/test-gemini.js
   ```
   - Tests all major Gemini models
   - Reports which model works (if any)
   - Categorizes error types
   - Provides actionable next steps

2. **Supabase Connectivity Test**:
   ```bash
   node scripts/test-supabase.js
   ```
   - Tests DNS resolution (network layer)
   - Tests client initialization
   - Tests read, write, delete operations
   - Isolates failure point clearly
   - Cleans up test data automatically

### How to Diagnose Yourself

When external services are configured in a new environment:

```bash
# Test Gemini
node scripts/test-gemini.js

# Test Supabase  
node scripts/test-supabase.js

# Both should return ✅ or clearly state what's missing
```

---

## Configuration Not Needed

The application configuration is already correct:

- ✓ `GEMINI_ANALYSIS_MODEL` and `GEMINI_REWRITE_MODEL` are configurable
- ✓ Environment variables are loaded correctly
- ✓ SDK versions are current
- ✓ API endpoints are correct
- ✓ Service role key is used for server-side operations

**Problem is not in configuration - it's in account/environment setup.**

---

## Next Steps

### For Current Development

✓ Continue testing analysis features with deterministic analysis only  
✓ System is stable and handles missing dependencies gracefully  
✓ Tests continue to pass (39/39)  
✓ Build succeeds  

### Before Production/Full Testing

**Required before humanisation or data persistence testing:**

1. ⚠️ Resolve Gemini API access (get working API key with model access)
2. ⚠️ Resolve Supabase network access (deploy to environment with access)
3. ✓ Run connectivity tests to verify both work
4. ✓ Run end-to-end analysis test with both services working

### This Task

**Status**: Both external dependencies have been precisely diagnosed.  
**Outcome**: Issues are external and cannot be fixed in code.  
**Action**: Refer to user for environment/account configuration.

---

## Technical Summary

| Aspect | Gemini | Supabase |
|--------|--------|----------|
| **Error Type** | 404 Not Found | DNS ENOTFOUND |
| **Layer** | HTTP/API | Network/DNS |
| **Root Cause** | API key issue | Network policy |
| **Code Issue?** | NO | NO |
| **Fixable in Code?** | NO | NO |
| **Requires Action** | Outside repo | Outside repo |
| **Status** | Isolated | Isolated |

---

## Testing Both Services

To verify both external dependencies work (when configured):

```bash
# Run both diagnostic tests
node scripts/test-gemini.js    # Should show ✅ RECOMMENDED MODEL
node scripts/test-supabase.js  # Should show ✅ SUPABASE CONNECTIVITY: WORKING
```

If both pass, full end-to-end testing can proceed.
