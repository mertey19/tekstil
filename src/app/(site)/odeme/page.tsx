import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalog-ui";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getSiteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Güvenli Ödeme",
  description: "Teslimat bilgilerinizi girin ve siparişinizi güvenli sanal POS ile tamamlayın.",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const site = await getSiteConfig();
  return <div className="container shop-page"><Breadcrumbs items={[{ label: "Sepet", href: "/sepet" }, { label: "Ödeme" }]} /><CheckoutForm merchant={site.merchant} /></div>;
}
