import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata(
  "Aydınlatma Metni",
  "Kişisel veriler hakkında aydınlatma metni.",
  "/aydinlatma",
  !siteConfig.legal.disclosure.approved,
);
export default function DisclosurePage() {
  return (
    <LegalPage
      title="Aydınlatma Metni"
      document={siteConfig.legal.disclosure}
    />
  );
}
