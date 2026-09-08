import type { Metadata } from "next";
import { isIndexable } from "@/config/site";
import { getSiteConfig } from "@/lib/content";
export async function pageMetadata(
  title: string,
  description: string,
  path: string,
  noindex = false,
): Promise<Metadata> {
  const siteConfig = (await getSiteConfig());
  const url = siteConfig.url
    ? new URL(path, siteConfig.url).toString()
    : undefined;
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    robots: { index: isIndexable && !noindex, follow: true },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      type: "website",
      locale: "tr_TR",
      siteName: siteConfig.name,
      ...(url ? { url } : {}),
    },
  };
}
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export async function BreadcrumbData({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const siteConfig = (await getSiteConfig());
  if (!isIndexable || !siteConfig.url) return null;
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [{ name: "Ana Sayfa", path: "/" }, ...items].map(
          (item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: new URL(item.path, siteConfig.url!).toString(),
          }),
        ),
      }}
    />
  );
}
