import type { siteConfig } from "@/config/site";
import type { Category, Product } from "./catalog";
import { normalizePhone } from "./contact";
import { isPublicSiteUrl } from "./site-origin";
import { productImages } from "../data/product-images";
export function releaseIssues(
  config: typeof siteConfig & { shop?: { enabled: boolean } },
  products: Product[],
  categories: Category[],
  env: Record<string, string | undefined>,
) {
  const issues: string[] = [];
  if (config.demo) issues.push("SITE_MODE=live değil; demo modu açık.");
  if (config.preview)
    issues.push("SITE_PREVIEW=false değil; önizleme modu açık.");
  if (!isPublicSiteUrl(config.url || ""))
    issues.push(
      "SITE_URL doğrulanmış, HTTPS kullanan gerçek bir kök alan adı olmalı.",
    );
  if (env.SITE_DOMAIN_VERIFIED !== "true")
    issues.push("Alan adı doğrulanmadı: SITE_DOMAIN_VERIFIED=true gerekli.");
  if (env.CONTENT_APPROVED !== "true")
    issues.push(
      "Marka, faaliyetler ve içerik onayı eksik: CONTENT_APPROVED=true gerekli.",
    );
  if (!normalizePhone(config.whatsapp))
    issues.push("WhatsApp iletişim numarası eksik veya geçersiz.");
  if (env.VERCEL_ENV === "production" && env.PAYMENT_TEST_MODE === "true")
    issues.push("Production ortamında PAYMENT_TEST_MODE kapatılmalıdır.");
  if (config.shop?.enabled) {
    if (!env.PAYMENT_PROVIDER)
      issues.push("Mağaza açık ancak sanal POS sağlayıcısı yapılandırılmamış.");
    if (env.PAYMENT_PROVIDER === "mock")
      issues.push("Mock ödeme sağlayıcısı canlı mağazada kullanılamaz.");
  }
  const live = products.filter((p) => p.isPublished && !p.isDemo);
  if (!live.length) issues.push("Yayımlanmış gerçek ürün bulunmuyor.");
  if (products.some((p) => p.isDemo && p.isPublished))
    issues.push("Demo ürün yayımlanmış olarak işaretlenmiş.");
  const demoImages = [
    "/images/glass.webp",
    "/images/auto.webp",
    ...Object.values(productImages).map((image) => image.src),
  ];
  if (live.some((p) => p.images.some((i) => demoImages.includes(i.src))))
    issues.push("Gerçek ürüne temsilî demo görseli atanmış.");
  if (
    categories.some(
      (c) =>
        live.some((p) => p.categoryId === c.id) && demoImages.includes(c.image),
    )
  )
    issues.push("Canlı kategorilerde demo görseli var.");
  if (!config.visuals.hero || config.visuals.hero.isDemo)
    issues.push("Ana tanıtım görseli henüz doğrulanmış değil.");
  for (const [name, document] of Object.entries(config.legal))
    if (!document.approved || !document.text?.trim())
      issues.push(`${name}: onaylanmış hukuki metin eksik.`);
  return issues;
}
