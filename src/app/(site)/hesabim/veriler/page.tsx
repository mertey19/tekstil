import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Üyelik Verileri",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <article className="container customer-data">
      <span className="eyebrow">MÜŞTERİ ÜYELİĞİ</span>
      <h1>Hesabınızda hangi bilgiler tutulur?</h1>
      <p>
        Kullanıcı adınız, ad soyadınız, isteğe bağlı firma adınız hesabınızda
        saklanır. Adınız ve firma bilginiz, giriş yaptığınızda teklif formuna
        otomatik eklenir.
      </p>
      <h2>Giriş ve kurtarma</h2>
      <p>
        Şifrenizin ve kurtarma kodunuzun yalnızca güvenli özeti saklanır. Giriş
        oturumu için en fazla 7 gün geçerli bir çerez kullanılır. Şifre
        değişikliğinde diğer oturumlar geçersiz olur. Hesap kötüye kullanımını
        sınırlamak için giriş denemeleri sayılır.
      </p>
      <h2>Kontrol sizde</h2>
      <p>
        Profil bilgilerinizi düzenleyebilir veya profil sayfasından hesabınızı
        silebilirsiniz. Hesap silindiğinde profil ve oturumlar kaldırılır. Site
        yöneticisi üyelik bilgilerini görüntüleyebilir ve üyeliği
        duraklatabilir.
      </p>
      <h2>WhatsApp iletişimi</h2>
      <p>
        Üyelik e-posta adresi istemez. Teklif mesajını WhatsApp’ta siz
        gönderirsiniz; site WhatsApp konuşmalarınızı ve mesajların teslim
        durumunu takip etmez. WhatsApp’a gönderilmiş mesajlar site hesabını
        silmekle kaldırılmaz.
      </p>
      <Link className="button secondary" href="/hesabim">
        Hesabıma dön
      </Link>
    </article>
  );
}
