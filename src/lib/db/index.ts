import { Pool } from "pg";

/** Minimal surface both `pg` and the test harness satisfy. */
export interface Queryable {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

let pool: Pool | undefined;

/**
 * One pool per server instance, created lazily.
 *
 * Serverless invocations are short-lived and can pile up connections, so point
 * DATABASE_URL at a pooled endpoint (Neon's -pooler host, or Supabase's pgBouncer
 * port 6543) rather than the direct one.
 */
export function db(): Queryable {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 3),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      // Managed Postgres (Neon, Supabase, Render) terminates TLS with certs the
      // Node bundle doesn't chain to; the connection is still encrypted.
      ssl: process.env.DATABASE_SSL === "disable" ? undefined : { rejectUnauthorized: false },
    });
  }

  return pool;
}
