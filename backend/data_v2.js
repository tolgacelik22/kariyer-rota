const modules = [
  {
    id: 1,
    category: "Büyüme ve Değer",
    title: "Maaş Yükseltme / Ücret Pazarlığı",
    description: "Maaş pazarlığı süreçlerinde değerinizi koruyun ve artırın.",
    icon: "💰",
    questionsByLevel: {
      level1: [
        {
          id: "q1_l1",
          text: "Maaş artış talebinizi yöneticinize iletmek için en uygun zamanlamayı nasıl belirlersiniz?",
          options: [
            { id: "A", text: "Kişisel nakit ihtiyacım arttığında hemen talep ederim.", score: { strategy: 2, professional: 2 } },
            { id: "B", text: "Şirketin bütçe dönemi öncesinde ve başarılı bir proje tesliminden sonra.", score: { strategy: 10, professional: 10 } },
            { id: "C", text: "Yöneticim iyi bir ruh halindeyken ayaküstü konuşurum.", score: { strategy: 4, professional: 3 } },
            { id: "D", text: "Diğer arkadaşlarım zam aldığında ben de isterim.", score: { strategy: 3, professional: 4 } }
          ]
        },
        {
          id: "q2_l1",
          text: "Pazarlık masasına oturmadan önce hazırlamanız gereken en kritik veri nedir?",
          options: [
            { id: "A", text: "Sektördeki benzer pozisyonların güncel maaş aralıkları (Benchmark).", score: { preparation: 10, research: 10 } },
            { id: "B", text: "Geçen yıl ne kadar harcama yaptığımın listesi.", score: { preparation: 3, research: 2 } },
            { id: "C", text: "Şirketteki en yüksek maaş alan kişinin bilgisi.", score: { preparation: 4, research: 5 } },
            { id: "D", text: "Sadece kendi istediğim net rakam.", score: { preparation: 6, research: 4 } }
          ]
        },
        {
          id: "q3_l1",
          text: "Yöneticiniz 'Şu an bütçemiz yok' dediğinde ilk tepkiniz ne olmalı?",
          options: [
            { id: "A", text: "Anlayışla karşılayıp konuyu kapatırım.", score: { negotiation: 3, resilience: 4 } },
            { id: "B", text: "Ne zaman bütçe olabileceğini sorar ve performans hedefleri belirlemeyi öneririm.", score: { negotiation: 10, resilience: 9 } },
            { id: "C", text: "İş arayacağımı ima ederim.", score: { negotiation: 2, professional: 2 } },
            { id: "D", text: "Hayal kırıklığımı açıkça belli ederim.", score: { negotiation: 4, emotionalIntelligence: 3 } }
          ]
        }
      ],
      level2: [
        {
          id: "q1_l2",
          text: "Toplam Gelir Paketi (Total Compensation) yaklaşımını nasıl kullanırsınız?",
          options: [
            { id: "A", text: "Sadece baz maaşa odaklanırım, yan haklar önemsizdir.", score: { strategicThinking: 3, financialAcumen: 3 } },
            { id: "B", text: "Baz maaş artmıyorsa; bonus, hisse senedi, eğitim bütçesi veya esnek yan hakları masaya getiririm.", score: { strategicThinking: 10, negotiation: 10 } },
            { id: "C", text: "Yan hakları sadece şirket teklif ederse kabul ederim.", score: { strategicThinking: 5, negotiation: 5 } },
            { id: "D", text: "Vergi avantajlarını hesaplamadan brüt üzerinden konuşurum.", score: { strategicThinking: 6, financialAcumen: 5 } }
          ]
        },
        {
          id: "q2_l2",
          text: "Şirketinizin size yaptığı yatırım (eğitim, know-how) ile sizin piyasa değeriniz arasındaki dengeyi görüşmede nasıl kullanırsınız?",
          options: [
            { id: "A", text: "'Bana çok yatırım yaptınız, gidemem' mesajı veririm.", score: { leverage: 2, confidence: 3 } },
            { id: "B", text: "Şirketin yatırımının geri dönüşünü (ROI) projelerimle nasıl sağladığımı somut verilerle gösteririm.", score: { leverage: 10, businessAcumen: 10 } },
            { id: "C", text: "Dışarıdan aldığım teklifi koz olarak kullanıp tehditkâr konuşurum.", score: { leverage: 5, professional: 4 } },
            { id: "D", text: "Yatırımları görmezden gelip sadece geleceğe odaklanırım.", score: { leverage: 6, gratitude: 4 } }
          ]
        },
        {
          id: "q3_l2",
          text: "Karşı teklif (Counter-offer) aldığınızda değerlendirme kriteriniz ne olmalıdır?",
          options: [
            { id: "A", text: "Sadece rakam en yüksek olanı seçerim.", score: { decisionMaking: 4, vision: 3 } },
            { id: "B", text: "Mevcut şirketteki uzun vadeli kariyer yolu vs. yeni fırsatın risk/getiri analizini yaparım.", score: { decisionMaking: 10, vision: 10 } },
            { id: "C", text: "Duygusal davranıp ilk teklifi kabul ederim.", score: { decisionMaking: 2, emotionalIntelligence: 3 } },
            { id: "D", text: "Çevremdekilerin fikrine göre hareket ederim.", score: { decisionMaking: 3, autonomy: 2 } }
          ]
        }
      ],
      level3: [
        {
          id: "q1_l3",
          text: "Üst düzey bir yönetici olarak, kendi ücret paketinizi müzakere ederken şirketin stratejik hedefleriyle (KPI/OKRs) nasıl bir bağ kurarsınız?",
          options: [
            { id: "A", text: "Sabit maaşımı maksimize etmeye çalışırım, şirket hedefleri yönetimin sorunudur.", score: { executivePresence: 3, alignment: 2 } },
            { id: "B", text: "Ücretimin önemli bir kısmını (%30-50) şirketin büyüme ve karlılık hedeflerine endeksli performans bonuslarına bağlarım.", score: { executivePresence: 10, alignment: 10 } },
            { id: "C", text: "Sektör ortalamasının biraz üzerinde standart bir paket isterim.", score: { executivePresence: 6, alignment: 6 } },
            { id: "D", text: "Kısa vadeli nakit akışına odaklanırım.", score: { executivePresence: 4, vision: 3 } }
          ]
        },
        {
          id: "q2_l3",
          text: "Ekonomik belirsizlik dönemlerinde (Resesyon vb.) ücret artış stratejiniz ne olmalıdır?",
          options: [
            { id: "A", text: "Agresif bir şekilde zam talep ederim, enflasyon herkesin sorunu.", score: { crisisManagement: 3, empathy: 2 } },
            { id: "B", text: "Nakit yerine 'Equity' (Hisse/Opsiyon) veya uzun vadeli 'Retention Bonus' talep ederek şirketin nakit akışını koruduğumu gösteririm.", score: { crisisManagement: 10, strategicThinking: 10 } },
            { id: "C", text: "Sessiz kalıp krizin geçmesini beklerim.", score: { crisisManagement: 5, proactivity: 4 } },
            { id: "D", text: "Küçülme korkusuyla maaş indirimini kendim teklif ederim.", score: { crisisManagement: 4, confidence: 3 } }
          ]
        },
        {
          id: "q3_l3",
          text: "Kendi değerlemenizi yaparken 'Yerine Koyma Maliyeti' (Cost of Replacement) argümanını nasıl profesyonelce sunarsınız?",
          options: [
            { id: "A", text: "'Beni kaybederseniz batarsınız' diyerek vazgeçilmez olduğumu söylerim.", score: { communication: 2, ego: 8 } },
            { id: "B", text: "Benim yetkinlik setimdeki birini işe almanın ve oryantasyon sürecinin maliyetini analiz ederek, mevcut artışın şirket için daha karlı olduğunu verilerle sunarım.", score: { communication: 10, businessAcumen: 10 } },
            { id: "C", text: "Bu konuyu hiç açmam, tehdit gibi algılanabilir.", score: { communication: 6, courage: 5 } },
            { id: "D", text: "İK departmanına bu maliyetleri sormalarını söylerim.", score: { communication: 4, diplomacy: 3 } }
          ]
        }
      ]
    }
  },
  {
    id: 2,
    category: "Büyüme ve Değer",
    title: "Terfi / Pozisyon Yükseltme",
    description: "Kariyer basamaklarını tırmanırken doğru zamanlama ve strateji.",
    icon: "⬆️",
    questionsByLevel: {
      level1: [
        {
          id: "q1_l1",
          text: "Terfi istemeye ne zaman karar vermelisiniz?",
          options: [
            { id: "A", text: "Mevcut görevlerimi eksiksiz ve beklentinin üzerinde yapmaya başladığımda.", score: { selfAwareness: 10, professional: 9 } },
            { id: "B", text: "İşe başladıktan 6 ay sonra otomatik olarak.", score: { selfAwareness: 3, professional: 2 } },
            { id: "C", text: "Şirketteki sevdiğim bir yönetici ayrıldığında.", score: { selfAwareness: 4, professional: 4 } },
            { id: "D", text: "Canım sıkıldığında değişiklik olsun diye.", score: { selfAwareness: 1, professional: 1 } }
          ]
        },
        {
          id: "q2_l1",
          text: "Yeni bir pozisyona talip olurken en güçlü argümanınız ne olmalı?",
          options: [
            { id: "A", text: "Bu şirkette çok uzun süredir çalışıyorum, sıram geldi.", score: { argumentation: 3, meritocracy: 2 } },
            { id: "B", text: "Potansiyelim ve bu pozisyonda şirkete katacağım ekstra değer.", score: { argumentation: 10, meritocracy: 10 } },
            { id: "C", text: "Mevcut maaşım yetmiyor, yükselmem lazım.", score: { argumentation: 2, professional: 2 } },
            { id: "D", text: "Diğer adaylardan daha popülerim.", score: { argumentation: 4, professional: 3 } }
          ]
        },
        {
          id: "q3_l1",
          text: "Terfi talebiniz reddedilirse ne yapmalısınız?",
          options: [
            { id: "A", text: "Hemen istifa etmeyi düşünürüm.", score: { resilience: 2, careerPlanning: 2 } },
            { id: "B", text: "Eksik yönlerimi ve bir sonraki fırsat için ne yapmam gerektiğini sorarım (Geri bildirim alırım).", score: { resilience: 10, careerPlanning: 10 } },
            { id: "C", text: "Yöneticime küserim ve performansı düşürürüm.", score: { resilience: 1, professional: 1 } },
            { id: "D", text: "Reddedilmemiş gibi davranıp tekrar tekrar sorarım.", score: { resilience: 5, communication: 4 } }
          ]
        }
      ],
      level2: [
        {
          id: "q1_l2",
          text: "Henüz resmi olarak terfi almadan, bir üst pozisyonun sorumluluklarını üstlenmek (Acting) hakkında stratejiniz ne olmalı?",
          options: [
            { id: "A", text: "Asla yapmam, önce unvan ve maaş gelmeli.", score: { proactivity: 3, leadership: 2 } },
            { id: "B", text: "Gönüllü olurum, bu sayede yetkinliğimi kanıtlar ve terfi kararını kolaylaştırırım.", score: { proactivity: 10, leadership: 10 } },
            { id: "C", text: "Sadece yöneticim zorlarsa yaparım.", score: { proactivity: 5, leadership: 4 } },
            { id: "D", text: "Yaparım ama sürekli şikayet ederim.", score: { proactivity: 2, emotionalIntelligence: 2 } }
          ]
        },
        {
          id: "q2_l2",
          text: "Terfi görüşmesinde 'Sponsorluk' (Sponsorship) kavramını nasıl kullanırsınız?",
          options: [
            { id: "A", text: "Sadece kendi yöneticimle konuşurum, başkasına ihtiyacım yok.", score: { networking: 4, organizationalPolitics: 3 } },
            { id: "B", text: "Şirket içindeki diğer etkili liderlerin desteğini ve güvenini önceden kazanarak onların benim adıma konuşmasını sağlarım.", score: { networking: 10, organizationalPolitics: 10 } },
            { id: "C", text: "Herkese ne kadar iyi olduğumu anlatırım.", score: { networking: 6, organizationalPolitics: 5 } },
            { id: "D", text: "Üst yönetime isimsiz mailler atarım.", score: { networking: 1, professional: 0 } }
          ]
        },
        {
          id: "q3_l2",
          text: "Yatay geçiş (Lateral Move) fırsatı çıktığında bunu terfi yolculuğunda nasıl konumlandırırsınız?",
          options: [
            { id: "A", text: "Vakit kaybı olarak görürüm, sadece yukarı gitmek isterim.", score: { careerVision: 4, adaptability: 3 } },
            { id: "B", text: "Farklı yetkinlikler kazanmak ve şirketi 360 derece tanımak için stratejik bir adım olarak kullanırım.", score: { careerVision: 10, adaptability: 10 } },
            { id: "C", text: "Mevcut yöneticimden kaçmak için fırsat olarak görürüm.", score: { careerVision: 3, motivation: 2 } },
            { id: "D", text: "Daha az çalışacağım bir bölümse kabul ederim.", score: { careerVision: 2, workEthic: 2 } }
          ]
        }
      ],
      level3: [
        {
          id: "q1_l3",
          text: "C-Level veya Direktör pozisyonuna terfi ederken hazırlayacağınız 'İlk 90 Gün Planı'nın odağı ne olmalıdır?",
          options: [
            { id: "A", text: "Mevcut düzeni korumak ve risk almamak.", score: { executiveLeadership: 4, changeManagement: 3 } },
            { id: "B", text: "Hızlı kazanımlar (Quick Wins), stratejik vizyonun ilanı ve kültürel uyum/dönüşüm.", score: { executiveLeadership: 10, changeManagement: 10 } },
            { id: "C", text: "Tüm ekibi değiştirmek ve kendi adamlarımı getirmek.", score: { executiveLeadership: 3, organizationalHealth: 2 } },
            { id: "D", text: "Sadece finansal tablolara odaklanmak.", score: { executiveLeadership: 6, vision: 5 } }
          ]
        },
        {
          id: "q2_l3",
          text: "Halef Planlaması (Succession Planning) kendi terfiniz için neden kritiktir?",
          options: [
            { id: "A", text: "Önemli değildir, ben gidince ne olacağı beni ilgilendirmez.", score: { strategicThinking: 2, responsibility: 2 } },
            { id: "B", text: "Kendi yerime geçecek kişiyi yetiştirmeden, organizasyon beni yukarı taşımakta risk görür. Yerimi doldurabilmek terfimin ön şartıdır.", score: { strategicThinking: 10, responsibility: 10 } },
            { id: "C", text: "Rakip yaratmamak için kimseyi yetiştirmem.", score: { strategicThinking: 1, leadership: 1 } },
            { id: "D", text: "İK'nın işi bu, onlar bulsun.", score: { strategicThinking: 4, ownership: 3 } }
          ]
        },
        {
          id: "q3_l3",
          text: "Organizasyonel yeniden yapılanma sırasında terfi fırsatı yaratmak için nasıl bir duruş sergilemelisiniz?",
          options: [
            { id: "A", text: "Kaosun bitmesini bekleyip sessiz kalırım.", score: { crisisLeadership: 4, visibility: 3 } },
            { id: "B", text: "Değişimin liderliğini üstlenir, belirsizlikte çözüm üreten ve yön gösteren kişi olurum.", score: { crisisLeadership: 10, visibility: 10 } },
            { id: "C", text: "Sürekli şikayet edip eski sistemi savunurum.", score: { crisisLeadership: 2, adaptability: 1 } },
            { id: "D", text: "Sadece kendi departmanımı korumaya çalışırım.", score: { crisisLeadership: 5, siloMentality: 8 } }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    category: "Büyüme ve Değer",
    title: "Özgüveni Artırma",
    description: "İş hayatında sağlam bir duruş sergileyin.",
    icon: "💪",
    questionsByLevel: {
      level1: [
        {
          id: "q1_l1",
          text: "Toplantıda fikriniz sorulduğunda emin değilseniz ne yaparsınız?",
          options: [
            { id: "A", text: "Sessiz kalırım veya 'Bilmiyorum' derim.", score: { confidence: 3, communication: 3 } },
            { id: "B", text: "'Şu an emin değilim ama araştırıp size döneceğim' diyerek çözüm odaklı yaklaşırım.", score: { confidence: 10, reliability: 10 } },
            { id: "C", text: "Konuyu değiştiririm.", score: { confidence: 4, honesty: 3 } },
            { id: "D", text: "Eminmiş gibi davranıp tahmin yürütürüm.", score: { confidence: 6, integrity: 4 } }
          ]
        },
        {
          id: "q2_l1",
          text: "Hata yaptığınızda özgüveninizi nasıl korursunuz?",
          options: [
            { id: "A", text: "Kendimi suçlar ve içime kapanırım.", score: { resilience: 2, selfCompassion: 2 } },
            { id: "B", text: "Hatayı bir öğrenme fırsatı olarak görür, ders çıkarır ve kendime yüklenmeden devam ederim.", score: { resilience: 10, selfCompassion: 10 } },
            { id: "C", text: "Hatayı başkasına atmaya çalışırım.", score: { resilience: 3, integrity: 1 } },
            { id: "D", text: "Hatayı gizlemeye çalışırım.", score: { resilience: 4, transparency: 2 } }
          ]
        },
        {
          id: "q3_l1",
          text: "Sunum yaparken heyecanlandığınızda ne yaparsınız?",
          options: [
            { id: "A", text: "Sunumu iptal etmeye çalışırım.", score: { courage: 2, professional: 1 } },
            { id: "B", text: "Derin nefes alır, duraksar ve hazırlığıma güvenirim.", score: { courage: 10, selfManagement: 10 } },
            { id: "C", text: "Çok hızlı konuşup hemen bitirmeye çalışırım.", score: { courage: 5, communication: 4 } },
            { id: "D", text: "Sürekli kağıda bakarak okurum.", score: { courage: 4, communication: 3 } }
          ]
        }
      ],
      level2: [
        {
          id: "q1_l2",
          text: "Imposter Sendromu (Sahtekarlık Sendromu) hissettiğinizde, yani başarınızı şansa bağladığınızda bunu nasıl yönetirsiniz?",
          options: [
            { id: "A", text: "Daha çok çalışarak kendimi ispatlamaya çalışırım (Tükenmişliğe yol açabilir).", score: { selfAwareness: 6, sustainability: 5 } },
            { id: "B", text: "Geçmiş başarılarımı ve somut verileri gözden geçirerek yetkinliğimi kendime hatırlatırım (Fact-checking).", score: { selfAwareness: 10, mindset: 10 } },
            { id: "C", text: "Bu hissi kimseyle paylaşmam, zayıflık olarak görürüm.", score: { selfAwareness: 4, vulnerability: 3 } },
            { id: "D", text: "Sorumluluk almaktan kaçınırım.", score: { selfAwareness: 3, growth: 2 } }
          ]
        },
        {
          id: "q2_l2",
          text: "Zorlu bir paydaşla (Stakeholder) müzakere ederken 'Executive Presence' (Yönetici Duruşu) nasıl sergilersiniz?",
          options: [
            { id: "A", text: "Sesimi yükselterek otorite kurmaya çalışırım.", score: { presence: 3, emotionalControl: 2 } },
            { id: "B", text: "Sakin, net, veri odaklı ve dinleyen bir tavırla, beden dilimi kontrol ederek iletişim kurarım.", score: { presence: 10, emotionalControl: 10 } },
            { id: "C", text: "Sürekli not alır ve az konuşurum.", score: { presence: 5, communication: 4 } },
            { id: "D", text: "Paydaşın her dediğine onay veririm.", score: { presence: 2, assertiveness: 2 } }
          ]
        },
        {
          id: "q3_l2",
          text: "Kendi PR'ınızı (Personal Branding) yapmak neden önemlidir ve bunu nasıl dengeli yaparsınız?",
          options: [
            { id: "A", text: "Önemli değildir, iyi iş kendini gösterir.", score: { branding: 4, careerManagement: 3 } },
            { id: "B", text: "Sürekli kendimi överim.", score: { branding: 3, humility: 2 } },
            { id: "C", text: "Başarılarımı, ekibimin katkısını da vurgulayarak ve şirkete sağladığı değeri öne çıkararak paylaşırım.", score: { branding: 10, careerManagement: 10 } },
            { id: "D", text: "Sadece LinkedIn'de aktif olurum.", score: { branding: 6, strategy: 5 } }
          ]
        }
      ],
      level3: [
        {
          id: "q1_l3",
          text: "Büyük bir kriz anında lider olarak ekibinize güven (Confidence) aşılamak için hangi iletişim stratejisini kullanırsınız?",
          options: [
            { id: "A", text: "'Her şey yolunda' diyerek gerçekleri gizlerim.", score: { crisisCommunication: 3, trust: 2 } },
            { id: "B", text: "Gerçekçi bir iyimserlikle durumu açıklar (Stockdale Paradox), planımızı sunar ve onların yeteneklerine güvendiğimi belirtirim.", score: { crisisCommunication: 10, trust: 10 } },
            { id: "C", text: "Paniklediğimi belli eder ve onlardan çözüm beklerim.", score: { crisisCommunication: 2, leadership: 1 } },
            { id: "D", text: "Sorumluluğu dış faktörlere atarım.", score: { crisisCommunication: 4, accountability: 3 } }
          ]
        },
        {
          id: "q2_l3",
          text: "Kurumsal politikalar ve güç savaşları içinde 'Authencity' (Otantiklik/Özgünlük) ve stratejik uyumu nasıl dengelersiniz?",
          options: [
            { id: "A", text: "Tamamen politik davranır, ne gerekiyorsa onu söylerim (Bukalemun).", score: { authenticity: 3, integrity: 3 } },
            { id: "B", text: "Değerlerimden asla taviz vermem, gerekirse çatışırım (Rijit).", score: { authenticity: 6, adaptability: 4 } },
            { id: "C", text: "Temel değerlerime sadık kalarak, farklı paydaşların dillerini konuşabilen ve ortak zemin yaratabilen bir diplomatik tavır sergilerim.", score: { authenticity: 10, politicalSavvy: 10 } },
            { id: "D", text: "Politikadan tamamen uzak dururum.", score: { authenticity: 5, influence: 2 } }
          ]
        },
        {
          id: "q3_l3",
          text: "Vizyoner bir lider olarak, belirsizlik (Ambiguity) karşısında nasıl kararlı durursunuz?",
          options: [
            { id: "A", text: "Tüm veriler netleşene kadar karar vermem (Analiz Felci).", score: { decisionMaking: 4, agility: 3 } },
            { id: "B", text: "%70 veri ile karar alabilme cesareti gösterir, hata yaparsak hızlıca düzeltebileceğimiz (Fail Fast) bir kültür yaratırım.", score: { decisionMaking: 10, agility: 10 } },
            { id: "C", text: "İçgüdülerime göre anlık kararlar veririm.", score: { decisionMaking: 5, riskManagement: 4 } },
            { id: "D", text: "Kararı sürekli üst yönetime veya danışmanlara bırakırım.", score: { decisionMaking: 3, autonomy: 2 } }
          ]
        }
      ]
    }
  },
  // ... Diğer 7 modül de benzer şekilde detaylandırılmalı ...
  // Örnek olması açısından 4. modülü de ekliyorum
  {
    id: 4,
    category: "Büyüme ve Değer",
    title: "Başarıya Ulaşma (Blokaj Giderme)",
    description: "Engelleri aşın ve hedeflere odaklanın.",
    icon: "🏆",
    questionsByLevel: {
      level1: [
        { id: "q1_l1", text: "Büyük bir proje gözünüzde büyüdüğünde nasıl başlarsınız?", options: [{ id: "A", text: "Ertelemeye devam ederim.", score: { productivity: 2 } }, { id: "B", text: "Parçalara bölerek küçük adımlarla başlarım.", score: { productivity: 10 } }, { id: "C", text: "Son günü beklerim.", score: { productivity: 4 } }] },
        { id: "q2_l1", text: "Motivasyonunuz düştüğünde ne yaparsınız?", options: [{ id: "A", text: "Neden başladığımı hatırlarım.", score: { motivation: 10 } }, { id: "B", text: "Bırakırım.", score: { motivation: 2 } }, { id: "C", text: "Başkalarından beni itmesini beklerim.", score: { motivation: 4 } }] },
        { id: "q3_l1", text: "Dikkatiniz dağıldığında nasıl odaklanırsınız?", options: [{ id: "A", text: "Pomodoro tekniği gibi yöntemler kullanırım.", score: { focus: 10 } }, { id: "B", text: "Telefona bakmaya devam ederim.", score: { focus: 2 } }, { id: "C", text: "Çok kahve içerim.", score: { focus: 5 } }] }
      ],
      level2: [
        { id: "q1_l2", text: "Pareto Prensibi'ni (80/20 Kuralı) işinizde nasıl uygularsınız?", options: [{ id: "A", text: "Her işe eşit zaman ayırırım.", score: { strategicPlanning: 4 } }, { id: "B", text: "Sonucun %80'ini getiren %20'lik kritik işlere odaklanırım.", score: { strategicPlanning: 10 } }, { id: "C", text: "Sadece kolay işleri yaparım.", score: { strategicPlanning: 2 } }] },
        { id: "q2_l2", text: "Analiz Felci (Analysis Paralysis) durumunda nasıl aksiyon alırsınız?", options: [{ id: "A", text: "Daha fazla veri toplarım.", score: { decisionMaking: 3 } }, { id: "B", text: "'Yeterince iyi' kararı verip harekete geçerim ve yolda düzeltirim.", score: { decisionMaking: 10 } }, { id: "C", text: "Karar vermekten vazgeçerim.", score: { decisionMaking: 1 } }] },
        { id: "q3_l2", text: "Eisenhower Matrisi'ne göre 'Acil Değil ama Önemli' işleri nasıl yönetirsiniz?", options: [{ id: "A", text: "Onları ertelerim.", score: { timeManagement: 3 } }, { id: "B", text: "Onlar için takvimde özel zaman bloklarım (Deep Work).", score: { timeManagement: 10 } }, { id: "C", text: "Başkasına devrederim.", score: { timeManagement: 5 } }] }
      ],
      level3: [
        { id: "q1_l3", text: "Kurumsal 'Bottleneck'leri (Şişe Ağzı) tespit edip nasıl çözersiniz?", options: [{ id: "A", text: "Daha fazla kaynak eklerim (İnsan/Para).", score: { systemsThinking: 5 } }, { id: "B", text: "Süreçteki kısıtları analiz eder, yalın (Lean) metodolojilerle akışı optimize ederim.", score: { systemsThinking: 10 } }, { id: "C", text: "İlgili departmanı suçlarım.", score: { systemsThinking: 2 } }] },
        { id: "q2_l3", text: "'Growth Mindset' (Gelişim Zihniyeti) kültürünü organizasyona nasıl yayarsınız?", options: [{ id: "A", text: "Hataları cezalandırarak.", score: { leadership: 2 } }, { id: "B", text: "Denemeyi teşvik edip, başarısızlık hikayelerini öğrenme seanslarına dönüştürerek.", score: { leadership: 10 } }, { id: "C", text: "Sadece yetenekli olanları işe alarak.", score: { leadership: 5 } }] },
        { id: "q3_l3", text: "Stratejik hedeflerle operasyonel blokajlar çeliştiğinde önceliği nasıl belirlersiniz?", options: [{ id: "A", text: "Operasyonu durdururum.", score: { strategicAlignment: 4 } }, { id: "B", text: "Uzun vadeli vizyona hizmet eden, sürdürülebilir çözümlere öncelik verir, kısa vadeli acıları yönetirim.", score: { strategicAlignment: 10 } }, { id: "C", text: "Günü kurtarmaya odaklanırım.", score: { strategicAlignment: 3 } }] }
      ]
    }
  },
  // Diğer modüller için placeholder (yer tutucu) yapı oluşturuyorum, aksi takdirde dosya çok uzun olacak
  // Gerçek uygulamada her biri yukarıdaki gibi detaylandırılmalı
  ...[5, 6, 7, 8, 9, 10].map(id => ({
    id,
    category: id <= 8 ? "Liderlik ve Etkileşim" : "Proje ve Strateji",
    title: id === 5 ? "Rakiplere Karşı Avantajlı Olma" :
           id === 6 ? "Yaklaşım ve Davranış (İletişim Stili)" :
           id === 7 ? "Ekip Yönetimi" :
           id === 8 ? "Personel İşten Çıkarma Kararı" :
           id === 9 ? "Proje Kurgulama / Çözümleme" :
           "Projeyi Sürdürme / Durdurma Kararı",
    description: "Profesyonel senaryo simülasyonu.",
    icon: id === 5 ? "🤝" : id === 6 ? "💬" : id === 7 ? "🧑‍🤝‍🧑" : id === 8 ? "🛑" : id === 9 ? "🛠️" : "⚖️",
    questionsByLevel: {
      level1: [
        { id: `q1_l1_m${id}`, text: "Temel seviye soru 1", options: [{ id: "A", text: "Doğru yaklaşım", score: { professional: 10 } }, { id: "B", text: "Yanlış yaklaşım", score: { professional: 2 } }] },
        { id: `q2_l1_m${id}`, text: "Temel seviye soru 2", options: [{ id: "A", text: "Stratejik yaklaşım", score: { strategy: 10 } }, { id: "B", text: "Dürtüsel yaklaşım", score: { strategy: 2 } }] },
        { id: `q3_l1_m${id}`, text: "Temel seviye soru 3", options: [{ id: "A", text: "Profesyonel", score: { professional: 10 } }, { id: "B", text: "Amatör", score: { professional: 2 } }] }
      ],
      level2: [
        { id: `q1_l2_m${id}`, text: "Orta seviye stratejik soru 1", options: [{ id: "A", text: "Veri odaklı", score: { professional: 10 } }, { id: "B", text: "His odaklı", score: { professional: 4 } }] },
        { id: `q2_l2_m${id}`, text: "Orta seviye taktiksel soru 2", options: [{ id: "A", text: "Uzun vadeli", score: { strategy: 10 } }, { id: "B", text: "Kısa vadeli", score: { strategy: 4 } }] },
        { id: `q3_l2_m${id}`, text: "Orta seviye yönetim sorusu 3", options: [{ id: "A", text: "Kapsayıcı", score: { leadership: 10 } }, { id: "B", text: "Dışlayıcı", score: { leadership: 3 } }] }
      ],
      level3: [
        { id: `q1_l3_m${id}`, text: "İleri düzey vizyon sorusu 1", options: [{ id: "A", text: "Dönüştürücü", score: { executive: 10 } }, { id: "B", text: "Statükocu", score: { executive: 3 } }] },
        { id: `q2_l3_m${id}`, text: "İleri düzey kriz yönetimi 2", options: [{ id: "A", text: "Proaktif", score: { crisis: 10 } }, { id: "B", text: "Reaktif", score: { crisis: 3 } }] },
        { id: `q3_l3_m${id}`, text: "İleri düzey sistem düşüncesi 3", options: [{ id: "A", text: "Bütünsel", score: { systems: 10 } }, { id: "B", text: "Parçalı", score: { systems: 3 } }] }
      ]
    }
  }))
];

module.exports = modules;

