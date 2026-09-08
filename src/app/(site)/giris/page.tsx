import type { Metadata } from "next";
import { CustomerAuthPage } from "@/components/customer/auth-page";
export const metadata: Metadata = {
  title: "Müşteri Girişi",
  robots: { index: false, follow: true },
};
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  return <CustomerAuthPage mode="login" searchParams={searchParams} />;
}
