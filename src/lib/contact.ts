export function normalizePhone(phone: string | null): string | null {
  if (!phone || /[^+\d\s().-]/.test(phone)) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0"))
    digits = `90${digits.slice(1)}`;
  else if (digits.length === 10 && !phone.startsWith("+"))
    digits = `90${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}
export function whatsappLink(
  phone: string | null,
  product?: { name: string; url?: string },
): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const text = product
    ? `Merhaba, ${product.name} hakkında bilgi ve teklif almak istiyorum.${product.url ? ` Ürün bağlantısı: ${product.url}` : ""}`
    : "Merhaba, mikrofiber ürünler hakkında bilgi ve teklif almak istiyorum.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
