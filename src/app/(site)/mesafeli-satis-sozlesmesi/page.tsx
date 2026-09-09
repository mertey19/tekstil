import { SupportPage, supportMetadata } from "@/components/support-page";

export const generateMetadata = () => supportMetadata("contract");
export default function Page() {
  return <SupportPage page="contract" />;
}
