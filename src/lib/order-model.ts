import { z } from "zod";

export const orderStatuses = [
  "payment_pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "payment_failed",
] as const;
export const orderStatusSchema = z.enum(orderStatuses);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

const cleanText = (minimum: number, maximum: number, message: string) =>
  z.string().trim().min(minimum, message).max(maximum);

export const checkoutSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(140),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1, "Sepetiniz boş.")
      .max(50),
    customerName: cleanText(2, 120, "Adınızı ve soyadınızı yazın."),
    email: z.email("Geçerli bir e-posta adresi yazın.").trim().toLowerCase().max(254),
    identityNumber: z
      .string()
      .trim()
      .regex(/^\d{11}$/, "T.C. kimlik numarası 11 haneli olmalıdır."),
    phone: z
      .string()
      .trim()
      .regex(/^\+90\d{10}$/, "Telefonu +90 ile başlayan 12 haneli biçimde yazın."),
    address: cleanText(10, 1000, "Açık teslimat adresini yazın."),
    district: cleanText(2, 100, "İlçeyi yazın."),
    city: cleanText(2, 100, "İli yazın."),
    postalCode: z.string().trim().regex(/^\d{5}$/, "Posta kodu 5 haneli olmalıdır."),
    invoiceType: z.enum(["individual", "corporate"]),
    company: z.string().trim().max(200),
    taxOffice: z.string().trim().max(120),
    taxNumber: z.string().trim().max(20),
    notes: z.string().trim().max(1000),
    legalAccepted: z.literal(true, {
      error: "Ön bilgilendirme ve mesafeli satış sözleşmesini kabul edin.",
    }),
    website: z.string().max(100).default(""),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.invoiceType === "corporate") {
      for (const [field, label] of [
        ["company", "Firma unvanı"],
        ["taxOffice", "Vergi dairesi"],
        ["taxNumber", "Vergi numarası"],
      ] as const)
        if (!value[field])
          context.addIssue({
            code: "custom",
            path: [field],
            message: `${label} zorunludur.`,
          });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PublicOrder = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  customerName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  items: {
    slug: string;
    name: string;
    image: string;
    unitPriceCents: number;
    quantity: number;
    lineTotalCents: number;
  }[];
};
