import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dir = path.join(process.cwd(), 'public', 'assets', 'clash');
const files = await readdir(dir);
const sources = files.filter((name) => name.endsWith('.webp.b64'));

for (const name of sources) {
  const source = path.join(dir, name);
  const target = path.join(dir, name.slice(0, -4));
  const base64 = (await readFile(source, 'utf8')).replace(/\s+/g, '');
  await writeFile(target, Buffer.from(base64, 'base64'));
  console.log(`decoded ${name} -> ${path.basename(target)}`);
}
