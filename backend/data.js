const modules = [
  {
    id: 1,
    category: "Büyüme ve Değer",
    title: "Maaş Yükseltme / Ücret Pazarlığı",
    description: "Maaş pazarlığı süreçlerinde değerinizi koruyun ve artırın.",
    icon: "💰",
    questions: [
      {
        id: "q1",
        text: "Ücret talebini iletmeden önce elinizdeki en güçlü koz neydi?",
        options: [
          { id: "A", text: "Piyasa verisi", score: { strategy: 10, confidence: 8 } },
          { id: "B", text: "Rakip teklifi", score: { strategy: 8, confidence: 10 } },
          { id: "C", text: "Geçen yılki performansım", score: { strategy: 6, confidence: 6 } }
        ]
      },
      {
        id: "q2",
        text: "İlk karşı teklifi aldığınızda tepkiniz ne oldu?",
        options: [
          { id: "A", text: "Hemen kabul ettim", score: { strategy: 2, confidence: 2 } },
          { id: "B", text: "Hayal kırıklığımı belirttim", score: { strategy: 4, confidence: 5 } },
          { id: "C", text: "Verilere dayanarak itiraz ettim", score: { strategy: 10, confidence: 9 } }
        ]
      },
      {
        id: "q3",
        text: "Görüşmede sadece kendi ihtiyaçlarınızı mı konuştunuz, yoksa şirkete katacağınız değeri mi vurguladınız?",
        options: [
          { id: "A", text: "Değere odaklandım", score: { strategy: 9, professional: 10 } },
          { id: "B", text: "İhtiyaca odaklandım", score: { strategy: 3, professional: 4 } },
          { id: "C", text: "İkisini de dengede tuttum", score: { strategy: 10, professional: 8 } }
        ]
      }
    ]
  },
  {
    id: 2,
    category: "Büyüme ve Değer",
    title: "Terfi / Pozisyon Yükseltme",
    description: "Kariyer basamaklarını tırmanırken doğru zamanlama ve strateji.",
    icon: "⬆️",
    questions: [
      {
        id: "q1",
        text: "Terfi talebini ne zaman ilettiniz?",
        options: [
          { id: "A", text: "Yıllık değerlendirme döneminde", score: { strategy: 8, professional: 10 } },
          { id: "B", text: "Büyük bir başarı sonrası hemen", score: { strategy: 10, professional: 8 } },
          { id: "C", text: "Yönetici değişikliği sırasında", score: { strategy: 4, professional: 5 } }
        ]
      },
      {
        id: "q2",
        text: "Talebinizi iletirken elinizdeki en güçlü argüman neydi?",
        options: [
          { id: "A", text: "Halihazırda üstlendiğim görevler", score: { strategy: 7, professional: 8 } },
          { id: "B", text: "Gelecekteki potansiyelim", score: { strategy: 6, professional: 7 } },
          { id: "C", text: "Yönetici ile kişisel ilişkim", score: { strategy: 2, professional: 2 } }
        ]
      },
      {
        id: "q3",
        text: "Olumsuz bir yanıt alma ihtimaline karşı bir B planınız var mıydı?",
        options: [
          { id: "A", text: "Vardı ve ilettim", score: { strategy: 9, confidence: 10 } },
          { id: "B", text: "Vardı ama söylemedim", score: { strategy: 10, confidence: 8 } },
          { id: "C", text: "Yoktu", score: { strategy: 1, confidence: 2 } }
        ]
      }
    ]
  },
  {
    id: 3,
    category: "Büyüme ve Değer",
    title: "Özgüveni Artırma",
    description: "İş hayatında sağlam bir duruş sergileyin.",
    icon: "💪",
    questions: [
      {
        id: "q1",
        text: "Bir başarı elde ettiğinizde bunu ekip içinde nasıl duyurursunuz?",
        options: [
          { id: "A", text: "Mütevazı kalıp beklerim", score: { confidence: 4, impact: 3 } },
          { id: "B", text: "Objektif verilerle paylaşırım", score: { confidence: 10, impact: 10 } },
          { id: "C", text: "Abartılı şekilde kutlarım", score: { confidence: 8, impact: 4 } }
        ]
      },
      {
        id: "q2",
        text: "Hata yaptığınızda ilk tepkiniz ne olur?",
        options: [
          { id: "A", text: "Suçu üzerime alırım", score: { professional: 8, confidence: 6 } },
          { id: "B", text: "Hemen çözüm bulmaya odaklanırım", score: { professional: 10, confidence: 9 } },
          { id: "C", text: "Dış faktörleri vurgularım", score: { professional: 2, confidence: 3 } }
        ]
      },
      {
        id: "q3",
        text: "Kritik bir toplantı öncesi zihinsel hazırlığınız nasıldır?",
        options: [
          { id: "A", text: "Sunumu defalarca prova ederim", score: { strategy: 10, confidence: 9 } },
          { id: "B", text: "Olumlu sonuçları görselleştiririm", score: { strategy: 7, confidence: 10 } },
          { id: "C", text: "Başarısızlık senaryolarını düşünürüm", score: { strategy: 5, confidence: 4 } }
        ]
      }
    ]
  },
  {
    id: 4,
    category: "Büyüme ve Değer",
    title: "Başarıya Ulaşma (Blokaj Giderme)",
    description: "Engelleri aşın ve hedeflere odaklanın.",
    icon: "🏆",
    questions: [
      {
        id: "q1",
        text: "Ertelenen bir göreve başlarken motivasyonunuzu nasıl sağlarsınız?",
        options: [
          { id: "A", text: "Görevi küçük parçalara bölerim", score: { strategy: 10, productivity: 10 } },
          { id: "B", text: "Son teslim tarihini düşünerek kendimi zorlarım", score: { strategy: 5, productivity: 6 } },
          { id: "C", text: "Vazgeçmeyi düşünürüm", score: { strategy: 0, productivity: 0 } }
        ]
      },
      {
        id: "q2",
        text: "Büyük bir hedefe ulaşırken, küçük bir başarısızlık yaşarsanız ne yaparsınız?",
        options: [
          { id: "A", text: "Hedefi küçültürüm", score: { resilience: 4, strategy: 3 } },
          { id: "B", text: "Hızlıca ders çıkarıp yola devam ederim", score: { resilience: 10, strategy: 9 } },
          { id: "C", text: "Bir süre ara veririm", score: { resilience: 5, strategy: 4 } }
        ]
      },
      {
        id: "q3",
        text: "Hedeflerinizi belirlerken dış baskılardan ne kadar etkilenirsiniz?",
        options: [
          { id: "A", text: "Çok etkilenirim", score: { confidence: 2, leadership: 2 } },
          { id: "B", text: "Sadece kendi hedeflerime odaklanırım", score: { confidence: 8, leadership: 7 } },
          { id: "C", text: "Çevremi dinler, kendi vizyonuma uyarlarım", score: { confidence: 10, leadership: 10 } }
        ]
      }
    ]
  },
  {
    id: 5,
    category: "Liderlik ve Etkileşim",
    title: "Rakiplere Karşı Avantajlı Olma",
    description: "Rekabetçi ortamlarda profesyonelliğinizi koruyun.",
    icon: "🤝",
    questions: [
      {
        id: "q1",
        text: "Rakibinizle çatışma yaşadığınızda sorunu nerede çözmeyi tercih edersiniz?",
        options: [
          { id: "A", text: "Özel bir toplantıda", score: { professional: 10, conflict: 10 } },
          { id: "B", text: "Ekibin önünde", score: { professional: 2, conflict: 1 } },
          { id: "C", text: "Yöneticinin önünde", score: { professional: 4, conflict: 3 } }
        ]
      },
      {
        id: "q2",
        text: "Bir rakibiniz hata yaptığında tepkiniz ne olur?",
        options: [
          { id: "A", text: "Hemen yöneticime bildiririm", score: { professional: 3, integrity: 2 } },
          { id: "B", text: "Hata alanını doldurmasına yardım ederim", score: { professional: 10, integrity: 10 } },
          { id: "C", text: "Sessizce izlerim", score: { professional: 5, integrity: 5 } }
        ]
      },
      {
        id: "q3",
        text: "Görünürlüğünüzü artırmak için ne yaparsınız?",
        options: [
          { id: "A", text: "Sosyal etkinliklere katılırım", score: { impact: 7, strategy: 6 } },
          { id: "B", text: "Kendi başarılarımı düzenli raporlarım", score: { impact: 8, strategy: 8 } },
          { id: "C", text: "Başkalarının başarısını öne çıkarırım", score: { impact: 10, leadership: 10 } }
        ]
      }
    ]
  },
  {
    id: 6,
    category: "Liderlik ve Etkileşim",
    title: "Yaklaşım ve Davranış (İletişim Stili)",
    description: "İletişim tarzınızla etki yaratın.",
    icon: "💬",
    questions: [
      {
        id: "q1",
        text: "Baskı altında kaldığınızda ses tonunuz nasıl değişir?",
        options: [
          { id: "A", text: "Yükselir ve hızlanır", score: { composure: 3, communication: 4 } },
          { id: "B", text: "Düşer ve yavaşlar", score: { composure: 6, communication: 6 } },
          { id: "C", text: "Değişmez, sakin kalır", score: { composure: 10, communication: 10 } }
        ]
      },
      {
        id: "q2",
        text: "Bir meslektaşınızdan olumsuz geri bildirim aldığınızda ne yaparsınız?",
        options: [
          { id: "A", text: "Kendimi savunurum", score: { openness: 3, growth: 2 } },
          { id: "B", text: "Açıklığa kavuşturmak için soru sorarım", score: { openness: 10, growth: 10 } },
          { id: "C", text: "Hemen özür dilerim", score: { openness: 6, growth: 5 } }
        ]
      },
      {
        id: "q3",
        text: "Bir toplantıda herkes aynı fikirdeyken siz farklı bir görüşe sahipseniz ne yaparsınız?",
        options: [
          { id: "A", text: "Sessiz kalırım", score: { courage: 2, impact: 2 } },
          { id: "B", text: "Görüşümü mantıklı argümanlarla sunarım", score: { courage: 10, impact: 10 } },
          { id: "C", text: "Fikri destekler gibi yaparım", score: { courage: 1, impact: 1 } }
        ]
      }
    ]
  },
  {
    id: 7,
    category: "Liderlik ve Etkileşim",
    title: "Ekip Yönetimi",
    description: "Ekibinizi motive edin ve çatışmaları yönetin.",
    icon: "🧑‍🤝‍🧑",
    questions: [
      {
        id: "q1",
        text: "Ekibinizde bir çatışma çıktığında ilk eyleminiz ne olur?",
        options: [
          { id: "A", text: "Tarafları ayırır, tek tek dinlerim", score: { leadership: 9, conflict: 10 } },
          { id: "B", text: "Hatalı olanı hemen bulurum", score: { leadership: 3, conflict: 2 } },
          { id: "C", text: "Çatışmanın kendi kendine çözülmesini beklerim", score: { leadership: 2, conflict: 1 } }
        ]
      },
      {
        id: "q2",
        text: "Bir ekip üyesinin motivasyonu düştüğünde nasıl bir yöntem izlersiniz?",
        options: [
          { id: "A", text: "Daha fazla görev veririm", score: { empathy: 2, leadership: 2 } },
          { id: "B", text: "Görevi ve hedefleri beraber gözden geçiririm", score: { empathy: 10, leadership: 10 } },
          { id: "C", text: "Maaş artışını işaret ederim", score: { empathy: 4, leadership: 4 } }
        ]
      },
      {
        id: "q3",
        text: "Ekip başarısını nasıl kutlarsınız?",
        options: [
          { id: "A", text: "Başarıyı yöneticime atfederim", score: { leadership: 3, impact: 3 } },
          { id: "B", text: "Bireysel katkıları öne çıkarırım", score: { leadership: 8, impact: 8 } },
          { id: "C", text: "Ekibin kolektif çabasını kutlarım", score: { leadership: 10, impact: 10 } }
        ]
      }
    ]
  },
  {
    id: 8,
    category: "Liderlik ve Etkileşim",
    title: "Personel İşten Çıkarma Kararı",
    description: "Zor kararları profesyonelce ve etik çerçevede alın.",
    icon: "🛑",
    questions: [
      {
        id: "q1",
        text: "Bu kararı vermeden önce kişiye kaç kez resmi geri bildirim verdiniz?",
        options: [
          { id: "A", text: "Birden fazla, yazılı kanıtlı", score: { professional: 10, legal: 10 } },
          { id: "B", text: "Birkaç kez, sözlü", score: { professional: 5, legal: 4 } },
          { id: "C", text: "Hiç vermedim, direkt karar aldım", score: { professional: 1, legal: 1 } }
        ]
      },
      {
        id: "q2",
        text: "Kararı iletişime açarken odak noktanız ne olur?",
        options: [
          { id: "A", text: "Şirketin yeniden yapılanması", score: { communication: 7, empathy: 6 } },
          { id: "B", text: "Kişinin performans eksiklikleri", score: { communication: 9, empathy: 7 } },
          { id: "C", text: "Hukuki detaylar", score: { communication: 5, empathy: 3 } }
        ]
      },
      {
        id: "q3",
        text: "Bu kişiye karşı etik ve profesyonel sorumluluğunuzu nasıl yönetirsiniz?",
        options: [
          { id: "A", text: "Hiçbir şey yapmam", score: { ethics: 1, empathy: 1 } },
          { id: "B", text: "Transfer veya referans imkanı sunarım", score: { ethics: 10, empathy: 10 } },
          { id: "C", text: "Sadece şirket politikasına uyarım", score: { ethics: 6, empathy: 5 } }
        ]
      }
    ]
  },
  {
    id: 9,
    category: "Proje ve Strateji",
    title: "Proje Kurgulama / Çözümleme",
    description: "Projeleri risk ve beklenti yönetimiyle başarıya taşıyın.",
    icon: "🛠️",
    questions: [
      {
        id: "q1",
        text: "Proje başarısızlığı riskini nasıl tanımlarsınız?",
        options: [
          { id: "A", text: "Hissiyatıma güvenirim", score: { strategy: 2, risk: 1 } },
          { id: "B", text: "Senaryo analizleri ve veri kullanırım", score: { strategy: 10, risk: 10 } },
          { id: "C", text: "Yöneticimden risk tanımını beklerim", score: { strategy: 3, risk: 2 } }
        ]
      },
      {
        id: "q2",
        text: "Bir projede teknik sorun çıktığında ne yaparsınız?",
        options: [
          { id: "A", text: "Hızlıca geçici bir çözüm bulurum", score: { problemSolving: 6, strategy: 5 } },
          { id: "B", text: "Problemin kök nedenini bulmaya odaklanırım", score: { problemSolving: 10, strategy: 10 } },
          { id: "C", text: "Problemi görmezden gelirim", score: { problemSolving: 0, strategy: 0 } }
        ]
      },
      {
        id: "q3",
        text: "Paydaş beklentilerini nasıl yönetirsiniz?",
        options: [
          { id: "A", text: "Her isteklerini kabul ederim", score: { leadership: 2, management: 2 } },
          { id: "B", text: "Başlangıçta net sınırlar koyarım", score: { leadership: 9, management: 10 } },
          { id: "C", text: "Proje ilerlerken beklentilerini yönetirim", score: { leadership: 7, management: 8 } }
        ]
      }
    ]
  },
  {
    id: 10,
    category: "Proje ve Strateji",
    title: "Projeyi Sürdürme / Durdurma Kararı",
    description: "Veriye dayalı stratejik kararlar alın.",
    icon: "⚖️",
    questions: [
      {
        id: "q1",
        text: "Bir projeyi durdurma kararını hangi kritere dayandırırsınız?",
        options: [
          { id: "A", text: "Bugüne kadar harcanan maliyet (Batık maliyet)", score: { strategy: 3, finance: 2 } },
          { id: "B", text: "Gelecekte beklenen potansiyel gelir", score: { strategy: 10, finance: 10 } },
          { id: "C", text: "Ekibin moral durumu", score: { strategy: 5, finance: 4 } }
        ]
      },
      {
        id: "q2",
        text: "Projeyi durdurma kararını üst yönetime nasıl sunarsınız?",
        options: [
          { id: "A", text: "Sadece zararı belirtirim", score: { communication: 5, leadership: 4 } },
          { id: "B", text: "Başarısızlık nedenlerini analiz eder, öğrenilen dersleri sunarım", score: { communication: 10, leadership: 10 } },
          { id: "C", text: "Kararı başkasına yüklerim", score: { communication: 1, leadership: 1 } }
        ]
      },
      {
        id: "q3",
        text: "Devam etme kararını destekleyen ana argümanınız ne olurdu?",
        options: [
          { id: "A", text: "Proje ekibinin bağlılığı", score: { strategy: 6, emotion: 8 } },
          { id: "B", text: "Pazar ihtiyacının devam etmesi", score: { strategy: 10, market: 10 } },
          { id: "C", text: "Yöneticimin isteği", score: { strategy: 2, autonomy: 2 } }
        ]
      }
    ]
  }
];

module.exports = modules;

