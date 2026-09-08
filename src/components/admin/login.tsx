"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { adminRequest } from "./image-picker";

export function AdminLogin({ configured }: { configured: boolean }) {
  const tokenInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.has("setup")) {
      if (tokenInput.current)
        tokenInput.current.value = hash.get("setup") || "";
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  return (
    <main className="admin-login" id="main">
      <div className="admin-login-story">
        <Link href="/" className="admin-brand">
          MD<span>İÇERİK YÖNETİMİ</span>
        </Link>
        <div>
          <span className="admin-kicker">MİKROFİBER DEPOSU</span>
          <h1>
            İçeriğiniz,
            <br />
            <em>sizin elinizde.</em>
          </h1>
          <p>
            Ürünlerinizi güncelleyin, yeni yazılar paylaşın ve sitenize kendi
            görsellerinizle hayat verin.
          </p>
        </div>
        <span className="admin-login-note">
          Ürünler · Blog · Sayfalar · Görseller
        </span>
      </div>
      <div className="admin-login-form">
        <div className="admin-login-card">
          <span className="admin-kicker">YÖNETİCİ PANELİ</span>
          <h2>
            {configured ? "Tekrar hoş geldiniz." : "İlk hesabınızı oluşturun."}
          </h2>
          <p>
            {configured
              ? "Devam etmek için yönetici bilgilerinizle giriş yapın."
              : "Kullanıcı adınızı ve en az 12 karakterli şifrenizi belirleyin."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              const form = new FormData(e.currentTarget);
              if (!configured && form.get("password") !== form.get("confirm")) {
                setError("Şifreler eşleşmiyor.");
                return;
              }
              setBusy(true);
              try {
                await adminRequest(configured ? "login" : "setup", {
                  method: "POST",
                  body: JSON.stringify({
                    username: form.get("username"),
                    password: form.get("password"),
                    token: form.get("token"),
                  }),
                });
                window.location.replace("/admin");
              } catch (error) {
                setError(
                  error instanceof Error ? error.message : "Giriş yapılamadı.",
                );
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy}>
              <label className="admin-field">
                <span>Kullanıcı adı</span>
                <input
                  name="username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={50}
                  pattern="[a-z0-9._\-]+"
                  required
                  autoCapitalize="none"
                  placeholder="Örn. mert"
                />
              </label>
              <label className="admin-field">
                <span>Şifre</span>
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    configured ? "current-password" : "new-password"
                  }
                  minLength={12}
                  maxLength={128}
                  required
                />
              </label>
              {!configured && (
                <>
                  <label className="admin-field">
                    <span>Şifre tekrar</span>
                    <input
                      name="confirm"
                      type="password"
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={128}
                      required
                    />
                  </label>
                  <label className="admin-field">
                    <span>Kurulum anahtarı</span>
                    <input
                      ref={tokenInput}
                      name="token"
                      type="password"
                      autoComplete="off"
                      required
                    />
                    <small>
                      Kurulum bağlantısındaki anahtar otomatik doldurulur. Yeni
                      bağlantı için sunucuda <code>npm run admin:setup</code>{" "}
                      çalıştırın.
                    </small>
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="admin-error">
                  {error}
                </p>
              )}
              <button className="admin-button primary" type="submit">
                {busy
                  ? "Lütfen bekleyin…"
                  : configured
                    ? "Giriş yap →"
                    : "Hesabımı oluştur →"}
              </button>
            </fieldset>
          </form>
          <Link className="admin-back-link" href="/">
            ← Siteye dön
          </Link>
        </div>
      </div>
    </main>
  );
}
