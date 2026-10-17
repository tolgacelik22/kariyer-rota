// Review helper: grabs frames at given seconds from a rendered video into one contact sheet.
// Usage: node scripts/sheet.mjs out/video/promo-vertical.mp4 tmp/sheet.png 3 9 14 ...
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('../../web/node_modules/sharp');

const [video, out, ...times] = process.argv.slice(2);
const ff = 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
fs.mkdirSync('tmp/frames', { recursive: true });
const files = times.map((t, i) => {
  const f = `tmp/frames/${i}.png`;
  execFileSync(ff, ['-v', 'error', '-y', '-ss', t, '-i', video, '-frames:v', '1', f]);
  return f;
});
const meta = await sharp(files[0]).metadata();
const w = meta.width > meta.height ? 480 : 270;
const h = Math.round((w * meta.height) / meta.width);
const cols = 4;
const rows = Math.ceil(files.length / cols);
const imgs = await Promise.all(files.map((f) => sharp(f).resize(w, h).toBuffer()));
await sharp({ create: { width: w * cols, height: h * rows, channels: 3, background: '#fff' } })
  .composite(imgs.map((b, i) => ({ input: b, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
  .png()
  .toFile(out);
console.log('sheet', out);
