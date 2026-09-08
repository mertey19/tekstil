import Link from "next/link";
import { getCategories, getProducts, getPageContent } from "@/lib/content";
import { filterCatalog, type CatalogQuery, type Category } from "@/lib/catalog";
import { Breadcrumbs, ContactCta, EmptyState, ProductGrid } from "./catalog-ui";
import { CatalogToolbar, ProductFilters } from "./product-filters";
import { Icon } from "./icon";
import { CmsSections } from "./cms-sections";
import { BreadcrumbData } from "@/lib/seo";

export type SearchParams = Record<string, string | string[] | undefined>;
export function parseQuery(params: SearchParams): CatalogQuery {
  return Object.fromEntries(
    ["q", "kategori", "kullanim", "siralama", "sayfa"].map((k) => [
      k,
      typeof params[k] === "string" ? params[k] : undefined,
    ]),
  );
}
export async function CatalogPage({
  query,
  category,
}: {
  query: CatalogQuery;
  category?: Category;
}) {
  const fields = (await getPageContent("products")).fields;
  const products = (await getProducts());
  const categories = (await getCategories());
  const result = filterCatalog(products, categories, {
    ...query,
    kategori: category?.slug ?? query.kategori,
  });
  const path = category ? `/kategori/${category.slug}` : "/urunler";
  const href = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...query, ...updates }))
      if (value) params.set(key, value);
    return `${path}${params.size ? `?${params}` : ""}`;
  };
  const active = [
    { key: "q", value: query.q ? `Arama: ${query.q}` : undefined },
    {
      key: "kategori",
      value:
        !category && query.kategori
          ? categories.find((c) => c.slug === query.kategori)?.shortName ||
            query.kategori
          : undefined,
    },
    { key: "kullanim", value: query.kullanim },
  ].filter((f) => f.value);
  const scoped = category
    ? products.filter((p) => p.categoryId === category.id)
    : products;
  return (
    <div className="container">
      <Breadcrumbs
        items={
          category
            ? [{ label: "Ürünler", href: "/urunler" }, { label: category.name }]
            : [{ label: "Ürünler" }]
        }
      />
      <div className="page-heading">
        <span className="eyebrow">{fields.eyebrow}</span>
        <h1>{category?.name || fields.title}</h1>
        <p>{category?.description || fields.description}</p>
      </div>
      <div className="catalog-layout">
        <ProductFilters
          categories={categories.map((c) => ({
            ...c,
            count: products.filter((p) => p.categoryId === c.id).length,
          }))}
          useCases={[...new Set(scoped.flatMap((p) => p.useCases))].sort(
            (a, b) => a.localeCompare(b, "tr"),
          )}
          fixedCategory={category?.slug}
        />
        <div className="catalog-results">
          <CatalogToolbar total={result.total} />
          {active.length > 0 && (
            <div className="active-filters" aria-label="Aktif filtreler">
              {active.map((f) => (
                <Link
                  key={f.key}
                  href={href({ [f.key]: undefined, sayfa: undefined })}
                  aria-label={`${f.value} filtresini kaldır`}
                >
                  {f.value}
                  <Icon name="close" size={13} />
                </Link>
              ))}
              <Link href={path} className="clear-filters">
                Filtreleri Temizle
              </Link>
            </div>
          )}
          {result.total ? (
            <section aria-label="Ürün sonuçları">
              <h2 className="sr-only">Ürün sonuçları</h2>
              <ProductGrid products={result.products} eagerFirst />
            </section>
          ) : (
            <EmptyState href={path} />
          )}
          {result.pages > 1 && (
            <nav className="pagination" aria-label="Sayfalar">
              {Array.from({ length: result.pages }, (_, index) => (
                <Link
                  key={index}
                  href={href({ sayfa: String(index + 1) })}
                  aria-current={index + 1 === result.page ? "page" : undefined}
                  aria-label={`Sayfa ${index + 1}`}
                >
                  {index + 1}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
      {!category && <CmsSections page="products" />}
      <ContactCta />
      <BreadcrumbData
        items={
          category
            ? [
                { name: "Ürünler", path: "/urunler" },
                { name: category.name, path },
              ]
            : [{ name: "Ürünler", path }]
        }
      />
    </div>
  );
}
