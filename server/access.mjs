// Verifies Cloudflare Access JWTs carried in the Cf-Access-Jwt-Assertion
// header. Access sits in front of this Worker and rejects unauthenticated
// requests before they ever arrive, but the Worker independently verifies
// the token's signature, audience and issuer so identity is never taken on
// header trust alone (defense in depth if Access is ever misconfigured).
const jwksCache = new Map();
const JWKS_TTL_MS = 3600000;

function base64UrlDecode(input) {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getSigningKeys(teamDomain) {
  const cached = jwksCache.get(teamDomain);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < JWKS_TTL_MS) return cached.keys;
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error('Unable to fetch Access signing keys');
  const jwks = await response.json();
  if (!Array.isArray(jwks?.keys)) throw new Error('Malformed Access signing keys');
  jwksCache.set(teamDomain, {keys: jwks.keys, fetchedAt: now});
  return jwks.keys;
}

export async function verifyAccessJwt(token, {teamDomain, audience}) {
  if (typeof token !== 'string' || !token) throw new Error('Missing Access token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed Access token');
  const [headerB64, payloadB64, signatureB64] = parts;
  const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
  if (header.alg !== 'RS256') throw new Error('Unexpected Access token algorithm');
  const keys = await getSigningKeys(teamDomain);
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown Access signing key');
  const cryptoKey = await crypto.subtle.importKey(
    'jwk', jwk, {name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, false, ['verify']
  );
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData);
  if (!valid) throw new Error('Invalid Access token signature');
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) throw new Error('Access token expired');
  if (typeof payload.nbf === 'number' && payload.nbf > now) throw new Error('Access token not yet valid');
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) throw new Error('Unexpected Access token audience');
  if (payload.iss !== `https://${teamDomain}`) throw new Error('Unexpected Access token issuer');
  return payload;
}
