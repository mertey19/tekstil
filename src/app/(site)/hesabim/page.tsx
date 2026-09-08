import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customer-auth";
import {
  CustomerLogout,
  ProfileForm,
} from "@/components/customer/profile-form";

export const metadata: Metadata = {
  title: "Müşteri Hesabım",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const customer = await currentCustomer();
  if (!customer) redirect("/giris?devam=%2Fhesabim");
  return (
    <div className="container customer-account">
      <header className="customer-account-heading">
        <div>
          <span className="eyebrow">MÜŞTERİ HESABIM</span>
          <h1>Merhaba, {customer.name}.</h1>
          <p>Profil bilgilerinizi ve şifrenizi buradan düzenleyebilirsiniz.</p>
        </div>
        <CustomerLogout />
      </header>
      <ProfileForm customer={customer} />
      <p className="customer-help customer-data-link">
        <Link href="/hesabim/veriler">Üyelik verileri hakkında</Link>
      </p>
    </div>
  );
}
