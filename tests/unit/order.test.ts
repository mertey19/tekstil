import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { cartTotals, productForCart } from "../../src/lib/cart";
import { formatPrice } from "../../src/lib/catalog";
import { completeMockPayment, createPendingOrder, getOrderByPublicToken } from "../../src/server/order-store";
import { readContent, saveContent } from "../../src/server/cms-store";

test("Sepet toplamı, sipariş kaydı ve başarılı ödeme sonrası stok güvenli hesaplanır", async () => {
  const base = path.join(process.cwd(), "artifacts", "unit-order");
  mkdirSync(base, { recursive: true });
  const previous = process.env.CMS_DATA_DIR;
  const remote = process.env.CMS_DATABASE_URL;
  const remoteDefault = process.env.DATABASE_URL;
  delete process.env.CMS_DATABASE_URL;
  delete process.env.DATABASE_URL;
  process.env.CMS_DATA_DIR = mkdtempSync(path.join(base, "run-"));
  try {
    const snapshot = await readContent();
    const content = structuredClone(snapshot.content);
    const product = content.products[0];
    product.isDemo = false;
    product.status = "published";
    product.isPublished = true;
    product.salesEnabled = true;
    product.priceCents = 12_345;
    product.stock = 5;
    product.trackStock = true;
    content.settings.shop = {
      enabled: true,
      shippingFeeCents: 1_000,
      freeShippingThresholdCents: 50_000,
      minimumOrderCents: 10_000,
    };
    await saveContent(content, snapshot.revision);
    const preview = cartTotals(
      [{ productId: product.id, quantity: 2 }],
      [productForCart(product)],
      content.settings.shop,
    );
    assert.equal(preview.subtotalCents, 24_690);
    assert.equal(preview.shippingCents, 1_000);
    assert.equal(preview.totalCents, 25_690);
    assert.equal(formatPrice(preview.totalCents), "₺256,90");

    const order = await createPendingOrder({
      items: [{ productId: product.id, quantity: 2 }],
      customerName: "Deneme Müşteri",
      email: "musteri@example.com",
      identityNumber: "11111111111",
      phone: "+905305482660",
      address: "Topraklık Mahallesi örnek teslimat adresi",
      district: "Pamukkale",
      city: "Denizli",
      postalCode: "20000",
      invoiceType: "individual",
      company: "",
      taxOffice: "",
      taxNumber: "",
      notes: "",
      legalAccepted: true,
      website: "",
    });
    await completeMockPayment(order.id);
    await completeMockPayment(order.id);
    const savedOrder = await getOrderByPublicToken(order.publicToken);
    assert.equal(savedOrder?.status, "paid");
    assert.equal(savedOrder?.totalCents, 25_690);
    assert.equal(savedOrder?.items[0].quantity, 2);
    assert.equal(
      (await readContent()).content.products.find((item) => item.id === product.id)?.stock,
      3,
    );
  } finally {
    if (remote !== undefined) process.env.CMS_DATABASE_URL = remote;
    if (remoteDefault !== undefined) process.env.DATABASE_URL = remoteDefault;
    if (previous === undefined) delete process.env.CMS_DATA_DIR;
    else process.env.CMS_DATA_DIR = previous;
  }
});
