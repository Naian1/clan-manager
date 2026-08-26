import { NextResponse } from 'next/server';

export async function GET() {
  const supabasePublicConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return NextResponse.json({
    ok: true,
    app: 'Clan Manager',
    clanTag: '#2GRURLPLL',
    supercellConfigured: Boolean(process.env.CLASH_API_TOKEN || process.env.SUPERCELL_API_TOKEN),
    supabasePublicConfigured,
    supabaseServerConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL
      && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    ),
    syncProtected: Boolean(process.env.SYNC_SECRET || process.env.CRON_SECRET),
  });
}
