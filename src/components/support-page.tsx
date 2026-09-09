import Link from "next/link";
import {
  consumerGuide,
  remedyGuide,
  supportDefinitions,
  supportKeys,
  type SupportKey,
} from "@/data/support";
import { getSiteConfig, getSupportPage } from "@/lib/content";
import { whatsappLink } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import { Icon } from "./icon";
import { SocialIcon } from "./social-icon";

export async function supportMetadata(page: SupportKey) {
  const content = await getSupportPage(page);
  return pageMetadata(
    content.title,
    content.intro,
    supportDefinitions[page].path,
  );
}

export async function SupportPage({ page }: { page: SupportKey }) {
  const [content, site] = await Promise.all([
    getSupportPage(page),
    getSiteConfig(),
  ]);
  const href = whatsappLink(site.whatsapp);
  const merchant = site.merchant;
  const merchantFields = [
    ["Resmî unvan", merchant.legalName],
    ["Adres", merchant.address],
    ["Vergi dairesi", merchant.taxOffice],
    ["Vergi numarası", merchant.taxNumber],
    ["MERSİS numarası", merchant.mersisNumber],
  ].filter(([, value]) => value);
  const isDocument = ["preinformation", "contract", "cancellation"].includes(
    page,
  );
  return (
    <div className="container support-page">
      <nav className="breadcrumbs" aria-label="Gezinme yolu">
        <ol>
          <li>
            <Link href="/">Ana sayfa</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{supportDefinitions[page].label}</li>
        </ol>
      </nav>
      <header className="support-heading">
        <span className="eyebrow">BİLGİLENDİRME & DESTEK</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </header>
      <div className="support-layout">
        <aside className="support-sidebar">
          <nav aria-label="Bilgilendirme sayfaları">
            <span className="support-nav-label">YARDIMCI BİLGİLER</span>
            {supportKeys.map((key) => (
              <Link
                key={key}
                href={supportDefinitions[key].path}
                aria-current={key === page ? "page" : undefined}
              >
                {supportDefinitions[key].label}
                <Icon name="chevron" size={15} />
              </Link>
            ))}
          </nav>
          {href && (
            <div className="support-contact">
              <SocialIcon name="whatsapp" size={29} />
              <h2>Birlikte netleştirelim.</h2>
              <p>Sorularınızı WhatsApp üzerinden bize yazabilirsiniz.</p>
              <a
                href={href}
                className="button whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp’tan yazın
                <Icon size={17} />
              </a>
            </div>
          )}
        </aside>
        <article
          className={`support-body ${page === "faq" ? "support-faq" : "support-document"}`}
          aria-label={supportDefinitions[page].label}
        >
          {page === "faq"
            ? content.sections.map((section, i) => (
                <details key={section.id} className="faq-item" open={i === 0}>
                  <summary>
                    <span>{section.title}</span>
                    <Icon name="chevron" size={18} />
                  </summary>
                  <div className="support-prose">
                    {section.text.split(/\n\s*\n/).map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  </div>
                </details>
              ))
            : content.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="support-section"
                >
                  <h2>{section.title}</h2>
                  <div className="support-prose">
                    {section.text.split(/\n\s*\n/).map((text, index) => (
                      <p key={index}>{text}</p>
                    ))}
                  </div>
                </section>
              ))}
          {isDocument && merchantFields.length > 0 && (
            <section className="support-section merchant-information">
              <h2>Satıcı bilgileri</h2>
              <dl>
                {merchantFields.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {isDocument && (
            <p className="support-source">
              İlgili resmî kaynaklar:{" "}
              <a
                href={consumerGuide.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {consumerGuide.label} ↗
              </a>
              {page === "contract" && (
                <>
                  <br />
                  <a
                    href={remedyGuide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {remedyGuide.label} ↗
                  </a>
                </>
              )}
            </p>
          )}
          <div className="support-related">
            <span>İlgili bilgiler</span>
            <div>
              {supportKeys
                .filter((key) => key !== page)
                .map((key) => (
                  <Link key={key} href={supportDefinitions[key].path}>
                    {supportDefinitions[key].label}
                    <Icon size={16} />
                  </Link>
                ))}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
