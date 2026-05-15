"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-provider";
import { formatGhs, whatsappLink } from "@/lib/utils";

const nav = [
  { href: "/collections", label: "Collections" },
  { href: "/visualizer", label: "Visualizer" },
  { href: "/book", label: "Book" },
  { href: "/gallery", label: "Gallery" },
  { href: "/installation", label: "Installation" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const { lines, removeLine, subtotal, clear } = useCart();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const cartCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-kasa-black/5 bg-kasa-cream/75 backdrop-blur-xl dark:border-white/5 dark:bg-kasa-black/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent
              showClose={false}
              className="left-0 top-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 bg-kasa-cream p-0 dark:bg-kasa-black sm:left-0 sm:top-0 sm:max-w-md"
            >
              <div className="flex items-center justify-between border-b border-kasa-black/10 px-6 py-5 dark:border-white/10">
                <DialogTitle className="font-display text-xl">Navigate</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-kasa-black transition hover:bg-kasa-black/5 dark:text-kasa-cream dark:hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ))}
                <Separator className="my-4" />
                <Link
                  href="/book"
                  onClick={() => setMobileOpen(false)}
                  className="mx-1 rounded-2xl bg-kasa-black px-4 py-3 text-center text-sm font-semibold text-kasa-cream dark:bg-kasa-cream dark:text-kasa-black"
                >
                  Book consultation
                </Link>
              </nav>
            </DialogContent>
          </Dialog>

          <Link href="/" className="group flex items-center gap-2">
            <span className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              Kasa<span className="text-kasa-gold">Frames</span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-kasa-black/80 transition hover:bg-kasa-black/5 hover:text-kasa-black dark:text-kasa-cream/80 dark:hover:bg-white/10 dark:hover:text-kasa-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            disabled={!mounted}
          >
            {!mounted ? (
              <Sun className="h-5 w-5 opacity-40" />
            ) : theme === "dark" || resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Dialog open={cartOpen} onOpenChange={setCartOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className="relative" aria-label="Open cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-kasa-gold px-1 text-[10px] font-bold text-kasa-black">
                    {cartCount}
                  </span>
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent
              showClose
              className="left-auto right-0 top-0 flex h-dvh max-w-md translate-x-0 translate-y-0 flex-col rounded-none border-l border-kasa-black/10 bg-kasa-cream p-0 dark:border-white/10 dark:bg-kasa-black sm:rounded-none"
            >
              <div className="border-b border-kasa-black/10 px-6 py-6 dark:border-white/10">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">Your selection</DialogTitle>
                  <p className="text-sm text-kasa-muted">Curated pieces ready for confirmation.</p>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {lines.length === 0 ? (
                  <p className="text-sm text-kasa-muted">Your cart is quiet—for now.</p>
                ) : (
                  <ul className="space-y-4">
                    {lines.map((line) => (
                      <li
                        key={line.key}
                        className="rounded-2xl border border-kasa-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{line.productName}</p>
                            <p className="mt-1 text-xs text-kasa-muted">
                              {line.sizeLabel} · {line.material} · {line.finish}
                              {line.installation ? " · install" : ""}
                            </p>
                            <p className="mt-2 text-sm font-semibold">
                              {formatGhs(
                                line.qty *
                                  (line.priceGhs + (line.installation ? line.installationGhs : 0)),
                              )}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeLine(line.key)} aria-label="Remove">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-kasa-black/10 p-6 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-kasa-muted">Subtotal</span>
                  <span className="font-semibold">{formatGhs(subtotal)}</span>
                </div>
                <div className="grid gap-2">
                  <Button
                    asChild
                    className="w-full"
                    onClick={() => setCartOpen(false)}
                  >
                    <a
                      href={whatsappLink(
                        `Hello KasaFrames — I'd like to confirm my cart (${lines.length} line items). Subtotal: ${formatGhs(subtotal)}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp inquiry
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => clear()} disabled={lines.length === 0}>
                    Clear cart
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button asChild className="hidden sm:inline-flex">
            <Link href="/book">Book</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
