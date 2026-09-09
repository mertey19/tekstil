import { siteConfig } from "@/config/site";
import { visibleProducts } from "@/lib/catalog";
import { cache } from "react";
import { readContent } from "@/server/cms-store";
import type { PageKey } from "@/lib/cms-model";
import type { SupportKey } from "@/data/support";
const read = cache(async () => (await readContent()).content);
const previousHeroAlts = [
  "Mavi, açık yeşil ve beyaz katlanmış mikrofiber bezlerden oluşan ürün kompozisyonu",
  "Denizli Silen Mikrofiber Deposu tanıtım afişi: renkli mikrofiber temizlik bezleri, toptan ve perakende, yakında burada açılıyor",
];
export async function getSiteConfig() {
  const settings = (await read()).settings;
  const hero = { ...settings.hero };
  if (hero.src === siteConfig.visuals.hero.src) {
    hero.isDemo = siteConfig.visuals.hero.isDemo;
    if (previousHeroAlts.includes(hero.alt)) hero.alt = siteConfig.visuals.hero.alt;
  }
  return {
    ...siteConfig,
    name: settings.name,
    fullName: settings.fullName,
    subtitle: settings.subtitle,
    whatsapp: settings.whatsapp,
    about: settings.about,
    visuals: { hero },
    legal: settings.legal,
    social: settings.social,
    merchant: settings.merchant,
  };
}
export const getPageContent = async (key: PageKey) => (await read()).pages[key];
export const getSupportPage = async (key: SupportKey) => (await read()).settings.support[key];
export const getAllCategories = async () =>
  (await read()).categories.filter((c) => c.status === "published");
export const getProducts = async () => {
  const { products, categories } = await read();
  return visibleProducts(
    products.filter(
      (p) =>
        p.status === "published" &&
        categories.some(
          (c) => c.id === p.categoryId && c.status === "published",
        ),
    ),
    siteConfig.demo,
  );
};
export const getProduct = async (slug: string) =>
  (await getProducts()).find((p) => p.slug === slug);
export const getCategory = async (slug: string) =>
  (await getAllCategories()).find((c) => c.slug === slug);
export const getCategories = () => getAllCategories();
export const getBlogPosts = async () =>
  (await read()).posts.filter((p) => p.status === "published");
export const getBlogPost = async (slug: string) =>
  (await getBlogPosts()).find((p) => p.slug === slug);
