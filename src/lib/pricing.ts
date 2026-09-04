import {
  getProduct,
  type FrameFinish,
  type FrameMaterial,
  type ProductId,
} from "@/lib/data/catalog";

export interface CheckoutLineInput {
  productId: string;
  sizeLabel: string;
  material: string;
  finish: string;
  installation: boolean;
  qty: number;
}

export interface PricedLine {
  productId: ProductId;
  productName: string;
  sizeLabel: string;
  material: FrameMaterial;
  finish: FrameFinish;
  installation: boolean;
  qty: number;
  unitGhs: number;
  installationGhs: number;
  lineTotalGhs: number;
}

export interface PricedCart {
  lines: PricedLine[];
  subtotalGhs: number;
}

const MAX_LINES = 20;
const MAX_QTY_PER_LINE = 20;

/**
 * Recomputes every price from the catalog.
 *
 * The client sends only the configuration (which product, size, material,
 * finish, installation, quantity)—never an amount. Prices posted by a browser
 * are ignored on principle: this is the only place a charge amount is derived.
 */
export function priceCart(input: unknown): { cart: PricedCart } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Your cart is empty." };
  }

  if (input.length > MAX_LINES) {
    return { error: `A single order is limited to ${MAX_LINES} line items.` };
  }

  const lines: PricedLine[] = [];

  for (const [index, raw] of input.entries()) {
    const position = index + 1;

    if (typeof raw !== "object" || raw === null) {
      return { error: `Line ${position} is malformed.` };
    }

    const line = raw as Record<string, unknown>;
    const product = typeof line.productId === "string" ? getProduct(line.productId) : undefined;

    if (!product) {
      return { error: `Line ${position} refers to a product we no longer carry.` };
    }

    const size = product.sizes.find((s) => s.label === line.sizeLabel);
    if (!size) {
      return { error: `${product.name} is not available in that size.` };
    }

    const material = line.material as FrameMaterial;
    if (!product.materials.includes(material)) {
      return { error: `${product.name} is not available in that material.` };
    }

    const finish = line.finish as FrameFinish;
    if (!product.finishes.includes(finish)) {
      return { error: `${product.name} is not available in that finish.` };
    }

    const qty = typeof line.qty === "number" && Number.isInteger(line.qty) ? line.qty : 0;
    if (qty < 1 || qty > MAX_QTY_PER_LINE) {
      return { error: `Quantity for ${product.name} must be between 1 and ${MAX_QTY_PER_LINE}.` };
    }

    const installation = line.installation === true;
    const unitGhs = size.frameGhs;
    const installationGhs = installation ? product.installationGhs : 0;

    lines.push({
      productId: product.id,
      productName: product.name,
      sizeLabel: size.label,
      material,
      finish,
      installation,
      qty,
      unitGhs,
      installationGhs,
      lineTotalGhs: qty * (unitGhs + installationGhs),
    });
  }

  const subtotalGhs = lines.reduce((sum, l) => sum + l.lineTotalGhs, 0);

  if (subtotalGhs <= 0) {
    return { error: "That order totals nothing—please add a piece." };
  }

  return { cart: { lines, subtotalGhs } };
}

/** Paystack charges in the minor unit; GHS 1 is 100 pesewas. */
export function toPesewas(amountGhs: number) {
  return Math.round(amountGhs * 100);
}
