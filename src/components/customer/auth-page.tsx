import { redirect } from "next/navigation";
import Link from "next/link";
import { currentCustomer } from "@/server/customer-auth";
import { customerReturnPath } from "@/lib/customer-model";
import { CustomerAuthForm } from "./auth-form";

export async function CustomerAuthPage({
  mode,
  searchParams,
}: {
  mode: "login" | "register" | "recover";
  searchParams: Promise<{ devam?: string }>;
}) {
  const returnPath = customerReturnPath((await searchParams).devam);
  if (mode !== "recover" && (await currentCustomer())) redirect(returnPath);
  return (
    <div className="container customer-auth-layout">
      <aside className="customer-auth-story">
        <span className="eyebrow">MİKROFİBER DEPOSU · ÜYELİK</span>
        <h2>
          Tanışalım,
          <br />
          <em>iletişimde kalalım.</em>
        </h2>
        <p>
          Hesabınızı oluşturun, bilgilerinizi kolayca güncelleyin ve teklif
          talebinizi hazırlayın.
        </p>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Size özel bir profil</strong>
              <p>Adınızı ve firma bilginizi tek yerden düzenleyin.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Talebinizi kolayca hazırlayın</strong>
              <p>Profil bilgileriniz teklif formuna otomatik gelsin.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>WhatsApp’tan görüşelim</strong>
              <p>Ürün bilgisi ve teklif için bize yazın.</p>
            </div>
          </li>
        </ol>
        <Link href="/urunler" className="customer-text-link">
          Ürünleri keşfet →
        </Link>
      </aside>
      <section className="customer-auth-card">
        <CustomerAuthForm mode={mode} returnPath={returnPath} />
      </section>
    </div>
  );
}
