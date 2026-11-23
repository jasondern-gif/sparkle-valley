const CACHE='sparkle-valley-v19';
const FILES=['./','index.html','core.js','draw.js','assets/assetManager.js','quests.js','ch2data.js','ch2logic.js','ch2world.js','ch2ui.js','ch2draw.js','ch2draw2.js','assets/wrappers.js','hooks.js','lands.js','ch3.js','village.js','forest.js','lagoon.js','meadow.js','candy.js','mountain.js','garden.js','island.js','orchard.js','carnival.js','villageplay.js','friendstories.js','festival.js','questbook.js','glue.js','game.js','holdmove.js','manifest.json','icon-180.png','icon-512.png','audio/manifest.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(FILES);
  // every image listed in the art manifest (a missing image only means that object keeps its drawn art)
  try{
    await c.add('assets/manifest.json');
    const m=await (await c.match('assets/manifest.json')).json();
    await Promise.all(Object.entries(m.assets||{}).map(async([id,a])=>{
      try{await c.add('assets/'+a.src);}catch(e){console.warn(`[assets] could not cache "${id}"; using procedural art when offline.`);}
    }));
  }catch(e){console.warn('[assets] could not cache the art manifest; using procedural art when offline.');}
  // also save every voice recording so the game talks even without internet
  try{const m=await (await fetch('audio/manifest.json')).json();await c.addAll(Object.values(m).map(f=>'audio/'+f));}catch(e){}
}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});

