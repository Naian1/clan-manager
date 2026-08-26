import { syncCwlMonitoring } from '../../../../lib/services/sync-cwl';
import { syncWarMonitoring } from '../../../../lib/services/sync-war';
import { isSyncAuthorized } from '../../../../lib/sync-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

async function synchronize(request: Request) {
  if (!(await isSyncAuthorized(request))) {
    return Response.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const [war, cwl] = await Promise.all([syncWarMonitoring(), syncCwlMonitoring()]);
    return Response.json({ ok: true, result: { war, cwl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida.';
    console.error('[fast-sync]', message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}

export function GET(request: Request) { return synchronize(request); }
export function POST(request: Request) { return synchronize(request); }
