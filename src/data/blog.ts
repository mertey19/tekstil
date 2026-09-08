export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  publishedAt: string;
  image: { src: string; alt: string };
  introduction: string;
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    tips?: string[];
    source?: { label: string; url: string };
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "mikrofiber-bez-nasil-yikanir",
    title: "Mikrofiber bez nasıl yıkanır?",
    category: "Bez bakımı",
    excerpt:
      "Yıkama, kurutma ve saklama adımlarında dikkat edeceğiniz küçük ayrıntılarla bezlerinize doğru bakım uygulayın.",
    publishedAt: "2026-09-08",
    image: {
      src: "/images/hero.webp",
      alt: "Katlanmış renkli mikrofiber bezlerden oluşan kompozisyon",
    },
    introduction:
      "Temizlik bittiğinde kullandığınız beze ayıracağınız birkaç dakika, bir sonraki kullanıma hazırlanmayı kolaylaştırır. Mikrofiber bezlerin hepsi aynı bakım koşullarına sahip değildir. Bu nedenle yıkamaya başlamadan önce ürünün etiketini okumak, rutin oluşturmanın ilk adımıdır. Günlük bakımınızı yıkama, kurutma ve saklama olarak üç aşamada düşünebilirsiniz.",
    sections: [
      {
        id: "bakim-etiketi",
        title: "Önce bakım etiketini okuyun",
        paragraphs: [
          "Makinede yıkanabilirlik, su sıcaklığı ve kurutma yöntemi ürüne göre değişir. Tüm mikrofiber bezler için tek bir sıcaklık belirlemek yerine üreticinin talimatını izleyin. Etiket okunmuyorsa sıcaklığı tahmin etmek yerine ürün bilgisini kontrol edin veya satıcıdan bakım talimatını isteyin.",
          "Örneğin Autoglym’in bir mikrofiber bitirme bezi düşük sıcaklıkta yıkama önerirken farklı dokudaki ürünler başka bakım koşulları taşıyabilir. Bir bezin talimatını diğerine doğrudan uygulamayın.",
        ],
        source: {
          label: "Autoglym — mikrofiber bez bakım talimatı",
          url: "https://www.autoglym.com/htcloth-hi-tech-finishing-cloth.html",
        },
      },
      {
        id: "yikama-hazirligi",
        title: "Bezleri ve yıkama ürünlerini ayırın",
        paragraphs: [
          "Yıkama öncesinde bezin üzerinde kalan parçacıkları kontrol edin. Cam için kullandığınız bezleri, araç jantı veya yağlı yüzeyler için ayırdığınız bezlerle karıştırmamak üzere ayrı biriktirin. Renk kodları ya da sepetlere ekleyeceğiniz küçük etiketler bu düzeni korumayı kolaylaştırır.",
          "Yumuşatıcı mikrofiberin işlevini olumsuz etkileyebilir. Deterjanın içeriğini de kontrol ederek yumuşatıcı içermeyen bir ürün seçin; miktar için deterjanın ve bezin kullanım talimatını esas alın.",
        ],
        source: {
          label: "Vileda — kumaş türüne göre bakım önerileri",
          url: "https://www.vileda.co.uk/cleanspiration/laundry-care/clothing-care-tips-by-fabric",
        },
      },
      {
        id: "kurutma-saklama",
        title: "Kurutun, kontrol edin, sonra kaldırın",
        paragraphs: [
          "Yıkama programından sonra bezin bakım etiketindeki kurutma yöntemini uygulayın. Kurutma makinesine uygunluğu belirtilmemişse yüksek ısıyı varsayılan seçenek olarak kullanmayın. Bezleri üst üste yığmak yerine açarak kurutmak, her birini kontrol etmenizi de kolaylaştırır.",
          "Tamamen kuruyan bezleri temiz bir yerde, kullanım alanlarına göre saklayın. Yeniden kullanmadan önce sertleşmiş bir bölüm, yüzeye yapışmış parçacık veya sökülmüş kenar olup olmadığına bakın. Uygun görünmeyen bezi hassas yüzeyler için ayırdığınız gruptan çıkarın.",
        ],
      },
      {
        id: "bakim-rutini",
        title: "Kolay bir bakım rutini oluşturun",
        paragraphs: [
          "Bezleri kaldırdığınız yerde basit bir düzen kurmanız yeterli. Böylece temizlik sırasında hangi bezin temiz, hangisinin yıkanmayı beklediğini yeniden düşünmek zorunda kalmazsınız.",
        ],
        tips: [
          "Temiz ve kullanılmış bezler için iki ayrı alan belirleyin.",
          "Bakım etiketini veya ürünün bakım bilgisini saklayın.",
          "Cam, mutfak ve araç bezlerini kullanım alanına göre gruplandırın.",
          "Her kullanımdan önce bezin temizliğini ve yüzeyini kontrol edin.",
        ],
      },
    ],
  },
  {
    slug: "cam-ve-ayna-temizligi-ipuclari",
    title: "Cam ve ayna temizliğinde daha berrak sonuçlar",
    category: "Temizlik ipuçları",
    excerpt:
      "Doğru bez, kontrollü nem ve ayrı bir kurulama adımıyla cam ve ayna temizliğinizi daha düzenli hale getirin.",
    publishedAt: "2026-09-08",
    image: {
      src: "/images/glass.webp",
      alt: "Cam temizliği konusuna eşlik eden mikrofiber bez görseli",
    },
    introduction:
      "Camı sildikten sonra farklı bir açıdan bakınca fark edilen izler can sıkıcı olabilir. Daha düzenli bir çalışma için temizlik ve son kurulama aşamalarını ayrı planlayın. Başlamadan önce camın veya aynanın bakım bilgisine bakın; özellikle kaplamalı yüzeylerde, yüzey üreticisinin önerdiği bez ve temizleyiciyi seçin.",
    sections: [
      {
        id: "bezi-secin",
        title: "Cam için ayırdığınız temiz bezle başlayın",
        paragraphs: [
          "Kullandığınız bezin cam yüzeylere uygun olduğunu ürün açıklamasından kontrol edin. Mutfak tezgâhında ya da araç bakımında kullandığınız bezi doğrudan cama taşımak yerine bu iş için ayrı bir bez bulundurun. Silmeye başlamadan önce bezi açıp her iki yüzünü de inceleyin.",
          "Hazırlık sırasında bir temizlik bezi ve son geçiş için temiz, kuru bir cam bezi ayırmak işinizi kolaylaştırır. Kullanacağınız temizleyici varsa onu da yüzeyin bakım talimatına göre seçin.",
        ],
      },
      {
        id: "nemi-kontrol-edin",
        title: "Temizlik ve kurulama adımlarını ayırın",
        paragraphs: [
          "Yüzeye uygun temizlik işlemini yaptıktan sonra kalan nemi cam için uygun kuru bezle alın. E-Cloth’un cam bezi kullanım önerisi de temiz ve nemli yüzeyde katlanmış bezle son geçiş yapılmasına dayanır. Bu yaklaşımı kendi bezinizin talimatıyla birlikte değerlendirin.",
          "Büyük bir camı tek seferde tamamlamaya çalışmak yerine küçük bölümlerde ilerleyebilirsiniz. Önce bir bölümü temizleyin, ardından kuru bezle üzerinden geçip sonucu kontrol edin. Kurulama beziniz ıslandığında temiz ve kuru bir bezle devam edin.",
        ],
        source: {
          label: "E-Cloth — cam ve parlatma bezi kullanım bilgisi",
          url: "https://uk.e-cloth.com/products/glpc-glass-polishing-cloth",
        },
      },
      {
        id: "katlayarak-kullanin",
        title: "Bezi katlayın, temiz yüzüne geçin",
        paragraphs: [
          "Bezi katlayarak elinizin altında düz ve kontrol edilebilir bir yüzey oluşturun. Bir bölümü kirlenince katı çevirip temiz tarafını kullanın. Tüm yüzleri kirlendiğinde aynı bezle devam etmek yerine temiz bir bez alın.",
          "Her geçişte nereden başladığınızı takip etmek için örneğin yukarıdan aşağıya doğru ilerleyen bir sıra belirleyin. Aynı sırayı izlemek, tamamladığınız bölümleri görmenizi ve gözden kaçan alanlara geri dönmenizi kolaylaştırır.",
        ],
      },
      {
        id: "son-kontrol",
        title: "Sonucu farklı açılardan kontrol edin",
        paragraphs: [
          "İşiniz bittiğinde camı ya da aynayı farklı açılardan inceleyin. İz gördüğünüzde önce bezin temiz ve kuru olduğunu kontrol edin; temizlik ürününü artırmak yerine yüzey ve ürün talimatını yeniden gözden geçirin. Kalıcı lekelerin farklı bir bakım yöntemi gerektirebileceğini unutmayın.",
        ],
        tips: [
          "Cam bezini diğer temizlik bezlerinden ayrı tutun.",
          "Son geçiş için temiz ve kuru bir bez ayırın.",
          "Kirlenen bez yüzüyle silmeye devam etmeyin.",
          "Kullandıktan sonra bezinizi kendi bakım talimatına göre yıkayın.",
        ],
      },
    ],
  },
  {
    slug: "arac-temizliginde-mikrofiber-bez-kullanimi",
    title: "Araç temizliğinde mikrofiber bez kullanımı",
    category: "Araç bakımı",
    excerpt:
      "Kaporta, cam, jant ve iç mekân için bezlerinizi ayırın; yıkamadan kurulamaya kadar kullanımı doğru planlayın.",
    publishedAt: "2026-09-08",
    image: {
      src: "/images/auto.webp",
      alt: "Araç bakımında kullanılan bezleri temsil eden mikrofiber ürün kompozisyonu",
    },
    introduction:
      "Araç temizliğinde bez seçerken önce hangi işi yapacağınızı belirleyin. Yıkama, kurulama, cam temizliği ve iç yüzey bakımı farklı adımlardır. Her işi aynı bezle tamamlamak yerine bu adımları ayıran küçük bir set hazırlamak, temizlik boyunca bezlerin kullanımını takip etmenize yardımcı olur.",
    sections: [
      {
        id: "goreve-gore-ayirin",
        title: "Bezleri görevlerine göre ayırın",
        paragraphs: [
          "Kaporta ve jant için kullandığınız ekipmanı ayrı tutun. Autoglym de jantta kullanılan yıkama eldiveninin yalnızca bu iş için ayrılmasını, kaportada farklı bir eldiven kullanılmasını önerir. Bezlerinizi düzenlerken de aynı ayrımı uygulayabilirsiniz.",
          "Örneğin bir grubu dış yüzey kurulamasına, bir grubu camlara, bir grubu da araç içine ayırın. Seçtiğiniz renklerin özel bir anlamı olmak zorunda değil; önemli olan oluşturduğunuz düzeni her temizlikte korumanızdır.",
        ],
        source: {
          label: "Autoglym — jant ve kaporta ekipmanını ayırma önerisi",
          url: "https://www.autoglym.com/mwmitt-microfibre-wash-mitt.html",
        },
      },
      {
        id: "yikama-ve-kurulama",
        title: "Yıkamadan sonra kurulamaya geçin",
        paragraphs: [
          "Aracın bakım talimatına uygun bir yıkama yöntemi kullanın. Autoglym’in şampuan kullanım adımları, serin yüzeyde çalışmayı, yukarıdan aşağıya ilerlemeyi ve durulamadan sonra mikrofiber kurulama bezi kullanmayı önerir. Kullandığınız ürünün uygulama sırası ve miktarı için kendi etiketini izleyin.",
          "Kurulama bezini temiz bir yerde hazır tutun. İşe başlamadan önce üzerinde parçacık bulunmadığını kontrol edin. Bezi yere düşürdüğünüzde doğrudan kaportaya sürmek yerine temiz bir bezle değiştirin; kirlenen bezi yıkanacaklar arasına alın.",
        ],
        source: {
          label: "Autoglym — yıkama, durulama ve kurulama adımları",
          url: "https://www.autoglym.com/za/uhdskit-ultra-high-definition-shampoo.html",
        },
      },
      {
        id: "yuzeye-uygunluk",
        title: "İç yüzeylerde uygunluğu ayrıca kontrol edin",
        paragraphs: [
          "Araç içindeki cam, ekran, deri ve plastik bölümleri aynı yüzey gibi değerlendirmeyin. Bez ve temizleyici seçimini her bölümün bakım talimatına göre yapın. Bir ürünün kaporta için uygun olması, ekranda veya deri döşemede de kullanılabileceği anlamına gelmez.",
          "Ürün satın alırken kullanım amacınızı açıkça belirtin. “Araç için bez” demek yerine cam temizliği, dış yüzey kurulaması veya belirli bir iç yüzeyin bakımı için ürün aradığınızı söylemek, seçenekleri değerlendirmeyi kolaylaştırır.",
        ],
      },
      {
        id: "setinizi-hazirlayin",
        title: "Bir sonraki kullanım için setinizi hazırlayın",
        paragraphs: [
          "İşiniz bittiğinde kullanılan bezleri temizlerden ayırın ve her birini kendi bakım talimatına göre temizleyin. Kuruyan bezleri gruplarına geri koyun. Basit bir kontrol listesi, araç temizliğine başlarken eksiklerinizi görmenize yardımcı olur.",
        ],
        tips: [
          "Jant, kaporta, cam ve iç mekân ekipmanları ayrı mı?",
          "Kurulama için temiz bir bez hazır mı?",
          "Bez ve temizleyici, işlem yapılacak yüzeye uygun mu?",
          "Kirlenen bezleri koyabileceğiniz ayrı bir alan var mı?",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function readingMinutes(post: BlogPost) {
  const text = [
    post.introduction,
    ...post.sections.flatMap((section) => [
      section.title,
      ...section.paragraphs,
      ...(section.tips ?? []),
    ]),
  ].join(" ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 180));
}

export function blogDate(date: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(new Date(`${date}T12:00:00+03:00`));
}
