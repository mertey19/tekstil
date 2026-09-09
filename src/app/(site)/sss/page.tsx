import { SupportPage, supportMetadata } from "@/components/support-page";

export const generateMetadata = () => supportMetadata("faq");
export default function Page() {
  return <SupportPage page="faq" />;
}
