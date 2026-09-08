import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/content";
import { categories } from "@/data/catalog";
import { siteConfig, isIndexable } from "@/config/site";
import { Breadcrumbs, ProductGrid } from "@/components/catalog-ui";
import { ProductGallery } from "@/components/product-gallery";
import { Icon } from "@/components/icon";
import { whatsappLink } from "@/lib/contact";
import { BreadcrumbData, pageMetadata, StructuredData } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return {
    ...pageMetadata(
      product.name,
      product.summary,
      `/urun/${product.slug}`,
      product.isDemo,
    ),
    ...(siteConfig.url && !product.isDemo
      ? {
          openGraph: {
            title: product.name,
            description: product.summary,
            url: new URL(`/urun/${product.slug}`, siteConfig.url).toString(),
            images: product.images.map((i) =>
              new URL(i.src, siteConfig.url!).toString(),
            ),
            locale: "tr_TR",
          },
        }
      : {}),
  };
}
export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = categories.find((c) => c.id === product.categoryId)!;
  const url = siteConfig.url
    ? new URL(`/urun/${product.slug}`, siteConfig.url).toString()
    : null;
  const whatsapp = whatsappLink(siteConfig.whatsapp, {
    name: product.name,
    url: url || undefined,
    isDemo: product.isDemo,
  });
  const similar = getProducts()
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId ||
          p.useCases.some((u) => product.useCases.includes(u))),
    )
    .slice(0, 4);
  const specs = Object.entries(product.specifications ?? {});
  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: "Ürünler", href: "/urunler" },
          { label: category.shortName, href: `/kategori/${category.slug}` },
          { label: product.name },
        ]}
      />
      <div className="product-detail">
        <ProductGallery images={product.images} demo={product.isDemo} />
        <div className="product-detail-copy">
          <Link className="eyebrow" href={`/kategori/${category.slug}`}>
            {category.name}
          </Link>
          <h1>{product.name}</h1>
          <p className="detail-summary">{product.summary}</p>
          <div className="detail-use-cases">
            <h2>Kullanım alanları</h2>
            <div className="tags">
              {product.useCases.map((u) => (
                <Link
                  key={u}
                  href={`/urunler?kullanim=${encodeURIComponent(u)}`}
                >
                  {u}
                </Link>
              ))}
            </div>
          </div>
          <div className="detail-actions">
            <Link
              href={`/teklif-al?urun=${encodeURIComponent(product.id)}`}
              className="button primary"
            >
              Bu Ürün İçin Teklif Al
              <Icon size={18} />
            </Link>
            {whatsapp && (
              <a
                href={whatsapp}
                className="button whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp’tan Bilgi Al
                <Icon size={18} />
              </a>
            )}
          </div>
          <p className="detail-footnote">
            İlgilendiğiniz ürün teklif formuna otomatik eklenir.
          </p>
        </div>
      </div>
      <div className="product-description">
        <div>
          <span className="eyebrow">ÜRÜNÜ YAKINDAN TANIYIN</span>
          <h2>Ürün hakkında</h2>
          <p>{product.description}</p>
        </div>
        {specs.length > 0 && (
          <div>
            <h2>Teknik bilgiler</h2>
            <dl className="spec-list">
              {specs.map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
      {similar.length > 0 && (
        <section className="section related-products">
          <div className="section-heading">
            <div>
              <span className="eyebrow">KEŞFETMEYE DEVAM EDİN</span>
              <h2>İlgili ürünler</h2>
            </div>
            <Link className="text-link" href={`/kategori/${category.slug}`}>
              Kategoriyi İncele
              <Icon size={16} />
            </Link>
          </div>
          <ProductGrid products={similar} />
        </section>
      )}
      <BreadcrumbData
        items={[
          { name: "Ürünler", path: "/urunler" },
          { name: category.name, path: `/kategori/${category.slug}` },
          { name: product.name, path: `/urun/${product.slug}` },
        ]}
      />
      {isIndexable && !product.isDemo && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            category: category.name,
            image: product.images.map((i) =>
              new URL(i.src, siteConfig.url!).toString(),
            ),
            url,
          }}
        />
      )}
    </div>
  );
}
