import { SupportPage, supportMetadata } from "@/components/support-page";

export const generateMetadata = () => supportMetadata("cancellation");
export default function Page() {
  return <SupportPage page="cancellation" />;
}
