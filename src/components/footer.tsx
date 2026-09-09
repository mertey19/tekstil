import Link from "next/link";
import { supportDefinitions, supportKeys } from "@/data/support";
import { getSiteConfig } from "@/lib/content";
import { mapLocation } from "@/lib/contact";
import { CmsSections } from "./cms-sections";
import { getPageContent, getCategories } from "@/lib/content";
export async function Footer() {
  const siteConfig = (await getSiteConfig());
  const fields = (await getPageContent("footer")).fields;
  const map = mapLocation(siteConfig.merchant);
  return (
    <footer className="site-footer">
      <div className="container footer-main footer-with-support">
        <div className="footer-brand">
          <Link href="/" className="footer-name">
            {siteConfig.name}
            <span>.</span>
          </Link>
          <p>{siteConfig.subtitle}</p>
          <p className="muted preserve-lines">{fields.description}</p>
          {map && (
            <a
              className="footer-map"
              href={map.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Haritada gör
            </a>
          )}
        </div>
        <div>
          <h2>Ürün grupları</h2>
          {(await getCategories()).map((c) => (
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
        <div>
          <h2>Bilgilendirme</h2>
          {supportKeys.map((key) => <Link key={key} href={supportDefinitions[key].path}>{supportDefinitions[key].label}</Link>)}
        </div>
      </div>
      <div className="container">
        <CmsSections page="footer" />
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
