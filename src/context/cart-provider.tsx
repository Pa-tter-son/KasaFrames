"use client";

import * as React from "react";
import type { FrameFinish, FrameMaterial, Product, ProductId } from "@/lib/data/catalog";

export interface CartLine {
  key: string;
  productId: ProductId;
  productName: string;
  sizeLabel: string;
  material: FrameMaterial;
  finish: FrameFinish;
  priceGhs: number;
  installation: boolean;
  installationGhs: number;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (input: {
    product: Product;
    sizeLabel: string;
    priceGhs: number;
    material: FrameMaterial;
    finish: FrameFinish;
    installation: boolean;
    installationGhs: number;
    qty: number;
  }) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  subtotal: number;
}

const CartContext = React.createContext<CartState | null>(null);

const STORAGE_KEY = "kasaframes_cart_v1";

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);

  React.useEffect(() => {
    setLines(loadLines());
  }, []);

  React.useEffect(() => {
    persist(lines);
  }, [lines]);

  const addLine = React.useCallback(
    (input: {
      product: Product;
      sizeLabel: string;
      priceGhs: number;
      material: FrameMaterial;
      finish: FrameFinish;
      installation: boolean;
      installationGhs: number;
      qty: number;
    }) => {
      const key = [
        input.product.id,
        input.sizeLabel,
        input.material,
        input.finish,
        input.installation ? "1" : "0",
      ].join("|");

      setLines((prev) => {
        const idx = prev.findIndex((l) => l.key === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + input.qty };
          return next;
        }
        return [
          ...prev,
          {
            key,
            productId: input.product.id,
            productName: input.product.name,
            sizeLabel: input.sizeLabel,
            material: input.material,
            finish: input.finish,
            priceGhs: input.priceGhs,
            installation: input.installation,
            installationGhs: input.installationGhs,
            qty: input.qty,
          },
        ];
      });
    },
    [],
  );

  const removeLine = React.useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clear = React.useCallback(() => setLines([]), []);

  const subtotal = React.useMemo(() => {
    return lines.reduce((sum, l) => {
      const install = l.installation ? l.installationGhs : 0;
      return sum + l.qty * (l.priceGhs + install);
    }, 0);
  }, [lines]);

  const value = React.useMemo(
    () => ({ lines, addLine, removeLine, clear, subtotal }),
    [lines, addLine, removeLine, clear, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
