"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Icon } from "./icon";
export function Header({
  name,
  subtitle,
  demo,
}: {
  name: string;
  subtitle: string;
  demo: boolean;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const links = [
    ["/", "Ana Sayfa"],
    ["/urunler", "Ürünler"],
    ["/hakkimizda", "Hakkımızda"],
    ["/blog", "Blog"],
    ["/iletisim", "İletişim"],
  ];
  const close = () => {
    setOpen(false);
    toggle.current?.focus();
  };
  return (
    <>
      {demo && (
        <div className="preview-notice">
          <span className="preview-dot" />
          Önizleme kataloğu{" "}
          <span className="notice-detail">
            — Ürünler ve görseller temsilîdir.
          </span>
        </div>
      )}
      <header
        className="site-header"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) close();
        }}
      >
        <div className="container header-inner">
          <Link
            href="/"
            className="brand"
            onClick={() => setOpen(false)}
            aria-label={`${name} — Ana sayfa`}
          >
            <span className="brand-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <strong>{name}</strong>
              <small>{subtitle}</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Ana menü">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : href === "/blog" && pathname.startsWith("/blog/") ? "location" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link
              className="search-shortcut"
              href="/urunler#arama"
              aria-label="Ürün ara"
            >
              <Icon name="search" />
            </Link>
            <Link href="/teklif-al" className="button primary header-quote">
              Teklif Al <Icon size={17} />
            </Link>
            <button
              ref={toggle}
              className="icon-button menu-toggle"
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(!open)}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </div>
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobil menü"
          hidden={!open}
        >
          {links.concat([["/teklif-al", "Teklif Al"]]).map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : href === "/blog" && pathname.startsWith("/blog/") ? "location" : undefined}
            >
              {label}
              <Icon size={16} />
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
