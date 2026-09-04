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

## Database

Schema lives in `src/lib/db/schema.sql`—`orders`, `order_items`, `payment_events`, and `leads`.
Every statement is idempotent, so applying it twice is safe:

```bash
psql "$DATABASE_URL" -f src/lib/db/schema.sql
```

Set `DATABASE_URL` and both leads and orders write to Postgres; leave it unset and they fall back to
the webhook forward, then to structured logs. Nothing else in the app changes.

Money is stored in **pesewas as integers**. Cedis in floating point drift, and Paystack speaks the
minor unit anyway.

### How a payment is reconciled

1. Checkout inserts the order as `pending` with the amount it priced, before the customer leaves for
   Paystack.
2. The webhook inserts into `payment_events`, keyed on `event` + Paystack's transaction id. A unique
   violation there means this is a replayed delivery, and it stops.
3. The order is marked paid by a single guarded statement:

   ```sql
   UPDATE orders SET status = 'paid', ...
    WHERE reference = $1 AND amount_pesewas = $2 AND status <> 'paid'
   ```

   The amount check and the write are one atomic statement, so concurrent deliveries can't race, and
   a second delivery updates nothing.
4. A payment whose amount doesn't match parks the order in `amount_mismatch` for a human. It is
   never marked paid. Underpayment and overpayment are both treated this way.
5. A stray `charge.failed` cannot un-pay a paid order.

`npm run test:payments` runs these rules against an in-memory Postgres (`pg-mem`); it is the fastest
way to see the intended behaviour, and it needs no database.

### Still to model

- `users` (optional until accounts)
- `products`, `product_variants` (size/material/finish matrix)—catalog is still a TS file
- `carts`, `cart_items` (the cart is localStorage today)
- `appointments` (consultation bookings; currently captured as leads)

## API structure

### `POST /api/leads` — implemented

Backs the contact form (`/contact`) and the consultation booker (`/book`). Both post JSON and render
server-side field errors inline.

Request body: `type` (`"contact" | "consultation"`), `name`, `email`, plus `phone`, `message`,
`consultationMode`, `slot`, `dimensions`, `preferences`, `photoCount`, `source`. Responses are
`201 {ok, id}`, `400 {ok, error, fields}`, `429` (10 posts per IP per minute), or `502` when storage
rejects the write.

Validation and persistence live in `src/lib/leads.ts`. `saveLead()` writes to Postgres when
`DATABASE_URL` is set; otherwise it forwards to `LEADS_WEBHOOK_URL` (Airtable/Zapier/Make/Slack,
with an optional `LEADS_WEBHOOK_TOKEN` bearer), and otherwise logs a structured `[lead]` line
visible in the Vercel runtime logs.

Two caveats worth knowing:

- The rate limiter is an in-memory `Map` in the route, so it is per-instance. It stops double-submits
  and casual spam; put Vercel WAF or an Upstash-backed limiter in front for real volume.
- The consultation form records how many photos the visitor selected but does not upload them—that
  needs the object-storage step below.

### `POST /api/cart/checkout` — implemented

Starts a Paystack transaction for the cart and returns `{ authorizationUrl, reference, amountGhs }`;
the cart drawer redirects the browser there. Body is `{ email, lines: [{ productId, sizeLabel,
material, finish, installation, qty }] }`.

**The client never sends an amount.** `priceCart()` in `src/lib/pricing.ts` recomputes every price
from the catalog and rejects configurations the product doesn't offer, so a tampered cart in
localStorage can't change what gets charged. Line items cap at 20, quantity at 20 per line.

Responses: `201`, `400` (bad email, empty cart, unavailable configuration), `502` (Paystack
unreachable), or `503` when `PAYSTACK_SECRET_KEY` is unset—the drawer then tells the customer to
WhatsApp instead, so the site stays usable before keys are added.

### `POST /api/webhooks/paystack` — implemented

Verifies the `x-paystack-signature` header (HMAC-SHA512 over the raw body, timing-safe compare)
before trusting anything, then records `charge.success` / `charge.failed` through `saveOrder()`.
Unhandled events return 200 so Paystack stops retrying them; storage failures return 500 so it
retries. Bad signatures get 401.

### Paystack setup

1. Copy your secret key from the Paystack dashboard into `PAYSTACK_SECRET_KEY` (Vercel env vars and
   `.env.local`). It is server-only—never prefix it with `NEXT_PUBLIC_`.
2. Add `https://<your-domain>/api/webhooks/paystack` as the webhook URL in the dashboard.
3. Set `NEXT_PUBLIC_SITE_URL` so the post-payment redirect to `/order/<reference>` is absolute.

Test keys (`sk_test_…`) exercise the whole flow with Paystack's test cards and test MoMo numbers.

Remaining gap: **no stock, tax, or delivery-fee model.** The charge is the cart subtotal exactly.

### Still to build

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

Remote for this project:

```text
https://github.com/Pa-tter-son/KasaFrames.git
```

If PowerShell blocks shims, prefer `git.exe` / `npm.cmd` explicitly.

A Cursor project rule (`.cursor/rules/incremental-git.mdc`) reminds the agent to follow this cadence when working in this repository.
