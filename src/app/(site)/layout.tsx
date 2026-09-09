import { Header } from "@/components/header";
import { UtilityBar } from "@/components/utility-bar";
import { Footer } from "@/components/footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { isIndexable } from "@/config/site";
import { getSiteConfig } from "@/lib/content";
import { mapLocation } from "@/lib/contact";
import { StructuredData } from "@/lib/seo";
import { CustomerProvider } from "@/components/customer/session";
import { currentCustomer } from "@/server/customer-auth";
export const dynamic = "force-dynamic";
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = (await getSiteConfig());
  const customer = await currentCustomer();
  const map = mapLocation(siteConfig.merchant);
  return (
    <CustomerProvider customer={customer}>
      <a className="skip-link" href="#main">
        Ana içeriğe atla
      </a>
      <UtilityBar whatsapp={siteConfig.whatsapp} social={siteConfig.social} />
      <Header
        name={siteConfig.name}
        subtitle={siteConfig.subtitle}
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
                ...(map
                  ? {
                      geo: {
                        "@type": "GeoCoordinates",
                        latitude: map.lat,
                        longitude: map.lng,
                      },
                      hasMap: map.href,
                    }
                  : {}),
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
    </CustomerProvider>
  );
}
