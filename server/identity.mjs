import {verifyAccessJwt} from './access.mjs';

async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
}

// Deployed Cloudflare hosting sets ACCESS_TEAM_DOMAIN + ACCESS_AUD, which
// makes a verified Cloudflare Access identity mandatory: nothing else may
// resolve an identity in that mode, so a forged or missing Access token
// fails closed instead of falling back to a browser-supplied header.
// ChatGPT Sites and local dev leave those vars unset, preserving the prior
// ChatGPT-header / device-UUID behavior for that separate deployment.
async function resolveAccessIdentity(headers, env) {
  const teamDomain = env.ACCESS_TEAM_DOMAIN, audience = env.ACCESS_AUD;
  const token = headers.get('cf-access-jwt-assertion');
  if (!token) return null;
  let claims;
  try { claims = await verifyAccessJwt(token, {teamDomain, audience}); }
  catch { return null; }
  const sub = typeof claims.sub === 'string' ? claims.sub.trim() : '';
  const email = typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';
  if (sub) return {key: 'access:' + sub, source: 'access', label: email || null};
  if (email) return {key: 'access:email:' + await sha256Hex('fallen-keep:access-email:' + email), source: 'access', label: email};
  return null;
}

async function resolveLegacyIdentity(headers) {
  const email = headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  if (email) return {key: 'email:' + await sha256Hex('fallen-keep:workspace-email:' + email), source: 'chatgpt', label: null};
  const authenticated = headers.get('oai-authenticated-user-id')?.trim();
  if (authenticated) return {key: authenticated, source: 'chatgpt', label: null};
  const device = headers.get('x-fallen-keep-player')?.trim().toLowerCase();
  if (device && /^[a-f0-9-]{36}$/.test(device)) return {key: 'device:' + device, source: 'device', label: null};
  return null;
}

export async function resolveIdentity(headers, env) {
  const accessRequired = !!(env?.ACCESS_TEAM_DOMAIN && env?.ACCESS_AUD);
  if (accessRequired) return resolveAccessIdentity(headers, env);
  return resolveLegacyIdentity(headers);
}

export async function accountKey(headers, env) {
  const identity = await resolveIdentity(headers, env);
  return identity ? identity.key : null;
}
