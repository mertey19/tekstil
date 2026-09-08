"use client";
import { useEffect, useState } from "react";
import { adminRequest } from "./image-picker";
type CustomerRow = {
  id: string;
  username: string;
  name: string;
  company: string;
  active: number;
  createdAt: string;
};
export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]),
    [query, setQuery] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    adminRequest<{ customers: CustomerRow[] }>("customers")
      .then((r) => {
        if (active) {
          setCustomers(r.customers);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  const reload = async () => {
    const result = await adminRequest<{ customers: CustomerRow[] }>(
      `customers?q=${encodeURIComponent(query)}`,
    );
    setCustomers(result.customers);
    setLoaded(true);
  };
  return (
    <section className="admin-card">
      <h2>Müşteri üyelikleri</h2>
      <p className="admin-note">
        Kayıtlı müşterileri görüntüleyin ve üyelik durumlarını yönetin. Durum
        değişikliği müşterinin açık oturumlarını kapatır.
      </p>
      <form
        className="admin-customer-search"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await reload();
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Liste alınamadı.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          aria-label="Müşteri ara"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, kullanıcı adı veya firma"
          maxLength={100}
        />
        <button className="admin-button" disabled={busy}>
          Ara
        </button>
      </form>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {!loaded && !error && <p role="status">Müşteriler yükleniyor…</p>}
      {loaded && !customers.length && <p>Bu aramada müşteri bulunamadı.</p>}
      <div className="admin-customer-list">
        {customers.map((customer) => (
          <article key={customer.id}>
            <div>
              <h3>{customer.name}</h3>
              <p>
                @{customer.username}
                {customer.company ? ` · ${customer.company}` : ""}
              </p>
              <small>
                {new Date(customer.createdAt).toLocaleDateString("tr-TR")} ·{" "}
                {Number(customer.active) === 1 ? "Aktif" : "Duraklatılmış"}
              </small>
            </div>
            <button
              className="admin-button subtle"
              disabled={busy}
              aria-label={`${customer.username} — ${Number(customer.active) === 1 ? "Üyeliği duraklat" : "Üyeliği etkinleştir"}`}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await adminRequest("customers/status", {
                    method: "POST",
                    body: JSON.stringify({
                      id: customer.id,
                      active: Number(customer.active) !== 1,
                    }),
                  });
                  await reload();
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : "İşlem tamamlanamadı.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {Number(customer.active) === 1 ? "Duraklat" : "Etkinleştir"}
            </button>
          </article>
        ))}
      </div>
      {customers.length === 200 && (
        <p className="admin-note">
          İlk 200 kayıt gösteriliyor. Aramayı daraltarak diğer kayıtlara
          ulaşabilirsiniz.
        </p>
      )}
    </section>
  );
}
