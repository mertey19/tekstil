import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { isIndexable } from "@/config/site";
import { getSiteConfig } from "@/lib/content";
import { StructuredData } from "@/lib/seo";
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = (await getSiteConfig());
  return (
    <>
      <a className="skip-link" href="#main">
        Ana içeriğe atla
      </a>
      <Header
        name={siteConfig.name}
        subtitle={siteConfig.subtitle}
        demo={siteConfig.demo}
      />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      {isIndexable && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: siteConfig.name,
                legalName: siteConfig.fullName,
                url: siteConfig.url,
              },
              {
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.url,
                inLanguage: "tr-TR",
              },
            ],
          }}
        />
      )}
    </>
  );
}
