"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitLead } from "@/lib/lead-client";
import type { FieldErrors } from "@/lib/leads";
import { whatsappLink } from "@/lib/utils";
import { CalendarDays, MessageCircle } from "lucide-react";

const slots = [
  { day: "Mon", date: "May 19", times: ["10:00", "13:30", "16:00"] },
  { day: "Tue", date: "May 20", times: ["09:30", "12:00", "15:30"] },
  { day: "Wed", date: "May 21", times: ["11:00", "14:00"] },
  { day: "Thu", date: "May 22", times: ["10:30", "13:00", "17:00"] },
];

export function ConsultationBooker() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<"visit" | "virtual">("visit");

  const waPrefill = useMemo(() => {
    return whatsappLink(
      `Hello KasaFrames — I'd like to book a ${mode} consultation.${slot ? ` Preferred slot: ${slot}.` : ""}`,
    );
  }, [mode, slot]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFields({});

    const result = await submitLead({
      type: "consultation",
      name,
      email,
      phone,
      consultationMode: mode,
      slot: slot ?? undefined,
      dimensions,
      preferences,
      photoCount,
      company,
      source: "book-page",
    });

    setPending(false);

    if (result.ok) {
      setSubmitted(true);
      setName("");
      setPhone("");
      setEmail("");
      setDimensions("");
      setPreferences("");
      setPhotoCount(0);
      return;
    }

    setError(result.error);
    setFields(result.fields ?? {});
  }

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <section className="lg:col-span-7">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display text-2xl font-semibold">Project details</h2>
          <p className="mt-2 text-sm text-kasa-muted dark:text-kasa-sand/80">
            Share dimensions and references. Our studio responds within 48 hours—often sooner.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Ama Serwaa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(fields.name)}
                />
                {fields.name ? <p className="text-xs text-red-600">{fields.name}</p> : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="+233 …"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={Boolean(fields.phone)}
                />
                {fields.phone ? <p className="text-xs text-red-600">{fields.phone}</p> : null}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(fields.email)}
              />
              {fields.email ? <p className="text-xs text-red-600">{fields.email}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label>Consultation type</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "visit" | "virtual")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visit">Home visit (Greater Accra)</SelectItem>
                  <SelectItem value="virtual">Virtual consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dims">Wall dimensions (cm)</Label>
              <Input
                id="dims"
                name="dims"
                placeholder="e.g. 420w × 280h"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                aria-invalid={Boolean(fields.dimensions)}
              />
              {fields.dimensions ? <p className="text-xs text-red-600">{fields.dimensions}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prefs">Style preferences</Label>
              <Textarea
                id="prefs"
                name="prefs"
                placeholder="Minimal, warm neutrals, ring frames, stair gallery…"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                aria-invalid={Boolean(fields.preferences)}
              />
              {fields.preferences ? <p className="text-xs text-red-600">{fields.preferences}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photos">Upload wall pictures</Label>
              <Input
                id="photos"
                name="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotoCount(e.target.files?.length ?? 0)}
              />
              <p className="text-xs text-kasa-muted dark:text-kasa-sand/70">
                We record how many photos you selected and request them over WhatsApp—file uploads arrive with the
                object-storage step.
              </p>
            </div>

            {/* Honeypot: hidden from people, irresistible to bots. */}
            <div className="hidden" aria-hidden="true">
              <Label htmlFor="bcompany">Company</Label>
              <Input
                id="bcompany"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" className="flex-1" disabled={pending}>
                {pending ? "Submitting…" : "Submit request"}
              </Button>
              <Button asChild type="button" size="lg" variant="secondary" className="flex-1">
                <a href={waPrefill} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            <p aria-live="polite" className="sr-only">
              {pending ? "Submitting your request" : submitted ? "Request submitted" : error ?? ""}
            </p>

            {submitted ? (
              <p className="rounded-2xl border border-kasa-gold/30 bg-kasa-gold/10 px-4 py-3 text-sm text-kasa-black dark:text-kasa-cream">
                Thank you—your request is with the studio.
                {slot
                  ? ` We will confirm ${slot} by email or WhatsApp.`
                  : " We will confirm a slot by email or WhatsApp."}
              </p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </div>
      </section>

      <section className="lg:col-span-5">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-8 text-kasa-cream dark:border-white/10">
          <div className="flex items-center gap-2 text-kasa-gold">
            <CalendarDays className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em]">Calendly-style</p>
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold">Pick a starting slot</h2>
          <p className="mt-2 text-sm text-kasa-sand/80">
            Select a time to anchor your booking. Final confirmation happens over WhatsApp or email.
          </p>

          <div className="mt-8 space-y-6">
            {slots.map((d) => (
              <div key={d.date}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-sand/70">
                  {d.day} · {d.date}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.times.map((t) => {
                    const key = `${d.date} ${t}`;
                    const active = slot === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSlot(key)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                          active ? "bg-kasa-gold text-kasa-black" : "bg-white/10 hover:bg-white/15"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs leading-relaxed text-kasa-sand/70">
            Email notifications: connect to Resend, SendGrid, or Postmark via a Route Handler. Calendar sync: Cal.com or Calendly embed can replace this grid.
          </p>
        </div>
      </section>
    </div>
  );
}
