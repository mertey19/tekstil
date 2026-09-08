import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { BlogGrid } from "@/components/blog-ui";
import { blogPosts } from "@/data/blog";
import { BreadcrumbData, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Blog | Mikrofiber Kullanım ve Bakım Rehberi",
  "Mikrofiber bezlerin yıkanması, cam ve ayna temizliği ve araç bakımına dair pratik kullanım rehberlerini okuyun.",
  "/blog",
);

export default function BlogPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Blog" }]} />
      <header className="blog-heading">
        <span className="eyebrow">MİKROFİBER DEPOSU BLOG</span>
        <h1>Daha iyi temizlik,<br /><em>doğru bilgilerle.</em></h1>
        <p>Bez seçiminden günlük bakıma, işinizi kolaylaştıran küçük ayrıntılar. Mikrofiber ürünler için hazırladığımız pratik rehberleri keşfedin.</p>
      </header>
      <section className="blog-list" aria-labelledby="blog-list-heading">
        <div className="blog-list-heading">
          <h2 id="blog-list-heading">Kullanım ve bakım rehberleri</h2>
          <span>{blogPosts.length} yazı</span>
        </div>
        <BlogGrid posts={blogPosts} />
      </section>
      <ContactCta />
      <BreadcrumbData items={[{ name: "Blog", path: "/blog" }]} />
    </div>
  );
}
