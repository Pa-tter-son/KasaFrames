import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGhs(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function whatsappLink(message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "233000000000";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
