import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogGrid } from "@/components/blog-ui";
import { Breadcrumbs, ContactCta } from "@/components/catalog-ui";
import { ProductImage } from "@/components/product-image";
import { Icon } from "@/components/icon";
import { blogDate, readingMinutes } from "@/data/blog";
import { getBlogPosts, getBlogPost } from "@/lib/content";
import { isIndexable } from "@/config/site";
import { getSiteConfig } from "@/lib/content";
import { BreadcrumbData, StructuredData, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const siteConfig = (await getSiteConfig());
  const post = (await getBlogPost((await params).slug));
  if (!post) notFound();
  const metadata = (await pageMetadata(post.title, post.excerpt, `/blog/${post.slug}`));
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: `${post.publishedAt}T12:00:00+03:00`,
      authors: [siteConfig.name],
      ...(siteConfig.url
        ? {
            images: [
              {
                url: new URL(post.image.src, siteConfig.url).toString(),
                alt: post.image.alt,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const siteConfig = (await getSiteConfig());
  const post = (await getBlogPost((await params).slug));
  if (!post) notFound();
  const related = (await getBlogPosts()).filter((item) => item.slug !== post.slug);

  return (
    <div className="container">
      <Breadcrumbs
        items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />
      <article className="blog-article">
        <header className="blog-article-header">
          <span className="eyebrow">{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-article-meta">
            <span>{siteConfig.name}</span>
            <time dateTime={post.publishedAt}>
              {blogDate(post.publishedAt)}
            </time>
            <span>{readingMinutes(post)} dk okuma</span>
          </div>
        </header>
        <figure className="blog-article-image">
          <ProductImage
            src={post.image.src}
            alt={post.image.alt}
            priority
            sizes="(max-width: 1100px) 100vw, 1080px"
          />
          <figcaption className="image-label">Temsilî görsel</figcaption>
        </figure>
        <div className="blog-reading-layout">
          <nav className="blog-contents" aria-label="Yazı içindekiler">
            <h2>Bu yazıda</h2>
            <ol>
              {post.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
            <Link className="text-link" href="/blog">
              Tüm yazılar <Icon size={16} />
            </Link>
          </nav>
          <div className="blog-prose">
            <p className="blog-introduction">{post.introduction}</p>
            {post.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.tips && (
                  <ul>
                    {section.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                )}
                {section.source && (
                  <p className="blog-source">
                    Kaynak:{" "}
                    <a
                      href={section.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {section.source.label}
                      <span className="sr-only"> (yeni sekmede)</span>
                    </a>
                  </p>
                )}
              </section>
            ))}
          </div>
        </div>
      </article>
      <section className="blog-related" aria-labelledby="related-posts-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OKUMAYA DEVAM EDİN</span>
            <h2 id="related-posts-title">Diğer rehberler</h2>
          </div>
          <Link href="/blog" className="text-link">
            Tüm yazılar <Icon size={18} />
          </Link>
        </div>
        <BlogGrid posts={related} related />
      </section>
      <ContactCta />
      <BreadcrumbData
        items={[
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      {isIndexable && siteConfig.url && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: `${post.publishedAt}T12:00:00+03:00`,
            author: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            mainEntityOfPage: new URL(
              `/blog/${post.slug}`,
              siteConfig.url,
            ).toString(),
            image: new URL(post.image.src, siteConfig.url).toString(),
            inLanguage: "tr-TR",
          }}
        />
      )}
    </div>
  );
}
