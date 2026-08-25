import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'assets', 'clash');
const files = await readdir(dir);
const sources = files.filter((name) => name.endsWith('.webp.b64'));

for (const source of sources) {
  const input = join(dir, source);
  const output = join(dir, source.replace(/\.b64$/, ''));
  const encoded = (await readFile(input, 'utf8')).trim();
  await writeFile(output, Buffer.from(encoded, 'base64'));
  console.log(`materialized ${source} -> ${output}`);
}
