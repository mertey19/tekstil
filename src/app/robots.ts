import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { siteConfig } from "@/config/site";
import { originFromRequestHeaders } from "@/lib/site-origin";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = originFromRequestHeaders(
    await headers(),
    siteConfig.url,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin/", "/hesabim", "/api/uyelik/"],
    },
    ...(origin
      ? { sitemap: new URL("/sitemap.xml", `${origin}/`).toString() }
      : {}),
  };
}
