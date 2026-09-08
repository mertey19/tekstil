import Link from "next/link";
import { type Product } from "@/lib/catalog";
import { getAllCategories, getSiteConfig, getPageContent } from "@/lib/content";
import { CmsSections } from "./cms-sections";
import { Icon } from "./icon";
import { ProductImage } from "./product-image";

import { whatsappLink } from "@/lib/contact";
export async function ProductCard({
  product,
  eager = false,
}: {
  product: Product;
  eager?: boolean;
}) {
  const category = (await getAllCategories()).find((c) => c.id === product.categoryId)!;
  return (
    <article className="product-card">
      <Link
        href={`/urun/${product.slug}`}
        className="product-visual"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage src={product.images[0].src} alt="" eager={eager} />
        {product.isDemo && <span className="image-label">Temsilî ürün</span>}
      </Link>
      <div className="product-info">
        <span className="eyebrow">{category.shortName}</span>
        <h3>
          <Link href={`/urun/${product.slug}`}>{product.name}</Link>
        </h3>
        <p>{product.summary}</p>
        <Link
          className="text-link product-link"
          href={`/urun/${product.slug}`}
          aria-label={`${product.name} — Ürünü İncele`}
        >
          Ürünü İncele
          <Icon size={17} />
        </Link>
      </div>
    </article>
  );
}
export function ProductGrid({
  products,
  eagerFirst = false,
}: {
  products: Product[];
  eagerFirst?: boolean;
}) {
  return (
    <div className="product-grid">
      {products.map((p, index) => (
        <ProductCard key={p.id} product={p} eager={eagerFirst && index === 0} />
      ))}
    </div>
  );
}
export function EmptyState({
  title = "Aradığınız ürün bulunamadı.",
  description = "Farklı bir kelime deneyin veya filtreleri temizleyin.",
  href = "/urunler",
  label = "Filtreleri Temizle",
}: {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <Icon name="search" size={32} />
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href={href} className="button secondary">
        {label}
      </Link>
    </div>
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Gezinme yolu">
      <ol>
        <li>
          <Link href="/">Ana Sayfa</Link>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            <Icon name="chevron" size={13} />
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export async function ContactCta() {
  const siteConfig = (await getSiteConfig());
  const fields = (await getPageContent("cta")).fields;
  const whatsapp = whatsappLink(siteConfig.whatsapp);
  return (
    <>
      {" "}
      <CmsSections page="cta" />
      <section className="contact-cta">
        <div>
          <span className="eyebrow">{fields.eyebrow}</span>
          <h2 className="preserve-lines">{fields.title}</h2>
        </div>
        <div className="cta-buttons">
          <Link href="/teklif-al" className="button primary">
            Bilgi ve Teklif Al
            <Icon size={18} />
          </Link>
          {whatsapp && (
            <a
              className="text-link whatsapp-link"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp’tan Yazın
              <Icon size={16} />
            </a>
          )}
        </div>
      </section>
    </>
  );
}
