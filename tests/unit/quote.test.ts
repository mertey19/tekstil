import { test } from "node:test";
import assert from "node:assert/strict";
import { quoteSchema } from "../../src/lib/quote-schema";
import { prepareWhatsAppQuote } from "../../src/lib/whatsapp-quote";
import {
  createQuoteHandler,
  type QuoteDependencies,
} from "../../src/server/quote-handler";
import { createMemoryLimiter } from "../../src/server/rate-limit";
import { products } from "../../src/data/catalog";
const valid = {
  name: "Test Kullanıcısı",
  company: "",
  productId: "cam-bezi",
  quantity: "5",
  message: "Bu yalnızca otomatik test verisidir.",
  website: "",
};
const request = (data: unknown = valid, headers: Record<string, string> = {}) =>
  new Request("https://fixture.test/api/teklif", {
    method: "POST",
    headers: {
      origin: "https://fixture.test",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
const deps = (
  overrides: Partial<QuoteDependencies> = {},
): QuoteDependencies => ({
  origin: "https://fixture.test",
  whatsapp: "+905000000000",
  siteUrl: "https://fixture.test",
  products,
  identity: () => "test",
  rateLimit: async () => true,
  ...overrides,
});
test("WhatsApp formu alan ve adet sınırlarını doğrular", () => {
  assert.equal(quoteSchema.safeParse(valid).success, true);
  for (const quantity of ["0", "-1", "1.5", "1e4", "1000001", "Infinity"])
    assert.equal(quoteSchema.safeParse({ ...valid, quantity }).success, false);
  assert.equal(quoteSchema.safeParse({ ...valid, quantity: "" }).success, true);
  assert.equal(
    quoteSchema.safeParse({ ...valid, message: "kısa" }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({ ...valid, name: "x".repeat(101) }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({ ...valid, email: "unused@example.invalid" })
      .success,
    false,
  );
});
test("Origin ve Fetch Metadata kontrolü", async () => {
  const handler = createQuoteHandler(deps());
  assert.equal(
    (await handler(request(valid, { origin: "https://evil.test" }))).status,
    403,
  );
  assert.equal((await handler(request(valid, { origin: "" }))).status, 403);
  assert.equal(
    (await handler(request(valid, { "sec-fetch-site": "cross-site" }))).status,
    403,
  );
  assert.equal(
    (await handler(request(valid, { "content-type": "text/plain" }))).status,
    415,
  );
});
test("Sunucu ürün kimliği, honeypot, JSON ve boyut doğrulaması", async () => {
  const handler = createQuoteHandler(deps());
  assert.equal(
    (await handler(request({ ...valid, productId: "fake" }))).status,
    422,
  );
  assert.equal(
    (await handler(request({ ...valid, website: "spam" }))).status,
    400,
  );
  assert.equal(
    (await handler(request({ ...valid, message: "x".repeat(20_000) }))).status,
    400,
  );
  assert.equal(
    (
      await handler(
        new Request("https://fixture.test/api/teklif", {
          method: "POST",
          headers: {
            origin: "https://fixture.test",
            "content-type": "application/json",
          },
          body: "{",
        }),
      )
    ).status,
    400,
  );
  assert.equal((await handler(request({ ...valid, name: "" }))).status, 422);
});
test("Eksik veya bozuk WhatsApp numarası sahte hazır/gönderildi sonucu oluşturmaz", async () => {
  for (const whatsapp of [null, "yanlış", "123"]) {
    const response = await createQuoteHandler(deps({ whatsapp }))(request());
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.status, "unconfigured");
    assert.equal(body.url, undefined);
  }
});
test("Hazır mesaj ürün, adet, kişi ve kodlanmış bağlantıyı içerir; dış istek yapmaz", async () => {
  const response = await createQuoteHandler(deps())(request());
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ready");
  const url = new URL(body.url);
  assert.equal(url.host, "wa.me");
  assert.equal(url.pathname, "/905000000000");
  assert.equal(url.searchParams.get("text"), body.message);
  assert.match(body.message, /Mikrofiber Cam Bezi/);
  assert.match(body.message, /Tahmini adet: 5/);
  assert.match(body.message, /https:\/\/fixture.test\/urun\/cam-bezi/);
  assert.match(body.message, /temsilî/);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});
test("Genel mesaj ve doğrulanmamış URL güvenli biçimde hazırlanır", () => {
  const result = prepareWhatsAppQuote(
    "+905000000000",
    { ...valid, productId: "", quantity: "" },
    undefined,
    null,
  )!;
  assert.ok(!result.message.includes("Ürün bağlantısı"));
  assert.ok(!result.message.includes("Tahmini adet"));
  assert.equal(prepareWhatsAppQuote(null, valid, products[0], null), null);
});
test("İstek sınırı ve limiter arızası ayrı yanıtlanır", async () => {
  const handler = createQuoteHandler(
    deps({ rateLimit: createMemoryLimiter(2) }),
  );
  await handler(request());
  await handler(request());
  const blocked = await handler(request());
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers.get("Retry-After"), "900");
  assert.equal(
    (
      await createQuoteHandler(
        deps({
          rateLimit: async () => {
            throw new Error();
          },
        }),
      )(request())
    ).status,
    503,
  );
});
