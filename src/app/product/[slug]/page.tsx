import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data/catalog";
import { ProductConfigurator } from "@/components/product/product-configurator";
import { formatGhs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Product" };
  return { title: p.name, description: p.tagline };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <ProductConfigurator product={product} />

      <section className="mt-16 border-t border-kasa-black/10 pt-12 dark:border-white/10">
        <h2 className="font-display text-2xl font-semibold">Every size, every price</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
          The full list, so you can work out the cost before you talk to us. Installation is a flat{" "}
          {formatGhs(product.installationGhs)} per frame and is optional.
        </p>

        <div className="mt-6 overflow-x-auto rounded-[2rem] border border-kasa-black/10 dark:border-white/10">
          <table className="w-full min-w-[30rem] text-left text-sm">
            <thead className="bg-kasa-black/5 text-xs uppercase tracking-wider text-kasa-muted dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 font-semibold">Size (inches)</th>
                <th className="px-5 py-3 text-right font-semibold">Frame</th>
                <th className="px-5 py-3 text-right font-semibold">Installation</th>
                <th className="px-5 py-3 text-right font-semibold">Total per frame</th>
              </tr>
            </thead>
            <tbody>
              {product.sizes.map((size) => (
                <tr key={size.label} className="border-t border-kasa-black/5 dark:border-white/5">
                  <td className="px-5 py-3 font-medium">{size.label}</td>
                  <td className="px-5 py-3 text-right">{formatGhs(size.frameGhs)}</td>
                  <td className="px-5 py-3 text-right text-kasa-muted">{formatGhs(product.installationGhs)}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {formatGhs(size.frameGhs + product.installationGhs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-kasa-muted dark:text-kasa-sand/70">
          A 50% deposit confirms the order. Custom sizes are possible—ask and we will quote before anything is made.{" "}
          <Link href="/policies" className="underline underline-offset-2">
            How we work
          </Link>
        </p>
      </section>

      <section className="mt-16 grid gap-6 border-t border-kasa-black/10 pt-12 dark:border-white/10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Details</h2>
          <p className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{product.longDescription}</p>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold">Highlights</h3>
          <ul className="mt-4 space-y-2 text-sm text-kasa-muted dark:text-kasa-sand/80">
            {product.highlights.map((h) => (
              <li key={h}>— {h}</li>
            ))}
          </ul>
          <h3 className="mt-8 font-display text-xl font-semibold">Ideal for</h3>
          <ul className="mt-4 space-y-2 text-sm text-kasa-muted dark:text-kasa-sand/80">
            {product.idealFor.map((h) => (
              <li key={h}>— {h}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
