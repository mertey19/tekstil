import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/urunler",
  "/kategori/arac-temizlik-bezleri",
  "/urun/arac-bakim-bezi",
  "/hakkimizda",
  "/iletisim",
  "/teklif-al",
  "/gizlilik",
  "/aydinlatma",
];
for (const path of routes)
  test(`Sayfa ve metadata: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    expect(await page.locator("head").innerHTML()).not.toMatch(
      /https?:\/\/(localhost|example\.com|www\.kukuroglu)/,
    );
    expect(await page.title()).toContain("Mikrofiber Deposu");
  });
test("Geçersiz kategori ve ürün gerçek 404 verir", async ({ request }) => {
  for (const path of ["/urun/yok", "/kategori/yok", "/olmayan-sayfa"])
    expect((await request.get(path)).status()).toBe(404);
});
test("Türkçe arama, filtre, sıralama, yenileme ve geçmiş", async ({ page }) => {
  await page.goto("/urunler");
  await page.getByRole("searchbox", { name: "Ürün ara" }).fill("arac");
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expect(page).toHaveURL(/q=arac/);
  await expect(page.locator(".product-card")).toHaveCount(2);
  await page.getByLabel("Sırala:").selectOption("za");
  await expect(page).toHaveURL(/siralama=za/);
  await expect(page.locator(".product-card h3").first()).toContainText(
    "Araç İçi",
  );
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("arac");
  await expect(page.getByLabel("Sırala:")).toHaveValue("za");
  await page.goBack();
  await expect(page.getByLabel("Sırala:")).toHaveValue("az");
  await page.goForward();
  await expect(page.getByLabel("Sırala:")).toHaveValue("za");
  await page
    .getByLabel("Kullanım alanı", { exact: true })
    .selectOption("Genel yüzeyler");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Filtreleri Temizle", exact: true })
    .click();
  await expect(page.locator(".product-card")).toHaveCount(9);
  await page.getByRole("link", { name: "Sayfa 2", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
});
test("Sonuçsuz arama ve temizleme", async ({ page }) => {
  await page.goto("/urunler?q=bulunmayanurun");
  await expect(
    page.getByRole("heading", { name: "Aradığınız ürün bulunamadı." }),
  ).toBeVisible();
  await page.locator(".empty-state").getByRole("link").click();
  await expect(page.locator(".product-card")).toHaveCount(9);
});
test("Ürün teklif formuna taşınır, rastgele kimlik reddedilir", async ({
  page,
}) => {
  await page.goto("/urun/arac-bakim-bezi");
  await page.getByRole("link", { name: "Bu Ürün İçin Teklif Al" }).click();
  await expect(page.getByLabel(/İlgilenilen ürün/)).toHaveValue(
    "arac-bakim-bezi",
  );
  await page.goto("/teklif-al?urun=olmayan");
  await expect(
    page.getByText("Bağlantıdaki ürün bulunamadı.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel(/İlgilenilen ürün/)).toHaveValue("");
});
test("Yalnızca yapılandırılmış WhatsApp bağlantısı var; sitemap demo ürün içermez", async ({
  page,
  request,
}) => {
  await page.goto("/iletisim");
  await expect(
    page.locator('a[href^="tel:"], a[href^="mailto:"]'),
  ).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(1);
  await expect(page.locator(".contact-map iframe")).toHaveAttribute(
    "src",
    "https://maps.google.com/maps?q=37.7841269,29.0876543&z=17&hl=tr&output=embed",
  );
  await expect(
    page.getByRole("link", { name: "Google Haritalar’da aç" }),
  ).toHaveAttribute(
    "href",
    "https://www.google.com/maps?q=37.7841269,29.0876543&z=17&hl=tr",
  );
  await expect(
    page.getByText("Topraklık Mahallesi, Pamukkale / Denizli"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "WhatsApp’tan Yazın" }),
  ).toHaveAttribute("href", /^https:\/\/wa\.me\/905305482660\?text=/);
  await page.goto("/urun/cam-bezi");
  await expect(
    page.getByRole("link", { name: "WhatsApp’tan Bilgi Al" }),
  ).toHaveAttribute("href", /wa.me\/905305482660/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("<loc>");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m);
  expect(robots).toContain("Disallow: /admin");
});
async function fillForm(page: import("@playwright/test").Page) {
  await page.getByLabel("Ad soyad").fill("Test Kullanıcısı");
  await page
    .getByLabel("Mesajınız")
    .fill("Bu yalnızca otomatik test talebidir.");
}
test("Form hataları ve gerçek API ile WhatsApp mesajı hazırlanması", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/teklif-al?urun=cam-bezi");
  await expect(
    page.locator('input[type="email"],input[type="tel"]'),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "WhatsApp Mesajını Hazırla" }).click();
  await expect(page.getByText("Adınızı ve soyadınızı yazın.")).toBeVisible();
  await expect(page.getByLabel("Ad soyad")).toBeFocused();
  await fillForm(page);
  await page.getByLabel(/Tahmini adet/).fill("0");
  await page.getByRole("button", { name: "WhatsApp Mesajını Hazırla" }).click();
  await expect(
    page.getByText("Adet, 1 ile 1.000.000 arasında tam sayı olmalı."),
  ).toBeVisible();
  await page.getByLabel(/Tahmini adet/).fill("2");
  await page.getByRole("button", { name: "WhatsApp Mesajını Hazırla" }).click();
  await expect(page.getByRole("status")).toContainText("Mesajınız hazır");
  await expect(
    page.getByRole("heading", { name: "Mesajınız hazır." }),
  ).toBeFocused();
  const href = await page
    .getByRole("link", { name: "WhatsApp’ta Aç" })
    .getAttribute("href");
  const url = new URL(href!);
  await expect(page.getByRole("link", { name: "Ana içeriğe atla" })).toHaveCSS(
    "opacity",
    "0",
  );
  expect(url.pathname).toBe("/905305482660");
  expect(url.searchParams.get("text")).toContain("Mikrofiber Cam Bezi");
  expect(url.searchParams.get("text")).toContain("Tahmini adet: 2");
  await page.screenshot({
    path: "artifacts/screenshots/whatsapp-390.png",
    fullPage: true,
  });
  await page.getByLabel(/Tahmini adet/).fill("3");
  await expect(page.getByRole("link", { name: "WhatsApp’ta Aç" })).toHaveCount(
    0,
  );
});
test("Yüklenme ve servis hatası (taklit API); çift hazırlama engellenir", async ({
  page,
}) => {
  await page.goto("/teklif-al");
  await fillForm(page);
  let calls = 0;
  let resolveResponse: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    resolveResponse = resolve;
  });
  await page.route("**/api/teklif", async (route) => {
    calls++;
    await pending;
    await route.fulfill({
      status: 503,
      json: { status: "error", message: "Mesaj şu anda hazırlanamadı." },
    });
  });
  await page.getByRole("button", { name: "WhatsApp Mesajını Hazırla" }).click();
  await expect(
    page.getByRole("button", { name: "Hazırlanıyor…" }),
  ).toBeDisabled();
  expect(calls).toBe(1);
  resolveResponse!();
  await expect(page.locator(".quote-form").getByRole("alert")).toContainText(
    "hazırlanamadı",
  );
});
test("Ağ hatası gönderildi gibi gösterilmez (taklit ağ arızası)", async ({
  page,
}) => {
  await page.goto("/teklif-al");
  await fillForm(page);
  await page.route("**/api/teklif", (route) => route.abort("failed"));
  await page.getByRole("button", { name: "WhatsApp Mesajını Hazırla" }).click();
  await expect(page.locator(".quote-form").getByRole("alert")).toContainText(
    "gönderilmedi",
  );
});
test("Mobil menü ve filtre Escape odağı geri verir; klavye ile gezinilir", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Ana içeriğe atla" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeFocused();
  await page.goto("/urunler");
  await page.getByRole("button", { name: "Filtreleri Aç" }).click();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Filtreleri Aç" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Filtreleri Aç" }).click();
  await page.getByRole("radio", { name: /Araç temizlik bezleri/ }).check();
  await expect(page.locator(".product-card")).toHaveCount(2);
});
test("Bozuk görsel döngüsüz fallback ve sabit oran", async ({ page }) => {
  await page.route("**/_next/image?**", (route) => route.abort("failed"));
  await page.goto("/urun/cam-bezi");
  await expect(page.locator(".gallery-main .image-fallback")).toBeVisible();
  const box = await page.locator(".gallery-main").boundingBox();
  expect(box!.height).toBeGreaterThan(300);
});
for (const width of [360, 390, 768, 1440])
  test(`${width}px ekran görüntüleri ve taşma kontrolü`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [path, name] of [
      ["/", "home"],
      ["/kategori/arac-temizlik-bezleri", "category"],
      ["/urun/arac-bakim-bezi", "product"],
    ]) {
      await page.goto(path);
      await page.locator(".product-image").first().waitFor();
      await page.evaluate(() =>
        Promise.all(
          Array.from(document.images).map((img) => {
            // Full-page captures also need images below the lazy-load boundary.
            img.loading = "eager";
            return img.decode().catch(() => undefined);
          }),
        ),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/screenshots/${name}-${width}.png`,
        fullPage: true,
      });
    }
  });
test("Ana sayfa, katalog, ürün ve form axe erişilebilirlik taraması", async ({
  page,
}) => {
  for (const route of ["/", "/urunler", "/urun/cam-bezi", "/teklif-al"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  }
});
