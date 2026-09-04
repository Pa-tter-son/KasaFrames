"use client";

import type { FieldErrors, LeadInput } from "@/lib/leads";

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: FieldErrors };

/** Posts a lead to /api/leads and normalises every failure into a message. */
export async function submitLead(input: LeadInput & { company?: string }): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; id?: string; error?: string; fields?: FieldErrors }
      | null;

    if (response.ok && data?.ok && data.id) {
      return { ok: true, id: data.id };
    }

    return {
      ok: false,
      error: data?.error ?? "Something went wrong. Please try again.",
      fields: data?.fields,
    };
  } catch {
    return { ok: false, error: "Network error. Check your connection or WhatsApp us instead." };
  }
}
