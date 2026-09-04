import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isPaystackConfigured, verifyTransaction } from "@/lib/paystack";
import { formatGhs, whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order status",
  description: "Confirmation for your KasaFrames order.",
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const transaction = isPaystackConfigured() ? await verifyTransaction(reference) : null;
  const paid = transaction?.status === "success";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">Order</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl text-balance">
        {paid ? "Payment received." : "We're confirming your payment."}
      </h1>

      <div className="mt-8 rounded-[2rem] border border-kasa-black/10 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5">
        <dl className="grid gap-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-kasa-muted dark:text-kasa-sand/80">Reference</dt>
            <dd className="font-mono text-xs">{reference}</dd>
          </div>
          {transaction ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-kasa-muted dark:text-kasa-sand/80">Amount</dt>
                <dd className="font-semibold">{formatGhs(transaction.amountGhs)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-kasa-muted dark:text-kasa-sand/80">Status</dt>
                <dd className="font-semibold capitalize">{transaction.status}</dd>
              </div>
              {transaction.channel ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-kasa-muted dark:text-kasa-sand/80">Paid with</dt>
                  <dd className="capitalize">{transaction.channel.replace(/_/g, " ")}</dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          {paid
            ? "Your pieces are queued for framing. The studio will confirm dimensions and installation timing over WhatsApp within 48 hours."
            : "If you completed payment, this page can lag behind the bank by a minute or two—your receipt from Paystack is the record. Send us the reference above and we'll confirm."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <a
              href={whatsappLink(`Hello KasaFrames — checking on order ${reference}.`)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp the studio
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/collections">Continue browsing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
