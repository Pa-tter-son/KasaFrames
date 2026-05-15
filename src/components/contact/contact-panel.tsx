"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappLink } from "@/lib/utils";
import { Instagram, MessageCircle, Phone } from "lucide-react";

const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

export function ContactPanel() {
  const [sent, setSent] = useState(false);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section className="lg:col-span-5">
        <div className="rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
          <h2 className="font-display text-2xl font-semibold">Send a note</h2>
          <p className="mt-2 text-sm text-kasa-muted dark:text-kasa-sand/80">We reply quickly—especially on WhatsApp.</p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" required placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cemail">Email</Label>
              <Input id="cemail" type="email" required placeholder="you@domain.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cmsg">Message</Label>
              <Textarea id="cmsg" required placeholder="Tell us about your wall project…" />
            </div>
            <Button type="submit" className="w-full">
              Send message
            </Button>
            {sent ? (
              <p className="text-sm text-kasa-muted">
                Thanks—this MVP demo doesn’t POST yet. Wire this form to your API route or form provider.
              </p>
            ) : null}
          </form>

          <div className="mt-8 grid gap-3">
            <Button asChild variant="secondary" className="w-full justify-start">
              <a href={whatsappLink("Hello KasaFrames — I'd like to speak with the studio.")} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp concierge
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="tel:+233000000000">
                <Phone className="h-4 w-4" />
                {process.env.NEXT_PUBLIC_BRAND_PHONE ?? "+233 00 000 0000"}
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <Instagram className="h-4 w-4" />
                Instagram @kasaframes
              </a>
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-kasa-black/10 bg-kasa-sand/25 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            <p className="font-medium">Hours</p>
            <p className="mt-2 text-kasa-muted dark:text-kasa-sand/80">Tue–Sat · 10:00–18:00 GMT</p>
            <p className="mt-1 text-kasa-muted dark:text-kasa-sand/80">Studio visits by appointment.</p>
          </div>
        </div>
      </section>

      <section className="lg:col-span-7">
        <div className="overflow-hidden rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <div className="aspect-[16/11] w-full">
            {mapUrl ? (
              <iframe title="KasaFrames map" src={mapUrl} className="h-full w-full border-0" loading="lazy" />
            ) : (
              <div className="flex h-full items-center justify-center bg-kasa-sand/30 p-8 text-sm text-kasa-muted">
                Set <span className="mx-1 font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL</span> in{" "}
                <span className="mx-1 font-mono text-xs">.env.local</span> to enable the map embed.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-8 text-kasa-cream dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kasa-gold">Instagram feed</p>
          <p className="mt-3 text-sm text-kasa-sand/80">
            Embed Curator.io, Mintt, or Meta’s official embed via oEmbed in a Server Component—keep it lightweight and cacheable.
          </p>
        </div>
      </section>
    </div>
  );
}
