# LekhIQ - Architecture Overview

## High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                         │
│              (Next.js 16 App Router)                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ Pages: /analyse, /history, /testing, /settings │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│              Next.js API Routes                           │
│   /api/health, /api/analyse, /api/humanise, ...         │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│            Business Logic Layer                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Analysis  │  │ Humanisation │  │   Validation │   │
│  │   Metrics   │  │   Pipeline   │  │   Engine     │   │
│  └─────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│               AI Provider Abstraction                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  GeminiProvider (analysContent, humaniseContent) │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│            External Services                              │
│  ┌──────────────┐           ┌──────────────┐            │
│  │ Gemini API   │           │  Supabase    │            │
│  │              │           │  PostgreSQL  │            │
│  └──────────────┘           └──────────────┘            │
└──────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── analyse/                 # Analyse page
│   ├── history/                 # History page
│   ├── testing/                 # Testing lab
│   ├── settings/                # Settings page
│   └── api/                      # API routes
│       ├── health/              # Health check
│       ├── analyse/             # Analysis endpoint
│       ├── humanise/            # Humanisation endpoint
│       ├── extract-url/         # URL extraction
│       └── history/             # History endpoints
│
├── components/                   # React components
│   ├── AnalysisForm.tsx
│   ├── ResultsDisplay.tsx
│   ├── ComparisonUI.tsx
│   └── ...
│
├── lib/
│   ├── config/
│   │   └── env.ts               # Environment validation
│   │
│   ├── db/
│   │   └── supabase.ts          # Supabase clients
│   │
│   ├── ai/
│   │   ├── providers/
│   │   │   └── gemini.ts        # Gemini implementation
│   │   └── prompts/
│   │       ├── analysis.ts
│   │       ├── humanisation.ts
│   │       ├── validation.ts
│   │       └── seo.ts
│   │
│   ├── analysis/
│   │   ├── metrics.ts           # Deterministic metrics
│   │   ├── rules.ts             # AI-likeness rules
│   │   ├── scoring.ts           # Combined scoring
│   │   └── quality.ts           # Content quality
│   │
│   ├── content/
│   │   ├── normalisation.ts
│   │   ├── extraction.ts
│   │   ├── chunking.ts
│   │   └── protection.ts        # Entity/keyword protection
│   │
│   ├── humanisation/
│   │   ├── transform.ts
│   │   ├── validation.ts
│   │   └── seo.ts
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   └── formatting.ts
│   │
│   └── types/
│       ├── database.ts
│       └── analysis.ts
│
├── styles/
│   └── globals.css              # Tailwind + custom
│
└── types/
    └── (shared TypeScript types)
```

## Data Flow

### 1. Paste Content Analysis
```
User Input
  ↓
Input Validation (Zod)
  ↓
Content Normalisation
  ↓
Save to content_documents table
  ↓
Run Deterministic Metrics
  ↓
Run AI-Likeness Rules
  ↓
Call Gemini for qualitative evaluation
  ↓
Combine scores
  ↓
Save to analysis_runs table
  ↓
Display Results
```

### 2. URL Extraction
```
URL Input
  ↓
SSRF Validation
  ↓
Fetch with timeout
  ↓
Parse with Cheerio
  ↓
Extract with Mozilla Readability
  ↓
Normalise
  ↓
Proceed as paste content
```

### 3. Humanisation
```
Selected Analysis Result
  ↓
Extract protected entities/keywords
  ↓
Call Gemini with protected content
  ↓
Validate rewrite
  ↓
Save to humanisation_runs table
  ↓
Show before/after comparison
```

## AI Provider Interface

```typescript
interface AIProvider {
  analyseContent(text: string): Promise<QualitativeResult>;
  humaniseContent(
    text: string,
    mode: 'light' | 'natural' | 'deep',
    tone: string,
    protected: ProtectedEntities
  ): Promise<HumanisationResult>;
  validateRewrite(original: string, rewritten: string): Promise<ValidationResult>;
}
```

## Security Considerations

1. **SSRF Protection**: Block localhost, private IPs, cloud metadata endpoints
2. **Prompt Injection**: Treat extracted content as data, not instructions
3. **API Keys**: Service role key server-side only
4. **Input Validation**: Zod schemas for all external input
5. **HTML Safety**: Sanitize before display

## Performance Considerations

1. **Chunking**: Large documents split by section, not arbitrary size
2. **Caching**: Prompt versions for reproducibility
3. **Cost Tracking**: Monitor Gemini tokens in test runs
4. **Concurrency**: Supabase client per request
