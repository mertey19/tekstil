import {
  contentSchema,
  settingsSchema,
  type CmsSnapshot,
  type CmsContent,
  type MediaItem,
} from "@/lib/cms-model";
import { initialContent } from "./cms-seed";
import { districtBlogPosts } from "@/data/district-blog";
import { commerceProductDrafts } from "@/data/commerce-products";
import { disclosureDraft, privacyDraft } from "@/data/legal-defaults";
import { defaultSupport } from "@/data/support";

import { database } from "./cms-database";
export { database, dataDirectory } from "./cms-database";

export async function readContent(): Promise<CmsSnapshot> {
  const row = (await database()
    .prepare("SELECT body, revision, updated_at FROM content WHERE id=1")
    .get())!;
  const content = JSON.parse(String(row.body)) as CmsContent;
  const versioned = content as unknown as { version: number };
  if (versioned.version === 1) {
    const savedSlugs = new Set(content.posts.map((post) => post.slug));
    content.posts.unshift(
      ...districtBlogPosts
        .filter((post) => !savedSlugs.has(post.slug))
        .map((post) => ({
          ...structuredClone(post),
          id: post.slug,
          status: "published" as const,
        })),
    );
    versioned.version = 2;
  }
  if (versioned.version === 2) {
    for (const product of content.products) {
      Object.assign(product, {
        sku: "",
        priceCents: 0,
        compareAtCents: null,
        stock: 0,
        trackStock: true,
        salesEnabled: false,
        vatRate: 20,
        weightGrams: 0,
      });
    }
    Object.assign(content.settings, {
      shop: {
        enabled: false,
        shippingFeeCents: 0,
        freeShippingThresholdCents: 0,
        minimumOrderCents: 0,
      },
    });
    versioned.version = 3;
  }
  if (versioned.version === 3) {
    const ids = new Set(content.products.map((product) => product.id));
    content.products.push(
      ...structuredClone(commerceProductDrafts).filter(
        (product) => !ids.has(product.id),
      ),
    );
    versioned.version = 4;
  }
  if (versioned.version === 4) {
    content.settings.support = structuredClone(defaultSupport);
    if (!content.settings.legal.privacy.text.trim())
      content.settings.legal.privacy.text = privacyDraft;
    if (!content.settings.legal.disclosure.text.trim())
      content.settings.legal.disclosure.text = disclosureDraft;
    versioned.version = 5;
  }
  // Defaults keep existing installations compatible without rewriting saved content.
  content.settings = settingsSchema.parse(content.settings);
  return {
    content,
    revision: Number(row.revision),
    updatedAt: String(row.updated_at),
  };
}
export class CmsError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function saveContent(
  input: unknown,
  revision: number,
): Promise<CmsSnapshot> {
  const result = contentSchema.safeParse(input);
  if (!result.success)
    throw new CmsError(
      result.error.issues
        .map((i) => `${i.path.join(" / ")}: ${i.message}`)
        .slice(0, 4)
        .join("\n"),
    );
  const content = result.data;
  content.products.forEach((product) => {
    product.isPublished = product.status === "published" && !product.isDemo;
  });
  // Only assets already in this installation may be referenced by content.
  const paths = new Set<string>();
  const walk = (value: unknown) => {
    if (typeof value === "string" && value.startsWith("/images/"))
      paths.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object")
      Object.values(value).forEach(walk);
  };
  const bundled = new Set<string>();
  walk(initialContent());
  paths.forEach((src) => bundled.add(src));
  paths.clear();
  walk(content);
  const uploaded = new Set((await listMedia()).map((item) => item.src));
  for (const src of paths) {
    const found = src.startsWith("/images/uploads/")
      ? uploaded.has(src)
      : bundled.has(src);
    if (!found)
      throw new CmsError(
        "Seçilen görsel bulunamadı. Görseli yeniden yükleyin veya kütüphaneden seçin.",
      );
  }
  const updatedAt = new Date().toISOString();
  const saved = await database()
    .prepare(
      "UPDATE content SET body=?, revision=revision+1, updated_at=? WHERE id=1 AND revision=?",
    )
    .run(JSON.stringify(content), updatedAt, revision);
  if (!saved.changes)
    throw new CmsError(
      "İçerik başka bir sekmede değişti. Çalışmanızı kopyalayın, ardından güncel içeriği yükleyip tekrar kaydedin.",
      409,
    );
  return { content, revision: revision + 1, updatedAt };
}
export async function listMedia(): Promise<MediaItem[]> {
  return (
    await database()
      .prepare(
        'SELECT src, name, width, height, size, created_at AS "createdAt" FROM media ORDER BY created_at DESC',
      )
      .all()
  ).map((row) => ({
    src: String(row.src),
    name: String(row.name),
    width: Number(row.width),
    height: Number(row.height),
    size: Number(row.size),
    createdAt: String(row.createdAt),
  }));
}
