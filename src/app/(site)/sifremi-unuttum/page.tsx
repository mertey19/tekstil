import type { Metadata } from "next";
import { CustomerAuthPage } from "@/components/customer/auth-page";
export const metadata: Metadata = {
  title: "Şifremi Unuttum",
  robots: { index: false, follow: true },
};
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  return <CustomerAuthPage mode="recover" searchParams={searchParams} />;
}
