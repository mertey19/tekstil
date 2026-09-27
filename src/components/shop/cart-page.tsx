"use client";

import Link from "next/link";
import { Icon } from "@/components/icon";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/catalog";
import { useCart, useCartTotals } from "./cart-provider";

export function CartPage() {
  const cart = useCart();
  const totals = useCartTotals();
  if (!cart.shop.enabled)
    return (
      <div className="shop-empty">
        <Icon name="cart" size={38} />
        <h1>İnternet mağazası hazırlanıyor.</h1>
        <p>Fiyatlar ve ödeme sistemi tamamlandığında buradan sipariş verebilirsiniz.</p>
        <Link className="button primary" href="/urunler">Ürünleri incele</Link>
      </div>
    );
  if (!totals.items.length)
    return (
      <div className="shop-empty">
        <Icon name="cart" size={38} />
        <h1>Sepetiniz boş.</h1>
        <p>İhtiyacınıza uygun ürünleri sepete ekleyerek alışverişe başlayın.</p>
        <Link className="button primary" href="/urunler">Ürünlere git</Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <section className="cart-lines" aria-labelledby="cart-title">
        <div className="shop-heading">
          <span className="eyebrow">ALIŞVERİŞ SEPETİ</span>
          <h1 id="cart-title">Sepetiniz</h1>
          <p>{cart.count} ürün ödeme için hazır.</p>
        </div>
        {totals.items.map(({ product, quantity, lineTotalCents }) => (
          <article className="cart-line" key={product.id}>
            <Link className="cart-line-image" href={`/urun/${product.slug}`}>
              <ProductImage src={product.image.src} alt={product.image.alt} sizes="110px" />
            </Link>
            <div className="cart-line-copy">
              <Link href={`/urun/${product.slug}`}><h2>{product.name}</h2></Link>
              <span>{formatPrice(product.priceCents)} / adet</span>
              {product.trackStock && <small>Mevcut stok: {product.stock}</small>}
            </div>
            <div className="quantity-control" aria-label={`${product.name} adedi`}>
              <button type="button" aria-label="Bir azalt" onClick={() => cart.update(product.id, quantity - 1)}><Icon name="minus" size={15} /></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" aria-label="Bir artır" disabled={product.trackStock && quantity >= product.stock} onClick={() => cart.update(product.id, quantity + 1)}><Icon name="plus" size={15} /></button>
            </div>
            <strong className="cart-line-total">{formatPrice(lineTotalCents)}</strong>
            <button className="cart-remove" type="button" onClick={() => cart.remove(product.id)}>Kaldır</button>
          </article>
        ))}
        <Link className="text-link" href="/urunler">← Alışverişe devam et</Link>
      </section>
      <OrderSummary checkoutHref="/odeme" />
    </div>
  );
}

export function OrderSummary({ checkoutHref }: { checkoutHref?: string }) {
  const cart = useCart();
  const totals = useCartTotals();
  return (
    <aside className="order-summary" aria-label="Sipariş özeti">
      <h2>Sipariş özeti</h2>
      <dl>
        <div><dt>Ara toplam</dt><dd>{formatPrice(totals.subtotalCents)}</dd></div>
        <div><dt>Kargo</dt><dd>{totals.shippingCents ? formatPrice(totals.shippingCents) : "Ücretsiz"}</dd></div>
        <div className="order-total"><dt>Toplam</dt><dd>{formatPrice(totals.totalCents)}</dd></div>
      </dl>
      {!totals.meetsMinimum && (
        <p className="shop-warning">Minimum sipariş tutarı {formatPrice(cart.shop.minimumOrderCents)}.</p>
      )}
      {checkoutHref && (
        <Link className="button primary" aria-disabled={!totals.meetsMinimum} href={totals.meetsMinimum ? checkoutHref : "/sepet"}>Güvenli ödemeye geç <Icon name="arrow" size={17} /></Link>
      )}
      <p className="secure-note">Kart bilgileriniz ödeme kuruluşunun güvenli sayfasında işlenir.</p>
    </aside>
  );
}
