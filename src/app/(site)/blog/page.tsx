import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { BlogGrid } from "@/components/blog-ui";
import { getBlogPosts, getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
import { BreadcrumbData, pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return (await pageMetadata(
    "Blog | Mikrofiber Kullanım ve Bakım Rehberi",
    "Mikrofiber bezlerin yıkanması, cam ve ayna temizliği ve araç bakımına dair pratik kullanım rehberlerini okuyun.",
    "/blog",
  ));
}

export default async function BlogPage() {
  const blogPosts = (await getBlogPosts()),
    fields = (await getPageContent("blog")).fields;
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
