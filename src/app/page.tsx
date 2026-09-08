import Link from "next/link";
import { getCategories, getProducts } from "@/lib/content";
import { siteConfig } from "@/config/site";
import { ProductImage } from "@/components/product-image";
import { ContactCta, ProductGrid } from "@/components/catalog-ui";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
import { BlogGrid } from "@/components/blog-ui";
import { blogPosts } from "@/data/blog";
export const metadata = pageMetadata(
  "Mikrofiber Deposu | Temizlik Bezleri",
  "Mikrofiber bez ve tekstil ürünlerini kullanım alanlarına göre inceleyin. Ürün bilgisi ve teklif için bizimle iletişime geçin.",
  "/",
);
export default function Home() {
  const categories = getCategories();
  const featured = getProducts()
    .filter((p) => p.featured)
    .slice(0, 4);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span />
            MİKROFİBER & TEKSTİL
          </span>
          <h1>
            Temizlik için <br />
            aradığınız <br />
            <em>mikrofiber ürünler.</em>
          </h1>
          <p>
            Mikrofiber bez ve tekstil ürünlerini kullanım alanlarına göre
            inceleyin. Ürün bilgisi ve teklif için bizimle iletişime geçin.
          </p>
          <div className="button-row">
            <Link href="/urunler" className="button primary">
              Ürünleri İncele
              <Icon size={18} />
            </Link>
            <Link href="/teklif-al" className="button secondary">
              Teklif Al
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="line" />
            Günlük temizlikten araç bakımına.
          </div>
        </div>
        {(siteConfig.demo || !siteConfig.visuals.hero.isDemo) && (
          <div className="hero-art">
            <div className="hero-image">
              <ProductImage
                src={siteConfig.visuals.hero.src}
                alt="Mavi, açık yeşil ve beyaz katlanmış mikrofiber bezlerden oluşan temsilî ürün kompozisyonu"
                priority
                sizes="(max-width: 767px) 100vw, 55vw"
              />
            </div>
            <div className="hero-caption">
              <span>
                Farklı yüzeyler.
                <br />
                <strong>Doğru ürün seçimi.</strong>
              </span>
              <span className="round-arrow">
                <Icon size={22} />
              </span>
            </div>
            {siteConfig.demo && (
              <span className="hero-image-note">Temsilî görsel</span>
            )}
          </div>
        )}
      </section>
      <div className="category-ribbon">
        <div className="container">
          <span>KULLANIM ALANLARI</span>
          {categories.slice(0, 4).map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`}>
              {c.useCase}
              <Icon name="chevron" size={14} />
            </Link>
          ))}
        </div>
      </div>
      {categories.length > 0 && (
        <section className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">İHTİYACINIZA GÖRE KEŞFEDİN</span>
              <h2>Her alan için bir seçenek.</h2>
            </div>
            <Link className="text-link" href="/urunler">
              Tüm Ürünler
              <Icon size={18} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((c, i) => (
              <Link
                className="category-card"
                href={`/kategori/${c.slug}`}
                key={c.id}
              >
                <div className="category-visual">
                  <ProductImage
                    src={c.image}
                    alt={`${c.name} için temsilî bez görseli`}
                    sizes="(max-width: 600px) 50vw, 20vw"
                  />
                  <span className="category-number">0{i + 1}</span>
                </div>
                <h3>
                  {c.shortName}
                  <Icon size={17} />
                </h3>
                <p>{c.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="container section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KATALOĞUMUZDAN</span>
                <h2>Öne çıkan ürünler</h2>
              </div>
              <p className="section-intro">
                Ürünleri yakından tanıyın,
                <br />
                ihtiyacınıza uygun seçeneği inceleyin.
              </p>
            </div>
            <ProductGrid products={featured} />
          </div>
        </section>
      )}
      <section className="container section steps-section">
        <div>
          <span className="eyebrow">ÜRÜNDEN İLETİŞİME</span>
          <h2>
            Aradığınız ürüne <br />
            üç kolay adımda.
          </h2>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <h3>Ürünleri inceleyin</h3>
            <p>Kullanım alanına göre ürün grubunu bulun.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Ürününüzü seçin</h3>
            <p>Ürün detaylarını ve mevcut bilgileri inceleyin.</p>
          </li>
          <li>
            <span>03</span>
            <h3>Bilgi veya teklif isteyin</h3>
            <p>Mesajınızı hazırlayıp WhatsApp’tan iletin.</p>
          </li>
        </ol>
      </section>
      <section className="container about-strip">
        <span className="eyebrow">MİKROFİBER DEPOSU</span>
        <div>
          <h2>{siteConfig.about.title}</h2>
          <p>{siteConfig.about.summary}</p>
          <Link className="text-link" href="/hakkimizda">
            Bizi Tanıyın
            <Icon size={17} />
          </Link>
        </div>
      </section>
      <section className="container section home-blog" aria-labelledby="home-blog-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BLOG · KULLANIM VE BAKIM</span>
            <h2 id="home-blog-title">Temizliğin küçük detayları.</h2>
          </div>
          <Link href="/blog" className="text-link">Tüm yazılar <Icon size={18} /></Link>
        </div>
        <BlogGrid posts={blogPosts.slice(0, 3)} />
      </section>
      <div className="container">
        <ContactCta />
      </div>
    </>
  );
}
