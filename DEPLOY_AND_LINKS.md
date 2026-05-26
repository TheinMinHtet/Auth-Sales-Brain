# Shop link logic + Supabase + Vercel deploy

Share this file with anyone deploying or reviewing the project.

---

## Supabase = Auth + Database (everything)

One Supabase project provides:

| Feature | Where in Supabase |
|---------|-------------------|
| Google / email login | Authentication → Providers |
| Postgres tables (shops, products, orders) | Database (via Prisma) |
| Redirect URLs | Authentication → URL Configuration |

**No Neon, no separate Postgres host.** Copy both API keys and Database URI from the **same** Supabase project into `.env`.

### `.env` checklist

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...          # pooler :6543 (Vercel)
DIRECT_URL=...            # direct :5432 (local db:push)
NEXT_PUBLIC_APP_URL=...   # http://localhost:3000 OR https://your-app.vercel.app
```

Local first-time DB setup:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

---

## Files that create the public shop link

### 1. Core helpers — **start here**

| File | What it does |
|------|----------------|
| [`src/lib/shop-id.ts`](src/lib/shop-id.ts) | `generateShopId()` — random unique ID; `buildShopPublicUrl(shopId)` — builds full URL |

Example output:

`{NEXT_PUBLIC_APP_URL}/shop/{shopId}`  
→ `https://your-app.vercel.app/shop/xK9m2pQr8vN1`

### 2. API — runs when owner submits setup form

| File | What it does |
|------|----------------|
| [`src/app/api/shops/setup/route.ts`](src/app/api/shops/setup/route.ts) | Creates shop in DB, generates `shopId`, returns `publicUrl` in JSON |

### 3. UI — setup form + success screen

| File | What it does |
|------|----------------|
| [`src/app/setup/page.tsx`](src/app/setup/page.tsx) | Owner form; shows/copy link after submit |
| [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx) | Shows `publicUrl` for existing shop |

### 4. Customer-facing page

| File | What it does |
|------|----------------|
| [`src/app/shop/[shopId]/page.tsx`](src/app/shop/[shopId]/page.tsx) | Public storefront at `/shop/{shopId}` |
| [`src/app/api/shops/public/[shopId]/route.ts`](src/app/api/shops/public/[shopId]/route.ts) | Public API read shop + products |

### 5. Database schema

| File | What it does |
|------|----------------|
| [`prisma/schema.prisma`](prisma/schema.prisma) | `Shop.shopId` unique field stores the public ID |

---

## Deploy to Vercel (automatic hosting)

### 1. Push code to GitHub

```bash
git init
git add .
git commit -m "AI Shop Bot Platform"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

### 2. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo  
2. Framework: **Next.js** (auto-detected)  
3. **Environment variables** (same as `.env`):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase API settings |
| `DATABASE_URL` | Supabase **Transaction** pooler URI (`:6543`, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase **Direct** URI (`:5432`) — needed for Prisma |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` (your real Vercel URL) |

4. Deploy

### 3. After first deploy

Run migrations against Supabase (once) from your machine:

```bash
# .env must have DIRECT_URL set
npx prisma db push
```

### 4. Supabase redirect URLs (production)

Add to **Authentication → URL Configuration**:

- Site URL: `https://YOUR-PROJECT.vercel.app`
- Redirect URLs: `https://YOUR-PROJECT.vercel.app/auth/callback`

Keep `http://localhost:3000/auth/callback` for local dev.

### 5. Google OAuth (production)

Google Cloud **Authorized redirect URI** stays:

`https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

(not the Vercel URL)

---

## Link behavior on Vercel

When `NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`:

- New shops get links like: `https://your-app.vercel.app/shop/abc123xyz`
- Set this env var **before** owners complete `/setup`, or links created earlier still use the old base URL until they’re regenerated.

---

## Quick test after deploy

1. Open `https://your-app.vercel.app/signup`  
2. Sign in (Google or email)  
3. Complete `/setup`  
4. Copy public link → open in incognito → customer shop + chatbot
