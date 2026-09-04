import crypto from "node:crypto";

/** Override only for tests; production talks to Paystack directly. */
const API_BASE = process.env.PAYSTACK_API_BASE ?? "https://api.paystack.co";

export function paystackSecret() {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

export function isPaystackConfigured() {
  return paystackSecret().length > 0;
}

export interface InitializeInput {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

interface PaystackInitializeResponse {
  status?: boolean;
  message?: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
  };
}

/**
 * Creates a Paystack transaction and returns the hosted checkout URL.
 *
 * The secret key never leaves the server, and the amount comes from
 * priceCart()—never from the request body.
 */
export async function initializeTransaction(input: InitializeInput): Promise<InitializeResult> {
  const response = await fetch(`${API_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${paystackSecret()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountPesewas,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    signal: AbortSignal.timeout(15000),
  });

  const payload = (await response.json().catch(() => null)) as PaystackInitializeResponse | null;

  if (!response.ok || !payload?.status || !payload.data?.authorization_url) {
    throw new Error(
      `Paystack initialize failed (${response.status}): ${payload?.message ?? "unreadable response"}`,
    );
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    accessCode: payload.data.access_code ?? "",
    reference: payload.data.reference ?? input.reference,
  };
}

export interface VerifiedTransaction {
  status: string;
  reference: string;
  amountGhs: number;
  paidAt?: string;
  channel?: string;
}

/**
 * Server-side confirmation of a single transaction.
 *
 * The customer returning from Paystack proves nothing on its own, so the
 * confirmation page asks Paystack directly rather than trusting the redirect.
 */
export async function verifyTransaction(reference: string): Promise<VerifiedTransaction | null> {
  const response = await fetch(`${API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { authorization: `Bearer ${paystackSecret()}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean;
    data?: { status?: string; reference?: string; amount?: number; paid_at?: string; channel?: string };
  } | null;

  if (!payload?.status || !payload.data?.status) return null;

  return {
    status: payload.data.status,
    reference: payload.data.reference ?? reference,
    amountGhs: (payload.data.amount ?? 0) / 100,
    paidAt: payload.data.paid_at,
    channel: payload.data.channel,
  };
}

/**
 * Verifies the x-paystack-signature header: HMAC-SHA512 of the raw request body
 * keyed with the secret. Compare against the bytes as received—re-serialising
 * parsed JSON changes them and the digest stops matching.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = paystackSecret();
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");
  const received = signature.trim().toLowerCase();

  if (received.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"));
}

/** Human-readable, collision-resistant, and safe for Paystack's reference field. */
export function newOrderReference() {
  return `KF-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
}
