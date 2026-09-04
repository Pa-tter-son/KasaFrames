import { NextResponse } from "next/server";
import { saveOrder, type OrderStatus } from "@/lib/orders";
import { isPaystackConfigured, verifyWebhookSignature } from "@/lib/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PaystackEvent {
  event?: string;
  data?: {
    reference?: string;
    amount?: number;
    paid_at?: string;
    channel?: string;
    status?: string;
  };
}

const STATUS_BY_EVENT: Record<string, OrderStatus> = {
  "charge.success": "paid",
  "charge.failed": "failed",
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
  const status = STATUS_BY_EVENT[name];

  // Anything we don't act on still gets a 200, or Paystack keeps retrying it.
  if (!status || !reference) {
    return NextResponse.json({ ok: true, ignored: name });
  }

  try {
    await saveOrder(
      {
        reference,
        event: name,
        status,
        amountGhs: (event.data?.amount ?? 0) / 100,
        paidAt: event.data?.paid_at,
        channel: event.data?.channel,
        receivedAt: new Date().toISOString(),
      },
      "payment",
    );
  } catch (error) {
    // A 500 asks Paystack to retry, which is what we want if storage is down.
    console.error("[paystack] failed to record payment", reference, error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
