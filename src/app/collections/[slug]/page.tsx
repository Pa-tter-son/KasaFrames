import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collections, getCollection, getProductsByCollection } from "@/lib/data/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Collection" };
  return { title: c.title, description: c.subtitle };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) notFound();

  const items = getProductsByCollection(c.slug);

  return (
    <div>
      <section className="relative min-h-[62vh] overflow-hidden">
        <Image src={c.heroImage} alt={c.title} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-kasa-cream via-kasa-cream/70 to-kasa-cream/10 dark:from-kasa-black dark:via-kasa-black/70 dark:to-kasa-black/20" />
        <div className="relative mx-auto flex min-h-[62vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <Badge variant="gold" className="w-fit border-kasa-gold/40 bg-kasa-gold/15 text-kasa-black dark:text-kasa-cream">
            Collection
          </Badge>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-kasa-black sm:text-6xl dark:text-kasa-cream text-balance">
            {c.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-kasa-muted dark:text-kasa-sand/80">{c.positioning}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-semibold">Styling recommendations</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
              {c.stylingTips.map((t) => (
                <li key={t} className="rounded-2xl border border-kasa-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                  {t}
                </li>
              ))}
            </ul>
            <h3 className="mt-10 font-display text-xl font-semibold">Suggested layouts</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.layoutIdeas.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-kasa-black/10 bg-kasa-sand/30 px-4 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/5"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-semibold">Pieces in this system</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {items.map((p) => (
                <Link key={p.id} href={`/product/${p.slug}`} className="group">
                  <Card className="overflow-hidden border-kasa-black/10 transition hover:-translate-y-1 hover:shadow-lift dark:border-white/10">
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={p.heroImage}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <CardDescription>{p.tagline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kasa-gold">Configure</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
