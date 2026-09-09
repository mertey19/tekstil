import { z } from "zod";
import { merchantSchema, socialSchema, supportSchema } from "./support-model";
z.config(z.locales.tr());

export const pageDefinitions = {
  home: {
    name: "Ana sayfa",
    path: "/",
    fields: {
      eyebrow: ["Üst etiket", "MİKROFİBER & TEKSTİL"],
      title: ["Ana başlık", "Temizlik için\naradığınız"],
      accent: ["Vurgulu başlık", "mikrofiber ürünler."],
      description: [
        "Açıklama",
        "Mikrofiber bez ve tekstil ürünlerini kullanım alanlarına göre inceleyin. Ürün bilgisi ve teklif için bizimle iletişime geçin.",
      ],
      footnote: ["Alt not", "Günlük temizlikten araç bakımına."],
      caption: ["Görsel başlığı", "Farklı yüzeyler."],
      captionAccent: ["Görsel vurgusu", "Doğru ürün seçimi."],
      categoryEyebrow: ["Kategori etiketi", "İHTİYACINIZA GÖRE KEŞFEDİN"],
      categoryTitle: ["Kategori başlığı", "Her alan için bir seçenek."],
      featuredEyebrow: ["Öne çıkanlar etiketi", "KATALOĞUMUZDAN"],
      featuredTitle: ["Öne çıkanlar başlığı", "Öne çıkan ürünler"],
      featuredDescription: [
        "Öne çıkanlar açıklaması",
        "Ürünleri yakından tanıyın,\nihtiyacınıza uygun seçeneği inceleyin.",
      ],
      stepsEyebrow: ["Adımlar etiketi", "ÜRÜNDEN İLETİŞİME"],
      stepsTitle: ["Adımlar başlığı", "Aradığınız ürüne\nüç kolay adımda."],
      step1Title: ["1. adım başlığı", "Ürünleri inceleyin"],
      step1Text: [
        "1. adım açıklaması",
        "Kullanım alanına göre ürün grubunu bulun.",
      ],
      step2Title: ["2. adım başlığı", "Ürününüzü seçin"],
      step2Text: [
        "2. adım açıklaması",
        "Ürün detaylarını ve mevcut bilgileri inceleyin.",
      ],
      step3Title: ["3. adım başlığı", "Bilgi veya teklif isteyin"],
      step3Text: [
        "3. adım açıklaması",
        "Mesajınızı hazırlayıp WhatsApp’tan iletin.",
      ],
      blogEyebrow: ["Blog etiketi", "BLOG · KULLANIM VE BAKIM"],
      blogTitle: ["Blog başlığı", "Temizliğin küçük detayları."],
    },
  },
  about: {
    name: "Hakkımızda",
    path: "/hakkimizda",
    fields: {
      eyebrow: ["Üst etiket", "MİKROFİBER DEPOSU"],
      closing: [
        "Ek açıklama",
        "Mikrofiber Deposu — Siliver Silen Temizlik Bezleri Dünyası adıyla mikrofiber temizlik bezleri ve tekstil ürünlerini tanıtıyoruz. İhtiyacınıza uygun ürün hakkında bilgi ve teklif almak için WhatsApp üzerinden bizimle iletişime geçebilirsiniz.",
      ],
    },
  },
  products: {
    name: "Ürünler sayfası",
    path: "/urunler",
    fields: {
      eyebrow: ["Üst etiket", "MİKROFİBER & TEKSTİL KATALOĞU"],
      title: ["Başlık", "Ürünlerimizi keşfedin."],
      description: [
        "Açıklama",
        "Camdan araca, mutfaktan günlük temizliğe. İhtiyacınıza uygun ürün grubunu inceleyin.",
      ],
    },
  },
  blog: {
    name: "Blog sayfası",
    path: "/blog",
    fields: {
      eyebrow: ["Üst etiket", "MİKROFİBER DEPOSU BLOG"],
      title: ["Başlık", "Daha iyi temizlik,"],
      accent: ["Vurgulu başlık", "doğru bilgilerle."],
      description: [
        "Açıklama",
        "Bez seçiminden günlük bakıma, işinizi kolaylaştıran küçük ayrıntılar. Mikrofiber ürünler için hazırladığımız pratik rehberleri keşfedin.",
      ],
      listTitle: ["Yazılar başlığı", "Kullanım ve bakım rehberleri"],
    },
  },
  contact: {
    name: "İletişim",
    path: "/iletisim",
    fields: {
      eyebrow: ["Üst etiket", "WHATSAPP İLE İLETİŞİM"],
      title: ["Başlık", "Bir mesajla başlayalım."],
      description: [
        "Açıklama",
        "Ürünlerle ilgili sorularınızı ve teklif taleplerinizi WhatsApp üzerinden paylaşın.",
      ],
      cardEyebrow: ["Teklif kartı etiketi", "ÜRÜN BİLGİSİ & TEKLİF"],
      cardTitle: [
        "Teklif kartı başlığı",
        "Aklınızdaki ürünü\nbizimle paylaşın.",
      ],
      cardDescription: [
        "Teklif kartı açıklaması",
        "İlgilendiğiniz ürünü seçin, sorularınızı ve varsa tahmini adedi ekleyin. WhatsApp mesajınız hazır olsun.",
      ],
    },
  },
  quote: {
    name: "Teklif sayfası",
    path: "/teklif-al",
    fields: {
      eyebrow: ["Üst etiket", "WHATSAPP İLE İLETİŞİM"],
      title: ["Başlık", "İhtiyacınızı WhatsApp’tan paylaşın."],
      description: [
        "Açıklama",
        "Ürün bilgisi ve teklif için mesajınızı hazırlayın. Gönderimi WhatsApp üzerinden tamamlayın.",
      ],
      asideTitle: ["Yan başlık", "Doğru ürünü bulmanın\nilk adımı."],
      asideText: [
        "Yan açıklama",
        "Ürününüzü seçin, sorularınızı yazın. İletişimimiz WhatsApp üzerinden devam etsin.",
      ],
    },
  },
  footer: {
    name: "Alt bilgi",
    path: "/",
    fields: {
      description: [
        "Firma açıklaması",
        "Mikrofiber bez ve tekstil ürünlerini\nkullanım alanlarına göre keşfedin.",
      ],
    },
  },
  cta: {
    name: "İletişim bandı",
    path: "/",
    fields: {
      eyebrow: ["Üst etiket", "Birlikte doğru ürünü bulalım"],
      title: ["Başlık", "İhtiyacınıza uygun ürün\nhakkında bilgi alın."],
    },
  },
} as const;
export type PageKey = keyof typeof pageDefinitions;
export const pageKeys = Object.keys(pageDefinitions) as PageKey[];
export const specNames = [
  "Ürün kodu",
  "Ölçüler",
  "Gramaj",
  "Malzeme bileşimi",
  "Renk seçenekleri",
  "Paket içeriği",
  "Bakım bilgileri",
] as const;
const short = z.string().trim().min(1, "Bu alan zorunludur.").max(240);
const prose = z.string().trim().min(1, "Bu alan zorunludur.").max(20_000);
const slug = z
  .string()
  .min(1)
  .max(140)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Adres yalnızca küçük harf, rakam ve tire içerebilir.",
  );
export const imagePath = z
  .string()
  .regex(
    /^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:webp|png|jpg|jpeg)$/,
    "Kütüphaneden bir görsel seçin.",
  );
const image = z.object({ src: imagePath, alt: short });
const status = z.enum(["published", "draft"]);
const link = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v ||
      /^\/(?!\/)[a-zA-Z0-9/?&=#%._~-]*$/.test(v) ||
      (/^https:\/\//.test(v) && URL.canParse(v)),
    "Geçerli bir site yolu veya HTTPS bağlantısı girin.",
  );
export const blockSchema = z
  .object({
    id: slug,
    title: short,
    text: prose,
    image: imagePath.or(z.literal("")),
    imageAlt: z.string().max(240),
    buttonLabel: z.string().max(80),
    buttonHref: link,
    status,
  })
  .refine((v) => !v.image || !!v.imageAlt.trim(), {
    message: "Görsel açıklaması gerekli.",
    path: ["imageAlt"],
  })
  .refine((v) => Boolean(v.buttonLabel) === Boolean(v.buttonHref), {
    message: "Buton metni ve bağlantısını birlikte doldurun.",
    path: ["buttonHref"],
  });
export const categorySchema = z.object({
  id: slug,
  slug,
  name: short,
  shortName: short,
  description: prose,
  image: imagePath,
  useCase: short,
  status,
});
export const productSchema = z.object({
  id: slug,
  slug,
  name: short,
  categoryId: slug,
  summary: z.string().trim().min(1).max(600),
  description: prose,
  images: z.array(image).min(1, "En az bir ürün görseli ekleyin.").max(8),
  useCases: z.array(short).min(1, "En az bir kullanım alanı girin.").max(30),
  specifications: z.partialRecord(z.enum(specNames), short).optional(),
  featured: z.boolean(),
  isDemo: z.boolean(),
  isPublished: z.boolean(),
  status,
});
export const postSchema = z.object({
  id: slug,
  slug,
  title: short,
  category: short,
  excerpt: z.string().trim().min(1).max(1000),
  publishedAt: z.iso.date(),
  image,
  introduction: prose,
  status,
  sections: z
    .array(
      z.object({
        id: slug,
        title: short,
        paragraphs: z.array(prose).min(1).max(30),
        tips: z.array(short).max(30).optional(),
        source: z
          .object({
            label: short,
            url: z
              .url()
              .refine(
                (s) => s.startsWith("https://"),
                "HTTPS bağlantısı kullanın.",
              ),
          })
          .optional(),
      }),
    )
    .min(1, "Yazıya en az bir bölüm ekleyin.")
    .max(40),
});
const legal = z.object({ approved: z.boolean(), text: z.string().max(80_000) });
export const settingsSchema = z.object({
  name: short,
  fullName: short,
  subtitle: short,
  whatsapp: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, "Ülke koduyla girin. Örnek: +905305482660"),
  about: z.object({
    title: short,
    summary: prose,
    history: prose,
    description: prose,
  }),
  hero: z.object({ src: imagePath, alt: short, isDemo: z.boolean() }),
  legal: z.object({ privacy: legal, disclosure: legal }),
  social: socialSchema,
  merchant: merchantSchema,
  support: supportSchema,
});
const pageSchema = z.object({
  fields: z.record(z.string().max(80), z.string().max(4000)),
  image: imagePath.or(z.literal("")),
  imageAlt: z.string().max(240),
  sections: z.array(blockSchema).max(40),
});
export const contentSchema = z
  .object({
    version: z.literal(1),
    categories: z.array(categorySchema).max(200),
    products: z.array(productSchema).max(2000),
    posts: z.array(postSchema).max(1000),
    settings: settingsSchema,
    pages: z.record(z.enum(pageKeys), pageSchema),
  })
  .superRefine((v, ctx) => {
    for (const [key, list] of [
      ["products", v.products],
      ["categories", v.categories],
      ["posts", v.posts],
    ] as const) {
      for (const field of ["id", "slug"] as const)
        if (new Set(list.map((x) => x[field])).size !== list.length)
          ctx.addIssue({
            code: "custom",
            path: [key],
            message:
              "Aynı adres veya kimlik birden fazla kayıtta kullanılamaz.",
          });
    }
    for (const p of v.products)
      if (!v.categories.some((c) => c.id === p.categoryId))
        ctx.addIssue({
          code: "custom",
          path: ["products"],
          message:
            "Bu kategoride ürünler var. Önce ürünleri başka kategoriye taşıyın veya kaldırın.",
        });
    for (const key of pageKeys) {
      for (const field of Object.keys(pageDefinitions[key].fields))
        if (!v.pages[key].fields[field]?.trim())
          ctx.addIssue({
            code: "custom",
            path: ["pages", key, "fields", field],
            message: "Sayfa metni boş bırakılamaz.",
          });
      if (v.pages[key].image && !v.pages[key].imageAlt.trim())
        ctx.addIssue({
          code: "custom",
          path: ["pages", key, "imageAlt"],
          message: "Görsel açıklaması gerekli.",
        });
      if (
        new Set(v.pages[key].sections.map((s) => s.id)).size !==
        v.pages[key].sections.length
      )
        ctx.addIssue({
          code: "custom",
          path: ["pages", key],
          message: "Bölüm kimlikleri benzersiz olmalı.",
        });
    }
    for (const post of v.posts)
      if (new Set(post.sections.map((s) => s.id)).size !== post.sections.length)
        ctx.addIssue({
          code: "custom",
          path: ["posts"],
          message: "Yazı bölümlerinin kimlikleri benzersiz olmalı.",
        });
    for (const document of Object.values(v.settings.legal))
      if (document.approved && !document.text.trim())
        ctx.addIssue({
          code: "custom",
          path: ["settings", "legal"],
          message: "Yayımlanacak metin boş bırakılamaz.",
        });
  });
export type CmsContent = z.infer<typeof contentSchema>;
export type CmsProduct = z.infer<typeof productSchema>;
export type CmsCategory = z.infer<typeof categorySchema>;
export type CmsPost = z.infer<typeof postSchema>;
export type CmsBlock = z.infer<typeof blockSchema>;
export type CmsSnapshot = {
  content: CmsContent;
  revision: number;
  updatedAt: string;
};
export type MediaItem = {
  src: string;
  name: string;
  width: number;
  height: number;
  size: number;
  createdAt: string;
};
export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
