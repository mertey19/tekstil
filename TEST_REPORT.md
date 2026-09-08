# Doğrulama raporu — 8 Eylül 2026

Son kapsam: Türkçe ürün kataloğu, üç yazılı blog ve **yalnızca WhatsApp** iletişim/teklif akışı. Telefon/e-posta alanı veya e-posta sağlayıcısı yok. +90 530 548 26 60 kullanıcıdan alındı. Hiçbir gerçek kişiye test mesajı gönderilmedi.

## Çalıştırılan komutlar

| Komut | Sonuç |
| --- | --- |
| `npm run lint` | Başarılı, hata/uyarı yok |
| `npm run typecheck` | Başarılı; Next route typegen ve strict TypeScript |
| `npm test` | 14/14 birim testi başarılı |
| `npm run build` | Başarılı üretim build'i; blog listesi ve üç statik yazı, mevcut katalog/iletişim sayfaları, SEO uçları ve mesaj hazırlama endpoint'i |
| `npm run test:e2e` | Blog sonrası tam koşu: 27/27 başarılı. Görsel güncellemesi sonrası hedefli arama/gezinme/görsel/axe koşusu: 4/4 başarılı, Chromium, üretim sunucusu |
| `npm run test:performance` | 3 mobil Lighthouse raporu üretildi |
| `npm run validate:release` | Beklenen hata kodu 1: demo/önizleme, gerçek alan adı/ürün/görsel ve hukuki onaylar eksik |

Kurulumda `npm install` bağımlılık denetimi 0 güvenlik açığı bildirdi. Uygulama ilk kez boş Git deposuna kuruldu; önceden mevcut kullanıcı kaynak dosyası yoktu. Bu rapordaki kontroller yerel geliştirme ve üretim sunucularında gerçekleştirildi; canlı dağıtım yapılmadı.

## Birim testi kapsamı

- Türkçe İ/ı ve aksan normalizasyonu; `araç`, `arac`, `ARAÇ`; ürün adı, kategori ve kullanım alanı araması.
- Kategori + kullanım + sorgu birleşimi, sonuçsuz arama, A–Z/Z–A ve sayfalama sınırları.
- Yinelenen slug, geçersiz kategori ilişkisi, eksik görsel ve zorunlu alanlar.
- Canlı listeden/sitemap'ten demo ve taslakların çıkarılması.
- WhatsApp numarası normalizasyonu ve Türkçe mesajın doğru URL kodlanması.
- Form alan sınırları, pozitif tam sayı kontrolü, gönderilmeyen eski e-posta alanının reddi.
- Origin, Fetch Metadata, içerik türü, honeypot, 16 KiB gövde sınırı ve sunucuda ürün kimliği doğrulaması.
- Eksik/bozuk numarada hazır ya da gönderildi sonucu oluşmaması.
- Hazırlanan mesajda ürün, adet, isim, temsilî ürün notu ve yalnızca doğrulanmış site URL'si.
- İstek sınırı, limiter hata durumu ve release kontrolü.

## Tarayıcı ve görsel kontrol

Ana sayfa, katalog, kategori, ürün, hakkında, iletişim, teklif, gizlilik ve aydınlatma sayfalarının açılması; başlık/metadata, gerçek 404, arama ve filtre geçmişi, ürünün forma taşınması, WhatsApp hedefi, numarasız durum için birim doğrulaması, form hataları ve hazırlanmış mesaj kontrol edildi. Mesaj hazırlanması gerçek yerel API'ye POST ile doğrulandı; WhatsApp linkine basılıp mesaj gönderilmedi.

Servis hatası ve ağ kesintisi Playwright route mocking ile oluşturuldu; gerçek dış sağlayıcı entegrasyon testi değildir. Akış herhangi bir dış mesaj gönderme API'si içermez. Yükleme sırasında ikinci hazırlama engellenir; alanlar geçici devre dışıdır. Hazırlama sonrasında form değişince eski mesaj bağlantısı kaldırılır.

Son mobil görsel kontrolde, tam sayfa ekran görüntüsünde atlama bağlantısının görünür olabildiği görüldü. Bağlantı odakta değilken görünürlüğü kapatıldı; klavyeyle odaklanınca açılır. Hazır mesaj başlığına açık odak aktarımı eklendi; birleşen mobil başlık boşluğu düzeltildi. İlgili form/servis/ağ, klavye ve axe kontrolleri hedefli olarak tekrar çalıştırıldı.

360, 390, 768 ve 1440 px genişliklerde ana sayfa/kategori/ürün ekran görüntüleri alındı; yatay taşma kontrolü geçti. Mobil ve masaüstü görüntüleri gözle incelendi. WhatsApp mesaj önizlemesi ayrıca 390 px'te incelendi; taşma yok. Dosyalar `artifacts/screenshots/` altındadır.

Klavye atlama bağlantısı, menü/filtre Escape ile kapanışı ve odağın açan butona dönüşü test edildi. Dört ana sayfada axe WCAG 2 A/AA ve 2.1 AA otomatik taraması ihlal bulmadı. Lighthouse'ın tespit ettiği mobil kategori başlık sırası düzeltildi. Bozuk görseller ağ hatasıyla simüle edilip fallback'in görünmesi ve görsel alanının boyutunu koruması doğrulandı.

## Ürüne özel görsellerin doğrulanması

8 Eylül 2026'da on bez çeşidi için ayrı Imagegen görseli üretildi. On farklı dosya yolu ve on farklı SHA-256 özeti doğrulandı; beş kategoride farklı kapaklar kullanılıyor. WebP dosyaları 1200 × 1200 piksel, toplam 1.850.448 bayttır. 390 ve 1440 px genişliklerde on ürünün her birinde doğru galeri dosyası, alt metin, yüklenme ve taşma kontrol edildi (20 ürün sayfası kontrolü). Ana sayfa ve kataloğun iki sayfası da bu iki genişlikte görüntülendi. Temsilî görselleri canlı ürüne atamayı reddeden kontrol yeni dosyalarla doğrulandı. Lint, 14 birim testi ve üretim derlemesi başarılı.

Görsel güncellemesinden sonra dört hedefli üretim tarayıcı testi (arama ve geçmiş, mobil menü ve odak, görsel hata görünümü, axe) yeniden geçti. Katalogdaki ilk görsel eager yüklenir; ürün sayfasına geçişte tarayıcı çalışma zamanı hatası veya uyarısı bulunmadı.

## Blog doğrulaması

Blog sonrasında ana sayfa ve blog listesinde üç yazı, mobil/masaüstü menüden erişim, ayrı yazı sayfaları, içindekiler bağlantıları, ilgili yazılar, makale metadata'sı, noindex ve gerçek 404 doğrulandı. Blog ve üç yazıda axe WCAG 2 A/AA ve 2.1 AA taraması ihlal bulmadı. 360, 768, 900, 1024 ve 1440 px blog görünümünde yatay taşma yok; 900 px menüsü ayrıca kontrol edildi. Tam sayfa görsel testleri, ekran altındaki lazy görselleri yükledikten sonra çekim yapacak şekilde düzeltildi. Üretilen test raporları ESLint kaynak taramasından çıkarıldı.

## Son Lighthouse mobil ölçümü

Lighthouse değerleri blog eklenmeden önceki ölçümdür; bu içerik değişikliği sonrasında Lighthouse yeniden çalıştırılmadı.

Yerel **üretim** sunucusu, Lighthouse 13.4.1, Chromium Headless, varsayılan mobil emülasyon ve simüle kısıtlama. Raporlar `artifacts/lighthouse/` altında HTML ve JSON olarak saklanır. Bunlar canlı barındırma veya gerçek kullanıcı ölçümü değildir.

| Sayfa | Performans | Erişilebilirlik | İyi uygulamalar | SEO | FCP | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Ana sayfa | 98 | 100 | 100 | 66 | 0,8 sn | 2,3 sn | 0 | 50 ms |
| Araç kategorisi | 99 | 100 | 100 | 63 | 0,8 sn | 2,1 sn | 0 | 30 ms |
| Araç ürünü | 100 | 100 | 100 | 66 | 0,8 sn | 1,7 sn | 0 | 30 ms |

SEO 95+ hedefi bu demo ortamında elde edilmedi: üç raporda da başarısız SEO denetimi `is-crawlable` (bilinçli `noindex, follow`). Demo içeriğin indekslenmesini açarak puan yükseltilmedi. Gerçek içerik ve alan adıyla yayına hazırlanırken yeniden ölçülmeli.

## Kalan yayın koşulları

`CONTENT_CHECKLIST.md` içindeki gerçek ürün/fotoğraf/özellik, logo, alan adı, faaliyet/marka ve hukuki metin onayları bekliyor. WhatsApp numarası dışında verilmemiş işletme bilgisi uydurulmadı. Ürün sayfasına dışarıdan paylaşılabilir bağlantı ancak SITE_URL doğrulanıp eklendiğinde mesaja katılır. Kayıt/servis/ücretli kaynak veya izin dışı dağıtım yapılmadı.

İstek sınırı yardımcı tek süreç belleği kullanır; çok sunuculu dağıtımda bütüncül koruma değildir. Site mesaj göndermediği için haricî mesajlaşma altyapısı gerektirmez. Yoğun trafik kontrolü dağıtım katmanında yapılandırılabilir. WhatsApp uygulamasında gerçek teslim/alınma durumu bu çalışma kapsamında doğrulanmadı.
