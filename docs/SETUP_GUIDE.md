# LekhIQ Setup Guide - Phase 8: Supabase Integration

**Status:** Complete - DNS issues resolved with automatic configuration  
**Date:** 2026-10-11

## Quick Start (5 minutes)

### Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project (or use existing)
2. In Supabase Dashboard, go to **Settings → API**
3. Copy:
   - **Project URL** (looks like: `https://xkihyjzdqgahkuqogqie.supabase.co`)
   - **Anon/Public Key** (the public key, not the secret)

### Step 2: Create Environment File

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **IMPORTANT:** 
- Never commit `.env.local` to git (it's in `.gitignore`)
- Use public key only (ANON_KEY), not the SECRET_KEY
- The `NEXT_PUBLIC_` prefix makes it available to the browser

### Step 3: Verify Everything Works

Run the health check:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-10-11T...",
  "dns": {
    "working": true,
    "usingPublicDNS": false,
    "configuredServers": [],
    "error": null
  },
  "supabase": {
    "dnsResolvable": true,
    "connected": true
  }
}
```

✓ **Success:** Your Supabase connection is working!

---

## Detailed Setup Instructions

### For Development Environment

#### 1. Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16.4.0
- React 19.3.0
- Tailwind CSS 4
- TypeScript 5
- Supabase client (freshly added)

#### 2. Create Environment File

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials.

#### 3. Start Development Server

```bash
npm run dev
```

The DNS configuration will automatically initialize when the server starts. You'll see:

```
[DNS] ✓ Default DNS resolver is working
```

or

```
[DNS] Default DNS resolver not responding. Switching to public DNS servers.
[DNS] ✓ Successfully configured public DNS servers
```

#### 4. Test the API

```bash
# Test health/DNS configuration
curl http://localhost:3000/api/health

# Should return JSON with DNS and Supabase status
```

---

## DNS Configuration (Automatic)

### How It Works

The DNS configuration system automatically:

1. **On app startup:** Checks if your system's default DNS resolver is working
2. **If working:** Uses it as-is (no changes needed)
3. **If broken:** Automatically switches to public DNS servers (8.8.8.8, 1.1.1.1, etc.)
4. **Verifies:** Tests the configuration against known domains

### Files Involved

- `src/lib/dns-config.ts` - DNS utility and configuration logic
- `src/lib/supabase.ts` - Supabase client with DNS integration
- `src/app/api/health/route.ts` - Health check endpoint

### Checking DNS Status

In your code:

```typescript
import { getDNSStatus, testSupabaseDNS } from '@/lib/dns-config';

// Get current DNS status
const status = getDNSStatus();
console.log(status);
// {
//   isWorking: true,
//   usingPublicDNS: false,
//   configuredServers: [],
//   error: null
// }

// Test Supabase specifically
const canReachSupabase = await testSupabaseDNS('https://your-project.supabase.co');
```

---

## Using Supabase in Your Code

### Example 1: Server Component

```typescript
// src/app/page.tsx
import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Fetch data from Supabase
  const { data: items, error } = await supabase
    .from('items')
    .select('*');

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {items?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: API Route

```typescript
// src/app/api/items/route.ts
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

### Example 3: Server Action

```typescript
// src/app/actions.ts
'use server';

import { supabase } from '@/lib/supabase';

export async function getItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*');

  if (error) throw new Error(error.message);
  return data;
}
```

---

## Troubleshooting

### Issue: "ECONNREFUSED" when starting the app

**Solution 1: Check Internet Connection**
```bash
ping google.com
```

**Solution 2: Check DNS Health**
```bash
node scripts/test-supabase.js
```

**Solution 3: Check Environment Variables**
```bash
# Make sure .env.local exists and has credentials
cat .env.local
```

**Solution 4: Clear Node Cache**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "Cannot find module @supabase/supabase-js"

```bash
# Reinstall Supabase
npm install @supabase/supabase-js
```

### Issue: Supabase connection failing

Check the health endpoint:

```bash
curl http://localhost:3000/api/health | jq .
```

Look for:
- `dns.working: true` - DNS is configured properly
- `supabase.dnsResolvable: true` - Supabase domain is reachable
- `supabase.connected: true` - Supabase authentication is working

### Issue: "Missing environment variables"

Make sure `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

Never use example values - get real credentials from Supabase dashboard.

---

## Production Deployment

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

DNS configuration is automatic - nothing special needed.

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t lekhiq .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  lekhiq
```

### Kubernetes Deployment

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: lekhiq-env
data:
  NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co"
---
apiVersion: v1
kind: Secret
metadata:
  name: lekhiq-secrets
type: Opaque
stringData:
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-key-here"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lekhiq
spec:
  replicas: 2
  selector:
    matchLabels:
      app: lekhiq
  template:
    metadata:
      labels:
        app: lekhiq
    spec:
      dnsPolicy: "None"
      dnsConfig:
        nameservers:
          - 8.8.8.8
          - 1.1.1.1
      containers:
        - name: lekhiq
          image: lekhiq:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: lekhiq-env
            - secretRef:
                name: lekhiq-secrets
```

---

## Next Steps

1. ✓ DNS configuration complete
2. ✓ Supabase client installed
3. → Set up database schema in Supabase console
4. → Create tables and set up Row-Level Security (RLS)
5. → Implement your application logic

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/with-nextjs)
- [Supabase JavaScript Reference](https://supabase.com/docs/reference/javascript)
- [Database Schema Setup](https://supabase.com/docs/guides/database/tables)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:

1. Check the health endpoint: `GET /api/health`
2. Run the diagnostic: `node scripts/test-supabase.js`
3. Review logs: Check browser console and server output
4. Verify credentials in `.env.local`

---

**Phase 8 Status:** ✓ Complete  
**Ready for Phase 9:** Database schema setup and application development
