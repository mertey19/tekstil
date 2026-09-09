import { categories, products } from "@/data/catalog";
import { blogPosts } from "@/data/blog";
import { siteConfig } from "@/config/site";
import { contentSchema, pageDefinitions, pageKeys } from "@/lib/cms-model";

export function initialContent() {
  return contentSchema.parse({
    version: 1,
    categories: categories.map((c) => ({ ...c, status: "published" })),
    products: products.map((p) => ({ ...p, status: "published" })),
    posts: blogPosts.map((p) => ({ ...p, id: p.slug, status: "published" })),
    settings: {
      name: siteConfig.name,
      fullName: siteConfig.fullName,
      subtitle: siteConfig.subtitle,
      whatsapp: siteConfig.whatsapp || "+905305482660",
      about: siteConfig.about,
      hero: {
        ...siteConfig.visuals.hero,
      },
      legal: {
        privacy: { approved: false, text: "" },
        disclosure: { approved: false, text: "" },
      },
    },
    pages: Object.fromEntries(
      pageKeys.map((key) => [
        key,
        {
          fields: Object.fromEntries(
            Object.entries(pageDefinitions[key].fields).map(
              ([field, definition]) => [field, definition[1]],
            ),
          ),
          image: "",
          imageAlt: "",
          sections: [],
        },
      ]),
    ),
  });
}
