# LekhIQ - Architecture Decisions

## 1. Framework Choice: Next.js
**Decision**: Use Next.js 16 with TypeScript and App Router
**Rationale**: 
- Full-stack framework simplifies deployment
- Server components reduce client-side complexity
- API routes for backend logic
- Built-in image optimization, caching
- Strong TypeScript support

## 2. Database: Supabase PostgreSQL
**Decision**: Use Supabase for persistence and auth readiness
**Rationale**:
- Managed PostgreSQL
- Real-time capabilities for future
- Row-level security for future multi-user
- Simple pricing model
- Serverless functions if needed

## 3. AI Provider Abstraction
**Decision**: Create AIProvider interface separate from business logic
**Rationale**:
- Allow easy model/provider swapping
- Test with mock providers
- Keep logic independent of Gemini specifics
- Support future multi-model evaluation

## 4. Scoring Strategy: Multi-Component
**Decision**: Combine statistical, rule-based, and qualitative scoring
**Rationale**:
- Statistical metrics: fast, deterministic, testable
- Rules: transparent, auditable, explainable
- Gemini: nuanced evaluation, catches edge cases
- Separate component scores allow comparison and debugging

## 5. No Authentication Required (Internal Phase)
**Decision**: Skip user accounts, auth, payments
**Rationale**:
- Speeds up development
- Focuses on core analysis features
- Can be added later
- Supabase setup allows future addition

## 6. Content Normalisation: Conservative
**Decision**: Minimal changes before analysis
**Rationale**:
- Preserve original text integrity
- Avoid false positives from excessive transformation
- Clear audit trail of what changed
- Separate normalisation from humanisation

## 7. Humanisation: Never Invent Facts
**Decision**: Gemini must not add statistics, testimonials, claims
**Rationale**:
- Maintains content integrity
- Prevents misinformation
- Protects user from liability
- Clear validation after rewrite

## 8. Prompt Versioning
**Decision**: Store all prompts in code with version tracking
**Rationale**:
- Reproducibility
- Historical comparison
- Easy testing of prompt improvements
- Git history as audit log

## 9. Error Handling: Fail Safe
**Decision**: Log errors, show user-friendly messages, no silent failures
**Rationale**:
- Development debugging
- User confidence
- Debugging capability
- Prevents data loss

## 10. Testing Strategy: Golden Tests + Regression
**Decision**: Maintain fixed test samples, track regressions
**Rationale**:
- Detects when scoring breaks
- Supports algorithm improvements
- Prevents feature regression
- Clear before/after comparison
