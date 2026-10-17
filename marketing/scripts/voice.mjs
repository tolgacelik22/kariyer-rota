// Generates the voice-over lines (Microsoft Edge neural TTS) and a manifest with durations and word timings.
// Usage: node scripts/voice.mjs   → public/voice/<video>/<n>.mp3 + src/voice-manifest.json
import fs from 'node:fs';
import path from 'node:path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { SCRIPTS } from '../src/scripts.js';

const BITRATE = 96000; // AUDIO_24KHZ_96KBITRATE_MONO_MP3 is CBR, so duration = bytes * 8 / bitrate
const manifest = {};

for (const [video, def] of Object.entries(SCRIPTS)) {
  manifest[video] = [];
  for (let i = 0; i < def.lines.length; i++) {
    const line = def.lines[i];
    const dir = path.join('public', 'voice', video, String(i));
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const tts = new MsEdgeTTS();
    await tts.setMetadata(def.voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    const { audioFilePath, metadataFilePath } = await tts.toFile(dir, line.text, { rate: def.rate, pitch: def.pitch });
    tts.close?.();
    const bytes = fs.statSync(audioFilePath).size;
    const meta = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8')).Metadata || [];
    const words = meta
      .filter((m) => m.Type === 'WordBoundary')
      .map((m) => ({ text: m.Data.text.Text, start: m.Data.Offset / 1e7, end: (m.Data.Offset + m.Data.Duration) / 1e7 }));
    manifest[video].push({ file: `voice/${video}/${i}/audio.mp3`, duration: (bytes * 8) / BITRATE, words });
    console.log(video, i, ((bytes * 8) / BITRATE).toFixed(2) + 's', line.text.slice(0, 50));
  }
}

fs.writeFileSync('src/voice-manifest.json', JSON.stringify(manifest, null, 2));
console.log('manifest written');
