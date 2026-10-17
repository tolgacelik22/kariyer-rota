import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, GRAD, INTER } from './theme';

const SCREEN_W = 1080;
const SCREEN_H = 2400;

export type Zoom = { from?: number; to?: number; x?: number; y?: number };

// Android phone mock: bezel + rounded screen. `zoom` scales the screen content around (x, y) in 0..1.
export const Phone: React.FC<{
  src: string;
  video?: boolean;
  startFrom?: number; // seconds into the clip
  playbackRate?: number;
  width: number;
  zoom?: Zoom;
  progress?: number; // 0..1 for zoom animation
  maskBottom?: number; // px of the raw screen to cover (hides the ADB keyboard strip)
  statusBar?: string; // paint the status strip in this colour (for dark screens)
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({ src, video, startFrom = 0, playbackRate = 1, width, zoom, progress = 0, maskBottom = 0, statusBar, shadow = true, style }) => {
  const { fps } = useVideoConfig();
  const bezel = width * 0.028;
  const inner = width - bezel * 2;
  const scale = inner / SCREEN_W;
  const height = inner * (SCREEN_H / SCREEN_W) + bezel * 2;
  const z = zoom ? interpolate(progress, [0, 1], [zoom.from ?? 1, zoom.to ?? 1]) : 1;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: width * 0.13,
        background: '#0D1424',
        padding: bezel,
        boxSizing: 'border-box',
        boxShadow: shadow ? '0 40px 90px rgba(11,18,32,0.35), 0 8px 24px rgba(11,18,32,0.25)' : undefined,
        position: 'relative',
        ...style,
      }}>
      <div style={{ width: inner, height: inner * (SCREEN_H / SCREEN_W), borderRadius: width * 0.105, overflow: 'hidden', position: 'relative', background: C.bg }}>
        <div
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            position: 'absolute',
            left: 0,
            top: 0,
            transformOrigin: '0 0',
            // Zoom around the focus point f, keeping it where it sits at zoom 1: p' = f·s + (p − f)·s·z
            transform: `translate(${SCREEN_W * (zoom?.x ?? 0.5) * scale * (1 - z)}px, ${SCREEN_H * (zoom?.y ?? 0.5) * scale * (1 - z)}px) scale(${scale * z})`,
          }}>
          {video ? (
            <OffthreadVideo src={staticFile(src)} startFrom={Math.round(startFrom * fps)} playbackRate={playbackRate} muted style={{ width: SCREEN_W, height: SCREEN_H }} />
          ) : (
            <Img src={staticFile(src)} style={{ width: SCREEN_W, height: SCREEN_H }} />
          )}
          {statusBar && (
            // Expo Go draws a light status strip; store builds draw edge-to-edge, so dark screens get a dark bar.
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 136, background: statusBar, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px 0 80px', fontFamily: INTER, color: C.white }}>
              <span style={{ fontSize: 40, fontWeight: 500 }}>9:41</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <svg width="44" height="34" viewBox="0 0 44 34"><path d="M22 34 L0 8 Q22 -8 44 8 Z" fill="white" /></svg>
                <span style={{ width: 22, height: 38, borderRadius: 5, background: 'white', display: 'inline-block' }} />
              </span>
            </div>
          )}
          {maskBottom > 0 && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: maskBottom, background: statusBar ? '#0B1220' : C.bg }}>
              <div style={{ position: 'absolute', bottom: 34, left: '50%', width: 260, height: 12, marginLeft: -130, borderRadius: 6, background: statusBar ? 'rgba(255,255,255,0.55)' : '#454B57' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// A full-bleed screen (no bezel) for UGC-style shots; fills the frame width and pans vertically.
export const FullScreen: React.FC<{
  src: string;
  video?: boolean;
  startFrom?: number;
  playbackRate?: number;
  zoom?: Zoom;
  progress?: number;
  maskBottom?: number;
}> = ({ src, video, startFrom = 0, playbackRate = 1, zoom, progress = 0, maskBottom = 0 }) => {
  const { width, height, fps } = useVideoConfig();
  const base = width / SCREEN_W;
  const z = zoom ? interpolate(progress, [0, 1], [zoom.from ?? 1, zoom.to ?? 1]) : 1;
  const s = base * z;
  const fx = zoom?.x ?? 0.5;
  const fy = zoom?.y ?? 0.4;
  // Keep the focus point (fx, fy) of the screen at the frame's centre-ish, clamped to the edges.
  const left = Math.min(0, Math.max(width - SCREEN_W * s, width / 2 - SCREEN_W * fx * s));
  const top = Math.min(0, Math.max(height - SCREEN_H * s, height * 0.45 - SCREEN_H * fy * s));
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left, top, width: SCREEN_W, height: SCREEN_H, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        {video ? (
          <OffthreadVideo src={staticFile(src)} startFrom={Math.round(startFrom * fps)} playbackRate={playbackRate} muted style={{ width: SCREEN_W, height: SCREEN_H }} />
        ) : (
          <Img src={staticFile(src)} style={{ width: SCREEN_W, height: SCREEN_H }} />
        )}
        {maskBottom > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: maskBottom, background: C.bg }} />}
      </div>
    </AbsoluteFill>
  );
};

export const Logo: React.FC<{ size: number; dark?: boolean; subtitle?: boolean }> = ({ size, dark, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.32, fontFamily: INTER }}>
    <Img src={staticFile('icon.png')} style={{ width: size, height: size, borderRadius: size * 0.24, boxShadow: '0 10px 30px rgba(20,40,107,0.35)' }} />
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: size * 0.62, fontWeight: 900, letterSpacing: -size * 0.02, color: dark ? C.ink : C.white, lineHeight: 1 }}>Promotly</span>
      {subtitle && (
        <span style={{ fontSize: size * 0.2, fontWeight: 700, letterSpacing: size * 0.02, color: dark ? C.muted : 'rgba(255,255,255,0.7)', marginTop: size * 0.1, textTransform: 'uppercase' }}>
          Terfi ve Başarı Arşivi
        </span>
      )}
    </div>
  </div>
);

export type Word = { text: string; start: number; end: number };

// Word-synced captions. Shows `perPage` words at a time and highlights the spoken ones.
export const Captions: React.FC<{
  words: Word[];
  t: number; // seconds since the line started
  perPage?: number;
  style: 'pro' | 'ugc';
  fontSize: number;
  maxWidth: number;
}> = ({ words, t, perPage = 6, style, fontSize, maxWidth }) => {
  if (!words.length) return null;
  const pages: Word[][] = [];
  for (let i = 0; i < words.length; i += perPage) pages.push(words.slice(i, i + perPage));
  let page = pages.findIndex((p) => t < p[p.length - 1].end + 0.05);
  if (page === -1) page = pages.length - 1;
  const current = pages[page];
  return (
    <div style={{ maxWidth, textAlign: 'center', fontFamily: INTER, lineHeight: 1.18 }}>
      {style === 'pro' ? (
        <div style={{ display: 'inline-block', background: 'rgba(11,18,32,0.9)', padding: `${fontSize * 0.32}px ${fontSize * 0.55}px`, borderRadius: fontSize * 0.45, whiteSpace: 'nowrap', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          {current.map((w, i) => (
            <span key={i} style={{ fontSize, fontWeight: 700, color: t >= w.start ? C.white : 'rgba(255,255,255,0.4)' }}>
              {w.text}
              {i < current.length - 1 ? ' ' : ''}
            </span>
          ))}
        </div>
      ) : (
        current.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.08;
          const spoken = t >= w.start;
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: `0 ${fontSize * 0.12}px`,
                fontSize,
                fontWeight: 900,
                textTransform: 'none',
                color: active ? '#FFD84D' : C.white,
                opacity: spoken ? 1 : 0.55,
                transform: `scale(${active ? 1.08 : 1})`,
                WebkitTextStroke: `${fontSize * 0.09}px #0B1220`,
                paintOrder: 'stroke fill',
                textShadow: '0 6px 18px rgba(0,0,0,0.45)',
              }}>
              {w.text}
            </span>
          );
        })
      )}
    </div>
  );
};

export const useEnter = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

export const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number }> = ({ children, dark, size = 30 }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.4,
      padding: `${size * 0.45}px ${size * 0.8}px`,
      borderRadius: 999,
      fontFamily: INTER,
      fontWeight: 700,
      fontSize: size,
      color: dark ? C.white : C.brand,
      background: dark ? 'rgba(255,255,255,0.12)' : C.brandSoft,
      border: dark ? '1.5px solid rgba(255,255,255,0.18)' : 'none',
    }}>
    {children}
  </div>
);

export const Background: React.FC<{ kind: keyof typeof GRAD }> = ({ kind }) => (
  <AbsoluteFill style={{ background: GRAD[kind] }}>
    {kind !== 'light' && (
      <>
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: 450, background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 70%)', top: -300, right: -300 }} />
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: 400, background: 'radial-gradient(circle, rgba(245,165,36,0.14) 0%, rgba(245,165,36,0) 70%)', bottom: -300, left: -250 }} />
      </>
    )}
    {kind === 'light' && (
      <div style={{ position: 'absolute', width: 1000, height: 1000, borderRadius: 500, background: 'radial-gradient(circle, rgba(59,91,219,0.12) 0%, rgba(59,91,219,0) 70%)', top: -350, right: -350 }} />
    )}
  </AbsoluteFill>
);
