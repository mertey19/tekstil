"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  fieldErrors,
  quoteSchema,
  type QuoteErrors,
  type QuoteData,
} from "@/lib/quote-schema";
import { Icon } from "./icon";
type Result = {
  status:
    | "idle"
    | "loading"
    | "ready"
    | "validation"
    | "error"
    | "unconfigured"
    | "network";
  message?: string;
  url?: string;
};
export function QuoteForm({
  products,
  initialProduct,
  invalidProduct,
  demo,
  available,
  profile,
}: {
  products: { id: string; name: string }[];
  initialProduct: string;
  invalidProduct: boolean;
  demo: boolean;
  available: boolean;
  profile?: {name:string; company:string};
}) {
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [result, setResult] = useState<Result>({ status: "idle" });
  const busy = useRef(false);
  const readyHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (result.status === "ready")
      readyHeading.current?.focus({ preventScroll: true });
  }, [result.status]);
  const focusError = (form: HTMLFormElement, problems: QuoteErrors) => {
    const field = form.elements.namedItem(Object.keys(problems)[0]);
    if (field instanceof HTMLElement) field.focus();
  };
  const props = (name: keyof QuoteData) => ({
    id: name,
    name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const error = (name: keyof QuoteData) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    );
  const submit = async (form: HTMLFormElement) => {
    if (busy.current) return;
    const parsed = quoteSchema.safeParse(
      Object.fromEntries(new FormData(form)),
    );
    if (!parsed.success) {
      const problems = fieldErrors(parsed.error);
      setErrors(problems);
      setResult({
        status: "validation",
        message: "Lütfen işaretli alanları kontrol edin.",
      });
      focusError(form, problems);
      return;
    }
    setErrors({});
    busy.current = true;
    setResult({
      status: "loading",
      message: "WhatsApp mesajınız hazırlanıyor…",
    });
    try {
      const response = await fetch("/api/teklif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15_000),
      });
      const body: unknown = await response.json();
      if (
        !body ||
        typeof body !== "object" ||
        !("status" in body) ||
        !("message" in body) ||
        typeof body.message !== "string"
      )
        throw new Error("invalid response");
      if (
        response.ok &&
        body.status === "ready" &&
        "url" in body &&
        typeof body.url === "string" &&
        /^https:\/\/wa\.me\/[1-9]\d{7,14}\?text=/.test(body.url)
      )
        setResult({ status: "ready", message: body.message, url: body.url });
      else if (
        body.status === "validation" &&
        "errors" in body &&
        body.errors &&
        typeof body.errors === "object"
      ) {
        const problems = body.errors as QuoteErrors;
        setErrors(problems);
        setResult({ status: "validation", message: body.message });
        focusError(form, problems);
      } else
        setResult({
          status: body.status === "unconfigured" ? "unconfigured" : "error",
          message: body.message,
        });
    } catch {
      setResult({
        status: "network",
        message:
          "Bağlantı kurulamadı. Mesajınız hazırlanamadı ve gönderilmedi. Lütfen tekrar deneyin.",
      });
    } finally {
      busy.current = false;
    }
  };
  return (
    <form
      className="quote-form"
      noValidate
      onChange={() => {
        if (result.status === "ready") setResult({ status: "idle" });
      }}
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
      aria-busy={result.status === "loading"}
    >
      <h2>WhatsApp’tan bize yazın.</h2>
      <p className="form-intro">
        Talebinizi hazırlayın, WhatsApp’ta gözden geçirip gönderin.
      </p>
      {!available && (
        <div className="inline-notice">
          <strong>WhatsApp hattı hazırlanıyor.</strong>
          <p>
            İletişim numarası henüz eklenmedi. Bu aşamada mesaj gönderilemez.
          </p>
        </div>
      )}
      {demo && (
        <p className="form-demo-note">
          Önizleme kataloğundaki ürünler temsilîdir. Bu bilgi hazırlanacak
          mesaja da eklenir.
        </p>
      )}
      {invalidProduct && (
        <p className="field-error">
          Bağlantıdaki ürün bulunamadı. Listeden bir ürün seçebilirsiniz.
        </p>
      )}
      <fieldset className="form-grid" disabled={result.status === "loading"}>
        <legend className="sr-only">Talep bilgileri</legend>
        <div className="field">
          <label htmlFor="name">
            Ad soyad <span>*</span>
          </label>
          <input
            {...props("name")}
            defaultValue={profile?.name || ""}
            autoComplete="name"
            maxLength={100}
            required
          />
          {error("name")}
        </div>
        <div className="field">
          <label htmlFor="company">
            Firma adı <small>İsteğe bağlı</small>
          </label>
          <input
            {...props("company")}
            defaultValue={profile?.company || ""}
            autoComplete="organization"
            maxLength={150}
          />
          {error("company")}
        </div>
        <div className="field">
          <label htmlFor="productId">
            İlgilenilen ürün <small>İsteğe bağlı</small>
          </label>
          <select {...props("productId")} defaultValue={initialProduct}>
            <option value="">Ürün seçin</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {error("productId")}
        </div>
        <div className="field">
          <label htmlFor="quantity">
            Tahmini adet <small>İsteğe bağlı</small>
          </label>
          <input
            {...props("quantity")}
            type="number"
            inputMode="numeric"
            min={1}
            max={1_000_000}
            step={1}
          />
          {error("quantity")}
        </div>
        <div className="field full-width">
          <label htmlFor="message">
            Mesajınız <span>*</span>
          </label>
          <textarea
            {...props("message")}
            rows={5}
            minLength={10}
            maxLength={3000}
            required
            placeholder="Ürünle ilgili sorularınızı ve ihtiyacınızı paylaşın."
          />
          {error("message")}
        </div>
      </fieldset>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Web siteniz (boş bırakın)</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          maxLength={200}
        />
      </div>
      <p className="privacy-note">
        Mesajınız otomatik gönderilmez. Gönderimi WhatsApp içinde siz
        tamamlarsınız. <Link href="/aydinlatma">Aydınlatma Metni</Link> ·{" "}
        <Link href="/gizlilik">Gizlilik</Link>
      </p>
      {result.status !== "idle" && result.status !== "ready" && (
        <div
          className="form-status"
          role={result.status === "loading" ? "status" : "alert"}
        >
          {result.message}
        </div>
      )}
      {result.status === "ready" ? (
        <div className="whatsapp-ready" role="status">
          <h3 ref={readyHeading} tabIndex={-1}>
            Mesajınız hazır.
          </h3>
          <p className="message-preview">{result.message}</p>
          <a
            href={result.url}
            className="button whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp’ta Aç
            <Icon size={18} />
          </a>
          <p>Henüz gönderilmedi. WhatsApp açıldığında mesajı gönderin.</p>
        </div>
      ) : (
        <button
          className="button whatsapp submit-button"
          disabled={result.status === "loading"}
          type="submit"
        >
          {result.status === "loading"
            ? "Hazırlanıyor…"
            : "WhatsApp Mesajını Hazırla"}
          <Icon size={18} />
        </button>
      )}
    </form>
  );
}
