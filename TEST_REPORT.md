# Doğrulama raporu — 8 Eylül 2026

Son kapsam: kalıcı içerik ve görsel yönetimine sahip yönetici paneli, Türkçe ürün kataloğu, üç başlangıç yazılı blog ve **yalnızca WhatsApp** iletişim/teklif akışı. Telefon/e-posta alanı veya e-posta sağlayıcısı yok. +90 530 548 26 60 kullanıcıdan alındı. Hiçbir gerçek kişiye test mesajı gönderilmedi.

## Çalıştırılan komutlar

| Komut | Sonuç |
| --- | --- |
| `npm run lint` | Başarılı, hata/uyarı yok |
| `npm run typecheck` | Başarılı; Next route typegen ve strict TypeScript |
| `npm test` | 16/16 birim testi başarılı |
| `npm run build` | Başarılı; dinamik katalog/blog/sayfalar, yönetici paneli, yetkili CMS API’si ve görsel sunumu |
| `npm run test:e2e` | Tam koşu 34/34; büyük dosya testi eklendikten sonra yönetim testleri 8/8 (toplam 35 farklı senaryo) |
| `npm run test:performance` | Önceki katalog sürümünde 3 mobil Lighthouse raporu üretildi; admin sonrası tekrar ölçülmedi |
| `npm run validate:release` | Beklenen hata kodu 1: demo/önizleme, gerçek alan adı/ürün/görsel ve hukuki onaylar eksik |

Kurulumda `npm install` bağımlılık denetimi 0 güvenlik açığı bildirdi. Uygulama ilk kez boş Git deposuna kuruldu; önceden mevcut kullanıcı kaynak dosyası yoktu. Yerel üretim testlerine ek olarak Neon Postgres üzerinde kalıcılık ve eşzamanlılık kontrolleri yapıldı.

## Yönetici paneli doğrulamaları

- İlk kurulum tek kullanımlık anahtar gerektirir; yanlış anahtar, ikinci kurulum, hatalı şifre, yetkisiz API ve farklı Origin reddedilir. Oturum HttpOnly ve SameSite=Strict özellikleri doğrulandı.
- Gerçek dosya seçimiyle görsel yükleme; ürün ekleme, taslak adresinin 404 olması, yayımlama, sayfa yenileme, düzenleme ve silme uçtan uca geçti.
- Kategori, blog yazısı ve ek sayfa bölümü panel formlarından oluşturuldu ve ziyaretçi sayfalarında doğrulandı. WhatsApp numarası değişince sabit sohbet bağlantısının güncellendiği kontrol edildi.
- SVG/sahte görsel, sunucuya doğrudan gönderilen 4 MB üstü dosya, geçersiz ilişki, yinelenen adres, JavaScript bağlantısı ve eski revizyonla kayıt reddedildi.
- İçerik ve görsel verisinin ayrı bir Node sürecinde tekrar okunabildiği birim testiyle doğrulandı.
- 390/1440 px panel ekran görüntüleri incelendi; temel sekmelerde taşma yok. Genel bakış, site ayarları ve sayfa düzenleme ekranlarında axe WCAG 2 A/AA ve 2.1 AA ihlali yok.
- Next build’in 19 sunucu izleme manifestinde çalışma veritabanı, test veritabanları ve ortam dosyalarının bulunmadığı kontrol edildi.
- Testler her koşuda ayrı `artifacts/cms-e2e-*` veritabanı kullandı; asıl yönetici hesabı oluşturulmadı ve katalog değiştirilmedi.

Şifre değiştirme ekranı ve sunucu doğrulaması uygulanmıştır; tam şifre değiştirip tüm oturumları sonlandırma akışı ayrı bir tarayıcı testine dahil edilmedi. Yük ve yedekten dönüş testi yapılmadı. Vercel’de kalıcı Neon Postgres, yerelde SQLite kullanılır.

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

`CONTENT_CHECKLIST.md` içindeki gerçek ürün/fotoğraf/özellik, logo, alan adı, faaliyet/marka ve hukuki metin onayları bekliyor. WhatsApp numarası dışında verilmemiş işletme bilgisi uydurulmadı. Ürün sayfasına dışarıdan paylaşılabilir bağlantı ancak SITE_URL doğrulanıp eklendiğinde mesaja katılır. Kullanıcının isteğiyle Vercel dağıtımı ve ücretsiz Neon kaynağı kuruldu. Ücretli kaynak oluşturulmadı.

İstek sınırı yardımcı tek süreç belleği kullanır; çok sunuculu dağıtımda bütüncül koruma değildir. Site mesaj göndermediği için haricî mesajlaşma altyapısı gerektirmez. Yoğun trafik kontrolü dağıtım katmanında yapılandırılabilir. WhatsApp uygulamasında gerçek teslim/alınma durumu bu çalışma kapsamında doğrulanmadı.

## Neon ve Vercel uyarlaması

- Neon HTTP sürücüsü, parametreli sorgular ve açık migration komutu eklendi. Veritabanı bağlantısı bulunmayan Vercel süreci yerel/geçici diske yazmaz.
- Gerçek Neon üzerinde eşzamanlı iki kurulumun yalnızca birinin başarılı olması, giriş, kalıcı oturum, eski revizyonun reddi, ikili görsel verisinin kayıpsız dönmesi ve paralel istek sınırı doğrulandı. İçerik/görsel/oturum ayrı Node sürecinden tekrar okundu. Geçici doğrulama hesabı ve görseli temizlendi.
- 5 MB üzerindeki gerçek PNG dosyası tarayıcıdan seçildi, 4 MB altına WebP olarak küçültülüp sunucuya yüklendi ve adresinden tekrar okundu.
- SITE_URL ve ADMIN_ORIGIN canlı HTTPS adresine ayarlandı; Neon yalnızca Production ortamına bağlandı.

## Canlı admin doğrulaması

`https://tekstil-sigma.vercel.app` üzerinde ilk hesap kurma, giriş/çıkış, yetkisiz erişim engeli ve Secure/HttpOnly/SameSite=Strict çerez doğrulandı. Bilgisayardan gerçek WebP seçilerek yüklendi; içerik kaydı, eski revizyonun 409 ile reddi ve yeni görselin ziyaretçi ürün sayfasına yansıması kontrol edildi. 390 ve 1440 px panel görüntüleri alındı; mobil yatay taşma yok. Ana sayfa, katalog, blog, hakkında, teklif ve admin 200; bulunmayan ürün 404 döndürdü. Test hesabı ve test yüklemesi teslim öncesi temizlenir; kullanıcı hesabı için tek kullanımlık kurulum bağlantısı hazırlanır.
