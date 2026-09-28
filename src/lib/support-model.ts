import { z } from "zod";
import { defaultSupport, supportKeys } from "@/data/support";

const text = z.string().trim().min(1, "Bu alan zorunludur.");
const supportPageSchema = z.object({
  title: text.max(240),
  intro: text.max(2000),
  sections: z
    .array(
      z.object({
        id: text.max(100).regex(/^[a-z0-9-]+$/),
        title: text.max(240),
        text: text.max(20000),
      }),
    )
    .min(1, "En az bir bölüm ekleyin.")
    .max(40)
    .refine(
      (sections) => new Set(sections.map((s) => s.id)).size === sections.length,
      "Bölüm kimlikleri benzersiz olmalı.",
    ),
});
export const supportSchema = z
  .record(z.enum(supportKeys), supportPageSchema)
  .default(() => structuredClone(defaultSupport));

const socialUrl = (domain: string) =>
  z
    .string()
    .trim()
    .max(2000)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          !url.username &&
          !url.password &&
          !url.port &&
          (url.hostname === domain || url.hostname === `www.${domain}`)
        );
      } catch {
        return false;
      }
    }, `https://${domain}/ ile başlayan hesap bağlantısını girin.`);
export const socialSchema = z
  .object({
    facebook: socialUrl("facebook.com"),
    instagram: socialUrl("instagram.com"),
    linkedin: socialUrl("linkedin.com"),
  })
  .default({ facebook: "", instagram: "", linkedin: "" });

const optional = z.string().trim().max(500);
const mapCoord = (limit: number, fallback: string) =>
  z
    .string()
    .trim()
    .max(24)
    .refine((value) => {
      if (!value) return true;
      const n = Number(value);
      return Number.isFinite(n) && Math.abs(n) <= limit;
    }, "Geçerli bir koordinat girin.")
    .default(fallback);
const merchantDefaults = {
  type: "company" as const,
  legalName: "",
  tradeName: "",
  address: "",
  email: "",
  kepAddress: "",
  phone: "",
  taxOffice: "",
  taxNumber: "",
  mersisNumber: "",
  returnAddress: "",
  returnCarrier: "",
  mapLatitude: "37.7841269",
  mapLongitude: "29.0876543",
  mapLabel: "Topraklık Mahallesi, Pamukkale / Denizli",
};
export const merchantSchema = z
  .object({
    type: z.enum(["company", "soleProprietor"]).default("company"),
    legalName: optional.default(""),
    tradeName: optional.default(""),
    address: z.string().trim().max(2000).default(""),
    email: z.union([z.literal(""), z.email("Geçerli bir e-posta adresi girin.")]).default(""),
    kepAddress: z.union([z.literal(""), z.email("Geçerli bir KEP adresi girin.")]).default(""),
    phone: z
      .string()
      .trim()
      .refine((value) => !value || /^\+[1-9]\d{7,14}$/.test(value), "Telefonu ülke koduyla girin.")
      .default(""),
    taxOffice: optional.default(""),
    taxNumber: optional.default(""),
    mersisNumber: optional.default(""),
    returnAddress: z.string().trim().max(2000).default(""),
    returnCarrier: optional.default(""),
    mapLatitude: mapCoord(90, merchantDefaults.mapLatitude),
    mapLongitude: mapCoord(180, merchantDefaults.mapLongitude),
    mapLabel: z.string().trim().max(240).default(merchantDefaults.mapLabel),
  })
  .refine((m) => Boolean(m.mapLatitude) === Boolean(m.mapLongitude), {
    message: "Enlem ve boylam birlikte girilmelidir.",
    path: ["mapLatitude"],
  })
  .default(merchantDefaults);
export type Merchant = z.infer<typeof merchantSchema>;
