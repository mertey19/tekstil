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
| public/icon.svg | Geçici özgün geometrik monogram | Vektör | Proje içerisinde kodla oluşturuldu |

Imagegen PNG çıktıları sharp ile yeniden boyutlandırılıp WebP'ye dönüştürüldü. Görseller ayrıca Next Image üzerinden uygun boyutta AVIF/WebP olarak sunulur. Dış hotlink yok. Arayüz ikonları basit geometrik SVG çizgileridir. Sistem fontları Türkçe karakterleri destekler; haricî font isteği yok.

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
