import { syncClanManager } from '../../../lib/services/sync-clan';
import { syncCwlMonitoring } from '../../../lib/services/sync-cwl';
import { syncWarMonitoring } from '../../../lib/services/sync-war';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const authorization = request.headers.get('authorization');
  const allowedSecrets = [process.env.SYNC_SECRET, process.env.CRON_SECRET].filter(Boolean);
  return allowedSecrets.some((secret) => authorization === `Bearer ${secret}`);
}

async function synchronize(request: Request) {
  if (!process.env.SYNC_SECRET && !process.env.CRON_SECRET) {
    return Response.json({ ok: false, error: 'SYNC_SECRET ou CRON_SECRET não configurado.' }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const clan = await syncClanManager();
    const war = await syncWarMonitoring();
    const cwl = await syncCwlMonitoring();
    return Response.json({ ok: true, result: { clan, war, cwl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida.';
    console.error('[clan-sync]', message);
    return Response.json({ ok: false, error: message }, { status: 502 });
  }
}

export function GET(request: Request) {
  return synchronize(request);
}

export function POST(request: Request) {
  return synchronize(request);
}
