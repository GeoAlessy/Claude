// Renderiza stills de control de calidad y arma una hoja de contactos.
// Uso: node scripts/stills.mjs [frames separados por coma] [escala]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const frames = (process.argv[2] || '').split(',').filter(Boolean).map(Number);
const scale = Number(process.argv[3] || 0.35);
const outDir = path.resolve('out/qa');
fs.mkdirSync(outDir, {recursive: true});
const exe = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const browserExecutable = fs.existsSync(exe) ? exe : null;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Ep01', inputProps: {conAudio: false}, browserExecutable});
const lista = frames.length ? frames : Array.from({length: Math.ceil(composition.durationInFrames / 60)}, (_, i) => i * 60);
for (const frame of lista) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, output, frame, scale, inputProps: {conAudio: false}, browserExecutable});
  console.log('ok', output);
}
