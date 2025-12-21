// SEVIYE BAZLI SORU SİSTEMİ ÖRNEĞİ
// Bu dosya seviye bazlı soru yapısının nasıl olacağını gösterir
// İlk modül için detaylı örnek

const exampleModuleWithLevels = {
  id: 1,
  category: "Büyüme ve Değer",
  title: "Maaş Yükseltme / Ücret Pazarlığı",
  description: "Maaş pazarlığı süreçlerinde değerinizi koruyun ve artırın.",
  icon: "💰",
  questionsByLevel: {
    // SEVIYE 1: BAŞLANGIÇ (0-3 modül tamamlandı)
    level1: [
      {
        id: "q1_l1",
        text: "Ücret talebini iletmeden önce elinizdeki en güçlü koz neydi?",
        options: [
          { id: "A", text: "Piyasa verisi", score: { strategy: 10, confidence: 8 } },
          { id: "B", text: "Rakip teklifi", score: { strategy: 8, confidence: 10 } },
          { id: "C", text: "Geçen yılki performansım", score: { strategy: 6, confidence: 6 } },
          { id: "D", text: "Kişisel ihtiyaçlarım", score: { strategy: 2, confidence: 3 } }
        ]
      },
      {
        id: "q2_l1",
        text: "İlk karşı teklifi aldığınızda tepkiniz ne oldu?",
        options: [
          { id: "A", text: "Hemen kabul ettim", score: { strategy: 2, confidence: 2 } },
          { id: "B", text: "Hayal kırıklığımı belirttim", score: { strategy: 4, confidence: 5 } },
          { id: "C", text: "Verilere dayanarak itiraz ettim", score: { strategy: 10, confidence: 9 } },
          { id: "D", text: "Bir süre düşünmek için zaman istedim", score: { strategy: 7, confidence: 7 } }
        ]
      },
      {
        id: "q3_l1",
        text: "Görüşmede sadece kendi ihtiyaçlarınızı mı konuştunuz, yoksa şirkete katacağınız değeri mi vurguladınız?",
        options: [
          { id: "A", text: "Değere odaklandım", score: { strategy: 9, professional: 10 } },
          { id: "B", text: "İhtiyaca odaklandım", score: { strategy: 3, professional: 4 } },
          { id: "C", text: "İkisini de dengede tuttum", score: { strategy: 10, professional: 8 } },
          { id: "D", text: "Sadece kendi ihtiyaçlarımı belirttim", score: { strategy: 1, professional: 2 } }
        ]
      },
      {
        id: "q4_l1",
        text: "Maaş görüşmesine hazırlanmak için ne kadar süre harcadınız?",
        options: [
          { id: "A", text: "1-2 gün", score: { preparation: 4, strategy: 4 } },
          { id: "B", text: "3-5 gün", score: { preparation: 7, strategy: 7 } },
          { id: "C", text: "1 hafta veya daha fazla", score: { preparation: 10, strategy: 10 } },
          { id: "D", text: "Hazırlanmadım, spontane gittim", score: { preparation: 1, strategy: 1 } }
        ]
      },
      {
        id: "q5_l1",
        text: "Maaş görüşmesinde kullandığınız ana argüman hangisiydi?",
        options: [
          { id: "A", text: "Piyasa araştırması ve benzer pozisyonlar", score: { research: 10, strategy: 9 } },
          { id: "B", text: "Son dönem başarılarım", score: { research: 7, strategy: 8 } },
          { id: "C", text: "Kişisel finansal ihtiyaçlarım", score: { research: 2, strategy: 3 } },
          { id: "D", text: "Uzun süredir çalışıyor olmam", score: { research: 4, strategy: 5 } }
        ]
      }
    ],
    
    // SEVIYE 2: ORTA (4-6 modül tamamlandı) - Daha profesyonel sorular
    level2: [
      {
        id: "q1_l2",
        text: "Maaş görüşmesi öncesi topladığınız verileri nasıl analiz ettiniz ve hangi metrikleri kullandınız?",
        options: [
          { id: "A", text: "Sadece ortalama maaş verilerini topladım", score: { analysis: 5, dataDriven: 5 } },
          { id: "B", text: "Pozisyon bazlı, şirket büyüklüğüne göre segmentasyon yaptım", score: { analysis: 8, dataDriven: 9 } },
          { id: "C", text: "Detaylı benchmark analizi: sektör, lokasyon, deneyim, yetenek seti", score: { analysis: 10, dataDriven: 10 } },
          { id: "D", text: "Sosyal medyadan gördüğüm rakamları kullandım", score: { analysis: 2, dataDriven: 2 } },
          { id: "E", text: "Benzer pozisyondaki kişilerle birebir görüşmeler yaptım ve çapraz doğrulama yaptım", score: { analysis: 9, dataDriven: 10 } }
        ]
      },
      {
        id: "q2_l2",
        text: "Karşı teklif aldığınızda, şirketin bütçe kısıtlarını anlamak için hangi yaklaşımı kullandınız?",
        options: [
          { id: "A", text: "Direkt bütçe sorum çünkü şeffaflık önemli", score: { negotiation: 7, transparency: 8 } },
          { id: "B", text: "Dolaylı sorularla bütçe aralığını anlamaya çalıştım", score: { negotiation: 9, transparency: 7 } },
          { id: "C", text: "Bütçeyi sormadım, sadece kendi beklentimi belirttim", score: { negotiation: 4, transparency: 5 } },
          { id: "D", text: "Bütçe yoksa başka değer yaratıcı öneriler sundum (hisse, ek izin vb.)", score: { negotiation: 10, creativity: 10 } },
          { id: "E", text: "Önce bütçe aralığını öğrenip sonra kendi teklifimi bu aralığa göre şekillendirdim", score: { negotiation: 10, strategy: 10 } }
        ]
      },
      {
        id: "q3_l2",
        text: "Görüşmede şirkete katacağınız değeri nasıl ölçülebilir şekilde sundunuz?",
        options: [
          { id: "A", text: "Genel yeteneklerimden bahsettim", score: { valueProp: 4, metrics: 3 } },
          { id: "B", text: "Geçmiş projelerdeki başarılarımı sayısal verilerle gösterdim", score: { valueProp: 8, metrics: 9 } },
          { id: "C", text: "ROI hesaplamaları ve gelecek projeksiyonlar sundum", score: { valueProp: 10, metrics: 10 } },
          { id: "D", text: "Sadece kişisel hedeflerimi paylaştım", score: { valueProp: 2, metrics: 2 } },
          { id: "E", text: "Hem geçmiş performans hem de gelecek potansiyeli verilerle destekledim", score: { valueProp: 10, metrics: 10 } }
        ]
      },
      {
        id: "q4_l2",
        text: "Görüşme sırasında tıkanma yaşandığında hangi stratejik manevrayı kullandınız?",
        options: [
          { id: "A", text: "Talebi geri çektim ve razı oldum", score: { strategy: 2, persistence: 2 } },
          { id: "B", text: "Farklı açılardan aynı talebi tekrar formüle ettim", score: { strategy: 7, persistence: 8 } },
          { id: "C", text: "Paket yaklaşımı: maaş + ek faydalar kombinasyonu önerdim", score: { strategy: 10, creativity: 10 } },
          { id: "D", text: "Zaman isteyip daha sonra tekrar görüşmeyi önerdim", score: { strategy: 8, patience: 9 } },
          { id: "E", text: "Karşı tarafın endişelerini dinleyip çözüm odaklı alternatifler sundum", score: { strategy: 10, empathy: 10 } }
        ]
      },
      {
        id: "q5_l2",
        text: "Maaş görüşmesinde zamanlama stratejiniz neydi ve bunu nasıl belirlediniz?",
        options: [
          { id: "A", text: "Rastgele bir zaman seçtim", score: { timing: 2, strategy: 2 } },
          { id: "B", text: "Yıllık değerlendirme dönemini bekledim", score: { timing: 7, strategy: 7 } },
          { id: "C", text: "Büyük bir başarı sonrası momentum oluştuğunda", score: { timing: 9, strategy: 9 } },
          { id: "D", text: "Şirketin bütçe planlama döngüsünü araştırıp ona göre zamanladım", score: { timing: 10, strategy: 10 } },
          { id: "E", text: "Hem performans hem bütçe döngüsünü göz önünde bulundurarak optimal zamanı hesapladım", score: { timing: 10, strategy: 10 } }
        ]
      },
      {
        id: "q6_l2",
        text: "Eğer maaş artışı mümkün olmasaydı, hangi alternatif değer önerilerini hazırlamıştınız?",
        options: [
          { id: "A", text: "Hiçbir alternatif düşünmedim", score: { planning: 1, flexibility: 1 } },
          { id: "B", text: "Ek izin veya esnek çalışma", score: { planning: 6, flexibility: 7 } },
          { id: "C", text: "Eğitim bütçesi, konferans katılımı, sertifikasyon", score: { planning: 8, development: 9 } },
          { id: "D", text: "Hisse senedi veya performans bonusu yapısı", score: { planning: 9, finance: 9 } },
          { id: "E", text: "Kapsamlı paket: eğitim + ek izin + gelecek dönem artış garantisi", score: { planning: 10, strategy: 10 } }
        ]
      }
    ],
    
    // SEVIYE 3: İLERİ (7+ modül tamamlandı) - Çok profesyonel ve detaylı
    level3: [
      {
        id: "q1_l3",
        text: "Maaş pazarlığında 'batık maliyet yanılgısı' ile 'gelecek değer analizi' arasındaki dengede, şirketinizin sizin üzerindeki yatırımını nasıl kullandınız?",
        options: [
          { id: "A", text: "Bu kavramları bilmiyordum, basit talepte bulundum", score: { strategicThinking: 2, businessAcumen: 2 } },
          { id: "B", text: "Şirketin eğitim ve gelişim yatırımlarını vurguladım", score: { strategicThinking: 7, businessAcumen: 7 } },
          { id: "C", text: "ROI hesaplaması: şirketin yatırımı vs. kaybetme maliyeti + yeniden işe alma maliyeti", score: { strategicThinking: 10, businessAcumen: 10 } },
          { id: "D", text: "Rakip şirketlerin tekliflerini kullanarak piyasa değerimi gösterdim", score: { strategicThinking: 8, leverage: 9 } },
          { id: "E", text: "Hem batık maliyet hem gelecek değeri analiz edip, şirketin stratejik çıkarlarıyla uyumlu bir teklif sundum", score: { strategicThinking: 10, businessAcumen: 10 } }
        ]
      },
      {
        id: "q2_l3",
        text: "Görüşmede 'anchoring bias' (çapa etkisi) stratejisini kullanarak ilk teklifinizi nasıl belirlediniz?",
        options: [
          { id: "A", text: "İlk teklifimi düşük tuttum ki makul görüneyim", score: { psychology: 3, negotiation: 4 } },
          { id: "B", text: "Piyasa ortalamasını kullandım", score: { psychology: 5, negotiation: 6 } },
          { id: "C", text: "Yüksek ama savunulabilir bir aralık belirledim (75. persentil)", score: { psychology: 9, negotiation: 9 } },
          { id: "D", text: "Piyasanın üst %10'unu hedefledim ve verilerle destekledim", score: { psychology: 10, negotiation: 10 } },
          { id: "E", text: "Stratejik olarak iki seviye belirledim: ideal ve minimum, görüşmenin seyrine göre yönlendirdim", score: { psychology: 10, strategy: 10 } }
        ]
      },
      {
        id: "q3_l3",
        text: "Maaş görüşmesinde 'BATNA' (Best Alternative to a Negotiated Agreement) analiziniz neydi ve bu kararlarınızı nasıl etkiledi?",
        options: [
          { id: "A", text: "BATNA nedir bilmiyordum", score: { negotiation: 2, strategy: 2 } },
          { id: "B", text: "Başka bir iş teklifim vardı ama görüşmede bahsetmedim", score: { negotiation: 6, strategy: 7 } },
          { id: "C", text: "Açık bir BATNA analizi yaptım: alternatifler, maliyetler, fırsatlar", score: { negotiation: 9, strategy: 10 } },
          { id: "D", text: "BATNA'yı görüşmede dolaylı olarak ima ettim", score: { negotiation: 8, strategy: 8 } },
          { id: "E", text: "Hem kendi BATNA'mı hem şirketin BATNA'sını analiz edip, win-win noktasını buldum", score: { negotiation: 10, strategy: 10 } }
        ]
      },
      {
        id: "q4_l3",
        text: "Maaş pazarlığında 'win-win' sonucu için şirketinizin gizli motivasyonlarını (ör. retention, piyasa pozisyonu, ekip dinamikleri) nasıl keşfettiniz?",
        options: [
          { id: "A", text: "Sadece kendi çıkarıma odaklandım", score: { empathy: 2, strategicThinking: 3 } },
          { id: "B", text: "Yöneticimin söylediklerini dinledim", score: { empathy: 5, strategicThinking: 5 } },
          { id: "C", text: "Şirket içi trendleri ve ekip dinamiklerini analiz ettim", score: { empathy: 8, strategicThinking: 9 } },
          { id: "D", text: "HR ve yöneticiyle farklı görüşmeler yaparak motivasyonları anladım", score: { empathy: 9, strategicThinking: 9 } },
          { id: "E", text: "Kapsamlı analiz: şirket kültürü, sektör durumu, ekip yapısı, stratejik öncelikler ve bunları çözüm önerilerime entegre ettim", score: { empathy: 10, strategicThinking: 10 } }
        ]
      },
      {
        id: "q5_l3",
        text: "Maaş görüşmesinde 'non-monetary compensation' kavramını kullanarak toplam değer teklifini nasıl optimize ettiniz?",
        options: [
          { id: "A", text: "Sadece maaşı düşündüm", score: { totalComp: 2, optimization: 2 } },
          { id: "B", text: "Maaş + sağlık sigortası + izin", score: { totalComp: 6, optimization: 6 } },
          { id: "C", text: "Vergi optimizasyonu, esnek çalışma, eğitim bütçesi, hisse senedi dahil paket", score: { totalComp: 9, optimization: 9 } },
          { id: "D", text: "Kişisel durumuma göre optimize edilmiş paket: vergi avantajları + ihtiyaçlarım", score: { totalComp: 10, optimization: 10 } },
          { id: "E", text: "Hem kısa hem uzun vadeli değeri maksimize eden, şirket bütçesine uyumlu, stratejik paket tasarladım", score: { totalComp: 10, optimization: 10 } }
        ]
      },
      {
        id: "q6_l3",
        text: "Maaş görüşmesinde 'information asymmetry'yi lehinize çevirmek için hangi veri ve analiz stratejilerini kullandınız?",
        options: [
          { id: "A", text: "Her iki tarafın da bildiği bilgileri kullandım", score: { dataStrategy: 4, advantage: 4 } },
          { id: "B", text: "Piyasa araştırması yaptım", score: { dataStrategy: 6, advantage: 6 } },
          { id: "C", text: "İç piyasa verileri, rakip analizi, sektör trendleri, rol özellikleri", score: { dataStrategy: 9, advantage: 9 } },
          { id: "D", text: "Şirket içi benchmark ve dış piyasa çapraz doğrulama", score: { dataStrategy: 10, advantage: 9 } },
          { id: "E", text: "Çok katmanlı veri: iç piyasa + dış piyasa + sektör + rol + performans + gelecek potansiyel + alternatif maliyet analizi", score: { dataStrategy: 10, advantage: 10 } }
        ]
      },
      {
        id: "q7_l3",
        text: "Maaş pazarlığı sonrası, uzun vadeli kariyer stratejinizle uyumlu olacak şekilde nasıl bir 'escalation clause' veya 'review mechanism' talep ettiniz?",
        options: [
          { id: "A", text: "Hiç düşünmedim, sadece şu anki maaşı aldım", score: { longTerm: 2, planning: 2 } },
          { id: "B", text: "Yıllık artış beklentisini sözlü olarak belirttim", score: { longTerm: 5, planning: 5 } },
          { id: "C", text: "6 aylık performans review'da artış şartı koydum", score: { longTerm: 7, planning: 8 } },
          { id: "D", text: "Yazılı anlaşma: hedefler, ölçümler, otomatik artış mekanizması", score: { longTerm: 9, planning: 10 } },
          { id: "E", text: "Stratejik plan: kısa vadeli hedefler + orta vadeli milestone'lar + uzun vadeli career path ile entegre artış yapısı", score: { longTerm: 10, planning: 10 } }
        ]
      }
    ]
  }
};

// Bu yapıyı backend'de kullanmak için:
// - getUserLevel() ile kullanıcı seviyesini belirle
// - questionsByLevel[level1/level2/level3] ile ilgili soruları getir
// - Soruları questions array'ine dönüştür

module.exports = { exampleModuleWithLevels };

