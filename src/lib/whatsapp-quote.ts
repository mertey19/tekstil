import type { QuoteData } from "./quote-schema";
import type { Product } from "./catalog";
import { normalizePhone } from "./contact";
export function prepareWhatsAppQuote(
  phone: string | null,
  data: QuoteData,
  product: Product | undefined,
  siteUrl: string | null,
) {
  const number = normalizePhone(phone);
  if (!number) return null;
  const message = [
    product
      ? `Merhaba, ${product.name} hakkında bilgi ve teklif almak istiyorum.`
      : "Merhaba, mikrofiber ürünler hakkında bilgi ve teklif almak istiyorum.",
    product?.isDemo
      ? "Not: İncelediğim ürün önizleme kataloğundaki temsilî bir üründür."
      : "",
    `Ad soyad: ${data.name}`,
    data.company ? `Firma: ${data.company}` : "",
    data.quantity ? `Tahmini adet: ${data.quantity}` : "",
    product && siteUrl
      ? `Ürün bağlantısı: ${new URL(`/urun/${product.slug}`, siteUrl).toString()}`
      : "",
    "",
    `Mesaj: ${data.message}`,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    message,
    url: `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
  };
}
