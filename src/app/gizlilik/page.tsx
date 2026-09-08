import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Gizlilik",
  "Gizlilik bilgilendirmesi.",
  "/gizlilik",
  !siteConfig.legal.privacy.approved,
);
export default function PrivacyPage() {
  return <LegalPage title="Gizlilik" document={siteConfig.legal.privacy} />;
}
