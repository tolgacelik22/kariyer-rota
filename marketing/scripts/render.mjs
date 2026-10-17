// Renders store images and/or videos. Usage: node scripts/render.mjs [stills|videos|<compositionId>...]
import fs from 'node:fs';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer';

const args = process.argv.slice(2);
const want = (id, isStill) => !args.length || args.includes(id) || args.includes(isStill ? 'stills' : 'videos');

const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public'), enableCaching: false });
const comps = await getCompositions(serveUrl);
fs.mkdirSync('out/play-store', { recursive: true });
fs.mkdirSync('out/subscription', { recursive: true });
fs.mkdirSync('out/video', { recursive: true });

for (const c of comps) {
  const isStill = c.durationInFrames === 1;
  if (!want(c.id, isStill)) continue;
  if (isStill) {
    const dir = c.id.startsWith('subscription') ? 'out/subscription' : 'out/play-store';
    await renderStill({ composition: c, serveUrl, output: path.resolve(dir, `${c.id}.png`), imageFormat: 'png' });
    console.log('still', c.id);
  } else {
    await renderMedia({
      composition: c,
      serveUrl,
      codec: 'h264',
      crf: 18,
      audioBitrate: '192k',
      outputLocation: path.resolve('out/video', `${c.id}.mp4`),
      concurrency: 4,
      onProgress: ({ progress }) => process.stdout.write(`\r${c.id} ${(progress * 100).toFixed(0)}%   `),
    });
    console.log('\nvideo', c.id);
  }
}
