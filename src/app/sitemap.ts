import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { siteConfig, isIndexable } from "@/config/site";
import {
  getSiteConfig,
  getProducts,
  getAllCategories,
  getBlogPosts,
} from "@/lib/content";
import { sitemapEntries, sitemapPaths } from "@/lib/sitemap";
import { originFromRequestHeaders } from "@/lib/site-origin";
import { supportDefinitions, supportKeys } from "@/data/support";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = originFromRequestHeaders(
    await headers(),
    siteConfig.url,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  );
  if (!origin || !isIndexable) return [];
  const site = await getSiteConfig();
  const products = await getProducts();
  const categories = await getAllCategories();
  const blogPosts = await getBlogPosts();
  const paths = sitemapPaths(products, categories, true, {
    privacy: site.legal.privacy.approved,
    disclosure: site.legal.disclosure.approved,
  });
  paths.push(
    "/blog",
    ...blogPosts.map((post) => `/blog/${post.slug}`),
    ...supportKeys.map((key) => supportDefinitions[key].path),
  );
  return sitemapEntries(origin, paths);
}
