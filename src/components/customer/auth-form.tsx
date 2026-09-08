"use client";
import Link from "next/link";
import { useState } from "react";
import { customerRequest } from "./session";

export function RecoveryCode({
  code,
  href,
  label = "Hesabıma devam et",
}: {
  code: string;
  href: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="recovery-box" aria-labelledby="recovery-title">
      <span className="eyebrow">HESABINIZ İÇİN</span>
      <h2 id="recovery-title">Kurtarma kodunuzu saklayın.</h2>
      <p>
        Şifrenizi unutursanız bu kodla yeni şifre belirleyebilirsiniz. Kod
        yalnızca size aittir; güvenli bir yerde saklayın.
      </p>
      <code>{code}</code>
      <div className="customer-buttons">
        <button
          className="button secondary"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Kopyalandı" : "Kodu kopyala"}
        </button>
        <a className="button primary" href={href}>
          {label}
        </a>
      </div>
      <p className="customer-help">
        Yeni kod oluşturulduğunda önceki kod geçersiz olur.
      </p>
    </section>
  );
}
export function CustomerAuthForm({
  mode,
  returnPath,
}: {
  mode: "login" | "register" | "recover";
  returnPath: string;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [code, setCode] = useState("");
  const register = mode === "register",
    recover = mode === "recover";
  if (code)
    return (
      <RecoveryCode
        code={code}
        href={recover ? "/giris" : returnPath}
        label={recover ? "Yeni şifremle giriş yap" : "Hesabıma devam et"}
      />
    );
  return (
    <form
      className="customer-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setError("");
        const form = new FormData(event.currentTarget);
        if (mode !== "login" && form.get("password") !== form.get("confirm")) {
          setError("Şifreler eşleşmiyor.");
          return;
        }
        setBusy(true);
        try {
          const data = {
            username: form.get("username"),
            password: form.get("password"),
            ...(register
              ? {
                  name: form.get("name"),
                  company: form.get("company"),
                  website: form.get("website"),
                }
              : {}),
            ...(recover ? { code: form.get("code") } : {}),
          };
          const result = await customerRequest<{ recoveryCode?: string }>(
            mode,
            data,
          );
          if (result.recoveryCode) setCode(result.recoveryCode);
          else window.location.assign(returnPath);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "İşlem tamamlanamadı.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <span className="eyebrow">MÜŞTERİ ÜYELİĞİ</span>
      <h1>
        {register
          ? "Hesabınızı oluşturun."
          : recover
            ? "Yeni bir şifre belirleyin."
            : "Tekrar hoş geldiniz."}
      </h1>
      <p>
        {register
          ? "Profilinizi oluşturun, teklif formunu daha hızlı hazırlayın."
          : recover
            ? "Kayıt sırasında sakladığınız kurtarma kodunu kullanın."
            : "Profil bilgilerinize ulaşmak için giriş yapın."}
      </p>
      <fieldset disabled={busy}>
        {register && (
          <>
            <label>
              Ad soyad
              <input
                name="name"
                autoComplete="name"
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
                maxLength={150}
              />
            </label>
          </>
        )}
        <label>
          Kullanıcı adı
          <input
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            minLength={3}
            maxLength={50}
            pattern="[a-z0-9._\-]+"
            placeholder="Örn. mertbayhan"
          />
        </label>
        {recover && (
          <label>
            Kurtarma kodu
            <input
              name="code"
              autoComplete="off"
              required
              minLength={48}
              maxLength={48}
              spellCheck={false}
            />
          </label>
        )}
        <label>
          {recover ? "Yeni şifre" : "Şifre"}
          <input
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={12}
            maxLength={128}
          />
        </label>
        {mode !== "login" && (
          <>
            <p className="customer-help">En az 12 karakter kullanın.</p>
            <label>
              Şifre tekrar
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
          </>
        )}
        {register && (
          <div className="honeypot" aria-hidden="true">
            <label>
              Web siteniz
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        )}
        {error && (
          <p className="customer-error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary" type="submit">
          {busy
            ? "İşlem yapılıyor…"
            : register
              ? "Üye ol"
              : recover
                ? "Şifremi yenile"
                : "Giriş yap"}
        </button>
      </fieldset>
      {mode === "login" ? (
        <div className="customer-links">
          <Link href={`/uye-ol?devam=${encodeURIComponent(returnPath)}`}>
            Hesabınız yok mu? Üye olun
          </Link>
          <Link href="/sifremi-unuttum">Şifremi unuttum</Link>
        </div>
      ) : (
        <Link
          className="customer-text-link"
          href={`/giris?devam=${encodeURIComponent(returnPath)}`}
        >
          Giriş sayfasına dön
        </Link>
      )}
      {register && (
        <p className="customer-help">
          Adınız ve firma bilginiz hesabınızda saklanır. Teklifler WhatsApp
          üzerinden iletilir.{" "}
          <Link href="/hesabim/veriler">Üyelik verileri hakkında</Link>
        </p>
      )}
    </form>
  );
}
