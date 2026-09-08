import { getSiteConfig } from "@/lib/content";
import { getProducts } from "@/lib/content";
import { normalizePhone } from "@/lib/contact";
import { Breadcrumbs } from "@/components/catalog-ui";
import { QuoteForm } from "@/components/quote-form";
import { currentCustomer } from "@/server/customer-auth";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  return (await pageMetadata(
    "WhatsApp ile Bilgi ve Teklif Al",
    "İlgilendiğiniz mikrofiber ürün için WhatsApp mesajınızı hazırlayın, bilgi ve teklif isteyin.",
    "/teklif-al",
    true,
  ));
}
import { getPageContent } from "@/lib/content";
import { CmsSections } from "@/components/cms-sections";
export const dynamic = "force-dynamic";
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string | string[] }>;
}) {
  const fields = (await getPageContent("quote")).fields;
  const customer = await currentCustomer();
  const params = await searchParams;
  const siteConfig = (await getSiteConfig());
  const products = (await getProducts());
  const product = products.find((p) => p.id === params.urun);
  return (
    <div className="container whatsapp-context">
      <Breadcrumbs items={[{ label: "Bilgi ve Teklif Al" }]} />
      <div className="page-heading">
        <span className="eyebrow">{fields.eyebrow}</span>
        <h1>{fields.title}</h1>
        <p>{fields.description}</p>
      </div>
      <div className="quote-layout">
        <aside className="quote-aside">
          <h2 className="preserve-lines">{fields.asideTitle}</h2>
          <p>{fields.asideText}</p>
          <ol>
            <li>
              <span>01</span>İlgilendiğiniz ürünü belirtin.
            </li>
            <li>
              <span>02</span>Mesajınızı hazırlayın.
            </li>
            <li>
              <span>03</span>WhatsApp’ta açıp gönderin.
            </li>
          </ol>
          <p className="muted">
            Ürün seçmeden de genel bir bilgi talebi oluşturabilirsiniz.
          </p>
        </aside>
        <QuoteForm
          profile={customer ? {name:customer.name, company:customer.company} : undefined}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          initialProduct={product?.id || ""}
          invalidProduct={!!params.urun && !product}
          available={!!normalizePhone(siteConfig.whatsapp)}
        />
      </div>
      <CmsSections page="quote" />
    </div>
  );
}
