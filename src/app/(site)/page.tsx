import Link from "next/link";
import { getCategories, getProducts } from "@/lib/content";
import { getSiteConfig } from "@/lib/content";
import { ProductImage } from "@/components/product-image";
import { ContactCta, ProductGrid } from "@/components/catalog-ui";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
import { BlogGrid } from "@/components/blog-ui";
import { getBlogPosts, getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
export async function generateMetadata() {
  return (await pageMetadata(
    "Mikrofiber Deposu | Temizlik Bezleri",
    "Mikrofiber bez ve tekstil ürünlerini kullanım alanlarına göre inceleyin. Ürün bilgisi ve teklif için bizimle iletişime geçin.",
    "/",
  ));
}
export default async function Home() {
  const siteConfig = (await getSiteConfig());
  const fields = (await getPageContent("home")).fields;
  const blogPosts = (await getBlogPosts());
  const categories = (await getCategories());
  const featured = (await getProducts())
    .filter((p) => p.featured)
    .slice(0, 4);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow">
            <span />
            {fields.eyebrow}
          </span>
          <h1>
            <span className="preserve-lines">{fields.title}</span>
            <br />
            <em>{fields.accent}</em>
          </h1>
          <p>{fields.description}</p>
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
            {fields.footnote}
          </div>
        </div>
        {(siteConfig.demo || !siteConfig.visuals.hero.isDemo) && (
          <div className="hero-art">
            <div className="hero-image">
              <ProductImage
                src={siteConfig.visuals.hero.src}
                alt={siteConfig.visuals.hero.alt}
                priority
                sizes="(max-width: 767px) 100vw, 55vw"
              />
            </div>
            <div className="hero-caption">
              <span>
                {fields.caption}
                <br />
                <strong>{fields.captionAccent}</strong>
              </span>
              <span className="round-arrow">
                <Icon size={22} />
              </span>
            </div>
            {siteConfig.visuals.hero.isDemo && (
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
              <span className="eyebrow">{fields.categoryEyebrow}</span>
              <h2>{fields.categoryTitle}</h2>
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
                <span className="eyebrow">{fields.featuredEyebrow}</span>
                <h2>{fields.featuredTitle}</h2>
              </div>
              <p className="section-intro preserve-lines">
                {fields.featuredDescription}
              </p>
            </div>
            <ProductGrid products={featured} />
          </div>
        </section>
      )}
      <section className="container section steps-section">
        <div>
          <span className="eyebrow">{fields.stepsEyebrow}</span>
          <h2 className="preserve-lines">{fields.stepsTitle}</h2>
        </div>
        <ol className="steps">
          {[1, 2, 3].map((n) => (
            <li key={n}>
              <span>0{n}</span>
              <h3>{fields[`step${n}Title`]}</h3>
              <p>{fields[`step${n}Text`]}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="container about-strip">
        <span className="eyebrow">{siteConfig.name}</span>
        <div>
          <h2>{siteConfig.about.title}</h2>
          <p>{siteConfig.about.summary}</p>
          <Link className="text-link" href="/hakkimizda">
            Bizi Tanıyın
            <Icon size={17} />
          </Link>
        </div>
      </section>
      <section
        className="container section home-blog"
        aria-labelledby="home-blog-title"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">{fields.blogEyebrow}</span>
            <h2 id="home-blog-title">{fields.blogTitle}</h2>
          </div>
          <Link href="/blog" className="text-link">
            Tüm yazılar <Icon size={18} />
          </Link>
        </div>
        <BlogGrid posts={blogPosts.slice(0, 3)} />
      </section>
      <div className="container">
        <CmsSections page="home" />
        <ContactCta />
      </div>
    </>
  );
}
