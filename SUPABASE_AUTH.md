# Supabase Authentication Setup

## 1. One Supabase project (auth + database)

Copy `.env.example` to `.env`. All values come from the **same** Supabase project:

| Variable | Supabase location |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public |
| `DATABASE_URL` | Settings → Database → Connection string → **Transaction pooler** (port 6543) |
| `DIRECT_URL` | Settings → Database → **Direct connection** (port 5432) |

Then:

```bash
npm run db:push
npm run dev
```

Restart the dev server after changing `.env`.

## 2. Redirect URLs (fixes “validation failed” on Google login)

**Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

Important:

- Add **exactly** `http://localhost:3000/auth/callback` (no `?next=...` query string).
- Do **not** use `http://127.0.0.1:3000` unless you also add that URL.
- For production, add `https://your-domain.com/auth/callback`.

## 3. Google OAuth (enable in Supabase)

### Supabase dashboard

1. **Authentication → Providers → Google** → turn **Enable Sign in with Google** ON.
2. Either:
   - **Use Supabase’s Google setup** (if offered on your plan), or
   - Paste **Client ID** and **Client secret** from Google Cloud (below).
3. Copy the **Callback URL (for OAuth)** shown on that page — it is always:
   `https://pupaszadpfvppzxqeles.supabase.co/auth/v1/callback`
   Paste that **exact** URL into Google (not `localhost`).

### Google Cloud Console

1. [Credentials](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client.
2. **Authorized redirect URIs** (Supabase callback, not your app):

   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   Example: `https://pupaszadpfvppzxqeles.supabase.co/auth/v1/callback`

3. **Authorized JavaScript origins** (optional for local):

   ```
   http://localhost:3000
   ```

## 4. Database

Google sign-in creates a Supabase user; the app also needs Postgres for shops:

```bash
npm run db:push
npm run db:seed
```

Use the **Database → Connection string → URI** from Supabase for `DATABASE_URL`.

## 5. Test flow

1. `npm run dev`
2. Open `http://localhost:3000/login`
3. **Continue with Google** → should land on `/dashboard`

If it fails, check the red error on `/login` (we pass through Supabase’s message).
