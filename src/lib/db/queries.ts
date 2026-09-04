import type { Queryable } from "@/lib/db";
import type { LeadInput } from "@/lib/leads";
import type { PricedLine } from "@/lib/pricing";

export interface InsertOrderInput {
  reference: string;
  email: string;
  amountPesewas: number;
  lines: PricedLine[];
}

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === UNIQUE_VIOLATION;
}

/**
 * Writes the order and its items.
 *
 * A retried checkout is harmless: references are generated per request, so a
 * unique violation on `reference` means the same request arrived twice, and the
 * items are skipped rather than doubled. Catching the constraint (rather than
 * checking first) leaves the database as the arbiter, so two concurrent retries
 * can't both decide they are the original.
 */
export async function insertOrder(db: Queryable, input: InsertOrderInput): Promise<boolean> {
  let inserted;

  try {
    inserted = await db.query(
      `INSERT INTO orders (reference, email, amount_pesewas)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [input.reference, input.email, input.amountPesewas],
    );
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }

  const row = inserted.rows[0] as { id: string | number } | undefined;
  if (!row) return false;

  for (const line of input.lines) {
    await db.query(
      `INSERT INTO order_items (
         order_id, product_id, product_name, size_label, material, finish,
         installation, qty, unit_pesewas, installation_pesewas, line_total_pesewas
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        row.id,
        line.productId,
        line.productName,
        line.sizeLabel,
        line.material,
        line.finish,
        line.installation,
        line.qty,
        line.unitGhs * 100,
        line.installationGhs * 100,
        line.lineTotalGhs * 100,
      ],
    );
  }

  return true;
}

/**
 * Records a webhook delivery. Returns false when this exact event has already
 * been stored, which is how a replayed delivery is recognised.
 */
export async function recordPaymentEvent(
  db: Queryable,
  input: {
    eventKey: string;
    reference: string;
    event: string;
    amountPesewas: number | null;
    payload: string;
  },
): Promise<boolean> {
  try {
    await db.query(
      `INSERT INTO payment_events (event_key, reference, event, amount_pesewas, payload)
       VALUES ($1, $2, $3, $4, $5)`,
      [input.eventKey, input.reference, input.event, input.amountPesewas, input.payload],
    );
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }

  return true;
}

export type PaymentOutcome =
  | { result: "paid" }
  | { result: "already_paid" }
  | { result: "unknown_reference" }
  | { result: "amount_mismatch"; expectedPesewas: number; paidPesewas: number };

/**
 * Marks an order paid, but only for the amount it was created with.
 *
 * The guard lives in the WHERE clause so the check and the write are one atomic
 * statement—no read-then-write race between concurrent deliveries, and no need
 * for an explicit lock. A second delivery updates nothing and reports
 * "already_paid"; an amount that doesn't match parks the order in
 * "amount_mismatch" for a human rather than quietly fulfilling it.
 */
export async function markOrderPaid(
  db: Queryable,
  input: { reference: string; paidPesewas: number; paidAt?: string; channel?: string },
): Promise<PaymentOutcome> {
  const updated = await db.query(
    `UPDATE orders
        SET status = 'paid',
            paid_at = COALESCE($3, now()),
            channel = $4,
            updated_at = now()
      WHERE reference = $1
        AND amount_pesewas = $2
        AND status <> 'paid'
      RETURNING id`,
    [input.reference, input.paidPesewas, input.paidAt ?? null, input.channel ?? null],
  );

  if (updated.rows.length > 0) return { result: "paid" };

  const existing = await db.query(
    `SELECT status, amount_pesewas FROM orders WHERE reference = $1`,
    [input.reference],
  );

  const order = existing.rows[0] as { status: string; amount_pesewas: string | number } | undefined;
  if (!order) return { result: "unknown_reference" };
  if (order.status === "paid") return { result: "already_paid" };

  const expectedPesewas = Number(order.amount_pesewas);

  await db.query(
    `UPDATE orders SET status = 'amount_mismatch', updated_at = now() WHERE reference = $1`,
    [input.reference],
  );

  return { result: "amount_mismatch", expectedPesewas, paidPesewas: input.paidPesewas };
}

/** A failed charge doesn't disturb an order that has already been paid. */
export async function markOrderFailed(db: Queryable, reference: string): Promise<boolean> {
  const result = await db.query(
    `UPDATE orders
        SET status = 'failed', updated_at = now()
      WHERE reference = $1 AND status = 'pending'
      RETURNING id`,
    [reference],
  );

  return result.rows.length > 0;
}

export async function insertLead(db: Queryable, lead: LeadInput & { id?: string }) {
  await db.query(
    `INSERT INTO leads (
       type, name, email, phone, message, consultation_mode,
       slot, dimensions, preferences, photo_count, source
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      lead.type,
      lead.name,
      lead.email,
      lead.phone ?? null,
      lead.message ?? null,
      lead.consultationMode ?? null,
      lead.slot ?? null,
      lead.dimensions ?? null,
      lead.preferences ?? null,
      lead.photoCount ?? null,
      lead.source ?? null,
    ],
  );
}
