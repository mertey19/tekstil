import { z } from "zod";
export const quoteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Adınızı ve soyadınızı yazın.")
      .max(100, "En fazla 100 karakter yazabilirsiniz."),
    company: z
      .string()
      .trim()
      .max(150, "Firma adı en fazla 150 karakter olabilir.")
      .default(""),
    productId: z.string().trim().max(100).default(""),
    quantity: z
      .string()
      .trim()
      .refine(
        (v) => !v || (/^[1-9]\d{0,6}$/.test(v) && Number(v) <= 1_000_000),
        "Adet, 1 ile 1.000.000 arasında tam sayı olmalı.",
      )
      .default(""),
    message: z
      .string()
      .trim()
      .min(10, "Mesajınızı en az 10 karakterle açıklayın.")
      .max(3000, "Mesaj en fazla 3.000 karakter olabilir."),
    website: z.string().max(200).default(""),
  })
  .strict();
export type QuoteData = z.infer<typeof quoteSchema>;
export type QuoteErrors = Partial<Record<keyof QuoteData, string>>;
export function fieldErrors(error: z.ZodError): QuoteErrors {
  return Object.fromEntries(
    error.issues.map((issue) => [issue.path[0], issue.message]),
  );
}
