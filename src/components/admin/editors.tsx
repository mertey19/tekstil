"use client";
import { useId, type InputHTMLAttributes } from "react";
import {
  pageDefinitions,
  pageKeys,
  specNames,
  slugify,
  type CmsContent,
  type PageKey,
  type MediaItem,
} from "@/lib/cms-model";
import { ImagePicker } from "./image-picker";

export type EditorProps = {
  content: CmsContent;
  change: (update: (draft: CmsContent) => void) => void;
  library: MediaItem[];
  onUpload: (item: MediaItem) => void;
  onBusy: (busy: boolean) => void;
};
export function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const id = useId();
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          maxLength={props.maxLength ?? 20000}
          placeholder={props.placeholder}
          required={props.required}
        />
      ) : (
        <input
          {...props}
          id={id}
          aria-describedby={hint ? `${id}-hint` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="admin-check">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
export function Status({
  value,
  onChange,
  category = false,
}: {
  value: "draft" | "published";
  onChange: (v: "draft" | "published") => void;
  category?: boolean;
}) {
  return (
    <label className="admin-field">
      <span>Yayın durumu</span>
      <select
        aria-label="Yayın durumu"
        value={value}
        onChange={(e) => onChange(e.target.value as "draft" | "published")}
      >
        <option value="draft">Taslak · sitede gizli</option>
        <option value="published">Yayında · sitede görünür</option>
      </select>
      {category && (
        <small>Taslak kategorinin ürünleri de sitede gizlenir.</small>
      )}
    </label>
  );
}
export function EditorCard({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <section className="admin-card">
      <h2>{title}</h2>
      {description && <p className="admin-muted">{description}</p>}
      <div className="admin-card-fields">{children}</div>
    </section>
  );
}
const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
export function ProductEditor({ id, ...props }: EditorProps & { id: string }) {
  const { content, change } = props;
  const index = content.products.findIndex((p) => p.id === id),
    product = content.products[index];
  if (!product) return null;
  const update = (key: keyof typeof product, value: unknown) =>
    change((d) => {
      Object.assign(d.products[index], { [key]: value });
    });
  return (
    <div className="admin-editor-stack">
      <EditorCard title="Ürün bilgileri">
        <Field
          label="Ürün adı"
          value={product.name}
          required
          maxLength={240}
          onChange={(v) => update("name", v)}
        />
        <div className="admin-form-grid">
          <Field
            label="Ürün adresi"
            value={product.slug}
            onChange={(v) => update("slug", v)}
            hint={`/urun/${product.slug}`}
          />
          <label className="admin-field">
            <span>Kategori</span>
            <select
              aria-label="Kategori"
              required
              value={product.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
            >
              <option value="">Kategori seçin</option>
              {content.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.status === "draft" ? " (taslak)" : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Field
          label="Kısa açıklama"
          value={product.summary}
          onChange={(v) => update("summary", v)}
          multiline
          maxLength={600}
          required
        />
        <Field
          label="Ürün açıklaması"
          value={product.description}
          onChange={(v) => update("description", v)}
          multiline
          required
        />
        <Field
          label="Kullanım alanları"
          value={product.useCases.join("\n")}
          onChange={(v) => update("useCases", v.split("\n"))}
          multiline
          hint="Her satıra bir kullanım alanı yazın."
        />
        <Status value={product.status} onChange={(v) => update("status", v)} />
        <Check
          label="Ana sayfada öne çıkar"
          value={product.featured}
          onChange={(v) => update("featured", v)}
        />
        <Check
          label="Demo katalog ürünü"
          value={product.isDemo}
          onChange={(v) => update("isDemo", v)}
        />
      </EditorCard>
      <EditorCard
        title="Ürün görselleri"
        description="İlk görsel ürünün kapak fotoğrafıdır. En fazla 8 görsel ekleyebilirsiniz."
      >
        {product.images.map((img, i) => (
          <div className="admin-repeat-item" key={i}>
            <div className="admin-repeat-heading">
              <strong>{i === 0 ? "Kapak görseli" : `Görsel ${i + 1}`}</strong>
              <div>
                {i > 0 && (
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() =>
                      change((d) => {
                        const images = d.products[index].images;
                        [images[i - 1], images[i]] = [images[i], images[i - 1]];
                      })
                    }
                  >
                    ↑ Öne al
                  </button>
                )}
                <button
                  type="button"
                  className="admin-text-button danger"
                  onClick={() =>
                    update(
                      "images",
                      product.images.filter((_, j) => i !== j),
                    )
                  }
                >
                  Kaldır
                </button>
              </div>
            </div>
            <ImagePicker
              {...props}
              value={img.src}
              label={`Ürün görseli ${i + 1}`}
              onChange={(src) =>
                change((d) => {
                  d.products[index].images[i].src = src;
                })
              }
            />
            <Field
              label={`Görsel ${i + 1} açıklaması`}
              value={img.alt}
              onChange={(v) =>
                change((d) => {
                  d.products[index].images[i].alt = v;
                })
              }
              hint="Fotoğrafta görülen ürünü kısa ve anlaşılır biçimde anlatın."
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-button subtle"
          disabled={product.images.length >= 8}
          onClick={() =>
            update("images", [
              ...product.images,
              { src: "", alt: product.name },
            ])
          }
        >
          + Görsel ekle
        </button>
      </EditorCard>
      <EditorCard
        title="Teknik bilgiler"
        description="Yalnızca doldurduğunuz bilgiler ürün sayfasında görünür."
      >
        <div className="admin-form-grid">
          {specNames.map((name) => (
            <Field
              key={name}
              label={name}
              value={product.specifications?.[name] || ""}
              onChange={(v) =>
                change((d) => {
                  d.products[index].specifications ??= {};
                  if (v) d.products[index].specifications![name] = v;
                  else delete d.products[index].specifications![name];
                })
              }
            />
          ))}
        </div>
      </EditorCard>
    </div>
  );
}
export function CategoryEditor({ id, ...props }: EditorProps & { id: string }) {
  const index = props.content.categories.findIndex((c) => c.id === id),
    category = props.content.categories[index];
  if (!category) return null;
  const update = (key: keyof typeof category, value: string) =>
    props.change((d) => {
      Object.assign(d.categories[index], { [key]: value });
    });
  return (
    <EditorCard title="Kategori bilgileri">
      <Field
        label="Kategori adı"
        value={category.name}
        onChange={(v) => update("name", v)}
        required
      />
      <div className="admin-form-grid">
        <Field
          label="Kısa ad"
          value={category.shortName}
          onChange={(v) => update("shortName", v)}
          required
        />
        <Field
          label="Kategori adresi"
          value={category.slug}
          onChange={(v) => update("slug", v)}
          hint={`/kategori/${category.slug}`}
        />
      </div>
      <Field
        label="Kategori açıklaması"
        value={category.description}
        onChange={(v) => update("description", v)}
        multiline
        required
      />
      <Field
        label="Kullanım alanı"
        value={category.useCase}
        onChange={(v) => update("useCase", v)}
        required
      />
      <ImagePicker
        {...props}
        label="Kategori görseli"
        value={category.image}
        onChange={(v) => update("image", v)}
      />
      <Status
        category
        value={category.status}
        onChange={(v) => update("status", v)}
      />
    </EditorCard>
  );
}
export function PostEditor({ id, ...props }: EditorProps & { id: string }) {
  const index = props.content.posts.findIndex((p) => p.id === id),
    post = props.content.posts[index];
  if (!post) return null;
  const update = (key: keyof typeof post, value: unknown) =>
    props.change((d) => {
      Object.assign(d.posts[index], { [key]: value });
    });
  return (
    <div className="admin-editor-stack">
      <EditorCard title="Blog yazısı">
        <Field
          label="Yazı başlığı"
          value={post.title}
          onChange={(v) => update("title", v)}
          required
        />
        <div className="admin-form-grid">
          <Field
            label="Yazı adresi"
            value={post.slug}
            onChange={(v) => update("slug", v)}
            hint={`/blog/${post.slug}`}
          />
          <Field
            label="Konu / kategori"
            value={post.category}
            onChange={(v) => update("category", v)}
            required
          />
        </div>
        <Field
          label="Kısa özet"
          value={post.excerpt}
          onChange={(v) => update("excerpt", v)}
          multiline
          maxLength={1000}
          required
        />
        <Field
          label="Giriş paragrafı"
          value={post.introduction}
          onChange={(v) => update("introduction", v)}
          multiline
          required
        />
        <div className="admin-form-grid">
          <Field
            label="Yazı tarihi"
            type="date"
            value={post.publishedAt}
            onChange={(v) => update("publishedAt", v)}
            required
          />
          <Status value={post.status} onChange={(v) => update("status", v)} />
        </div>
        <ImagePicker
          {...props}
          label="Blog kapak görseli"
          value={post.image.src}
          onChange={(v) => update("image", { ...post.image, src: v })}
        />
        <Field
          label="Kapak görseli açıklaması"
          value={post.image.alt}
          onChange={(v) => update("image", { ...post.image, alt: v })}
          required
        />
      </EditorCard>
      <EditorCard
        title="Yazı bölümleri"
        description="Bölümleri istediğiniz sıraya taşıyabilirsiniz. İçindekiler listesi otomatik oluşur."
      >
        {post.sections.map((section, i) => (
          <div className="admin-repeat-item" key={section.id}>
            <div className="admin-repeat-heading">
              <strong>Bölüm {i + 1}</strong>
              <div>
                {i > 0 && (
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() =>
                      props.change((d) => {
                        const sections = d.posts[index].sections;
                        [sections[i - 1], sections[i]] = [
                          sections[i],
                          sections[i - 1],
                        ];
                      })
                    }
                  >
                    ↑ Yukarı
                  </button>
                )}
                <button
                  className="admin-text-button danger"
                  type="button"
                  onClick={() => {
                    if (confirm("Bu yazı bölümünü kaldırmak istiyor musunuz?"))
                      update(
                        "sections",
                        post.sections.filter((_, j) => i !== j),
                      );
                  }}
                >
                  Kaldır
                </button>
              </div>
            </div>
            <Field
              label={`Bölüm ${i + 1} başlığı`}
              value={section.title}
              onChange={(v) =>
                props.change((d) => {
                  d.posts[index].sections[i].title = v;
                })
              }
              required
            />
            <Field
              label={`Bölüm ${i + 1} metni`}
              value={section.paragraphs.join("\n\n")}
              onChange={(v) =>
                props.change((d) => {
                  d.posts[index].sections[i].paragraphs = v.split("\n\n");
                })
              }
              multiline
              hint="Paragraflar arasında bir boş satır bırakın."
              required
            />
            <Field
              label={`Bölüm ${i + 1} maddeleri (isteğe bağlı)`}
              value={section.tips?.join("\n") || ""}
              onChange={(v) =>
                props.change((d) => {
                  d.posts[index].sections[i].tips = v.split("\n");
                })
              }
              multiline
              hint="Her satıra bir madde yazın."
            />
            <div className="admin-form-grid">
              <Field
                label={`Bölüm ${i + 1} kaynak adı`}
                value={section.source?.label || ""}
                onChange={(v) =>
                  props.change((d) => {
                    d.posts[index].sections[i].source = {
                      label: v,
                      url: section.source?.url || "",
                    };
                  })
                }
              />
              <Field
                label={`Bölüm ${i + 1} kaynak bağlantısı`}
                value={section.source?.url || ""}
                onChange={(v) =>
                  props.change((d) => {
                    d.posts[index].sections[i].source = {
                      label: section.source?.label || "",
                      url: v,
                    };
                  })
                }
                placeholder="https://…"
              />
            </div>
          </div>
        ))}
        <button
          className="admin-button subtle"
          type="button"
          disabled={post.sections.length >= 40}
          onClick={() =>
            update("sections", [
              ...post.sections,
              {
                id: `bolum-${crypto.randomUUID()}`,
                title: "",
                paragraphs: [""],
              },
            ])
          }
        >
          + Yazıya bölüm ekle
        </button>
      </EditorCard>
    </div>
  );
}
export function PagesEditor({
  page,
  setPage,
  ...props
}: EditorProps & { page: PageKey; setPage: (p: PageKey) => void }) {
  const content = props.content.pages[page];
  return (
    <div className="admin-editor-stack">
      <div className="admin-page-selector">
        <label className="admin-field">
          <span>Düzenlenecek alan</span>
          <select
            aria-label="Düzenlenecek alan"
            value={page}
            onChange={(e) => setPage(e.target.value as PageKey)}
          >
            {pageKeys.map((p) => (
              <option value={p} key={p}>
                {pageDefinitions[p].name}
              </option>
            ))}
          </select>
        </label>
        <a
          className="admin-button subtle"
          href={pageDefinitions[page].path}
          target="_blank"
          rel="noopener noreferrer"
        >
          Sayfayı aç ↗
        </a>
      </div>
      <EditorCard title={`${pageDefinitions[page].name} metinleri`}>
        <div className="admin-form-grid">
          {Object.entries(pageDefinitions[page].fields).map(
            ([key, definition]) => (
              <Field
                key={`${page}-${key}`}
                label={definition[0]}
                value={content.fields[key]}
                onChange={(v) =>
                  props.change((d) => {
                    d.pages[page].fields[key] = v;
                  })
                }
                multiline
                required
              />
            ),
          )}
        </div>
      </EditorCard>
      {page === "about" && (
        <EditorCard
          title="Firma tanıtımı"
          description="Bu bilgiler ana sayfadaki firma tanıtımında da kullanılır."
        >
          {(
            [
              ["title", "Firma tanıtım başlığı"],
              ["summary", "Ana sayfa özeti"],
              ["history", "Firma geçmişi"],
              ["description", "Firma açıklaması"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={props.content.settings.about[key]}
              onChange={(v) =>
                props.change((d) => {
                  d.settings.about[key] = v;
                })
              }
              multiline
              required
            />
          ))}
        </EditorCard>
      )}
      {page === "home" && (
        <EditorCard
          title="Ana sayfa kapak görseli"
          description="Hakkımızda sayfası da bu görseli kullanır."
        >
          <ImagePicker
            {...props}
            label="Ana sayfa görseli"
            value={props.content.settings.hero.src}
            onChange={(src) =>
              props.change((d) => {
                d.settings.hero.src = src;
              })
            }
          />
          <Field
            label="Ana görsel açıklaması"
            value={props.content.settings.hero.alt}
            onChange={(v) =>
              props.change((d) => {
                d.settings.hero.alt = v;
              })
            }
          />
          <Check
            label="Demo görsel olarak sınıflandır"
            value={props.content.settings.hero.isDemo}
            onChange={(v) =>
              props.change((d) => {
                d.settings.hero.isDemo = v;
              })
            }
          />
        </EditorCard>
      )}
      <EditorCard title="Sayfaya görsel ekleyin">
        <ImagePicker
          {...props}
          label="Ek sayfa görseli"
          optional
          value={content.image}
          onChange={(v) =>
            props.change((d) => {
              d.pages[page].image = v;
            })
          }
        />
        {content.image && (
          <Field
            label="Ek sayfa görseli açıklaması"
            value={content.imageAlt}
            onChange={(v) =>
              props.change((d) => {
                d.pages[page].imageAlt = v;
              })
            }
            required
          />
        )}
      </EditorCard>
      <EditorCard
        title="Ek bölümler"
        description="Bu alana eklediğiniz bölümler sayfanın alt kısmında sıralanır. Kaydetmeden önce yayın durumunu seçin."
      >
        {content.sections.map((section, i) => (
          <div key={section.id} className="admin-repeat-item">
            <div className="admin-repeat-heading">
              <strong>Bölüm {i + 1}</strong>
              <div>
                {i > 0 && (
                  <button
                    className="admin-text-button"
                    type="button"
                    onClick={() =>
                      props.change((d) => {
                        const sections = d.pages[page].sections;
                        [sections[i - 1], sections[i]] = [
                          sections[i],
                          sections[i - 1],
                        ];
                      })
                    }
                  >
                    ↑ Yukarı
                  </button>
                )}
                <button
                  type="button"
                  className="admin-text-button danger"
                  onClick={() => {
                    if (confirm("Bu bölümü kaldırmak istiyor musunuz?"))
                      props.change((d) => {
                        d.pages[page].sections.splice(i, 1);
                      });
                  }}
                >
                  Kaldır
                </button>
              </div>
            </div>
            <Field
              label={`Ek bölüm ${i + 1} başlığı`}
              value={section.title}
              onChange={(v) =>
                props.change((d) => {
                  d.pages[page].sections[i].title = v;
                })
              }
              required
            />
            <Field
              label={`Ek bölüm ${i + 1} açıklaması`}
              value={section.text}
              onChange={(v) =>
                props.change((d) => {
                  d.pages[page].sections[i].text = v;
                })
              }
              multiline
              required
            />
            <ImagePicker
              {...props}
              label={`Ek bölüm ${i + 1} görseli`}
              optional
              value={section.image}
              onChange={(src) =>
                props.change((d) => {
                  d.pages[page].sections[i].image = src;
                })
              }
            />
            {section.image && (
              <Field
                label={`Ek bölüm ${i + 1} görsel açıklaması`}
                value={section.imageAlt}
                onChange={(v) =>
                  props.change((d) => {
                    d.pages[page].sections[i].imageAlt = v;
                  })
                }
                required
              />
            )}
            <div className="admin-form-grid">
              <Field
                label={`Ek bölüm ${i + 1} buton metni`}
                value={section.buttonLabel}
                onChange={(v) =>
                  props.change((d) => {
                    d.pages[page].sections[i].buttonLabel = v;
                  })
                }
                placeholder="İsteğe bağlı"
              />
              <Field
                label={`Ek bölüm ${i + 1} buton bağlantısı`}
                value={section.buttonHref}
                onChange={(v) =>
                  props.change((d) => {
                    d.pages[page].sections[i].buttonHref = v;
                  })
                }
                placeholder="/urunler veya https://…"
              />
            </div>
            <Status
              value={section.status}
              onChange={(v) =>
                props.change((d) => {
                  d.pages[page].sections[i].status = v;
                })
              }
            />
          </div>
        ))}
        {!content.sections.length && (
          <p className="admin-empty-small">
            Henüz ek bölüm yok. Yeni bir başlık, metin ve görselle
            başlayabilirsiniz.
          </p>
        )}
        <button
          className="admin-button subtle"
          type="button"
          onClick={() =>
            props.change((d) => {
              d.pages[page].sections.push({
                id: `bolum-${crypto.randomUUID()}`,
                title: "",
                text: "",
                image: "",
                imageAlt: "",
                buttonLabel: "",
                buttonHref: "",
                status: "draft",
              });
            })
          }
        >
          + Sayfaya bölüm ekle
        </button>
      </EditorCard>
    </div>
  );
}
export function normalizeContent(input: CmsContent) {
  const content = structuredClone(input);
  content.products.forEach((p) => {
    p.useCases = lines(p.useCases.join("\n"));
    p.isPublished = p.status === "published" && !p.isDemo;
    if (!p.slug) p.slug = slugify(p.name);
  });
  content.categories.forEach((c) => {
    if (!c.slug) c.slug = slugify(c.name);
  });
  content.posts.forEach((p) => {
    if (!p.slug) p.slug = slugify(p.title);
    p.sections.forEach((s) => {
      s.paragraphs = s.paragraphs.map((v) => v.trim()).filter(Boolean);
      s.tips = s.tips?.map((v) => v.trim()).filter(Boolean);
      if (!s.source?.label && !s.source?.url) delete s.source;
    });
  });
  return content;
}
