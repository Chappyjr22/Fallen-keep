const CACHE='fallen-keep-pwa-v6';
const CORE=[
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/style.css',
  '/mobile.css',
  '/game-menu.css',
  '/character-progression.css',
  '/game-ui.css',
  '/game.js',
  '/map-encounters-runtime.mjs',
  '/mimic-event.mjs',
  '/courtyard-events.mjs',
  '/courtyard-runtime.mjs',
  '/assets/phaser.min.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  // Cloudflare Access owns /api/* auth enforcement and /cdn-cgi/access/*
  // (login, logout, cert) redirects; neither may be cached or intercepted,
  // since caching a logout/login response under the app-shell key would
  // surface stale or cross-account UI on the next offline load.
  if(url.pathname.startsWith('/api/')||url.pathname.startsWith('/cdn-cgi/'))return;

  if(request.mode==='navigate'){
    const isAppShell=url.pathname==='/'||url.pathname==='/index.html';
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(isAppShell&&response.ok){const cache=await caches.open(CACHE);cache.put('/index.html',response.clone());}
        return response;
      }catch{
        if(!isAppShell)throw new Error('offline');
        return (await caches.match('/index.html')) || (await caches.match('/'));
      }
    })());
    return;
  }

  if(/\.(?:png|jpe?g|gif|webp|svg|ogg|mp3|wav|woff2?)$/i.test(url.pathname)){
    event.respondWith((async()=>{
      const cached=await caches.match(request);
      if(cached)return cached;
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}
      return response;
    })());
    return;
  }

  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone());}
      return response;
    }catch{
      const cached=await caches.match(request);
      if(cached)return cached;
      throw new Error('offline');
    }
  })());
});
