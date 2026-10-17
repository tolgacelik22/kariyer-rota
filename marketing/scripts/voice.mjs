// Generates the voice-over (Microsoft Edge neural TTS) sentence by sentence, then trims each sentence to the
// actual speech using word timings. Edge leaves ~1 s of silence after every sentence and at the end of each file,
// which made the narration sound halting; the composition re-spaces sentences with short, natural breaths instead.
// Usage: node scripts/voice.mjs → public/voice/<video>/<line>-<sentence>/audio.mp3 + src/voice-manifest.json
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { SCRIPTS } from '../src/scripts.js';

const BITRATE = 96000; // CBR, so duration = bytes * 8 / bitrate
const PRE = 0.04; // keep a hair of audio before the first word
const POST = 0.1; // and let the last word decay naturally
const BREATH = 0.12; // pause between sentences inside one line

const splitSentences = (text) => text.match(/[^.!?]+[.!?]*/g).map((s) => s.trim()).filter(Boolean);

async function synth(voice, text, prosody, dir) {
  for (let attempt = 1; ; attempt++) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
      const r = await tts.toFile(dir, text, prosody);
      tts.close?.();
      const duration = (fs.statSync(r.audioFilePath).size * 8) / BITRATE;
      const words = JSON.parse(fs.readFileSync(r.metadataFilePath, 'utf8'))
        .Metadata.filter((m) => m.Type === 'WordBoundary')
        .map((m) => ({ text: m.Data.text.Text, start: m.Data.Offset / 1e7, end: (m.Data.Offset + m.Data.Duration) / 1e7 }));
      if (!words.length) throw new Error('no word timings');
      return { duration, words };
    } catch (e) {
      if (attempt >= 4) throw e;
      await new Promise((res) => setTimeout(res, 1500 * attempt));
    }
  }
}

const manifest = {};
for (const [video, def] of Object.entries(SCRIPTS)) {
  manifest[video] = [];
  fs.rmSync(path.join('public', 'voice', video), { recursive: true, force: true });
  for (let i = 0; i < def.lines.length; i++) {
    const sentences = [];
    let cursor = 0; // seconds from the line's start
    const words = [];
    for (const [k, text] of splitSentences(def.lines[i].text).entries()) {
      const dir = path.join('public', 'voice', video, `${i}-${k}`);
      const { duration, words: w } = await synth(def.voice, text, { rate: def.rate, pitch: def.pitch }, dir);
      const trimStart = Math.max(0, w[0].start - PRE);
      const trimEnd = Math.min(duration, w[w.length - 1].end + POST);
      if (k > 0) cursor += BREATH;
      sentences.push({ file: `voice/${video}/${i}-${k}/audio.mp3`, at: cursor, trimStart, trimEnd });
      for (const x of w) words.push({ text: x.text, start: cursor + x.start - trimStart, end: cursor + x.end - trimStart });
      cursor += trimEnd - trimStart;
    }
    manifest[video].push({ sentences, words, duration: cursor });
    console.log(video, i, cursor.toFixed(2) + 's', def.lines[i].text.slice(0, 48));
  }
}
fs.writeFileSync('src/voice-manifest.json', JSON.stringify(manifest, null, 2));
console.log('manifest written');
