-- KasaFrames schema. Apply with:
--   psql "$DATABASE_URL" -f src/lib/db/schema.sql
-- Every statement is idempotent, so re-running it is safe.
--
-- Money is stored in pesewas (integers). Floating-point cedis would drift, and
-- Paystack speaks in the minor unit anyway.

CREATE TABLE IF NOT EXISTS orders (
  id             BIGSERIAL PRIMARY KEY,
  reference      TEXT NOT NULL UNIQUE,
  email          TEXT NOT NULL,
  amount_pesewas BIGINT NOT NULL CHECK (amount_pesewas > 0),
  currency       TEXT NOT NULL DEFAULT 'GHS',
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'paid', 'failed', 'amount_mismatch')),
  paid_at        TIMESTAMPTZ,
  channel        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email);

CREATE TABLE IF NOT EXISTS order_items (
  id                   BIGSERIAL PRIMARY KEY,
  order_id             BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id           TEXT NOT NULL,
  product_name         TEXT NOT NULL,
  size_label           TEXT NOT NULL,
  material             TEXT NOT NULL,
  finish               TEXT NOT NULL,
  installation         BOOLEAN NOT NULL,
  qty                  INTEGER NOT NULL CHECK (qty > 0),
  unit_pesewas         BIGINT NOT NULL,
  installation_pesewas BIGINT NOT NULL,
  line_total_pesewas   BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);

-- Append-only audit of what Paystack sent. event_key is what makes replayed
-- webhooks harmless: the second delivery of the same event is discarded.
CREATE TABLE IF NOT EXISTS payment_events (
  id             BIGSERIAL PRIMARY KEY,
  event_key      TEXT NOT NULL UNIQUE,
  reference      TEXT NOT NULL,
  event          TEXT NOT NULL,
  amount_pesewas BIGINT,
  payload        TEXT NOT NULL,
  received_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_events_reference_idx ON payment_events (reference);

CREATE TABLE IF NOT EXISTS leads (
  id                 BIGSERIAL PRIMARY KEY,
  type               TEXT NOT NULL CHECK (type IN ('contact', 'consultation')),
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT,
  message            TEXT,
  consultation_mode  TEXT,
  slot               TEXT,
  dimensions         TEXT,
  preferences        TEXT,
  photo_count        INTEGER,
  source             TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at);
