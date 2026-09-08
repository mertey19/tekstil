import { quoteSchema, fieldErrors } from "@/lib/quote-schema";
import type { Product } from "@/lib/catalog";
import { prepareWhatsAppQuote } from "@/lib/whatsapp-quote";
export type QuoteDependencies = {
  origin: string | null;
  whatsapp: string | null;
  siteUrl: string | null;
  products: Product[];
  identity: (request: Request) => string;
  rateLimit: (identity: string) => Promise<boolean>;
};
const json = (
  status: number,
  body: object,
  extra: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
async function readBody(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length") || 0) > 16_384)
    throw new Error("size");
  if (!request.body) throw new Error("body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        throw new Error("size");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function createQuoteHandler(deps: QuoteDependencies) {
  return async (request: Request) => {
    if (
      !deps.origin ||
      request.headers.get("origin") !== deps.origin ||
      (request.headers.has("sec-fetch-site") &&
        !["same-origin", "none"].includes(
          request.headers.get("sec-fetch-site")!,
        ))
    )
      return json(403, {
        status: "error",
        message:
          "İstek kaynağı doğrulanamadı. Sayfayı yenileyip tekrar deneyin.",
      });
    if (
      request.headers.get("content-type")?.split(";")[0].trim() !==
      "application/json"
    )
      return json(415, { status: "error", message: "Geçersiz istek biçimi." });
    try {
      if (!(await deps.rateLimit(deps.identity(request))))
        return json(
          429,
          {
            status: "error",
            message:
              "Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.",
          },
          { "Retry-After": "900" },
        );
    } catch {
      return json(503, {
        status: "error",
        message: "Mesaj şu anda hazırlanamadı. Lütfen daha sonra deneyin.",
      });
    }
    let raw: unknown;
    try {
      raw = await readBody(request);
    } catch {
      return json(400, {
        status: "error",
        message: "İstek okunamadı veya izin verilen boyutu aşıyor.",
      });
    }
    const parsed = quoteSchema.safeParse(raw);
    if (!parsed.success)
      return json(422, {
        status: "validation",
        errors: fieldErrors(parsed.error),
        message: "Lütfen işaretli alanları kontrol edin.",
      });
    const data = parsed.data;
    if (data.website)
      return json(400, { status: "error", message: "İstek doğrulanamadı." });
    const product = deps.products.find((p) => p.id === data.productId);
    if (data.productId && !product)
      return json(422, {
        status: "validation",
        errors: {
          productId: "Bu ürün bulunamadı. Lütfen listeden bir ürün seçin.",
        },
        message: "Ürün seçimini kontrol edin.",
      });
    const result = prepareWhatsAppQuote(
      deps.whatsapp,
      data,
      product,
      deps.siteUrl,
    );
    if (!result)
      return json(503, {
        status: "unconfigured",
        message:
          "WhatsApp iletişim numarası henüz eklenmedi. Mesajınız gönderilmedi.",
      });
    // This response only prepares a deep link. No provider, message sending or storage.
    return json(200, { status: "ready", ...result });
  };
}
