import Link from "next/link";
import { siteConfig } from "@/config/site";
import { whatsappLink } from "@/lib/contact";
import { Breadcrumbs } from "@/components/catalog-ui";
import { Icon } from "@/components/icon";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "WhatsApp ile İletişim",
  "Mikrofiber Deposu ile ürün bilgisi ve teklif için WhatsApp üzerinden iletişime geçin.",
  "/iletisim",
);
export default function ContactPage() {
  const whatsapp = whatsappLink(siteConfig.whatsapp);
  return (
    <div className="container whatsapp-context">
      <Breadcrumbs items={[{ label: "İletişim" }]} />
      <div className="page-heading">
        <span className="eyebrow">WHATSAPP İLE İLETİŞİM</span>
        <h1>Bir mesajla başlayalım.</h1>
        <p>
          Ürünlerle ilgili sorularınızı ve teklif taleplerinizi WhatsApp
          üzerinden paylaşın.
        </p>
      </div>
      <div className="contact-layout">
        <section className="contact-information">
          <h2>Mikrofiber Deposu</h2>
          <p>{siteConfig.subtitle}</p>
          {whatsapp ? (
            <>
              <div className="contact-item whatsapp-contact">
                <Icon name="phone" />
                <div>
                  <h3>WhatsApp</h3>
                  <a className="whatsapp-link" href={whatsapp} rel="noopener noreferrer" target="_blank">
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
          <span className="eyebrow">ÜRÜN BİLGİSİ & TEKLİF</span>
          <h2>
            Aklınızdaki ürünü
            <br />
            bizimle paylaşın.
          </h2>
          <p>
            İlgilendiğiniz ürünü seçin, sorularınızı ve varsa tahmini adedi
            ekleyin. WhatsApp mesajınız hazır olsun.
          </p>
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
    </div>
  );
}
