import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/content";
import { isIndexable } from "@/config/site";
import "./globals.css";
import "./customer.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const config = (await getSiteConfig());
  return {
    title: {
      default: config.name + " | Temizlik Bezleri",
      template: "%s | " + config.name,
    },
    description:
      "Mikrofiber bez ve tekstil ürünleri. Ürün bilgisi ve teklif için iletişime geçin.",
    robots: { index: isIndexable, follow: true },
    ...(config.url ? { metadataBase: new URL(config.url) } : {}),
    icons: { icon: "/icon.svg" },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
