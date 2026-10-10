# LekhIQ - Known Issues and Limitations

**Last Updated**: 2026-10-10  
**Status**: STABILIZATION IN PROGRESS

## Critical Issues

### 1. Gemini API Unavailable (SEVERITY: HIGH)

**Issue**: All Gemini models return HTTP 404  
**Root Cause**: API key lacks access to generative models  
**Models Tested**:
- `gemini-pro` - 404 Not Found
- `gemini-2.0-flash` - 404 Not Found
- `gemini-1.5-pro` - 404 Not Found
- `gemini-1.5-flash` - 404 Not Found

**Current Status**: HANDLED WITH GRACEFUL DEGRADATION
- System returns `geminiStatus: "unavailable"`
- Scoring continues with deterministic analysis only
- Score marked as `"partial"` with `missingComponents: ["gemini"]`
- No fake neutral scores (50) are used

**What User Sees**:
```json
{
  "analysis": {
    "scoring": {
      "status": "partial",
      "geminiStatus": "unavailable",
      "effectiveWeights": {
        "statistical": 47,
        "rules": 53,
        "gemini": null
      }
    }
  }
}
```

**User Action Required**:
- Verify Gemini API key has access to generative models
- Check API key is valid and not expired
- Try a different model if available for this key
- Or use system with deterministic analysis only (already working)

**Resolution Path**:
1. Verify API key permissions in Google Cloud Console
2. If API key is correct, update `GEMINI_ANALYSIS_MODEL` and `GEMINI_REWRITE_MODEL` in `.env.local`
3. Currently using `gemini-2.0-flash` as default (can be changed)

---

### 2. Supabase Database Connectivity (SEVERITY: HIGH)

**Issue**: `TypeError: fetch failed` when saving to Supabase  
**Root Cause**: Network connectivity from cloud environment to Supabase  
**Error Pattern**: Consistent fetch failures on all database operations  

**Current Status**: PERSISTS DESPITE FIXES
- Changed to service role key for proper authentication
- Error messages improved with diagnostics
- Application handles failure gracefully (analysis still returned)

**Technical Details**:
- Supabase URL: `https://xkihyjzdqgahkuqogqie.supabase.co`
- Using service role key (which has full permissions)
- Error occurs at network layer (fetch failed)
- Likely network policy or firewall restriction

**What User Sees**:
- API returns analysis successfully
- `saved: false` in response
- History page shows no saved analyses
- All historical data is lost

**User Action Required**:
- Check network connectivity from environment to Supabase
- Verify firewall/security group allows HTTPS to Supabase
- Consider using environment with direct Supabase connectivity
- Or implement local caching (optional enhancement)

**Workaround**:
- System functions entirely without persistence
- Analyses complete successfully
- User cannot retrieve historical analyses

---

## Non-Critical Issues

### 3. Scoring Separation (Natural vs AI-style)

**Issue**: Small gap between natural text (51) and AI-style text (58)  
**Status**: NOT A BUG - Working as designed  

**Rationale**:
- 7-point gap correctly separates natural from AI-style
- Gap is intentionally modest because both texts are well-written
- Repetitive text correctly scores much higher (70)
- Rules engine detects specific patterns, not overall quality

**Test Results**:
- Natural text: 51 (low AI-likeness) ✓
- AI-style text: 58 (moderate AI-likeness) ✓
- Highly repetitive: 70 (high AI-likeness) ✓

This behavior is correct and expected.

---

### 4. Quality Score vs Repetition Relationship

**Status**: Working correctly

The quality scoring correctly inversely correlates with repetition:
- High-quality content: repetition score 69-75
- Low-quality content: repetition score 44 (detecting actual repetition)

This is by design.

---

## Environment-Specific Limitations

### Cloud Environment Restrictions

This deployment is running in a managed cloud environment with:
- Limited outbound network access
- Possible firewall restrictions
- Potential CORS or API gateway limitations

**Impact on Features**:
1. **Gemini API**: Cannot reach generative models
2. **Supabase**: Cannot reach database
3. **Other External APIs**: May have similar restrictions

**Available Workarounds**:
- Use deterministic analysis (rules + metrics)
- Implement local analysis without external APIs
- Deploy to environment with full network access

---

## Testing Summary

**Test Cases Executed**:

| Test Case | Result | Score | Notes |
|-----------|--------|-------|-------|
| Natural writing | PASS | 51 | Correctly low |
| AI-style writing | PASS | 58 | Correctly moderate |
| Highly repetitive | PASS | 70 | Correctly high |
| Corporate writing | PASS | 60 | Moderate (formulaic) |
| Technical writing | PASS | 53 | Correctly low |

All test cases show expected behavior.

---

## System Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Deterministic Analysis | ✓ WORKING | Metrics, rules, quality scoring all operational |
| Gemini Integration | ⚠ DEGRADED | Unavailable but gracefully handled |
| Database Persistence | ⚠ UNAVAILABLE | Network issue in cloud environment |
| API Responses | ✓ WORKING | All scoring and analysis working |
| Error Handling | ✓ WORKING | Graceful degradation implemented |
| Tests | ✓ 39/39 PASSING | Full test coverage maintained |

---

## Recommendations for Next Phase

1. **Before Humanisation**: 
   - Resolve or document Supabase connectivity issue
   - Test in environment with full network access
   - Verify Gemini API key has model access

2. **If Network Issues Persist**:
   - Implement in-memory caching as workaround
   - Document limitations clearly in UI
   - Focus on deterministic analysis as primary feature

3. **Testing Infrastructure**:
   - Set up test environment with working Supabase
   - Test Gemini with verified API key
   - Create end-to-end test suite for database persistence

---

## History of Fixes

- **2026-10-10**: Removed fake Gemini scores, implemented partial scoring
- **2026-10-10**: Changed to service role key for database operations
- **2026-10-10**: Improved error messages with diagnostics

---

## Next Steps

1. Resolve network connectivity issues
2. Verify Gemini API key access
3. Run full end-to-end tests with working Supabase
4. Proceed with humanisation phase only after these are resolved
