import Link from "next/link";
import { getSiteConfig } from "@/lib/content";
import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { ProductImage } from "@/components/product-image";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  return (await pageMetadata(
    "Hakkımızda",
    "Temelleri 1992 yılında Hüseyin Bayhan tarafından atılan firmamızın tecrübesini ve müşteri memnuniyetine verdiği önemi keşfedin.",
    "/hakkimizda",
  ));
}
import { getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
export default async function AboutPage() {
  const fields = (await getPageContent("about")).fields;
  const siteConfig = (await getSiteConfig());
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Hakkımızda" }]} />
      <div className="about-page">
        <div>
          <span className="eyebrow">{fields.eyebrow}</span>
          <h1>{siteConfig.about.title}</h1>
          <p className="about-subtitle">{siteConfig.subtitle}</p>
          <p>{siteConfig.about.history}</p>
          <p>{siteConfig.about.description}</p>
          <p>{fields.closing}</p>
          <Link href="/urunler" className="button primary">
            Kataloğu Keşfedin
            <Icon size={18} />
          </Link>
        </div>
        {(siteConfig.demo || !siteConfig.visuals.hero.isDemo) && (
          <div className="about-image">
            <ProductImage
              src={siteConfig.visuals.hero.src}
              alt={siteConfig.visuals.hero.alt}
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
            />
            {siteConfig.visuals.hero.isDemo && (
              <span className="image-label">Temsilî görsel</span>
            )}
          </div>
        )}
      </div>
      <CmsSections page="about" />
      <ContactCta />
    </div>
  );
}
