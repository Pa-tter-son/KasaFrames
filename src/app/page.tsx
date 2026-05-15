import Link from "next/link";
import { HomeHero } from "@/components/home/home-hero";
import { BeforeAfterSection } from "@/components/home/before-after";
import { InteractiveGallery } from "@/components/home/interactive-gallery";
import { CollectionsPreview } from "@/components/home/collections-preview";
import { ProcessSection } from "@/components/home/process-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { InstallShowcase } from "@/components/home/install-showcase";
import { FaqSection } from "@/components/home/faq-section";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <BeforeAfterSection />
      <InteractiveGallery />
      <CollectionsPreview />
      <ProcessSection />
      <TestimonialsSection />
      <InstallShowcase />
      <FaqSection />
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-kasa-black/10 bg-kasa-black px-8 py-14 text-kasa-cream dark:border-white/10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-kasa-gold/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Start quietly. End dramatically.</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl text-balance">
              Book a consultation and we’ll design your wall like a composition.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="gold">
                <Link href="/book">Book consultation</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-white/15 bg-white/5 text-kasa-cream hover:bg-white/10"
              >
                <Link href="/contact">Contact studio</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
