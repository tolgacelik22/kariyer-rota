import manifest from './voice-manifest.json';
import { SCRIPTS } from './scripts.js';
import { FPS } from './theme';

export type Sentence = { file: string; at: number; trimStart: number; trimEnd: number };
export type Line = { scene: string; text: string; sentences: Sentence[]; duration: number; words: { text: string; start: number; end: number }[] };

const LEAD = 0.3; // silence before the first line
const GAP = 0.2; // breath between lines (scene changes)
const TAIL = 1.6; // hold after the last line

// Scene start/length in frames, derived from the trimmed voice-over durations.
export function timeline(video: 'promo' | 'story') {
  const lines: Line[] = (manifest as any)[video].map((m: any, i: number) => ({ ...m, ...(SCRIPTS as any)[video].lines[i] }));
  let t = 0;
  const scenes = lines.map((line, i) => {
    const start = t;
    const voiceAt = i === 0 ? LEAD : 0;
    const len = voiceAt + line.duration + (i === lines.length - 1 ? TAIL : GAP);
    t = start + len;
    return { ...line, from: Math.round(start * FPS), frames: Math.round(len * FPS), voiceAt };
  });
  return { scenes, total: Math.round(t * FPS) };
}

export const VOICE_VOLUME = 1.35;
