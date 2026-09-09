import { SupportPage, supportMetadata } from "@/components/support-page";

export const generateMetadata = () => supportMetadata("order");
export default function Page() {
  return <SupportPage page="order" />;
}
