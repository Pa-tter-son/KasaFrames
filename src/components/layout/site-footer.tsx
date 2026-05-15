import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/utils";

const footerNav = [
  { href: "/collections", label: "Collections" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/book", label: "Consultation" },
  { href: "/gallery", label: "Portfolio" },
  { href: "/installation", label: "Installation" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-kasa-black/10 bg-kasa-black text-kasa-cream dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-3xl font-semibold tracking-tight">
              Kasa<span className="text-kasa-gold">Frames</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-kasa-sand/80">
              We transform empty walls into modern statement spaces—through curation, craft, and precision installation
              across Accra.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/book">Book consultation</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="border-white/15 bg-white/5 text-kasa-cream">
                <a href={whatsappLink("Hello KasaFrames — I'd love guidance on a wall project.")} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">Explore</p>
              <ul className="mt-4 space-y-2 text-sm text-kasa-sand/80">
                {footerNav.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition hover:text-kasa-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">Visit</p>
              <p className="mt-4 text-sm leading-relaxed text-kasa-sand/80">
                Accra, Greater Accra
                <br />
                By appointment
              </p>
              <p className="mt-4 text-sm text-kasa-sand/80">
                Phone:{" "}
                <a className="text-kasa-cream underline-offset-4 hover:underline" href="tel:+233000000000">
                  {process.env.NEXT_PUBLIC_BRAND_PHONE ?? "+233 00 000 0000"}
                </a>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">Social</p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-kasa-sand/80 transition hover:text-kasa-cream"
              >
                <Instagram className="h-4 w-4" />
                @kasaframes
              </a>
              <p className="mt-6 text-xs leading-relaxed text-kasa-sand/60">
                Architecture for your walls. Not a print shop—an interior aesthetics studio.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-kasa-sand/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KasaFrames. All rights reserved.</p>
          <p className="text-kasa-sand/50">Designed for Ghana · Built for the world</p>
        </div>
      </div>
    </footer>
  );
}
