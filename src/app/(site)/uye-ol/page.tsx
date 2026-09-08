import type { Metadata } from "next";
import { CustomerAuthPage } from "@/components/customer/auth-page";
export const metadata: Metadata = {
  title: "Müşteri Üyeliği",
  robots: { index: false, follow: true },
};
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ devam?: string }>;
}) {
  return <CustomerAuthPage mode="register" searchParams={searchParams} />;
}
