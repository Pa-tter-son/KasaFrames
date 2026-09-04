import type { PricedCart } from "@/lib/pricing";

export type OrderStatus = "pending" | "paid" | "failed";

export interface OrderRecord {
  reference: string;
  status: OrderStatus;
  email: string;
  amountGhs: number;
  lines: PricedCart["lines"];
  createdAt: string;
}

export interface PaymentRecord {
  reference: string;
  event: string;
  status: OrderStatus;
  amountGhs: number;
  paidAt?: string;
  channel?: string;
  receivedAt: string;
}

/**
 * Records an order at checkout time (status "pending") and again when the
 * webhook confirms payment.
 *
 * Same seam as saveLead(): forwards to ORDERS_WEBHOOK_URL when set, otherwise
 * logs a structured line. Swapping in Postgres means writing the INSERT/UPDATE
 * here—an `orders` row keyed by `reference`, which is unique per checkout.
 */
export async function saveOrder(order: OrderRecord | PaymentRecord, kind: "order" | "payment") {
  const webhookUrl = process.env.ORDERS_WEBHOOK_URL;

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.ORDERS_WEBHOOK_TOKEN
          ? { authorization: `Bearer ${process.env.ORDERS_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ kind, ...order }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Orders webhook responded ${response.status}`);
    }

    return;
  }

  console.info(`[${kind}]`, JSON.stringify(order));
}
