import { syncClanManager } from '../../../lib/services/sync-clan';
import { syncCapitalMonitoring } from '../../../lib/services/sync-capital';
import { syncCwlMonitoring } from '../../../lib/services/sync-cwl';
import { syncWarMonitoring } from '../../../lib/services/sync-war';
import { isSyncAuthorized } from '../../../lib/sync-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function synchronize(request: Request) {
  if (!(await isSyncAuthorized(request))) {
    return Response.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }

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
    console.error('[clan-sync]', message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}

export function GET(request: Request) { return synchronize(request); }
export function POST(request: Request) { return synchronize(request); }
