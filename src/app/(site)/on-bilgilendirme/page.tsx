import { SupportPage, supportMetadata } from "@/components/support-page";

export const generateMetadata = () => supportMetadata("preinformation");
export default function Page() {
  return <SupportPage page="preinformation" />;
}
