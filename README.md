# LekhIQ - Content Intelligence & Humanisation Platform

![Status](https://img.shields.io/badge/status-Complete-brightgreen)
![Tests](https://img.shields.io/badge/tests-128%2F128-brightgreen)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

Professional content analysis and humanisation tool powered by AI.

## 🚀 Quick Start (2 minutes)

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Windows Setup
```powershell
# Clone repository
git clone https://github.com/NearByPrices/LekhIQ.git
cd LekhIQ

# Install dependencies
npm install

# Create .env.local file (see Configuration section below)

# Start development server
npm run dev
```

Then open: **http://localhost:3000**

### Mac/Linux Setup
```bash
git clone https://github.com/NearByPrices/LekhIQ.git
cd LekhIQ
npm install
npm run dev
```

---

## 📋 Configuration

Create `.env.local` file in project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# Gemini API Configuration
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_ANALYSIS_MODEL=gemini-3.8-flash
GEMINI_REWRITE_MODEL=gemini-3.8-flash
```

**Getting Credentials:**
1. **Supabase**: Create account at https://supabase.com
2. **Gemini API**: Get key from https://ai.google.dev/

> ⚠️ **Never commit `.env.local` to git!** It contains secrets.

---

## ✨ Core Features

### 📝 Input Methods
- **Paste Text** - Analyse any content (50-50,000 characters)
- **Website URLs** - Extract and analyse web content
- **TXT Files** - Upload and process text files
- **DOCX Files** - Parse Word documents (NEW)
- **PDF Files** - Extract text from PDFs (NEW)

### 🔍 Analysis Engine
- **AI-Likeness Detection** - 24+ metrics + 8 rules
- **Quality Scoring** - Readability, repetition, information density
- **SEO Analysis** - 16+ metrics with recommendations
- **Gemini Integration** - Qualitative content review

### ✨ Humanisation
- **3 Rewrite Modes** - Light, Natural, Deep
- **8 Professional Tones** - Professional, conversational, corporate, etc.
- **Entity Protection** - Preserve URLs, emails, prices, dates, keywords
- **Smart Validation** - Ensures rewritten content meets quality standards

### 📊 Additional Features
- **History Tracking** - Save and retrieve previous analyses
- **SEO Recommendations** - Actionable improvement suggestions
- **Testing Lab** - Compare different analysis settings
- **Responsive Design** - Works on mobile, tablet, desktop

---

## 🎯 How to Use

### Step 1: Paste Content
```
"This is your content to be analyzed. It should contain at least 50 characters for proper analysis and metrics calculation."
```

### Step 2: Click Analyse
- Get AI-likeness score (0-100)
- See quality breakdown (readability, repetition, etc.)
- Review SEO metrics
- Check AI detection results

### Step 3: Humanise (Optional)
- Select rewrite mode (Light/Natural/Deep)
- Choose tone (Professional/Conversational/etc.)
- Set protected keywords/phrases
- Review before/after comparison

### Step 4: Save
- Analysis auto-saves to history
- Access anytime from History page
- Compare multiple analyses

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Run unit tests (128 tests)
npm test

# Run E2E tests (Playwright)
npm run test:e2e
npm run test:e2e:headed    # See browser

# Quality checks
npm run type-check         # TypeScript
npm run lint               # ESLint

# Production build
npm run build
npm start
```

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile Safari | ✅ Full |
| Chrome Mobile | ✅ Full |

---

## 🔒 Security Features

✅ **SSRF Protection** - Blocks private IP access  
✅ **Prompt Injection Defense** - Multi-layer validation  
✅ **Input Validation** - Zod schemas on all endpoints  
✅ **File Security** - Type and size validation  
✅ **Error Sanitization** - No stack traces to users  

---

## 📚 Project Structure

```
LekhIQ/
├── src/
│   ├── app/                    # Next.js app routes
│   │   ├── api/               # API endpoints
│   │   ├── page.tsx           # Home page
│   │   ├── results/           # Results display
│   │   ├── history/           # History page
│   │   ├── testing/           # Testing lab
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   ├── lib/                   # Business logic
│   │   ├── analysis/          # Analysis engine
│   │   ├── humanisation/      # Rewriting logic
│   │   ├── seo/              # SEO analysis
│   │   ├── website/          # URL extraction
│   │   ├── files/            # File parsing
│   │   └── db/               # Database service
│   └── types/                # TypeScript types
├── e2e/                       # E2E tests
├── tests/                     # Unit tests
├── public/                    # Static assets
├── .env.local                 # Configuration
└── package.json              # Dependencies
```

---

## 🚀 API Reference

### POST /api/analyse
Analyse text content
```bash
curl -X POST http://localhost:3000/api/analyse \
  -H "Content-Type: application/json" \
  -d '{
    "type": "paste",
    "content": "Your content here...",
    "title": "Analysis Title"
  }'
```

### POST /api/humanise
Rewrite content
```bash
curl -X POST http://localhost:3000/api/humanise \
  -H "Content-Type: application/json" \
  -d '{
    "originalText": "Content to rewrite...",
    "rewriteMode": "natural",
    "tone": "professional",
    "protectedKeywords": ["keyword"],
    "lockedPhrases": ["locked phrase"]
  }'
```

### POST /api/extract-url
Extract and analyse website
```bash
curl -X POST http://localhost:3000/api/extract-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

### GET /api/history
Retrieve previous analyses
```bash
curl http://localhost:3000/api/history
```

### GET /api/health
Check system status
```bash
curl http://localhost:3000/api/health
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test           # Unit tests (128)
npm run test:e2e   # E2E tests
```

### Test Results
```
✓ Unit Tests: 128/128 passing
✓ Build: Successfully compiled
✓ TypeScript: No errors
✓ ESLint: All checks passing
```

---

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Project overview & setup
- **[FINAL_CLOSURE_REPORT.md](./FINAL_CLOSURE_REPORT.md)** - Complete feature audit
- **[QA_TEST_REPORT.md](./QA_TEST_REPORT.md)** - Testing results
- **[HANDOFF.md](./docs/HANDOFF.md)** - Developer guide
- **[TODO.md](./TODO.md)** - Project status

---

## ⚙️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Testing**: Vitest (128 unit tests), Playwright (E2E)
- **Content**: Cheerio, Mozilla Readability, pdf-parse, Mammoth
- **Validation**: Zod
- **File Parsing**: TXT, DOCX (Mammoth), PDF (pdf-parse)

---

## 🐛 Known Limitations

### Gemini API Rate Limiting
- Free tier: 5 requests per minute
- **Impact**: Humanisation may be rate-limited
- **Workaround**: Wait 30+ seconds or upgrade to paid tier

### Supabase Cloud Network
- Database unreachable in some cloud environments
- **Impact**: History persistence may fail (analyses still complete)
- **Workaround**: Use locally or configure cloud network access

### Website Extraction
- Network restricted in cloud environments
- **Impact**: URL extraction may fail
- **Workaround**: Use locally or configure cloud network access

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
# http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
# http://localhost:3000 (production mode)
```

### Docker (Optional)
```bash
docker build -t lekhiq .
docker run -p 3000:3000 lekhiq
```

### Cloud Deployment (Vercel/AWS/GCP)
See [HANDOFF.md](./docs/HANDOFF.md) for detailed deployment guide

---

## 📊 Quality Metrics

| Metric | Status |
|--------|--------|
| Unit Tests | ✅ 128/128 passing |
| Build | ✅ Successful |
| TypeScript | ✅ Type-safe |
| Security | ✅ Hardened |
| Performance | ✅ <5s analysis |
| Coverage | ✅ Comprehensive |

---

## 🤝 Contributing

This is an internal testing build. For issues or suggestions:
1. Check existing issues on GitHub
2. Create detailed bug reports with reproduction steps
3. Suggest features with use cases

---

## 📝 License

Internal testing build - All rights reserved

---

## 🎓 Learn More

- **[Project Status](./TODO.md)** - Current features & roadmap
- **[Final Report](./FINAL_CLOSURE_REPORT.md)** - Complete implementation audit
- **[QA Results](./QA_TEST_REPORT.md)** - Testing verification
- **[Handoff Guide](./docs/HANDOFF.md)** - For next developer

---

## 📞 Support

**Quick Links:**
- 🐛 [Report Issues](https://github.com/NearByPrices/LekhIQ/issues)
- 💡 [Suggest Features](https://github.com/NearByPrices/LekhIQ/discussions)
- 📧 Email: contactsujaytech@gmail.com

**Common Issues:**
- "Port 3000 in use?" → Use `npm run dev -- -p 3001`
- "Gemini quota exceeded?" → Wait 30 seconds
- "Module not found?" → Run `npm install` again

---

## ✅ Status: Production-Ready for Internal Testing

**All core features implemented and tested.**
Ready for team evaluation, user feedback, and deployment.

---

**Last Updated**: 2026-10-12  
**Version**: 1.0.0  
**Branch**: `claude/affectionate-newton-6wvs6u`  
**Build**: ✅ COMPLETE
