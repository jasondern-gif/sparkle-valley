const CACHE='sparkle-valley-v6';
const FILES=['./','index.html','core.js','draw.js','quests.js','ch2data.js','ch2logic.js','ch2world.js','ch2ui.js','ch2draw.js','ch2draw2.js','hooks.js','ch3.js','village.js','game.js','manifest.json','icon-180.png','icon-512.png','audio/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(FILES);
  // also save every voice recording so the game talks even without internet
  try{const m=await (await fetch('audio/manifest.json')).json();await c.addAll(Object.values(m).map(f=>'audio/'+f));}catch(e){}
}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});

