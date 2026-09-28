import Link from "next/link";
import { getSiteConfig } from "@/lib/content";
import { mapLocation, whatsappLink } from "@/lib/contact";
import { Breadcrumbs } from "@/components/catalog-ui";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  return (await pageMetadata(
    "WhatsApp ile İletişim",
    "Mikrofiber Deposu ile ürün bilgisi ve teklif için WhatsApp üzerinden iletişime geçin.",
    "/iletisim",
  ));
}
import { getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
export default async function ContactPage() {
  const fields = (await getPageContent("contact")).fields;
  const siteConfig = (await getSiteConfig());
  const whatsapp = whatsappLink(siteConfig.whatsapp);
  const map = mapLocation(siteConfig.merchant);
  const merchant = siteConfig.merchant;
  return (
    <div className="container whatsapp-context">
      <Breadcrumbs items={[{ label: "İletişim" }]} />
      <div className="page-heading">
        <span className="eyebrow">{fields.eyebrow}</span>
        <h1>{fields.title}</h1>
        <p>{fields.description}</p>
      </div>
      <div className="contact-layout">
        <section className="contact-information">
          <h2>{siteConfig.name}</h2>
          <p>{siteConfig.subtitle}</p>
          {(merchant.legalName || merchant.address) && (
            <dl className="contact-merchant">
              {[
                ["Resmî unvan", merchant.legalName],
                ["İşletme / marka", merchant.tradeName],
                ["Kayıtlı adres", merchant.address],
                ["Vergi dairesi", merchant.taxOffice],
                ["Vergi / T.C. kimlik no", merchant.taxNumber],
                ["MERSİS", merchant.mersisNumber],
              ].filter(([, value]) => value).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          )}
          {merchant.email && <div className="contact-item"><Icon name="mail" /><div><h3>E-posta</h3><a className="text-link" href={`mailto:${merchant.email}`}>{merchant.email}</a></div></div>}
          {merchant.kepAddress && <div className="contact-item"><Icon name="mail" /><div><h3>KEP adresi</h3><a className="text-link" href={`mailto:${merchant.kepAddress}`}>{merchant.kepAddress}</a></div></div>}
          {merchant.phone && <div className="contact-item"><Icon name="phone" /><div><h3>Telefon</h3><a className="text-link" href={`tel:${merchant.phone}`}>{merchant.phone}</a></div></div>}
          {whatsapp ? (
            <div className="contact-item whatsapp-contact">
              <Icon name="phone" />
              <div>
                <h3>WhatsApp</h3>
                <a
                  className="whatsapp-link"
                  href={whatsapp}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {siteConfig.whatsapp}
                </a>
              </div>
            </div>
          ) : (
            <div className="inline-notice">
              <strong>WhatsApp hattı hazırlanıyor.</strong>
              <p>
                Doğrulanmış WhatsApp iletişim numaramız eklendiğinde burada
                paylaşılacaktır. Şu anda mesaj gönderilemez.
              </p>
            </div>
          )}
          {map && (
            <div className="contact-item">
              <Icon name="pin" />
              <div>
                <h3>Konum</h3>
                {map.label ? <p>{map.label}</p> : null}
                <a
                  className="text-link"
                  href={map.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Google Haritalar’da aç
                  <Icon size={16} />
                </a>
              </div>
            </div>
          )}
          {whatsapp && (
            <a
              href={whatsapp}
              className="button whatsapp"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp’tan Yazın
              <Icon size={18} />
            </a>
          )}
        </section>
        <section className="contact-form-link">
          <span className="eyebrow">{fields.cardEyebrow}</span>
          <h2 className="preserve-lines">{fields.cardTitle}</h2>
          <p>{fields.cardDescription}</p>
          <Link className="button whatsapp" href="/teklif-al">
            WhatsApp Mesajı Hazırla
            <Icon size={18} />
          </Link>
          <Link className="text-link" href="/urunler">
            Önce Ürünleri İncele
            <Icon size={16} />
          </Link>
        </section>
      </div>
      {map && (
        <section className="contact-map" aria-label="Harita">
          <iframe
            title={`${siteConfig.name} konumu`}
            src={map.embed}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </section>
      )}
      <CmsSections page="contact" />
    </div>
  );
}
