"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/catalog";
import { orderStatuses, type OrderStatus } from "@/lib/order-model";
import { adminRequest } from "./image-picker";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  totalCents: number;
  customerName: string;
  phone: string;
  city: string;
  district: string;
  createdAt: string;
};
const labels: Record<OrderStatus, string> = {
  payment_pending: "Ödeme bekleniyor",
  paid: "Ödeme alındı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  payment_failed: "Ödeme başarısız",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async (search = query) => {
    const response = await adminRequest<{ orders: OrderRow[] }>(`orders?q=${encodeURIComponent(search)}`);
    setOrders(response.orders);
    setLoaded(true);
  };
  useEffect(() => {
    let active = true;
    adminRequest<{ orders: OrderRow[] }>("orders")
      .then((response) => {
        if (active) {
          setOrders(response.orders);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => { active = false; };
  }, []);
  return <section className="admin-card">
    <h2>Siparişler</h2>
    <p className="admin-note">Ödeme ve teslimat durumlarını izleyin. Kart bilgileri ödeme sağlayıcısında işlenir ve panelde tutulmaz.</p>
    <form className="admin-customer-search" onSubmit={async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await load(); } catch (error) { setError(error instanceof Error ? error.message : "Siparişler alınamadı."); } finally { setBusy(false); } }}>
      <input aria-label="Sipariş ara" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sipariş no, müşteri veya telefon" maxLength={100} />
      <button className="admin-button" disabled={busy}>Ara</button>
    </form>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!loaded && !error && <p role="status">Siparişler yükleniyor…</p>}
    {loaded && !orders.length && <p>Henüz sipariş bulunmuyor.</p>}
    <div className="admin-order-list">
      {orders.map((order) => <article key={order.id}>
        <div className="admin-order-main"><strong>{order.orderNumber}</strong><h3>{order.customerName}</h3><p>{order.phone} · {order.district} / {order.city}</p><small>{new Date(order.createdAt).toLocaleString("tr-TR")} · {formatPrice(Number(order.totalCents))} · Ödeme: {order.paymentStatus === "paid" ? "Alındı" : "Bekliyor"}</small></div>
        <label className="admin-field"><span>Sipariş durumu</span><select value={order.status} disabled={busy} onChange={async (event) => { const status = event.target.value as OrderStatus; setBusy(true); setError(""); try { await adminRequest("orders/status", { method: "POST", body: JSON.stringify({ id: order.id, status }) }); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status } : item)); } catch (error) { setError(error instanceof Error ? error.message : "Durum değiştirilemedi."); } finally { setBusy(false); } }}>{orderStatuses.filter((status) => status === order.status || status === "cancelled" || (order.paymentStatus === "paid" && ["paid", "preparing", "shipped", "delivered"].includes(status))).map((status) => <option value={status} key={status}>{labels[status]}</option>)}</select></label>
      </article>)}
    </div>
  </section>;
}
