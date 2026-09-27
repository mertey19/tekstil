import { test, expect } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";

test.describe.configure({ mode: "serial" });
let original = "";
test.beforeAll(() => {
  const db = new DatabaseSync(path.join(process.env.CMS_TEST_DIR!, "cms.sqlite"));
  const row = db.prepare("SELECT body FROM content WHERE id=1").get()!;
  original = String(row.body);
  const content = JSON.parse(original);
  const product = content.products.find((item: { id: string }) => item.id === "cam-bezi");
  Object.assign(product, {
    isDemo: false,
    isPublished: true,
    status: "published",
    salesEnabled: true,
    priceCents: 14990,
    compareAtCents: 17990,
    stock: 8,
    trackStock: true,
    vatRate: 20,
    weightGrams: 120,
    sku: "SLV-CAM-001",
  });
  content.settings.shop = {
    enabled: true,
    shippingFeeCents: 7990,
    freeShippingThresholdCents: 50000,
    minimumOrderCents: 10000,
  };
  db.prepare("UPDATE content SET body=?, revision=revision+1, updated_at=? WHERE id=1").run(JSON.stringify(content), new Date().toISOString());
  db.close();
});
test.afterAll(() => {
  const db = new DatabaseSync(path.join(process.env.CMS_TEST_DIR!, "cms.sqlite"));
  db.prepare("UPDATE content SET body=?, revision=revision+1, updated_at=? WHERE id=1").run(original, new Date().toISOString());
  db.close();
});

test("Misafir müşteri ürün, sepet, teslimat ve sanal POS akışını tamamlar", async ({ page }) => {
  await page.goto("/urun/cam-bezi");
  await expect(page.getByText("₺149,90").first()).toBeVisible();
  await page.getByRole("button", { name: "Sepete ekle" }).click();
  await expect(page.getByRole("link", { name: /Sepet, 1 ürün/ })).toBeVisible();
  await page.getByRole("link", { name: /Sepet, 1 ürün/ }).click();
  await expect(page).toHaveURL(/\/sepet$/);
  await expect(page.getByRole("heading", { name: "Sepetiniz" })).toBeVisible();
  await expect(page.getByText("₺229,80")).toBeVisible();
  await page.getByRole("link", { name: /Güvenli ödemeye geç/ }).click();
  await page.getByLabel("Ad soyad").fill("Mert Bayhan");
  await page.getByLabel("WhatsApp / telefon").fill("+905305482660");
  await page.getByLabel("Açık adres").fill("Topraklık Mahallesi örnek teslimat adresi No 1");
  await page.getByLabel("İlçe").fill("Pamukkale");
  await page.getByLabel("Posta kodu").fill("20000");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Sanal POS ile güvenli öde" }).click();
  await expect(page).toHaveURL(/\/siparis\/[a-f0-9]{64}\?odeme=basarili/);
  await expect(page.getByRole("heading", { name: "Ödeme alındı" })).toBeVisible();
  await expect(page.getByText(/SLV-\d{8}-/)).toBeVisible();
  await expect(page.getByText("Mert Bayhan")).toBeVisible();
  await expect(page.locator(".cart-shortcut > span")).toHaveCount(0);
});

test("Sepet ve ödeme sayfaları mobilde taşmaz ve erişilebilir kalır", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/urun/cam-bezi");
  await page.getByRole("button", { name: "Sepete ekle" }).click();
  await page.goto("/sepet");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/odeme");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
