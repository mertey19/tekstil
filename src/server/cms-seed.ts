import { categories, products } from "@/data/catalog";
import { blogPosts } from "@/data/blog";
import { siteConfig } from "@/config/site";
import { contentSchema, pageDefinitions, pageKeys } from "@/lib/cms-model";
import { commerceProductDrafts } from "@/data/commerce-products";

export function initialContent() {
  return contentSchema.parse({
    version: 4,
    categories: categories.map((c) => ({ ...c, status: "published" })),
    products: [
      ...products.map((p) => ({ ...p, status: "published" as const })),
      ...structuredClone(commerceProductDrafts),
    ],
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
      shop: {
        enabled: false,
        shippingFeeCents: 0,
        freeShippingThresholdCents: 0,
        minimumOrderCents: 0,
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
