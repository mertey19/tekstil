"use client";
import Link from "next/link";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/catalog";
import { Icon } from "./icon";

export function CategoryNavigation({
  categories,
  selected,
  onSelect,
}: {
  categories: (Category & { count: number })[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <fieldset className="category-navigation">
      <legend>Kategoriler</legend>
      {[
        {
          slug: "",
          shortName: "Tüm ürünler",
          count: categories.reduce((n, c) => n + c.count, 0),
        },
        ...categories,
      ].map((c) => (
        <label key={c.slug} className={selected === c.slug ? "selected" : ""}>
          <input
            type="radio"
            name="category"
            value={c.slug}
            checked={selected === c.slug}
            onChange={() => onSelect(c.slug)}
          />
          <span>{c.shortName}</span>
          <small>{c.count}</small>
        </label>
      ))}
    </fieldset>
  );
}
export function ProductFilters({
  categories,
  useCases,
  fixedCategory,
}: {
  categories: (Category & { count: number })[];
  useCases: string[];
  fixedCategory?: string;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useOptimistic(
    fixedCategory || params.get("kategori") || "",
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.delete("sayfa");
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "kategori" && fixedCategory) {
      router.push(`/urunler?${next.toString()}`, { scroll: false });
      return;
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return (
    <aside
      className="catalog-sidebar"
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        className="button secondary filter-toggle"
        aria-controls="filter-panel"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name="filter" />
        {open ? "Filtreleri Kapat" : "Filtreleri Aç"}
        <Icon name={open ? "close" : "chevron"} size={17} />
      </button>
      <div
        id="filter-panel"
        className={`filter-panel ${open ? "is-open" : ""}`}
      >
        <div aria-busy={isPending}>
          <CategoryNavigation
            categories={categories}
            selected={selected}
            onSelect={(value) =>
              startTransition(() => {
                setSelected(value);
                update("kategori", value);
              })
            }
          />
        </div>
        {useCases.length > 0 && (
          <div className="usage-filter">
            <label htmlFor="usage">Kullanım alanı</label>
            <select
              id="usage"
              value={params.get("kullanim") || ""}
              onChange={(e) => update("kullanim", e.target.value)}
            >
              <option value="">Tüm kullanım alanları</option>
              {useCases.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
        <div className="sidebar-help">
          <span className="eyebrow">KARAR VEREMEDİNİZ Mİ?</span>
          <h2>
            İhtiyacınızı
            <br />
            birlikte netleştirelim.
          </h2>
          <Link className="text-link" href="/teklif-al">
            Bilgi Al
            <Icon size={16} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
export function CatalogToolbar({ total }: { total: number }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const submit = (form: HTMLFormElement) => {
    const next = new URLSearchParams(params);
    const q = String(new FormData(form).get("q") || "").trim();
    if (q) next.set("q", q);
    else next.delete("q");
    next.delete("sayfa");
    router.push(`${pathname}?${next}`, { scroll: false });
  };
  return (
    <>
      <form
        className="catalog-search"
        role="search"
        action={pathname}
        onSubmit={(e) => {
          e.preventDefault();
          submit(e.currentTarget);
        }}
      >
        <Icon name="search" size={20} />
        <label className="sr-only" htmlFor="arama">
          Ürün ara
        </label>
        <input
          key={params.get("q") || ""}
          id="arama"
          name="q"
          type="search"
          maxLength={100}
          defaultValue={params.get("q") || ""}
          placeholder="Ürün adı veya kullanım alanı arayın..."
        />
        {["kategori", "kullanim", "siralama"].map(
          (key) =>
            params.get(key) && (
              <input
                key={key}
                type="hidden"
                name={key}
                value={params.get(key)!}
              />
            ),
        )}
        <button type="submit" className="search-submit">
          Ara
          <Icon size={16} />
        </button>
      </form>
      <div className="catalog-toolbar">
        <p aria-live="polite">
          <strong>{total}</strong> ürün bulundu
        </p>
        <div>
          <label htmlFor="sort">Sırala:</label>
          <select
            id="sort"
            value={params.get("siralama") === "za" ? "za" : "az"}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              next.set("siralama", e.target.value);
              next.delete("sayfa");
              router.push(`${pathname}?${next}`, { scroll: false });
            }}
          >
            <option value="az">Ürün adı A–Z</option>
            <option value="za">Ürün adı Z–A</option>
          </select>
        </div>
      </div>
    </>
  );
}
