import { randomBytes, randomUUID } from "node:crypto";
import { tokenHash } from "./admin-auth";
import { CmsError, database, readContent, saveContent } from "./cms-store";
import { getProducts, getSiteConfig } from "@/lib/content";
import { cartTotals, productForCart } from "@/lib/cart";
import {
  checkoutSchema,
  orderStatusSchema,
  type CheckoutInput,
  type OrderStatus,
  type PublicOrder,
} from "@/lib/order-model";

const text = (value: unknown) => String(value ?? "");
const number = (value: unknown) => Number(value ?? 0);

export async function priceCheckout(input: unknown) {
  const checkout = checkoutSchema.parse(input);
  if (checkout.website) throw new CmsError("İstek doğrulanamadı.", 400);
  const [products, site] = await Promise.all([getProducts(), getSiteConfig()]);
  if (!site.shop.enabled)
    throw new CmsError("İnternet mağazası henüz satışa açılmadı.", 503);
  const totals = cartTotals(
    checkout.items,
    products.map(productForCart),
    site.shop,
  );
  if (!totals.items.length || totals.items.length !== checkout.items.length)
    throw new CmsError("Sepette satışa açık olmayan bir ürün var.", 409);
  if (!totals.meetsMinimum)
    throw new CmsError("Sepet tutarı minimum sipariş tutarının altında.", 409);
  for (const item of totals.items)
    if (item.product.trackStock && item.quantity > item.product.stock)
      throw new CmsError(`${item.product.name} için yeterli stok bulunmuyor.`, 409);
  return { checkout, totals, products };
}

export async function createPendingOrder(
  input: CheckoutInput,
  paymentProvider: "mock" | "iyzico" = "mock",
) {
  const { checkout, totals, products } = await priceCheckout(input);
  const id = randomUUID();
  const publicToken = randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const orderNumber = `SLV-${now.slice(0, 10).replaceAll("-", "")}-${id.slice(0, 6).toUpperCase()}`;
  await database().batch([
    {
      sql: "INSERT INTO orders (id, order_number, public_token_hash, status, payment_status, payment_provider, payment_reference, subtotal_cents, shipping_cents, total_cents, currency, customer_name, phone, address, district, city, postal_code, invoice_type, company, tax_office, tax_number, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      params: [
        id,
        orderNumber,
        tokenHash(publicToken),
        "payment_pending",
        "pending",
        paymentProvider,
        "",
        totals.subtotalCents,
        totals.shippingCents,
        totals.totalCents,
        "TRY",
        checkout.customerName,
        checkout.phone,
        checkout.address,
        checkout.district,
        checkout.city,
        checkout.postalCode,
        checkout.invoiceType,
        checkout.company,
        checkout.taxOffice,
        checkout.taxNumber,
        checkout.notes,
        now,
        now,
      ],
    },
    ...totals.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.product.id)!;
      return {
      sql: "INSERT INTO order_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      params: [
        id,
        item.product.id,
        item.product.slug,
        item.product.name,
        product.sku,
        item.product.image.src,
        item.product.priceCents,
        product.vatRate,
        item.quantity,
        item.lineTotalCents,
      ],
    };}),
  ]);
  return {
    id,
    publicToken,
    orderNumber,
    subtotalCents: totals.subtotalCents,
    shippingCents: totals.shippingCents,
    totalCents: totals.totalCents,
    items: totals.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      lineTotalCents: item.lineTotalCents,
    })),
  };
}

export async function setPaymentReference(
  orderId: string,
  provider: "iyzico",
  reference: string,
) {
  const result = await database()
    .prepare(
      "UPDATE orders SET payment_reference=?, updated_at=? WHERE id=? AND payment_provider=? AND payment_status='pending' RETURNING id",
    )
    .get(reference, new Date().toISOString(), orderId, provider);
  if (!result) throw new CmsError("Ödeme kaydı güncellenemedi.", 409);
}

export async function markPaymentFailed(
  orderId: string,
  provider: "mock" | "iyzico",
) {
  await database()
    .prepare(
      "UPDATE orders SET status='payment_failed', payment_status='failed', updated_at=? WHERE id=? AND payment_provider=? AND payment_status='pending'",
    )
    .run(new Date().toISOString(), orderId, provider);
}

export async function completePayment(
  orderId: string,
  provider: "mock" | "iyzico",
  paymentReference: string,
) {
  const claimed = await database()
    .prepare(
      "UPDATE orders SET payment_status='processing', updated_at=? WHERE id=? AND payment_provider=? AND payment_status='pending' RETURNING id",
    )
    .get(new Date().toISOString(), orderId, provider);
  if (!claimed) {
    const current = await database()
      .prepare("SELECT payment_status FROM orders WHERE id=?")
      .get(orderId);
    return text(current?.payment_status) === "paid";
  }
  const items = await database()
    .prepare("SELECT product_id, quantity FROM order_items WHERE order_id=?")
    .all(orderId);
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const snapshot = await readContent();
      const next = structuredClone(snapshot.content);
      for (const item of items) {
        const product = next.products.find((candidate) => candidate.id === text(item.product_id));
        if (!product || !product.salesEnabled)
          throw new CmsError("Siparişteki ürün artık satışta değil.", 409);
        if (product.trackStock) {
          const quantity = number(item.quantity);
          if (product.stock < quantity)
            throw new CmsError(`${product.name} için yeterli stok bulunmuyor.`, 409);
          product.stock -= quantity;
        }
      }
      try {
        await saveContent(next, snapshot.revision);
        break;
      } catch (error) {
        if (!(error instanceof CmsError) || error.status !== 409 || attempt === 2) throw error;
      }
    }
    await database()
      .prepare(
        "UPDATE orders SET status='paid', payment_status='paid', payment_reference=?, updated_at=? WHERE id=? AND payment_status='processing'",
      )
      .run(paymentReference, new Date().toISOString(), orderId);
    return true;
  } catch (error) {
    await database()
      .prepare(
        "UPDATE orders SET payment_status='pending', updated_at=? WHERE id=? AND payment_status='processing'",
      )
      .run(new Date().toISOString(), orderId);
    throw error;
  }
}

export async function completeMockPayment(orderId: string) {
  return completePayment(orderId, "mock", `mock-${orderId}`);
}

export async function getPaymentOrderByPublicToken(token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const order = await database()
    .prepare(
      "SELECT id, payment_status, payment_provider, payment_reference, total_cents, currency FROM orders WHERE public_token_hash=?",
    )
    .get(tokenHash(token));
  if (!order) return null;
  return paymentOrder(order);
}

export async function getPaymentOrderById(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  const order = await database()
    .prepare(
      "SELECT id, payment_status, payment_provider, payment_reference, total_cents, currency FROM orders WHERE id=?",
    )
    .get(id);
  if (!order) return null;
  return paymentOrder(order);
}

function paymentOrder(order: Record<string, unknown>) {
  return {
    id: text(order.id),
    paymentStatus: text(order.payment_status),
    paymentProvider: text(order.payment_provider),
    paymentReference: text(order.payment_reference),
    totalCents: number(order.total_cents),
    currency: text(order.currency),
  };
}

export async function getOrderByPublicToken(token: string): Promise<PublicOrder | null> {
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const order = await database()
    .prepare("SELECT * FROM orders WHERE public_token_hash=?")
    .get(tokenHash(token));
  if (!order) return null;
  const items = await database()
    .prepare("SELECT * FROM order_items WHERE order_id=? ORDER BY name")
    .all(text(order.id));
  return {
    orderNumber: text(order.order_number),
    status: orderStatusSchema.parse(order.status),
    paymentStatus: text(order.payment_status),
    customerName: text(order.customer_name),
    phone: text(order.phone),
    address: text(order.address),
    district: text(order.district),
    city: text(order.city),
    postalCode: text(order.postal_code),
    subtotalCents: number(order.subtotal_cents),
    shippingCents: number(order.shipping_cents),
    totalCents: number(order.total_cents),
    createdAt: text(order.created_at),
    items: items.map((item) => ({
      slug: text(item.slug),
      name: text(item.name),
      image: text(item.image),
      unitPriceCents: number(item.unit_price_cents),
      quantity: number(item.quantity),
      lineTotalCents: number(item.line_total_cents),
    })),
  };
}

export async function listOrders(query = "") {
  const pattern = `%${query.trim().slice(0, 100).toLowerCase()}%`;
  return database()
    .prepare(
      "SELECT id, order_number AS \"orderNumber\", status, payment_status AS \"paymentStatus\", total_cents AS \"totalCents\", customer_name AS \"customerName\", phone, city, district, created_at AS \"createdAt\" FROM orders WHERE lower(order_number) LIKE ? OR lower(customer_name) LIKE ? OR lower(phone) LIKE ? ORDER BY created_at DESC LIMIT 200",
    )
    .all(pattern, pattern, pattern);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await database()
    .prepare("SELECT status, payment_status FROM orders WHERE id=?")
    .get(id);
  if (!order) throw new CmsError("Sipariş bulunamadı.", 404);
  const allowed =
    status === "cancelled" ||
    (text(order.payment_status) === "paid" &&
      ["paid", "preparing", "shipped", "delivered"].includes(status));
  if (!allowed)
    throw new CmsError("Ödeme sonucu yönetici tarafından değiştirilemez.", 409);
  const result = await database()
    .prepare("UPDATE orders SET status=?, updated_at=? WHERE id=? RETURNING id")
    .get(status, new Date().toISOString(), id);
  if (!result) throw new CmsError("Sipariş bulunamadı.", 404);
}
