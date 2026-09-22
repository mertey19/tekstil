import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { BlogGrid } from "@/components/blog-ui";
import { getBlogPosts, getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
import { BreadcrumbData, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { districtBlogSlugs } from "@/data/district-blog";

export async function generateMetadata() {
  return await pageMetadata(
    "Denizli Temizlik Rehberi | Mikrofiber Bez Blogu",
    "Denizli’nin 19 ilçesi için mikrofiber bez seçimi; cam, mutfak, araç, kurulama ve günlük temizlik rehberlerini okuyun.",
    "/blog",
  );
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts(),
    fields = (await getPageContent("blog")).fields;
  const districtSlugs = new Set(districtBlogSlugs);
  const districtPosts = blogPosts.filter((post) =>
    districtSlugs.has(post.slug),
  );
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <header className="blog-heading">
        <span className="eyebrow">{fields.eyebrow}</span>
        <h1>
          {fields.title}
          <br />
          <em>{fields.accent}</em>
        </h1>
        <p>{fields.description}</p>
      </header>
      {districtPosts.length > 0 && (
        <section
          className="district-guides"
          aria-labelledby="district-guides-title"
        >
          <div>
            <span className="eyebrow">DENİZLİ’NİN 19 İLÇESİ</span>
            <h2 id="district-guides-title">
              İlçenize göre temizlik rehberini seçin.
            </h2>
            <p>
              Ev, iş yeri, cam, mutfak, araç ve kurulama ihtiyaçları için
              ilçelere özel hazırlanan rehberlere göz atın.
            </p>
          </div>
          <nav aria-label="Denizli ilçe rehberleri">
            {districtPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                {post.title.split(/[’']/)[0]}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </section>
      )}
      <section className="blog-list" aria-labelledby="blog-list-heading">
        <div className="blog-list-heading">
          <h2 id="blog-list-heading">{fields.listTitle}</h2>
          <span>{blogPosts.length} yazı</span>
        </div>
        <BlogGrid posts={blogPosts} />
      </section>
      <CmsSections page="blog" />
      <ContactCta />
      <BreadcrumbData items={[{ name: "Blog", path: "/blog" }]} />
    </div>
  );
}
