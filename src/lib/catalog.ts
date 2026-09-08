export type Category = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  useCase: string;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  summary: string;
  description: string;
  images: { src: string; alt: string }[];
  useCases: string[];
  specifications?: Partial<
    Record<
      | "Ürün kodu"
      | "Ölçüler"
      | "Gramaj"
      | "Malzeme bileşimi"
      | "Renk seçenekleri"
      | "Paket içeriği"
      | "Bakım bilgileri",
      string
    >
  >;
  featured: boolean;
  isDemo: boolean;
  isPublished: boolean;
};
export function validateCatalog(categories: Category[], products: Product[]) {
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length)
      throw new Error(`Yinelenen ${label}.`);
    if (values.some((value) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)))
      throw new Error(`Geçersiz ${label}.`);
  };
  unique(
    categories.map((c) => c.id),
    "kategori kimliği",
  );
  unique(
    categories.map((c) => c.slug),
    "kategori slug",
  );
  unique(
    products.map((p) => p.id),
    "ürün kimliği",
  );
  unique(
    products.map((p) => p.slug),
    "ürün slug",
  );
  for (const c of categories)
    if (
      !c.name?.trim() ||
      !c.shortName?.trim() ||
      !c.description?.trim() ||
      !c.useCase?.trim() ||
      !c.image?.startsWith("/images/")
    )
      throw new Error(`Eksik kategori: ${c.id}`);
  for (const p of products) {
    if (!categories.some((c) => c.id === p.categoryId))
      throw new Error(`Geçersiz kategori ilişkisi: ${p.id}`);
    if (
      !p.name?.trim() ||
      !p.summary?.trim() ||
      !p.description?.trim() ||
      !p.images?.length ||
      !Array.isArray(p.useCases) ||
      !p.useCases.length ||
      p.useCases.some((u) => typeof u !== "string" || !u.trim())
    )
      throw new Error(`Eksik ürün: ${p.id}`);
    if (
      [p.isDemo, p.isPublished, p.featured].some((v) => typeof v !== "boolean")
    )
      throw new Error(`Geçersiz ürün durumu: ${p.id}`);
    if (p.images.some((i) => !i.src.startsWith("/images/") || !i.alt.trim()))
      throw new Error(`Geçersiz görsel: ${p.id}`);
    if (
      Object.values(p.specifications ?? {}).some(
        (v) => typeof v !== "string" || !v.trim(),
      )
    )
      throw new Error(`Geçersiz teknik bilgi: ${p.id}`);
  }
}
export const visibleProducts = (products: Product[], demo: boolean) =>
  products.filter((p) =>
    demo ? p.isDemo || p.isPublished : p.isPublished && !p.isDemo,
  );
export const normalizeSearch = (text: string) =>
  text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
export type CatalogQuery = {
  q?: string;
  kategori?: string;
  kullanim?: string;
  siralama?: string;
  sayfa?: string;
};
export const PAGE_SIZE = 9;
export function filterCatalog(
  products: Product[],
  categories: Category[],
  query: CatalogQuery,
  pageSize = PAGE_SIZE,
) {
  const terms = normalizeSearch((query.q ?? "").slice(0, 100))
    .split(" ")
    .filter(Boolean);
  const filtered = products
    .filter((p) => {
      const category = categories.find((c) => c.id === p.categoryId);
      const haystack = normalizeSearch(
        [p.name, category?.name, ...p.useCases].join(" "),
      );
      return (
        (!query.kategori || category?.slug === query.kategori) &&
        (!query.kullanim || p.useCases.includes(query.kullanim)) &&
        terms.every((t) => haystack.includes(t))
      );
    })
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, "tr") * (query.siralama === "za" ? -1 : 1),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const raw = Number(query.sayfa);
  const page = Math.min(
    pages,
    Math.max(1, Number.isSafeInteger(raw) ? raw : 1),
  );
  return {
    products: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    pages,
    page,
  };
}
