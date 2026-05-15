# KasaFrames — Luxury Wall Aesthetics (Next.js)

Ultra-modern marketing + commerce MVP for **KasaFrames**, a Ghana-based luxury wall aesthetics and framing brand.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Copy `.env.example` → `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL` (canonical URL for SEO + sitemap)
- `NEXT_PUBLIC_WHATSAPP_E164` (digits only, e.g. `233XXXXXXXXX`)
- `NEXT_PUBLIC_BRAND_PHONE` (display)
- `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` (Google Maps embed URL)
- `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID` (optional analytics)

## Deployment (Vercel)

1. Push to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Set **Environment Variables** to match `.env.example`.
4. Use **Node 20+** (matches Next 15 expectations).
5. Enable **Image Optimization** remote patterns (already configured for `images.unsplash.com` in `next.config.ts`). Add your CDN host as you replace placeholders.

## CMS recommendation

For a luxury brand with rich editorial pages and frequent portfolio updates:

- **Sanity** or **Contentful** for structured content (collections, case studies, galleries, FAQs, SEO fields).
- Keep **commerce-critical** fields (SKU, price rules, inventory) in Postgres via your own API if you outgrow CMS-only product modeling.

## Suggested backend architecture

- **Edge + Node** API routes or a small **NestJS** service for orders/inquiries.
- **Postgres** (Neon/Supabase) as the system of record for customers, orders, line items, appointments.
- **Object storage** (S3/R2) for consultation uploads and portfolio originals; store only signed URLs in the DB.
- **Queue** (SQS/Cloudflare Queues) for email + CRM fan-out.
- **Auth** (Clerk/Auth.js) when customer dashboards ship.

## Database structure (starter)

- `users` (optional until accounts)
- `products`, `product_variants` (size/material/finish matrix)
- `carts`, `cart_items`
- `orders`, `order_items`, `payments`
- `appointments` (consultation bookings)
- `leads` (form + WhatsApp click attribution)

## API structure (starter)

- `POST /api/leads` — contact + consultation forms
- `POST /api/cart/checkout` — create Paystack session
- `POST /api/webhooks/paystack` — payment confirmation
- `POST /api/webhooks/calcom` — booking confirmations
- `GET /api/products` — CMS-backed or DB-backed catalog

## Integrations (MVP → scale)

- **WhatsApp**: deep links already implemented (`src/lib/utils.ts`).
- **Paystack**: server-initiated transaction + webhook signature verification.
- **Airtable**: great early CRM—sync `leads` + `appointments` via queue worker.
- **Meta Pixel / GA4**: placeholders in `src/components/analytics-scripts.tsx`.

## Performance notes

- Prefer **AVIF/WebP** assets on your CDN; keep hero videos short or host on Mux.
- Use `next/image` sizes intentionally (see components).
- Lazy load below-the-fold imagery; keep hero `priority` only on LCP candidates.
- Consider **Route Handlers** caching headers for static editorial routes.

## AI roadmap (optional modules)

- **Wall recommendation**: image upload → embeddings → retrieval against tagged portfolio corpus.
- **Room styling**: segmentation + style transfer is expensive; start with retrieval + layout heuristics.

## Mobile app expansion

Keep product truth in **API + Postgres**; treat this Next.js site as a presentation layer. A future React Native app should consume the same `/api/products` and `/api/appointments` contracts.

## Brand / product data

Dummy catalog lives in `src/lib/data/catalog.ts` and portfolio copy in `src/lib/data/site.ts`—swap for CMS fetch later without changing UI structure.

## Git workflow (commit after each step)

Keep GitHub aligned with your work: **one logical step → one commit → one push**.

1. **Check** what changed: `git status`
2. **Stage**: `git add -A` (or stage specific paths)
3. **Commit**: `git commit -m "Short imperative description of this step"`
4. **Push**: `git push`

First-time setup (once per machine/repo):

```powershell
cd "C:\Users\USER\Documents\Code\Agentic Testing"
git init
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

If PowerShell blocks shims, prefer `git.exe` / `npm.cmd` explicitly.

A Cursor project rule (`.cursor/rules/incremental-git.mdc`) reminds the agent to follow this cadence when working in this repository.
