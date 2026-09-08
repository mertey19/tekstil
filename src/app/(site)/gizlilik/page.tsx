import { getSiteConfig } from "@/lib/content";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const siteConfig = (await getSiteConfig());
  return (await pageMetadata(
    "Gizlilik",
    "Gizlilik bilgilendirmesi.",
    "/gizlilik",
    !siteConfig.legal.privacy.approved,
  ));
}
export default async function PrivacyPage() {
  const siteConfig = (await getSiteConfig());
  return <LegalPage title="Gizlilik" document={siteConfig.legal.privacy} />;
}
