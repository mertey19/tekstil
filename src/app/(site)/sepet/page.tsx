import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalog-ui";
import { CartPage } from "@/components/shop/cart-page";

export const metadata: Metadata = {
  title: "Sepet",
  description: "Sepetinizdeki ürünleri ve sipariş toplamını inceleyin.",
  robots: { index: false, follow: true },
};
export default function Page() {
  return <div className="container shop-page"><Breadcrumbs items={[{ label: "Sepet" }]} /><CartPage /></div>;
}
