"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderSummary } from "./cart-page";
import { useCart, useCartTotals } from "./cart-provider";

type FormState = {
  customerName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  invoiceType: "individual" | "corporate";
  company: string;
  taxOffice: string;
  taxNumber: string;
  notes: string;
  legalAccepted: boolean;
  website: string;
};
const initial: FormState = {
  customerName: "", phone: "+90", address: "", district: "", city: "Denizli", postalCode: "", invoiceType: "individual", company: "", taxOffice: "", taxNumber: "", notes: "", legalAccepted: false, website: "",
};

export function CheckoutForm() {
  const cart = useCart();
  const totals = useCartTotals();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  if (!cart.shop.enabled || !totals.items.length)
    return (
      <div className="shop-empty">
        <h1>Ödeme için sepetinizi hazırlayın.</h1>
        <p>Ürünleri sepete ekledikten sonra teslimat bilgilerinizi girebilirsiniz.</p>
        <Link href="/urunler" className="button primary">Ürünlere git</Link>
      </div>
    );
  return (
    <div className="checkout-layout">
      <form
        className="checkout-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const response = await fetch("/api/siparis", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-shop-request": "1" },
              body: JSON.stringify({ ...form, items: cart.lines }),
            });
            const result = await response.json().catch(() => ({ error: "Sunucu yanıtı alınamadı." }));
            if (!response.ok) throw new Error(result.error || "Ödeme başlatılamadı.");
            cart.clear();
            window.location.assign(result.redirectUrl);
          } catch (error) {
            setError(error instanceof Error ? error.message : "Ödeme başlatılamadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="shop-heading">
          <span className="eyebrow">MİSAFİR ALIŞVERİŞİ</span>
          <h1>Teslimat ve ödeme</h1>
          <p>Üyelik gerekmez. Bilgileriniz bu siparişin teslimatı ve faturası için kullanılır.</p>
        </div>
        <fieldset disabled={busy}>
          <section className="checkout-section">
            <h2>İletişim</h2>
            <label><span>Ad soyad</span><input required autoComplete="name" maxLength={120} value={form.customerName} onChange={(e) => update("customerName", e.target.value)} /></label>
            <label><span>WhatsApp / telefon</span><input required type="tel" autoComplete="tel" inputMode="tel" maxLength={13} value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/[\s()-]/g, ""))} /><small>Örnek: +905305482660</small></label>
          </section>
          <section className="checkout-section">
            <h2>Teslimat adresi</h2>
            <label className="full"><span>Açık adres</span><textarea required rows={4} maxLength={1000} autoComplete="street-address" value={form.address} onChange={(e) => update("address", e.target.value)} /></label>
            <label><span>İlçe</span><input required maxLength={100} autoComplete="address-level2" value={form.district} onChange={(e) => update("district", e.target.value)} /></label>
            <label><span>İl</span><input required maxLength={100} autoComplete="address-level1" value={form.city} onChange={(e) => update("city", e.target.value)} /></label>
            <label><span>Posta kodu</span><input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value.replace(/\D/g, ""))} /></label>
          </section>
          <section className="checkout-section">
            <h2>Fatura</h2>
            <div className="invoice-options full">
              <label><input type="radio" name="invoice" checked={form.invoiceType === "individual"} onChange={() => update("invoiceType", "individual")} /> Bireysel</label>
              <label><input type="radio" name="invoice" checked={form.invoiceType === "corporate"} onChange={() => update("invoiceType", "corporate")} /> Kurumsal</label>
            </div>
            {form.invoiceType === "corporate" && <>
              <label className="full"><span>Firma unvanı</span><input required maxLength={200} value={form.company} onChange={(e) => update("company", e.target.value)} /></label>
              <label><span>Vergi dairesi</span><input required maxLength={120} value={form.taxOffice} onChange={(e) => update("taxOffice", e.target.value)} /></label>
              <label><span>Vergi numarası</span><input required inputMode="numeric" maxLength={20} value={form.taxNumber} onChange={(e) => update("taxNumber", e.target.value.replace(/\D/g, ""))} /></label>
            </>}
            <label className="full"><span>Sipariş notu (isteğe bağlı)</span><textarea rows={3} maxLength={1000} value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
          </section>
          <input className="shop-honeypot" aria-label="Bu alanı boş bırakın" tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => update("website", e.target.value)} />
          <label className="checkout-consent"><input required type="checkbox" checked={form.legalAccepted} onChange={(e) => update("legalAccepted", e.target.checked)} /><span><Link href="/on-bilgilendirme" target="_blank">Ön bilgilendirme formunu</Link> ve <Link href="/mesafeli-satis-sozlesmesi" target="_blank">mesafeli satış sözleşmesini</Link> okudum, kabul ediyorum.</span></label>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          <button className="button primary checkout-submit" disabled={busy || !totals.meetsMinimum}>{busy ? "Ödeme hazırlanıyor…" : "Sanal POS ile güvenli öde"}</button>
        </fieldset>
      </form>
      <OrderSummary />
    </div>
  );
}
