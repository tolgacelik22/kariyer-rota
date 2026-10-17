// Synthesises royalty-free background music (warm pad + pluck arpeggio + soft drums) as 16-bit stereo WAV.
// Usage: node scripts/music.mjs → public/music/promo.wav, public/music/story.wav
import fs from 'node:fs';

const SR = 44100;

function render({ bpm, seconds, chords, seed, drums, brightness }) {
  const n = Math.ceil(seconds * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const beat = 60 / bpm;
  const bar = beat * 4;
  let rnd = seed;
  const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const add = (buf, i, v) => { if (i >= 0 && i < n) buf[i] += v; };

  // Pad: detuned saw-ish (few harmonics) with slow attack per bar.
  for (let b = 0; b * bar < seconds; b++) {
    const chord = chords[b % chords.length];
    const t0 = Math.floor(b * bar * SR);
    const len = Math.floor(bar * SR * 1.15);
    chord.forEach((note, k) => {
      const f = midi(note);
      const pan = 0.5 + (k - 1.5) * 0.18;
      for (let i = 0; i < len; i++) {
        const t = i / SR;
        const env = Math.min(1, t / 0.9) * Math.min(1, (len - i) / (SR * 0.6));
        let s = 0;
        for (let h = 1; h <= 4; h++) s += Math.sin(2 * Math.PI * f * h * t * (1 + (h % 2 ? 0.0015 : -0.0015))) / (h * h);
        s *= 0.035 * env;
        add(L, t0 + i, s * (1 - pan) * 2);
        add(R, t0 + i, s * pan * 2);
      }
    });
    // Bass: root an octave down on beats 1 and 3.
    [0, 2].forEach((q) => {
      const f = midi(chord[0] - 12);
      const s0 = Math.floor((b * bar + q * beat) * SR);
      for (let i = 0; i < SR * beat * 1.8; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 2.2) * Math.min(1, t / 0.01);
        const v = Math.sin(2 * Math.PI * f * t) * 0.11 * env;
        add(L, s0 + i, v); add(R, s0 + i, v);
      }
    });
    // Pluck arpeggio in eighths.
    for (let e = 0; e < 8; e++) {
      const note = chord[(e * 3 + (e > 3 ? 1 : 0)) % chord.length] + 12;
      const f = midi(note);
      const s0 = Math.floor((b * bar + e * beat / 2) * SR);
      const pan = 0.3 + rand() * 0.4;
      for (let i = 0; i < SR * 0.45; i++) {
        const t = i / SR;
        const env = Math.exp(-t * 7) * Math.min(1, t / 0.003);
        const v = (Math.sin(2 * Math.PI * f * t) + 0.3 * brightness * Math.sin(4 * Math.PI * f * t)) * 0.045 * env;
        add(L, s0 + i, v * (1 - pan) * 2); add(R, s0 + i, v * pan * 2);
      }
    }
    if (drums && b >= 1) {
      for (let q = 0; q < 4; q++) {
        // Soft kick on 1 and 3.
        if (q % 2 === 0) {
          const s0 = Math.floor((b * bar + q * beat) * SR);
          for (let i = 0; i < SR * 0.3; i++) {
            const t = i / SR;
            const f = 50 + 70 * Math.exp(-t * 30);
            const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * 0.22;
            add(L, s0 + i, v); add(R, s0 + i, v);
          }
        }
        // Hat on off-beats.
        const h0 = Math.floor((b * bar + q * beat + beat / 2) * SR);
        for (let i = 0; i < SR * 0.05; i++) {
          const v = (rand() * 2 - 1) * Math.exp(-(i / SR) * 90) * 0.035;
          add(L, h0 + i, v * 0.8); add(R, h0 + i, v);
        }
      }
    }
  }

  // Fade in/out and normalise.
  const fade = SR * 1.5;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const g = Math.min(1, i / (SR * 0.8), (n - i) / fade);
    L[i] *= g; R[i] *= g;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const norm = 0.8 / peak;
  const data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

fs.mkdirSync('public/music', { recursive: true });
// Promo: confident I–V–vi–IV in C, with drums.
fs.writeFileSync('public/music/promo.wav', render({
  bpm: 100, seconds: 62, seed: 7, drums: true, brightness: 1,
  chords: [[48, 55, 60, 64], [43, 50, 59, 62], [45, 52, 60, 64], [41, 48, 57, 60]],
}));
// Story: softer, personal vi–IV–I–V in A minor/C, lighter drums.
fs.writeFileSync('public/music/story.wav', render({
  bpm: 92, seconds: 62, seed: 11, drums: true, brightness: 0.4,
  chords: [[45, 52, 57, 60], [41, 48, 57, 60], [48, 55, 60, 64], [43, 50, 55, 59]],
}));
console.log('music written');
