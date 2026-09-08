import { getSiteConfig } from "@/lib/content";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const siteConfig = (await getSiteConfig());
  return (await pageMetadata(
    "Aydınlatma Metni",
    "Kişisel veriler hakkında aydınlatma metni.",
    "/aydinlatma",
    !siteConfig.legal.disclosure.approved,
  ));
}
export default async function DisclosurePage() {
  const siteConfig = (await getSiteConfig());
  return (
    <LegalPage
      title="Aydınlatma Metni"
      document={siteConfig.legal.disclosure}
    />
  );
}
