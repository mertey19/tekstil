"use client";
import { useState } from "react";
import {
  supportDefinitions,
  supportKeys,
  type SupportKey,
} from "@/data/support";
import type { CmsContent } from "@/lib/cms-model";
import { EditorCard, Field } from "./editors";

type Props = {
  content: CmsContent;
  change: (update: (draft: CmsContent) => void) => void;
};
export function SocialEditor({ content, change }: Props) {
  return (
    <EditorCard
      title="Üst şerit ve sosyal hesaplar"
      description="Bağlantı eklenen hesaplar üst şeritte görünür. Boş bıraktığınız hesaplar gösterilmez. WhatsApp, Blog ve SSS bağlantıları otomatik eklenir."
    >
      {(
        [
          ["facebook", "Facebook"],
          ["instagram", "Instagram"],
          ["linkedin", "LinkedIn"],
        ] as const
      ).map(([key, label]) => (
        <Field
          key={key}
          label={`${label} bağlantısı`}
          type="url"
          maxLength={2000}
          value={content.settings.social[key]}
          onChange={(v) =>
            change((d) => {
              d.settings.social[key] = v;
            })
          }
          placeholder={`https://www.${key}.com/`}
        />
      ))}
    </EditorCard>
  );
}

export function SupportEditor({ content, change }: Props) {
  const [page, setPage] = useState<SupportKey>("faq");
  const document = content.settings.support[page];
  const update = (index: number, key: "title" | "text", value: string) =>
    change((d) => {
      d.settings.support[page].sections[index][key] = value;
    });
  function move(index: number, offset: number) {
    change((d) => {
      const list = d.settings.support[page].sections;
      const [section] = list.splice(index, 1);
      list.splice(index + offset, 0, section);
    });
  }
  return (
    <div className="admin-editor-stack">
      <EditorCard
        title="Bilgilendirme sayfaları"
        description="SSS yanıtlarını ve sipariş metinlerini düzenleyin; yeni bölümler ekleyin. Değişiklikleri kaydettiğinizde içerik sitede güncellenir."
      >
        <label className="admin-field">
          <span>Düzenlenecek bilgilendirme sayfası</span>
          <select
            value={page}
            onChange={(e) => setPage(e.target.value as SupportKey)}
          >
            {supportKeys.map((key) => (
              <option key={key} value={key}>
                {supportDefinitions[key].label}
              </option>
            ))}
          </select>
        </label>
        <a
          className="admin-text-button"
          href={supportDefinitions[page].path}
          target="_blank"
          rel="noopener noreferrer"
        >
          Sayfayı sitede aç ↗
        </a>
        <Field
          label="Sayfa başlığı"
          value={document.title}
          required
          maxLength={240}
          onChange={(v) =>
            change((d) => {
              d.settings.support[page].title = v;
            })
          }
        />
        <Field
          label="Sayfa giriş metni"
          value={document.intro}
          multiline
          required
          maxLength={2000}
          onChange={(v) =>
            change((d) => {
              d.settings.support[page].intro = v;
            })
          }
        />
      </EditorCard>
      {document.sections.map((section, index) => (
        <EditorCard
          key={section.id}
          title={`${index + 1}. ${page === "faq" ? "Soru ve yanıt" : "Bölüm"}`}
        >
          <Field
            label={page === "faq" ? "Soru" : "Bölüm başlığı"}
            value={section.title}
            required
            maxLength={240}
            onChange={(v) => update(index, "title", v)}
          />
          <Field
            label={page === "faq" ? "Yanıt" : "Bölüm metni"}
            value={section.text}
            multiline
            required
            maxLength={20000}
            hint="Yeni bir paragraf için arada boş satır bırakın."
            onChange={(v) => update(index, "text", v)}
          />
          <div className="admin-support-actions">
            <button
              type="button"
              className="admin-button subtle"
              disabled={index === 0}
              onClick={() => move(index, -1)}
              aria-label={`${index + 1}. bölümü yukarı taşı`}
            >
              ↑ Yukarı
            </button>
            <button
              type="button"
              className="admin-button subtle"
              disabled={index === document.sections.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`${index + 1}. bölümü aşağı taşı`}
            >
              ↓ Aşağı
            </button>
            <button
              type="button"
              className="admin-text-button danger"
              disabled={document.sections.length === 1}
              onClick={() => {
                if (
                  confirm(
                    "Bu bölüm kaldırılsın mı? Kaydettiğinizde siteden kaldırılır.",
                  )
                )
                  change((d) => {
                    d.settings.support[page].sections.splice(index, 1);
                  });
              }}
            >
              Bölümü kaldır
            </button>
          </div>
        </EditorCard>
      ))}
      <button
        className="admin-button primary"
        type="button"
        disabled={document.sections.length >= 40}
        onClick={() =>
          change((d) => {
            d.settings.support[page].sections.push({
              id: `bilgi-${crypto.randomUUID()}`,
              title: "",
              text: "",
            });
          })
        }
      >
        + {page === "faq" ? "Soru ekle" : "Bölüm ekle"}
      </button>
      <EditorCard
        title="Resmî satıcı bilgileri"
        description="Yalnızca işletmenize ait doğrulanmış bilgileri girin. Doldurulan alanlar sözleşme, ön bilgilendirme ve iade sayfalarında görünür. Harita koordinatları iletişim sayfasında gösterilir; açık adres boş bırakılabilir."
      >
        {(
          [
            ["legalName", "Resmî unvan"],
            ["address", "Açık adres"],
            ["taxOffice", "Vergi dairesi"],
            ["taxNumber", "Vergi numarası"],
            ["mersisNumber", "MERSİS numarası"],
          ] as const
        ).map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={content.settings.merchant[key]}
            multiline={key === "address"}
            maxLength={key === "address" ? 2000 : 500}
            onChange={(v) =>
              change((d) => {
                d.settings.merchant[key] = v;
              })
            }
          />
        ))}
        <Field
          label="Harita konumu"
          value={content.settings.merchant.mapLabel}
          maxLength={240}
          hint="İletişim sayfasında görünür. Resmî açık adres doluysa o metin önceliklidir."
          onChange={(v) =>
            change((d) => {
              d.settings.merchant.mapLabel = v;
            })
          }
        />
        <Field
          label="Enlem"
          value={content.settings.merchant.mapLatitude}
          maxLength={24}
          inputMode="decimal"
          hint="Google Haritalar konumunun enlemi. İkisini de boş bırakırsanız harita gizlenir."
          onChange={(v) =>
            change((d) => {
              d.settings.merchant.mapLatitude = v;
            })
          }
        />
        <Field
          label="Boylam"
          value={content.settings.merchant.mapLongitude}
          maxLength={24}
          inputMode="decimal"
          onChange={(v) =>
            change((d) => {
              d.settings.merchant.mapLongitude = v;
            })
          }
        />
      </EditorCard>
    </div>
  );
}
