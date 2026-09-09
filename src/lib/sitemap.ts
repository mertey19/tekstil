import type { Product, Category } from "./catalog";
export function sitemapPaths(
  products: Product[],
  categories: Category[],
  indexable: boolean,
  legal: { privacy: boolean; disclosure: boolean },
) {
  if (!indexable) return [];
  const live = products.filter((p) => p.isPublished && !p.isDemo);
  return [
    "/",
    "/urunler",
    "/hakkimizda",
    "/iletisim",
    ...(legal.privacy ? ["/gizlilik"] : []),
    ...(legal.disclosure ? ["/aydinlatma"] : []),
    ...categories
      .filter((c) => live.some((p) => p.categoryId === c.id))
      .map((c) => `/kategori/${c.slug}`),
    ...live.map((p) => `/urun/${p.slug}`),
  ];
}

export function sitemapEntries(origin: string | null, paths: string[]) {
  if (!origin) return [];
  const base = origin.endsWith("/") ? origin : `${origin}/`;
  return paths.map((path) => ({ url: new URL(path, base).toString() }));
}
