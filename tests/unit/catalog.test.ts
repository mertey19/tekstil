import { test } from "node:test";
import assert from "node:assert/strict";
import { categories, products } from "../../src/data/catalog";
import {
  filterCatalog,
  normalizeSearch,
  validateCatalog,
  visibleProducts,
} from "../../src/lib/catalog";
import { sitemapPaths } from "../../src/lib/sitemap";
import { mapLocation, normalizePhone, whatsappLink } from "../../src/lib/contact";
import { releaseIssues } from "../../src/lib/release";
import { siteConfig } from "../../src/config/site";

test("Türkçe İ/I/ı ve aksanlı aramalar normalize edilir", () => {
  assert.equal(normalizeSearch("ARAÇ İÇİ ÇÖZÜM ŞĞ"), "arac ici cozum sg");
  for (const q of ["ARAÇ", "araç", "arac"])
    assert.equal(filterCatalog(products, categories, { q }).total, 2);
  assert.equal(filterCatalog(products, categories, { q: "MUTFAK" }).total, 2);
  assert.equal(
    filterCatalog(products, categories, { q: "cam ve ayna" }).total,
    2,
  );
});
test("Kategori, kullanım ve arama birlikte uygulanır", () => {
  assert.equal(
    filterCatalog(products, categories, {
      kategori: "arac-temizlik-bezleri",
      kullanim: "Genel yüzeyler",
      q: "araç",
    }).products[0].id,
    "arac-ici-temizlik-bezi",
  );
  assert.equal(
    filterCatalog(products, categories, { kategori: "yanlis" }).total,
    0,
  );
  assert.equal(
    filterCatalog(products, categories, { q: "bulunamaz" }).total,
    0,
  );
});
test("Türkçe sıralama iki yönde ve sayfalama sınırları", () => {
  const az = filterCatalog(products, categories, {}, 100).products;
  const za = filterCatalog(
    products,
    categories,
    { siralama: "za" },
    100,
  ).products;
  assert.deepEqual(
    az.map((p) => p.id).reverse(),
    za.map((p) => p.id),
  );
  assert.equal(filterCatalog(products, categories, { sayfa: "999" }).page, 2);
  assert.equal(
    filterCatalog(products, categories, { sayfa: "2" }).products.length,
    1,
  );
  for (const sayfa of ["-1", "foo", "Infinity", "1.5"])
    assert.equal(filterCatalog(products, categories, { sayfa }).page, 1);
});
test("Katalog şeması slug, ilişki ve alan hatalarını yakalar", () => {
  assert.doesNotThrow(() => validateCatalog(categories, products));
  assert.throws(
    () => validateCatalog(categories, [...products, products[0]]),
    /Yinelenen/,
  );
  assert.throws(
    () =>
      validateCatalog(categories, [{ ...products[0], categoryId: "eksik" }]),
    /ilişkisi/,
  );
  assert.throws(
    () => validateCatalog(categories, [{ ...products[0], images: [] }]),
    /Eksik/,
  );
  assert.throws(
    () => validateCatalog(categories, [{ ...products[0], slug: "İsim" }]),
    /Geçersiz/,
  );
});
test("Demo ve taslak ürünler canlı katalog ve sitemap'e sızmaz", () => {
  const actual = {
    ...products[0],
    id: "gercek",
    slug: "gercek",
    isDemo: false,
    isPublished: true,
  };
  const draft = { ...products[1], isDemo: false, isPublished: false };
  assert.equal(visibleProducts(products, false).length, 0);
  assert.equal(visibleProducts(products, true).length, 10);
  assert.deepEqual(visibleProducts([...products, actual, draft], false), [
    actual,
  ]);
  assert.deepEqual(
    sitemapPaths(products, categories, false, {
      privacy: false,
      disclosure: false,
    }),
    [],
  );
  const paths = sitemapPaths([...products, actual, draft], categories, true, {
    privacy: false,
    disclosure: false,
  });
  assert.ok(paths.includes("/urun/gercek"));
  assert.ok(paths.includes("/kategori/mikrofiber-cam-bezleri"));
  assert.ok(!paths.includes("/urun/cam-bezi"));
  assert.ok(!paths.includes("/teklif-al"));
  assert.ok(!paths.some((p) => p.includes("?")));
});
test("Harita bağlantısı yalnızca geçerli koordinatlardan üretilir", () => {
  assert.equal(mapLocation({ mapLatitude: "", mapLongitude: "" }), null);
  assert.equal(mapLocation({ mapLatitude: "91", mapLongitude: "29" }), null);
  assert.equal(
    mapLocation({ mapLatitude: "37.7841269", mapLongitude: "" }),
    null,
  );
  const map = mapLocation({
    mapLatitude: "37.7841269",
    mapLongitude: "29.0876543",
    mapLabel: "Topraklık Mahallesi, Pamukkale / Denizli",
  });
  assert.equal(
    map?.href,
    "https://www.google.com/maps?q=37.7841269,29.0876543&z=17&hl=tr",
  );
  assert.equal(
    map?.embed,
    "https://maps.google.com/maps?q=37.7841269,29.0876543&z=17&hl=tr&output=embed",
  );
  assert.equal(map?.label, "Topraklık Mahallesi, Pamukkale / Denizli");
  assert.equal(
    mapLocation({
      mapLatitude: "37.7841269",
      mapLongitude: "29.0876543",
      mapLabel: "Etiket",
      address: "Resmî adres",
    })?.label,
    "Resmî adres",
  );
});
test("WhatsApp uluslararası numara ve Türkçe mesajı doğru kodlar", () => {
  // Non-routable synthetic fixture used only to inspect a URL, never contacted.
  assert.equal(normalizePhone("0 (500) 000 00 00"), "905000000000");
  assert.equal(normalizePhone("0090 500 000 00 00"), "905000000000");
  assert.equal(normalizePhone("+44 7700 900000"), "447700900000");
  assert.equal(normalizePhone("abc"), null);
  assert.equal(whatsappLink(null), null);
  const result = new URL(
    whatsappLink("+90 500 000 00 00", {
      name: "Araç İçi Bezi",
      url: "https://fixture.test/urun/arac",
    })!,
  );
  assert.equal(result.pathname, "/905000000000");
  assert.equal(
    result.searchParams.get("text"),
    "Merhaba, Araç İçi Bezi hakkında bilgi ve teklif almak istiyorum. Ürün bağlantısı: https://fixture.test/urun/arac",
  );
});
test("Eksik canlı ayarlar ve yanlış alan adları yayını engeller", () => {
  const issues = releaseIssues(
    { ...siteConfig, whatsapp: null },
    products,
    categories,
    {},
  );
  assert.ok(issues.some((i) => i.includes("demo modu")));
  assert.ok(issues.some((i) => i.includes("WhatsApp")));
  assert.ok(issues.some((i) => i.includes("gerçek ürün")));
  assert.ok(issues.some((i) => i.includes("hukuki")));
  for (const url of [
    "http://localhost:3000",
    "https://example.com",
    "https://www.kukuroglu.com.tr",
    "https://fixture.test",
    "https://127.0.0.1",
  ])
    assert.ok(
      releaseIssues({ ...siteConfig, url }, products, categories, {}).some(
        (i) => i.startsWith("SITE_URL"),
      ),
    );
});
