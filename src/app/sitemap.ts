import type { MetadataRoute } from "next";
import { isIndexable } from "@/config/site";
import {
  getSiteConfig,
  getProducts,
  getAllCategories,
  getBlogPosts,
} from "@/lib/content";

import { sitemapPaths } from "@/lib/sitemap";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteConfig = (await getSiteConfig());
  const products = (await getProducts()),
    categories = (await getAllCategories()),
    blogPosts = (await getBlogPosts());
  const paths = sitemapPaths(products, categories, isIndexable, {
    privacy: siteConfig.legal.privacy.approved,
    disclosure: siteConfig.legal.disclosure.approved,
  });
  if (isIndexable)
    paths.push("/blog", ...blogPosts.map((post) => `/blog/${post.slug}`));
  return paths.map((path) => ({
    url: new URL(path, siteConfig.url!).toString(),
  }));
}
