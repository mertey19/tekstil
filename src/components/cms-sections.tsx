import Link from "next/link";
import { getPageContent } from "@/lib/content";
import type { PageKey } from "@/lib/cms-model";
import { ProductImage } from "./product-image";

export async function CmsSections({ page }: { page: PageKey }) {
  const content = (await getPageContent(page));
  return (
    <>
      {content.image && (
        <div className="cms-page-image">
          <ProductImage
            src={content.image}
            alt={content.imageAlt}
            sizes="(max-width: 900px) 100vw, 1100px"
          />
        </div>
      )}
      {content.sections
        .filter((s) => s.status === "published")
        .map((section) => (
          <section
            className={`cms-section ${section.image ? "with-image" : ""}`}
            key={section.id}
          >
            {section.image && (
              <div className="cms-section-image">
                <ProductImage
                  src={section.image}
                  alt={section.imageAlt}
                  sizes="(max-width: 767px) 100vw, 45vw"
                />
              </div>
            )}
            <div>
              <h2>{section.title}</h2>
              <p className="preserve-lines">{section.text}</p>
              {section.buttonHref && (
                <Link className="button secondary" href={section.buttonHref}>
                  {section.buttonLabel}
                </Link>
              )}
            </div>
          </section>
        ))}
    </>
  );
}
