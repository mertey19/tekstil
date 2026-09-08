"use client";
/* eslint-disable @next/next/no-img-element -- Upload previews and private media library do not need the public image optimizer. */
import { useId, useRef, useState } from "react";
import type { MediaItem } from "@/lib/cms-model";
import { prepareUpload } from "@/lib/prepare-upload";

export async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "x-cms-request": "1",
      ...(typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({ error: response.status === 413 ? "Dosya veya içerik boyutu çok büyük." : "Sunucu yanıtı alınamadı. Yeniden deneyin." }));
  if (!response.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
  return result as T;
}
export function ImagePicker({
  value,
  onChange,
  label = "Görsel",
  library,
  onUpload,
  onBusy,
  optional = false,
}: {
  value: string;
  onChange: (src: string) => void;
  label?: string;
  library: MediaItem[];
  onUpload: (item: MediaItem) => void;
  onBusy: (busy: boolean) => void;
  optional?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > 8 * 1024 * 1024) {
      setError("En fazla 8 MB büyüklüğünde bir görsel seçin.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("JPG, PNG veya WebP görsel seçin.");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    onBusy(true);
    try {
      const prepared = await prepareUpload(file);
      const item = await adminRequest<MediaItem>("media", {
        method: "POST",
        headers: {
          "Content-Type": prepared.type,
          "x-file-name": encodeURIComponent(file.name),
        },
        body: prepared,
      });
      onUpload(item);
      onChange(item.src);
      setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Görsel yüklenemedi.");
    } finally {
      URL.revokeObjectURL(url);
      setPreview("");
      setBusy(false);
      onBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="admin-image-picker">
      <span className="admin-label" id={id}>
        {label}
      </span>
      <div className="admin-image-row">
        <div className="admin-image-preview">
          {preview || value ? (
            <img src={preview || value} alt={`${label} önizlemesi`} />
          ) : (
            <span>
              Görsel
              <br />
              seçilmedi
            </span>
          )}
        </div>
        <div className="admin-upload-actions">
          <label className={`admin-button ${busy ? "is-disabled" : ""}`}>
            <span>{busy ? "Yükleniyor…" : "Bilgisayardan seç"}</span>
            <input
              ref={input}
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-label={`${label} yükle`}
              disabled={busy}
              onChange={(e) => void upload(e.target.files?.[0])}
            />
          </label>
          <button
            className="admin-button subtle"
            type="button"
            disabled={busy}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            Kütüphaneden seç
          </button>
          {optional && value && (
            <button
              type="button"
              className="admin-text-button danger"
              onClick={() => onChange("")}
            >
              Görseli kaldır
            </button>
          )}
          <small>
            JPG, PNG, WebP · en fazla 8 MB
            <br />
            Görsel otomatik olarak optimize edilir.
          </small>
        </div>
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      {open && (
        <div className="admin-library" role="group" aria-labelledby={id}>
          {library.length ? (
            library.map((item) => (
              <button
                type="button"
                key={item.src}
                title={item.name}
                className={item.src === value ? "selected" : ""}
                onClick={() => {
                  onChange(item.src);
                  setOpen(false);
                }}
              >
                <img src={item.src} alt={item.name} loading="lazy" />
                <span>{item.name}</span>
              </button>
            ))
          ) : (
            <p>Henüz görsel yüklenmemiş.</p>
          )}
        </div>
      )}
    </div>
  );
}
