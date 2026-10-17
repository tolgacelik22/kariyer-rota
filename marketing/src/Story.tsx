import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { Background, Captions, FullScreen, Logo } from './components';
import { timeline } from './timeline';
import { C, FPS, GRAD, INTER } from './theme';

const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.22, 1, 0.36, 1) });

// First-person, UGC-style cut: full-bleed screen recordings, handheld drift, punch-in zooms, bold karaoke captions.
const SCENES: Record<string, (p: number, f: number) => React.ReactNode> = {
  hook: (p, f) => (
    <>
      <FullScreen src="screens/17-onboarding-1.png" zoom={{ from: 1.12, to: 1.28, x: 0.5, y: 0.17 }} progress={p} />
      <AbsoluteFill style={{ background: 'rgba(11,18,32,0.55)' }} />
      <TopNote f={f} text="POV: performans görüşmesi 😶" />
    </>
  ),
  problem: (p) => <FullScreen src="screens/17-onboarding-1.png" zoom={{ from: 1.04, to: 1.2, x: 0.5, y: 0.33 }} progress={p} />,
  found: (p, f) => <Found f={f} />,
  friday: (p) => <FullScreen src="screens/clipA.mp4" video startFrom={1.2} playbackRate={1.3} maskBottom={230} zoom={{ from: 1.04, to: 1.14, x: 0.5, y: 0.22 }} progress={p} />,
  summary: (p) => <FullScreen src="screens/06-saved.png" zoom={{ from: 1.04, to: 1.28, x: 0.5, y: 0.6 }} progress={p} />,
  report: (p) => <FullScreen src="screens/clipB.mp4" video startFrom={17} playbackRate={1.2} zoom={{ from: 1, to: 1.08, x: 0.5, y: 0.3 }} progress={p} />,
  feeling: (p) => <FullScreen src="screens/10-report-review-2.png" zoom={{ from: 1, to: 1.12, x: 0.5, y: 0.3 }} progress={p} />,
  cta: (p, f) => <End f={f} />,
};

const TopNote: React.FC<{ f: number; text: string }> = ({ f, text }) => {
  const a = ease(f, 4, 16);
  return (
    <div style={{ position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * -20}px)` }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 46, color: C.ink, background: C.white, padding: '18px 34px', borderRadius: 22, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }}>{text}</div>
    </div>
  );
};

const Found: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 10, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <Background kind="brand" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${0.5 + pop * 0.5}) rotate(${(1 - pop) * -8}deg)`, opacity: pop, marginTop: -260 }}>
          <Logo size={170} subtitle />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const End: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 12 } });
  const btn = ease(f, 12, 26);
  return (
    <AbsoluteFill>
      <Background kind="brand" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 50, fontFamily: INTER, paddingBottom: 380 }}>
        <div style={{ transform: `scale(${0.7 + pop * 0.3})`, opacity: pop }}>
          <Logo size={150} subtitle />
        </div>
        <div style={{ opacity: btn, background: GRAD.gold, color: '#3A2300', fontWeight: 900, fontSize: 48, padding: '28px 64px', borderRadius: 999, transform: `scale(${1 + Math.sin(f / 6) * 0.015})`, boxShadow: '0 20px 50px rgba(245,165,36,0.45)' }}>
          Bu cuma başla
        </div>
        <div style={{ opacity: btn, color: 'rgba(255,255,255,0.8)', fontSize: 34, fontWeight: 600 }}>Google Play’de · Ücretsiz</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ scene: any; index: number }> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = frame / scene.frames;
  const t = frame / fps - scene.voiceAt;
  // Punch-in at each cut + slow handheld drift.
  const punch = interpolate(frame, [0, 7], [1.07, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const seed = index * 1.7;
  const dx = Math.sin(frame / 23 + seed) * 7 + Math.sin(frame / 9 + seed) * 2;
  const dy = Math.cos(frame / 19 + seed) * 8;
  const rot = Math.sin(frame / 31 + seed) * 0.45;
  const isCard = scene.scene === 'found' || scene.scene === 'cta';
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: C.night }}>
      <AbsoluteFill style={{ transform: isCard ? `scale(${punch})` : `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${punch * 1.04})` }}>
        {SCENES[scene.scene](p, frame)}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0) 90%)' }} />
      <div style={{ position: 'absolute', top: 1080, left: 50, right: 50, display: 'flex', justifyContent: 'center' }}>
        <Captions words={scene.words} t={t} style="ugc" fontSize={88} maxWidth={980} perPage={3} />
      </div>
    </AbsoluteFill>
  );
};

export const Story: React.FC = () => {
  const { scenes, total } = timeline('story');
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Audio
        src={staticFile('music/story.wav')}
        volume={(f) => interpolate(f, [0, 15, total - 45, total], [0, 0.11, 0.11, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      {scenes.map((s, i) => (
        <Sequence key={s.scene} from={s.from} durationInFrames={s.frames} premountFor={FPS}>
          <Scene scene={s} index={i} />
          <Sequence from={Math.round(s.voiceAt * FPS)}>
            <Audio src={staticFile(s.file)} volume={1} />
          </Sequence>
        </Sequence>
      ))}
      {/* Disclosure: dramatised testimonial with a synthetic voice. */}
      <div style={{ position: 'absolute', top: 250, right: 40, fontFamily: INTER, fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.35)', padding: '8px 16px', borderRadius: 10 }}>
        Canlandırmadır
      </div>
    </AbsoluteFill>
  );
};

export const storyDuration = () => timeline('story').total;
