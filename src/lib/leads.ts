import { db, isDatabaseConfigured } from "@/lib/db";
import { insertLead } from "@/lib/db/queries";

export type LeadType = "contact" | "consultation";
export type ConsultationMode = "visit" | "virtual";

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consultationMode?: ConsultationMode;
  slot?: string;
  dimensions?: string;
  preferences?: string;
  photoCount?: number;
  source?: string;
  createdAt: string;
}

export type LeadInput = Omit<Lead, "id" | "createdAt">;

export interface FieldErrors {
  [field: string]: string;
}

const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  message: 4000,
  slot: 80,
  dimensions: 120,
  preferences: 4000,
  source: 200,
} as const;

// Deliberately permissive: the server rejects obvious junk, the mail provider is
// the real deliverability check.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates and normalises an untrusted request body into a LeadInput.
 * Returns field-keyed errors so the client can highlight the offending input.
 */
export function parseLead(body: unknown): { lead: LeadInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (typeof body !== "object" || body === null) {
    return { errors: { form: "Expected a JSON object." } };
  }

  const raw = body as Record<string, unknown>;

  // Honeypot: bots fill every field they find, humans never see this one.
  if (asTrimmedString(raw.company)) {
    return { errors: { form: "Rejected." } };
  }

  const type = asTrimmedString(raw.type);
  if (type !== "contact" && type !== "consultation") {
    errors.type = "Unknown lead type.";
  }

  const name = asTrimmedString(raw.name);
  if (!name) errors.name = "Name is required.";
  else if (name.length > LIMITS.name) errors.name = `Keep this under ${LIMITS.name} characters.`;

  const email = asTrimmedString(raw.email).toLowerCase();
  if (!email) errors.email = "Email is required.";
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  const phone = asTrimmedString(raw.phone);
  if (phone.length > LIMITS.phone) errors.phone = `Keep this under ${LIMITS.phone} characters.`;
  if (type === "consultation" && !phone) errors.phone = "Phone is required for a consultation.";

  const message = asTrimmedString(raw.message);
  if (message.length > LIMITS.message) errors.message = `Keep this under ${LIMITS.message} characters.`;
  if (type === "contact" && !message) errors.message = "Tell us about your project.";

  const consultationMode = asTrimmedString(raw.consultationMode);
  if (consultationMode && consultationMode !== "visit" && consultationMode !== "virtual") {
    errors.consultationMode = "Choose a home visit or a virtual consultation.";
  }

  const slot = asTrimmedString(raw.slot);
  if (slot.length > LIMITS.slot) errors.slot = `Keep this under ${LIMITS.slot} characters.`;

  const dimensions = asTrimmedString(raw.dimensions);
  if (dimensions.length > LIMITS.dimensions) errors.dimensions = `Keep this under ${LIMITS.dimensions} characters.`;

  const preferences = asTrimmedString(raw.preferences);
  if (preferences.length > LIMITS.preferences) {
    errors.preferences = `Keep this under ${LIMITS.preferences} characters.`;
  }

  const photoCountRaw = raw.photoCount;
  const photoCount = typeof photoCountRaw === "number" && Number.isFinite(photoCountRaw)
    ? Math.max(0, Math.min(50, Math.trunc(photoCountRaw)))
    : undefined;

  const source = asTrimmedString(raw.source).slice(0, LIMITS.source);

  if (Object.keys(errors).length > 0) return { errors };

  return {
    lead: {
      type: type as LeadType,
      name,
      email,
      phone: phone || undefined,
      message: message || undefined,
      consultationMode: (consultationMode || undefined) as ConsultationMode | undefined,
      slot: slot || undefined,
      dimensions: dimensions || undefined,
      preferences: preferences || undefined,
      photoCount,
      source: source || undefined,
    },
  };
}

/**
 * Persists a lead.
 *
 * Postgres when DATABASE_URL is set, otherwise the LEADS_WEBHOOK_URL forward
 * (Airtable/Zapier/Make/Slack), otherwise a structured line in the runtime logs.
 * Every path is behind this one function, so the route and the forms never need
 * to know which is active.
 */
export async function saveLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured()) {
    await insertLead(db(), input);
    return lead;
  }

  const webhookUrl = process.env.LEADS_WEBHOOK_URL;

  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.LEADS_WEBHOOK_TOKEN
          ? { authorization: `Bearer ${process.env.LEADS_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Lead webhook responded ${response.status}`);
    }

    return lead;
  }

  console.info("[lead]", JSON.stringify(lead));

  return lead;
}
