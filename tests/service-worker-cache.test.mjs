import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function loadServiceWorker() {
  const src = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const listeners = {};
  const self = {
    addEventListener: (type, fn) => { listeners[type] = fn; },
    location: {origin: 'https://fallen-keep.jacobchapman3.workers.dev'},
    skipWaiting: () => {},
    clients: {claim: () => {}}
  };
  const fakeCache = {addAll: async () => {}, put: async () => {}, match: async () => undefined};
  const caches = {
    open: async () => fakeCache,
    keys: async () => [],
    delete: async () => {},
    match: async () => undefined
  };
  const context = {self, caches, URL, Response, console, fetch: async () => new Response('ok')};
  vm.createContext(context);
  vm.runInContext(src, context);
  return {listeners};
}

function dispatchFetch(listeners, path, mode = 'same-origin') {
  let intercepted = false;
  listeners.fetch({
    request: {method: 'GET', url: 'https://fallen-keep.jacobchapman3.workers.dev' + path, mode},
    respondWith: () => { intercepted = true; }
  });
  return intercepted;
}

test('service worker never intercepts /api/* requests', () => {
  const {listeners} = loadServiceWorker();
  for (const path of ['/api/profile', '/api/run/start', '/api/run/checkpoint', '/api/purchase', '/api/coop/create'])
    assert.equal(dispatchFetch(listeners, path), false, path);
});

test('service worker never intercepts Cloudflare Access control paths', () => {
  const {listeners} = loadServiceWorker();
  for (const path of ['/cdn-cgi/access/logout', '/cdn-cgi/access/login', '/cdn-cgi/access/certs'])
    assert.equal(dispatchFetch(listeners, path), false, path);
});

test('service worker intercepts static assets and navigations', () => {
  const {listeners} = loadServiceWorker();
  assert.equal(dispatchFetch(listeners, '/style.css'), true);
  assert.equal(dispatchFetch(listeners, '/game.js'), true);
  assert.equal(dispatchFetch(listeners, '/icons/icon-192.png'), true);
  assert.equal(dispatchFetch(listeners, '/', 'navigate'), true);
});

test('only navigations to the app shell rewrite the cached /index.html entry', async () => {
  const src = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const listeners = {};
  const puts = [];
  const self = {addEventListener: (type, fn) => { listeners[type] = fn; }, location: {origin: 'https://fallen-keep.jacobchapman3.workers.dev'}, skipWaiting: () => {}, clients: {claim: () => {}}};
  const fakeCache = {addAll: async () => {}, put: async (key) => { puts.push(typeof key === 'string' ? key : key.url); }, match: async () => undefined};
  const caches = {open: async () => fakeCache, keys: async () => [], delete: async () => {}, match: async () => undefined};
  const context = {self, caches, URL, Response, console, fetch: async () => new Response('<html>ok</html>', {status: 200})};
  vm.createContext(context);
  vm.runInContext(src, context);

  let shellPromise;
  listeners.fetch({request: {method: 'GET', url: 'https://fallen-keep.jacobchapman3.workers.dev/', mode: 'navigate'}, respondWith: p => { shellPromise = p; }});
  await shellPromise;

  let cdnIntercepted = false;
  listeners.fetch({request: {method: 'GET', url: 'https://fallen-keep.jacobchapman3.workers.dev/cdn-cgi/access/logout', mode: 'navigate'}, respondWith: () => { cdnIntercepted = true; }});
  assert.equal(cdnIntercepted, false);

  assert.deepEqual(puts, ['/index.html']);
});
