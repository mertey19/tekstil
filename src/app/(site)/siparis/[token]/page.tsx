import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ClearCartOnPaid } from "@/components/shop/clear-cart-on-paid";
import { formatPrice } from "@/lib/catalog";
import { getOrderByPublicToken } from "@/server/order-store";

export const metadata: Metadata = { title: "Sipariş Durumu", robots: { index: false, follow: false } };
const labels = { payment_pending: "Ödeme bekleniyor", paid: "Ödeme alındı", preparing: "Hazırlanıyor", shipped: "Kargoya verildi", delivered: "Teslim edildi", cancelled: "İptal edildi", payment_failed: "Ödeme başarısız" } as const;
export default async function Page({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ odeme?: string }> }) {
  const order = await getOrderByPublicToken((await params).token);
  if (!order) notFound();
  const outcome = (await searchParams).odeme;
  return <div className="container order-page">
    {order.paymentStatus === "paid" && <ClearCartOnPaid />}
    <header className="order-success"><span className="eyebrow">SİPARİŞ DURUMU</span><h1>{labels[order.status]}</h1><p>Sipariş numaranız: <strong>{order.orderNumber}</strong></p></header>
    {outcome === "basarisiz" && <p className="checkout-error" role="alert">Ödeme tamamlanamadı. Sepetiniz korunuyor; bilgilerinizi kontrol edip yeniden deneyebilirsiniz.</p>}
    {outcome === "kontrol" && <p className="secure-note" role="status">Ödeme sonucu kontrol ediliyor. Bu sayfayı kısa süre sonra yenileyin; sipariş durumunuz burada güncellenecektir.</p>}
    <div className="order-detail-grid">
      <section className="order-detail-card"><h2>Ürünler</h2>{order.items.map((item) => <article className="order-item" key={item.slug}><div className="order-item-image"><ProductImage src={item.image} alt="" sizes="72px" /></div><div><Link href={`/urun/${item.slug}`}>{item.name}</Link><small>{item.quantity} adet × {formatPrice(item.unitPriceCents)}</small></div><strong>{formatPrice(item.lineTotalCents)}</strong></article>)}<dl className="order-values"><div><dt>Ara toplam</dt><dd>{formatPrice(order.subtotalCents)}</dd></div><div><dt>Kargo</dt><dd>{order.shippingCents ? formatPrice(order.shippingCents) : "Ücretsiz"}</dd></div><div><dt>Toplam</dt><dd>{formatPrice(order.totalCents)}</dd></div></dl></section>
      <section className="order-detail-card"><h2>Teslimat</h2><p><strong>{order.customerName}</strong><br />{order.address}<br />{order.postalCode} {order.district} / {order.city}<br />{order.phone}</p><p className="secure-note">Bu sayfanın bağlantısını siparişinizi takip etmek için saklayın.</p></section>
    </div>
    <Link className="button secondary" href="/urunler">Alışverişe devam et</Link>
  </div>;
}
