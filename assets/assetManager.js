'use strict';
// ---------- Image assets: optional sprite art with a procedural fallback ----------
// The game never waits for images. Until an asset is loaded (or if it is missing/broken),
// Assets.has(id) is false and every wrapper keeps using the original procedural drawing.
// Add ?assets=off to the URL to force the procedural art (for side-by-side comparison).
// Manifest format: see ASSET_HANDOFF.md.
const Assets=(()=>{
  const ORIGINS={'top-left':[0,0],'bottom-center':[.5,1]};
  const entries=new Map();const warned=new Set();
  let enabled=true,manifestState='idle',manifestUrl=null,loading=null;
  try{const q=new URLSearchParams(location.search).get('assets');if(q==='off'||q==='0'||q==='false')enabled=false;}catch(e){}

  function warnOnce(key,msg){if(warned.has(key))return;warned.add(key);try{console.warn('[assets] '+msg);}catch(e){}}
  const isPair=v=>Array.isArray(v)&&v.length===2&&v.every(n=>typeof n==='number'&&isFinite(n)&&n>0);

  // Validate one manifest entry; returns a normalized record or null.
  function normalize(id,d,tilePx){
    if(!d||typeof d!=='object'){warnOnce(id,`"${id}": entry is not an object; using procedural art.`);return null;}
    if(typeof d.src!=='string'||!d.src){warnOnce(id,`"${id}": missing "src"; using procedural art.`);return null;}
    if(!isPair(d.size)){warnOnce(id,`"${id}": "size" must be [width,height] in image pixels; using procedural art.`);return null;}
    if(!isPair(d.world)){warnOnce(id,`"${id}": "world" must be [width,height] in tiles; using procedural art.`);return null;}
    const frame=d.frameSize==null?d.size:d.frameSize;
    if(!isPair(frame)||d.size[0]%frame[0]||d.size[1]%frame[1]){warnOnce(id,`"${id}": "frameSize" must evenly divide "size"; using procedural art.`);return null;}
    let origin=d.origin==null?'bottom-center':d.origin;
    if(!ORIGINS[origin]){warnOnce(id+':origin',`"${id}": unknown origin "${origin}", using "bottom-center".`);origin='bottom-center';}
    const cols=d.size[0]/frame[0],rows=d.size[1]/frame[1],count=cols*rows,anims={};
    if(d.animations&&typeof d.animations==='object')for(const k in d.animations){const a=d.animations[k];
      const fr=a&&Array.isArray(a.frames)?a.frames.filter(n=>Number.isInteger(n)&&n>=0&&n<count):[];
      if(!fr.length){warnOnce(id+':'+k,`"${id}": animation "${k}" has no valid frames; ignored.`);continue;}
      anims[k]={frames:fr,fps:typeof a.fps==='number'&&a.fps>0?a.fps:0,loop:a.loop!==false};}
    if(tilePx&&(Math.abs(d.world[0]*tilePx-frame[0])>.5||Math.abs(d.world[1]*tilePx-frame[1])>.5))
      warnOnce(id+':scale',`"${id}": frameSize ${frame.join('x')} is not world ${d.world.join('x')} x ${tilePx}px per tile (it will still be drawn at world size).`);
    return{id,src:d.src,size:d.size,frame,world:d.world,origin:ORIGINS[origin],pixelArt:d.pixelArt!==false,cols,count,anims,img:null,status:'loading'};
  }

  function loadImage(e,base){return new Promise(res=>{
    const img=new Image();let done=false;
    const fail=msg=>{if(done)return;done=true;e.status='failed';warnOnce(e.id,`"${e.id}": ${msg}; using procedural art.`);res(false);};
    img.onload=()=>{if(done)return;
      if(img.naturalWidth!==e.size[0]||img.naturalHeight!==e.size[1])return fail(`image is ${img.naturalWidth}x${img.naturalHeight}, manifest says ${e.size.join('x')}`);
      done=true;e.img=img;e.status='ready';res(true);};
    img.onerror=()=>fail(`could not load image "${e.src}"`);
    try{img.decoding='async';img.src=new URL(e.src,base).href;}catch(err){fail('bad image path "'+e.src+'"');}
  });}

  // Resolves (never rejects) after the manifest and its images settle, or after timeoutMs, whichever is first.
  // Images that finish after the timeout still become available when they arrive.
  function loadManifest(url,opts){
    const timeoutMs=(opts&&opts.timeoutMs)||6000;manifestUrl=url;
    if(!enabled){manifestState='off';return Promise.resolve(status());}
    if(loading)return loading;
    manifestState='loading';
    const work=(async()=>{
      let base,m;
      try{base=new URL(url,location.href);
        const r=await fetch(base.href,{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);m=await r.json();}
      catch(err){manifestState='failed';warnOnce('manifest',`could not load manifest "${url}" (${err&&err.message||err}); using procedural art.`);return;}
      if(!m||!m.assets||typeof m.assets!=='object'){manifestState='failed';warnOnce('manifest',`manifest "${url}" has no "assets" object; using procedural art.`);return;}
      const tilePx=typeof m.tilePx==='number'&&m.tilePx>0?m.tilePx:0,jobs=[];
      for(const id in m.assets){const e=normalize(id,m.assets[id],tilePx);if(!e)continue;entries.set(id,e);jobs.push(loadImage(e,base));}
      manifestState='loaded';
      await Promise.all(jobs);
    })().catch(err=>{manifestState='failed';warnOnce('manifest','asset loading failed ('+(err&&err.message||err)+'); using procedural art.');});
    loading=Promise.race([work,new Promise(r=>setTimeout(r,timeoutMs))]).then(status);
    return loading;
  }

  function lookup(id){
    if(!enabled)return null;const e=entries.get(id);
    if(e)return e.status==='ready'?e:null;
    if(manifestState==='loaded'||manifestState==='failed')warnOnce(id,`no asset "${id}" in the manifest; using procedural art.`);
    return null;
  }
  const has=id=>!!lookup(id);
  function hasAnim(id,anim){const e=lookup(id);if(!e)return false;if(e.anims[anim])return true;
    warnOnce(id+':'+anim,`"${id}" has no animation "${anim}"; using procedural art for it.`);return false;}
  function get(id){const e=lookup(id);return e?{id:e.id,img:e.img,size:e.size.slice(),frameSize:e.frame.slice(),world:e.world.slice(),
    origin:e.origin.slice(),pixelArt:e.pixelArt,frames:e.count,animations:Object.keys(e.anims)}:null;}
  // Frame index of an animation at timeMs. anim defaults to "idle", then the first animation, then frame 0.
  function getAnimFrame(id,timeMs,anim){const e=lookup(id);if(!e)return 0;
    const a=e.anims[anim||'idle']||(!anim&&e.anims[Object.keys(e.anims)[0]]);if(!a)return 0;
    if(!a.fps||a.frames.length===1)return a.frames[0];
    const n=Math.floor(Math.max(0,timeMs||0)/1000*a.fps);return a.frames[a.loop?n%a.frames.length:Math.min(n,a.frames.length-1)];}
  function status(){const ready=[],failed=[],pending=[];
    for(const e of entries.values())(e.status==='ready'?ready:e.status==='failed'?failed:pending).push(e.id);
    return{enabled,manifest:manifestState,ready,failed,pending};}
  function setEnabled(on){enabled=!!on;if(enabled&&manifestState==='off'){manifestState='idle';if(manifestUrl)loadManifest(manifestUrl);}}
  return{loadManifest,has,hasAnim,get,getAnimFrame,status,setEnabled,get enabled(){return enabled;},_warnOnce:warnOnce,_lookup:lookup};
})();

// Draws an image asset at screen position (x,y) (css px, current ctx transform), honouring the manifest origin.
// Size comes from the manifest "world" size in tiles x ts, so art always matches the existing grid.
// opts: {anim, timeMs, frame, flipX, scale, alpha}. Returns true if something was drawn. Never throws.
// Pixel-art assets turn image smoothing off only for this draw (save/restore), so procedural art is unaffected.
// (Named drawAssetSprite because draw.js already has drawSprite for cached procedural canvases.)
function drawAssetSprite(id,x,y,opts){
  const e=Assets._lookup(id);if(!e)return false;opts=opts||{};
  const f=opts.frame!=null?opts.frame:Assets.getAnimFrame(id,opts.timeMs!=null?opts.timeMs:performance.now(),opts.anim);
  const fw=e.frame[0],fh=e.frame[1],sx=(f%e.cols)*fw,sy=Math.floor(f/e.cols)*fh;
  const k=opts.scale||1,w=e.world[0]*ts*k,h=e.world[1]*ts*k;
  ctx.save();
  try{if(e.pixelArt)ctx.imageSmoothingEnabled=false;
    if(opts.alpha!=null)ctx.globalAlpha*=opts.alpha;
    ctx.translate(x,y);if(opts.flipX)ctx.scale(-1,1);
    ctx.drawImage(e.img,sx,sy,fw,fh,-e.origin[0]*w,-e.origin[1]*h,w,h);
    return true;}
  catch(err){Assets._warnOnce(id+':draw',`"${id}" failed to draw (${err&&err.message||err}).`);return false;}
  finally{ctx.restore();}
}

Assets.ready=Assets.loadManifest('assets/manifest.json');
