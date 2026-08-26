import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const townHallLevel = Number(level);
  if (!Number.isInteger(townHallLevel) || townHallLevel < 1 || townHallLevel > 18) {
    return new Response('Town Hall inválido.', { status: 400 });
  }

  const source = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${townHallLevel}.webp`;
  try {
    const response = await fetch(source, { next: { revalidate: 604800 } });
    if (!response.ok) return new Response('Arte do Town Hall indisponível.', { status: 404 });
    const input = Buffer.from(await response.arrayBuffer());
    const png = await sharp(input).png({ compressionLevel: 9 }).toBuffer();
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      },
    });
  } catch {
    return new Response('Arte do Town Hall indisponível.', { status: 502 });
  }
}
