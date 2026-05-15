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
import { whatsappLink } from "@/lib/utils";
import { CalendarDays, MessageCircle } from "lucide-react";

const slots = [
  { day: "Mon", date: "May 19", times: ["10:00", "13:30", "16:00"] },
  { day: "Tue", date: "May 20", times: ["09:30", "12:00", "15:30"] },
  { day: "Wed", date: "May 21", times: ["11:00", "14:00"] },
  { day: "Thu", date: "May 22", times: ["10:30", "13:00", "17:00"] },
];

export function ConsultationBooker() {
  const [submitted, setSubmitted] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<"visit" | "virtual">("visit");

  const waPrefill = useMemo(() => {
    return whatsappLink(
      `Hello KasaFrames — I'd like to book a ${mode} consultation.${slot ? ` Preferred slot: ${slot}.` : ""}`,
    );
  }, [mode, slot]);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <section className="lg:col-span-7">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display text-2xl font-semibold">Project details</h2>
          <p className="mt-2 text-sm text-kasa-muted dark:text-kasa-sand/80">
            Share dimensions and references. Our studio responds within 48 hours—often sooner.
          </p>

          <form
            className="mt-8 grid gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required placeholder="Ama Serwaa" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required placeholder="+233 …" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@domain.com" />
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
              <Input id="dims" name="dims" placeholder="e.g. 420w × 280h" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prefs">Style preferences</Label>
              <Textarea id="prefs" name="prefs" placeholder="Minimal, warm neutrals, ring frames, stair gallery…" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="photos">Upload wall pictures</Label>
              <Input id="photos" name="photos" type="file" accept="image/*" multiple />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" className="flex-1">
                Submit request
              </Button>
              <Button asChild type="button" size="lg" variant="secondary" className="flex-1">
                <a href={waPrefill} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {submitted ? (
              <p className="rounded-2xl border border-kasa-gold/30 bg-kasa-gold/10 px-4 py-3 text-sm text-kasa-black dark:text-kasa-cream">
                Thank you—your request is logged for this MVP demo. Wire this form to your CRM or email API in production.
              </p>
            ) : null}
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
