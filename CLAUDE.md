# LekhIQ - Development Guide

## Project Overview
LekhIQ is an **internal testing build** for content analysis and improvement. Current capabilities:
- Analyse writing quality and AI-likeness characteristics (deterministic analysis)
- Identify readability issues and repetition patterns
- Humanise content with Professional Indian English (structure in place, not yet integrated to UI)
- Validate and preserve key information (infrastructure ready)

## Current Status
**Branch**: `claude/affectionate-newton-6wvs6u`
**Phase**: 6 - STABILIZATION IN PROGRESS
**Build Status**: Internal testing build (not production-ready)
**Last Updated**: 2026-10-10

**CRITICAL LIMITATIONS**:
- Gemini API currently unavailable (gracefully degraded)
- Supabase persistence has network connectivity issue
- See docs/BUGS_AND_LIMITATIONS.md for details

## Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, server components
- **Database**: Supabase
- **AI**: Gemini API
- **Validation**: Zod
- **Testing**: Vitest
- **Content Extraction**: Cheerio, Mozilla Readability, JSDOM

## Environment Variables
Required (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_ROLE_KEY=<key>
GEMINI_API_KEY=<key>
```

## Important Rules
1. **No Payments/Auth**: This is internal testing only
2. **Safety First**: Never commit secrets to git
3. **Single Source of Truth**: GitHub is the only memory
4. **Memory**: Always check CLAUDE.md, PROJECT_STATE.md, HANDOFF.md, TODO.md at session start
5. **Documentation**: Update docs continuously, not at the end
6. **Testing**: Mark features TESTED not just IMPLEMENTED
7. **Commits**: Use meaningful, specific commit messages

## Next Steps
See HANDOFF.md for exact continuation point.
