import { siteConfig } from "@/config/site";
import { products, categories } from "@/data/catalog";
import { visibleProducts } from "@/lib/catalog";
export const getProducts = () => visibleProducts(products, siteConfig.demo);
export const getProduct = (slug: string) =>
  getProducts().find((p) => p.slug === slug);
export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);
export const getCategories = () =>
  categories.filter((c) => getProducts().some((p) => p.categoryId === c.id));
