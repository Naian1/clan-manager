import { readFile, writeFile, access } from 'node:fs/promises';
import { join, basename } from 'node:path';
import sharp from 'sharp';

const dir = join(process.cwd(), 'public', 'assets', 'clash');
const sources = [
  'panel-ranking.webp.b64',
  'panel-stone.webp.b64',
  'panel-war.webp.b64',
  'ranking-frame.webp.b64',
  'ribbon-red.webp.b64',
];

for (const source of sources) {
  const input = join(dir, source);
  const output = join(dir, source.replace(/\.b64$/, ''));
  const encoded = (await readFile(input, 'utf8')).trim();
  await writeFile(output, Buffer.from(encoded, 'base64'));
  console.log(`materialized ${source} -> ${output}`);
}

const rasterSources = [
  'hero-bg.webp',
  'wood-tab.webp',
  'war-axes.webp',
  'panel-ranking.webp',
  'panel-stone.webp',
  'panel-war.webp',
  'ranking-frame.webp',
  'ribbon-red.webp',
];

for (const file of rasterSources) {
  const input = join(dir, file);
  try {
    await access(input);
    const output = join(dir, file.replace(/\.webp$/i, '.png'));
    await sharp(input).png({ compressionLevel: 9, palette: false }).toFile(output);
    console.log(`converted ${basename(input)} -> ${basename(output)}`);
  } catch (error) {
    console.warn(`skipped ${file}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
