# AI Shop Bot Platform

Multi-tenant SaaS: shop owners get a public `/shop/{shopId}` link + AI chatbot. **Supabase** handles auth and Postgres; deploy on **Vercel**.

## Supabase only (auth + database)

Use **one** Supabase project. See [`.env.example`](.env.example) and [`SUPABASE_AUTH.md`](SUPABASE_AUTH.md).

```bash
cp .env.example .env
# Fill Supabase API keys + DATABASE_URL + DIRECT_URL from dashboard
npm install
npm run db:push
npm run dev
```

## Shop link — which files?

See **[`DEPLOY_AND_LINKS.md`](DEPLOY_AND_LINKS.md)** (share with your team).

| File | Role |
|------|------|
| `src/lib/shop-id.ts` | Generate ID + build URL |
| `src/app/api/shops/setup/route.ts` | Save shop, return `publicUrl` |
| `src/app/setup/page.tsx` | Owner setup UI |
| `src/app/shop/[shopId]/page.tsx` | Customer storefront |

## Vercel

Import repo → add env vars from `.env.example` → set `NEXT_PUBLIC_APP_URL` to your Vercel domain. Details: [`DEPLOY_AND_LINKS.md`](DEPLOY_AND_LINKS.md).

## License

MIT
