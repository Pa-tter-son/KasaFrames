import { NextResponse } from "next/server";
import { recordPayment } from "@/lib/orders";
import { isPaystackConfigured, verifyWebhookSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaystackEvent {
  event?: string;
  data?: {
    id?: number | string;
    reference?: string;
    amount?: number;
    paid_at?: string;
    channel?: string;
    status?: string;
  };
}

const HANDLED: Record<string, { paid: boolean }> = {
  "charge.success": { paid: true },
  "charge.failed": { paid: false },
};

export async function POST(request: Request) {
  if (!isPaystackConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Must be the bytes as received: the signature is over the raw body, so
  // parsing first and re-serialising would break verification.
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    console.warn("[paystack] rejected a webhook with a bad signature");
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const name = event.event ?? "unknown";
  const reference = event.data?.reference;
  const handled = HANDLED[name];

  // Anything we don't act on still gets a 200, or Paystack keeps retrying it.
  if (!handled || !reference) {
    return NextResponse.json({ ok: true, ignored: name });
  }

  try {
    const outcome = await recordPayment({
      // The transaction id makes a replayed delivery recognisable; the
      // reference alone would collide across a retry of a different event.
      eventKey: `${name}:${event.data?.id ?? reference}`,
      reference,
      event: name,
      paid: handled.paid,
      amountGhs: (event.data?.amount ?? 0) / 100,
      paidAt: event.data?.paid_at,
      channel: event.data?.channel,
      rawPayload: rawBody,
    });

    if (outcome.result === "amount_mismatch") {
      // Never fulfil on a mismatch: the order is parked for a human. 200 because
      // a retry would land in exactly the same place.
      console.error(
        "[paystack] amount mismatch",
        reference,
        `expected ${outcome.expectedPesewas} pesewas, paid ${outcome.paidPesewas}`,
      );
    }

    if (outcome.result === "unknown_reference") {
      console.error("[paystack] payment for an unknown reference", reference);
    }

    return NextResponse.json({ ok: true, outcome: outcome.result });
  } catch (error) {
    // A 500 asks Paystack to retry, which is what we want if storage is down.
    console.error("[paystack] failed to record payment", reference, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
