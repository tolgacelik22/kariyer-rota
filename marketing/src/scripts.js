// Voice-over scripts. Each line becomes one scene; `scene` picks the visual in the composition.
export const SCRIPTS = {
  promo: {
    voice: 'tr-TR-AhmetNeural',
    rate: '+9%',
    pitch: '-2Hz',
    lines: [
      { scene: 'hook', text: 'Altı ay sonra performans görüşmesindesin. Son altı ayda ne yaptığını hatırlıyor musun?' },
      { scene: 'forget', text: 'Çoğumuz sadece son iki haftayı hatırlarız. Gerisi kaybolur.' },
      { scene: 'brand', text: 'Promotly ile her cuma sadece beş dakika ayır.' },
      { scene: 'compose', text: 'Ne yaptığını, etkisini ve kanıtını rehberli üç adımda kaydet.' },
      { scene: 'summary', text: 'Yapay zekâ her haftayı, yöneticine iletebileceğin net bir özete çevirir.' },
      { scene: 'report', text: 'Altı ayın sonunda kanıtlarla dolu terfi dosyan tek dokunuşla hazır.' },
      { scene: 'privacy', text: 'Şirket sistemlerine bağlanmaz. Veriler senin; istediğin an indir ya da sil.' },
      { scene: 'cta', text: 'Promotly, terfi ve başarı arşivin. App Store ve Google Play’de, ücretsiz.' },
    ],
  },
  story: {
    voice: 'tr-TR-EmelNeural',
    rate: '+11%',
    pitch: '+0Hz',
    lines: [
      { scene: 'hook', text: 'Geçen yıl performans görüşmemde resmen boş kaldım.' },
      { scene: 'problem', text: 'Yöneticim son altı ayda neler yaptığımı sordu. Ben iki hafta öncesini bile zor hatırladım.' },
      { scene: 'found', text: 'Sonra Promotly’yi denemeye başladım.' },
      { scene: 'friday', text: 'Her cuma, bilgisayarı kapatmadan önce beş dakika ayırıyorum. O hafta ne yaptım, etkisi ne oldu, yazıyorum.' },
      { scene: 'summary', text: 'Uygulama bunu, yöneticime direkt gönderebileceğim üç maddeye çeviriyor.' },
      { scene: 'report', text: 'Bu dönem görüşmeye altı aylık terfi dosyamla girdim. Her katkının yanında kanıtı vardı.' },
      { scene: 'feeling', text: 'İlk defa ne söyleyeceğimi düşünmedim. Hepsi önümdeydi.' },
      { scene: 'cta', text: 'Sen de bu cuma başla. Promotly, App Store ve Google Play’de ücretsiz.' },
    ],
  },
};
