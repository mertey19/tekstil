# Mikrofiber Deposu

Next.js App Router, TypeScript strict ve Tailwind CSS ile geliştirilmiş Türkçe ürün kataloğu. Ana marka **Mikrofiber Deposu**, alt satır **Siliver Silen Temizlik Bezleri Dünyası** olarak korunmuştur.

**İletişim yalnızca WhatsApp üzerinden yapılır.** Kullanıcının verdiği numara: **+90 530 548 26 60**. E-posta, SMTP, e-posta sağlayıcısı, WhatsApp Business API veya ödeme entegrasyonu yoktur. Müşteri üyeliği kayıt, giriş ve profil içerir. WhatsApp bağlantısı hazırlamak için ücretli servis gerekmez. Son gönderim WhatsApp içinde kullanıcı tarafından yapılır.

## Kurulum ve çalıştırma

Node.js 24+ gerekir (yerelde SQLite, Vercel’de Neon Postgres); çalışma Node.js 24.18.0 ile doğrulandı. Paket yöneticisi npm; `package-lock.json` korunmalıdır.

```powershell
npm ci
# Yeni ortamda gerekirse: Copy-Item .env.example .env.local
npm run dev -- --hostname 127.0.0.1
```

Yerel adres: http://127.0.0.1:3000. Mevcut çalışma alanında `.env.local` oluşturulmuştur. Geliştirme sunucusu kod değişikliklerini otomatik yeniler. Panelden kaydedilen içerik değişiklikleri yeniden build gerektirmeden görünür. Ortam değişkeni değişikliklerinde sunucuyu yeniden başlatın; kod değişiklikleri için üretim build alın.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run start -- --hostname 127.0.0.1
```

Tarayıcı testleri üretim build'ini kullanır ve 3001 portunda geçici sunucu açıp kapatır:

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

`npm run check`: lint, typecheck, birim testleri ve build. Test sonuçları ve sınırlar `TEST_REPORT.md` içerisinde tutulur. Playwright HTML raporu `playwright-report/index.html`, ekran görüntüleri `artifacts/screenshots/` altında oluşur. Bunlar Git'e eklenmez.

Lighthouse mobil ölçümü için ayrı terminalde:

```powershell
npm run start -- --hostname 127.0.0.1 --port 3002
# Diğer terminal:
npm run test:performance
```

Ölçüm ana sayfa, araç kategorisi ve araç ürünü için HTML/JSON raporlarını `artifacts/lighthouse/` altına yazar. Farklı adres için `PERF_URL` ortam değişkeni kullanılabilir. Demo noindex durumunu SEO puanı yükseltmek için kapatmayın.

## Sayfalar ve akış

| Adres | İşlev |
| --- | --- |
| `/` | Tanıtım, kategoriler, öne çıkan ürünler, kullanım alanları ve iletişim |
| `/urunler` | Arama, kategori/kullanım filtresi, A–Z/Z–A sıralama, sayfalama |
| `/kategori/[slug]` | Aynı katalog bileşeniyle belirli kategori |
| `/urun/[slug]` | Görsel galerisi, mevcut özellikler, benzer ürünler, WhatsApp ve teklif |
| `/hakkimizda` | Yalnızca verilen işletme bilgileri |
| `/blog` | Üç kullanım ve bakım yazısının listesi |
| `/blog/[slug]` | Yazı, içindekiler, kaynak bağlantıları ve diğer rehberler |
| `/admin` | Giriş, içerik yönetimi, görsel yükleme ve site ayarları |
| `/iletisim` | WhatsApp numarası ve doğrudan sohbet bağlantısı |
| `/teklif-al?urun=...` | Ürün seçili WhatsApp mesajı hazırlama |
| `/gizlilik`, `/aydinlatma` | Onaylı içerik için altyapı; mevcut durumda eksik metin bildirimi |
| `/api/teklif` | POST: doğrulama ve WhatsApp bağlantısı hazırlama; mesaj göndermez |
| `/sitemap.xml`, `/robots.txt` | Ortama ve yayımlanmış gerçek içeriğe göre SEO |

Ürün listesinde `q`, `kategori`, `kullanim`, `siralama=az|za` ve `sayfa` sorgu parametreleri kullanılır. Geri/ileri ve yenileme bunları korur. Türkçe İ/ı ve aksan normalizasyonu uygulanır; `araç` ve `arac` aynı sonucu verir. Sayfa başına 9 ürün gösterilir. Verisi olmayan renk/ölçü ve fiyat/popülerlik filtreleri eklenmemiştir.

## Yönetici paneli

Panel `/admin` adresindedir. İlk hesabı oluşturmak için sunucuda `npm run admin:setup` çalıştırın. Komut, 24 saat geçerli ve tek kullanımlık bir kurulum bağlantısı üretir. Bağlantıyı açıp kullanıcı adınızı ve en az 12 karakterli şifrenizi belirleyin. Önceden tanımlanmış şifre veya herkese açık hesap açma yolu yoktur. İlk hesabın kurulmasından sonra normal giriş ekranı görünür.

- **Ürünler:** Ekleme, düzenleme, kaldırma, kategori, teknik bilgiler, kullanım alanları, öne çıkarma, taslak/yayın ve 8 fotoğrafa kadar galeri.
- **Kategoriler:** Ad, kısa ad, açıklama, kullanım alanı, görsel ve yayın durumu. Ürünü olan kategori doğrudan silinemez.
- **Blog:** Başlık, özet, tarih, kapak, giriş metni; sıralanabilir yazı bölümleri, maddeler ve kaynaklar.
- **Sayfalar:** Ana sayfa, hakkımızda, ürün listesi, blog, iletişim, teklif, alt bilgi ve iletişim bandındaki metinler. Her alana görsel ve sıralanabilir metin/görsel/buton bölümleri eklenebilir.
- **Görseller:** Bilgisayardan JPG, PNG veya WebP yükleme, önizleme ve ortak kütüphaneden tekrar kullanma. En fazla 8 MB/25 megapiksel dosya seçilebilir. 4 MB üzerindeki dosyalar tarayıcıda küçültülür; sunucu en fazla 4 MB kabul eder, gerçek dosya türünü kontrol edip metadata bilgisini kaldırarak en fazla 2400 px WebP üretir. SVG kabul edilmez; görseller tek kare olarak saklanır.
- **Ayarlar:** Firma adı, alt başlık, tüm butonlarda kullanılan WhatsApp numarası, yasal metinler ve şifre değiştirme.

İçerik değişiklikleri üstteki **Değişiklikleri kaydet** düğmesiyle kaydedilir. Taslak kayıtlar doğrudan adresleriyle de ziyaretçilere görünmez. Taslak kategorinin ürünleri gizlenir. Görsel yükleme dosyayı kütüphaneye hemen kaydeder; siteye eklemek için bir içerikte seçip içeriği de kaydedin. Başka sekmede daha yeni bir kayıt varsa panel eski verinin üzerine yazmaz; çalışmanızı kopyalayıp **Güncel içeriği yükle** ile tekrar düzenleyin.

### Kalıcı veri ve barındırma

**Vercel:** `DATABASE_URL` (veya öncelikli `CMS_DATABASE_URL`) varsa Neon Postgres kullanılır. İçerikler, yönetici hesabı, oturumlar ve optimize edilmiş görsel baytları aynı kalıcı veritabanında tutulur. Yeniden yayınlama ve sunucu değişimi verileri silmez. Vercel’de bağlantı yoksa uygulama geçici diske yazmayı reddeder.

**Yerel geliştirme:** Bağlantı adresi yoksa `data/cms.sqlite` kullanılır. `CMS_DATA_DIR` yazılabilir yerel disk dizini olmalıdır; `public/` altında olamaz. Yerel testler geçici ve ayrı SQLite veritabanlarında çalışır; canlı Neon veritabanını kullanmaz.

Yeni uzak veritabanında `DATABASE_URL` güvenli ortam değişkeni olarak tanımlandıktan sonra:

```powershell
npm run cms:migrate
npm run admin:setup
```

Migration mevcut içerikleri veya hesabı değiştirmez. Tablo oluşturma ziyaretçi isteklerinde çalışmaz. Vercel projesinde `SITE_URL` ve `ADMIN_ORIGIN` değerlerini panelin HTTPS kök adresine ayarlayın. Canlı bağlantıyı yalnızca Production ortamına ekleyin; Preview için ayrı veritabanı/Neon dalı kullanın. `vercel.json` Next.js preset’ini ve veritabanıyla aynı `iad1` bölgesini sabitler.

Şifreler scrypt ile özetlenir; 12 saatlik oturumlar HTTPS’te Secure/HttpOnly/SameSite=Strict çerez kullanır. Mutasyonlar oturum, Origin ve özel istek başlığıyla korunur. Kurulum, kayıt revizyonu ve deneme sınırları atomik veritabanı sorgularıyla korunur; birden fazla sunucu aynı durumu paylaşır.

Yerel yedek için uygulamayı durdurup veri dizininin tamamını kopyalayın. Neon yedekleri ve veri dışa aktarımı sağlayıcının konsolundan yönetilir. Paneldeki JSON indirme metinleri, ayarları ve görsel referanslarını içerir; hesapları veya görsel baytlarını içermez. Ortam dosyaları, veritabanları ve `.vercel/` dizini Git’e ve sunucu paketlerine dahil edilmez.

## Müşteri üyeliği

Üst menüdeki hesap simgesi `/giris` sayfasını açar. `/uye-ol` üzerinden kullanıcı adı, ad soyad, isteğe bağlı firma ve en az 12 karakterlik şifreyle kayıt olunur. `/hesabim` profil düzenleme, şifre değiştirme, çıkış ve hesabı silme işlemlerini içerir. Müşteri giriş yaptığında ad ve firma bilgileri WhatsApp teklif formuna otomatik gelir. Teklif istemek için üyelik zorunlu değildir.

E-posta adresi istenmez. Kayıtta bir defa gösterilen kurtarma kodu güvenli bir yerde saklanmalıdır. `/sifremi-unuttum` bu kodla şifreyi yeniler. Kod her kullanımda veya şifre değişiminde yenilenir; önceki kod ve tüm eski oturumlar geçersiz olur. Kod ve şifre birlikte kaybolursa otomatik kurtarma yapılamaz.

Şifreler scrypt ile özetlenir; rastgele kurtarma kodları ve oturum anahtarları veritabanında yalnızca özet olarak tutulur. Müşteri oturumu yönetici oturumundan ayrıdır; HTTPS ortamında Secure, HttpOnly, SameSite=Strict çerezi en fazla 7 gün geçerlidir. Değişiklik isteklerinde kaynak denetimi ve kalıcı deneme sınırları bulunur. Hesap verileri ve bunların kullanım açıklaması `/hesabim/veriler` sayfasındadır.

Yönetici panelinin **Müşteri üyelikleri** sekmesi müşterileri arama, görüntüleme, üyeliği duraklatma ve etkinleştirme sunar. Durum değişikliği açık müşteri oturumlarını kapatır. Kullanıcı hesabını kendi şifresiyle sildiğinde profil ve oturumları kaldırılır. Favori, sipariş veya ödeme bölümü yoktur.

Müşteriler ve oturumlar mevcut Neon/SQLite veritabanında saklanır. Yeni uzak ortamı devreye almadan önce `npm run cms:migrate` çalıştırılmalıdır; migration mevcut içerikleri ve hesapları korur. Ek servis veya ücretli üyelik sağlayıcısı kullanılmaz.

## Blog içeriklerini güncelleme

Blog içerikleri panelde **Blog yazıları** sekmesinden yönetilir. `src/data/blog.ts` yalnızca ilk kurulumun üç yazılık başlangıç verisidir. Yeni yazılar listenin başına, ana sayfadaki ilk üç yazıya ve indekslemeye izin verilen ortamda sitemap’e yansır. Yayınlanmış yazılar dinamik olarak sunulur; yeniden build gerekmez. Demo/önizleme `noindex` kuralı korunur.

## Ürün ve kategori güncelleme

Mevcut on bez çeşidinin her birine ayrı görsel atanmıştır. Görsel yolları ve alt metinleri `src/data/product-images.ts`, web için hazırlanmış dosyaları `public/images/products/` içindedir. Beş kategori kapağı kendi ürün grubundan seçilir. Tam üretim istemleri ve kaynak eşleştirmeleri için `ASSETS.md` dosyasına bakın.

Ürün ve kategorileri panelden yönetin. `src/data/catalog.ts` ilk kurulumun başlangıç verisidir; veritabanı oluştuktan sonra bu dosyayı değiştirmek kayıtlı içerikleri değiştirmez. Şema ve sınırlar `src/lib/cms-model.ts`, kayıt katmanı `src/server/cms-store.ts` içindedir. Bilinmeyen teknik alanlar boş bırakılabilir; yalnızca dolu bilgiler sitede gösterilir.

Canlı modda demo ve yayımlanmamış ürünler hem listeden hem doğrudan ürün adresinden çıkarılır. Gerçek ürün bulunmayan kategori sitemap'e girmez. Geçersiz ürün/kategori gerçek HTTP 404 verir. Galeriye ikinci görsel eklendiğinde küçük görsel kontrolleri otomatik açılır. Görsel hatasında tekrar yükleme döngüsü yerine sabit boyutlu fallback vardır.

## Firma ve ortam ayarları

Firma, WhatsApp, tanıtım görseli ve yasal metinler panelden yönetilir. `src/config/site.ts` ilk kurulumun varsayılanları ile URL, demo/önizleme ve faaliyet bayraklarını tutar. Renk/ölçü tasarım tokenları `src/app/globals.css` içindeki CSS değişkenleridir. Görsel kaynakları ve tam üretim istemleri `ASSETS.md` içerisindedir.

| Değişken | Açıklama |
| --- | --- |
| `SITE_MODE` | Varsayılan demo; Google indeksleme için Production’da `live` |
| `SITE_PREVIEW` | Varsayılan true; Google indeksleme için Production’da `false` |
| `SITE_WHATSAPP` | İlk kurulumda kaydedilecek numara; sonrasında paneldeki numara kullanılır |
| `DATABASE_URL` / `CMS_DATABASE_URL` | Neon Postgres bağlantısı; yalnızca sunucuda tutulur |
| `CMS_DATA_DIR` | Yerel SQLite dizini; boşsa `./data` |
| `ADMIN_ORIGIN` | Yönetici panelinin HTTPS kaynağı; boşsa `SITE_URL` |
| `SITE_URL` | Doğrulanmış HTTPS kök alan adı (Search Console ile aynı, örn. `https://www.siliversilen.com`). `*.vercel.app` yazmayın; bilinmiyorsa boş |
| `SITE_DOMAIN_VERIFIED` | Alan adı gerçekten doğrulandıktan sonra true |
| `CONTENT_APPROVED` | İşletme ve ürün içeriği onaylandıktan sonra true |
| `TRUSTED_CLIENT_IP_HEADER` | İsteğe bağlı; yalnızca bu başlığı üzerine yazan güvenilir proxy varsa |

SITE_URL boşken canonical veya ürün mesajına uydurma alan adı yazılmaz. Gerçek URL eklendiğinde WhatsApp mesajı ürün bağlantısını da içerir. Sosyal hesap, adres, harita ve başka iletişim kanalı üretilmez.

## Bilgilendirme ve üst şerit

`/sss`, `/siparis-ve-teslimat`, `/iptal-ve-iade`, `/on-bilgilendirme` ve `/mesafeli-satis-sozlesmesi` sayfaları panelin **Bilgilendirme** sekmesinden düzenlenir. Soru/bölüm ekleme, sıralama, kaldırma ve resmî satıcı bilgileri desteklenir. **Site ayarları** içindeki Facebook, Instagram ve LinkedIn alanlarına geçerli HTTPS hesap bağlantıları girildiğinde üst şeritte görünürler. WhatsApp ve numara bağlantısı mevcut WhatsApp hattını kullanır.

Yeni ayarlar eski CMS kayıtları okunurken varsayılanlarla tamamlanır; mevcut içerik veya hesaplar yeniden oluşturulmaz. İlk panel kaydında ayarlar mevcut içerikle birlikte kalıcı kaydedilir. Başlangıç metinleri `src/data/support.ts` içindedir. Bireysel tüketici ve ticari alım ayrımı açıklanır; sözleşme ve ön bilgilendirme sayfaları genel rehberdir, siparişe özel doldurulmuş belge veya kabul akışı değildir. Resmî unvan, adres ve vergi bilgileri doğrulanıp panelden girilmelidir. Tüketici bilgileri 9 Eylül 2026 tarihinde Ticaret Bakanlığının bağlantı verilen güncel rehberleriyle kontrol edildi.

## WhatsApp akışı ve veri işleme

Form ad soyad, isteğe bağlı firma/ürün/adet ve mesaj alır. İstemci ve sunucuda aynı Zod şeması kullanılır. Ürün kimliği sunucuda görünür katalogla tekrar doğrulanır. POST isteği yalnızca geçerli `wa.me` bağlantısı ve önizleme metni döndürür. Kullanıcı **WhatsApp’ta Aç** bağlantısıyla kendi WhatsApp uygulamasında gönderimi tamamlar. Site “mesaj gönderildi/okundu” iddiasında bulunmaz.

Sunucu WhatsApp'a ağ isteği yapmaz. Form verileri veritabanına, localStorage'a veya uygulama loglarına kaydedilmez. Barındırma sağlayıcısında istek gövdesi loglamasını etkinleştirmeyin. WhatsApp açıldığında bağlantıdaki mesaj metni WhatsApp'a aktarılır.

Honeypot, 16 KiB gövde sınırı, alan uzunluk/adet sınırları, JSON içerik türü, Origin ve Fetch Metadata kontrolü vardır. Yerel önizleme yalnızca eşleşen Host + loopback Origin ile çalışır. Canlı ortam yalnızca SITE_URL origin'ini kabul eder. Yardımcı istek sınırı **tek süreç belleğindedir**: 15 dakikada 60 istek (güvenilir IP başlığı yoksa ortak kota). Çok sunuculu dağıtımda genel güvence değildir; gerekirse barındırma katmanında rate limit ekleyin. Endpoint herhangi bir dış mesaj göndermediği için ayrıca mesajlaşma servisi/Redis kaynağı kurulmaz.

Numara yoksa/yanlışsa sahte bağlantı veya hazır mesaj sonucu verilmez. Yüklenme sırasında ikinci hazırlama engellenir. Alan düzenlenince eski hazırlanmış mesaj bağlantısı kaldırılır. Ağ, doğrulama, servis ve numara eksikliği durumları ayrı gösterilir. Otomatik testler gerçek kişiye WhatsApp mesajı göndermez.

## SEO ve yayın kontrolü

Demo/önizleme `noindex, follow` kullanır; robots sayfaları taramaya kapatmaz, böylece noindex okunabilir. Yerel demo, `localhost` ve `*.vercel.app` sitemap’i boş bırakır. Özel alan adında (`www.siliversilen.com`) `/sitemap.xml` yayımlanmış gerçek (demo olmayan) sayfa adreslerini listeler ve `robots.txt` `Sitemap:` satırını ekler. Google’ın sayfaları dizine eklemesi için Vercel **Production** ortamında şunlar gerekir: `SITE_MODE=live`, `SITE_PREVIEW=false`, `SITE_URL=https://www.siliversilen.com`. Filtreli aramalar noindex ve temel sayfaya canonical taşır. Gerçek indekslenebilir içerikte Organization, WebSite, BreadcrumbList ve doğrulanmış Product alanları üretilir. Fiyat, stok, yıldız veya yorum uydurulmaz. Gerçek ürün fotoğrafı sosyal paylaşım meta verisine bağlanır; alan adı yokken yerel/örnek URL metadata'ya yazılmaz.

```powershell
npm run validate:release
```

Bu kontrol demo modu, yanlış alan adı, WhatsApp eksikliği, gerçek ürün/görsel yokluğu, yayımlanmış demo kayıtları ve onaysız hukuki metinlerde hata koduyla durur. Mevcut durumda **beklendiği üzere başarısızdır**. `CONTENT_CHECKLIST.md` tamamlanmalı; onay bayrakları bunu atlatmak için kullanılmamalıdır. Katalog kullanıcının isteğiyle Vercel’de yayımlandı; demo/noindex ve içerik onayı denetimleri korunur.

## Mimari ve referanslar

İçerik ve sayfa gövdeleri Server Component; menü, filtre, görsel fallback/galeri ve form dar Client Component sınırlarında. Ortak bileşenler `src/components/` içinde. Mesaj hazırlama endpoint'i Node runtime kullanır; statik export yeterli değildir. Ağır animasyon veya ikon kütüphanesi yoktur. Azaltılmış hareket tercihi ve klavye odakları desteklenir.

Kurulum ve API yaklaşımı için [Next.js resmî kurulum belgesi](https://nextjs.org/docs/app/getting-started/installation) incelendi. [Kullanıcı referansı](https://www.kukuroglu.com.tr/arac-temizlik-bezleri) yalnızca kategori/alt kategori ve ürün gezinme yaklaşımı için incelendi; firma içeriği ve görselleri kullanılmadı.
