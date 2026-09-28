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
      "Ürün seçimi, misafir alışverişi, iyzico ile güvenli ödeme, teslimat ve iade hakkında merak edilenler bir arada.",
    sections: [
      {
        id: "teklif",
        title: "Nasıl sipariş verebilirim?",
        text: "Satışa açık ürünlerde adedi seçip Sepete Ekle düğmesini kullanın. Sepette ürünleri ve toplam tutarı kontrol ettikten sonra üyelik oluşturmadan teslimat bilgilerinizi girin. Ödeme iyzico’nun güvenli ödeme sayfasında tamamlanır. Bilgi veya toplu teklif için ayrıca WhatsApp’tan yazabilirsiniz.",
      },
      {
        id: "fiyat",
        title: "Fiyat, stok ve kargo tutarını nerede görürüm?",
        text: "Satışa açık ürünün vergiler dahil fiyatı ürün sayfasında görünür. Seçtiğiniz adet, ara toplam, kargo bedeli ve ödenecek toplam sepette ve ödeme adımında gösterilir. Toplu alım veya satışa kapalı ürünler için WhatsApp’tan teklif isteyebilirsiniz.",
      },
      {
        id: "uyelik",
        title: "Teklif almak için üye olmam gerekiyor mu?",
        text: "Hayır. Alışveriş misafir olarak tamamlanır; kayıt veya giriş gerekmez. Teslimat ve fatura bilgileri yalnızca siparişin kurulması ve yürütülmesi için alınır.",
      },
      {
        id: "odeme",
        title: "Ödeme nasıl ve nerede alınır?",
        text: "Ödeme, iyzico’nun güvenli ödeme altyapısında Visa veya Mastercard kartla yapılır. Kart numarası ve güvenlik kodu bu site tarafından kaydedilmez. Başarılı ödemenin ardından sipariş numaranız ekranda gösterilir.",
      },
      {
        id: "teslimat",
        title: "Teslimat süresi ve kargo ücreti nedir?",
        text: "Kargo bedeli ödeme öncesinde sepette gösterilir. Sipariş hazırlandıktan sonra yönetici sipariş durumunu günceller. Teslimat ve takip ayrıntıları için sipariş numaranızla WhatsApp üzerinden bize ulaşabilirsiniz.",
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
      "Ürününüzü sepete ekleyin, teslimat bilgilerini girin ve iyzico’nun güvenli ödeme sayfasında siparişinizi tamamlayın.",
    sections: [
      {
        id: "urun-secimi",
        title: "01 · Ürünü seçin ve sepete ekleyin",
        text: "Ürün sayfasında ölçü, malzeme, paket içeriği, satış fiyatı ve stok bilgisini kontrol edin. Adedi seçip ürünü sepete ekleyin. Satışa kapalı bir ürün veya toplu alım için Bilgi ve Teklif Al bağlantısını kullanabilirsiniz.",
      },
      {
        id: "teklif",
        title: "02 · Teklifin ayrıntılarını kontrol edin",
        text: "Sepette ürünleri, adetleri, vergiler dahil ara toplamı, kargo bedelini ve ödenecek toplamı kontrol edin. Minimum sipariş veya ücretsiz kargo eşiği varsa burada gösterilir.",
      },
      {
        id: "onay",
        title: "03 · Sipariş bilgilerinizi teyit edin",
        text: "Üyelik oluşturmadan ad soyad, telefon, teslimat adresi ve fatura bilgilerini girin. Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okuyup onaylayın. Sipariş özeti ödeme düğmesinin yanında kalır.",
      },
      {
        id: "gonderim",
        title: "04 · Gönderi bilgilerini öğrenin",
        text: "Kart ödemesi iyzico’nun güvenli sayfasında alınır. Başarılı ödeme sonrasında sipariş numarası oluşturulur. Hazırlık ve gönderim durumunu bu numarayla WhatsApp üzerinden sorabilirsiniz.",
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
        text: "Sipariş numaranızı, adınızı ve talebinizi WhatsApp üzerinden iletin. İade adresi ve anlaşmalı taşıyıcı bilgisi bu sayfanın Satıcı bilgileri bölümünde yer alır. Gönderim yapmadan önce siparişinize uygulanacak taşıyıcı kodunu teyit edin ve gönderi belgesini saklayın.",
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
      "Ödeme yükümlülüğü doğmadan önce satıcı, ürün, bedel, teslimat, cayma ve iade bilgilerini kontrol edin. Siparişe özel ürün ve tutarlar ödeme ekranında gösterilir.",
    sections: [
      {
        id: "satici",
        title: "Satıcı ve iletişim bilgileri",
        text: "Siparişe özel belgede satıcının resmî unvanını, açık adresini ve iletişim bilgilerini kontrol edin. Marka adı tek başına resmî satıcı kimliğinin yerine geçmez. Fatura düzenleyecek işletmeyle ödeme alıcısının bilgisini teyit edin.",
      },
      {
        id: "urun-bedel",
        title: "Ürün, toplam bedel ve ödeme",
        text: "Ürün adı, ölçü, malzeme, renk, adet ve paket içeriğini karşılaştırın. Vergiler dahil ara toplam, kargo gideri ve ödenecek toplam sipariş özetinde gösterilir. Ödeme iyzico altyapısıyla karttan alınır.",
      },
      {
        id: "teslim-haklar",
        title: "Teslimat, iptal ve iade koşulları",
        text: "Teslim edilecek adresi, hazırlık ve teslimat süresini, taşıyıcıyı, iade adresini ve cayma hakkına ilişkin bilgileri gözden geçirin. Kişiye özel bir üretim veya sipariş varsa ürüne uygulanacak koşulları özellikle sorun.",
      },
      {
        id: "kayit",
        title: "Bilgileri yazılı olarak saklayın",
        text: "Ödeme düğmesine basmadan önce ön bilgilendirme ve mesafeli satış sözleşmesi onaylanır. Onay zamanı, satıcı bilgileri, ürünler ve toplamlar sipariş kaydıyla birlikte saklanır. Sipariş ve ödeme belgenizi ayrıca saklayın.",
      },
    ],
  },
  contract: {
    title: "Mesafeli satış sözleşmesi.",
    intro:
      "Bu metin, sitede kurulacak mesafeli satışın genel koşullarını açıklar; siparişe özel ürün, alıcı, teslimat ve tutar bilgileri ödeme adımındaki sipariş özetiyle birlikte sözleşmenin ayrılmaz parçasıdır.",
    sections: [
      {
        id: "kapsam",
        title: "Bu sayfanın kapsamı",
        text: "Sözleşme; ödeme adımında gösterilen satıcı, alıcı, ürün, adet, bedel ve teslimat bilgileriyle birlikte kurulur. Sepeti görüntülemek veya teklif formunu doldurmak tek başına satış sözleşmesi onayı değildir; sözleşme kutusunun işaretlenmesi ve ödeme işleminin tamamlanması gerekir.",
      },
      {
        id: "taraflar",
        title: "Taraflar ve sözleşme konusu",
        text: "Siparişe özel sözleşmede satıcının resmî bilgileri, alıcı ve teslimat bilgileriyle birlikte satın alınacak ürünler açıkça belirtilmelidir. Ürün adı, çeşidi, ölçüsü, adedi ve varsa kişiselleştirme talebinin kararlaştırdığınız ürünle aynı olduğunu kontrol edin.",
      },
      {
        id: "kosullar",
        title: "Bedel, ödeme ve teslimat",
        text: "Vergiler dahil ürün toplamı, kargo gideri ve ödenecek toplam ödeme adımında gösterilir. Ödeme iyzico altyapısı üzerinden kartla alınır. Satıcı kart verilerini görmez veya saklamaz. Başarılı ödeme sonrasında sipariş numarası oluşturulur.",
      },
      {
        id: "haklar",
        title: "Cayma, iade ve başvuru yolları",
        text: "Cayma bildiriminin nasıl yapılacağı, iade adresi, taşıyıcı ve varsa ürüne özgü istisnalar siparişe özel belgede yer almalıdır. İptal ve iade sayfasındaki genel tüketici bilgilerini inceleyin. Uyuşmazlık durumunda işlemin niteliğine ve güncel parasal sınırlara göre tüketici hakem heyeti veya tüketici mahkemesi başvuru yollarını Ticaret Bakanlığının güncel rehberinden öğrenebilirsiniz.",
      },
    ],
  },
};
