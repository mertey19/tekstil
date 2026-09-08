# Canlı yayın öncesi içerik kontrolü

Bu proje çalışan bir önizleme kataloğudur. Yerel build sonucu, yayına içerik onayı anlamına gelmez. İletişim yalnızca WhatsApp üzerinden yapılır; sunucu mesaj göndermez, doğrulanmış bir WhatsApp bağlantısı hazırlar.

- [ ] Kesin marka yazımını onaylat: “Mikrofiber deposu siliver silen temizlik bezleri dünyası”. “Siliver Silen” korunmuştur.
- [ ] Resmî logo ve kullanım izni. Geçici tipografik marka gösterimi/favikon onaylanmış logo değildir.
- [x] WhatsApp: +90 530 548 26 60 — kullanıcı tarafından 8 Eylül 2026 tarihinde sağlandı.
- [x] Kullanıcının son talebine göre e-posta ve diğer iletişim sistemleri kaldırıldı.
- [x] Kullanıcının ilettiği firma geçmişi tanıtıma eklendi: temelleri 1992 yılında Hüseyin Bayhan tarafından atılmıştır; müşteri desteği, memnuniyet ve hizmet sektöründeki tecrübe vurgulanmıştır. Süreyi güncel tutmak için “35 yıldır” yerine “1992’den bu yana” kullanılır.
- [ ] Gerçek alan adı, DNS ve HTTPS doğrulaması.
- [ ] Gerçek ürün ve kategori listesi; 10 kayıt şu anda `isDemo: true`, `isPublished: false`.
- [ ] İzinli gerçek ürün fotoğrafları, kategori ve tanıtım görselleri; kaynaklarını ASSETS.md'ye işle.
- [ ] Ürün kodu, ölçüler, gramaj, bileşim, renkler, paket ve bakım bilgileri. Bilinmeyen alanları boş bırak.
- [ ] Doğrulanmış ticari faaliyetler. Toptan satış, üretim, bayilik, ihracat, teslimat iddiaları şu anda kapalı.
- [ ] Gizlilik ve aydınlatma metinlerini yetkili kişi onaylasın; `src/config/site.ts` içindeki içerik ve `approved` alanları güncellensin.
- [ ] Yayın ortamında WhatsApp bağlantısını cihazda açarak kontrol edin; son gönderim kullanıcıdadır.
- [ ] Yoğun trafik için dağıtım platformunda istek sınırı. Mevcut bellek limiti tek süreç için yardımcı korumadır; çok sunuculu güvence değildir.
- [ ] Yayın ortamında yeniden Lighthouse ve erişilebilirlik kontrolü.
- [ ] `npm run validate:release` başarılı; ardından ayrıca kullanıcı yayın izni.

Onay bayraklarını yalnızca ilgili içerik ve yapılandırma gerçekten doğrulandıktan sonra değiştirin. Bu çalışma kapsamında yayın, alan adı satın alımı, ücretli kaynak kurulumu veya gerçek kişiye WhatsApp mesajı yapılmadı.
