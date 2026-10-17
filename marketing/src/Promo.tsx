import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Background, Captions, Chip, Logo, Phone, StoreBadges, Voice } from './components';
import { timeline } from './timeline';
import { C, FPS, GRAD, INTER } from './theme';

type Layout = 'v' | 'h';

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.22, 1, 0.36, 1) });

// Scene visuals: headline + phone (or a custom block). `p` = 0..1 progress through the scene.
const SCENES: Record<string, { bg: 'brand' | 'night' | 'light'; title?: string; render: (p: number, f: number, L: Layout) => React.ReactNode }> = {
  hook: {
    bg: 'night',
    title: 'Son 6 ayda\nne yaptın?',
    render: (p, f, L) => <PhoneIn f={f} L={L} src="screens/17-onboarding-1.png" zoom={{ from: 1, to: 1.22, x: 0.5, y: 0.25 }} p={p} />,
  },
  forget: {
    bg: 'night',
    title: 'Gerisi\nkaybolur.',
    render: (p, f, L) => <Months f={f} L={L} />,
  },
  brand: {
    bg: 'brand',
    render: (p, f, L) => <BrandReveal f={f} L={L} />,
  },
  compose: {
    bg: 'light',
    title: '3 adım.\n5 dakika.',
    render: (p, f, L) => <PhoneIn f={f} L={L} src="screens/clipA.mp4" video startFrom={1.2} rate={1.55} mask={220} zoom={{ from: 1, to: 1.2, x: 0.5, y: 0.3 }} p={p} />,
  },
  summary: {
    bg: 'night',
    title: 'Her haftaya\nAI özeti',
    render: (p, f, L) => <PhoneIn f={f} L={L} src="screens/06-saved.png" zoom={{ from: 1, to: 1.28, x: 0.5, y: 0.62 }} p={p} />,
  },
  report: {
    bg: 'brand',
    title: '6 aylık\nterfi dosyası',
    render: (p, f, L) => <PhoneIn f={f} L={L} src="screens/clipB.mp4" video startFrom={16.8} rate={1.35} zoom={{ from: 1, to: 1.1, x: 0.5, y: 0.4 }} p={p} />,
  },
  privacy: {
    bg: 'night',
    title: 'Veri senin.',
    render: (p, f, L) => <Privacy f={f} L={L} p={p} />,
  },
  cta: {
    bg: 'brand',
    render: (p, f, L) => <Cta f={f} L={L} />,
  },
};

const PhoneIn: React.FC<{ f: number; L: Layout; src: string; video?: boolean; startFrom?: number; rate?: number; mask?: number; zoom?: any; p: number }> = ({ f, L, src, video, startFrom, rate, mask, zoom, p }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 16, mass: 0.8 } });
  const width = L === 'v' ? 600 : 430;
  // Camera push-in on the whole device (not the screen contents), around the zoom focus.
  const z = zoom ? interpolate(ease(p, 0.05, 0.95), [0, 1], [zoom.from ?? 1, zoom.to ?? 1]) : 1;
  return (
    <div style={{ transform: `translateY(${(1 - enter) * 160}px) scale(${(0.92 + enter * 0.08) * z})`, transformOrigin: `${(zoom?.x ?? 0.5) * 100}% ${(zoom?.y ?? 0.5) * 100}%`, opacity: enter }}>
      <Phone src={src} video={video} startFrom={startFrom} playbackRate={rate} maskBottom={mask} width={width} />
    </div>
  );
};

const Months: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const months = ['May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki'];
  const size = L === 'v' ? 138 : 112;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', width: L === 'v' ? 1000 : 820 }}>
      {months.map((m, i) => {
        const appear = ease(f, i * 3, i * 3 + 10);
        const fade = i < 4 ? ease(f, 40 + i * 8, 60 + i * 8) : 0;
        return (
          <div
            key={m}
            style={{
              width: size,
              height: size * 1.15,
              borderRadius: 32,
              background: i < 4 ? 'rgba(255,255,255,0.08)' : C.white,
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: appear * (1 - fade * 0.75),
              filter: `blur(${fade * 6}px)`,
              transform: `translateY(${(1 - appear) * 40}px)`,
              fontFamily: INTER,
            }}>
            <span style={{ fontSize: size * 0.22, fontWeight: 800, letterSpacing: 3, color: i < 4 ? 'rgba(255,255,255,0.7)' : C.brand }}>{m.toLocaleUpperCase('tr-TR')}</span>
            <span style={{ fontSize: size * 0.34, fontWeight: 900, color: i < 4 ? 'rgba(255,255,255,0.6)' : C.brand }}>{i < 4 ? '?' : '✓'}</span>
          </div>
        );
      })}
    </div>
  );
};

const BrandReveal: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 11, mass: 0.6 } });
  const chip = ease(f, 18, 32);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50 }}>
      <div style={{ transform: `scale(${0.6 + pop * 0.4})`, opacity: pop }}>
        <Logo size={L === 'v' ? 160 : 130} subtitle />
      </div>
      <div style={{ opacity: chip, transform: `translateY(${(1 - chip) * 30}px)` }}>
        <Chip dark size={L === 'v' ? 44 : 36}>⏱ Her cuma 5 dakika</Chip>
      </div>
    </div>
  );
};

const Privacy: React.FC<{ f: number; L: Layout; p: number }> = ({ f, L, p }) => {
  return <PhoneIn f={f} L={L} src="screens/20-onboarding-4.png" zoom={{ from: 1, to: 1.15, x: 0.5, y: 0.3 }} p={p} />;
};

const Cta: React.FC<{ f: number; L: Layout }> = ({ f, L }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12 } });
  const btn = ease(f, 14, 28);
  const pulse = 1 + Math.sin(f / 6) * 0.015;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46, fontFamily: INTER }}>
      <div style={{ transform: `scale(${0.7 + pop * 0.3})`, opacity: pop }}>
        <Logo size={L === 'v' ? 150 : 120} subtitle />
      </div>
      <div style={{ fontSize: L === 'v' ? 64 : 54, fontWeight: 900, color: C.white, textAlign: 'center', lineHeight: 1.1, letterSpacing: -1.5, opacity: btn }}>
        Kariyerini kanıtla büyüt.
      </div>
      <div style={{ opacity: btn, transform: `scale(${pulse})`, background: GRAD.gold, color: '#3A2300', fontWeight: 900, fontSize: L === 'v' ? 46 : 38, padding: '28px 60px', borderRadius: 999, boxShadow: '0 20px 50px rgba(245,165,36,0.45)' }}>
        Ücretsiz başla
      </div>
      <div style={{ opacity: btn, transform: `translateY(${(1 - btn) * 20}px)` }}>
        <StoreBadges size={L === 'v' ? 40 : 34} />
      </div>
    </div>
  );
};

const Scene: React.FC<{ scene: any; L: Layout }> = ({ scene, L }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const def = SCENES[scene.scene];
  const p = frame / scene.frames;
  const t = frame / fps - scene.voiceAt;
  const fadeIn = ease(frame, 0, 8);
  const title = def.title ? ease(frame, 2, 14) : 0;
  const dark = def.bg !== 'light';
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Background kind={def.bg} />
      {L === 'v' ? (
        <>
          <div style={{ position: 'absolute', top: def.title ? 420 : 0, bottom: def.title ? 0 : 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: def.title ? 'flex-start' : 'center' }}>
            {def.render(p, frame, L)}
          </div>
          {/* Title after the device so a push-in never covers it. */}
          {def.title && (
            <div style={{ position: 'absolute', top: 150, left: 60, right: 60, textAlign: 'center', fontFamily: INTER, fontSize: 92, fontWeight: 900, lineHeight: 1.02, letterSpacing: -2.5, color: dark ? C.white : C.ink, whiteSpace: 'pre-line', opacity: title, transform: `translateY(${(1 - title) * 30}px)`, textShadow: dark ? '0 6px 24px rgba(0,0,0,0.45)' : '0 4px 18px rgba(255,255,255,0.8)' }}>
              {def.title}
            </div>
          )}
          <div style={{ position: 'absolute', top: 1450, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <Captions words={scene.words} t={t} style="pro" fontSize={44} maxWidth={1000} perPage={4} />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 760, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {def.render(p, frame, L)}
          </div>
          {def.title && (
            <div style={{ position: 'absolute', left: 960, top: 300, width: 860, fontFamily: INTER, fontSize: 104, fontWeight: 900, lineHeight: 1.02, letterSpacing: -3, color: dark ? C.white : C.ink, whiteSpace: 'pre-line', opacity: title, transform: `translateX(${(1 - title) * 40}px)` }}>
              {def.title}
            </div>
          )}
          <div style={{ position: 'absolute', left: def.title ? 960 : 0, right: def.title ? 100 : 0, top: def.title ? 620 : 900, display: 'flex', justifyContent: def.title ? 'flex-start' : 'center' }}>
            <div style={{ textAlign: def.title ? 'left' : 'center' }}>
              <Captions words={scene.words} t={t} style="pro" fontSize={40} maxWidth={def.title ? 860 : 1500} perPage={5} />
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Promo: React.FC<{ layout: Layout }> = ({ layout }) => {
  const { scenes, total } = timeline('promo');
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Audio
        src={staticFile('music/promo.wav')}
        volume={(f) => interpolate(f, [0, 15, total - 45, total], [0, 0.14, 0.14, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      {scenes.map((s) => (
        <Sequence key={s.scene} from={s.from} durationInFrames={s.frames + 8} premountFor={FPS}>
          <Scene scene={s} L={layout} />
          <Voice sentences={s.sentences} at={s.voiceAt} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const promoDuration = () => timeline('promo').total;
