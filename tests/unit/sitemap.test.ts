import { test } from "node:test";
import assert from "node:assert/strict";
import { sitemapEntries, sitemapPaths } from "../../src/lib/sitemap";
import {
  isPublicSiteUrl,
  originFromRequestHeaders,
  publicHttpsOrigin,
  resolveSitemapOrigin,
} from "../../src/lib/site-origin";
import { categories, products } from "../../src/data/catalog";
import { canonicalRedirects } from "../../src/lib/canonical-redirects";

test("Yalnızca gerçek HTTPS kök alan adı sitemap origin olur", () => {
  assert.equal(isPublicSiteUrl("https://www.siliversilen.com/"), true);
  assert.equal(isPublicSiteUrl("https://siliversilen.com/"), true);
  assert.equal(publicHttpsOrigin("www.siliversilen.com"), "https://www.siliversilen.com");
  assert.equal(publicHttpsOrigin("https://www.siliversilen.com/"), "https://www.siliversilen.com");
  for (const value of [
    "",
    "http://www.siliversilen.com",
    "https://localhost/",
    "https://example.com/",
    "https://tekstil-sigma.vercel.app/",
    "https://www.kukuroglu.com.tr/",
    "https://127.0.0.1/",
    "https://fixture.test/",
  ])
    assert.equal(publicHttpsOrigin(value), null);
});

test("Özel alan adı isteği Vercel SITE_URL olsa da sitemap origin üretir", () => {
  assert.equal(resolveSitemapOrigin({ host: "www.silversilen.com.tr", siteUrl: "https://www.siliversilen.com" }), "https://www.siliversilen.com");
  assert.equal(
    resolveSitemapOrigin({
      host: "www.siliversilen.com",
      siteUrl: "https://tekstil-sigma.vercel.app",
    }),
    "https://www.siliversilen.com",
  );
  assert.equal(
    resolveSitemapOrigin({
      host: "127.0.0.1:3001",
      siteUrl: "",
    }),
    null,
  );
  assert.equal(
    resolveSitemapOrigin({
      host: "localhost:3000",
      siteUrl: "https://www.siliversilen.com",
    }),
    "https://www.siliversilen.com",
  );
  assert.equal(
    originFromRequestHeaders(
      new Headers({
        "x-forwarded-host": "www.siliversilen.com",
        host: "localhost:3000",
      }),
      "https://tekstil-sigma.vercel.app",
    ),
    "https://www.siliversilen.com",
  );
});

test("Alan adı yönlendirmeleri yalnızca üretimde tanımlı diğer hostlara uygulanır", () => {
  const primary = "https://www.siliversilen.com";
  const hosts = "tekstil-sigma.vercel.app,www.siliversilen.com,www.silversilen.com.tr,https://bad.test,foo@evil.test";
  assert.deepEqual(canonicalRedirects(primary, hosts, "preview"), []);
  assert.deepEqual(canonicalRedirects("https://localhost", hosts, "production"), []);
  const redirects = canonicalRedirects(primary, hosts, "production");
  assert.equal(redirects.length, 2);
  assert.equal(redirects[0].destination, `${primary}/:path`);
  assert.equal(redirects[0].has[0].value, "tekstil-sigma\\.vercel\\.app");
  assert.equal(redirects[0].permanent, true);
  assert.ok(redirects[0].source.includes("google"));
});

test("Sitemap loc adresleri origin yokken üretilmez; demo ürün sızmaz", () => {
  assert.deepEqual(sitemapEntries(null, ["/"]), []);
  const live = {
    ...products[0],
    id: "gercek",
    slug: "gercek",
    isDemo: false,
    isPublished: true,
  };
  const paths = sitemapPaths([...products, live], categories, true, {
    privacy: false,
    disclosure: false,
  });
  const entries = sitemapEntries("https://www.siliversilen.com", paths);
  assert.ok(entries.some((e) => e.url === "https://www.siliversilen.com/"));
  assert.ok(
    entries.some((e) => e.url === "https://www.siliversilen.com/urun/gercek"),
  );
  assert.ok(!entries.some((e) => e.url.includes("/urun/cam-bezi")));
});
