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

/** Studio line, digits only. Env override lets staging point somewhere else. */
export const BRAND_PHONE_E164 = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "233591490322";

/** Same line, formatted for display. */
export const BRAND_PHONE_DISPLAY = process.env.NEXT_PUBLIC_BRAND_PHONE ?? "+233 59 149 0322";

/** Same line, as a tel: href. */
export const BRAND_PHONE_TEL = `tel:+${BRAND_PHONE_E164}`;

export function whatsappLink(message: string) {
  return `https://wa.me/${BRAND_PHONE_E164}?text=${encodeURIComponent(message)}`;
}
