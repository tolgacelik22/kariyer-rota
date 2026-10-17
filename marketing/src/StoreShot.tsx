import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, Logo, Phone } from './components';
import { C, INTER } from './theme';

type Shot = { bg: 'brand' | 'night' | 'light'; title: string; sub: string; screen: string; statusBar?: string };

// Google Play phone screenshots, 1080×1920 (9:16).
export const SHOTS: Shot[] = [
  { bg: 'brand', title: 'Terfi görüşmesinde\nboş kalma.', sub: 'Her cuma 5 dakika. 6 ayda kanıtlı terfi dosyası.', screen: '01-today.png' },
  { bg: 'light', title: 'Haftanı 5 dakikada\narşivle', sub: 'Rehberli 4 adım: ne yaptın, etkisi, kanıtı.', screen: '02-composer-wins.png' },
  { bg: 'light', title: 'Etkini rakamla\nkanıtla', sub: '“Hata oranı %4,1 → %1,3” gibi ölçülebilir sonuçlar.', screen: '03-composer-impact.png' },
  { bg: 'night', title: 'Yapay zekâ her\nhaftanı özetler', sub: 'Yöneticine iletebileceğin 3 net madde.', screen: '06-saved.png' },
  { bg: 'brand', title: '6 aylık terfi\ndosyan hazır', sub: 'Katkılar, etkiler ve kanıtlar tek dosyada.', screen: '09-report-review.png' },
  { bg: 'light', title: 'Tüm kariyerin\ntek arşivde', sub: 'Aylara göre, etiketlerle, kanıt linkleriyle.', screen: '07-archive.png' },
  { bg: 'light', title: 'CV ve mülakat için\nhikâyeler', sub: 'STAR formatında hazır başarı hikâyeleri.', screen: '11-report-stories.png' },
  { bg: 'night', title: 'Şirket verin\nşirkette kalır.', sub: 'Sistemlere bağlanmaz. Arşivini istediğin an indir ya da sil.', screen: '20-onboarding-4.png' },
];

// Subscription screens for store review / listing (paywall states).
export const SUB_SHOTS: Shot[] = [
  { bg: 'night', title: 'Promotly Pro', sub: 'Aylık 199 TL · Yıllık 1.490 TL · İstediğin zaman iptal', screen: '14-paywall-yearly.png', statusBar: '#1F3A8A' },
  { bg: 'night', title: 'Aylık veya yıllık', sub: 'Abonelik Google Play hesabından yönetilir.', screen: '15-paywall-monthly.png', statusBar: '#1F3A8A' },
  { bg: 'brand', title: 'Pro aktif', sub: 'AI özetleri, terfi dosyası ve tüm arşiv açılır.', screen: '16-pro-welcome.png', statusBar: '#16213F' },
];

export const StoreShot: React.FC<{ index: number; set?: 'store' | 'sub' }> = ({ index, set = 'store' }) => {
  const s = (set === 'sub' ? SUB_SHOTS : SHOTS)[index];
  const dark = s.bg !== 'light';
  return (
    <AbsoluteFill style={{ fontFamily: INTER, overflow: 'hidden' }}>
      <Background kind={s.bg} />
      <div style={{ position: 'absolute', top: 120, left: 80, right: 80, textAlign: 'center' }}>
        <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2.5, color: dark ? C.white : C.ink, whiteSpace: 'pre-line' }}>{s.title}</div>
        <div style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.35, marginTop: 28, color: dark ? 'rgba(255,255,255,0.78)' : C.muted }}>{s.sub}</div>
      </div>
      <div style={{ position: 'absolute', top: 530, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Phone src={`screens/${s.screen}`} width={640} statusBar={s.statusBar} maskBottom={s.statusBar ? 72 : 0} />
      </div>
    </AbsoluteFill>
  );
};

// Google Play feature graphic, 1024×500.
export const FeatureGraphic: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: INTER, overflow: 'hidden' }}>
    <Background kind="brand" />
    <div style={{ position: 'absolute', left: 64, top: 0, bottom: 0, width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26 }}>
      <Logo size={72} subtitle />
      <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.08, color: C.white, letterSpacing: -1 }}>
        Her cuma 5 dakika.
        <br />
        <span style={{ color: C.goldLight }}>6 ayda kanıtlı terfi dosyası.</span>
      </div>
    </div>
    <div style={{ position: 'absolute', right: 230, top: 70, transform: 'rotate(-7deg)' }}>
      <Phone src="screens/09-report-review.png" width={260} />
    </div>
    <div style={{ position: 'absolute', right: 40, top: 40, transform: 'rotate(6deg)' }}>
      <Phone src="screens/01-today.png" width={260} />
    </div>
  </AbsoluteFill>
);
