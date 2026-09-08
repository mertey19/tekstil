import { Breadcrumbs } from "./catalog-ui";
export function LegalPage({
  title,
  document,
}: {
  title: string;
  document: { approved: boolean; text: string | null };
}) {
  return (
    <div className="container legal-page">
      <Breadcrumbs items={[{ label: title }]} />
      <div className="page-heading">
        <span className="eyebrow">BİLGİLENDİRME</span>
        <h1>{title}</h1>
      </div>
      {document.approved && document.text ? (
        <div className="legal-text">{document.text}</div>
      ) : (
        <div className="inline-notice">
          <strong>Bu metin henüz yayıma hazır değil.</strong>
          <p>
            Firma tarafından onaylanmış metin eklendiğinde burada
            paylaşılacaktır. Bu sayfa onaylı veya eksiksiz bir hukuki metin
            içermez.
          </p>
        </div>
      )}
    </div>
  );
}
