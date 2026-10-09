# LekhIQ - Development Guide

## Project Overview
LekhIQ is a content-analysis and content-improvement tool designed for internal development and testing. It helps users:
- Analyse writing quality and AI-likeness characteristics
- Identify readability issues and repetition
- Humanise content with Professional Indian English
- Validate and preserve key information

## Current Status
**Branch**: `claude/affectionate-newton-6wvs6u`
**Phase**: 0 - Foundation (in progress)
**Last Updated**: 2026-10-09

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
