export const supportDefinitions = {
  faq: { label: "Sıkça sorulan sorular", path: "/sss" },
  order: { label: "Sipariş ve teslimat", path: "/siparis-ve-teslimat" },
  cancellation: { label: "İptal ve iade", path: "/iptal-ve-iade" },
  preinformation: { label: "Ön bilgilendirme", path: "/on-bilgilendirme" },
  contract: {
    label: "Mesafeli satış sözleşmesi",
    path: "/mesafeli-satis-sozlesmesi",
  },
} as const;

export type SupportKey = keyof typeof supportDefinitions;
export const supportKeys = Object.keys(supportDefinitions) as SupportKey[];

export const consumerGuide = {
  label: "Ticaret Bakanlığı · Mesafeli sözleşmeler rehberi",
  url: "https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/mesafeli-sozlesmeler-hakkinda-bilgilendirme",
};
export const remedyGuide = {
  label: "Ticaret Bakanlığı · Tüketici başvuru yolları",
  url: "https://tuketici.ticaret.gov.tr/yayinlar/tuketici-bilgi-rehberi/tuketici-hakem-heyetleri-hakkinda-bilgilendirme",
};

export const defaultSupport = {
  faq: {
    title: "Aklınızdaki sorular.",
    intro:
      "Ürün seçimi, WhatsApp üzerinden iletişim ve üyelik hakkında merak edilenler bir arada.",
    sections: [
      {
        id: "teklif",
        title: "Nasıl bilgi veya teklif alabilirim?",
        text: "Ürün sayfasındaki Bilgi ve Teklif Al bağlantısını kullanın. İlgilendiğiniz ürünü, tahmini adedi ve sorularınızı ekleyerek mesajınızı hazırlayın. WhatsApp açıldığında mesajı kontrol edip siz gönderirsiniz. Mesaj hazırlamak sipariş veya ödeme oluşturmaz.",
      },
      {
        id: "fiyat",
        title: "Fiyatı ve minimum sipariş adedini nasıl öğrenirim?",
        text: "Ürünün adı, ölçüsü, rengi ve ihtiyaç duyduğunuz adedi WhatsApp üzerinden paylaşın. Güncel fiyat, stok, paket içeriği ve varsa minimum adet koşulunu siparişi kararlaştırmadan önce netleştirin.",
      },
      {
        id: "uyelik",
        title: "Teklif almak için üye olmam gerekiyor mu?",
        text: "Hayır. Üye olmadan ürünleri inceleyebilir ve teklif talebi hazırlayabilirsiniz. Üyelik; kayıt, giriş ve profil bilgilerinizi yönetmek içindir. Giriş yaptığınızda adınız ve firma bilginiz teklif formuna aktarılır.",
      },
      {
        id: "sifre",
        title: "Şifremi unuttum; hesabımı nasıl kurtarabilirim?",
        text: "Giriş sayfasındaki Şifremi unuttum bağlantısını açın. Kullanıcı adınız, hesap oluştururken size gösterilen kurtarma kodunuz ve yeni şifrenizle işlemi tamamlayın. Kod e-posta veya WhatsApp üzerinden gönderilmez; kayıt sırasında gösterilir ve sizin saklamanız gerekir. Kurtarma sonrasında gösterilen yeni kodu da güvenli bir yerde saklayın.",
      },
      {
        id: "teslimat",
        title: "Teslimat süresi ve kargo ücreti nedir?",
        text: "Teslimat adresinizi ve ürün adedini paylaşarak hazırlık süresini, taşıyıcıyı ve kargo ücretini teklif aşamasında öğrenin. Site üzerinden kargo takibi veya ödeme yapılmaz. Gönderinizin durumu için WhatsApp üzerinden yazabilirsiniz.",
      },
      {
        id: "iptal",
        title:
          "Siparişimi değiştirmek veya iptal etmek istiyorum. Ne yapmalıyım?",
        text: "WhatsApp üzerinden adınızı, sipariş tarihinizi ve değiştirmek ya da iptal etmek istediğiniz ürünü belirtin. Gönderim durumunu birlikte netleştirelim. Tüketici işlemlerindeki cayma hakkı ve iade süreci için İptal ve iade sayfasını inceleyin.",
      },
      {
        id: "hasar",
        title: "Yanlış veya hasarlı ürün geldiyse nasıl bildirebilirim?",
        text: "Ürün adını ve yaşadığınız sorunu WhatsApp üzerinden paylaşın. Varsa ürün ve paket fotoğrafları incelemeyi kolaylaştırır. Fotoğraf veya taşıyıcı tutanağının bulunmaması tek başına yasal haklarınızı ortadan kaldırmaz.",
      },
      {
        id: "belgeler",
        title: "Sipariş koşullarına nereden ulaşabilirim?",
        text: "Bilgilendirme menüsünde sipariş, teslimat, iptal, iade, ön bilgilendirme ve mesafeli satış sözleşmesi konularını bulabilirsiniz. Siparişe özel ürün, fiyat, teslimat ve satıcı bilgilerini ayrıca yazılı olarak isteyin ve saklayın.",
      },
    ],
  },
  order: {
    title: "Siparişten teslimata.",
    intro:
      "İhtiyacınızı paylaşın, ayrıntıları netleştirin. Ürün bilgisi ve teklif görüşmelerimiz WhatsApp üzerinden ilerler.",
    sections: [
      {
        id: "urun-secimi",
        title: "01 · Ürünü ve ihtiyacınızı paylaşın",
        text: "Katalogdan ürününüzü seçin. Kullanım alanı, ölçü, renk, paket içeriği ve tahmini adet gibi ayrıntıları mesajınıza ekleyin. Size uygun seçeneği görüşmek için Bilgi ve Teklif Al formunu kullanabilirsiniz.",
      },
      {
        id: "teklif",
        title: "02 · Teklifin ayrıntılarını kontrol edin",
        text: "Sipariş vermeden önce ürünün stok durumunu, vergiler dahil toplam bedeli, varsa kargo ve diğer giderleri, ödeme yöntemini ve teslimat süresini yazılı olarak netleştirin. Katalogda fiyat gösterilmeyen bir ürün için güncel teklif isteyin.",
      },
      {
        id: "onay",
        title: "03 · Sipariş bilgilerinizi teyit edin",
        text: "Adet, ürün çeşidi, alıcı, fatura ve teslimat bilgilerini kontrol edin. Site formu yalnızca iletişim talebinizi hazırlar; formu doldurmak veya WhatsApp bağlantısını açmak tek başına sipariş onayı ya da ödeme değildir. Kararlaştırdığınız koşulları ve ödeme belgenizi saklayın.",
      },
      {
        id: "gonderim",
        title: "04 · Gönderi bilgilerini öğrenin",
        text: "Hazırlık ve gönderim durumunu WhatsApp üzerinden sorabilirsiniz. Kargo firması, takip bilgisi ve teslimat adresiyle ilgili değişiklikleri gönderimden önce görüşün. Teslimat süresi ve giderleri siparişe göre netleştirilir; bu sayfada sabit kargo bedeli veya ücretsiz kargo taahhüdü verilmez.",
      },
      {
        id: "teslim",
        title: "05 · Teslim aldığınız ürünü kontrol edin",
        text: "Ürün çeşidini, adedini ve paket durumunu kontrol edin. Eksik, yanlış veya hasarlı bir teslimatta sorunu sipariş bilgilerinizle birlikte iletin. İptal veya iade için aşağıdaki bilgilendirme bağlantılarını kullanabilirsiniz.",
      },
    ],
  },
  cancellation: {
    title: "İptal ve iade bilgileri.",
    intro:
      "Sipariş değişikliği, cayma bildirimi veya ürünle ilgili bir sorun için WhatsApp üzerinden bize ulaşabilirsiniz.",
    sections: [
      {
        id: "bildirim",
        title: "Talebinizi nasıl iletebilirsiniz?",
        text: "Adınızı, sipariş tarihinizi, ürün ve adet bilgisini yazın; iptal, değişiklik veya iade talebinizi açıkça belirtin. Varsa sipariş numaranızı ekleyin. Yazışmanızı saklayın. İade göndermeden önce güncel iade adresini ve anlaşmalı taşıyıcı bilgisini isteyin; kişisel bilgilerinizi herkese açık alanlarda paylaşmayın.",
      },
      {
        id: "cayma",
        title: "Tüketicinin cayma hakkı",
        text: "Tüketici kapsamındaki mesafeli mal satışlarında, istisnalar dışında teslimden itibaren 14 gün içinde gerekçesiz cayılabilir; teslimden önce de bildirim yapılabilir. Bildirimin yazılı veya kalıcı veri saklayıcısıyla yapılması gerekir. Cayma için gerekçe veya satıcının onayı şart değildir.",
      },
      {
        id: "iade",
        title: "Ürünün iadesi ve geri ödeme",
        text: "Cayma bildiriminden sonra ürünü 14 gün içinde gönderin. Belirtilen taşıyıcıya teslimden itibaren 14 gün içinde geri ödeme yapılır; başka taşıyıcı seçilirse süre satıcıya teslimden başlar. Teslim öncesi caymada süre bildirimle başlar. İade, aynı ödeme aracıyla ve masrafsız yapılır. Belirtilen taşıyıcıyla iadede tüketiciye masraf yüklenemez; taşıyıcı belirtilmemişse de iade masrafı istenemez.",
      },
      {
        id: "istisna",
        title: "Kişiye özel ürünler ve istisnalar",
        text: "Kişisel talebe göre hazırlanan ürünler cayma istisnasına girebilir. Hijyen istisnası, koruyucu unsurları açılmış ve sağlık/hijyen açısından iadesi uygun olmayan mallarla sınırlıdır; bütün temizlik bezleri için genel bir iade yasağı değildir. Ayıplı mal hakları saklıdır.",
      },
      {
        id: "kapsam",
        title: "Ticari alımlar ve ürün sorunları",
        text: "Buradaki tüketici hakları, ticari veya mesleki amaç dışındaki alımlara yöneliktir. İşletme adına ticari amaçla yapılan alımlarda uygulanacak değişiklik ve iade koşullarını sipariş öncesinde ayrıca netleştirin. Yanlış, eksik veya sorunlu bir üründe durumu ve talebinizi WhatsApp üzerinden iletin.",
      },
    ],
  },
  preinformation: {
    title: "Sipariş öncesi bilgilendirme.",
    intro:
      "Siparişi kararlaştırmadan önce kontrol edeceğiniz bilgiler. Bu rehber, siparişe özel ön bilgilendirme formunun yerine geçmez.",
    sections: [
      {
        id: "satici",
        title: "Satıcı ve iletişim bilgileri",
        text: "Siparişe özel belgede satıcının resmî unvanını, açık adresini ve iletişim bilgilerini kontrol edin. Marka adı tek başına resmî satıcı kimliğinin yerine geçmez. Fatura düzenleyecek işletmeyle ödeme alıcısının bilgisini teyit edin.",
      },
      {
        id: "urun-bedel",
        title: "Ürün, toplam bedel ve ödeme",
        text: "Ürün adı, ölçü, malzeme, renk, adet ve paket içeriğini karşılaştırın. Vergiler dahil toplam tutarı, varsa kargo ve diğer giderleri, ödeme yöntemini yazılı teklifte görün. Belirsiz bir kalem varsa ödeme öncesinde sorun.",
      },
      {
        id: "teslim-haklar",
        title: "Teslimat, iptal ve iade koşulları",
        text: "Teslim edilecek adresi, hazırlık ve teslimat süresini, taşıyıcıyı, iade adresini ve cayma hakkına ilişkin bilgileri gözden geçirin. Kişiye özel bir üretim veya sipariş varsa ürüne uygulanacak koşulları özellikle sorun.",
      },
      {
        id: "kayit",
        title: "Bilgileri yazılı olarak saklayın",
        text: "Mesafeli tüketici sözleşmelerinde ödeme yükümlülüğü doğmadan önce ön bilgilendirme gerekir. Size iletilen sipariş özeti, koşullar, yazışmalar, fatura ve ödeme belgesini saklayın. Bu sitedeki teklif formu kendi başına ödeme almaz veya sipariş oluşturmaz.",
      },
    ],
  },
  contract: {
    title: "Mesafeli satış sözleşmesi.",
    intro:
      "Sözleşmenin kapsamı ve siparişe özel belgede bulunacak bilgiler hakkında genel rehber.",
    sections: [
      {
        id: "kapsam",
        title: "Bu sayfanın kapsamı",
        text: "Bu sayfa genel bilgilendirme sunar. Siparişe özel satıcı, alıcı, ürün, bedel ve teslim bilgileriyle hazırlanan sözleşmenin yerine geçmez. Sayfayı ziyaret etmek, üye olmak veya teklif formunu doldurmak tek başına satış sözleşmesi onayı değildir.",
      },
      {
        id: "taraflar",
        title: "Taraflar ve sözleşme konusu",
        text: "Siparişe özel sözleşmede satıcının resmî bilgileri, alıcı ve teslimat bilgileriyle birlikte satın alınacak ürünler açıkça belirtilmelidir. Ürün adı, çeşidi, ölçüsü, adedi ve varsa kişiselleştirme talebinin kararlaştırdığınız ürünle aynı olduğunu kontrol edin.",
      },
      {
        id: "kosullar",
        title: "Bedel, ödeme ve teslimat",
        text: "Toplam tutar, ödeme yöntemi, kargo ve diğer giderler ile teslimat koşullarını belgenin içinde netleştirin. Sözlü olarak konuşulan bir ayrıntı belgeye yansımadıysa onay vermeden önce düzeltme isteyin. Site üzerinde ödeme ekranı bulunmaz; teklif görüşmesi WhatsApp üzerinden yürütülür.",
      },
      {
        id: "haklar",
        title: "Cayma, iade ve başvuru yolları",
        text: "Cayma bildiriminin nasıl yapılacağı, iade adresi, taşıyıcı ve varsa ürüne özgü istisnalar siparişe özel belgede yer almalıdır. İptal ve iade sayfasındaki genel tüketici bilgilerini inceleyin. Uyuşmazlık durumunda işlemin niteliğine ve güncel parasal sınırlara göre tüketici hakem heyeti veya tüketici mahkemesi başvuru yollarını Ticaret Bakanlığının güncel rehberinden öğrenebilirsiniz.",
      },
    ],
  },
};
