import { siteConfig } from "@/config/site";
import { getProducts } from "@/lib/content";
import { normalizePhone } from "@/lib/contact";
import { Breadcrumbs } from "@/components/catalog-ui";
import { QuoteForm } from "@/components/quote-form";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "WhatsApp ile Bilgi ve Teklif Al",
  "İlgilendiğiniz mikrofiber ürün için WhatsApp mesajınızı hazırlayın, bilgi ve teklif isteyin.",
  "/teklif-al",
  true,
);
export const dynamic = "force-dynamic";
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ urun?: string | string[] }>;
}) {
  const params = await searchParams;
  const products = getProducts();
  const product = products.find((p) => p.id === params.urun);
  return (
    <div className="container whatsapp-context">
      <Breadcrumbs items={[{ label: "Bilgi ve Teklif Al" }]} />
      <div className="page-heading">
        <span className="eyebrow">WHATSAPP İLE İLETİŞİM</span>
        <h1>İhtiyacınızı WhatsApp’tan paylaşın.</h1>
        <p>
          Ürün bilgisi ve teklif için mesajınızı hazırlayın. Gönderimi WhatsApp
          üzerinden tamamlayın.
        </p>
      </div>
      <div className="quote-layout">
        <aside className="quote-aside">
          <h2>
            Doğru ürünü bulmanın <br />
            ilk adımı.
          </h2>
          <p>
            Ürününüzü seçin, sorularınızı yazın. İletişimimiz WhatsApp üzerinden
            devam etsin.
          </p>
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
          products={products.map((p) => ({ id: p.id, name: p.name }))}
          initialProduct={product?.id || ""}
          invalidProduct={!!params.urun && !product}
          demo={siteConfig.demo}
          available={!!normalizePhone(siteConfig.whatsapp)}
        />
      </div>
    </div>
  );
}
