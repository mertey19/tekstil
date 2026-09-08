import type { MetadataRoute } from "next";
import { siteConfig, isIndexable } from "@/config/site";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin/"] },
    ...(isIndexable && siteConfig.url
      ? { sitemap: new URL("/sitemap.xml", siteConfig.url).toString() }
      : {}),
  };
}
