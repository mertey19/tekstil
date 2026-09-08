"use client";
/* eslint-disable @next/next/no-img-element -- Admin thumbnails display already optimized local assets. */
import { useEffect, useMemo, useState } from "react";
import { AdminCustomers } from "./customers";
import {
  contentSchema,
  type CmsContent,
  type CmsSnapshot,
  type MediaItem,
  type PageKey,
} from "@/lib/cms-model";
import {
  CategoryEditor,
  Check,
  EditorCard,
  Field,
  normalizeContent,
  PagesEditor,
  PostEditor,
  ProductEditor,
} from "./editors";
import { adminRequest, ImagePicker } from "./image-picker";

const tabs = [
  ["overview", "Genel bakış", "◫"],
  ["products", "Ürünler", "◇"],
  ["categories", "Kategoriler", "▦"],
  ["posts", "Blog yazıları", "▤"],
  ["pages", "Sayfa içerikleri", "▧"],
  ["media", "Görsel kütüphanesi", "▧"],
  ["settings", "Site ayarları", "⚙"],
  ["legal", "Yasal metinler", "§"],
  ["customers", "Müşteri üyelikleri", "♧"],
  ["account", "Hesabım", "○"],
] as const;
type Tab = (typeof tabs)[number][0];
type Collection = "products" | "categories" | "posts";
const collectionTab = (tab: Tab): tab is Collection =>
  ["products", "categories", "posts"].includes(tab);
const labels = { products: "Ürün", categories: "Kategori", posts: "Yazı" };

export function AdminPanel({
  username,
  initial,
  uploadedMedia,
}: {
  username: string;
  initial: CmsSnapshot;
  uploadedMedia: MediaItem[];
}) {
  const [saved, setSaved] = useState(initial);
  const [content, setContent] = useState(initial.content);
  const [media, setMedia] = useState(uploadedMedia);
  const [tab, setTab] = useState<Tab>("overview");
  const [selected, setSelected] = useState<Record<Collection, string>>({
    products: "",
    categories: "",
    posts: "",
  });
  const [page, setPage] = useState<PageKey>("home");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mediaSelection, setMediaSelection] = useState("");
  const dirty = JSON.stringify(content) !== JSON.stringify(saved.content);
  const change = (update: (d: CmsContent) => void) =>
    setContent((current) => {
      const next = structuredClone(current);
      update(next);
      return next;
    });
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const library = useMemo(() => {
    const items = new Map(media.map((m) => [m.src, m]));
    const add = (src: string, name: string) => {
      if (src && !items.has(src))
        items.set(src, {
          src,
          name,
          size: 0,
          width: 0,
          height: 0,
          createdAt: "",
        });
    };
    content.products.forEach((p) =>
      p.images.forEach((i) => add(i.src, p.name)),
    );
    content.categories.forEach((c) => add(c.image, c.name));
    content.posts.forEach((p) => add(p.image.src, p.title));
    add(content.settings.hero.src, "Ana sayfa kapağı");
    Object.values(content.pages).forEach((p) => {
      add(p.image, "Sayfa görseli");
      p.sections.forEach((s) => add(s.image, s.title));
    });
    return [...items.values()];
  }, [content, media]);
  const editorProps = {
    content,
    change,
    library,
    onUpload: (item: MediaItem) => setMedia((current) => [item, ...current]),
    onBusy: (uploading: boolean) =>
      setUploads((count) => count + (uploading ? 1 : -1)),
  };
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const normalized = normalizeContent(content),
      parsed = contentSchema.safeParse(normalized);
    if (!parsed.success) {
      const issue = parsed.error.issues[0],
        location = issue.path[0];
      if (
        location === "products" ||
        location === "categories" ||
        location === "posts"
      ) {
        setTab(location);
        const row = content[location][Number(issue.path[1])];
        if (row) setSelected((s) => ({ ...s, [location]: row.id }));
      }
      if (location === "pages") {
        setTab("pages");
        if (typeof issue.path[1] === "string")
          setPage(issue.path[1] as PageKey);
      }
      if (location === "settings") {
        setTab(
          issue.path[1] === "legal"
            ? "legal"
            : issue.path[1] === "hero" || issue.path[1] === "about"
              ? "pages"
              : "settings",
        );
        if (issue.path[1] === "hero") setPage("home");
        if (issue.path[1] === "about") setPage("about");
      }
      setError(`Lütfen alanları kontrol edin: ${issue.message}`);
      return;
    }
    setBusy(true);
    try {
      const next = await adminRequest<CmsSnapshot>("content", {
        method: "PUT",
        body: JSON.stringify({
          content: parsed.data,
          revision: saved.revision,
        }),
      });
      setSaved(next);
      setContent(next.content);
      setMessage(
        "Değişiklikler kaydedildi. Yayındaki içerikler sitede güncellendi.",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    if (
      dirty &&
      !confirm(
        "Kaydedilmemiş değişiklikler bırakılıp güncel içerik yüklensin mi?",
      )
    )
      return;
    setBusy(true);
    try {
      const result = await adminRequest<CmsSnapshot>("content");
      setContent(result.content);
      setSaved(result);
      setError("");
      setMessage("Güncel içerik yüklendi.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }
  function add(collection: Collection) {
    const id = `yeni-${crypto.randomUUID()}`;
    change((d) => {
      if (collection === "products")
        d.products.unshift({
          id,
          slug: "",
          name: "",
          categoryId: d.categories[0]?.id || "",
          summary: "",
          description: "",
          images: [{ src: "", alt: "" }],
          useCases: [""],
          isDemo: false,
          isPublished: false,
          featured: false,
          status: "draft",
        });
      if (collection === "categories")
        d.categories.push({
          id,
          slug: "",
          name: "",
          shortName: "",
          description: "",
          image: "",
          useCase: "",
          status: "draft",
        });
      if (collection === "posts")
        d.posts.unshift({
          id,
          slug: "",
          title: "",
          category: "",
          excerpt: "",
          publishedAt: new Date().toLocaleDateString("sv-SE"),
          image: { src: "", alt: "" },
          introduction: "",
          sections: [
            { id: `bolum-${crypto.randomUUID()}`, title: "", paragraphs: [""] },
          ],
          status: "draft",
        });
    });
    setSelected((s) => ({ ...s, [collection]: id }));
    setTab(collection);
    setSearch("");
    setMessage("");
  }
  function remove(collection: Collection, id: string) {
    if (
      collection === "categories" &&
      content.products.some((p) => p.categoryId === id)
    ) {
      setError(
        "Bu kategoride ürünler var. Önce ürünleri başka kategoriye taşıyın veya kaldırın.",
      );
      return;
    }
    if (
      !confirm(
        "Bu kaydı kaldırmak istiyor musunuz? Değişikliği kaydettiğinizde siteden kaldırılır.",
      )
    )
      return;
    change((d) => {
      d[collection].splice(
        d[collection].findIndex((p) => p.id === id),
        1,
      );
    });
    setSelected((s) => ({ ...s, [collection]: "" }));
  }
  async function logout() {
    if (
      dirty &&
      !confirm("Kaydedilmemiş değişiklikler var. Çıkış yapılsın mı?")
    )
      return;
    try {
      await adminRequest("logout", { method: "POST" });
      window.location.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çıkış yapılamadı.");
    }
  }
  function exportContent() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `tekstil-icerik-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  const changeTab = (next: Tab) => {
    setTab(next);
    setSearch("");
    setMessage("");
  };
  const selectedItem = collectionTab(tab)
    ? content[tab].find((r) => r.id === selected[tab])
    : undefined;
  const visibleItems = collectionTab(tab)
    ? content[tab].filter((p) =>
        ("name" in p ? p.name : p.title)
          .toLocaleLowerCase("tr")
          .includes(search.toLocaleLowerCase("tr")),
      )
    : [];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin">
          MD<span>İÇERİK YÖNETİMİ</span>
        </a>
        <span className="admin-sidebar-label">ÇALIŞMA ALANINIZ</span>
        <nav aria-label="Yönetim menüsü">
          {tabs.map(([key, name, icon]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "active" : ""}
              aria-current={tab === key ? "page" : undefined}
              disabled={busy || uploads > 0}
              onClick={() => changeTab(key)}
            >
              <span aria-hidden="true" className="admin-nav-icon">
                {icon}
              </span>
              {name}
              {collectionTab(key) && <small>{content[key].length}</small>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-avatar">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{username}</strong>
            <span>Yönetici hesabı</span>
          </div>
          <button
            type="button"
            aria-label="Çıkış yap"
            title="Çıkış yap"
            disabled={busy || uploads > 0}
            onClick={() => void logout()}
          >
            ↪
          </button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">SİTE YÖNETİMİ</span>
            <h1>{tabs.find(([key]) => key === tab)?.[1]}</h1>
          </div>
          <div className="admin-topbar-actions">
            <a
              className="admin-button subtle"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Siteyi görüntüle ↗
            </a>
            {tab !== "account" && tab !== "customers" && (
              <button
                className="admin-button primary"
                form="cms-editor"
                type="submit"
                disabled={busy || uploads > 0 || !dirty}
              >
                {busy
                  ? "Kaydediliyor…"
                  : uploads
                    ? "Görsel yükleniyor…"
                    : "Değişiklikleri kaydet"}
              </button>
            )}
          </div>
        </header>
        <main className="admin-main" id="main">
          <div className="admin-save-status">
            <span className={`admin-status-dot ${dirty ? "unsaved" : ""}`} />
            {dirty
              ? "Kaydedilmemiş değişiklikler var"
              : `Son kayıt: ${new Date(saved.updatedAt).toLocaleString("tr-TR")}`}
            <button
              type="button"
              className="admin-text-button"
              disabled={busy || uploads > 0}
              onClick={() => void reload()}
            >
              Güncel içeriği yükle
            </button>
          </div>
          {message && (
            <div className="admin-success" role="status">
              ✓ {message}
            </div>
          )}
          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}
          {tab === "account" ? (
            <AccountEditor username={username} onLogout={() => void logout()} />
          ) : tab === "customers" ? (
            <AdminCustomers />
          ) : (
            <form id="cms-editor" onSubmit={(e) => void save(e)} noValidate>
              <fieldset disabled={busy || uploads > 0}>
                {tab === "overview" && (
                  <>
                    <div className="admin-welcome">
                      <div>
                        <span className="admin-kicker">HER ŞEY BİR ARADA</span>
                        <h2>
                          Sitenize yeni bir
                          <br />
                          dokunuş ekleyin.
                        </h2>
                        <p>
                          Yeni ürünler, faydalı yazılar ve size ait görseller.
                          <br />
                          Sitenizi güncel tutmak için ihtiyacınız olan her şey
                          burada.
                        </p>
                        <button
                          type="button"
                          className="admin-button white"
                          onClick={() => add("products")}
                        >
                          + Yeni ürün ekle
                        </button>
                      </div>
                      <div className="admin-welcome-art" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <b>MD</b>
                      </div>
                    </div>
                    <div className="admin-stats">
                      {(
                        [
                          [
                            "products",
                            "Ürün",
                            content.products.length,
                            content.products.filter((p) => p.status === "draft")
                              .length,
                          ],
                          [
                            "categories",
                            "Kategori",
                            content.categories.length,
                            content.categories.filter(
                              (c) => c.status === "draft",
                            ).length,
                          ],
                          [
                            "posts",
                            "Blog yazısı",
                            content.posts.length,
                            content.posts.filter((p) => p.status === "draft")
                              .length,
                          ],
                          ["media", "Görsel", library.length, 0],
                        ] as const
                      ).map(([key, label, total, draft]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => changeTab(key)}
                        >
                          <span>
                            {label} <span>↗</span>
                          </span>
                          <strong>{total.toString().padStart(2, "0")}</strong>
                          <small>
                            {draft
                              ? `${draft} kayıt taslakta`
                              : "Yönetmek için açın"}
                          </small>
                        </button>
                      ))}
                    </div>
                    <div className="admin-overview-grid">
                      <EditorCard title="Nereden başlamak istersiniz?">
                        <div className="admin-shortcuts">
                          {(
                            [
                              [
                                "pages",
                                "Sayfanıza bölüm ekleyin",
                                "Ana sayfa, hakkımızda ve diğer tüm alanlar.",
                              ],
                              [
                                "posts",
                                "Yeni bir blog yazısı paylaşın",
                                "Kendi fotoğraflarınızla rehberler hazırlayın.",
                              ],
                              [
                                "media",
                                "Bilgisayarınızdan görsel yükleyin",
                                "Fotoğraflarınız tek bir kütüphanede toplansın.",
                              ],
                            ] as const
                          ).map(([key, title, text]) => (
                            <button
                              type="button"
                              key={key}
                              onClick={() => changeTab(key)}
                            >
                              <div>
                                <strong>{title}</strong>
                                <p>{text}</p>
                              </div>
                              <span>→</span>
                            </button>
                          ))}
                        </div>
                      </EditorCard>
                      <EditorCard title="Küçük bir hatırlatma">
                        <ol className="admin-guide">
                          <li>
                            <span>01</span>
                            <div>
                              <strong>İçeriğinizi hazırlayın</strong>
                              <p>
                                Metinleri girin, bilgisayarınızdan görsel seçin.
                              </p>
                            </div>
                          </li>
                          <li>
                            <span>02</span>
                            <div>
                              <strong>Yayın durumunu seçin</strong>
                              <p>Taslak içerikler yalnızca panelde görünür.</p>
                            </div>
                          </li>
                          <li>
                            <span>03</span>
                            <div>
                              <strong>Kaydedin ve kontrol edin</strong>
                              <p>
                                Kaydedilen değişiklikleri sitede görüntüleyin.
                              </p>
                            </div>
                          </li>
                        </ol>
                      </EditorCard>
                    </div>
                  </>
                )}
                {collectionTab(tab) && (
                  <div
                    className={`admin-collection ${selectedItem ? "has-selection" : ""}`}
                  >
                    <section className="admin-card admin-records">
                      <div className="admin-list-title">
                        <h2>{labels[tab]} listesi</h2>
                        <button
                          type="button"
                          className="admin-button primary"
                          onClick={() => add(tab)}
                        >
                          + {labels[tab]} ekle
                        </button>
                      </div>
                      <Field
                        label="Kayıtlarda ara"
                        value={search}
                        onChange={setSearch}
                        placeholder="İsim veya başlık yazın…"
                        type="search"
                      />
                      <div className="admin-record-list">
                        {visibleItems.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            aria-pressed={item.id === selected[tab]}
                            onClick={() =>
                              setSelected((s) => ({ ...s, [tab]: item.id }))
                            }
                          >
                            <img
                              src={
                                "images" in item
                                  ? item.images[0]?.src || "/images/hero.webp"
                                  : typeof item.image === "string"
                                    ? item.image || "/images/hero.webp"
                                    : item.image.src || "/images/hero.webp"
                              }
                              alt=""
                            />
                            <span>
                              <strong>
                                {("name" in item ? item.name : item.title) ||
                                  `Yeni ${labels[tab].toLocaleLowerCase("tr")}`}
                              </strong>
                              <small className={`admin-badge ${item.status}`}>
                                {item.status === "published"
                                  ? "Yayında"
                                  : "Taslak"}
                              </small>
                            </span>
                            <span aria-hidden="true">›</span>
                          </button>
                        ))}
                        {!visibleItems.length && (
                          <p className="admin-empty-small">
                            Kayıt bulunamadı. Yeni bir kayıt ekleyebilirsiniz.
                          </p>
                        )}
                      </div>
                    </section>
                    <div>
                      {selectedItem ? (
                        <>
                          <div className="admin-selected-heading">
                            <span>{labels[tab]} düzenleniyor</span>
                            <div>
                              {selectedItem.status === "published" && (
                                <a
                                  className="admin-text-button"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={`/${tab === "products" ? "urun" : tab === "categories" ? "kategori" : "blog"}/${selectedItem.slug}`}
                                >
                                  Sitede aç ↗
                                </a>
                              )}
                              <button
                                className="admin-text-button danger"
                                type="button"
                                onClick={() => remove(tab, selectedItem.id)}
                              >
                                Kaydı kaldır
                              </button>
                            </div>
                          </div>
                          {tab === "products" && (
                            <ProductEditor
                              {...editorProps}
                              id={selectedItem.id}
                            />
                          )}
                          {tab === "categories" && (
                            <CategoryEditor
                              {...editorProps}
                              id={selectedItem.id}
                            />
                          )}
                          {tab === "posts" && (
                            <PostEditor {...editorProps} id={selectedItem.id} />
                          )}
                        </>
                      ) : (
                        <div className="admin-selection-empty">
                          <span aria-hidden="true">↖</span>
                          <h2>Düzenlemek için bir kayıt seçin.</h2>
                          <p>
                            Mevcut içeriklerden başlayabilir veya yeni bir kayıt
                            ekleyebilirsiniz.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {tab === "pages" && (
                  <PagesEditor {...editorProps} page={page} setPage={setPage} />
                )}
                {tab === "media" && (
                  <>
                    <EditorCard
                      title="Yeni görsel yükleyin"
                      description="Yüklenen görseller kütüphaneye hemen kaydedilir. Sitede görünmesi için ilgili ürün, yazı veya sayfada seçip içeriği kaydedin."
                    >
                      <ImagePicker
                        {...editorProps}
                        label="Kütüphane görseli"
                        value={mediaSelection}
                        onChange={setMediaSelection}
                      />
                    </EditorCard>
                    <section className="admin-card admin-media-card">
                      <h2>
                        Tüm görseller{" "}
                        <span className="admin-count">{library.length}</span>
                      </h2>
                      <div className="admin-media-grid">
                        {library.map((item) => (
                          <a
                            href={item.src}
                            key={item.src}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={item.src}
                              alt={item.name}
                              loading="lazy"
                            />
                            <strong>{item.name}</strong>
                            <span>
                              {item.width
                                ? `${item.width} × ${item.height} · ${Math.ceil(item.size / 1024)} KB`
                                : "Site görseli"}
                            </span>
                          </a>
                        ))}
                      </div>
                    </section>
                  </>
                )}
                {tab === "settings" && (
                  <EditorCard
                    title="Firma ve iletişim bilgileri"
                    description="Bu bilgiler üst menü, alt bilgi ve WhatsApp bağlantılarında kullanılır."
                  >
                    <Field
                      label="Firma kısa adı"
                      value={content.settings.name}
                      onChange={(v) =>
                        change((d) => {
                          d.settings.name = v;
                        })
                      }
                      required
                    />
                    <Field
                      label="Firma tam adı"
                      value={content.settings.fullName}
                      onChange={(v) =>
                        change((d) => {
                          d.settings.fullName = v;
                        })
                      }
                      required
                    />
                    <Field
                      label="Alt başlık"
                      value={content.settings.subtitle}
                      onChange={(v) =>
                        change((d) => {
                          d.settings.subtitle = v;
                        })
                      }
                      required
                    />
                    <Field
                      label="WhatsApp numarası"
                      value={content.settings.whatsapp}
                      onChange={(v) =>
                        change((d) => {
                          d.settings.whatsapp = v.replace(/[\s()-]/g, "");
                        })
                      }
                      hint="Ülke koduyla yazın. Örnek: +905305482660. Tüm WhatsApp butonları bu numaraya bağlanır."
                      type="tel"
                      required
                    />
                  </EditorCard>
                )}
                {tab === "legal" && (
                  <div className="admin-editor-stack">
                    {(
                      [
                        ["privacy", "Gizlilik metni"],
                        ["disclosure", "Aydınlatma metni"],
                      ] as const
                    ).map(([key, title]) => (
                      <EditorCard key={key} title={title}>
                        <Field
                          label={title}
                          value={content.settings.legal[key].text}
                          onChange={(v) =>
                            change((d) => {
                              d.settings.legal[key].text = v;
                            })
                          }
                          multiline
                          maxLength={80000}
                        />
                        <Check
                          label="Metni kontrol ettim, sitede yayımla"
                          value={content.settings.legal[key].approved}
                          onChange={(v) =>
                            change((d) => {
                              d.settings.legal[key].approved = v;
                            })
                          }
                        />
                      </EditorCard>
                    ))}
                  </div>
                )}
              </fieldset>
            </form>
          )}
          <footer className="admin-bottom-note">
            <span>Mikrofiber Deposu · İçerik yönetimi</span>
            <button
              type="button"
              className="admin-text-button"
              onClick={exportContent}
            >
              İçerikleri JSON olarak indir
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
function AccountEditor({
  username,
  onLogout,
}: {
  username: string;
  onLogout: () => void;
}) {
  const [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        if (password !== confirmPassword) {
          setError("Yeni şifreler eşleşmiyor.");
          return;
        }
        setBusy(true);
        try {
          await adminRequest("password", {
            method: "POST",
            body: JSON.stringify({ current, password }),
          });
          setCurrent("");
          setPassword("");
          setConfirmPassword("");
          setMessage("Şifreniz değiştirildi. Diğer oturumlar kapatıldı.");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Şifre değiştirilemedi.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <EditorCard
          title="Şifrenizi değiştirin"
          description={`Kullanıcı adı: ${username}`}
        >
          <Field
            label="Mevcut şifre"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={setCurrent}
            required
          />
          <Field
            label="Yeni şifre"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            value={password}
            onChange={setPassword}
            required
            hint="En az 12 karakter kullanın."
          />
          <Field
            label="Yeni şifre tekrar"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />
          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="admin-success" role="status">
              {message}
            </p>
          )}
          <button className="admin-button primary" type="submit">
            {busy ? "Güncelleniyor…" : "Şifreyi güncelle"}
          </button>{" "}
          <button
            className="admin-button subtle"
            type="button"
            onClick={onLogout}
          >
            Oturumu kapat
          </button>
        </EditorCard>
      </fieldset>
    </form>
  );
}
