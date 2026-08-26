import { createPublicKey, verify as verifySignature } from 'node:crypto';

const GITHUB_ISSUER = 'https://token.actions.githubusercontent.com';
const GITHUB_JWKS = 'https://token.actions.githubusercontent.com/.well-known/jwks';
const EXPECTED_AUDIENCE = 'clan-manager-sync';
const EXPECTED_REPOSITORY = 'Naian1/clan-manager';
const EXPECTED_REF = 'refs/heads/main';
const EXPECTED_WORKFLOW = '.github/workflows/clash-sync.yml';

type JwtHeader = { alg?: string; kid?: string };
type JwtPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  repository?: string;
  ref?: string;
  workflow_ref?: string;
};

type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };
let cachedJwks: { keys: Jwk[]; expiresAt: number } | null = null;

function decodePart<T>(part: string): T | null {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

async function getJwks() {
  const now = Date.now();
  if (cachedJwks && cachedJwks.expiresAt > now) return cachedJwks.keys;
  const response = await fetch(GITHUB_JWKS, { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error(`GitHub OIDC JWKS respondeu ${response.status}`);
  const payload = await response.json() as { keys?: Jwk[] };
  const keys = payload.keys ?? [];
  cachedJwks = { keys, expiresAt: now + 60 * 60 * 1000 };
  return keys;
}

function audienceMatches(aud?: string | string[]) {
  return Array.isArray(aud) ? aud.includes(EXPECTED_AUDIENCE) : aud === EXPECTED_AUDIENCE;
}

async function verifyGithubOidc(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const header = decodePart<JwtHeader>(parts[0]);
  const payload = decodePart<JwtPayload>(parts[1]);
  if (!header || !payload || header.alg !== 'RS256' || !header.kid) return false;

  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== GITHUB_ISSUER) return false;
  if (!audienceMatches(payload.aud)) return false;
  if (!payload.exp || payload.exp <= now) return false;
  if (payload.nbf && payload.nbf > now + 30) return false;
  if (payload.repository !== EXPECTED_REPOSITORY) return false;
  if (payload.ref !== EXPECTED_REF) return false;
  if (!payload.workflow_ref?.includes(`${EXPECTED_REPOSITORY}/${EXPECTED_WORKFLOW}@${EXPECTED_REF}`)) return false;

  const keys = await getJwks();
  const jwk = keys.find(key => key.kid === header.kid);
  if (!jwk) return false;

  try {
    const key = createPublicKey({ key: jwk as any, format: 'jwk' });
    return verifySignature(
      'RSA-SHA256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      key,
      Buffer.from(parts[2], 'base64url'),
    );
  } catch {
    return false;
  }
}

export async function isSyncAuthorized(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return false;
  const token = authorization.slice('Bearer '.length).trim();
  if (!token) return false;

  const allowedSecrets = [process.env.SYNC_SECRET, process.env.CRON_SECRET].filter(Boolean);
  if (allowedSecrets.some(secret => token === secret)) return true;

  if (token.split('.').length === 3) {
    try {
      return await verifyGithubOidc(token);
    } catch (error) {
      console.warn('[sync-auth] GitHub OIDC indisponível', error instanceof Error ? error.message : error);
    }
  }
  return false;
}
