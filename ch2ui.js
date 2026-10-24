'use strict';
// ---------- Chapter 2 screens: pony menu, naming, building, portraits ----------
document.body.insertAdjacentHTML('beforeend',`
<div id="ponyMenu" class="panel"><div class="pmTop"><span id="pmName"></span><span class="pmHeart">💗</span><div class="pmBar"><div id="pmFill"></div></div></div>
  <div class="pmBtns">
    <button data-act="pet" aria-label="Pet">💗</button><button data-act="feed" aria-label="Feed" id="pmFeed">🥕</button>
    <button data-act="brush" aria-label="Brush">🪮</button><button data-act="play" aria-label="Play">⚽</button>
    <button data-act="follow" aria-label="Follow" id="pmFollow">🐾</button></div></div>
<div id="c2modal" class="modal"><div class="panel box"><button class="close" id="c2close">✖</button><div id="c2body"></div></div></div>`);

// Portraits: ponies drawn into a small picture for dialog and picker screens
const portraitCache=new Map();
function ponyLook(id){
  if(PONIES[id]){const p=state.ponies[id];return Object.assign({},PONIES[id].look,{acc:p&&p.acc});}
  if(id==='buttercup')return{body:'#ffe08a',mane:['#ff8cc6','#ff6fb5'],hoof:'#a0643a',snout:'#ffd0a0',bow:!!state.decor.bow};
  if(id==='stardust')return{body:state.rainbow?'#fff':'#f1eef6',mane:state.rainbow?STARS.map(x=>x.c):state.uniFollow?UNI_HAPPY:UNI_SAD,
    hoof:'#c9b6ff',snout:'#ffe1ef',horn:true,hornColor:state.rainbow||state.uniFollow?'#ffd34d':'#ddd2a8',crown:state.uniCrown};
  if(id==='cloudberry')return{body:'#f6ecff',mane:['#c9a6ff','#ff9ad5','#9fd3ff','#c9a6ff'],hoof:'#b79cf0',snout:'#fff0fb',
    horn:true,hornColor:'#ffd34d',wings:'#ffffff',acc:'👑',scale:1.1};
  return null;}
function portrait(id){
  const o=ponyLook(id);if(!o)return null;const key=id+JSON.stringify(o);if(portraitCache.has(key))return portraitCache.get(key);
  const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d');
  const sCtx=ctx,sTs=ts,sDpr=dpr;
  try{ctx=g;ts=118/(o.scale||1);dpr=1;g.fillStyle='#ffe9f5';g.beginPath();g.arc(96,96,96,0,Math.PI*2);g.fill();
    drawHorse(84,172,Object.assign({},o,{flip:false,walkT:0,moving:false}));}
  catch(e){}finally{ctx=sCtx;ts=sTs;dpr=sDpr;emojiCache.clear();}
  const url=c.toDataURL();portraitCache.set(key,url);return url;}
function setFace(who){const el=$('dlgFace'),sp=SPK[who]||SPK.narrator;
  const url=sp.portrait&&portrait(who);if(url)el.innerHTML=`<img src="${url}" alt="">`;else el.textContent=sp.f;}

// Rainbow carrot: a carrot emoji painted with rainbow stripes
const rcCache=new Map();
function rainbowEmoji(e,size){
  const k=e+size+'|'+dpr;if(rcCache.has(k))return rcCache.get(k);
  const src=emo(e,size),c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');
  g.drawImage(src,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=.78;
  g.translate(c.width/2,c.height/2);g.rotate(-.75);const bw=c.width/9;STARS.forEach((s,i)=>{g.fillStyle=s.c;g.fillRect((i-3.5)*bw,-c.height,bw+1,c.height*2);});
  c._s=src._s;rcCache.set(k,c);return c;}
let rcURL=null;
function iconHTML(k){if(k==='rcarrot'){if(!rcURL)rcURL=rainbowEmoji('🥕',40).toDataURL();return `<img class="ico" src="${rcURL}" alt="">`;}return ICON[k];}

// ---------- Pony menu ----------
function openPonyMenu(id){menuPony=id;const m=$('ponyMenu');m.style.display='block';refreshPonyMenu();positionPonyMenu();sfx('tap');
  const e=ents[id];burst(e.x,e.y-1,'💗',3);}
function closePonyMenu(){menuPony=null;$('ponyMenu').style.display='none';}
function refreshPonyMenu(){if(!menuPony)return;const id=menuPony,p=state.ponies[id];
  $('pmName').textContent=ponyName(id);$('pmFill').style.width=(p.hearts*10)+'%';
  const f=feedChoice(id);$('pmFeed').innerHTML=f?iconHTML(f):'🍽️';
  $('pmFollow').textContent=state.follower===id?'🏠':'🐾';
  $('ponyMenu').querySelector('[data-act=play]').textContent=id==='puff'?'🙈':'⚽';}
function positionPonyMenu(){const e=ents[menuPony],m=$('ponyMenu');
  const x=e.x*ts-cam.x,y=(e.y-1.5*(PONIES[menuPony].look.scale||1))*ts-cam.y;
  m.style.left=clamp(x-m.offsetWidth/2,8,vw-m.offsetWidth-8)+'px';m.style.top=clamp(y-m.offsetHeight-6,86,vh-m.offsetHeight-90)+'px';}
$('ponyMenu').addEventListener('pointerdown',e=>e.stopPropagation());
$('ponyMenu').querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();initAudio();if(menuPony)ponyAction(menuPony,b.dataset.act);}));

// ---------- Simple picture screens ----------
let c2onClose=null;
function openC2(html,onClose){$('c2body').innerHTML=html;c2onClose=onClose||null;$('c2modal').classList.add('show');addSayButtons($('c2body'));}
function closeC2(){$('c2modal').classList.remove('show');const f=c2onClose;c2onClose=null;if(f)f();}
$('c2close').onclick=()=>{stopSpeech();closeC2();};

function namePony(id){
  const names=PONIES[id].names,img=portrait(id);
  openC2(`<h2 data-say="${N2.nameIt}">What should we name this pony?</h2>
    <div class="items">${names.map(n=>`<div class="item pick" data-name="${n}" data-say="${n}"><img class="por" src="${img}" alt=""><span class="nm">${n}</span></div>`).join('')}</div>
    <div class="row"><button class="small" id="typeName">✏️ Type a name (grown-ups)</button></div>`,()=>choose(names[0]));
  say(N2.nameIt,'narrator',$('c2body').querySelector('h2'));
  function choose(n){c2onClose=null;$('c2modal').classList.remove('show');state.ponies[id]={name:n,hearts:2,home:-1,acc:null};
    sfx('fanfare');burst(ents[id].x,ents[id].y-1,'💗',8);saveGame();talk([['narrator',N2.pretty]],()=>rescue(id));}
  $('c2body').querySelectorAll('.pick').forEach(c=>c.onclick=()=>choose(c.dataset.name));
  $('typeName').onclick=()=>{const n=(prompt('Type a name for the pony:')||'').trim().slice(0,14);if(n)choose(n);};
}
function cottagePreview(col){
  const c=document.createElement('canvas');c.width=c.height=200;const g=c.getContext('2d'),sCtx=ctx;
  try{ctx=g;drawCottageAt(100,182,56,col,null,1);}finally{ctx=sCtx;}return c.toDataURL();}
function openBuild(){
  if(placing){placing=null;refreshBar(true);return;}
  const ok=state.inv.wood>=3;
  openC2(`<h2 data-say="${N2.build}">🏠 Build a Cottage</h2>
    ${ok?'':`<div class="sell" data-say="${N2.needWood}"><span class="what">🪵 ${state.inv.wood} / 3</span></div>`}
    <div class="items">${COTTAGE_COLORS.map(c=>`<div class="item pick ${ok?'':'cant'}" data-c="${c.id}" data-say="${c.name}"><img class="por" src="${cottagePreview(c)}" alt=""><span class="buy">🪵 3</span></div>`).join('')}</div>`);
  say(ok?N2.build:N2.needWood,'narrator');
  $('c2body').querySelectorAll('.pick').forEach(el=>el.onclick=()=>{
    if(state.inv.wood<3){sfx('nope');say(N2.needWood,'narrator');return;}
    closeC2();startPlacing(el.dataset.c);});
}
function openPicker(ci,ids){
  openC2(`<h2 data-say="${N2.whoLives}">Who will live here?</h2>
    <div class="items">${ids.map(id=>`<div class="item pick" data-id="${id}" data-say="${ponyName(id)}"><img class="por" src="${portrait(id)}" alt=""><span class="nm">${ponyName(id)}</span></div>`).join('')}</div>`,
    ()=>moveIn(ci,ids[0]));
  say(N2.whoLives,'narrator');
  $('c2body').querySelectorAll('.pick').forEach(el=>el.onclick=()=>{c2onClose=null;$('c2modal').classList.remove('show');moveIn(ci,el.dataset.id);});
}
