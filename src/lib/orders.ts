import { db, isDatabaseConfigured } from "@/lib/db";
import {
  insertOrder,
  markOrderFailed,
  markOrderPaid,
  recordPaymentEvent,
  type PaymentOutcome,
} from "@/lib/db/queries";
import { toPesewas } from "@/lib/pricing";
import type { PricedLine } from "@/lib/pricing";

export interface PendingOrderInput {
  reference: string;
  email: string;
  amountGhs: number;
  lines: PricedLine[];
}

export interface PaymentInput {
  /** Stable per delivery, so Paystack replaying an event is a no-op. */
  eventKey: string;
  reference: string;
  event: string;
  paid: boolean;
  amountGhs: number;
  paidAt?: string;
  channel?: string;
  rawPayload: string;
}

export type PaymentResult =
  | PaymentOutcome
  | { result: "duplicate" }
  | { result: "failed_recorded" }
  | { result: "forwarded" };

async function forward(kind: string, body: unknown) {
  const webhookUrl = process.env.ORDERS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.ORDERS_WEBHOOK_TOKEN
        ? { authorization: `Bearer ${process.env.ORDERS_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ kind, ...(body as Record<string, unknown>) }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Orders webhook responded ${response.status}`);
  }

  return true;
}

/**
 * Stores the order before the customer is sent to Paystack, so an abandoned
 * payment still leaves a trace.
 */
export async function recordPendingOrder(input: PendingOrderInput) {
  if (isDatabaseConfigured()) {
    await insertOrder(db(), {
      reference: input.reference,
      email: input.email,
      amountPesewas: toPesewas(input.amountGhs),
      lines: input.lines,
    });

    // Best-effort mirror to a CRM; the database is the record.
    try {
      await forward("order", input);
    } catch (error) {
      console.error("[order] webhook mirror failed", input.reference, error);
    }

    return;
  }

  if (await forward("order", input)) return;

  console.info("[order]", JSON.stringify(input));
}

/**
 * Applies a payment webhook.
 *
 * With a database this is where money is reconciled: the event is deduplicated,
 * and the order is only marked paid when the amount Paystack reports matches the
 * amount the order was created with.
 */
export async function recordPayment(input: PaymentInput): Promise<PaymentResult> {
  if (!isDatabaseConfigured()) {
    const summary = {
      reference: input.reference,
      event: input.event,
      status: input.paid ? "paid" : "failed",
      amountGhs: input.amountGhs,
      paidAt: input.paidAt,
      channel: input.channel,
      receivedAt: new Date().toISOString(),
    };

    if (await forward("payment", summary)) return { result: "forwarded" };

    console.info("[payment]", JSON.stringify(summary));
    return { result: "forwarded" };
  }

  const conn = db();
  const paidPesewas = toPesewas(input.amountGhs);

  const isNew = await recordPaymentEvent(conn, {
    eventKey: input.eventKey,
    reference: input.reference,
    event: input.event,
    amountPesewas: paidPesewas,
    payload: input.rawPayload,
  });

  if (!isNew) return { result: "duplicate" };

  if (!input.paid) {
    await markOrderFailed(conn, input.reference);
    return { result: "failed_recorded" };
  }

  const outcome = await markOrderPaid(conn, {
    reference: input.reference,
    paidPesewas,
    paidAt: input.paidAt,
    channel: input.channel,
  });

  try {
    await forward("payment", { ...input, outcome: outcome.result });
  } catch (error) {
    console.error("[payment] webhook mirror failed", input.reference, error);
  }

  return outcome;
}
