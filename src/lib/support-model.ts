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
export const merchantSchema = z
  .object({
    legalName: optional,
    address: z.string().trim().max(2000),
    taxOffice: optional,
    taxNumber: optional,
    mersisNumber: optional,
  })
  .default({
    legalName: "",
    address: "",
    taxOffice: "",
    taxNumber: "",
    mersisNumber: "",
  });
