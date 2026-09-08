import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { siteConfig, isIndexable } from "@/config/site";
import { StructuredData } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Mikrofiber Deposu | Temizlik Bezleri",
    template: "%s | Mikrofiber Deposu",
  },
  description:
    "Mikrofiber bez ve tekstil ürünlerini kullanım alanlarına göre inceleyin. Ürün bilgisi ve teklif için iletişime geçin.",
  robots: { index: isIndexable, follow: true },
  ...(siteConfig.url ? { metadataBase: new URL(siteConfig.url) } : {}),
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>
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
      </body>
    </html>
  );
}
