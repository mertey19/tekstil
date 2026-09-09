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
    icons: {
      icon: [
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      ],
      apple: {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    },
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
