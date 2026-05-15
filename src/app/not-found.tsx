import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kasa-gold">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">This wall doesn’t exist—yet.</h1>
      <p className="mt-4 text-sm leading-relaxed text-kasa-muted dark:text-kasa-sand/80">
        The page you’re looking for may have moved. Let’s take you somewhere intentional.
      </p>
      <Button asChild className="mt-8" size="lg">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
