import { NextResponse } from "next/server";
import { recordPendingOrder } from "@/lib/orders";
import { initializeTransaction, isPaystackConfigured, newOrderReference } from "@/lib/paystack";
import { priceCart, toPesewas } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function siteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isPaystackConfigured()) {
    // Deliberately explicit: a silent failure here looks like a broken cart.
    return NextResponse.json(
      { ok: false, error: "Card payment isn't switched on yet. Please WhatsApp us to complete your order." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const { email, lines } = (body ?? {}) as { email?: unknown; lines?: unknown };
  const normalisedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!normalisedEmail || normalisedEmail.length > 200 || !EMAIL_RE.test(normalisedEmail)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email for your receipt.", field: "email" },
      { status: 400 },
    );
  }

  const priced = priceCart(lines);
  if ("error" in priced) {
    return NextResponse.json({ ok: false, error: priced.error }, { status: 400 });
  }

  const reference = newOrderReference();

  try {
    const transaction = await initializeTransaction({
      email: normalisedEmail,
      amountPesewas: toPesewas(priced.cart.subtotalGhs),
      reference,
      callbackUrl: `${siteUrl(request)}/order/${reference}`,
      metadata: {
        reference,
        lines: priced.cart.lines.map((l) => ({
          product: l.productName,
          size: l.sizeLabel,
          material: l.material,
          finish: l.finish,
          installation: l.installation,
          qty: l.qty,
        })),
      },
    });

    // Recorded before the redirect so an abandoned payment is still visible.
    await recordPendingOrder({
      reference: transaction.reference,
      email: normalisedEmail,
      amountGhs: priced.cart.subtotalGhs,
      lines: priced.cart.lines,
    });

    return NextResponse.json(
      {
        ok: true,
        reference: transaction.reference,
        authorizationUrl: transaction.authorizationUrl,
        amountGhs: priced.cart.subtotalGhs,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[checkout] failed", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't start the payment. Please try again or WhatsApp us." },
      { status: 502 },
    );
  }
}
