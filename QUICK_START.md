# LekhIQ - Quick Start Guide

## ⚡ 3-Minute Setup

### 1. Clone & Install
```bash
git clone https://github.com/NearByPrices/LekhIQ.git
cd LekhIQ
npm install
```

### 2. Configure
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
GEMINI_API_KEY=your_key
GEMINI_ANALYSIS_MODEL=gemini-3.8-flash
GEMINI_REWRITE_MODEL=gemini-3.8-flash
```

### 3. Start
```bash
npm run dev
```

**Open**: http://localhost:3000

---

## 🎯 First Test (30 seconds)

1. **Click** the text area
2. **Paste** this:
   ```
   This is a test of the LekhIQ content analysis system. 
   It analyzes writing quality and provides humanization suggestions.
   ```
3. **Click** "🚀 Analyse Content"
4. **See** results (scores, metrics, analysis)

---

## ✨ Try Features

### Humanise Content
1. After analysis, click **"✨ Humanise"**
2. Choose mode: Light / Natural / Deep
3. Choose tone: Professional / Conversational / Corporate / etc.
4. Click **"Rewrite"**
5. See before/after

### Upload File
1. Click **"📄 Upload File"** tab
2. Select TXT, DOCX, or PDF file
3. Click **"🚀 Analyse"**

### Analyse Website
1. Click **"🔗 Website URL"** tab
2. Enter: `https://example.com`
3. Click **"🚀 Analyse"**
4. See SEO metrics + content analysis

### Check History
1. Click **"History"** in navigation
2. See previous analyses
3. Click any to reopen

---

## 📊 What You See

### Analysis Results Show:
- **AI-Likeness Score** (0-100)
- **Quality Scores** (Readability, Repetition, etc.)
- **SEO Analysis** (Title, keywords, links, etc.)
- **AI Rules** (8 pattern detections)

### Humanisation Shows:
- **Before** (original)
- **After** (rewritten)
- **Preserved Content** (keywords, emails, etc.)
- **Score Improvement**

---

## 🛠️ Common Commands

```bash
npm run dev              # Start dev server
npm test                 # Run 128 tests
npm run test:e2e         # Run E2E tests
npm run build            # Build for production
npm start                # Run production build
npm run type-check       # Check TypeScript
npm run lint             # Check code style
```

---

## ⚙️ Troubleshooting

### "Port 3000 in use?"
```bash
npm run dev -- -p 3001
# Then visit: http://localhost:3001
```

### "Module not found?"
```bash
npm install
```

### "Gemini quota exceeded?"
Wait 30+ seconds (free tier: 5 req/min)

### "Can't connect to Supabase?"
Normal in cloud environment - analysis still works

---

## 📚 Full Documentation

| File | Purpose |
|------|---------|
| **README.md** | Complete user guide |
| **PROJECT_COMPLETE.md** | Full feature summary |
| **CLAUDE.md** | Project rules & overview |
| **HANDOFF.md** | Developer guide |
| **QA_TEST_REPORT.md** | Testing results |

---

## ✅ Features Checklist

Input Methods:
- [x] Paste text
- [x] TXT files
- [x] DOCX files
- [x] PDF files
- [x] Website URLs

Analysis:
- [x] AI-Likeness detection
- [x] Quality scoring
- [x] SEO analysis
- [x] Readability check

Humanisation:
- [x] Light/Natural/Deep modes
- [x] 8 tone options
- [x] Entity preservation
- [x] Keyword protection

---

## 🎯 Status

✅ **Complete** - All features working  
✅ **Tested** - 128 unit tests passing  
✅ **Secure** - SSRF + injection hardening  
✅ **Ready** - For immediate use

---

**Next**: Clone → Install → Run → Test  
**Questions?** See README.md or PROJECT_COMPLETE.md
