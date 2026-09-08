import Link from "next/link";
import { type BlogPost, blogDate, readingMinutes } from "@/data/blog";
import { Icon } from "./icon";
import { ProductImage } from "./product-image";

export function BlogGrid({ posts, related = false }: { posts: BlogPost[]; related?: boolean }) {
  return (
    <div className={`blog-grid${related ? " blog-grid-related" : ""}`}>
      {posts.map((post) => (
        <article className="blog-card" key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="blog-card-image" tabIndex={-1} aria-hidden="true">
            <ProductImage src={post.image.src} alt="" sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" />
            <span className="image-label">Temsilî görsel</span>
          </Link>
          <div className="blog-card-copy">
            <div className="blog-card-meta">
              <span className="eyebrow">{post.category}</span>
              <span>{readingMinutes(post)} dk okuma</span>
            </div>
            <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
            <p>{post.excerpt}</p>
            <div className="blog-card-bottom">
              <time dateTime={post.publishedAt}>{blogDate(post.publishedAt)}</time>
              <Link className="text-link" href={`/blog/${post.slug}`} aria-label={`${post.title} — Yazıyı oku`}>
                Yazıyı oku <Icon size={17} />
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
