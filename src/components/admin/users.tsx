"use client";

import { useEffect, useState } from "react";
import { EditorCard, Field } from "./editors";
import { adminRequest } from "./image-picker";

type AdminUserRow = {
  id: string;
  username: string;
  role: "owner" | "editor";
  active: number;
  createdAt: string;
};

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "editor">("editor");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const result = await adminRequest<{
      users: AdminUserRow[];
      currentId: string;
    }>("users");
    setUsers(result.users);
    setCurrentId(result.currentId);
  }
  useEffect(() => {
    let active = true;
    void adminRequest<{ users: AdminUserRow[]; currentId: string }>("users")
      .then((result) => {
        if (!active) return;
        setUsers(result.users);
        setCurrentId(result.currentId);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Yetkililer yüklenemedi.",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  async function action(run: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await run();
      await load();
      setMessage(success);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-editor-stack">
      {error && <p className="admin-error" role="alert">{error}</p>}
      {message && <p className="admin-success" role="status">{message}</p>}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void action(
            () =>
              adminRequest("users", {
                method: "POST",
                body: JSON.stringify({ username, password, role }),
              }),
            "Yeni yetkili hesabı oluşturuldu.",
          ).then(() => {
            setUsername("");
            setPassword("");
            setRole("editor");
          });
        }}
      >
        <fieldset disabled={busy}>
          <EditorCard
            title="Yeni yetkili ekleyin"
            description="Editörler ürün, fiyat, stok ve site içeriklerini değiştirebilir. Hesap sahipleri ayrıca yeni yetkili ekleyebilir."
          >
            <div className="admin-form-grid">
              <Field
                label="Kullanıcı adı"
                value={username}
                onChange={(value) => setUsername(value.toLowerCase())}
                minLength={3}
                maxLength={50}
                autoComplete="off"
                required
              />
              <Field
                label="Geçici şifre"
                value={password}
                onChange={setPassword}
                type="password"
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                hint="En az 12 karakter. Yetkili ilk girişinden sonra değiştirebilir."
                required
              />
            </div>
            <label className="admin-field">
              <span>Yetki seviyesi</span>
              <select value={role} onChange={(e) => setRole(e.target.value as "owner" | "editor")}>
                <option value="editor">Editör — ürün ve içerik yönetimi</option>
                <option value="owner">Hesap sahibi — tam yetki</option>
              </select>
            </label>
            <button className="admin-button primary" type="submit">
              {busy ? "Oluşturuluyor…" : "Yetkili hesabı oluştur"}
            </button>
          </EditorCard>
        </fieldset>
      </form>
      <EditorCard
        title="Yetkili hesaplar"
        description="Bir hesabı duraklattığınızda açık oturumları hemen kapatılır."
      >
        <div className="admin-user-list">
          {users.map((user) => {
            const active = Number(user.active) === 1;
            const self = user.id === currentId;
            return (
              <article key={user.id}>
                <div>
                  <h3>@{user.username}{self ? " · Siz" : ""}</h3>
                  <p>{user.role === "owner" ? "Hesap sahibi" : "Editör"} · {active ? "Aktif" : "Duraklatılmış"}</p>
                  <small>{new Date(user.createdAt).toLocaleDateString("tr-TR")}</small>
                </div>
                {!self && (
                  <div className="admin-user-actions">
                    <button
                      className="admin-button subtle"
                      type="button"
                      disabled={busy}
                      onClick={() => void action(
                        () => adminRequest("users/status", { method: "POST", body: JSON.stringify({ id: user.id, active: !active }) }),
                        active ? "Yetkili hesabı duraklatıldı." : "Yetkili hesabı etkinleştirildi.",
                      )}
                    >
                      {active ? "Duraklat" : "Etkinleştir"}
                    </button>
                    <button
                      className="admin-button danger"
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!confirm(`@${user.username} hesabı kalıcı olarak silinsin mi?`)) return;
                        void action(
                          () => adminRequest("users/delete", { method: "POST", body: JSON.stringify({ id: user.id }) }),
                          "Yetkili hesabı silindi.",
                        );
                      }}
                    >
                      Sil
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </EditorCard>
    </div>
  );
}
