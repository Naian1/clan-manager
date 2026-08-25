import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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
