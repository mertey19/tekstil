import {
  CatalogPage,
  parseQuery,
  type SearchParams,
} from "@/components/catalog-page";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return pageMetadata(
    "Ürünler",
    "Mikrofiber cam, araç, kurulama, mutfak ve çok amaçlı temizlik bezlerini keşfedin.",
    "/urunler",
    Object.values(params).some(Boolean),
  );
}
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <CatalogPage query={parseQuery(await searchParams)} />;
}
