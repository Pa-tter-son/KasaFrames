"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/cart-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
