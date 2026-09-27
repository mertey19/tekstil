import type { Product } from "./catalog";

export type CartProduct = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "priceCents"
  | "compareAtCents"
  | "stock"
  | "trackStock"
  | "salesEnabled"
> & { image: Product["images"][number] };

export type CartLine = { productId: string; quantity: number };

export type ShopConfig = {
  enabled: boolean;
  shippingFeeCents: number;
  freeShippingThresholdCents: number;
  minimumOrderCents: number;
};

export const productForCart = (product: Product): CartProduct => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  image: product.images[0],
  priceCents: product.priceCents,
  compareAtCents: product.compareAtCents,
  stock: product.stock,
  trackStock: product.trackStock,
  salesEnabled: product.salesEnabled,
});

export function cartTotals(
  lines: CartLine[],
  products: CartProduct[],
  shop: ShopConfig,
) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const items = lines.flatMap((line) => {
    const product = productMap.get(line.productId);
    if (!product || !product.salesEnabled || product.priceCents < 1) return [];
    const available = product.trackStock ? product.stock : 99;
    const quantity = Math.max(1, Math.min(99, available, line.quantity));
    return [{ product, quantity, lineTotalCents: product.priceCents * quantity }];
  });
  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);
  const freeShipping =
    shop.freeShippingThresholdCents > 0 &&
    subtotalCents >= shop.freeShippingThresholdCents;
  const shippingCents = items.length && !freeShipping ? shop.shippingFeeCents : 0;
  return {
    items,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    meetsMinimum: subtotalCents >= shop.minimumOrderCents,
  };
}
