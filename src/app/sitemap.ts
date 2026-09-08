import type { MetadataRoute } from "next";
import { siteConfig, isIndexable } from "@/config/site";
import { products, categories } from "@/data/catalog";
import { sitemapPaths } from "@/lib/sitemap";
import { blogPosts } from "@/data/blog";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = sitemapPaths(products, categories, isIndexable, {
    privacy: siteConfig.legal.privacy.approved,
    disclosure: siteConfig.legal.disclosure.approved,
  });
  if (isIndexable) paths.push("/blog", ...blogPosts.map((post) => `/blog/${post.slug}`));
  return paths.map((path) => ({ url: new URL(path, siteConfig.url!).toString() }));
}
