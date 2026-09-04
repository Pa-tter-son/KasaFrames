import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collections, INSTALLATION_GHS, products } from "@/lib/data/catalog";
import { BRAND_PHONE_DISPLAY, formatGhs, whatsappLink } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "How we work",
  description:
    "Kasa Frames service terms: pricing, the 50% deposit, site visit transport, production times, installation, and how we handle your photographs.",
};

const sections = [
  { id: "services", label: "Ways to order" },
  { id: "pricing", label: "Pricing" },
  { id: "deposit", label: "Deposit & payment" },
  { id: "site-visits", label: "Site visits" },
  { id: "timelines", label: "Timelines" },
  { id: "installation", label: "Delivery & installation" },
  { id: "changes", label: "Changes & cancellations" },
  { id: "refunds", label: "Refunds & remakes" },
  { id: "photographs", label: "Your photographs" },
  { id: "privacy", label: "Privacy" },
];

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Service terms</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
          How we work, in plain terms.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          What you pay, when you pay it, how long it takes, and what happens to the photographs you send us. No
          surprises at the door.
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <nav className="lg:col-span-3">
          <div className="sticky top-24 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kasa-gold">On this page</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-kasa-muted underline-offset-4 transition hover:text-kasa-black hover:underline dark:text-kasa-sand/80 dark:hover:text-kasa-cream"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="lg:col-span-9">
          <div className="grid gap-10">
            <Section id="services" title="Three ways to order">
              <p>
                Every project starts with a free consultation over WhatsApp, phone, or video call. From there you can
                take any of three routes:
              </p>
              <dl className="mt-5 grid gap-4">
                <Term term="Full service — site visit, supply and installation">
                  We visit your space, help you choose the frame type, size and content, coordinate production,
                  deliver, and install. You pay the frame price plus {formatGhs(INSTALLATION_GHS)} installation per
                  frame. Site visit transport is charged separately, and agreed before we travel.
                </Term>
                <Term term="Supply and delivery — no installation">
                  For clients happy to hang the frames themselves. We source, coordinate production and deliver. You
                  pay the frame price and the delivery cost. No installation fee.
                </Term>
                <Term term="Single frame orders">
                  One or a few frames without a full project, arranged over WhatsApp. You pay the frame price and
                  delivery.
                </Term>
              </dl>
            </Section>

            <Section id="pricing" title="Pricing">
              <p>
                Prices are per frame, in Ghana Cedis, quoted by size in inches. They are published in full on each
                frame type&rsquo;s page — nothing is quoted on request and nothing is marked up at checkout.
              </p>
              <ul className="mt-4 grid gap-2">
                {collections.map((collection) => {
                  const product = products.find((p) => p.collection === collection.slug);
                  if (!product) return null;
                  const from = Math.min(...product.sizes.map((s) => s.frameGhs));
                  return (
                    <li key={collection.slug} className="flex items-baseline justify-between gap-4">
                      <Link
                        href={`/collections/${collection.slug}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {collection.title}
                      </Link>
                      <span className="text-sm text-kasa-muted dark:text-kasa-sand/70">
                        from {formatGhs(from)} per frame
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4">
                Installation is a flat {formatGhs(INSTALLATION_GHS)} per frame, whichever type you choose. If a size
                you want is not on the list, ask us — we can order custom sizes, but we will quote you before
                anything is made.
              </p>
            </Section>

            <Section id="deposit" title="Deposit and payment">
              <p>
                <strong>A 50% deposit is required before any order is placed with the manufacturer.</strong> Every
                piece is made to order, so nothing goes into production until the deposit is received. The balance is
                due on delivery and installation.
              </p>
              <p className="mt-3">
                Card and mobile money payments are handled by Paystack. We never see or store your card details.
              </p>
            </Section>

            <Section id="site-visits" title="Site visits">
              <p>
                We come to you to measure the wall, read the light, and talk through what will suit the space.
                Transport is charged at the prevailing Uber or Bolt fare for the trip, and{" "}
                <strong>we confirm that amount with you before the visit is scheduled</strong>. There is no separate
                consultation fee.
              </p>
              <p className="mt-3">
                If a visit is not practical, a video call covers most of the same ground.
              </p>
            </Section>

            <Section id="timelines" title="Timelines">
              <p>
                Frames are typically produced within <strong>3 to 7 days</strong> of the order being placed with the
                manufacturer, which happens once your deposit is received. We work with more than one manufacturer so
                a single delay does not stall your project, and we will tell you the expected date when we take the
                deposit.
              </p>
            </Section>

            <Section id="installation" title="Delivery and installation">
              <p>
                We collect the finished frames and inspect them before they come anywhere near your wall. Anything
                that does not meet the standard goes back.
              </p>
              <p className="mt-3">
                Installation is {formatGhs(INSTALLATION_GHS)} per frame and includes setting out, levelling and
                fixing. We walk the finished wall with you before we leave.
              </p>
            </Section>

            <Section id="changes" title="Changes and cancellations">
              <p>
                Because every piece is made to order, the moment that matters is when we place the order with the
                manufacturer — which is after your deposit clears.
              </p>
              <p className="mt-3">
                <strong>Before that point, changes and cancellations cost nothing.</strong> Tell us and we will hold
                the order. After production has started, talk to us as early as you can and we will tell you honestly
                what can still be changed and what has already been committed.
              </p>
            </Section>

            <Section id="refunds" title="Refunds and remakes">
              <p>
                Every frame is printed and built for one customer, which is why this is not a shop where anything
                can go back on a shelf. What follows is the line we hold in both directions.
              </p>

              <dl className="mt-5 grid gap-4">
                <Term term="If we got it wrong — we remake it, free">
                  Wrong size, wrong finish, the wrong image, a crooked mount, a scratch, a bad print, damage in
                  transit: tell us and we remake the piece at our cost. If you would rather not wait for a remake, we
                  refund that piece in full. This is not time-limited by us for a manufacturing fault — but tell us
                  as soon as you see it, and within <strong>7 days of delivery</strong> for anything that could have
                  happened after we left, like transit damage. A photograph is usually all the evidence we need.
                </Term>

                <Term term="Before production — full refund of your deposit">
                  Nothing is ordered until your deposit clears. Cancel before we place the order with the
                  manufacturer and you get <strong>100% of your deposit back</strong>, no questions and no fee.
                </Term>

                <Term term="After production has started — the deposit covers the work">
                  Once the frames are being made, the materials and labour are committed and we have already paid
                  for them. If you cancel at that point we keep the deposit, <strong>you owe nothing further</strong>,
                  and the finished pieces are yours to collect if you want them. If we have not yet started on part
                  of a larger order, we refund the deposit on that part.
                </Term>

                <Term term="Changed your mind about a finished frame">
                  A correctly made piece cannot be resold, so a change of heart is not something we can refund. What
                  we will do is put the value toward a replacement print in the same frame — you pay the difference
                  in materials, not the whole piece again. Ask within <strong>14 days of delivery</strong>.
                </Term>

                <Term term="If the image you sent us was the problem">
                  Low-resolution or poorly cropped files are the one thing we cannot fix after printing. We will
                  always warn you before printing if a file is too small, and we will not print something we expect
                  you to be unhappy with. If we printed what you approved and the file was the limitation, a reprint
                  is charged at the frame price without the installation fee.
                </Term>

                <Term term="If we cancel or cannot deliver">
                  If we cannot complete your order for any reason, you receive a <strong>full refund of everything
                  paid</strong>, including the deposit.
                </Term>
              </dl>

              <p className="mt-5">
                Refunds go back the way they came — the same card, mobile money wallet or bank account — within{" "}
                <strong>5 to 10 working days</strong> of us agreeing them. Site visit transport already travelled is
                not refundable, since that fare has been paid to the driver.
              </p>
            </Section>

            <Section id="photographs" title="Your photographs">
              <p>
                The images you send us are used for one thing: producing your frames. We share them with the
                manufacturer printing your order and nobody else.
              </p>
              <p className="mt-3">
                We may ask whether we can photograph the finished wall for our portfolio. That is always a separate
                question, and the answer is yours — saying no changes nothing about your order.
              </p>
              <p className="mt-3">
                Please only send images you have the right to print. We cannot reproduce work that belongs to someone
                else without their permission.
              </p>
            </Section>

            <Section id="privacy" title="Privacy">
              <p>What this website collects, and why:</p>
              <ul className="mt-3 grid list-disc gap-2 pl-5">
                <li>
                  <strong>Enquiry and booking forms</strong> — your name, email, phone number, and what you tell us
                  about your project. Used to reply and plan the work.
                </li>
                <li>
                  <strong>Checkout</strong> — your email, for the receipt and order updates. Payment details go
                  directly to Paystack and never reach our servers.
                </li>
                <li>
                  <strong>The visualizer</strong> — the room photo and any images you drop into a frame stay in your
                  browser. They are not uploaded to us unless you send them yourself over WhatsApp.
                </li>
              </ul>
              <p className="mt-4">
                We do not sell your details or pass them to anyone beyond the manufacturer producing your order. To
                see what we hold or ask us to delete it, message us on {BRAND_PHONE_DISPLAY}.
              </p>
            </Section>

            <div className="rounded-[2rem] border border-kasa-black/10 bg-kasa-black p-8 text-kasa-cream dark:border-white/10">
              <h2 className="font-display text-2xl font-semibold">Something here unclear?</h2>
              <p className="mt-3 max-w-xl text-sm text-kasa-sand/80">
                Ask before you commit, not after. We would rather answer a question twice than have you guess.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary">
                  <a
                    href={whatsappLink("Hello KasaFrames — I have a question about how you work.")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-kasa-cream hover:bg-white/10">
                  <Link href="/book">Book a consultation</Link>
                </Button>
              </div>
            </div>

            <p className="text-xs text-kasa-muted dark:text-kasa-sand/60">
              Kasa Frames · Accra, Ghana · {BRAND_PHONE_DISPLAY}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{children}</div>
    </section>
  );
}

function Term({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-kasa-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
      <dt className="font-medium text-kasa-black dark:text-kasa-cream">{term}</dt>
      <dd className="mt-2 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{children}</dd>
    </div>
  );
}
