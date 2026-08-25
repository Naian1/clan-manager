import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: 'Clan Manager',
    clanTag: '#2GRURLPLL',
    supercellConfigured: Boolean(process.env.CLASH_API_TOKEN),
    supabaseConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  });
}
