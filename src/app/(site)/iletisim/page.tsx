import Link from "next/link";
import { getSiteConfig } from "@/lib/content";
import { whatsappLink } from "@/lib/contact";
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
          {whatsapp ? (
            <>
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
              <a
                href={whatsapp}
                className="button whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp’tan Yazın
                <Icon size={18} />
              </a>
            </>
          ) : (
            <div className="inline-notice">
              <strong>WhatsApp hattı hazırlanıyor.</strong>
              <p>
                Doğrulanmış WhatsApp iletişim numaramız eklendiğinde burada
                paylaşılacaktır. Şu anda mesaj gönderilemez.
              </p>
            </div>
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
      <CmsSections page="contact" />
    </div>
  );
}
