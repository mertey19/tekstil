# Mikrofiber Deposu

Next.js App Router, TypeScript strict ve Tailwind CSS ile geliştirilmiş Türkçe ürün kataloğu. Ana marka **Mikrofiber Deposu**, alt satır **Siliver Silen Temizlik Bezleri Dünyası** olarak korunmuştur.

**İletişim yalnızca WhatsApp üzerinden yapılır.** Kullanıcının verdiği numara: **+90 530 548 26 60**. E-posta, SMTP, e-posta sağlayıcısı, WhatsApp Business API, ödeme veya üyelik entegrasyonu yoktur. WhatsApp bağlantısı hazırlamak için ücretli servis gerekmez. Son gönderim WhatsApp içinde kullanıcı tarafından yapılır.

## Kurulum ve çalıştırma

Node.js 20.9+ gerekir; çalışma Node.js 24.18.0 ile doğrulandı. Paket yöneticisi npm; `package-lock.json` korunmalıdır.

```powershell
npm ci
# Yeni ortamda gerekirse: Copy-Item .env.example .env.local
npm run dev -- --hostname 127.0.0.1
```

Yerel adres: http://127.0.0.1:3000. Mevcut çalışma alanında `.env.local` oluşturulmuştur. Geliştirme sunucusu kod değişikliklerini otomatik yeniler. Firma bilgisi veya ortam değişkeni değişikliklerinden sonra sunucuyu yeniden başlatın; üretim için yeniden build alın.

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
| `/iletisim` | WhatsApp numarası ve doğrudan sohbet bağlantısı |
| `/teklif-al?urun=...` | Ürün seçili WhatsApp mesajı hazırlama |
| `/gizlilik`, `/aydinlatma` | Onaylı içerik için altyapı; mevcut durumda eksik metin bildirimi |
| `/api/teklif` | POST: doğrulama ve WhatsApp bağlantısı hazırlama; mesaj göndermez |
| `/sitemap.xml`, `/robots.txt` | Ortama ve yayımlanmış gerçek içeriğe göre SEO |

Ürün listesinde `q`, `kategori`, `kullanim`, `siralama=az|za` ve `sayfa` sorgu parametreleri kullanılır. Geri/ileri ve yenileme bunları korur. Türkçe İ/ı ve aksan normalizasyonu uygulanır; `araç` ve `arac` aynı sonucu verir. Sayfa başına 9 ürün gösterilir. Verisi olmayan renk/ölçü ve fiyat/popülerlik filtreleri eklenmemiştir.

## Blog içeriklerini güncelleme

Blog içerikleri `src/data/blog.ts` dosyasından yönetilir. Başlık, özet, görsel, yayın tarihi ve kaynaklı bölümler burada tutulur. Eklenen yazılar blog listesine, ana sayfadaki ilk üç yazıya, statik sayfa üretimine ve canlı ortamdaki sitemap'e otomatik katılır. Liste sırası dosyadaki sıradır. Düzenleme sonrasında üretim için yeniden build alın. Blog, mevcut demo/önizleme `noindex` kuralını korur. Görseller mevcut temsilî varlıklardır; kaynakları `ASSETS.md` içindedir.

## Ürün ve kategori güncelleme

Mevcut on bez çeşidinin her birine ayrı görsel atanmıştır. Görsel yolları ve alt metinleri `src/data/product-images.ts`, web için hazırlanmış dosyaları `public/images/products/` içindedir. Beş kategori kapağı kendi ürün grubundan seçilir. Tam üretim istemleri ve kaynak eşleştirmeleri için `ASSETS.md` dosyasına bakın.

Merkezî dosya: `src/data/catalog.ts`. Tipler ve çalışma zamanı doğrulaması `src/lib/catalog.ts` içindedir. Sayfa bileşeni değiştirmeniz gerekmez.

1. Kategori için benzersiz `id`, Türkçe karakter içermeyen `slug`, isimler, açıklama, izinli yerel görsel ve kullanım alanı ekleyin.
2. Gerçek ürün için `Product` tipine uygun kayıt ekleyin. `categoryId` mevcut kategoriye bağlanmalı.
3. `id` ve `slug` benzersiz olmalı. İzinli fotoğrafları `public/images/` altına koyup açık alt metin ekleyin. Ürün görselleri `object-contain` ile korunur.
4. `useCases` listesini gerçek ürün bilgisine göre doldurun. `featured: true` ana sayfa seçimini yönetir.
5. Bilinmeyen teknik alanı yazmayın. `specifications` isteğe bağlıdır: `Ürün kodu`, `Ölçüler`, `Gramaj`, `Malzeme bileşimi`, `Renk seçenekleri`, `Paket içeriği`, `Bakım bilgileri`. Yalnızca dolu alanlar gösterilir.
6. Onaylanmış gerçek kaydı `isDemo: false`, `isPublished: true` olarak işaretleyin. Mevcut 10 temsilî kayıt `isDemo: true`, `isPublished: false` durumundadır.
7. `npm test` ve `npm run build` çalıştırın. Yinelenen slug, eksik görsel/alt metin ve geçersiz kategori ilişkileri hata verir.

Canlı modda demo ve yayımlanmamış ürünler hem listeden hem doğrudan ürün adresinden çıkarılır. Gerçek ürün bulunmayan kategori sitemap'e girmez. Geçersiz ürün/kategori gerçek HTTP 404 verir. Galeriye ikinci görsel eklendiğinde küçük görsel kontrolleri otomatik açılır. Görsel hatasında tekrar yükleme döngüsü yerine sabit boyutlu fallback vardır.

## Firma ve ortam ayarları

`src/config/site.ts`: tam isim, marka, alt satır, WhatsApp, site URL, tanıtım görseli, hukuki içerik ve kapalı faaliyet bayrakları. Renk/ölçü tasarım tokenları `src/app/globals.css` içindeki CSS değişkenleridir. Görsel kaynakları ve tam üretim istemleri `ASSETS.md` içerisindedir.

| Değişken | Açıklama |
| --- | --- |
| `SITE_MODE` | Varsayılan demo; `live` yalnızca gerçek içerik hazırken |
| `SITE_PREVIEW` | Varsayılan true; canlı indeksleme için false |
| `SITE_WHATSAPP` | Kullanıcıdan alınmış numarayı ortam bazında değiştirebilir |
| `SITE_URL` | Doğrulanmış HTTPS kök alan adı; bilinmiyorsa boş |
| `SITE_DOMAIN_VERIFIED` | Alan adı gerçekten doğrulandıktan sonra true |
| `CONTENT_APPROVED` | İşletme ve ürün içeriği onaylandıktan sonra true |
| `TRUSTED_CLIENT_IP_HEADER` | İsteğe bağlı; yalnızca bu başlığı üzerine yazan güvenilir proxy varsa |

SITE_URL boşken canonical veya ürün mesajına uydurma alan adı yazılmaz. Gerçek URL eklendiğinde WhatsApp mesajı ürün bağlantısını da içerir. Sosyal hesap, adres, harita ve başka iletişim kanalı üretilmez.

## WhatsApp akışı ve veri işleme

Form ad soyad, isteğe bağlı firma/ürün/adet ve mesaj alır. İstemci ve sunucuda aynı Zod şeması kullanılır. Ürün kimliği sunucuda görünür katalogla tekrar doğrulanır. POST isteği yalnızca geçerli `wa.me` bağlantısı ve önizleme metni döndürür. Kullanıcı **WhatsApp’ta Aç** bağlantısıyla kendi WhatsApp uygulamasında gönderimi tamamlar. Site “mesaj gönderildi/okundu” iddiasında bulunmaz. Demo ürünün temsilî olduğu mesaja eklenir.

Sunucu WhatsApp'a ağ isteği yapmaz. Form verileri veritabanına, localStorage'a veya uygulama loglarına kaydedilmez. Barındırma sağlayıcısında istek gövdesi loglamasını etkinleştirmeyin. WhatsApp açıldığında bağlantıdaki mesaj metni WhatsApp'a aktarılır.

Honeypot, 16 KiB gövde sınırı, alan uzunluk/adet sınırları, JSON içerik türü, Origin ve Fetch Metadata kontrolü vardır. Yerel önizleme yalnızca eşleşen Host + loopback Origin ile çalışır. Canlı ortam yalnızca SITE_URL origin'ini kabul eder. Yardımcı istek sınırı **tek süreç belleğindedir**: 15 dakikada 60 istek (güvenilir IP başlığı yoksa ortak kota). Çok sunuculu dağıtımda genel güvence değildir; gerekirse barındırma katmanında rate limit ekleyin. Endpoint herhangi bir dış mesaj göndermediği için ayrıca mesajlaşma servisi/Redis kaynağı kurulmaz.

Numara yoksa/yanlışsa sahte bağlantı veya hazır mesaj sonucu verilmez. Yüklenme sırasında ikinci hazırlama engellenir. Alan düzenlenince eski hazırlanmış mesaj bağlantısı kaldırılır. Ağ, doğrulama, servis ve numara eksikliği durumları ayrı gösterilir. Otomatik testler gerçek kişiye WhatsApp mesajı göndermez.

## SEO ve yayın kontrolü

Demo/önizleme `noindex, follow` kullanır; robots sayfaları taramaya kapatmaz, böylece noindex okunabilir. Demo sitemap boştur. Filtreli aramalar noindex ve temel sayfaya canonical taşır. Gerçek indekslenebilir içerikte Organization, WebSite, BreadcrumbList ve doğrulanmış Product alanları üretilir. Fiyat, stok, yıldız veya yorum uydurulmaz. Gerçek ürün fotoğrafı sosyal paylaşım meta verisine bağlanır; alan adı yokken yerel/örnek URL metadata'ya yazılmaz.

```powershell
npm run validate:release
```

Bu kontrol demo modu, yanlış alan adı, WhatsApp eksikliği, gerçek ürün/görsel yokluğu, yayımlanmış demo kayıtları ve onaysız hukuki metinlerde hata koduyla durur. Mevcut durumda **beklendiği üzere başarısızdır**. Yerel build ile canlı yayına hazır olmak ayrı şeylerdir. `CONTENT_CHECKLIST.md` tamamlanmalı; onay bayrakları bunu atlatmak için kullanılmamalıdır. Bu çalışma yayımlanmadı; yayın için ayrıca açık izin gerekir.

## Mimari ve referanslar

İçerik ve sayfa gövdeleri Server Component; menü, filtre, görsel fallback/galeri ve form dar Client Component sınırlarında. Ortak bileşenler `src/components/` içinde. Mesaj hazırlama endpoint'i Node runtime kullanır; statik export yeterli değildir. Ağır animasyon veya ikon kütüphanesi yoktur. Azaltılmış hareket tercihi ve klavye odakları desteklenir.

Kurulum ve API yaklaşımı için [Next.js resmî kurulum belgesi](https://nextjs.org/docs/app/getting-started/installation) incelendi. [Kullanıcı referansı](https://www.kukuroglu.com.tr/arac-temizlik-bezleri) yalnızca kategori/alt kategori ve ürün gezinme yaklaşımı için incelendi; firma içeriği ve görselleri kullanılmadı.
