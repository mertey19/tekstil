import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCategories } from "@/lib/content";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" className="footer-name">
            {siteConfig.name}
            <span>.</span>
          </Link>
          <p>{siteConfig.subtitle}</p>
          <p className="muted">
            Mikrofiber bez ve tekstil ürünlerini
            <br />
            kullanım alanlarına göre keşfedin.
          </p>
        </div>
        <div>
          <h2>Ürün grupları</h2>
          {getCategories().map((c) => (
            <Link key={c.id} href={`/kategori/${c.slug}`}>
              {c.shortName}
            </Link>
          ))}
        </div>
        <div>
          <h2>Keşfedin</h2>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/iletisim">İletişim</Link>
          <Link href="/teklif-al">Bilgi ve Teklif Al</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {siteConfig.name}
        </span>
        <div>
          <Link href="/gizlilik">Gizlilik</Link>
          <Link href="/aydinlatma">Aydınlatma Metni</Link>
        </div>
      </div>
    </footer>
  );
}
