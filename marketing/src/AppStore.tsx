import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Background, Patch, Phone } from './components';
import { SHOTS } from './StoreShot';
import { C, INTER } from './theme';

// App Store versions: 6.9" iPhone size (1290×2796), iOS status bar + Dynamic Island instead of Android chrome
// (App Review 2.3.10: no other-platform imagery). Same headlines as Google Play.

// The paywall fine print names the store per platform; the iOS build shows "App Store".
const IOS_FINE_PRINT: Patch = {
  top: 2150,
  height: 92,
  bg: '#0B1220',
  lines: ['Abonelik, dönem sonundan 24 saat önce iptal edilmezse', 'otomatik yenilenir. App Store hesap ayarlarından yönetebilirsin.'],
};

type IosShot = { bg: 'brand' | 'night' | 'light'; title: string; sub: string; screen: string; statusBar?: string; patches?: Patch[] };

export const IOS_SUB_SHOTS: IosShot[] = [
  { bg: 'night', title: 'Promotly Pro', sub: 'Aylık 199 TL · Yıllık 1.490 TL · İstediğin zaman iptal', screen: '14-paywall-yearly.png', statusBar: '#1F3A8A', patches: [IOS_FINE_PRINT] },
  { bg: 'night', title: 'Aylık veya yıllık', sub: 'Abonelik App Store hesabından yönetilir.', screen: '15-paywall-monthly.png', statusBar: '#1F3A8A', patches: [IOS_FINE_PRINT] },
  { bg: 'brand', title: 'Pro aktif', sub: 'AI özetleri, terfi dosyası ve tüm arşiv açılır.', screen: '16-pro-welcome.png', statusBar: '#16213F' },
];

const Frame: React.FC<{ s: IosShot }> = ({ s }) => {
  const dark = s.bg !== 'light';
  return (
    <AbsoluteFill style={{ fontFamily: INTER, overflow: 'hidden' }}>
      <Background kind={s.bg} />
      <div style={{ position: 'absolute', top: 170, left: 90, right: 90, textAlign: 'center' }}>
        <div style={{ fontSize: 116, fontWeight: 900, lineHeight: 1.04, letterSpacing: -3.5, color: dark ? C.white : C.ink, whiteSpace: 'pre-line' }}>{s.title}</div>
        <div style={{ fontSize: 48, fontWeight: 500, lineHeight: 1.35, marginTop: 36, color: dark ? 'rgba(255,255,255,0.78)' : C.muted }}>{s.sub}</div>
      </div>
      <div style={{ position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Phone src={`screens/${s.screen}`} width={880} ios statusBar={s.statusBar} patches={s.patches} maskBottom={s.statusBar ? 72 : 0} />
      </div>
    </AbsoluteFill>
  );
};

export const AppStoreShot: React.FC<{ index: number; set?: 'store' | 'sub' }> = ({ index, set = 'store' }) => (
  <Frame s={set === 'sub' ? IOS_SUB_SHOTS[index] : SHOTS[index]} />
);

// Unframed iOS paywall for the App Store "Review Screenshot" of each subscription.
export const IosPaywallRaw: React.FC<{ screen: string }> = ({ screen }) => (
  <AbsoluteFill>
    <Phone src={`screens/${screen}`} width={1080} bare ios statusBar="#1F3A8A" patches={[IOS_FINE_PRINT]} maskBottom={72} shadow={false} />
  </AbsoluteFill>
);
