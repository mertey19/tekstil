"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/customer-model";
import { customerRequest } from "./session";
import { RecoveryCode } from "./auth-form";

export function ProfileForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [code, setCode] = useState("");
  if (code)
    return (
      <RecoveryCode code={code} href="/giris" label="Yeni şifremle giriş yap" />
    );
  async function action(
    form: HTMLFormElement,
    path: string,
    method: string,
    onSuccess: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    const values = Object.fromEntries(new FormData(form));
    if (path === "password" && values.password !== values.confirm) {
      setError("Şifreler eşleşmiyor.");
      setBusy(false);
      return;
    }
    delete values.confirm;
    try {
      const result = await customerRequest<{ recoveryCode?: string }>(
        path,
        values,
        method,
      );
      if (result.recoveryCode) setCode(result.recoveryCode);
      else onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="customer-profile-forms">
      {message && (
        <p className="customer-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="customer-error" role="alert">
          {error}
        </p>
      )}
      <form
        className="customer-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void action(e.currentTarget, "profile", "PATCH", () => {
            setMessage("Profil bilgileriniz kaydedildi.");
            router.refresh();
          });
        }}
      >
        <h2>Profil bilgilerim</h2>
        <p className="customer-help">
          Kullanıcı adınız: <strong>{customer.username}</strong>
        </p>
        <fieldset disabled={busy}>
          <label>
            Ad soyad
            <input
              name="name"
              autoComplete="name"
              defaultValue={customer.name}
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label>
            Firma adı <small>İsteğe bağlı</small>
            <input
              name="company"
              autoComplete="organization"
              defaultValue={customer.company}
              maxLength={150}
            />
          </label>
          <button className="button primary" type="submit">
            Bilgilerimi kaydet
          </button>
        </fieldset>
      </form>
      <form
        className="customer-panel"
        onSubmit={(e) => {
          e.preventDefault();
          void action(e.currentTarget, "password", "POST", () => {});
        }}
      >
        <h2>Şifremi değiştir</h2>
        <p className="customer-help">
          Şifreniz değişince tüm cihazlardaki oturumlar kapanır ve yeni bir
          kurtarma kodu verilir.
        </p>
        <fieldset disabled={busy}>
          <label>
            Mevcut şifre
            <input
              type="password"
              name="current"
              autoComplete="current-password"
              required
              maxLength={128}
            />
          </label>
          <label>
            Yeni şifre
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </label>
          <label>
            Yeni şifre tekrar
            <input
              type="password"
              name="confirm"
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
            />
          </label>
          <button className="button secondary" type="submit">
            Şifremi değiştir
          </button>
        </fieldset>
      </form>
      <details className="customer-panel customer-delete">
        <summary>Hesabımı sil</summary>
        <p>Profiliniz ve tüm oturumlarınız silinir. Bu işlem geri alınamaz.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void action(e.currentTarget, "profile", "DELETE", () =>
              window.location.replace("/giris?silindi=1"),
            );
          }}
        >
          <fieldset disabled={busy}>
            <label>
              Silmek için şifreniz
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </label>
            <label className="customer-checkbox">
              <input type="checkbox" required />
              Hesabımı silmek istiyorum.
            </label>
            <button className="button danger" type="submit">
              Hesabımı kalıcı olarak sil
            </button>
          </fieldset>
        </form>
      </details>
    </div>
  );
}
export function CustomerLogout() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <button
        className="customer-text-link"
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await customerRequest("logout");
            window.location.replace("/giris");
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Çıkış yapılamadı.",
            );
            setBusy(false);
          }
        }}
      >
        Çıkış yap
      </button>
      {error && (
        <p role="alert" className="customer-error">
          {error}
        </p>
      )}
    </div>
  );
}
