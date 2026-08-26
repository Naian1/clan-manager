import { syncClanManager } from '../../../lib/services/sync-clan';
import { syncCapitalMonitoring } from '../../../lib/services/sync-capital';
import { syncCwlMonitoring } from '../../../lib/services/sync-cwl';
import { syncWarMonitoring } from '../../../lib/services/sync-war';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET() {
  try {
    const clan = await syncClanManager();
    const [war, cwl, capital] = await Promise.all([
      syncWarMonitoring(),
      syncCwlMonitoring(),
      syncCapitalMonitoring(),
    ]);
    return Response.json({ ok: true, result: { clan, war, cwl, capital } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida.';
    console.error('[bootstrap-sync]', message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}
