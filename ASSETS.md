# Görsel kaynakları ve kullanım durumu

Müşteri fotoğraf sağlamadı. Referans firmanın hiçbir görseli, logosu veya metni indirilmedi/kopyalanmadı. Görseller yerleşik Imagegen ile bu proje için üretildi; gerçek müşteri ürünü, renk seçeneği veya teknik özellik kanıtı değildir. 8 Eylül 2026 güncellemesinde katalogdaki on bez çeşidinin her biri için farklı görsel üretildi. Her ürünün kartı ve detay sayfası aynı ürüne ait görseli kullanır. Beş kategorinin kapağı, kendi grubundaki bir ürünün görselidir. Eski üç görsel ana tanıtım/hakkında/blog alanlarında korunmuştur. Tüm demo ürünler yayımlanmamış durumdadır. Canlı yayın kontrolü bu görsellerin gerçek ürünlere atanmasını reddeder.

| Dosya | Durum | Boyut | Kaynak |
| --- | --- | --- | --- |
| public/images/hero.webp | Yapay, temsilî; ana sayfa, hakkında ve blog | 1500 × 1000 | Imagegen, 8 Eylül 2026 |
| public/images/glass.webp | Yapay, temsilî; cam temizliği blog yazısı | 1000 × 1000 | Imagegen, 8 Eylül 2026 |
| public/images/auto.webp | Yapay, temsilî; araç bakımı blog yazısı | 1000 × 1000 | Imagegen, 8 Eylül 2026 |
| public/images/products/cam-bezi.webp | Buz mavisi, ince doku, çapraz katlama | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/dokuma-cam-bezi.webp | Kobalt mavisi, dokuma doku | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/arac-bakim-bezi.webp | Antrasit, turuncu kenar, uzun tüylü | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/arac-ici-temizlik-bezi.webp | Lavanta, koyu kenar, kısa tüylü | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/mikrofiber-kurulama-bezi.webp | Lacivert, kalın ilmekli | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/yuzey-kurulama-bezi.webp | Mercan, kare petek dokuma | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/cok-amacli-mikrofiber-bez.webp | Zümrüt yeşili, kare katlama | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/gunluk-temizlik-bezi.webp | Sarı, yelpaze katlama | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/mutfak-temizlik-bezi.webp | Kiremit, çizgili doku, uzun katlama | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| public/images/products/tezgah-temizlik-bezi.webp | Adaçayı yeşili, petek doku, rulo | 1200 × 1200 | Imagegen, 8 Eylül 2026 |
| assets/brand/icon-source.jpg | Marka ikonunun tek kaynağı: nane yeşili yuvarlatılmış kare üzerinde parlak altın girdap + S amblemi ve dört köşeli ışıltı | 1024 × 1024 | Imagegen, 10 Eylül 2026 (müşteri onaylı render) |
| public/icon.svg | Aynı render'ın ölçeklenebilir sarmalayıcısı: JPEG gömülü, %20 yuvarlatılmış kareye kırpılmış | SVG 1024 × 1024 | `scripts/generate-icons.mjs` |
| public/icon.png | Tam amblem, PWA/arama ikonu, köşeler saydam | 192 × 192 | `scripts/generate-icons.mjs` (sharp) |
| public/apple-touch-icon.png | Tam amblem, iOS ana ekran; saydamlık yok, köşeler nane yeşiliyle dolu | 180 × 180 | `scripts/generate-icons.mjs` (sharp) |
| public/icon-48.png | Tam amblem, küçük boyda okunaklı | 48 × 48 | `scripts/generate-icons.mjs` (sharp) |
| public/favicon.ico | Üç boy; 48 ve 32 tam amblem, 16 ise S'nin okunması için yakınlaştırılmış kırpım | 16 / 32 / 48 | `scripts/generate-icons.mjs` (sharp) |

Imagegen PNG çıktıları sharp ile yeniden boyutlandırılıp WebP'ye dönüştürüldü. Görseller ayrıca Next Image üzerinden uygun boyutta AVIF/WebP olarak sunulur. Dış hotlink yok. Arayüz ikonları basit geometrik SVG çizgileridir. Sistem fontları Türkçe karakterleri destekler; haricî font isteği yok.

## Marka ikonu üretimi

Tek kaynak `assets/brand/icon-source.jpg` dosyasıdır; tüm ikonlar `node scripts/generate-icons.mjs` ile ondan türetilir. Elle çizilmiş vektör lockup (eski `public/icon-mark.svg` ve `scripts/generate-logo.py`) bu render ile uyuşmadığı için kaldırıldı; git geçmişinde 47ce72a işlemesinde durmaktadır.

Boru hattı:

1. Nane yeşili yuvarlatılmış kare zaten 1024 × 1024 tuvalin dört kenarına değiyor; beyaz yalnızca yuvarlatma yarıçapının dışındaki dört köşede kalıyor. Kenarlardaki beyaz karışım için 3 piksel içeri kırpılır.
2. Ölçülen köşe yarıçapı kenarın ~%19,5'i; maskeleme %20 yapılır, böylece beyaz köşelerden iz kalmaz.
3. `icon.png`, `icon-48.png` ve `favicon.ico` köşeleri saydam bırakır. iOS saydamlığı siyaha düzleştirdiği için `apple-touch-icon.png` köşeleri, düz bir renk yerine aynı karenin biraz yakınlaştırılmış kopyasından alınan nane yeşiliyle doldurulur; böylece zemin gradyanıyla dikiş izi oluşmaz.
4. Küçültme lanczos3 ile yapılır ve 48 piksel ve altında hafif unsharp uygulanır. 16 pikselde lanczos3'ün halkalanması altın gradyanı benekliyor; bu tek boy mitchell çekirdeğiyle küçültülür.
5. Tam kare 16 pikselde okunmuyor. Bu yüzden `favicon.ico` içindeki 16 piksellik giriş, amblemin ağırlık merkezine göre 820 × 820 kırpımdan üretilir; S okunur kalır ve yuvarlatılmış kare silueti korunur. 32 piksel ve üzeri tam kareyi kullanır.

`public/icon.svg` metadata'da bilinçli olarak yer almaz: tarayıcılar SVG'yi tercih eder ve 16 piksel için özel olarak hazırlanan kırpım devre dışı kalırdı. Dosya, daha önce yayımlanmış URL'in 404 vermemesi ve müşteriye ölçeklenebilir bir marka dosyası bırakmak için korunur.

## Üretim istemleri (birebir)

On yeni görselin ayrı ayrı kullanılan tam istemleri `assets/product-image-prompts.json` dosyasındadır. Kaynak PNG dosyaları ile projeye kaydedilen WebP dosyalarının eşleştirmesi `assets/product-image-sources.json` dosyasında tutulur. Yerleşik Imagegen kullanıldı; CLI/API üretim yoluna geçilmedi. PNG kaynakları korunarak sharp ile 1200 × 1200 piksel, WebP kalite 84 olarak optimize edildi. Ürün eşleştirmesi ve görsele özgü alternatif metinler `src/data/product-images.ts` üzerinden yönetilir.

### Hero
```text
Use case: product-mockup
Asset type: Turkish microfiber catalog demo hero photograph, illustrative product image
Primary request: High-end editorial product photography of a stack of folded blue, pale mint, and white microfiber cleaning cloths with one muted yellow cloth gently draped.
Scene/backdrop: Cool pale gray seamless studio background and ground.
Style/medium: Photorealistic studio product photograph.
Composition/framing: 3:2 landscape, entire cloths in frame, fills composition tastefully, no props.
Lighting/mood: Soft side daylight and realistic shadows.
Materials/textures: Visibly tactile fine microfiber pile and stitched edges.
Constraints: No logos, text, brands, or watermarks. This is an original illustrative demo product image.
```

### Cam bezleri
```text
Use case: product-mockup
Asset type: Turkish microfiber catalog demo product photograph, illustrative product image
Primary request: Square studio product photo of two neatly folded blue microfiber glass cleaning cloths, one laid diagonally.
Scene/backdrop: Pale cool gray seamless studio ground and background.
Style/medium: Photorealistic studio product photograph.
Composition/framing: Square 1:1, entire cloths in frame, no props.
Lighting/mood: Soft natural light with realistic shadows.
Materials/textures: Fine smooth woven tactile microfiber texture and clearly defined fabric edges.
Constraints: No logos, text, brands, or watermarks. This is an original illustrative demo product image.
```

### Araç bezi
```text
Use case: product-mockup
Asset type: Turkish microfiber catalog demo product photograph, illustrative product image
Primary request: Square studio product photo of a folded charcoal gray thick microfiber vehicle drying cloth with a warm yellow edging, slight drape to show plush fibers.
Scene/backdrop: Cool light gray seamless studio background and ground.
Style/medium: Photorealistic studio product photograph.
Composition/framing: Square 1:1, entire cloth in frame, no props.
Lighting/mood: Soft natural studio lighting and realistic shadows.
Materials/textures: Thick plush microfiber fibers, charcoal gray fabric, warm yellow stitched edging.
Constraints: No logos, text, brands, or watermarks. This is an original illustrative demo product image.
```
