import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { CmsContent, CmsSnapshot } from "../../src/lib/cms-model";

test.describe.configure({ mode: "serial" });
test.use({ actionTimeout: 10_000 });
const headers = { origin: "http://127.0.0.1:3001", "x-cms-request": "1" };
const account = {
  username: "test-admin",
  password: "Test-Only-Password-2046!",
};
const setupToken = randomBytes(32).toString("hex");
let original: CmsContent;
test.beforeAll(() => {
  const db = new DatabaseSync(
    path.join(process.env.CMS_TEST_DIR!, "cms.sqlite"),
  );
  db.prepare("INSERT OR REPLACE INTO setup VALUES (1, ?, ?)").run(
    createHash("sha256").update(setupToken).digest("hex"),
    Date.now() + 60_000 * 30,
  );
  db.close();
});
async function login(page: Page) {
  await page.goto("/admin");
  await page
    .getByLabel("Kullanıcı adı", { exact: true })
    .fill(account.username);
  await page.getByLabel("Şifre", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(
    page.getByRole("heading", { name: "Genel bakış", exact: true }),
  ).toBeVisible();
}
const snapshot = async (page: Page) =>
  (await (await page.request.get("/api/admin/content")).json()) as CmsSnapshot;
async function write(page: Page, content: CmsContent) {
  const current = await snapshot(page);
  return page.request.put("/api/admin/content", {
    headers,
    data: { content, revision: current.revision },
  });
}
test.afterEach(async ({ page }) => {
  if (!original) return;
  const auth = await page.request.post("/api/admin/login", {
    headers,
    data: account,
  });
  expect(auth.ok()).toBe(true);
  const response = await write(page, original);
  expect(response.ok()).toBe(true);
});

test("İlk kurulum anahtarla korunur; hesap ve oturum oluşturulur", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/admin/content")).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin/setup", {
        headers,
        data: { ...account, token: "yanlis" },
      })
    ).status(),
  ).toBe(403);
  await page.goto(`/admin#setup=${setupToken}`);
  await expect(page.getByLabel("Kurulum anahtarı")).toHaveCount(0);
  await expect(page.locator('input[name="token"]')).toBeHidden();
  await expect(page.locator('input[name="token"]')).toHaveValue(setupToken);
  await expect(page.getByText(/Kurulum bağlantısındaki anahtar/)).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin$/);
  await page
    .getByLabel("Kullanıcı adı", { exact: true })
    .fill(account.username);
  await page.getByLabel("Şifre", { exact: true }).fill(account.password);
  await page.getByLabel("Şifre tekrar", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Hesabımı oluştur" }).click();
  await expect(
    page.getByRole("heading", { name: "Genel bakış", exact: true }),
  ).toBeVisible();
  original = (await snapshot(page)).content;
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === "tekstil_admin",
  )!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  expect(
    (
      await request.post("/api/admin/setup", {
        headers,
        data: { ...account, token: setupToken },
      })
    ).status(),
  ).toBe(409);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(
    page.locator(".site-header, .site-footer, .floating-whatsapp"),
  ).toHaveCount(0);
});

test("Giriş, yetki, kaynak kontrolü, doğrulama ve eşzamanlı kayıt koruması", async ({
  page,
  request,
}) => {
  expect(
    (
      await request.post("/api/admin/login", {
        headers,
        data: { ...account, password: "Wrong-password-123" },
      })
    ).status(),
  ).toBe(401);
  await login(page);
  const current = await snapshot(page);
  expect(
    (
      await page.request.put("/api/admin/content", {
        headers: { ...headers, origin: "https://other.example" },
        data: current,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.put("/api/admin/content", { headers, data: current })
    ).status(),
  ).toBe(401);
  const invalid = structuredClone(current.content);
  invalid.categories = [];
  expect((await write(page, invalid)).status()).toBe(400);
  const duplicate = structuredClone(current.content);
  duplicate.products.push(duplicate.products[0]);
  expect((await write(page, duplicate)).status()).toBe(400);
  const malicious = structuredClone(current.content);
  malicious.pages.home.sections.push({
    id: "bad-link",
    title: "Test",
    text: "Test",
    status: "published",
    image: "",
    imageAlt: "",
    buttonLabel: "Tıkla",
    buttonHref: "javascript:alert(1)",
  });
  expect((await write(page, malicious)).status()).toBe(400);
  expect(
    (
      await page.request.put("/api/admin/content", { headers, data: current })
    ).status(),
  ).toBe(200);
  expect(
    (
      await page.request.put("/api/admin/content", { headers, data: current })
    ).status(),
  ).toBe(409);
  await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
  await expect(page.getByRole("button", { name: "Giriş yap" })).toBeVisible();
  expect((await page.request.get("/api/admin/content")).status()).toBe(401);
});

test("Bilgisayardan görsel, yeni ürün, taslak, yayın, düzenleme ve silme", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await login(page);
  await page
    .getByRole("button", { name: "+ Yeni ürün ekle", exact: true })
    .click();
  await page.getByLabel("Ürün adı", { exact: true }).fill("Yönetim Test Bezi");
  await page
    .getByLabel("Ürün adresi", { exact: true })
    .fill("yonetim-test-bezi");
  await page
    .getByLabel("Kısa açıklama", { exact: true })
    .fill("Bilgisayardan görsel eklenen test ürünü.");
  await page
    .getByLabel("Ürün açıklaması", { exact: true })
    .fill("Yönetim panelinden eklenen ürünün açıklaması.");
  await page
    .getByLabel("Kullanım alanları", { exact: true })
    .fill("Günlük temizlik\nCamlar");
  await page
    .getByLabel("Ürün görseli 1 yükle", { exact: true })
    .setInputFiles("public/images/products/cam-bezi.webp");
  await expect(
    page.getByRole("button", { name: "Değişiklikleri kaydet", exact: true }),
  ).toBeEnabled();
  await page
    .getByLabel("Görsel 1 açıklaması", { exact: true })
    .fill("Mavi mikrofiber test bezi");
  await page.getByLabel("Ölçüler", { exact: true }).fill("40 × 40 cm");
  await page
    .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Değişiklikler kaydedildi",
  );
  let state = await snapshot(page);
  const product = state.content.products.find(
    (p) => p.slug === "yonetim-test-bezi",
  )!;
  expect(product.images[0].src).toMatch(/^\/images\/uploads\/.*\.webp$/);
  expect(
    (await page.request.get(product.images[0].src)).headers()["content-type"],
  ).toBe("image/webp");
  expect((await page.request.get("/urun/yonetim-test-bezi")).status()).toBe(
    404,
  );
  await page
    .getByLabel("Yayın durumu", { exact: true })
    .selectOption("published");
  await page
    .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Değişiklikler kaydedildi",
  );
  const publicPage = await page.context().newPage();
  await publicPage.goto("/urun/yonetim-test-bezi");
  await expect(publicPage.locator("h1")).toHaveText("Yönetim Test Bezi");
  await expect(
    publicPage.getByText("40 × 40 cm", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Yönetim menüsü" })
    .getByRole("button", { name: "Ürünler" })
    .click();
  await page.getByRole("button", { name: "Yönetim Test Bezi Yayında" }).click();
  await page
    .getByLabel("Ürün adı", { exact: true })
    .fill("Güncellenmiş Test Bezi");
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Değişiklikler kaydedildi",
  );
  await publicPage.reload();
  await expect(publicPage.locator("h1")).toHaveText("Güncellenmiş Test Bezi");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Kaydı kaldır", exact: true }).click();
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Değişiklikler kaydedildi",
  );
  state = await snapshot(page);
  expect(state.content.products.some((p) => p.id === product.id)).toBe(false);
  expect((await page.request.get("/urun/yonetim-test-bezi")).status()).toBe(
    404,
  );
  await publicPage.close();
});

test("Blog, kategori, sayfa bölümü ve WhatsApp ayarı sitede güncellenir", async ({
  page,
}) => {
  await login(page);
  const current = (await snapshot(page)).content;
  current.categories.push({
    ...current.categories[0],
    id: "test-kategori",
    slug: "test-kategori",
    name: "Yeni Test Kategorisi",
    shortName: "Test Grubu",
  });
  current.posts.push({
    ...current.posts[0],
    id: "test-yazisi",
    slug: "test-yazisi",
    title: "Yeni Test Yazısı",
    status: "draft",
  });
  expect((await write(page, current)).ok()).toBe(true);
  expect((await page.request.get("/kategori/test-kategori")).status()).toBe(
    200,
  );
  expect((await page.request.get("/blog/test-yazisi")).status()).toBe(404);
  current.posts.at(-1)!.status = "published";
  current.settings.whatsapp = "+905551112233";
  current.pages.home.sections.push({
    id: "test-bolumu",
    title: "Kendi bölümümüz",
    text: "Panelden eklenen sayfa açıklaması.",
    image: "/images/hero.webp",
    imageAlt: "Katlanmış temizlik bezleri",
    buttonHref: "/urunler",
    buttonLabel: "Ürünlere göz at",
    status: "published",
  });
  expect((await write(page, current)).ok()).toBe(true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Kendi bölümümüz" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "WhatsApp sohbetini aç (yeni sekmede)" }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\/905551112233\?/);
  await page.goto("/blog/test-yazisi");
  await expect(page.locator("h1")).toHaveText("Yeni Test Yazısı");
  current.pages.home.sections[0].status = "draft";
  expect((await write(page, current)).ok()).toBe(true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Kendi bölümümüz" }),
  ).toHaveCount(0);
});

test("Görsel yükleme gerçek dosya türünü ve boyut sınırını doğrular", async ({
  page,
  request,
}) => {
  await login(page);
  const uploadHeaders = {
    ...headers,
    "content-type": "image/png",
    "x-file-name": "deneme.png",
  };
  expect(
    (
      await request.post("/api/admin/media", {
        headers: uploadHeaders,
        data: readFileSync("public/images/hero.webp"),
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await page.request.post("/api/admin/media", {
        headers: uploadHeaders,
        data: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        ),
      })
    ).status(),
  ).toBe(415);
  expect(
    (
      await page.request.post("/api/admin/media", {
        headers: uploadHeaders,
        data: Buffer.alloc(8 * 1024 * 1024 + 1),
      })
    ).status(),
  ).toBe(413);
  expect(
    (await page.request.get("/images/uploads/invalid.webp")).status(),
  ).toBe(404);
});

test("Büyük bilgisayar görseli yüklemeden önce 4 MB altına küçültülür", async ({ page }) => {
  await login(page);
  await page.getByRole("navigation", { name: "Yönetim menüsü" }).getByRole("button", { name: "Görsel kütüphanesi" }).click();
  const buffer = await sharp(randomBytes(1400 * 1400 * 3), { raw: { width: 1400, height: 1400, channels: 3 } }).png().toBuffer();
  expect(buffer.length).toBeGreaterThan(4 * 1024 * 1024);
  expect(buffer.length).toBeLessThan(8 * 1024 * 1024);
  const uploaded = page.waitForResponse((response) => response.url().endsWith("/api/admin/media") && response.request().method() === "POST");
  await page.locator('input[type="file"]').setInputFiles({ name: "buyuk-fotograf.png", mimeType: "image/png", buffer });
  const response = await uploaded;
  expect(response.status()).toBe(201);
  expect(response.request().headers()["content-type"]).toBe("image/webp");
  const media = await response.json();
  expect(media.size).toBeLessThan(4 * 1024 * 1024);
  expect((await page.request.get(media.src)).status()).toBe(200);
});

test("Kategori, blog ve ek sayfa bölümü panel formlarından oluşturulur", async ({
  page,
}) => {
  await login(page);
  const menu = page.getByRole("navigation", { name: "Yönetim menüsü" });
  const save = async () => {
    await page
      .getByRole("button", { name: "Değişiklikleri kaydet", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Değişiklikler kaydedildi",
    );
  };
  await menu.getByRole("button", { name: "Kategoriler" }).click();
  await page.getByRole("button", { name: "+ Kategori ekle" }).click();
  await page
    .getByLabel("Kategori adı", { exact: true })
    .fill("Panel Kategorisi");
  await page.getByLabel("Kısa ad", { exact: true }).fill("Panel Grubu");
  await page
    .getByLabel("Kategori adresi", { exact: true })
    .fill("panel-kategorisi");
  await page
    .getByLabel("Kategori açıklaması", { exact: true })
    .fill("Panelden oluşturulan yeni kategori.");
  await page.getByLabel("Kullanım alanı", { exact: true }).fill("Günlük bakım");
  await page
    .getByRole("button", { name: "Kütüphaneden seç", exact: true })
    .click();
  await page.locator(".admin-library button").first().click();
  await page
    .getByLabel("Yayın durumu", { exact: true })
    .selectOption("published");
  await save();
  expect((await page.request.get("/kategori/panel-kategorisi")).status()).toBe(
    200,
  );
  await menu.getByRole("button", { name: "Blog yazıları" }).click();
  await page.getByRole("button", { name: "+ Yazı ekle" }).click();
  await page
    .getByLabel("Yazı başlığı", { exact: true })
    .fill("Panelden İlk Yazı");
  await page
    .getByLabel("Yazı adresi", { exact: true })
    .fill("panelden-ilk-yazi");
  await page.getByLabel("Konu / kategori", { exact: true }).fill("Ürün bakımı");
  await page
    .getByLabel("Kısa özet", { exact: true })
    .fill("Panelden yazılan yeni blog yazısı.");
  await page
    .getByLabel("Giriş paragrafı", { exact: true })
    .fill("Bez bakımı için önerilerimizi okuyabilirsiniz.");
  await page
    .getByRole("button", { name: "Kütüphaneden seç", exact: true })
    .click();
  await page.locator(".admin-library button").first().click();
  await page
    .getByLabel("Kapak görseli açıklaması", { exact: true })
    .fill("Temizlik bezi");
  await page
    .getByLabel("Bölüm 1 başlığı", { exact: true })
    .fill("Bezinizi tanıyın");
  await page
    .getByLabel("Bölüm 1 metni", { exact: true })
    .fill("Ürün etiketinde yer alan bakım talimatlarına uyun.");
  await page
    .getByLabel("Yayın durumu", { exact: true })
    .selectOption("published");
  await save();
  expect((await page.request.get("/blog/panelden-ilk-yazi")).status()).toBe(
    200,
  );
  await menu.getByRole("button", { name: "Sayfa içerikleri" }).click();
  await page
    .getByLabel("Düzenlenecek alan", { exact: true })
    .selectOption("contact");
  await page.getByRole("button", { name: "+ Sayfaya bölüm ekle" }).click();
  await page
    .getByLabel("Ek bölüm 1 başlığı", { exact: true })
    .fill("Panelden yeni bölüm");
  await page
    .getByLabel("Ek bölüm 1 açıklaması", { exact: true })
    .fill("Bize ürün taleplerinizi WhatsApp üzerinden iletin.");
  await page
    .getByLabel("Yayın durumu", { exact: true })
    .selectOption("published");
  await save();
  await page.goto("/iletisim");
  await expect(
    page.getByRole("heading", { name: "Panelden yeni bölüm" }),
  ).toBeVisible();
});

test("Bilgilendirme ve sosyal hesaplar panelden kaydedilir ve kalıcı görünür", async ({ page }) => {
  await login(page);
  const menu = page.getByRole("navigation", { name: "Yönetim menüsü" });
  await menu.getByRole("button", { name: "Bilgilendirme", exact: true }).click();
  await page.getByRole("button", { name: "+ Soru ekle", exact: true }).click();
  await page.getByLabel("Soru", { exact: true }).last().fill("Panelden eklenen soru?");
  await page.getByLabel("Yanıt", { exact: true }).last().fill("Bu yanıt yönetim panelinden eklendi.");
  await page.getByLabel("Resmî unvan", { exact: true }).fill("Yalnızca test işletmesi");
  await page.getByRole("button", { name: "9. bölümü yukarı taşı" }).click();
  await page.getByLabel("Düzenlenecek bilgilendirme sayfası").selectOption("order");
  await page.getByLabel("Sayfa başlığı", { exact: true }).fill("Sipariş rehberi güncellendi");
  await menu.getByRole("button", { name: "Site ayarları", exact: true }).click();
  await page.getByLabel("Instagram bağlantısı").fill("https://www.instagram.com/test-account/");
  await page.getByRole("button", { name: "Değişiklikleri kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("Değişiklikler kaydedildi. Yayındaki içerikler sitede güncellendi.");
  await page.reload();
  await menu.getByRole("button", { name: "Bilgilendirme", exact: true }).click();
  await expect(page.getByLabel("Soru", { exact: true }).nth(7)).toHaveValue("Panelden eklenen soru?");
  await page.goto("/sss");
  await expect(page.locator(".faq-item").nth(7)).toContainText("Panelden eklenen soru?");
  await expect(page.locator(".utility-social").getByRole("link", { name: "Instagram (yeni sekmede)" })).toHaveAttribute("href", "https://www.instagram.com/test-account/");
  await page.goto("/siparis-ve-teslimat");
  await expect(page.locator("h1")).toHaveText("Sipariş rehberi güncellendi");
  await page.goto("/mesafeli-satis-sozlesmesi");
  await expect(page.locator(".merchant-information")).toContainText("Yalnızca test işletmesi");
});

test("Panel masaüstü ve mobilde taşmaz; temel ekranlar erişilebilir", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await login(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const name of [
      "Genel bakış",
      "Ürünler",
      "Sayfa içerikleri",
      "Görsel kütüphanesi",
      "Site ayarları",
      "Bilgilendirme",
      "Hesabım",
    ]) {
      await page
        .getByRole("navigation", { name: "Yönetim menüsü" })
        .getByRole("button", { name })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (name === "Genel bakış")
        await page.screenshot({
          path: `artifacts/screenshots/admin-${width}.png`,
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const name of ["Genel bakış", "Site ayarları", "Sayfa içerikleri", "Bilgilendirme"]) {
    await page
      .getByRole("navigation", { name: "Yönetim menüsü" })
      .getByRole("button", { name })
      .click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  }
});
