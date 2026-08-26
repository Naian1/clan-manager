import { readFile, writeFile, access } from 'node:fs/promises';
import { join, basename } from 'node:path';
import sharp from 'sharp';

const dir = join(process.cwd(), 'public', 'assets', 'clash');
// The UI uses the committed PNG/SVG pack. Keep this list limited to the
// raster files that are actually valid and consumed by the app.
const sources = [];

for (const source of sources) {
  const input = join(dir, source);
  const output = join(dir, source.replace(/\.b64$/, ''));
  const encoded = (await readFile(input, 'utf8')).trim();
  await writeFile(output, Buffer.from(encoded, 'base64'));
  console.log(`materialized ${source} -> ${output}`);
}

const rasterSources = [];

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
