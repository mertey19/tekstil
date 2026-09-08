import { notFound } from "next/navigation";
import { getCategory } from "@/lib/content";
import {
  CatalogPage,
  parseQuery,
  type SearchParams,
} from "@/components/catalog-page";
import { pageMetadata } from "@/lib/seo";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};
export async function generateMetadata({ params, searchParams }: Props) {
  const category = (await getCategory((await params).slug));
  if (!category) notFound();
  return (await pageMetadata(
    category.name,
    category.description,
    `/kategori/${category.slug}`,
    Object.values(await searchParams).some(Boolean),
  ));
}
export default async function CategoryPage({ params, searchParams }: Props) {
  const category = (await getCategory((await params).slug));
  if (!category) notFound();
  return (
    <CatalogPage category={category} query={parseQuery(await searchParams)} />
  );
}
