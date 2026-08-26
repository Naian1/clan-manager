export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const townHallLevel = Number(level);
  if (!Number.isInteger(townHallLevel) || townHallLevel < 1 || townHallLevel > 18) {
    return new Response('Town Hall inválido.', { status: 400 });
  }

  const original = `assets.clashk.ing/buildings/home-village/town_hall/level_${townHallLevel}.webp`;
  const source = `https://images.weserv.nl/?url=${encodeURIComponent(original)}&output=png`;
  try {
    const response = await fetch(source, { next: { revalidate: 604800 } });
    if (!response.ok) return new Response('Arte do Town Hall indisponível.', { status: 404 });
    return new Response(await response.arrayBuffer(), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
      },
    });
  } catch {
    return new Response('Arte do Town Hall indisponível.', { status: 502 });
  }
}
