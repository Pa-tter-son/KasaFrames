import { NextResponse } from "next/server";
import { parseLead, saveLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

// Per-instance only: serverless spreads traffic across instances, so this trims
// accidental double-submits and casual spam rather than a determined flood. Put
// Vercel WAF or an Upstash-backed limiter in front when volume justifies it.
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseLead(body);
  if ("errors" in parsed) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", fields: parsed.errors },
      { status: 400 },
    );
  }

  try {
    const lead = await saveLead(parsed.lead);
    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("[lead] failed to save", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't save that. Please WhatsApp us instead." },
      { status: 502 },
    );
  }
}
