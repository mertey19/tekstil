import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { ProductImage } from "@/components/product-image";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Hakkımızda",
  "Temelleri 1992 yılında Hüseyin Bayhan tarafından atılan firmamızın tecrübesini ve müşteri memnuniyetine verdiği önemi keşfedin.",
  "/hakkimizda",
);
export default function AboutPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Hakkımızda" }]} />
      <div className="about-page">
        <div>
          <span className="eyebrow">MİKROFİBER DEPOSU</span>
          <h1>
            1992’den bugüne,
            <br />
            <em>tecrübeyle ve güvenle.</em>
          </h1>
          <p className="about-subtitle">
            Siliver Silen Temizlik Bezleri Dünyası
          </p>
          <p>{siteConfig.about.history}</p>
          <p>{siteConfig.about.description}</p>
          <p>
            Mikrofiber Deposu — Siliver Silen Temizlik Bezleri Dünyası adıyla
            mikrofiber temizlik bezleri ve tekstil ürünlerini tanıtıyoruz.
            İhtiyacınıza uygun ürün hakkında bilgi ve teklif almak için
            WhatsApp üzerinden bizimle iletişime geçebilirsiniz.
          </p>
          <Link href="/urunler" className="button primary">
            Kataloğu Keşfedin
            <Icon size={18} />
          </Link>
        </div>
        {(siteConfig.demo || !siteConfig.visuals.hero.isDemo) && (
          <div className="about-image">
            <ProductImage
              src={siteConfig.visuals.hero.src}
              alt="Mikrofiber bezlerin dokusunu gösteren temsilî stüdyo görseli"
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
            />
            {siteConfig.visuals.hero.isDemo && (
              <span className="image-label">Temsilî görsel</span>
            )}
          </div>
        )}
      </div>
      <ContactCta />
    </div>
  );
}
