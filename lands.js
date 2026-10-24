'use strict';
// ---------- Far lands by Rainbow Balloon (wave 2): shared code for the Fairy Forest, Mermaid Lagoon and Moonlight Meadow ----------
// - Area details for the balloon (names, pads, unlock rules), the balloon destination picker and the flight between any two places
// - LandArt: per-land drawing tables. Every new drawable object is one named function (LandArt.<land>.<object>), and game
//   logic only ever calls it through the table, so each object can later be swapped for sprite art one at a time:
//     const prev=LandArt.forest.fairyHouse; LandArt.forest.fairyHouse=function(...a){ if(Assets.has('fairy_house')) ...; else prev(...a); };
// - LG: mini-game engines shared by the land chapters (world tap fields, picture picks, staged builders, screen games)
//   and chapter helpers (guiding arrow to the right place, cottages for new ponies, moving old saves into new chapters).
const LandArt={shared:{},forest:{},lagoon:{},meadow:{}};
const LG=(()=>{
const R=reg,A=LandArt.shared;
const art=key=>{const[a,b]=key.split('.');return LandArt[a][b];};

// ===== Area details =====
Object.assign(AREAS.valley,{name:R('narrator','Sparkle Valley'),icon:'🏡',unlocked:()=>true,sky:['#7cc8ff','#d6f0ff'],
  go:R('narrator','Home we go! Back to Sparkle Valley!')});
Object.assign(AREAS.clouds,{name:R('narrator','Cloud Kingdom'),icon:'🏰',unlocked:()=>state.balloon>=3,sky:['#b8a6ff','#ffe1f2'],go:N2.up});
const LANDS=['forest','lagoon','meadow'];
const SAY={
  where:R('narrator','Where should we fly? Tap a picture!'),
  stop:R('narrator','Okay! We can play again later.'),
  wrong:[R('narrator','Hee hee! Not that one. Try again!'),R('narrator','Oopsy! Try another one!')],
  right:[R('narrator','Yes! That is the one!'),R('narrator','You got it!')],
  pickMe:R('narrator','Tap the one you like!'),
  next:R('narrator','Tap the check mark when you are ready!'),
  woodGift:R('narrator','You got 9 pieces of magic wood! Now you can build cottages in Pony Village.'),
};
// which place each quest needs (for the arrow and the glowing picker card)
const NEED={fly:'clouds',flyHome:'valley',c3fly:'clouds',c3flyHome:'valley'};
function dests(){return Object.keys(AREAS).filter(k=>AREAS[k].unlocked&&AREAS[k].unlocked());}
function padTarget(a){const p=PADS[a||hereArea()]||PADS.valley;return{x:p.x,y:p.y-1.6};}
// The arrow for "go to place a": the balloon if she's somewhere else, otherwise null.
function goArea(a){if(hereArea()===a)return null;return padTarget(hereArea());}

// ===== Balloon destination picker =====
document.head.insertAdjacentHTML('beforeend',`<style>
.lgCard{position:relative;cursor:pointer;min-height:150px;justify-content:center;}
.lgCard .e{font-size:70px;}
.lgCard.want{border-color:#ffb800;background:#fff3c4;box-shadow:0 0 18px #ffd34d;animation:pulse 1.1s ease-in-out infinite;}
.lgCard.want::before{content:'⬇';position:absolute;top:-34px;left:50%;margin-left:-16px;font-size:34px;animation:bob 1s ease-in-out infinite;}
#lgPick .items{margin-top:36px;}
#lgGame .box{width:min(860px,96vw);}
.lgCv{display:block;margin:0 auto;border-radius:22px;background:#fff6fb;border:4px solid #ffd0e8;touch-action:none;}
.lgSay{font-size:24px;font-weight:bold;text-align:center;min-height:34px;margin:8px 0 4px;display:flex;align-items:center;justify-content:center;}
.lgRecipe{display:flex;gap:10px;justify-content:center;margin:6px 0;}
.lgRecipe span{font-size:38px;width:64px;height:64px;border-radius:16px;background:#fff;border:3px solid #ffd0e8;display:flex;align-items:center;justify-content:center;}
.lgRecipe span.now{border-color:#ffb800;background:#fff3c4;transform:scale(1.12);box-shadow:0 0 12px #ffd34d;}
.lgRecipe span.ok{background:#e7ffe9;border-color:#9be3a6;opacity:.7;}
.lgOpts{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:10px;}
.lgOpts button{width:84px;height:84px;border-radius:22px;background:#fff6fb;border:4px solid #ffd0e8;font-size:46px;padding:0;display:flex;align-items:center;justify-content:center;}
.lgOpts button:active{transform:scale(.92);}
.lgOpts button.sel{border-color:#ff7eb6;background:#ffe9f5;box-shadow:0 0 0 4px #ff7eb6;}
.lgOpts button.go{background:#5fc96b;border-color:#3c9a47;color:#fff;font-size:50px;}
.lgOpts button.glow{animation:pulse 1s ease-in-out infinite;}
.lgOpts button.shake{animation:shake .4s;}
.lgOpts button.done{opacity:.3;}
.lgSw{width:66px;height:66px;border-radius:50%;border:4px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);pointer-events:none;}
.lgDots{display:flex;gap:8px;justify-content:center;margin:4px 0;}
.lgDots i{width:18px;height:18px;border-radius:50%;background:#ffe3f2;border:3px solid #ffc2e2;}
.lgDots i.on{background:#ff7eb6;border-color:#d94f9b;}
.lgCards{display:grid;gap:10px;justify-content:center;margin-top:10px;}
.lgCards button{width:110px;height:110px;border-radius:22px;font-size:56px;padding:0;border:4px solid #ffd0e8;background:linear-gradient(#ffb3d9,#ff7eb6);transition:transform .25s;}
.lgCards button.up{background:#fff;}
.lgCards button.got{background:#e7ffe9;border-color:#9be3a6;}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="lgPick" class="modal"><div class="panel box"><button class="close" id="lgPickClose">✖</button>
  <h2 data-say="${SAY.where}">🎈 Where should we fly?</h2><div class="items" id="lgPickItems"></div></div></div>
<div id="lgGame" class="modal"><div class="panel box"><button class="close" id="lgGameClose">✖</button><div id="lgGameBody"></div></div></div>`);
function openPick(opts){const want=NEED[qid()];
  $('lgPickItems').innerHTML=opts.map(k=>{const a=AREAS[k];return `<div class="item pick lgCard ${k===want?'want':''}" data-a="${k}" data-say="${a.name}"><span class="e">${a.icon}</span><span class="nm">${a.name}</span></div>`;}).join('');
  addSayButtons($('lgPick'));$('lgPick').classList.add('show');refreshBar(true);
  say(SAY.where,'narrator',$('lgPick').querySelector('h2'));
  $('lgPickItems').querySelectorAll('.lgCard').forEach(el=>el.onclick=()=>{$('lgPick').classList.remove('show');sfx('tap');startFlight(el.dataset.a);});}
$('lgPickClose').onclick=()=>{stopSpeech();$('lgPick').classList.remove('show');refreshBar(true);};
{const prev=tapBalloon;tapBalloon=function(){
  if(state.balloon<3)return prev();
  const here=hereArea(),opts=dests().filter(k=>k!==here);
  if(opts.length>1)return openPick(opts);
  if(opts.length===1)return startFlight(opts[0]);
  return prev();};}

// ===== Flights between any two places =====
const OLD=k=>k==='valley'||k==='clouds';
{const prev=startFlight;startFlight=function(to){const from=hereArea();prev(to);
  if(flight){flight.from=from;if(!OLD(from)||!OLD(to))say(AREAS[to].go,'narrator');}};}
{const prev=drawFlight;drawFlight=function(t){const f=flight;if(!f.from||(OLD(f.from)&&OLD(f.to)))return prev(t);
  A.flight(t,f.from,f.to,clamp(f.t/f.dur,0,1));};}
A.flight=function(t,from,to,p){
  const e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,s=Math.min(vw,vh)/7,F=AREAS[from],T=AREAS[to];
  const g=ctx.createLinearGradient(0,0,0,vh);g.addColorStop(0,mix(F.sky[0],T.sky[0],e));g.addColorStop(1,mix(F.sky[1],T.sky[1],e));
  ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);
  const gy=vh*.72+e*vh*1.6;if(gy<vh*1.5)(LandArt[from]&&LandArt[from].flightScene||A['scene_'+from])(gy,s,t);
  ctx.fillStyle='rgba(255,255,255,.8)';
  for(let i=0;i<10;i++){const cy=((hash(i,1)*vh*2.4+e*vh*3.2*(.6+hash(i,2)))%(vh*2.4))-vh*.7,cx=hash(i,3)*vw,r=s*(.4+hash(i,4)*.5);
    circ(cx,cy,r);ctx.fill();circ(cx+r*.9,cy+r*.15,r*.7);ctx.fill();circ(cx-r*.9,cy+r*.2,r*.6);ctx.fill();}
  const ry=vh*.48+(e-.5)*vh*2.6,Rr=vw*.42,bw=s*.22;ctx.lineWidth=bw+1;
  STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ctx.beginPath();ctx.arc(vw/2,ry+vh*.35,Rr-i*bw,Math.PI,Math.PI*2);ctx.stroke();});
  const iy=vh*.86+(1-e)*vh*1.7;if(iy<vh*1.4)(LandArt[to]&&LandArt[to].flightScene||A['scene_'+to])(iy,s,t);
  drawBalloonAt(vw/2,vh*.62+Math.sin(t*2)*s*.08,s*1.1,3,t,true);
  for(let i=0;i<8;i++){const a=(t*.6+i*.13)%1;drawStar(vw/2+Math.sin(i*2.4)*s*1.4,vh*.6+(a-.3)*vh*.8,s*.07,STARS[i%7].c,true);}
};
A.scene_valley=function(gy,s,t){ctx.fillStyle='#8fd16a';ell(vw*.25,gy+vh*.1,vw*.45,vh*.22);ctx.fill();ctx.fillStyle='#7cc35a';ell(vw*.8,gy+vh*.15,vw*.5,vh*.25);ctx.fill();
  drawEmoji('🏡',vw*.3,gy-s*.1,s*.9);drawEmoji('🌳',vw*.15,gy+s*.1,s*.8);drawEmoji('🌳',vw*.72,gy+s*.2,s*.8);drawEmoji('🐴',vw*.55,gy+s*.3,s*.5);};
A.scene_clouds=function(iy,s,t){ctx.fillStyle='#fdfbff';ell(vw/2,iy+vh*.12,vw*.6,vh*.2);ctx.fill();for(let i=-4;i<=4;i++){circ(vw/2+i*vw*.13,iy,s*(.6+hash(i,5)*.3));ctx.fill();}
  drawEmoji('🏰',vw*.68,iy-s*.6,s*1.5);};

// ===== Land trees, ground details and the player's look in each land =====
{const prev=drawTree;drawTree=function(x,y){if(y>=48&&x<45){const f=LandArt[areaAt(x,y)].tree;if(f)return f(x,y);}return prev(x,y);};}
// Sparkle Valley's big rainbow belongs to the valley sky; the far lands have their own skies
{const prev=drawRainbow;drawRainbow=function(){const a=hereArea();if(LANDS.includes(a)){drawAmbient();return;}return prev();};}
const grassDeco=(x,y,c,s,cl,r)=>{const f=LandArt[cl===3?'forest':cl===6?'meadow':'lagoon'].grassDeco;if(f)f(x,y,c,s,r);};

// ===== Mini-game engines =====
// Only one LG mini-game runs at a time. mode 'story' belongs to a quest; mode 'play' is a replay game from the pony menu.
let game=null;
function stop(quiet){if(!game)return;const g=game;game=null;if(g.type!=='field')closeScreen(true);if(!quiet&&g.mode==='play')say(SAY.stop,'narrator');refreshBar(true);}
const active=()=>game;

// --- Tap field (in the world): tap things to pop them. cfg: {id,mode,items:[{x,y,...}],art:'land.object',r,hy,move(it,dt,t),onPop(it,left),onDone(),hint}
function field(cfg){stop(true);closePonyMenu();
  game=Object.assign({type:'field',r:.95,hy:.45},cfg,{items:cfg.items.map((o,i)=>Object.assign({st:'on',t0:0,ph:hash(i,77)*6,i},o))});
  refreshBar(true);return game;}
function fieldLeft(){return game&&game.type==='field'?game.items.filter(it=>it.st==='on').length:0;}
function popItem(it){const g=game;it.st='pop';it.t0=state.time;const left=g.items.filter(o=>o.st==='on').length;
  if(g.onPop)g.onPop(it,left);
  if(!left&&game===g){g.done=true;setTimeout(()=>{if(game===g){game=null;refreshBar(true);}if(g.onDone)g.onDone();},g.doneDelay||900);}}
// spots around the player, inside her current area, that she can walk to
function spotsNear(n,minD,maxD,okFn){const ar=hereArea(),px=Math.floor(player.x),py=Math.floor(player.y),out=[],vil=inVillage(player.x,player.y);
  const P=vil?[VILLAGE.x0+.5,VILLAGE.y0+.5,VILLAGE.x1+.5,VILLAGE.y1+.5]:AREAS[ar].play;
  for(let y=py-4;y<=py+4;y++)for(let x=px-7;x<=px+7;x++){if(!walkable(x,y)||areaAt(x,y)!==ar||inVillage(x,y)!==vil)continue;
    if(x+.5<P[0]||x+.5>P[2]||y+.5<P[1]||y+.5>P[3]||state.plots[x+','+y]||map[y][x]==='S')continue;if(okFn&&!okFn(x,y))continue;
    const d=dist(x+.5,y+.5,player.x,player.y);if(d<minD||d>maxD)continue;const sx=(x+.5)*ts-cam.x,sy=(y+.5)*ts-cam.y;if(sx<70||sx>vw-70||sy<160||sy>vh-150)continue;out.push({x:x+.5,y:y+.6});}
  const res=[];while(res.length<n&&out.length){const j=Math.floor(Math.random()*out.length),c=out.splice(j,1)[0];if(res.every(o=>dist(o.x,o.y,c.x,c.y)>1.6))res.push(c);}
  return res;}

// --- Screen games (a canvas in a big picture window) ---
let scr=null;
function openScreen(o){// o:{title,titleSay,who,w,h,draw(g,w,h,t),tap(x,y),move(x,y,down),html,onClose}
  closePonyMenu();player.path=[];player.action=null;scr=Object.assign({t0:performance.now()},o);
  $('lgGameBody').innerHTML=`<h2 data-say="${o.titleSay}" data-who="${o.who||'narrator'}">${o.title}</h2>${o.w?`<canvas class="lgCv" id="lgCv"></canvas>`:''}<div class="lgSay" id="lgSay"></div>${o.html||''}`;
  addSayButtons($('lgGameBody'));$('lgGame').classList.add('show');refreshBar(true);
  if(o.w){const cv=$('lgCv'),k=Math.min(1,(Math.min(vw*.9,820))/o.w,(vh*.62)/o.h);cv.style.width=Math.round(o.w*k)+'px';cv.style.height=Math.round(o.h*k)+'px';
    cv.width=Math.round(o.w*k*dpr);cv.height=Math.round(o.h*k*dpr);scr.k=k;
    const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*o.w,(e.clientY-r.top)/r.height*o.h];};
    cv.onpointerdown=e=>{e.preventDefault();initAudio();scr&&(scr.down=true);const[x,y]=pos(e);if(scr&&scr.tap)scr.tap(x,y);if(scr&&scr.move)scr.move(x,y,true);};
    cv.onpointermove=e=>{if(!scr||!scr.move)return;const[x,y]=pos(e);scr.move(x,y,scr.down);};
    cv.onpointerup=cv.onpointercancel=()=>{if(scr)scr.down=false;};
    requestAnimationFrame(screenLoop);}
  say(o.titleSay,o.who||'narrator',$('lgGameBody').querySelector('h2'));}
function screenLoop(){if(!scr||!scr.w)return;const cv=$('lgCv');if(!cv)return;const g=cv.getContext('2d'),t=(performance.now()-scr.t0)/1000;
  g.setTransform(cv.width/scr.w,0,0,cv.height/scr.h,0,0);g.clearRect(0,0,scr.w,scr.h);
  try{withCtx(g,()=>scr.draw(g,scr.w,scr.h,t));}catch(e){console.warn(e);}
  requestAnimationFrame(screenLoop);}
function screenSay(text,who){const el=$('lgSay');if(!el)return;el.textContent=text;el.dataset.say=text;el.dataset.who=who||'narrator';addSayButtons(el.parentNode);say(text,who||'narrator',el);}
function closeScreen(quiet){if(!scr)return;const o=scr;scr=null;$('lgGame').classList.remove('show');refreshBar(true);if(o.onClose)o.onClose(quiet);}
$('lgGameClose').onclick=()=>{stopSpeech();const g=game;if(g&&g.type!=='field'){game=null;}closeScreen(false);refreshBar(true);};

// --- Picture pick: tap the picture that is asked for. cfg: {mode,title,titleSay,who,steps:[{say,want}],opts:[{k,html}],recipe:bool,art:'land.object',onRight(i),onDone()}
function pickGame(cfg){stop(true);const g=game=Object.assign({type:'pick',i:0,ok:[]},cfg);
  openScreen({title:cfg.title,titleSay:cfg.titleSay,who:cfg.who,w:440,h:250,draw:(c,w,h,t)=>art(cfg.art)(w,h,t,g),
    html:`${cfg.recipe?'<div class="lgRecipe" id="lgRecipe"></div>':''}<div class="lgOpts" id="lgOpts"></div>`,onClose:()=>{if(game===g)game=null;}});
  const opts=[...cfg.opts].sort(()=>Math.random()-.5);
  $('lgOpts').innerHTML=opts.map(o=>`<button data-k="${o.k}">${o.html}</button>`).join('');
  $('lgOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>pickTap(g,b));
  pickShow(g);setTimeout(()=>{if(game===g)screenSay(g.steps[0].say,g.who);},1700);}
function pickShow(g){const r=$('lgRecipe');if(r)r.innerHTML=g.steps.map((s,i)=>`<span class="${i<g.i?'ok':i===g.i?'now':''}">${(g.opts.find(o=>o.k===s.want)||{}).html||''}</span>`).join('');}
function pickTap(g,b){if(game!==g||g.i>=g.steps.length)return;initAudio();const st=g.steps[g.i];
  if(b.dataset.k!==st.want){sfx('nope');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');screenSay(pick(SAY.wrong));return;}
  sfx('sparkle');g.ok.push(st.want);g.hit=performance.now()/1000;if(g.onRight)g.onRight(g.i);g.i++;pickShow(g);
  if(g.i>=g.steps.length){sfx('fanfare');setTimeout(()=>{if(game!==g)return;game=null;closeScreen(true);if(g.onDone)g.onDone();},2200);return;}
  setTimeout(()=>{if(game===g)screenSay(g.steps[g.i].say,g.who);},500);}

// --- Staged builder: pick a look for each part, see it change, tap ✔. cfg: {mode,title,titleSay,who,stages:[{say,opts:[{k,html,say}]}],art:'land.object',onDone(choices)}
function builder(cfg){stop(true);const g=game=Object.assign({type:'builder',si:0,ch:{},cur:null},cfg);
  openScreen({title:cfg.title,titleSay:cfg.titleSay,who:cfg.who,w:440,h:300,draw:(c,w,h,t)=>art(cfg.art)(w,h,t,g),
    html:'<div class="lgDots" id="lgDots"></div><div class="lgOpts" id="lgOpts"></div>',onClose:()=>{if(game===g)game=null;}});
  buildStage(g,true);}
function buildStage(g,first){const st=g.stages[g.si];g.cur=null;
  $('lgDots').innerHTML=g.stages.map((s,i)=>`<i class="${i<=g.si?'on':''}"></i>`).join('');
  $('lgOpts').innerHTML=st.opts.map(o=>`<button data-k="${o.k}">${o.html}</button>`).join('');
  $('lgOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(game!==g)return;initAudio();const o=st.opts.find(x=>x.k===b.dataset.k);g.cur=o.k;g.ch[st.id]=o.k;g.pop=performance.now()/1000;
    sfx('pop');$('lgOpts').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b));say(o.say,'narrator');addGo(g);});
  setTimeout(()=>{if(game===g)screenSay(st.say,g.who);},first?1700:300);}
function addGo(g){if($('lgOpts').querySelector('.go'))return;const b=document.createElement('button');b.className='go glow';b.textContent='✔';
  b.onclick=()=>{if(game!==g)return;sfx('sparkle');g.si++;if(g.si>=g.stages.length){g.si=g.stages.length;sfx('fanfare');g.tada=performance.now()/1000;$('lgOpts').innerHTML='';
      setTimeout(()=>{if(game!==g)return;game=null;closeScreen(true);if(g.onDone)g.onDone(g.ch);},2000);return;}buildStage(g);};
  $('lgOpts').appendChild(b);}

// --- Custom screen game owned by a land module: cfg like openScreen plus {mode}
function screenGame(cfg){stop(true);const g=game=Object.assign({type:'screen'},cfg);
  openScreen(Object.assign({},cfg,{onClose:q=>{if(game===g)game=null;if(cfg.onClose)cfg.onClose(q);}}));return g;}
function finishScreen(g,cb,delay){setTimeout(()=>{if(game===g){game=null;closeScreen(true);}if(cb)cb();},delay==null?1800:delay);}

// ===== World hooks for the tap field =====
HOOK.tap.push((wx,wy)=>{const g=game;if(!g||g.type!=='field')return false;
  let best=null,bd=g.r;for(const it of g.items){if(it.st!=='on')continue;const d=dist(wx,wy,it.x,it.y-g.hy);if(d<bd){bd=d;best=it;}}
  if(best){initAudio();if(g.walk)goDo(best.x,best.y,g.walk,()=>{if(best.st==='on'&&game===g)popItem(best);});else popItem(best);return true;}
  return false;});
HOOK.update.push(dt=>{const g=game,t=state.time;
  if(g&&g.type==='field'){if(g.move)for(const it of g.items)if(it.st==='on')g.move(it,dt,t);
    if(g.walkPop)for(const it of g.items)if(it.st==='on'&&dist(player.x,player.y,it.x,it.y)<g.walkPop)popItem(it);
    if(g.mode==='play'&&(hereArea()!==g.area||flight))stop(true);}
  if(g&&g.mode==='story'&&g.quest&&qid()!==g.quest)stop(true);
  if(g&&typeof vilPauseLife==='function'&&g.mode==='story')vilPauseLife(2);});
HOOK.layer.push((L,t)=>{const g=game;if(!g||g.type!=='field')return;const f=art(g.art);
  for(const it of g.items){if(it.st==='gone')continue;if(it.st==='pop'&&t-it.t0>1.2){it.st='gone';continue;}if(!onScreen(it.x,it.y))continue;
    L.push([it.y+(g.sortY||0),()=>f(it,t,g)]);}});
HOOK.bar.push(()=>game&&game.mode==='play'&&game.type==='field'?[{key:'lgstop',html:'✖',label:'stop',onTap:()=>{stop();sfx('tap');}}]:null);
HOOK.init.push(()=>{HOOK.target.unshift(()=>{const g=game;if(!g||g.type!=='field')return undefined;
  const it=nearest(g.items.filter(o=>o.st==='on'));if(it&&areaAt(it.x,it.y)!==hereArea())return undefined;return it?{x:it.x,y:it.y-(g.hy||0)-.4}:null;});});
// stop LG games when another pony game starts
{const prev=ponyAction;ponyAction=function(id,act){if(act==='play'&&game&&game.mode==='play')stop(true);return prev(id,act);};}

// ===== Chapter helpers =====
// Nearest crop of a kind in an area: ripe first, then dry, then growing, then free soil.
function cropTarget(kinds,area){const inA=p=>areaAt(p.x,p.y)===area;
  const pl=Object.entries(state.plots).map(([k,p])=>{const[x,y]=k.split(',').map(Number);return{x:x+.5,y:y+.5,p};}).filter(o=>inA(o)&&kinds.includes(o.p.c));
  const ripe=nearest(pl.filter(o=>stageOf(o.p)>=3));if(ripe)return ripe;
  const dry=nearest(pl.filter(o=>!o.p.w));if(dry)return dry;
  const grow=nearest(pl);if(grow)return grow;
  const C=AREAS[area].cam,free=[];for(let y=C.y0;y<C.y1;y++)for(let x=C.x0;x<C.x1;x++)if(map[y][x]==='S'&&!state.plots[x+','+y])free.push({x:x+.5,y:y+.5});
  return nearest(free);}
// Seeds she should be planting: picks the right one in the bar while she's at the land's garden
function wantSeed(k){if(seedsHere().includes(k)&&state.seed!==k){state.seed=k;refreshBar(true);}}
// Pony Village arrow for "build cottages" quests
function villageTarget(){if(hereArea()!=='valley')return padTarget();if(!inVillage(player.x,player.y))return VILLAGE_GATE;
  if(state.inv.wood<3)return nearest(LOG_SPOTS.map(([x,y],i)=>({x,y,i})).filter(o=>!(state.logsAt[o.i]>state.time)));return null;}
const BUILD=new Set();
function homeless(ids){return ids.filter(id=>rescued(id)&&!state.cottages[state.ponies[id].home]);}
function fillCottages(ids){const free=homeless(ids);state.cottages.forEach((c,i)=>{if(!c.pony&&free.length)moveIn(i,free.shift());});}
function giftWood(ids){const n=homeless(ids).length*3-state.inv.wood;if(n>0){state.inv.wood+=n;sfx('harvest');floatText(player.x,player.y-1.2,'+'+n+' 🪵');refreshBar(true);}}
HOOK.init.push(()=>{const prev=refreshBar;refreshBar=function(force){prev(force);
  if(started&&BUILD.has(qid())&&state.inv.wood>=3&&!placing){const b=$('bar').querySelector('[data-build]');if(b)b.classList.add('pulse');}};});
// The balloon always stays with her (an old save may have her somewhere the balloon isn't)
HOOK.begin.push(()=>{const a=hereArea();if(state.balloon>=1&&state.balloonAt!==a&&PADS[a])state.balloonAt=a;game=null;scr=null;});
HOOK.land.push(()=>stop(true));
// A small flying messenger that brings a chapter's letter (butterfly, bottle, shooting star...)
function messenger(drawKey){const m={x:0,y:0,leaving:true,flip:false,leftAt:-99,drawKey};
  m.update=(dt,on)=>{const t=state.time;
    if(on&&!m.leaving){if(dist(m.x,m.y,player.x,player.y)>12){m.x=player.x+6;m.y=player.y-4;}
      const tx=player.x+1.6+Math.sin(t*.9)*.4,ty=player.y-1.2+Math.sin(t*2.3)*.25;m.flip=tx<m.x;moveToward(m,tx,ty,5,dt);}
    else if(m.leaving&&t-m.leftAt<5){m.x+=dt*5;m.y-=dt*4;}};
  m.arrive=()=>{m.leaving=false;m.x=player.x+6;m.y=player.y-4;};
  m.leave=()=>{m.leaving=true;m.leftAt=state.time;};
  m.visible=()=>!m.leaving||state.time-m.leftAt<5;
  m.layer=(L,t)=>{if(m.visible()&&onScreen(m.x,m.y))L.push([99,()=>art(m.drawKey)(m,t)]);};
  m.hit=(wx,wy)=>!m.leaving&&dist(wx,wy,m.x,m.y)<1.1;
  return m;}

return{art,AREAS_LANDS:LANDS,NEED,dests,padTarget,goArea,openPick,grassDeco,
  field,fieldLeft,spotsNear,pickGame,builder,screenGame,finishScreen,screenSay,stop,active,
  cropTarget,wantSeed,villageTarget,BUILD,homeless,fillCottages,giftWood,messenger,SAY};
})();
