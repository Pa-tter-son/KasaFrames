import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, products } from "@/lib/data/catalog";
import { ProductConfigurator } from "@/components/product/product-configurator";

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
