import { z } from "zod";

export const customerCredentials = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
    .max(50)
    .regex(
      /^[a-z0-9._-]+$/,
      "Kullanıcı adında küçük harf, rakam, nokta ve tire kullanın.",
    ),
  password: z.string().min(12, "Şifreniz en az 12 karakter olmalı.").max(128),
});
export const customerProfile = z.object({
  name: z.string().trim().min(2, "Adınızı ve soyadınızı yazın.").max(100),
  company: z.string().trim().max(150).default(""),
});
export const customerRegistration = customerCredentials
  .extend(customerProfile.shape)
  .extend({
    website: z.string().max(100).default(""),
  })
  .strict();
export type Customer = {
  id: string;
  username: string;
  name: string;
  company: string;
  createdAt: string;
};

export function customerReturnPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 300 ||
    !/^\/(urun\/|teklif-al(?:\?|$)|hesabim(?:\/|$)|urunler(?:\?|$))/.test(
      value,
    ) ||
    /[\\\r\n]/.test(value)
  )
    return "/hesabim";
  const url = new URL(value, "https://internal.invalid");
  return url.origin === "https://internal.invalid"
    ? url.pathname + url.search
    : "/hesabim";
}
