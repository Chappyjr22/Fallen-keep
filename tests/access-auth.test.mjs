import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync, readdirSync} from 'node:fs';
import {handleApi} from '../server/api.mjs';
import {resolveIdentity} from '../server/identity.mjs';

const AUD = 'test-audience-tag';

// access.mjs caches JWKS per team domain for its process lifetime, so each
// test uses its own unique domain to stay isolated from other tests' keys.
const jwksRegistry = new Map();
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, ...rest) => {
  const match = String(url).match(/^https:\/\/([^/]+)\/cdn-cgi\/access\/certs$/);
  if (match && jwksRegistry.has(match[1])) return Response.json({keys: jwksRegistry.get(match[1])});
  return realFetch(url, ...rest);
};

function newTeamDomain() { return `team-${crypto.randomUUID()}.cloudflareaccess.test`; }

function base64UrlEncode(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function jsonToB64Url(obj) {
  return base64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));
}

async function makeKeyPair(kid) {
  const {publicKey, privateKey} = await crypto.subtle.generateKey(
    {name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'},
    true, ['sign', 'verify']
  );
  const jwk = await crypto.subtle.exportKey('jwk', publicKey);
  jwk.kid = kid;
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  return {privateKey, jwk};
}

async function signJwt(privateKey, kid, payload) {
  const header = {alg: 'RS256', kid, typ: 'JWT'};
  const headerB64 = jsonToB64Url(header), payloadB64 = jsonToB64Url(payload);
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, signedData);
  return `${headerB64}.${payloadB64}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function accessClaims(teamDomain, sub, email, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  return {sub, email, aud: AUD, iss: `https://${teamDomain}`, iat: now, nbf: now - 5, exp: now + 3600, ...overrides};
}

// Sets up a fresh Access-protected environment (own D1 + own team domain,
// so its JWKS never collides with another test's cached keys).
async function setupAccess() {
  const sqlite = new DatabaseSync(':memory:');
  for (const name of readdirSync(new URL('../drizzle/', import.meta.url)).filter(n => n.endsWith('.sql')).sort())
    sqlite.exec(readFileSync(new URL('../drizzle/' + name, import.meta.url), 'utf8'));
  const db = {
    prepare(sql) {
      return {bind(...args) {
        return {
          async first() { return sqlite.prepare(sql).get(...args) || null; },
          async run() { return sqlite.prepare(sql).run(...args); },
          async all() { return {results: sqlite.prepare(sql).all(...args)}; },
          sql, args
        };
      }};
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = statements.map(s => sqlite.prepare(s.sql).run(...s.args)); sqlite.exec('COMMIT'); return results; }
      catch (e) { sqlite.exec('ROLLBACK'); throw e; }
    }
  };
  const teamDomain = newTeamDomain();
  const {privateKey, jwk} = await makeKeyPair('kid-' + crypto.randomUUID());
  jwksRegistry.set(teamDomain, [jwk]);
  const env = {DB: db, ACCESS_TEAM_DOMAIN: teamDomain, ACCESS_AUD: AUD};
  const sign = (sub, email, overrides) => signJwt(privateKey, jwk.kid, accessClaims(teamDomain, sub, email, overrides));
  const call = async (path, body, headers = {}) => {
    const r = await handleApi(new Request('https://game.test/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: {'Content-Type': 'application/json', ...headers},
      ...(body ? {body: JSON.stringify(body)} : {})
    }), env);
    return {status: r.status, data: await r.json()};
  };
  return {sqlite, db, call, sign, teamDomain, privateKey, jwk};
}

test('unauthenticated production request is rejected', async () => {
  const {call} = await setupAccess();
  const r = await call('profile');
  assert.equal(r.status, 401);
});

test('valid Access identity is accepted and profile is created under an access: key', async () => {
  const {sqlite, call, sign} = await setupAccess();
  const jwt = await sign('user-sub-abc', 'jacob@example.com');
  const r = await call('profile', undefined, {'cf-access-jwt-assertion': jwt});
  assert.equal(r.status, 200);
  assert.equal(r.data.identityEmail, 'jacob@example.com');
  const row = sqlite.prepare('SELECT user_id FROM profiles').get();
  assert.equal(row.user_id, 'access:user-sub-abc');
});

test('forged or invalid Access JWTs are rejected', async () => {
  const {call, sign, teamDomain} = await setupAccess();
  const {privateKey: attackerKey} = await makeKeyPair('kid-attacker');

  // Signed with a key that never appears in the trusted JWKS.
  const forged = await signJwt(attackerKey, 'kid-attacker', accessClaims(teamDomain, 'someone', 'attacker@example.com'));
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': forged})).status, 401);

  // Correct key id, but signature belongs to a different payload (tampered claims).
  const valid = await sign('victim', 'victim@example.com');
  const [h, , s] = valid.split('.');
  const tamperedPayload = jsonToB64Url(accessClaims(teamDomain, 'attacker-elevated', 'attacker@example.com'));
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': `${h}.${tamperedPayload}.${s}`})).status, 401);

  // Wrong audience.
  const wrongAud = await sign('user-x', 'x@example.com', {aud: 'not-us'});
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': wrongAud})).status, 401);

  // Wrong issuer (different team domain claimed inside an otherwise validly-signed token).
  const wrongIss = await sign('user-w', 'w@example.com', {iss: 'https://someone-elses-team.cloudflareaccess.test'});
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': wrongIss})).status, 401);

  // Expired token.
  const now = Math.floor(Date.now() / 1000);
  const expired = await sign('user-y', 'y@example.com', {exp: now - 10});
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': expired})).status, 401);

  // Malformed token entirely.
  assert.equal((await call('profile', undefined, {'cf-access-jwt-assertion': 'not-a-jwt'})).status, 401);
});

test('authenticated Access identity overrides any supplied device UUID', async () => {
  const {sqlite, call, sign} = await setupAccess();
  const jwt = await sign('device-override-sub', 'owner@example.com');
  const r = await call('profile', undefined, {
    'cf-access-jwt-assertion': jwt,
    'x-fallen-keep-player': 'ffffffff-ffff-ffff-ffff-ffffffffffff'
  });
  assert.equal(r.status, 200);
  const rows = sqlite.prepare('SELECT user_id FROM profiles').all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].user_id, 'access:device-override-sub');
  assert(!rows.some(row => row.user_id.startsWith('device:')));
});

test('the same authenticated identity sees the same profile from multiple simulated devices', async () => {
  const {call, sign} = await setupAccess();
  const jwtDeviceA = await sign('multi-device-sub', 'multi@example.com');
  const jwtDeviceB = await sign('multi-device-sub', 'multi@example.com', {iat: Math.floor(Date.now() / 1000) + 1});
  const runId = crypto.randomUUID();
  const started = await call('run/start', {runId}, {'cf-access-jwt-assertion': jwtDeviceA, 'user-agent': 'DeviceA'});
  assert.equal(started.status, 200);
  const saved = await call('run/checkpoint', {runId, gold: 60, elapsed: 5, kills: 3, finished: true}, {'cf-access-jwt-assertion': jwtDeviceA, 'user-agent': 'DeviceA'});
  assert.equal(saved.status, 200);
  const fromDeviceB = await call('profile', undefined, {'cf-access-jwt-assertion': jwtDeviceB, 'user-agent': 'DeviceB'});
  assert.equal(fromDeviceB.status, 200);
  assert.equal(fromDeviceB.data.coins, 60);
});

test('two different authenticated identities get separate profiles', async () => {
  const {call, sign} = await setupAccess();
  const jwtAlice = await sign('alice-sub', 'alice@example.com');
  const jwtBob = await sign('bob-sub', 'bob@example.com');
  const runId = crypto.randomUUID();
  assert.equal((await call('run/start', {runId}, {'cf-access-jwt-assertion': jwtAlice})).status, 200);
  assert.equal((await call('run/checkpoint', {runId, gold: 75, elapsed: 5, kills: 1, finished: true}, {'cf-access-jwt-assertion': jwtAlice})).status, 200);
  const alice = await call('profile', undefined, {'cf-access-jwt-assertion': jwtAlice});
  const bob = await call('profile', undefined, {'cf-access-jwt-assertion': jwtBob});
  assert.equal(alice.data.coins, 75);
  assert.equal(bob.data.coins, 0);
});

test('legacy ChatGPT identity path still works when Access is not configured', async () => {
  const {db} = await setupAccess();
  const legacyEnv = {DB: db};
  const call = async (path, body, headers = {}) => {
    const r = await handleApi(new Request('https://game.test/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: {'Content-Type': 'application/json', ...headers},
      ...(body ? {body: JSON.stringify(body)} : {})
    }), legacyEnv);
    return {status: r.status, data: await r.json()};
  };
  const r1 = await call('profile', undefined, {'oai-authenticated-user-email': 'legacy@example.com'});
  assert.equal(r1.status, 200);
  assert.equal(r1.data.identityEmail, undefined);
  const identity = await resolveIdentity(new Headers({'oai-authenticated-user-email': 'legacy@example.com'}), legacyEnv);
  assert.match(identity.key, /^email:[0-9a-f]{64}$/);
});

test('device UUID fallback is unreachable once Access is configured, even without a JWT', async () => {
  const {call} = await setupAccess();
  const r = await call('profile', undefined, {'x-fallen-keep-player': '12345678-1234-1234-1234-123456789012'});
  assert.equal(r.status, 401);
});
