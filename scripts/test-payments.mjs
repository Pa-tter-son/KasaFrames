// Exercises the payment SQL against an in-memory Postgres.
//
// Run with: npm run test:payments
//
// The reconciliation rules here are the ones that decide whether an order counts
// as paid, so they are worth testing without a live database in the loop.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { newDb } from "pg-mem";

import {
  insertLead,
  insertOrder,
  markOrderFailed,
  markOrderPaid,
  recordPaymentEvent,
} from "../src/lib/db/queries.ts";

const schema = readFileSync(
  fileURLToPath(new URL("../src/lib/db/schema.sql", import.meta.url)),
  "utf8",
);

function freshDb() {
  const mem = newDb();
  mem.public.none(schema);
  const { Pool } = mem.adapters.createPg();
  return new Pool();
}

const line = {
  productId: "wg-black-60",
  productName: "Glossy Ring — Onyx",
  sizeLabel: "50 × 70",
  material: "wood",
  finish: "matte-black",
  installation: false,
  qty: 1,
  unitGhs: 890,
  installationGhs: 0,
  lineTotalGhs: 890,
};

const order = { reference: "KF-TEST-1", email: "ama@example.com", amountPesewas: 89000, lines: [line] };

test("insertOrder writes the order and its items", async () => {
  const db = freshDb();
  assert.equal(await insertOrder(db, order), true);

  const orders = await db.query("SELECT reference, status, amount_pesewas FROM orders");
  assert.equal(orders.rows.length, 1);
  assert.equal(orders.rows[0].status, "pending");
  assert.equal(Number(orders.rows[0].amount_pesewas), 89000);

  const items = await db.query("SELECT product_name, line_total_pesewas FROM order_items");
  assert.equal(items.rows.length, 1);
  assert.equal(Number(items.rows[0].line_total_pesewas), 89000);
});

test("a repeated checkout does not duplicate the order or its items", async () => {
  const db = freshDb();
  await insertOrder(db, order);
  assert.equal(await insertOrder(db, order), false);

  const orders = await db.query("SELECT id FROM orders");
  const items = await db.query("SELECT id FROM order_items");
  assert.equal(orders.rows.length, 1);
  assert.equal(items.rows.length, 1, "items must not double up on a retried insert");
});

test("a matching payment marks the order paid", async () => {
  const db = freshDb();
  await insertOrder(db, order);

  const outcome = await markOrderPaid(db, {
    reference: "KF-TEST-1",
    paidPesewas: 89000,
    paidAt: "2026-09-04T03:00:00Z",
    channel: "mobile_money",
  });

  assert.deepEqual(outcome, { result: "paid" });

  const rows = await db.query("SELECT status, channel FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "paid");
  assert.equal(rows.rows[0].channel, "mobile_money");
});

test("a replayed payment is a no-op, not a second payment", async () => {
  const db = freshDb();
  await insertOrder(db, order);
  await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 89000 });

  const second = await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 89000 });
  assert.deepEqual(second, { result: "already_paid" });

  const rows = await db.query("SELECT status FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "paid");
});

test("underpayment never marks the order paid", async () => {
  const db = freshDb();
  await insertOrder(db, order);

  const outcome = await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 100 });
  assert.equal(outcome.result, "amount_mismatch");
  assert.equal(outcome.expectedPesewas, 89000);
  assert.equal(outcome.paidPesewas, 100);

  const rows = await db.query("SELECT status FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "amount_mismatch");
  assert.notEqual(rows.rows[0].status, "paid");
});

test("overpayment is also parked rather than fulfilled", async () => {
  const db = freshDb();
  await insertOrder(db, order);

  const outcome = await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 900000 });
  assert.equal(outcome.result, "amount_mismatch");

  const rows = await db.query("SELECT status FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "amount_mismatch");
});

test("a payment for an unknown reference is reported, not invented", async () => {
  const db = freshDb();
  const outcome = await markOrderPaid(db, { reference: "KF-NOPE", paidPesewas: 89000 });
  assert.deepEqual(outcome, { result: "unknown_reference" });
});

test("payment events deduplicate on event_key", async () => {
  const db = freshDb();
  const event = {
    eventKey: "charge.success:12345",
    reference: "KF-TEST-1",
    event: "charge.success",
    amountPesewas: 89000,
    payload: '{"event":"charge.success"}',
  };

  assert.equal(await recordPaymentEvent(db, event), true);
  assert.equal(await recordPaymentEvent(db, event), false, "a replayed delivery must be recognised");

  const rows = await db.query("SELECT id FROM payment_events");
  assert.equal(rows.rows.length, 1);
});

test("charge.failed marks a pending order failed", async () => {
  const db = freshDb();
  await insertOrder(db, order);

  assert.equal(await markOrderFailed(db, "KF-TEST-1"), true);
  const rows = await db.query("SELECT status FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "failed");
});

test("a late failure cannot undo a paid order", async () => {
  const db = freshDb();
  await insertOrder(db, order);
  await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 89000 });

  assert.equal(await markOrderFailed(db, "KF-TEST-1"), false);
  const rows = await db.query("SELECT status FROM orders WHERE reference = 'KF-TEST-1'");
  assert.equal(rows.rows[0].status, "paid", "a stray charge.failed must not unpay a paid order");
});

test("a retried payment succeeds after an earlier failure", async () => {
  const db = freshDb();
  await insertOrder(db, order);
  await markOrderFailed(db, "KF-TEST-1");

  const outcome = await markOrderPaid(db, { reference: "KF-TEST-1", paidPesewas: 89000 });
  assert.deepEqual(outcome, { result: "paid" });
});

test("insertLead stores a consultation", async () => {
  const db = freshDb();
  await insertLead(db, {
    type: "consultation",
    name: "Kwesi Mensah",
    email: "kwesi@example.com",
    phone: "+233201112222",
    consultationMode: "visit",
    slot: "May 20 12:00",
    photoCount: 3,
    source: "book-page",
  });

  const rows = await db.query("SELECT type, name, slot, photo_count FROM leads");
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0].type, "consultation");
  assert.equal(rows.rows[0].slot, "May 20 12:00");
  assert.equal(Number(rows.rows[0].photo_count), 3);
});
