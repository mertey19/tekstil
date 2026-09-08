import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() {
  return (
    <div className="container not-found">
      <span className="eyebrow">404 · SAYFA BULUNAMADI</span>
      <h1>Bu sayfa burada değil.</h1>
      <p>
        Bağlantı değişmiş olabilir. Aradığınız ürünü katalogdan bulabilirsiniz.
      </p>
      <Link className="button primary" href="/urunler">
        Ürünlere Dön
        <Icon size={18} />
      </Link>
    </div>
  );
}
