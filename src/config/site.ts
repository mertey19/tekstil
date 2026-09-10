const optional = (value: string | undefined) => value?.trim() || null;
export const siteConfig = {
  fullName: "Mikrofiber deposu siliver silen temizlik bezleri dünyası",
  name: "Mikrofiber Deposu",
  subtitle: "Siliver Silen Temizlik Bezleri Dünyası",
  about: {
    title: "1992’den bugüne, tecrübeyle ve güvenle.",
    summary:
      "Temelleri 1992 yılında Hüseyin Bayhan tarafından atılan firmamız, yılların kazandırdığı tecrübeyle müşteri desteğini ve memnuniyetini ön planda tutarak hizmet sektöründe gelişmeye ve güçlenmeye devam ediyor.",
    history:
      "Firmamızın temelleri 1992 yılında Hüseyin Bayhan tarafından atıldı.",
    description:
      "Yılların kazandırdığı tecrübeyle müşteri desteğini ve memnuniyetini çalışmalarımızın merkezinde tutuyoruz. Hizmet sektöründe kendimizi geliştiriyor, yolumuza güçlenerek devam ediyoruz.",
  },
  whatsapp:
    process.env.SITE_WHATSAPP === undefined
      ? "+905305482660"
      : optional(process.env.SITE_WHATSAPP),
  url: optional(process.env.SITE_URL),
  visuals: {
    hero: {
      src: "/images/hero.webp",
      alt: "Siliver Silen Denizli Mikrofiber Deposu tanıtım afişi: renkli mikrofiber temizlik bezleri, toptan ve perakende",
      isDemo: false,
    },
  },
  demo: process.env.SITE_MODE !== "live",
  preview: process.env.VERCEL_ENV === "preview" || process.env.SITE_PREVIEW !== "false",
  features: {
    wholesale: false,
    manufacturing: false,
    dealership: false,
    export: false,
    shipping: false,
  },
  legal: {
    privacy: { approved: false, text: null as string | null },
    disclosure: { approved: false, text: null as string | null },
  },
};
export const isIndexable =
  !siteConfig.demo && !siteConfig.preview && !!siteConfig.url;
