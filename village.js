'use strict';
// ---------- Village life & customization (Release 3) ----------
// Pony dress-up, friendship levels & tricks, the player's wardrobe, decorating and moving things in Pony Village,
// village growth stages, ponies living their own lives, little moments, treasure chests, baby animals and a secret garden.
// Everything lives in state.vil. Shared functions are wrapped (never replaced); see the list at the bottom of this file.
(()=>{
const S=()=>state.vil;
// true when she is away from Sparkle Valley and Pony Village (Cloud Kingdom or a far land)
const offV=()=>areaAt(player.x,player.y)!=='valley';
const R=(t)=>reg('narrator',t);
SPK.critter={n:'Baby animal',f:'🐣',p:1.7,r:1.05};

document.head.insertAdjacentHTML('beforeend',`<style>
.vilWrap{display:flex;gap:16px;align-items:flex-start;}
.vilPrevBox{flex:none;display:flex;flex-direction:column;align-items:center;gap:8px;}
.vilPrev{width:250px;height:250px;border-radius:50%;background:radial-gradient(circle at 50% 38%,#fff 0,#ffeef8 58%,#ffd6ec 100%);border:4px solid #ffc2e2;}
.vilPrevImg{width:250px;height:250px;border-radius:24px;background:radial-gradient(circle at 50% 40%,#f4fff0 0,#dff5d6 70%,#c9ebbd 100%);border:4px solid #ffc2e2;}
.vilSide{flex:1;min-width:0;}
.vilTabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}
.vilTab{width:58px;height:58px;border-radius:16px;font-size:30px;background:#fff6fb;border:3px solid #ffd0e8;padding:0;}
.vilTab.sel{background:#ffe08a;border-color:#ff9a3c;transform:scale(1.08);}
.vilOpts{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:10px;margin-top:12px;max-height:48vh;overflow:auto;padding:6px;}
.vilOpt{height:80px;border-radius:18px;background:#fff6fb;border:3px solid #ffd0e8;font-size:42px;position:relative;display:flex;align-items:center;justify-content:center;padding:0;}
.vilOpt:active{transform:scale(.92);}
.vilOpt.sel{border-color:#ff7eb6;background:#ffe9f5;box-shadow:0 0 0 3px #ff7eb6;}
.vilOpt.lock>*{opacity:.28;filter:grayscale(.7);}
.vilOpt.lock::after{content:'🔒';position:absolute;right:-2px;bottom:-4px;font-size:26px;}
.vilOpt img{width:68px;height:68px;pointer-events:none;}
.vilSw{width:56px;height:56px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.25);pointer-events:none;}
.vilLv{font-size:17px;font-weight:bold;background:#fff3c4;border:2px solid #ffd34d;color:#b5651d;border-radius:12px;padding:0 8px;white-space:nowrap;cursor:pointer;}
.vilHub{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px;}
.vilCard{background:#fff6fb;border:4px solid #ffd0e8;border-radius:22px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:22px;font-weight:bold;color:#d94f9b;cursor:pointer;}
.vilCard:active{transform:scale(.96);}
.vilCard .e{font-size:62px;line-height:1.1;}
.vilCost{display:flex;gap:5px;font-size:17px;font-weight:bold;flex-wrap:wrap;justify-content:center;}
.vilCost span{background:#fff;border-radius:10px;padding:0 6px;border:2px solid #ffe0a0;}
.vilCost span.no{border-color:#ffb3b3;color:#c44;background:#fff0f0;}
.item.vilIt{position:relative;cursor:pointer;}
.item.vilIt .por{width:110px;height:110px;border-radius:18px;}
.item.vilIt.vilLock .por{filter:grayscale(.8);opacity:.45;}
.item.vilIt .vilBadge{position:absolute;top:4px;left:8px;font-size:24px;}
.item.vilIt .vilN{position:absolute;top:4px;right:8px;font-size:18px;background:#e7ffe9;border:2px solid #9be3a6;border-radius:10px;padding:0 6px;}
.vilSec{font-size:22px;font-weight:bold;color:#d94f9b;margin:14px 0 0;text-align:center;}
.vilNames{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:12px;}
.vilName{background:#fff6fb;border:3px solid #ffd0e8;border-radius:20px;padding:10px;font-size:21px;font-weight:bold;color:#d94f9b;display:flex;flex-direction:column;align-items:center;cursor:pointer;text-align:center;}
.vilName.sel{border-color:#ff7eb6;background:#ffe9f5;box-shadow:0 0 0 3px #ff7eb6;}
.vilName .e{font-size:44px;line-height:1.1;}
@media (max-width:700px){.vilWrap{flex-direction:column;align-items:center;}}
</style>`);

// ---------- small drawing helpers ----------
function heartPath(x,y,r){ctx.beginPath();ctx.moveTo(x,y+r*.95);ctx.bezierCurveTo(x-r*1.7,y-r*.1,x-r*.75,y-r*1.3,x,y-r*.45);ctx.bezierCurveTo(x+r*.75,y-r*1.3,x+r*1.7,y-r*.1,x,y+r*.95);ctx.closePath();}
const LW=s=>Math.max(1,s*.016);
function line(x0,y0,x1,y1){ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
// draws fn into a picture (data URL); fn(g) draws with ctx=g around the canvas center
const picCache=new Map();
function pic(key,w,h,fn){if(picCache.has(key))return picCache.get(key);const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),sC=ctx;
  try{ctx=g;fn(w,h);}catch(e){console.warn(e);}finally{ctx=sC;}const u=c.toDataURL();picCache.set(key,u);return u;}

// ---------- Accessories (drawn around a local origin; s = size of the pony) ----------
function dBow(s,c,dk){ctx.lineWidth=LW(s);ctx.strokeStyle=dk||'#c2407e';ctx.fillStyle=c||'#ff6fb5';
  ctx.beginPath();ctx.moveTo(-s*.015,s*.02);ctx.lineTo(-s*.07,s*.13);ctx.lineTo(-s*.02,s*.11);ctx.lineTo(s*.0,s*.04);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(s*.015,s*.02);ctx.lineTo(s*.06,s*.14);ctx.lineTo(s*.095,s*.1);ctx.lineTo(s*.03,s*.02);ctx.closePath();ctx.fill();ctx.stroke();
  for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(sd*s*.07,-s*.13,sd*s*.2,-s*.11,sd*s*.17,0);ctx.bezierCurveTo(sd*s*.2,s*.1,sd*s*.07,s*.1,0,0);ctx.fill();ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.45)';ell(-s*.11,-s*.04,s*.03,s*.014);ctx.fill();ell(s*.1,-s*.04,s*.03,s*.014);ctx.fill();
  ctx.fillStyle=c||'#ff6fb5';circ(0,0,s*.042);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';circ(-s*.012,-s*.012,s*.013);ctx.fill();}
function dFlowerCrown(s){const P=[[-.15,.04],[-.1,-.035],[-.035,-.075],[.035,-.075],[.1,-.035],[.15,.04]];
  ctx.fillStyle='#5fb45a';P.forEach(([a,b],i)=>{if(i<5){ell((a+.035)*s,(b-.005)*s,s*.035,s*.017);ctx.fill();}});
  const C=['#ff7eb6','#ffffff','#c9a6ff','#ffd34d','#ff9ad5','#9fd3ff'];P.forEach(([a,b],i)=>flower(a*s,b*s,s*.033,C[i]));}
function dTiara(s){const pts=[[-.15,.03],[-.12,-.06],[-.07,0],[0,-.14],[.07,0],[.12,-.06],[.15,.03]];
  ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a*s,b*s):ctx.moveTo(a*s,b*s));ctx.quadraticCurveTo(0,-s*.01,-s*.15,s*.03);ctx.closePath();
  ctx.fillStyle='#ffd34d';ctx.fill();ctx.strokeStyle='#c99a1a';ctx.lineWidth=LW(s);ctx.stroke();
  [[0,-.085,'#ff6fb5',.032],[-.11,-.035,'#7fc8ff',.02],[.11,-.035,'#7fc8ff',.02]].forEach(([a,b,c,r])=>{ctx.fillStyle=c;circ(a*s,b*s,r*s);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';circ((a-.009)*s,(b-.009)*s,r*s*.35);ctx.fill();});}
function dParty(s){ctx.save();ctx.rotate(-.22);const cone=()=>{ctx.beginPath();ctx.moveTo(-s*.1,s*.03);ctx.lineTo(0,-s*.3);ctx.lineTo(s*.1,s*.03);ctx.quadraticCurveTo(0,s*.07,-s*.1,s*.03);ctx.closePath();};
  cone();ctx.fillStyle='#9fd3ff';ctx.fill();ctx.save();cone();ctx.clip();ctx.fillStyle='#ff7eb6';for(let i=0;i<4;i++)ctx.fillRect(-s*.15,-s*.26+i*s*.085,s*.3,s*.035);ctx.restore();
  cone();ctx.strokeStyle='#5a7fc0';ctx.lineWidth=LW(s);ctx.stroke();ctx.fillStyle='#ffd34d';circ(0,-s*.3,s*.042);ctx.fill();ctx.strokeStyle='#e0a800';ctx.stroke();ctx.restore();}
function dHeartClip(s){heartPath(0,0,s*.075);ctx.fillStyle='#ff5fa8';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,s*.02);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ell(-s*.03,-s*.03,s*.018,s*.012);ctx.fill();}
function dScarf(s){ctx.lineWidth=LW(s);ctx.strokeStyle='#c2407e';
  ctx.save();ctx.translate(s*.1,s*.03);ctx.rotate(-.75);ctx.fillStyle='#ff7eb6';rr(-s*.035,0,s*.075,s*.2,s*.03);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.fillRect(-s*.03,s*.08,s*.065,s*.025);ctx.fillRect(-s*.03,s*.14,s*.065,s*.025);ctx.restore();
  const band=()=>rr(-s*.15,-s*.055,s*.3,s*.11,s*.05);band();ctx.fillStyle='#ff7eb6';ctx.fill();ctx.save();band();ctx.clip();ctx.fillStyle='#fff';
  for(let i=-3;i<=3;i++){ctx.save();ctx.translate(i*s*.065,0);ctx.rotate(.5);ctx.fillRect(-s*.012,-s*.1,s*.024,s*.2);ctx.restore();}ctx.restore();band();ctx.stroke();}
function dBell(s){rr(-s*.15,-s*.03,s*.3,s*.06,s*.03);ctx.fillStyle='#ff5c8a';ctx.fill();ctx.strokeStyle='#b8325e';ctx.lineWidth=LW(s);ctx.stroke();
  ctx.save();ctx.translate(s*.08,s*.055);ctx.fillStyle='#ffd34d';ctx.strokeStyle='#c99a1a';circ(0,0,s*.045);ctx.fill();ctx.stroke();ctx.fillStyle='#8a6a1a';ctx.fillRect(-s*.03,s*.005,s*.06,s*.01);circ(0,s*.026,s*.01);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.75)';circ(-s*.015,-s*.016,s*.012);ctx.fill();ctx.restore();}
function dPearls(s){ctx.lineWidth=LW(s)*.7;for(let i=-4;i<=4;i++){const x=i*s*.034,y=s*.004*i*i*.3;ctx.fillStyle='#fffaf5';ctx.strokeStyle='#c9bfd6';circ(x,y,s*.02);ctx.fill();ctx.stroke();}
  ctx.save();ctx.translate(s*.03,s*.06);heartPath(0,0,s*.035);ctx.fillStyle='#ff9ad5';ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();ctx.restore();}
function dBowtie(s){ctx.save();ctx.translate(s*.1,s*.01);ctx.fillStyle='#5fa8f5';ctx.strokeStyle='#2f6fb5';ctx.lineWidth=LW(s);
  for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(sd*s*.08,-s*.055);ctx.lineTo(sd*s*.08,s*.055);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.fillStyle='#ffd34d';circ(0,0,s*.025);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';circ(-s*.05,0,s*.01);ctx.fill();circ(s*.05,0,s*.01);ctx.fill();ctx.restore();}
function dLei(s){const C=['#ff7eb6','#ffd34d','#c9a6ff','#fff','#ff9ad5','#9fd3ff','#ff7eb6'];ctx.fillStyle='#5fb45a';for(let i=-3;i<=3;i++){ell(i*s*.045,s*.012*Math.abs(i)*.4+s*.02,s*.03,s*.014);ctx.fill();}
  for(let i=-3;i<=3;i++)flower(i*s*.045,s*.01*Math.abs(i)*.4,s*.03,C[i+3]);}
function dGlasses(s,kind){const lens=()=>{if(kind==='heart')heartPath(s*.005,s*.005,s*.075);else if(kind==='star')starPath(s*.005,0,s*.095);else circ(s*.005,0,s*.068);};
  const fr=kind==='heart'?'#e0307a':kind==='star'?'#e0a800':'#6b4a8a';ctx.strokeStyle=fr;ctx.lineWidth=Math.max(1.2,s*.022);
  line(-s*.06,-s*.012,-s*.2,-s*.06);line(s*.07,s*.0,s*.1,s*.015);
  lens();ctx.fillStyle=kind==='heart'?'rgba(255,120,180,.38)':kind==='star'?'rgba(255,220,90,.38)':'rgba(190,225,255,.35)';ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.7)';ell(-s*.02,-s*.025,s*.018,s*.01);ctx.fill();}
function dBunny(s){for(const sd of[-1,1]){ctx.save();ctx.translate(sd*s*.07,0);ctx.rotate(sd*.2);ctx.fillStyle='#fff';ctx.strokeStyle='#d6c0e0';ctx.lineWidth=LW(s);
  ell(0,-s*.15,s*.055,s*.16);ctx.fill();ctx.stroke();ctx.fillStyle='#ffc4dc';ell(0,-s*.14,s*.026,s*.11);ctx.fill();ctx.restore();}
  ctx.strokeStyle='#ff9ad5';ctx.lineWidth=s*.03;ctx.beginPath();ctx.arc(0,s*.12,s*.16,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
function dCat(s){for(const sd of[-1,1]){ctx.save();ctx.translate(sd*s*.12,0);ctx.rotate(sd*.25);ctx.fillStyle='#b28cf5';ctx.strokeStyle='#7a55c4';ctx.lineWidth=LW(s);
  ctx.beginPath();ctx.moveTo(-s*.06,s*.02);ctx.lineTo(0,-s*.14);ctx.lineTo(s*.06,s*.02);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffc4dc';ctx.beginPath();ctx.moveTo(-s*.03,s*.0);ctx.lineTo(0,-s*.08);ctx.lineTo(s*.03,s*.0);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.strokeStyle='#b28cf5';ctx.lineWidth=s*.03;ctx.beginPath();ctx.arc(0,s*.13,s*.17,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
function dUnicornBand(s){ctx.strokeStyle='#ff9ad5';ctx.lineWidth=s*.032;ctx.beginPath();ctx.arc(0,s*.13,s*.17,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
  for(const sd of[-1,1]){ctx.save();ctx.translate(sd*s*.12,-s*.0);ctx.rotate(sd*.35);ctx.fillStyle='#fff';ctx.strokeStyle='#d6c0e0';ctx.lineWidth=LW(s);
    ctx.beginPath();ctx.moveTo(-s*.04,s*.02);ctx.quadraticCurveTo(0,-s*.14,s*.04,s*.02);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  const hp=()=>{ctx.beginPath();ctx.moveTo(-s*.045,-s*.02);ctx.lineTo(0,-s*.25);ctx.lineTo(s*.045,-s*.02);ctx.closePath();};
  hp();ctx.fillStyle='#ffd34d';ctx.fill();ctx.strokeStyle='#c99a1a';ctx.lineWidth=LW(s);ctx.stroke();
  ctx.save();hp();ctx.clip();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=s*.014;for(let i=0;i<4;i++){line(-s*.05,-s*(.04+i*.05),s*.05,-s*(.07+i*.05));}ctx.restore();
  flower(-s*.07,s*.0,s*.025,'#ff7eb6');flower(s*.07,s*.0,s*.025,'#c9a6ff');}
function dRainbowCrown(s){const T=nowS(),pts=[[-.16,.03],[-.15,-.1],[-.08,-.03],[0,-.15],[.08,-.03],[.15,-.1],[.16,.03]];
  const g=glowSprite('#fff3a0'),k=.55+.2*Math.sin(T*3);ctx.globalAlpha*=k;ctx.drawImage(g,-s*.3,-s*.34,s*.6,s*.5);ctx.globalAlpha/=k;
  ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a*s,b*s):ctx.moveTo(a*s,b*s));ctx.quadraticCurveTo(0,s*.0,-s*.16,s*.03);ctx.closePath();
  ctx.fillStyle='#ffd34d';ctx.fill();ctx.strokeStyle='#c99a1a';ctx.lineWidth=LW(s);ctx.stroke();
  ctx.fillStyle='#ffeb99';rr(-s*.15,-s*.0,s*.3,s*.035,s*.015);ctx.fill();
  [[-.15,-.1],[-.08,-.035],[0,-.15],[.08,-.035],[.15,-.1]].forEach(([a,b],i)=>{ctx.fillStyle=STARS[(i*2+Math.floor(T*2))%7].c;circ(a*s,b*s,s*.026);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';circ((a-.008)*s,(b-.008)*s,s*.009);ctx.fill();});
  for(let i=0;i<5;i++)ctx.fillStyle=STARS[i].c,ctx.fillRect(-s*.13+i*s*.055,s*.006,s*.04,s*.02);
  const tw=Math.sin(T*4);if(tw>.3)twinkle(s*.17,-s*.17,s*.05*tw,tw);}

const NONE={n:R('Nothing'),e:'🚫'};
// Pony accessories. u: unlock source ({lv:n} friendship level of that pony, 'chest' treasure chests); none = always available.
const PI={
  head:{none:NONE,
    gift:{n:R('Your special present')},
    bow:{n:R('Pink bow'),d:s=>dBow(s)},flowers:{n:R('Flower crown'),d:dFlowerCrown},
    star:{n:R('Star clips'),d:s=>{drawStar(0,0,s*.075,'#ffd34d',false);drawStar(s*.085,s*.05,s*.04,'#ff9ad5',false);}},
    sunhat:{n:R('Sun hat'),d:s=>drawEmoji('👒',0,-s*.05,s*.36),e:'👒'},party:{n:R('Party hat'),d:dParty,ic:.68},
    tophat:{n:R('Top hat'),d:s=>drawEmoji('🎩',0,-s*.08,s*.3),e:'🎩'},
    tiara:{n:R('Sparkly tiara'),d:dTiara,u:{lv:3}},crown:{n:R('Golden crown'),d:s=>drawEmoji('👑',0,-s*.06,s*.3),e:'👑',u:{lv:8}},
    butterfly:{n:R('Butterfly clips'),d:s=>{drawEmoji('🦋',0,0,s*.22);drawEmoji('🦋',s*.1,s*.06,s*.13);},e:'🦋',u:'chest'},
    heart:{n:R('Heart clip'),d:dHeartClip,u:'chest'}},
  neck:{none:NONE,scarf:{n:R('Cozy scarf'),d:dScarf},bell:{n:R('Bell collar'),d:dBell},bowtie:{n:R('Bow tie'),d:dBowtie},
    lei:{n:R('Flower necklace'),d:dLei},pearls:{n:R('Pearl necklace'),d:dPearls,u:'chest'}},
  face:{none:NONE,glasses:{n:R('Round glasses'),d:s=>dGlasses(s)},star:{n:R('Star glasses'),d:s=>dGlasses(s,'star'),u:{lv:12}},
    heart:{n:R('Heart glasses'),d:s=>dGlasses(s,'heart'),u:'chest'}},
  mane:{orig:{n:R('Your own colors')},pink:{n:R('Pink mane'),c:['#ff9ad5','#ff6fb5','#ffc2e2']},purple:{n:R('Purple mane'),c:['#c9a6ff','#9b6cf0','#e3d4ff']},
    blue:{n:R('Blue mane'),c:['#9fd3ff','#5fa8f5','#d2ecff']},gold:{n:R('Golden mane'),c:['#ffd34d','#ffb400','#fff0a8']},
    mint:{n:R('Mint mane'),c:['#8ee6c4','#4fc99a','#c8f5e3']},candy:{n:R('Cotton candy mane'),c:['#ff9ad5','#ffffff','#9fd3ff','#ffffff']},
    rainbow:{n:R('Rainbow mane'),c:STARS.map(x=>x.c),u:{lv:5}},sunset:{n:R('Sunset mane'),c:['#ff8a5c','#ff6fb5','#ffd34d'],u:'chest'},
    galaxy:{n:R('Galaxy mane'),c:['#6b4cc9','#3a2a8c','#c9a6ff','#ff9ad5'],u:'chest'}},
  wings:{orig:{n:R('Your own colors')},white:{n:R('White wings'),c:'#ffffff'},pink:{n:R('Pink wings'),c:'#ffd0e8'},lavender:{n:R('Purple wings'),c:'#e3d4ff'},
    sky:{n:R('Blue wings'),c:'#cfe9ff'},mint:{n:R('Mint wings'),c:'#d0f5e2'},gold:{n:R('Golden wings'),c:'#ffe27a',u:{lv:10}}},
  trail:{none:NONE,sparkles:{n:R('Sparkle trail'),e:'✨'},hearts:{n:R('Heart trail'),e:'💗'},notes:{n:R('Music trail'),e:'🎵'},
    stars:{n:R('Star trail'),e:'⭐',u:{lv:7}},rainbow:{n:R('Rainbow trail'),e:'🌈',u:{lv:11}},bubbles:{n:R('Bubble trail'),e:'🫧',u:'chest'},
    flowers:{n:R('Flower trail'),e:'🌸',u:'chest'},butterflies:{n:R('Butterfly trail'),e:'🦋',u:'chest'}}};
// Tricks are learned at friendship levels.
const TRICKS={twirl:{lv:2,t:'Watch me twirl around!'},jump:{lv:4,t:'Watch me jump up high!'},dance:{lv:6,t:'Let me dance for you!'},rainbow:{lv:9,t:'Rainbow magic! Wheee!'}};
const MAX_LV_REWARD=13;
// The player's wardrobe
const WI={
  head:{none:NONE,bow:{n:R('Pink bow'),d:s=>dBow(s),o:[.17,-.17,1.2]},flowers:{n:R('Flower crown'),d:dFlowerCrown,o:[0,-.2,1.55]},
    star:{n:R('Star clips'),d:PI.head.star.d,o:[.15,-.17,1.3]},sunhat:{n:R('Sun hat'),d:s=>drawEmoji('👒',0,0,s*.5),e:'👒',o:[0,-.29,1]},
    tophat:{n:R('Top hat'),d:s=>drawEmoji('🎩',0,0,s*.42),e:'🎩',o:[0,-.27,1]},party:{n:R('Party hat'),d:dParty,o:[.05,-.22,1.35],ic:.9},
    tiara:{n:R('Sparkly tiara'),d:dTiara,o:[0,-.22,1.4],u:'chest'},crown:{n:R('Golden crown'),d:s=>drawEmoji('👑',0,0,s*.36),e:'👑',o:[0,-.27,1],u:'chest'},
    bunny:{n:R('Bunny ears'),d:dBunny,o:[0,-.16,1.2],u:'chest'},cat:{n:R('Kitty ears'),d:dCat,o:[0,-.16,1.2],u:'chest'},
    unicorn:{n:R('Unicorn headband'),d:dUnicornBand,o:[0,-.16,1.2],u:'garden'},
    rcrown:{n:R('Rainbow Crown'),d:dRainbowCrown,o:[0,-.22,1.45],u:'ch3'}},
  eyes:{none:NONE,round:{n:R('Round glasses')},heart:{n:R('Heart glasses'),u:'chest'},star:{n:R('Star glasses'),u:'chest'}},
  back:{none:NONE,cape:{n:R('Princess cape')},fairy:{n:R('Fairy wings'),u:'garden'},butterfly:{n:R('Butterfly wings'),u:'chest'}}};
const MORE_DRESS=['#ff5c8a','#c9a6ff','#8ee6c4','#ffffff','#ffb3d1','#7a8cff','#ff9a3c','#9fd3ff'];
const DRESS_NAMES={'#ff7eb6':R('Pink dress'),'#a77bd8':R('Purple dress'),'#5fb8ff':R('Blue dress'),'#ffd34d':R('Yellow dress'),'#6fd38a':R('Green dress'),
  '#ff8a5c':R('Orange dress'),'#ff5c8a':R('Rose dress'),'#c9a6ff':R('Lilac dress'),'#8ee6c4':R('Mint dress'),'#ffffff':R('White dress'),
  '#ffb3d1':R('Bubblegum dress'),'#7a8cff':R('Starry blue dress'),'#ff9a3c':R('Pumpkin dress'),'#9fd3ff':R('Sky dress')};
const LOCK_SAY={lv:R('Play with this pony to unlock it!'),chest:R('Find it in a treasure chest!'),garden:R('It is hidden in a secret place!'),ch3:R('Keep playing the story to find it!')};

// ---------- Spoken lines ----------
const L={
  newTrick:R('A new trick! Tap the sparkle button to see it!'),newPresent:R('A new present! Tap the paint button to try it on!'),
  lvCoins:R('Here are 5 shiny coins for you!'),lvMax:R('Super best friends forever!'),
  dressTitle:R('Dress up your pony! Tap the pictures.'),wardTitle:R('Your wardrobe! What will you wear today?'),
  typeName:R('A grown-up can type a different name.'),renamed:R('What a pretty name!'),
};
const LV_SAY=['','','Friendship level 2!','Friendship level 3!','Friendship level 4!','Friendship level 5!','Friendship level 6!','Friendship level 7!',
  'Friendship level 8!','Friendship level 9!','Friendship level 10!','Friendship level 11!','Friendship level 12!','Friendship level 13!',
  'Friendship level 14!','Friendship level 15!'].map(t=>t&&R(t));
const LVUP=['Yay! We are even better friends now!','I love playing with you! Best friends forever!','You make me so happy! Hooray!'];
// lines every pony can say (registered for each pony so each gets its own voice)
const PL={
  gift:'I picked this flower for you!',trick:'Look what I can do!',butterfly:'A butterfly! Come back, little butterfly!',
  sneeze:'Ah... ah... achoo! Oh! Sparkles!',snack:'My tummy is rumbly. Do you have a snack for me?',sleepy:'Yawn... I am a little bit sleepy.',
  wave:'Hi, {name}! I am so happy to see you!',sing:'La la la! I love to sing!',hiccup:'Hic! Oh my! Hic! Hee hee!',
  love:'You are the best friend in the whole world!',secret:'I saw something sparkly in the trees over there. Is it a secret?',
  babies:'I love our baby animal friends!',playground:'Wheee! I love the playground!',pond:'Splish, splash! The water is so fun!',
  bakery:'Mmm! The bakery smells so yummy!',nap:'Zzz... What a cozy spot for a nap.',garden:'These flowers smell so nice!',
  greet1:'Yay! You came back!',greet2:'Hello, {name}! I missed you!',greet3:'Welcome home! Come and play with me!',
  look:'Wow! I love our pretty village!'};
function regPonyLines(){for(const id of PONY_IDS){if(regPonyLines.done.has(id))continue;regPonyLines.done.add(id);
  for(const k in PL)reg(id,PL[k]);LVUP.forEach(t=>reg(id,t));for(const k in TRICKS)reg(id,TRICKS[k].t);}}
regPonyLines.done=new Set();

// ---------- State ----------
function vp(id){const v=S();let p=v.pony[id];
  if(!p){const sp=state.ponies[id];p=v.pony[id]={lv:sp&&sp.best?2:1,head:null,neck:'none',face:'none',mane:'orig',wings:'orig',trail:'none'};}
  return p;}
function ponyCount(){return Object.keys(state.ponies).filter(id=>PONIES[id]).length;}
function stageNow(){const n=ponyCount();return n>=5?3:n>=3?2:n>=1?1:0;}
function initState(){
  if(!state.vil||typeof state.vil!=='object')state.vil={};const v=state.vil;
  v.pony=v.pony||{};v.unl=v.unl||{};v.ward=Object.assign({head:'none',eyes:'none',back:'none'},v.ward||{});
  v.decor=Array.isArray(v.decor)?v.decor:[];v.store=v.store||{};v.babies=v.babies||{};v.gflowers=v.gflowers||{};
  if(v.nextId==null)v.nextId=1;if(v.stage==null)v.stage=stageNow();
  v.chestAt=Math.max(v.chestAt||0,state.time+50);v.babyAt=Math.max(v.babyAt||0,state.time+80);
  for(const id of Object.keys(state.ponies))if(PONIES[id])vp(id);
}
function unlockedP(id,slot,key){const it=PI[slot][key];if(!it)return false;if(key==='gift')return!!(state.ponies[id]&&state.ponies[id].acc);
  if(!it.u||S().unl['p:'+slot+':'+key])return true;return!!(it.u.lv&&vp(id).lv>=it.u.lv);}
function unlockedW(slot,key){const it=WI[slot][key];return!!it&&(!it.u||!!S().unl['w:'+slot+':'+key]);}
function lockSay(it){return LOCK_SAY[it.u&&it.u.lv?'lv':it.u]||LOCK_SAY.chest;}

// ---------- Customized looks: wraps ponyLook, drawHorse, drawPerson, ponyOptsFor ----------
const prevLook=ponyLook;
ponyLook=function(id){const o=prevLook(id);if(!o||!PONIES[id]||!state.vil||!state.ponies[id])return o;const p=S().pony[id];if(!p)return o;
  const m=PI.mane[p.mane];if(m&&m.c)o.mane=m.c;
  const w=PI.wings[p.wings];if(w&&w.c&&o.wings)o.wings=w.c;
  if(p.head&&p.head!=='gift'){o.acc=null;if(p.head!=='none'&&PI.head[p.head])o.vHead=p.head;}
  if(p.neck&&p.neck!=='none')o.vNeck=p.neck;if(p.face&&p.face!=='none')o.vFace=p.face;return o;};
const prevHorse=drawHorse;
drawHorse=function(x,y,o){prevHorse(x,y,o);if(o&&(o.vHead||o.vNeck||o.vFace))horseAcc(x,y,o);};
function horseAcc(x,y,o){
  const s=ts*(o.scale||1),T=nowS(),wt=o.walkT||0,mv=!!o.moving,seed=strSeed(o.body||'#fff')+(o.horn?2.3:0)+(o.wings?1.1:0);
  const bob=mv?-Math.abs(Math.sin(wt))*s*.05:Math.sin(T*2.1+seed)*s*.006,Hx=.4*s,Hy=-.88*s+bob;
  ctx.save();ctx.translate(x,y);if(o.flip)ctx.scale(-1,1);ctx.lineCap='round';ctx.lineJoin='round';
  try{const n=PI.neck[o.vNeck],f=PI.face[o.vFace],h=PI.head[o.vHead];
    if(n&&n.d){ctx.save();ctx.translate(s*.25,-s*.64+bob);ctx.rotate(.46);n.d(s);ctx.restore();}
    if(f&&f.d){ctx.save();ctx.translate(Hx+s*.045,Hy-s*.02);f.d(s);ctx.restore();}
    if(h&&h.d){ctx.save();ctx.translate(Hx-s*.05-(o.horn?s*.08:0),Hy-s*.19);ctx.rotate(-.12);h.d(s);ctx.restore();}
  }finally{ctx.restore();}}
const prevPerson=drawPerson;
drawPerson=function(x,y,face,dress,flip,walkT,moving,opts){
  const w=state&&state.vil&&state.vil.ward;
  if(!w||face!==state.hero||face==='👵'||face==='🐰')return prevPerson(x,y,face,dress,flip,walkT,moving,opts);
  const s=ts,T=nowS(),seated=!!(opts&&opts.seated),top=seated?-.48:-.52,bob=seated?0:moving?-Math.abs(Math.sin(walkT||0))*s*.035:Math.sin(T*2.2)*s*.004;
  if(w.back!=='none'&&WI.back[w.back]){ctx.save();ctx.translate(x,y+bob);if(flip)ctx.scale(-1,1);drawBack(w.back,s,top,T,moving);ctx.restore();}
  prevPerson(x,y,face,dress,flip,walkT,moving,opts);
  const fy=s*(top-.2)+(moving?0:Math.sin(T*2.2+.6)*s*.004);
  ctx.save();ctx.translate(x,y+bob);if(flip)ctx.scale(-1,1);ctx.lineCap='round';ctx.lineJoin='round';
  try{if(w.eyes!=='none'&&WI.eyes[w.eyes])personGlasses(w.eyes,s,fy);
    const h=WI.head[w.head];if(h&&h.d){const[ox,oy,k]=h.o;ctx.save();ctx.translate(ox*s,fy+oy*s);h.d(s*k);ctx.restore();}}
  finally{ctx.restore();}};
function personGlasses(kind,s,fy){const fr=kind==='heart'?'#e0307a':kind==='star'?'#e0a800':'#6b4a8a',y=fy+s*.025;
  ctx.strokeStyle=fr;ctx.lineWidth=Math.max(1.2,s*.02);line(-s*.035,y,s*.035,y);
  for(const sd of[-1,1]){const x=sd*s*.085;if(kind==='heart')heartPath(x,y,s*.06);else if(kind==='star')starPath(x,y,s*.075);else circ(x,y,s*.055);
    ctx.fillStyle=kind==='heart'?'rgba(255,120,180,.4)':kind==='star'?'rgba(255,220,90,.4)':'rgba(190,225,255,.35)';ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.7)';ell(x-s*.02,y-s*.02,s*.015,s*.009);ctx.fill();}}
function drawBack(kind,s,top,T,moving){const sy=top*s+s*.1,fl=moving?Math.sin(T*14)*.12:Math.sin(T*2.5)*.05;
  if(kind==='cape'){ctx.fillStyle='#ff5c8a';ctx.strokeStyle='#c2335f';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.moveTo(-s*.11,top*s+s*.03);ctx.lineTo(s*.11,top*s+s*.03);
    ctx.quadraticCurveTo(s*(.24+fl),-s*.3,s*(.27+fl),-s*.12);for(let i=4;i>=-4;i--)ctx.quadraticCurveTo(s*(i*.065+.03),-s*(.06+(i%2?.02:0)),s*(i*.065),-s*.12);
    ctx.quadraticCurveTo(-s*(.24-fl),-s*.3,-s*.11,top*s+s*.03);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffd34d';for(let i=-3;i<=3;i++){drawStar(i*s*.07,-s*.17,s*.018,'#ffe27a',false);}return;}
  const fairy=kind==='fairy',k=1+(moving?Math.sin(T*16):Math.sin(T*3))*.1;
  for(const sd of[-1,1])for(const[a,dy,rx,ry,c1]of[[-.55,-.04,.2,.11,0],[.5,.14,.14,.08,1]]){
    ctx.save();ctx.translate(sd*s*.08,sy+dy*s);ctx.scale(sd*k,1);ctx.rotate(a);ell(s*rx*.9,0,s*rx,s*ry);
    ctx.fillStyle=fairy?'rgba(210,240,255,.72)':(c1?'#ffb84d':'#ff7eb6');ctx.fill();ctx.strokeStyle=fairy?'rgba(255,255,255,.95)':'#b8325e';ctx.lineWidth=Math.max(1,s*.015);ctx.stroke();
    if(fairy){ctx.fillStyle='rgba(255,180,230,.45)';ell(s*rx*1.1,0,s*rx*.45,s*ry*.45);ctx.fill();}
    else{ctx.fillStyle='#fff6a8';circ(s*rx*1.2,0,s*ry*.32);ctx.fill();ctx.fillStyle='#9b6cf0';circ(s*rx*.6,s*ry*.2,s*ry*.22);ctx.fill();}
    ctx.restore();}
  if(fairy){const tw=Math.sin(T*4);if(tw>.4)twinkle(-s*.28,sy-s*.1,s*.04*tw,tw);}}
const prevOpts=ponyOptsFor;
ponyOptsFor=function(id,e,t){const r=prevOpts(id,e,t),o=r[0];let dy=r[1];
  if(e.vLift)dy-=e.vLift*ts;
  if(e.vTw&&t-e.vTw<1.4){const k=(t-e.vTw)/1.4;o.flip=Math.floor(k*10)%2===0;dy-=Math.sin(Math.PI*k)*ts*.25;}
  if(e.vDance&&t-e.vDance<2.2){const k=t-e.vDance;dy-=Math.abs(Math.sin(k*7))*ts*.16;o.flip=Math.sin(k*3.5)>0;}
  return[o,dy];};

// ---------- Friendship levels & tricks ----------
const heartsNeed=lv=>Math.min(12+3*(lv-2),27);
const pastFriends=()=>{const f=qi('friends');return f<0||state.quest>f;};
const prevAdd=addHeart;
addHeart=function(id,n){const p=state.ponies[id];if(!p||!state.vil)return prevAdd(id,n);const v=vp(id);
  if(!p.best||!pastFriends()){const was=p.best;prevAdd(id,n);if(p.best&&v.lv<2){v.lv=2;if(!was)setTimeout(()=>talk([['narrator',L.newTrick]]),950);}return;}
  if(v.lv<2)v.lv=2;
  p.hearts=Math.min(10,p.hearts+n*10/heartsNeed(v.lv));if(p.hearts>=9.999)levelUp(id);};
function rewardFor(lv){for(const k in TRICKS)if(TRICKS[k].lv===lv)return{say:L.newTrick};
  for(const sl of['head','neck','face','mane','wings','trail'])for(const k in PI[sl]){const u=PI[sl][k].u;if(u&&u.lv===lv)return{say:L.newPresent};}
  return{coins:5,say:L.lvCoins};}
function levelUp(id){const p=state.ponies[id],v=vp(id),e=ents[id];v.lv++;p.hearts=0;const lv=v.lv,rw=rewardFor(lv);closePonyMenu();
  if(rw.coins)state.coins+=rw.coins;e.hop=state.time;sfx('fanfare');burst(e.x,e.y-1,'⭐',10,1.2);saveGame();
  setTimeout(()=>{celebrate(true);talk([[id,pick(LVUP)],['narrator',LV_SAY[lv]||L.lvMax],['narrator',rw.say]]);},700);}
const prevRefresh=refreshPonyMenu;
refreshPonyMenu=function(){prevRefresh();if(!menuPony||!state.vil||!state.ponies[menuPony])return;let b=$('vilLv');
  if(!b){$('ponyMenu').querySelector('.pmTop').insertAdjacentHTML('beforeend','<span id="vilLv" class="vilLv"></span>');b=$('vilLv');
    b.addEventListener('pointerdown',e=>e.stopPropagation());b.onclick=e=>{e.stopPropagation();initAudio();sfx('tap');if(menuPony){const lv=vp(menuPony).lv;say(LV_SAY[lv]||L.lvMax,'narrator');}};}
  b.textContent='⭐ '+vp(menuPony).lv;};
function doTrick(id){const e=ents[id],t=state.time;if(!e||(e.vTrickT&&t-e.vTrickT<1.6))return;const lv=vp(id).lv,known=Object.keys(TRICKS).filter(k=>TRICKS[k].lv<=lv);if(!known.length)return;
  e.vTi=((e.vTi==null?-1:e.vTi)+1)%known.length;const k=known[e.vTi];e.vTrickT=t;e.pause=t+4;endAct(id,e);
  if(k==='twirl'){e.vTw=t;burst(e.x,e.y-.8,'✨',8,.8);sfx('sparkle');}
  else if(k==='jump'){e.trick=t;sfx('fanfare');}
  else if(k==='dance'){e.vDance=t;sfx('pop');for(let i=0;i<4;i++)setTimeout(()=>burst(e.x,e.y-1,'🎵',2,.6),i*450);}
  else{e.trick=t;sfx('sparkle');particles.push({x:e.x,y:e.y,vx:0,vy:0,g:0,life:1.6,max:1.6,draw:drawRainbowArc});}
  say(TRICKS[k].t,id);}
function drawRainbowArc(p,al){const s=ts,x=SX(p.x),y=SY(p.y)-s*.2,k=1-p.life/p.max;ctx.save();ctx.globalAlpha=al*.85;ctx.lineWidth=s*.07;ctx.lineCap='round';
  STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ctx.beginPath();ctx.arc(x,y,s*(.9-i*.07),Math.PI,Math.PI+Math.PI*Math.min(1,k*2.2));ctx.stroke();});ctx.restore();}
function drawDot(p,al){ctx.save();ctx.globalAlpha=al;ctx.fillStyle=p.c;circ(SX(p.x),SY(p.y),ts*.06*(.6+al*.5));ctx.fill();ctx.restore();}
let trailN=0;
function trailUpdate(dt){for(const id of PONY_IDS){const e=ents[id],p=state.ponies[id];if(!p||!e)continue;const tr=vp(id).trail;if(!tr||tr==='none'||!PI.trail[tr])continue;
  if(!sameArea(e,player)||!onScreen(e.x,e.y)||(hide&&id==='puff'))continue;
  const busy=e.moving||(e.trick&&state.time-e.trick<1.2)||(e.vTw&&state.time-e.vTw<1.4)||(e.vAct&&e.vAct.ph==='do'&&(e.vAct.k==='swing'||e.vAct.k==='slide'));
  if(Math.random()>dt*(busy?9:1.2))continue;const sc=PONIES[id].look.scale||1,bx=e.x+(e.flip?.25:-.25)*sc+rand(-.12,.12),by=e.y-(.35+(e.vLift||0))*sc+rand(-.15,.1);
  if(tr==='rainbow')particles.push({x:bx,y:by,vx:rand(-.1,.1),vy:-.25,g:0,life:1,max:1,c:STARS[(trailN++)%7].c,draw:drawDot});
  else particles.push({x:bx,y:by,vx:rand(-.25,.25),vy:rand(-.6,-.3),g:0,life:1.1,max:1.1,e:PI.trail[tr].e,size:rand(.18,.26)});}}

// ---------- Picture editor screens (dress-up, wardrobe, cottage painting) ----------
let edit=null,loopId=0;
function runPreview(cv,drawFn){const id=++loopId,g=cv.getContext('2d'),k=dpr;cv.width=Math.round(250*k);cv.height=Math.round(250*k);
  const step=()=>{if(id!==loopId||!cv.isConnected||!$('c2modal').classList.contains('show'))return;
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(k,0,0,k,0,0);
    const sC=ctx,sT=ts;try{ctx=g;drawFn(nowS());}catch(e){console.warn(e);}finally{ctx=sC;ts=sT;}requestAnimationFrame(step);};step();}
function openEditor(cfg){edit={cfg,tab:cfg.tab||0};
  openC2(`<h2 data-say="${cfg.say}">${cfg.title}</h2><div class="vilWrap"><div class="vilPrevBox">${cfg.preview?'<canvas class="vilPrev" id="vilPrev"></canvas>':'<img class="vilPrevImg" id="vilPrevImg" alt="">'}</div>
    <div class="vilSide"><div class="vilTabs">${cfg.tabs.map((t,i)=>`<button class="vilTab" data-t="${i}" aria-label="${t.say}">${t.icon}</button>`).join('')}</div><div id="vilOptBox"></div></div></div>`,
    ()=>{loopId++;edit=null;if(cfg.onClose)cfg.onClose();});
  say(cfg.say,'narrator',$('c2body').querySelector('h2'));
  $('c2body').querySelectorAll('.vilTab').forEach(b=>b.onclick=()=>{initAudio();sfx('tap');edit.tab=+b.dataset.t;renderTab();say(cfg.tabs[edit.tab].say,'narrator');});
  if(cfg.preview)runPreview($('vilPrev'),cfg.preview);
  renderTab();}
function renderTab(){if(!edit)return;const cfg=edit.cfg,tb=cfg.tabs[edit.tab],box=$('vilOptBox');
  $('c2body').querySelectorAll('.vilTab').forEach((b,i)=>b.classList.toggle('sel',i===edit.tab));
  if(tb.html){box.innerHTML=tb.html();addSayButtons(box);tb.bind(box);}
  else{const items=tb.items(),sel=tb.sel();
    box.innerHTML=`<div class="vilOpts">${items.map((o,i)=>`<button class="vilOpt ${o.key===sel?'sel':''} ${o.lock?'lock':''}" data-i="${i}" aria-label="${o.name}">${o.html}</button>`).join('')}</div>`;
    box.querySelectorAll('.vilOpt').forEach(b=>b.onclick=()=>{initAudio();const o=items[+b.dataset.i];
      if(o.lock){sfx('nope');say(o.hint,'narrator');return;}
      sfx('pop');tb.pick(o);say(o.name,'narrator');box.querySelectorAll('.vilOpt').forEach(x=>x.classList.toggle('sel',x===b));
      if(cfg.img)$('vilPrevImg').src=cfg.img();saveGame();});}
  if(cfg.img)$('vilPrevImg').src=cfg.img();}
const sw=c=>`<span class="vilSw" style="background:${c}"></span>`;
const grad=cols=>cols.length>1?`linear-gradient(135deg,${cols.map((c,i)=>`${c} ${Math.round(i/cols.length*100)}% ${Math.round((i+1)/cols.length*100)}%`).join(',')})`:cols[0];
function itemPic(tbl,slot,k,extra){const it=tbl[slot][k];if(k==='none')return'<span>🚫</span>';if(it.e&&!extra)return`<span>${it.e}</span>`;
  if(!it.d&&!extra)return`<span>${it.e||'✨'}</span>`;
  return`<img src="${pic((tbl===PI?'p':'w')+slot+k,128,128,(w,h)=>{ctx.lineCap='round';ctx.lineJoin='round';
    if(extra){extra(w,h);return;}const s=(slot==='face'?420:tbl===WI?250:slot==='head'?380:320)*(it.ic||1);ctx.translate(w/2+(slot==='face'?s*.06:0),h/2+(slot==='head'?s*.08:0));it.d(s);})}" alt="">`;}

function openDress(id){if(!state.ponies[id])return;const p=vp(id),e=ents[id],hasW=!!PONIES[id].look.wings;
  const slotTab=(slot,icon,say)=>({icon,say,sel:()=>slot==='head'?(p.head==null?(state.ponies[id].acc?'gift':'none'):p.head):p[slot],
    pick:o=>{p[slot]=o.key;if(e){e.hop=state.time;burst(e.x,e.y-1,'✨',5,.7);}},
    items:()=>Object.keys(PI[slot]).filter(k=>k!=='gift'||unlockedP(id,'head','gift')).map(k=>{const it=PI[slot][k];
      let html;if(slot==='mane')html=sw(grad(it.c||PONIES[id].look.mane));else if(slot==='wings')html=sw(it.c||PONIES[id].look.wings||'#fff');
      else if(k==='gift')html=`<span>${state.ponies[id].acc}</span>`;else html=itemPic(PI,slot,k);
      return{key:k,name:it.n,lock:!unlockedP(id,slot,k),hint:lockSay(it),html};})});
  const tabs=[slotTab('head','🎀',R('Hats, bows and crowns!')),slotTab('neck','🧣',R('Scarves and necklaces!')),slotTab('face','👓',R('Fun glasses!')),
    slotTab('mane','💇',R('Mane and tail colors!'))];
  if(hasW)tabs.push(slotTab('wings','🪶',R('Wing colors!')));
  tabs.push(slotTab('trail','✨',R('A magic trail when your pony walks!')));
  tabs.push({icon:'✏️',say:R('Pick a new name!'),html:()=>`<div class="vilNames">${PONIES[id].names.map(n=>`<div class="vilName ${ponyName(id)===n?'sel':''}" data-n="${n}" data-say="${n}"><span class="e">💗</span>${n}</div>`).join('')}</div>
      <div class="row"><button class="small" id="vilType">✏️ Type a name (grown-ups)</button></div>`,
    bind:box=>{const set=n=>{state.ponies[id].name=n;sfx('fanfare');if(e)burst(e.x,e.y-1,'💗',6);saveGame();renderTab();say(n,'narrator');};
      box.querySelectorAll('.vilName').forEach(el=>el.onclick=()=>{initAudio();set(el.dataset.n);});
      $('vilType').onclick=()=>{say(L.typeName,'narrator');const n=(prompt('Type a name for the pony:')||'').trim().slice(0,14);if(n)set(n);};}});
  openEditor({title:'🎨 Dress Up',say:L.dressTitle,tabs,preview:t=>{const o=Object.assign({},ponyLook(id),{flip:false,walkT:0,moving:false});ts=150/(o.scale||1);
    drawHorse(112,212,o);const tr=PI.trail[p.trail];
    if(tr&&p.trail!=='none')for(let i=0;i<7;i++){const a=t*1.1+i*.9,x=125+Math.cos(a)*100,y=140+Math.sin(a)*72;
      if(p.trail==='rainbow'){ctx.fillStyle=STARS[i].c;circ(x,y,7);ctx.fill();}else drawEmoji(tr.e,x,y,26,false,.85);}
    ctx.font='bold 22px "Chalkboard SE","Comic Sans MS",sans-serif';ctx.textAlign='center';ctx.fillStyle='#d94f9b';ctx.fillText(ponyName(id),125,242);}});}

let newWard=false;
function openWardrobe(){const w=S().ward;newWard=false;refreshBar(true);
  const slotTab=(slot,icon,say)=>({icon,say,sel:()=>w[slot],pick:o=>{w[slot]=o.key;burst(player.x,player.y-1,'✨',5,.6);},
    items:()=>Object.keys(WI[slot]).map(k=>{const it=WI[slot][k];let extra=null;
      if(slot==='eyes'&&k!=='none')extra=(cw,ch)=>{ctx.translate(cw/2,ch/2-12);personGlasses(k,380,0);};
      if(slot==='back'&&k!=='none')extra=(cw,ch)=>{ctx.translate(cw/2,ch/2+60);drawBack(k,200,-.52,1,false);};
      return{key:k,name:it.n,lock:!unlockedW(slot,k),hint:lockSay(it),html:itemPic(WI,slot,k,extra)};})});
  const faceSay=R('You look great!');
  const tabs=[{icon:'😊',say:R('Pick your farmer!'),sel:()=>state.hero,pick:o=>{state.hero=o.key;},items:()=>HEROES.map(h=>({key:h,name:faceSay,html:`<span>${h}</span>`}))},
    {icon:'👗',say:R('Pick a dress color!'),sel:()=>state.dress,pick:o=>{state.dress=o.key;},
      items:()=>[...new Set([...DRESSES,...MORE_DRESS])].map(c=>({key:c,name:DRESS_NAMES[c]||faceSay,html:sw(c)}))},
    slotTab('head','👑',R('Hats, bows and crowns!')),slotTab('eyes','👓',R('Fun glasses!')),slotTab('back','🦋',R('Wings and capes!'))];
  openEditor({title:'👗 My Wardrobe',say:L.wardTitle,tabs,preview:t=>{ts=190;drawPerson(125,236,state.hero,state.dress,false,0,false);}});}

// ---------- Decoration drawings (origin = bottom middle of the footprint, s = tile size) ----------
const FLOWER_SETS=[['#ff7eb6','#ffffff','#ffd34d'],['#c9a6ff','#ff9ad5','#ffffff'],['#ffd34d','#ff8a5c','#fff6a8'],STARS.map(x=>x.c)];
function dFlowerBed(s,v){const C=FLOWER_SETS[v%4];shadow(0,-s*.12,s*.46,s*.14);
  ctx.fillStyle='#8a5a36';ell(0,-s*.25,s*.4,s*.2);ctx.fill();ctx.fillStyle='#6b4428';ell(0,-s*.23,s*.33,s*.14);ctx.fill();
  ctx.lineWidth=LW(s);ctx.strokeStyle='#b9ab93';ctx.fillStyle='#efe7d8';
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;circ(Math.cos(a)*s*.39,-s*.25+Math.sin(a)*s*.19,s*.05);ctx.fill();ctx.stroke();}
  [[-.2,-.31],[0,-.35],[.2,-.31],[-.27,-.21],[.27,-.22],[-.1,-.2],[.11,-.2],[0,-.14]].forEach(([a,b],i)=>{const x=a*s,y=b*s;
    ctx.strokeStyle='#4f9a3e';ctx.lineWidth=Math.max(1,s*.022);line(x,y,x,y-s*.12);ctx.fillStyle='#5fb45a';ell(x+s*.035,y-s*.05,s*.035,s*.016);ctx.fill();
    flower(x,y-s*.14,s*.042,C[i%C.length]);});}
function dBush(s,v){const col=['#ff9ad5','#ffffff','#ffd34d','#c9a6ff'][v%4];shadow(0,-s*.08,s*.44,s*.14);
  const B=[[-.2,-.24,.22],[.2,-.24,.22],[0,-.42,.27],[-.03,-.2,.2]];ctx.lineWidth=s*.035;ctx.strokeStyle='#2c7a3a';
  for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.stroke();}ctx.fillStyle='#3e9a47';for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.fill();}
  ctx.fillStyle='#55b552';for(const[a,b,r]of B){circ((a-.03)*s,(b-.04)*s,r*.82*s);ctx.fill();}
  ctx.fillStyle='#74cc62';circ(-s*.08,-s*.52,s*.12);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ell(-s*.12,-s*.58,s*.05,s*.03);ctx.fill();
  [[-.25,-.3],[.15,-.47],[.28,-.22],[-.05,-.58],[-.15,-.14],[.06,-.28],[.22,-.38]].forEach(([a,b])=>flower(a*s,b*s,s*.035,col));}
function dTree(kind){return s=>{const spr=treeSprite(kind);shadow(0,-s*.08,s*.46,s*.14);ctx.drawImage(spr,-spr._ox,-spr._oy-s*.08,spr._w,spr._h);};}
function dFence(s,m){ctx.lineWidth=LW(s);ctx.strokeStyle='#b8a6c8';ctx.fillStyle='#fffaf3';shadow(0,-s*.12,s*.42,s*.08);
  const x0=m&1?-s*.5:-s*.3,x1=m&2?s*.5:s*.3;for(const y of[-s*.44,-s*.26]){rr(x0,y,x1-x0,s*.075,s*.035);ctx.fill();ctx.stroke();}
  for(const px of[-s*.21,0,s*.21]){ctx.beginPath();ctx.moveTo(px-s*.055,-s*.1);ctx.lineTo(px-s*.055,-s*.55);ctx.lineTo(px,-s*.63);ctx.lineTo(px+s*.055,-s*.55);ctx.lineTo(px+s*.055,-s*.1);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.fillStyle='#ff9ad5';heartPath(0,-s*.42,s*.035);ctx.fill();}
function dBench(s,v){const c=['#ff9ad5','#9fd3ff','#c9a6ff','#ffd34d'][v%4],dk=shadeHex(c,-.3);shadow(0,-s*.1,s*.44,s*.1);ctx.lineWidth=LW(s);
  const wood=(x,y,w,h)=>{ctx.fillStyle='#a8703f';ctx.strokeStyle='#7a4a24';rr(x,y,w,h,s*.02);ctx.fill();ctx.stroke();};
  wood(-s*.37,-s*.68,s*.06,s*.42);wood(s*.31,-s*.68,s*.06,s*.42);
  ctx.fillStyle=c;ctx.strokeStyle=dk;rr(-s*.42,-s*.66,s*.84,s*.11,s*.05);ctx.fill();ctx.stroke();rr(-s*.42,-s*.51,s*.84,s*.08,s*.04);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';heartPath(0,-s*.6,s*.035);ctx.fill();
  ctx.fillStyle=c;ctx.strokeStyle=dk;rr(-s*.46,-s*.36,s*.92,s*.12,s*.05);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.45)';rr(-s*.42,-s*.35,s*.84,s*.03,s*.015);ctx.fill();
  wood(-s*.36,-s*.25,s*.06,s*.2);wood(s*.3,-s*.25,s*.06,s*.2);}
function dPicnic(s){ctx.save();const P=()=>{ctx.beginPath();ctx.moveTo(-s*.78,-s*.84);ctx.lineTo(s*.9,-s*.84);ctx.lineTo(s*.8,-s*.14);ctx.lineTo(-s*.9,-s*.14);ctx.closePath();};
  ctx.translate(0,s*.03);P();ctx.fillStyle='rgba(50,80,30,.16)';ctx.fill();ctx.translate(0,-s*.03);P();ctx.fillStyle='#fff';ctx.fill();ctx.save();P();ctx.clip();ctx.fillStyle='#ff9ad5';
  for(let i=0;i<10;i++)for(let j=0;j<4;j++)if((i+j)%2===0)ctx.fillRect(-s*.95+i*s*.19+j*s*.03,-s*.84+j*s*.175,s*.19,s*.175);ctx.restore();P();ctx.strokeStyle='#ff7eb6';ctx.lineWidth=s*.03;ctx.stroke();ctx.restore();
  drawEmoji('🧺',-s*.42,-s*.55,s*.42);drawEmoji('🍓',s*.12,-s*.44,s*.22);drawEmoji('🧁',s*.45,-s*.58,s*.28);drawEmoji('🍎',s*.62,-s*.34,s*.2);}
function dMushroom(s,v){const cap=['#ff5c6c','#ff7eb6','#b28cf5','#5fa8f5'][v%4];shadow(0,-s*.07,s*.38,s*.1);ctx.lineWidth=LW(s);
  ctx.fillStyle='#fff6e3';ctx.strokeStyle='#d8c3a0';rr(-s*.2,-s*.48,s*.4,s*.42,s*.12);ctx.fill();ctx.stroke();
  ctx.fillStyle='#b5713f';ctx.strokeStyle='#8a5129';ctx.beginPath();ctx.moveTo(-s*.08,-s*.07);ctx.lineTo(-s*.08,-s*.22);ctx.arc(0,-s*.22,s*.08,Math.PI,0);ctx.lineTo(s*.08,-s*.07);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffd34d';circ(s*.04,-s*.15,s*.015);ctx.fill();ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';circ(s*.13,-s*.33,s*.045);ctx.fill();ctx.stroke();
  const cp=()=>{ctx.beginPath();ctx.moveTo(-s*.44,-s*.42);ctx.quadraticCurveTo(-s*.44,-s*.9,0,-s*.92);ctx.quadraticCurveTo(s*.44,-s*.9,s*.44,-s*.42);ctx.quadraticCurveTo(0,-s*.3,-s*.44,-s*.42);ctx.closePath();};
  cp();ctx.fillStyle=cap;ctx.fill();ctx.strokeStyle=shadeHex(cap,-.3);ctx.lineWidth=s*.025;ctx.stroke();
  ctx.fillStyle='#fff';[[-.24,-.55,.07],[.05,-.75,.08],[.26,-.52,.06],[-.06,-.5,.045],[-.2,-.76,.04]].forEach(([a,b,r])=>{circ(a*s,b*s,r*s);ctx.fill();});
  ctx.fillStyle='rgba(255,255,255,.3)';ell(-s*.15,-s*.82,s*.12,s*.04);ctx.fill();}
function dStones(s){[[-.22,-.62,.17],[.18,-.42,.19],[-.12,-.2,.16]].forEach(([a,b,r])=>{ctx.fillStyle='rgba(60,80,30,.18)';ell(a*s,b*s+s*.03,r*s,r*s*.6);ctx.fill();
  ctx.fillStyle='#ece6f5';ctx.strokeStyle='#b9b0cc';ctx.lineWidth=LW(s);ell(a*s,b*s,r*s,r*s*.6);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.6)';ell((a-.05)*s,(b-.03)*s,r*s*.4,r*s*.2);ctx.fill();});
  flower(s*.3,-s*.75,s*.03,'#ff9ad5');flower(-s*.38,-s*.3,s*.026,'#ffd34d');}
function dLamp(s,v){const star=v===9;shadow(0,-s*.08,s*.22,s*.07);ctx.lineWidth=LW(s);ctx.fillStyle='#6b5a8a';ctx.strokeStyle='#4a3d63';
  rr(-s*.12,-s*.18,s*.24,s*.12,s*.04);ctx.fill();ctx.stroke();rr(-s*.04,-s*1.35,s*.08,s*1.2,s*.03);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#4a3d63';ctx.lineWidth=s*.03;ctx.beginPath();ctx.arc(s*.1,-s*1.3,s*.08,Math.PI,Math.PI*1.9);ctx.stroke();
  if(star){drawStar(0,-s*1.55,s*.2,'#ffe27a',false);return;}
  ctx.lineWidth=LW(s);ctx.fillStyle='#fff3b8';ctx.strokeStyle='#6b5a8a';rr(-s*.13,-s*1.62,s*.26,s*.3,s*.07);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffe27a';ell(0,-s*1.47,s*.07,s*.1);ctx.fill();ctx.fillStyle='#6b5a8a';ctx.beginPath();ctx.moveTo(-s*.17,-s*1.6);ctx.lineTo(0,-s*1.76);ctx.lineTo(s*.17,-s*1.6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ff9ad5';heartPath(0,-s*1.82,s*.045);ctx.fill();}
function aLamp(X,Y,s,t,d){const v=d.k==='starlamp',k=.45+.18*Math.sin(t*2+d.x),g=glowSprite(v?'#ffe27a':'#fff3a0'),r=s*(v?.75:.55);ctx.globalAlpha=k;ctx.drawImage(g,X-r,Y-s*(v?1.55:1.47)-r,r*2,r*2);ctx.globalAlpha=1;
  if(v){const tw=Math.sin(t*3+d.y);if(tw>.3)twinkle(X+s*.22,Y-s*1.8,s*.06*tw,tw);}}
function dFountain(s){shadow(0,-s*.2,s*.98,s*.3);ctx.lineWidth=s*.025;
  ctx.fillStyle='#cfc6e0';ell(0,-s*.5,s*.92,s*.42);ctx.fill();ctx.strokeStyle='#a79cc4';ctx.stroke();ctx.fillStyle='#f2eefa';ell(0,-s*.6,s*.88,s*.37);ctx.fill();ctx.stroke();
  ctx.fillStyle='#7fd0f7';ell(0,-s*.62,s*.74,s*.28);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ell(-s*.25,-s*.7,s*.25,s*.06);ctx.fill();
  ctx.fillStyle='#e9e4f5';ctx.strokeStyle='#a79cc4';rr(-s*.1,-s*1.35,s*.2,s*.75,s*.06);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d9d2ea';ell(0,-s*1.35,s*.34,s*.11);ctx.fill();ctx.stroke();ctx.fillStyle='#a8e6ff';ell(0,-s*1.37,s*.26,s*.07);ctx.fill();
  ctx.fillStyle='#ff9ad5';heartPath(0,-s*.95,s*.06);ctx.fill();}
function aFountain(X,Y,s,t){ctx.strokeStyle='rgba(200,240,255,.85)';ctx.lineWidth=Math.max(1.5,s*.035);ctx.lineCap='round';
  for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(X+sd*s*.24,Y-s*1.37);ctx.quadraticCurveTo(X+sd*s*.5,Y-s*1.4,X+sd*s*.56,Y-s*.68);ctx.stroke();}
  ctx.fillStyle='rgba(225,248,255,.9)';for(let i=0;i<8;i++){const k=(t*1.3+i/8)%1,sd=i%2?1:-1,x=X+sd*s*(.24+.32*k),y=Y-s*1.37+s*(k*k*.7-.08*Math.sin(k*Math.PI));circ(x,y,s*.025);ctx.fill();}
  ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=Math.max(1,s*.02);for(let i=0;i<2;i++){const k=(t*.6+i*.5)%1;ell(X,Y-s*.62,s*(.2+k*.5),s*(.07+k*.18));ctx.globalAlpha=1-k;ctx.stroke();ctx.globalAlpha=1;}
  const up=Math.sin(t*5)*s*.04;ctx.fillStyle='rgba(225,248,255,.95)';ell(X,Y-s*1.45+up,s*.06,s*.1);ctx.fill();}
function dTinyHouse(s,v){drawCottageAt(0,-s*.08,s*.33,COTTAGE_COLORS[v%COTTAGE_COLORS.length],null,1);}
function dStable(s){shadow(0,-s*.12,s*1.55,s*.26);ctx.lineWidth=Math.max(1,s*.03);ctx.lineJoin='round';
  ctx.fillStyle='#fff0f5';ctx.strokeStyle='#d9a0b8';rr(-s*1.3,-s*1.55,s*2.6,s*1.45,s*.1);ctx.fill();ctx.stroke();
  ctx.save();rr(-s*1.3,-s*1.55,s*2.6,s*1.45,s*.1);ctx.clip();ctx.strokeStyle='rgba(217,160,184,.35)';ctx.lineWidth=s*.02;for(let i=1;i<14;i++)line(-s*1.3+i*s*.2,-s*1.55,-s*1.3+i*s*.2,-s*.1);ctx.restore();
  const roof=()=>{ctx.beginPath();ctx.moveTo(-s*1.48,-s*1.42);ctx.lineTo(-s*1.12,-s*2.05);ctx.lineTo(0,-s*2.38);ctx.lineTo(s*1.12,-s*2.05);ctx.lineTo(s*1.48,-s*1.42);ctx.closePath();};
  roof();ctx.fillStyle='#ff8ab8';ctx.fill();ctx.save();roof();ctx.clip();ctx.strokeStyle='rgba(190,50,110,.3)';ctx.lineWidth=s*.022;for(let i=1;i<7;i++)line(-s*1.6,-s*(1.4+i*.14),s*1.6,-s*(1.4+i*.14));ctx.restore();
  roof();ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;ctx.stroke();
  ctx.fillStyle='#ffe08a';circ(0,-s*1.85,s*.2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.05;ctx.stroke();
  ctx.strokeStyle='#e0b84a';ctx.lineWidth=s*.02;for(let i=0;i<5;i++)line(-s*.12+i*s*.06,-s*1.72,-s*.1+i*s*.05,-s*1.95);
  ctx.fillStyle='#c97b5d';ctx.strokeStyle='#8a5129';ctx.lineWidth=s*.03;rr(-s*.45,-s*1.05,s*.9,s*.95,s*.08);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=s*.05;ctx.strokeRect(-s*.4,-s*1.0,s*.8,s*.85);line(-s*.4,-s*1.0,s*.4,-s*.15);line(s*.4,-s*1.0,-s*.4,-s*.15);
  ctx.strokeStyle='#ffd34d';ctx.lineWidth=s*.06;ctx.beginPath();ctx.arc(0,-s*1.25,s*.12,Math.PI*.15,Math.PI*.85,true);ctx.stroke();
  for(const bx of[-s*1.05,s*1.05]){ctx.fillStyle='#f3cf62';ctx.strokeStyle='#c9a13a';ctx.lineWidth=s*.02;rr(bx-s*.22,-s*.42,s*.44,s*.32,s*.06);ctx.fill();ctx.stroke();line(bx-s*.16,-s*.32,bx+s*.16,-s*.32);line(bx-s*.16,-s*.2,bx+s*.16,-s*.2);}
  for(const wx of[-s*.9,s*.9]){ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';ctx.lineWidth=s*.04;rr(wx-s*.18,-s*1.25,s*.36,s*.3,s*.05);ctx.fill();ctx.stroke();}}
function dWell(s){shadow(0,-s*.08,s*.4,s*.12);ctx.lineWidth=LW(s);
  ctx.fillStyle='#a8703f';ctx.strokeStyle='#7a4a24';rr(-s*.33,-s*1.08,s*.06,s*.6,s*.02);ctx.fill();ctx.stroke();rr(s*.27,-s*1.08,s*.06,s*.6,s*.02);ctx.fill();ctx.stroke();
  ctx.fillStyle='#5fb8ff';ell(0,-s*.5,s*.3,s*.08);ctx.fill();
  ctx.fillStyle='#cfc6e0';ctx.strokeStyle='#8d86a3';rr(-s*.35,-s*.52,s*.7,s*.44,s*.08);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(120,110,150,.35)';for(let r=0;r<3;r++)for(let i=0;i<4;i++){rr(-s*.33+i*s*.17+(r%2)*s*.08,-s*.5+r*s*.14,s*.16,s*.12,s*.03);ctx.stroke();}
  ctx.strokeStyle='#7a4a24';ctx.lineWidth=s*.03;line(-s*.3,-s*.95,s*.3,-s*.95);ctx.lineWidth=LW(s);line(0,-s*.95,0,-s*.7);
  ctx.fillStyle='#c98e55';ctx.strokeStyle='#7a4a24';rr(-s*.07,-s*.72,s*.14,s*.12,s*.03);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ff8ab8';ctx.strokeStyle='#c2407e';ctx.beginPath();ctx.moveTo(-s*.45,-s*1.0);ctx.lineTo(0,-s*1.32);ctx.lineTo(s*.45,-s*1.0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';heartPath(0,-s*1.1,s*.04);ctx.fill();}
function dMailbox(s){shadow(0,-s*.08,s*.2,s*.07);ctx.lineWidth=LW(s);ctx.fillStyle='#a8703f';ctx.strokeStyle='#7a4a24';rr(-s*.04,-s*.6,s*.08,s*.52,s*.02);ctx.fill();ctx.stroke();
  ctx.fillStyle='#9fd3ff';ctx.strokeStyle='#4a8ad0';ctx.beginPath();ctx.moveTo(-s*.22,-s*.58);ctx.lineTo(-s*.22,-s*.8);ctx.arc(0,-s*.8,s*.22,Math.PI,0);ctx.lineTo(s*.22,-s*.58);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ff5c8a';heartPath(0,-s*.76,s*.06);ctx.fill();ctx.fillStyle='#ff5c8a';ctx.strokeStyle='#b8325e';rr(s*.2,-s*1.02,s*.04,s*.3,s*.02);ctx.fill();ctx.stroke();rr(s*.2,-s*1.02,s*.14,s*.09,s*.02);ctx.fill();ctx.stroke();}
function dStatue(s,v){const gold=v===9;shadow(0,-s*.06,s*.42,s*.12);ctx.lineWidth=LW(s);
  ctx.fillStyle=gold?'#ffe9a8':'#efeaf7';ctx.strokeStyle=gold?'#c99a1a':'#b3a9cc';rr(-s*.3,-s*.44,s*.6,s*.38,s*.05);ctx.fill();ctx.stroke();rr(-s*.37,-s*.52,s*.74,s*.1,s*.04);ctx.fill();ctx.stroke();rr(-s*.37,-s*.12,s*.74,s*.08,s*.03);ctx.fill();ctx.stroke();
  drawStar(0,-s*.27,s*.07,gold?'#ff9ad5':'#ffd34d',false);
  drawHorse(-s*.04,-s*.52,gold?{body:'#ffd34d',mane:['#ffe9a8','#ffc94d'],hoof:'#e0a800',snout:'#fff0b0',horn:true,hornColor:'#fff6c4',scale:.62}
    :{body:'#f4f1fa',mane:['#e2dcef','#d4cce6'],hoof:'#cfc6e0',snout:'#fbfaff',wings:'#ffffff',scale:.62});}
function dArch(s){shadow(0,-s*.12,s*.95,s*.12);ctx.lineCap='butt';ctx.lineWidth=s*.105;STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ctx.beginPath();ctx.arc(0,-s*.3,s*(.95-i*.1),Math.PI,0);ctx.stroke();});ctx.lineCap='round';
  ctx.fillStyle='#fff';for(const sd of[-1,1]){circ(sd*s*.65,-s*.26,s*.2);ctx.fill();circ(sd*s*.5,-s*.18,s*.15);ctx.fill();circ(sd*s*.82,-s*.18,s*.15);ctx.fill();}}
function dTower(s){shadow(0,-s*.08,s*.4,s*.12);ctx.lineWidth=Math.max(1,s*.025);ctx.fillStyle='#f6eefc';ctx.strokeStyle='#c4a0e8';rr(-s*.32,-s*1.55,s*.64,s*1.47,s*.06);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(196,160,232,.45)';ctx.lineWidth=s*.015;for(let r=1;r<8;r++){line(-s*.32,-s*(.1+r*.18),s*.32,-s*(.1+r*.18));}
  ctx.lineWidth=Math.max(1,s*.025);ctx.strokeStyle='#c4a0e8';for(let i=0;i<3;i++){ctx.fillStyle='#f6eefc';rr(-s*.36+i*s*.26,-s*1.7,s*.2,s*.2,s*.03);ctx.fill();ctx.stroke();}
  ctx.fillStyle='#b28cf5';ctx.beginPath();ctx.moveTo(-s*.4,-s*1.62);ctx.lineTo(0,-s*2.35);ctx.lineTo(s*.4,-s*1.62);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';ctx.lineWidth=s*.04;ctx.beginPath();ctx.moveTo(-s*.1,-s*1.0);ctx.lineTo(-s*.1,-s*1.2);ctx.arc(0,-s*1.2,s*.1,Math.PI,0);ctx.lineTo(s*.1,-s*1.0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#c98be8';ctx.beginPath();ctx.moveTo(-s*.16,-s*.08);ctx.lineTo(-s*.16,-s*.38);ctx.arc(0,-s*.38,s*.16,Math.PI,0);ctx.lineTo(s*.16,-s*.08);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#8a6aa0';ctx.lineWidth=s*.025;line(0,-s*2.35,0,-s*2.7);}
function aFlag(X,Y,s,t,top,col){const w=Math.sin(t*4+X*.01)*s*.05;ctx.fillStyle=col||'#ff7eb6';ctx.beginPath();ctx.moveTo(X,Y-s*top);ctx.quadraticCurveTo(X+s*.2,Y-s*top-s*.04+w,X+s*.38,Y-s*top+s*.06+w);ctx.lineTo(X,Y-s*top+s*.18);ctx.closePath();ctx.fill();}
function dCarousel(s){shadow(0,-s*.25,s*1.0,s*.3);ctx.lineWidth=Math.max(1,s*.025);
  ctx.fillStyle='#e9b84a';ell(0,-s*.32,s*.95,s*.3);ctx.fill();ctx.fillStyle='#ffe08a';ell(0,-s*.38,s*.95,s*.3);ctx.fill();ctx.strokeStyle='#c99a1a';ctx.stroke();
  ctx.fillStyle='#fff6e0';ctx.strokeStyle='#e0b48a';rr(-s*.12,-s*1.6,s*.24,s*1.25,s*.06);ctx.fill();ctx.stroke();}
function aCarousel(X,Y,s,t){const P=[];for(let i=0;i<3;i++){const a=t*.9+i*2.094;P.push([Math.sin(a),Math.cos(a),i]);}P.sort((a,b)=>a[0]-b[0]);
  const cols=[['#ffd0e8',['#ff7eb6','#ffb3d1']],['#d2ecff',['#5fa8f5','#9fd3ff']],['#fff0b0',['#ffb400','#ffd34d']]];
  for(const[d,c,i]of P){const x=X+c*s*.62,y=Y-s*.38+d*s*.16,up=Math.sin(t*3+i*2)*s*.1;
    ctx.strokeStyle='#ffd34d';ctx.lineWidth=Math.max(1.5,s*.03);line(x,Y-s*1.55,x,y);drawHorse(x,y-s*.25+up,{body:cols[i][0],mane:cols[i][1],hoof:'#c9a6ff',snout:'#fff',scale:.36,flip:c<0,walkT:0,moving:false});}
  const cv=()=>{ctx.beginPath();ctx.moveTo(X-s*1.02,Y-s*1.5);ctx.quadraticCurveTo(X-s*.5,Y-s*2.0,X,Y-s*2.25);ctx.quadraticCurveTo(X+s*.5,Y-s*2.0,X+s*1.02,Y-s*1.5);ctx.closePath();};
  cv();ctx.fillStyle='#fff';ctx.fill();ctx.save();cv();ctx.clip();ctx.fillStyle='#ff9ad5';for(let i=-5;i<=5;i+=2){ctx.beginPath();ctx.moveTo(X,Y-s*2.3);ctx.lineTo(X+i*s*.2,Y-s*1.45);ctx.lineTo(X+(i+1)*s*.2,Y-s*1.45);ctx.closePath();ctx.fill();}ctx.restore();
  ctx.fillStyle='#ff7eb6';for(let i=0;i<9;i++){circ(X-s*.92+i*s*.23,Y-s*1.48,s*.1);ctx.fill();}ctx.fillStyle='#fff';for(let i=0;i<9;i++){circ(X-s*.92+i*s*.23,Y-s*1.5,s*.05);ctx.fill();}
  drawStar(X,Y-s*2.32,s*.1,'#ffd34d',false);}
const PG={bar:1.75,px:-.8,L:1.25};
function dPlayground(s){shadow(0,-s*.22,s*1.55,s*.32);ctx.fillStyle='#ffe3c4';ell(0,-s*.5,s*1.45,s*.42);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ell(-s*.3,-s*.6,s*.9,s*.2);ctx.fill();
  ctx.lineCap='round';const bar=-s*PG.bar,xa=-s*1.38,xb=-s*.22,leg=(x0,y0,x1,y1,c)=>{ctx.strokeStyle='rgba(90,40,90,.35)';ctx.lineWidth=s*.09;line(x0,y0,x1,y1);ctx.strokeStyle=c;ctx.lineWidth=s*.065;line(x0,y0,x1,y1);};
  for(const x of[xa,xb]){leg(x-s*.16,-s*.25,x,bar,'#ff7eb6');}
  leg(xa,bar,xb,bar,'#9b6cf0');for(const x of[xa,xb])leg(x+s*.16,-s*.12,x,bar,'#ff7eb6');
  // slide: ladder + chute
  const lx=s*.35;leg(lx-s*.12,-s*.15,lx-s*.1,-s*1.25,'#5fa8f5');leg(lx+s*.12,-s*.15,lx+s*.14,-s*1.25,'#5fa8f5');
  ctx.strokeStyle='#9fd3ff';ctx.lineWidth=s*.035;for(let i=1;i<5;i++){const y=-s*(.15+i*.22);line(lx-s*.1,y,lx+s*.13,y);}
  ctx.fillStyle='#ffd34d';ctx.strokeStyle='#e0a800';ctx.lineWidth=s*.025;rr(lx-s*.18,-s*1.32,s*.42,s*.1,s*.04);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(lx+s*.2,-s*1.3);ctx.bezierCurveTo(s*.95,-s*1.1,s*1.05,-s*.25,s*1.48,-s*.2);ctx.lineTo(s*1.48,-s*.06);ctx.bezierCurveTo(s*1.0,-s*.1,s*.9,-s*.95,lx+s*.2,-s*1.14);ctx.closePath();ctx.fillStyle='#ffd34d';ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=s*.025;ctx.beginPath();ctx.moveTo(lx+s*.25,-s*1.25);ctx.bezierCurveTo(s*.95,-s*1.05,s*1.0,-s*.22,s*1.45,-s*.15);ctx.stroke();
  drawStar(lx+s*.03,-s*1.45,s*.08,'#ff7eb6',false);}
function aPlayground(X,Y,s,t,d){if(occ(d).swing)return;const th=Math.sin(t*1.6+d.x)*.12,px=X+s*PG.px,py=Y-s*PG.bar,sx=px+Math.sin(th)*s*PG.L,sy=py+Math.cos(th)*s*PG.L;swingDraw(px,py,sx,sy,s);}
function swingDraw(px,py,sx,sy,s){ctx.strokeStyle='#8e5a2e';ctx.lineWidth=Math.max(1,s*.02);line(px-s*.1,py,sx-s*.17,sy);line(px+s*.1,py,sx+s*.17,sy);
  ctx.fillStyle='#ff9ad5';ctx.strokeStyle='#c2407e';rr(sx-s*.22,sy-s*.02,s*.44,s*.07,s*.03);ctx.fill();ctx.stroke();}
function dPond(s){const cy=-s*.95;STARS.forEach((st,i)=>{ctx.fillStyle=st.c;ell(0,cy,s*(1.5-i*.028),s*(.8-i*.026));ctx.fill();});
  ctx.fillStyle='#fff7e0';ell(0,cy,s*1.29,s*.6);ctx.fill();const g=ctx.createLinearGradient(0,cy-s*.6,0,cy+s*.6);g.addColorStop(0,'#8fdcff');g.addColorStop(1,'#5bbcef');
  ctx.fillStyle=g;ell(0,cy,s*1.22,s*.55);ctx.fill();ctx.fillStyle='rgba(255,255,255,.3)';ell(-s*.45,cy-s*.25,s*.35,s*.07);ctx.fill();
  for(const[a,b,r]of[[.7,.15,.16],[-.75,.22,.13]]){const x=a*s,y=cy+b*s;ctx.fillStyle='#6fcf6a';ctx.strokeStyle='#3f9a4a';ctx.lineWidth=LW(s);ctx.beginPath();ctx.ellipse(x,y,r*s,r*s*.6,0,.4,Math.PI*2-.1);ctx.lineTo(x,y);ctx.closePath();ctx.fill();ctx.stroke();}
  flower(s*.72,cy+s*.08,s*.05,'#ffb3d1');}
function aPond(X,Y,s,t,d){const cy=Y-s*.95;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(1,s*.02);
  for(let i=0;i<2;i++){const k=(t*.4+i*.5+d.x*.1)%1;ctx.globalAlpha=1-k;ell(X+s*(i?.3:-.35),cy+s*(i?.05:-.1),s*(.08+k*.3),s*(.03+k*.12));ctx.stroke();}ctx.globalAlpha=1;
  const tw=Math.sin(t*2.3+d.y);if(tw>.5)twinkle(X+s*.1,cy-s*.15,s*.07*(tw-.5)*2,(tw-.5)*2);}
function dBakery(s){shadow(0,-s*.12,s*1.55,s*.26);ctx.lineWidth=Math.max(1,s*.03);ctx.lineJoin='round';
  ctx.fillStyle='#c97b5d';ctx.fillRect(s*.75,-s*2.5,s*.3,s*.6);
  ctx.fillStyle='#fff3e0';ctx.strokeStyle='#e0b48a';rr(-s*1.3,-s*1.55,s*2.6,s*1.45,s*.12);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8a5a3c';ctx.strokeStyle='#6b3f26';rr(-s*1.45,-s*2.2,s*2.9,s*.72,s*.3);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-s*1.42,-s*1.95);for(let i=0;i<=12;i++){const x=-s*1.42+i*s*.2367,dr=(i%3===1)?s*.2:s*.08;ctx.quadraticCurveTo(x-s*.11,-s*1.62-dr,x,-s*1.75);}ctx.lineTo(s*1.42,-s*2.05);ctx.quadraticCurveTo(0,-s*2.3,-s*1.42,-s*2.05);ctx.closePath();ctx.fill();
  const sp=['#ff5c8a','#5fa8f5','#ffd34d','#6fd38a','#c9a6ff'];for(let i=0;i<14;i++){ctx.save();ctx.translate(-s*1.2+hash(i,3)*s*2.4,-s*2.0+hash(i,5)*s*.22);ctx.rotate(hash(i,7)*3);ctx.fillStyle=sp[i%5];ctx.fillRect(-s*.03,-s*.01,s*.06,s*.02);ctx.restore();}
  for(let i=0;i<8;i++){const x=-s*1.3+i*s*.325;ctx.fillStyle=i%2?'#fff':'#ff7eb6';ctx.fillRect(x,-s*1.36,s*.33,s*.22);circ(x+s*.1625,-s*1.14,s*.1625);ctx.fill();}
  ctx.fillStyle='#ff9ad5';ctx.strokeStyle='#c2407e';ctx.beginPath();ctx.moveTo(-s*.32,-s*.1);ctx.lineTo(-s*.32,-s*.72);ctx.arc(0,-s*.72,s*.32,Math.PI,0);ctx.lineTo(s*.32,-s*.1);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';heartPath(0,-s*.72,s*.08);ctx.fill();ctx.fillStyle='#ffd34d';circ(s*.2,-s*.42,s*.04);ctx.fill();
  for(const wx of[-s*.85,s*.85]){ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';ctx.lineWidth=s*.05;rr(wx-s*.3,-s*.85,s*.6,s*.5,s*.08);ctx.fill();ctx.stroke();
    ctx.fillStyle='#e0b48a';ctx.fillRect(wx-s*.3,-s*.44,s*.6,s*.06);}
  drawEmoji('🧁',-s*1.0,-s*.56,s*.24);drawEmoji('🍰',-s*.72,-s*.56,s*.22);drawEmoji('🥐',s*.72,-s*.56,s*.22);drawEmoji('🍪',s*1.0,-s*.56,s*.2);
  ctx.fillStyle='#fff';ctx.strokeStyle='#ff7eb6';ctx.lineWidth=s*.04;rr(-s*.62,-s*2.5,s*1.24,s*.38,s*.12);ctx.fill();ctx.stroke();drawEmoji('🧁',0,-s*2.32,s*.34);
  drawEmoji('⭐',-s*.42,-s*2.31,s*.16);drawEmoji('⭐',s*.42,-s*2.31,s*.16);}
function aBakery(X,Y,s,t){for(let i=0;i<3;i++){const k=(t*.3+i/3)%1;ctx.fillStyle=`rgba(255,${200+Math.round(30*k)},235,${(.6*(1-k)).toFixed(3)})`;circ(X+s*.9+Math.sin(k*5+i)*s*.1+k*s*.2,Y-s*2.6-k*s*.8,s*(.07+k*.12));ctx.fill();}}
function dHeartBush(s){shadow(0,-s*.08,s*.3,s*.1);ctx.lineWidth=LW(s);ctx.fillStyle='#ff9ad5';ctx.strokeStyle='#c2407e';ctx.beginPath();ctx.moveTo(-s*.2,-s*.38);ctx.lineTo(s*.2,-s*.38);ctx.lineTo(s*.15,-s*.08);ctx.lineTo(-s*.15,-s*.08);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#8a5a36';ctx.fillRect(-s*.03,-s*.5,s*.06,s*.14);heartPath(0,-s*.82,s*.32);ctx.fillStyle='#3e9a47';ctx.fill();ctx.strokeStyle='#2c7a3a';ctx.lineWidth=s*.03;ctx.stroke();
  heartPath(-s*.03,-s*.84,s*.26);ctx.fillStyle='#55b552';ctx.fill();[[-.15,-.95],[.12,-.9],[0,-.7],[-.08,-.8],[.18,-1.0]].forEach(([a,b])=>flower(a*s,b*s,s*.032,'#ff7eb6'));}
function dCrystal(s){shadow(0,-s*.08,s*.4,s*.12);ctx.fillStyle='#b9a2d6';ctx.strokeStyle='#7d64a3';ctx.lineWidth=LW(s);rr(-s*.06,-s*.6,s*.12,s*.55,s*.03);ctx.fill();ctx.stroke();
  const C=[['#ffc2e2',-.25,-.8,.2],['#bfe6ff',.22,-.85,.2],['#e3d4ff',0,-1.15,.26],['#c8f5e3',-.15,-1.0,.15],['#fff3a8',.15,-1.12,.14]];
  for(const[c,a,b,r]of C){ctx.fillStyle=c;ctx.strokeStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.moveTo(a*s,(b-r*1.4)*s);ctx.lineTo((a+r*.7)*s,b*s);ctx.lineTo(a*s,(b+r*.9)*s);ctx.lineTo((a-r*.7)*s,b*s);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(a*s,(b-r*1.4)*s);ctx.lineTo((a-r*.7)*s,b*s);ctx.lineTo((a-r*.2)*s,b*s);ctx.closePath();ctx.fill();}}
function aGlow(X,Y,s,t,d){const k=.35+.15*Math.sin(t*2+d.x),g=glowSprite('#e3d4ff');ctx.globalAlpha=k;ctx.drawImage(g,X-s*.8,Y-s*1.75,s*1.6,s*1.6);ctx.globalAlpha=1;
  const tw=Math.sin(t*3+d.y*2);if(tw>.2)twinkle(X+s*.25,Y-s*1.3,s*.06*tw,tw);}

// ---------- Decoration catalog ----------
Object.assign(L,{playground:R('The playground! The ponies love to play here!'),pond:R('The rainbow pond! Splish, splash!'),
  bakeryReady:R('The bakery is getting ready! Come back soon!'),wish:R('Make a wish!'),letter:R('You have a letter! It says: I love you!'),
  tapSpot:R('Tap a sparkly spot to put it there!'),placed:R('Ta-da! It looks so pretty!'),moveHint:R('Tap a house or a decoration to pick it up!'),
  putHint:R('Now tap a sparkly spot to put it down!'),stored:R('It is in your treasure box now!'),cantStore:R('Houses can not go in the box. Tap a sparkly spot!'),
  moved:R('All done! It looks great there!'),needWood:R('You need more wood! Look for wood in the village.'),needCoins:R('You need more coins! Sell food at the market.'),
  needFlowers:R('You need more flowers! Pick flowers in the meadow.'),lock2:R('Rescue 3 ponies to unlock this!'),lock3:R('Rescue 5 ponies to unlock this!'),
  noSpot:R('There is no room for this. Try moving things around!')});
const DECO={
  flowers:{n:R('Flower bed'),cost:{flower:2},hg:1,multi:1,vars:4,d:dFlowerBed,tag:'flower'},
  bush:{n:R('Flower bush'),cost:{wood:1},hg:1.1,vars:4,d:dBush,tag:'flower'},
  tree:{n:R('Green tree'),cost:{wood:2},hg:1.9,d:dTree(0),tag:'tree'},
  blossom:{n:R('Blossom tree'),cost:{wood:2,flower:1},hg:1.9,d:dTree(1),tag:'tree'},
  apple:{n:R('Apple tree'),cost:{wood:2,coins:1},hg:1.9,d:dTree(2),tag:'tree'},
  fence:{n:R('Fence'),cost:{wood:1},hg:.8,multi:1,d:dFence},
  bench:{n:R('Bench'),cost:{wood:2},hg:.8,vars:4,d:dBench,tag:'sit'},
  picnic:{n:R('Picnic blanket'),cost:{coins:2},w:2,walk:1,flat:1,hg:1,d:dPicnic,tag:'sit'},
  mushroom:{n:R('Mushroom house'),cost:{coins:2},hg:1,vars:4,d:dMushroom},
  stones:{n:R('Stepping stones'),cost:{coins:1},walk:1,flat:1,multi:1,hg:1,d:dStones},
  playground:{n:R('Playground'),cost:{wood:4,coins:2},w:3,h:2,hg:2.1,sortAt:1,d:dPlayground,a:aPlayground,say:L.playground},
  pond:{n:R('Rainbow pond'),cost:{coins:4,flower:2},w:3,h:2,flat:1,hg:1.9,d:dPond,a:aPond,say:L.pond},
  bakery:{n:R('Pony bakery'),cost:{wood:4,coins:4},w:3,h:2,hg:2.7,door:1,d:dBakery,a:aBakery},
  lamp:{st:2,n:R('Lamp post'),cost:{wood:1,coins:2},hg:1.95,d:dLamp,a:aLamp},
  fountain:{st:2,n:R('Fountain'),cost:{coins:6,flower:2},w:2,h:2,hg:1.6,d:dFountain,a:aFountain,say:L.wish},
  tinyhouse:{st:2,n:R('Tiny house'),cost:{wood:3},hg:1.1,vars:4,d:dTinyHouse},
  stable:{st:2,n:R('Pony stable'),cost:{wood:5},w:3,h:2,hg:2.5,door:1,d:dStable},
  well:{st:2,n:R('Wishing well'),cost:{wood:2,coins:2},hg:1.4,d:dWell,say:L.wish},
  mailbox:{st:2,n:R('Mailbox'),cost:{wood:1,coins:1},hg:1.1,d:dMailbox,say:L.letter},
  statue:{st:3,n:R('Pony statue'),cost:{coins:8},hg:1.6,d:dStatue},
  arch:{st:3,n:R('Rainbow arch'),cost:{coins:5,flower:3},w:2,walk:1,hg:1.35,d:dArch},
  tower:{st:3,n:R('Castle tower'),cost:{wood:3,coins:5},hg:2.8,d:dTower,a:(X,Y,s,t)=>aFlag(X,Y,s,t,2.7)},
  carousel:{st:3,n:R('Pony carousel'),cost:{coins:10},w:2,h:2,hg:2.4,d:dCarousel,a:aCarousel},
  heartbush:{rare:1,n:R('Heart bush'),hg:1.25,d:dHeartBush,tag:'flower'},
  starlamp:{rare:1,n:R('Star lamp'),hg:1.85,d:s=>dLamp(s,9),a:aLamp},
  rainbowbed:{rare:1,n:R('Rainbow flower bed'),hg:1,d:s=>dFlowerBed(s,3),tag:'flower'},
  crystal:{rare:1,n:R('Crystal tree'),hg:1.6,d:dCrystal,a:aGlow,tag:'tree'},
  unistatue:{rare:1,n:R('Golden unicorn statue'),hg:1.7,d:s=>dStatue(s,9)}};
for(const k in DECO){const D=DECO[k];D.w=D.w||1;D.h=D.h||1;D.st=D.st||1;D.cost=D.cost||{};}
const RES={wood:'🪵',coins:'🪙',flower:'🌸'};
const have=r=>r==='coins'?state.coins:(state.inv[r]||0);
const canAfford=c=>Object.keys(c).every(r=>have(r)>=c[r]);
function pay(c){for(const r in c){if(r==='coins')state.coins-=c[r];else state.inv[r]-=c[r];}refreshBar(true);}
const occMap=new Map();
function occ(d){let o=occMap.get(d.id!=null?d.id:d);if(!o){o={swing:null,slide:null,pond:[],bake:[]};occMap.set(d.id!=null?d.id:d,o);}return o;}

// ---------- Decorations on the map ('Δ' marks tiles a decoration blocks) ----------
const BLOCK='Δ',GARDEN='Ψ',GAP={x:39,y:38};
function footTiles(x,y,w,h){const t=[];for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)t.push([i,j]);return t;}
const decoTiles=d=>footTiles(d.x,d.y,DECO[d.k].w,DECO[d.k].h);
function applyDeco(d){if(DECO[d.k].walk)return true;const T=decoTiles(d);if(T.some(([x,y])=>!map[y]||(map[y][x]!=='.'&&map[y][x]!==BLOCK)))return false;T.forEach(([x,y])=>map[y][x]=BLOCK);return true;}
function clearDeco(d){if(DECO[d.k].walk)return;decoTiles(d).forEach(([x,y])=>{if(map[y][x]===BLOCK)map[y][x]='.';});}
function doorOf(d){const D=DECO[d.k];return D.door?{x:d.x+Math.floor(D.w/2),y:d.y+D.h}:null;}
const originOf=d=>({x:d.x+DECO[d.k].w/2,y:d.y+DECO[d.k].h-.12});
let ver=1;const changed=()=>{ver++;};
let moveCi=-1;
function protectedSet(skipD){const P=new Set(),add=(x,y)=>P.add(x+','+y);
  state.cottages.forEach((c,i)=>{if(i!==moveCi)add(c.x+1,c.y+2);});
  S().decor.forEach(d=>{if(d!==skipD){const o=doorOf(d);if(o)add(o.x,o.y);}});
  LOG_SPOTS.forEach(([x,y])=>add(Math.floor(x),Math.floor(y)));
  SIGNS.forEach(s=>{if(inVillage(s.x,s.y)){add(Math.floor(s.x),Math.floor(s.y));add(Math.floor(s.x),Math.floor(s.y)-1);}});
  for(let x=19;x<=21;x++)for(let y=31;y<=32;y++)add(x,y);add(GAP.x-1,GAP.y);add(GAP.x,GAP.y);return P;}
function walkDecoAt(x,y,skipD){return S().decor.some(d=>d!==skipD&&DECO[d.k].walk&&x>=d.x&&x<d.x+DECO[d.k].w&&y>=d.y&&y<d.y+DECO[d.k].h);}
function decoOK(k,ax,ay,skipD,P,base){const D=DECO[k];
  if(ax<VILLAGE.x0||ay<VILLAGE.y0||ax+D.w-1>38||ay+D.h-1>VILLAGE.y1)return false;
  const T=footTiles(ax,ay,D.w,D.h);for(const[x,y]of T)if(map[y][x]!=='.'||P.has(x+','+y)||walkDecoAt(x,y,skipD))return false;
  if(D.door){const dx=ax+Math.floor(D.w/2),dy=ay+D.h;if(dy>VILLAGE.y1||!isWalkChar(map[dy][dx],true)||walkDecoAt(dx,dy,skipD))return false;}
  if(D.walk)return true;
  T.forEach(([x,y])=>map[y][x]=BLOCK);const n=villageReach();T.forEach(([x,y])=>map[y][x]='.');return n===base-T.length;}
function decoSpots(k,skipD){const D=DECO[k],P=protectedSet(skipD),base=villageReach(),out=[],gap=D.w===1&&D.h===1?1:0;
  for(let y=VILLAGE.y0;y<=VILLAGE.y1;y++)for(let x=VILLAGE.x0;x<=38;x++){
    if(out.some(o=>x<o.x+D.w+gap&&x+D.w+gap>o.x&&y<o.y+D.h+gap&&y+D.h+gap>o.y))continue;
    if(decoOK(k,x,y,skipD,P,base))out.push({x,y});}
  return out;}
function cottageSpots(){const out=[],cand=[];for(let ay=33;ay<=41;ay+=4)for(let ax=6;ax<=36;ax+=4)cand.push([ax,ay]);
  for(let ay=32;ay<=41;ay++)for(let ax=5;ax<=36;ax++)cand.push([ax,ay]);
  for(const[ax,ay]of cand){if(out.some(o=>ax<o.x+3&&ax+3>o.x&&ay<o.y+3&&ay+3>o.y))continue;if(spotOK(ax,ay))out.push({x:ax,y:ay});}return out;}
function bumpPlayer(T){const px=Math.floor(player.x),py=Math.floor(player.y);if(!T.some(([x,y])=>x===px&&y===py))return;
  for(let r=1;r<5;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(walkable(px+dx,py+dy)){player.x=px+dx+.5;player.y=py+dy+.5;player.path=[];return;}}
// cottages and decorations must not cover doors, walkable decorations or the hidden path
const prevSpotOK=spotOK;
spotOK=function(ax,ay){if(state.vil){const P=protectedSet(null);for(const[x,y]of cottageTiles(ax,ay))if(P.has(x+','+y)||walkDecoAt(x,y))return false;}return prevSpotOK(ax,ay);};

// ---------- Drawing decorations ----------
function fenceMask(d){const f=(x)=>S().decor.some(o=>o.k==='fence'&&o.y===d.y&&o.x===x&&o!==hold());return(f(d.x-1)?1:0)|(f(d.x+1)?2:0);}
function decoSprite(d){const D=DECO[d.k],s=ts,m=d.k==='fence'?fenceMask(d):(d.v||0),w=(D.w+1.3)*s,h=(D.hg+.6)*s;
  return getSprite('vd|'+d.k+'|'+m,w,h,w/2,(D.hg+.32)*s,()=>{ctx.lineCap='round';ctx.lineJoin='round';D.d(s,m);});}
function drawDeco(d,t,lift){const D=DECO[d.k],o=originOf(d),X=SX(o.x),Y=SY(o.y)-(lift||0),age=t-(d.t||0),spr=decoSprite(d);
  if(age>=0&&age<.6){const k=Math.max(.05,1+2.2*Math.pow(age/.6-1,3)+1.5*Math.pow(age/.6-1,2));ctx.save();ctx.translate(X,Y);ctx.scale(k,k);drawSprite(spr,0,0);ctx.restore();}
  else drawSprite(spr,X,Y);
  if(D.a)D.a(X,Y,ts,t,d);}
function decoPic(k){return pic('dp|'+k,220,220,(w,h)=>{const D=DECO[k],s=ts,z=Math.min(w/((D.w+.9)*s),h/((D.hg+.6)*s));
  ctx.translate(w/2,h-.3*s*z);ctx.scale(z,z);ctx.lineCap='round';ctx.lineJoin='round';D.d(s,k==='fence'?3:0);if(D.a)D.a(0,0,s,1.3,{x:0,y:0,k});});}

// ---------- Placing and moving ----------
let mode=null;
const hold=()=>mode&&mode.hold&&mode.hold.t==='d'?mode.hold.d:null;
function startPlace(k,src){closeC2();closePonyMenu();const spots=decoSpots(k);
  if(!spots.length){sfx('nope');say(L.noSpot,'narrator');return;}
  mode={t:'place',k,src,spots};sfx('tap');say(L.tapSpot,'narrator');refreshBar(true);}
function varFor(k){const D=DECO[k];if(!D.vars)return 0;S().vc=((S().vc||0)+1)%97;return S().vc%D.vars;}
function placeTap(wx,wy){const k=mode.k,D=DECO[k],P=protectedSet(null),base=villageReach();
  let ax=Math.round(wx-D.w/2),ay=Math.round(wy-D.h/2),ok=decoOK(k,ax,ay,null,P,base);
  if(!ok){let b=null,bd=1.7;for(const s of mode.spots){const dd=dist(wx,wy,s.x+D.w/2,s.y+D.h/2);if(dd<bd){bd=dd;b=s;}}if(b&&decoOK(k,b.x,b.y,null,P,base)){ax=b.x;ay=b.y;ok=true;}}
  if(!ok){sfx('nope');say(N2.badSpot,'narrator');return;}
  if(mode.src==='buy'){if(!canAfford(D.cost)){mode=null;refreshBar(true);return;}pay(D.cost);}
  else{S().store[k]=(S().store[k]||1)-1;if(S().store[k]<=0)delete S().store[k];}
  const d={id:S().nextId++,k,x:ax,y:ay,v:varFor(k),t:state.time};S().decor.push(d);applyDeco(d);bumpPlayer(decoTiles(d));changed();
  const o=originOf(d);sfx('pop');setTimeout(()=>sfx('sparkle'),150);burst(o.x,o.y-.6,'✨',10,1);
  const again=D.multi&&(mode.src==='buy'?canAfford(D.cost):S().store[k]>0);
  if(again)mode.spots=decoSpots(k);else{mode=null;say(L.placed,'narrator');}
  refreshBar(true);saveGame();}
function hitObject(wx,wy){let best=null;
  state.cottages.forEach((c,i)=>{if(wx>=c.x-.2&&wx<=c.x+3.2&&wy>=c.y-1.3&&wy<=c.y+2.1){const y=c.y+2;if(!best||y>best.y)best={t:'c',ci:i,y};}});
  S().decor.forEach(d=>{const D=DECO[d.k];if(wx>=d.x-.1&&wx<=d.x+D.w+.1&&wy>=d.y+D.h-Math.max(D.h,D.hg)-.1&&wy<=d.y+D.h+.1){const y=d.y+D.h+(D.flat?-1:0);if(!best||y>best.y)best={t:'d',d,y};}});
  return best;}
function startMove(){closeC2();closePonyMenu();mode={t:'move',hold:null,spots:[]};sfx('tap');say(L.moveHint,'narrator');refreshBar(true);}
function moveTap(wx,wy){
  if(!mode.hold){const h=hitObject(wx,wy);if(!h){sfx('nope');say(L.moveHint,'narrator');return;}
    if(h.t==='c'){const c=state.cottages[h.ci];cottageTiles(c.x,c.y).forEach(([x,y])=>{if(map[y][x]==='Y')map[y][x]='.';});moveCi=h.ci;
      mode.hold={t:'c',ci:h.ci,ox:c.x,oy:c.y};mode.spots=cottageSpots();}
    else{clearDeco(h.d);mode.hold={t:'d',d:h.d,ox:h.d.x,oy:h.d.y};mode.spots=decoSpots(h.d.k,h.d);}
    sfx('pop');say(L.putHint,'narrator');refreshBar(true);return;}
  const H=mode.hold;
  if(H.t==='c'){let ax=Math.round(wx-1.5),ay=Math.round(wy-1),ok=ax>=5&&ay>=32&&spotOK(ax,ay);
    if(!ok){let b=null,bd=2.2;for(const s of mode.spots){const dd=dist(wx,wy,s.x+1.5,s.y+1);if(dd<bd){bd=dd;b=s;}}if(b){ax=b.x;ay=b.y;ok=spotOK(ax,ay);}}
    if(!ok){sfx('nope');say(N2.badSpot,'narrator');return;}
    const c=state.cottages[H.ci];c.x=ax;c.y=ay;c.built=state.time;applyCottage(c);moveCi=-1;bumpPlayer(cottageTiles(ax,ay));
    if(c.pony&&ents[c.pony]){ents[c.pony].tx=null;}[0,200,400].forEach(ms=>setTimeout(()=>sfx('crunch'),ms));burst(ax+1.5,ay+1.2,'✨',12,1.2);}
  else{const d=H.d,D=DECO[d.k],P=protectedSet(d),base=villageReach();let ax=Math.round(wx-D.w/2),ay=Math.round(wy-D.h/2),ok=decoOK(d.k,ax,ay,d,P,base);
    if(!ok){let b=null,bd=1.7;for(const s of mode.spots){const dd=dist(wx,wy,s.x+D.w/2,s.y+D.h/2);if(dd<bd){bd=dd;b=s;}}if(b&&decoOK(d.k,b.x,b.y,d,P,base)){ax=b.x;ay=b.y;ok=true;}}
    if(!ok){sfx('nope');say(N2.badSpot,'narrator');return;}
    d.x=ax;d.y=ay;d.t=state.time;applyDeco(d);bumpPlayer(decoTiles(d));const o=originOf(d);sfx('pop');burst(o.x,o.y-.6,'✨',8,.9);}
  mode.hold=null;mode.spots=[];changed();saveGame();say(L.moved,'narrator');refreshBar(true);}
function putBack(){const H=mode&&mode.hold;if(!H)return;
  if(H.t==='c'){const c=state.cottages[H.ci];c.x=H.ox;c.y=H.oy;applyCottage(c);moveCi=-1;}else{H.d.x=H.ox;H.d.y=H.oy;applyDeco(H.d);}
  mode.hold=null;changed();}
function storeHeld(){const H=mode&&mode.hold;if(!H)return;if(H.t!=='d'){sfx('nope');say(L.cantStore,'narrator');return;}
  const d=H.d,i=S().decor.indexOf(d);if(i>=0)S().decor.splice(i,1);S().store[d.k]=(S().store[d.k]||0)+1;occMap.delete(d.id);
  mode.hold=null;mode.spots=[];changed();sfx('pop');burst(player.x,player.y-1,'📦',3,.6);say(L.stored,'narrator');refreshBar(true);saveGame();}
function endMode(){if(mode&&mode.hold)putBack();mode=null;moveCi=-1;refreshBar(true);saveGame();}

// ---------- Decorate menu, shop, painting, naming ----------
Object.assign(L,{decoTitle:R('Decorate your village! What do you want to do?'),cShop:R('Add decorations'),cMove:R('Move things'),cPaint:R('Paint the houses'),
  cName:R('Name your village'),shopTitle:R('Pick a decoration! Then tap a sparkly spot.'),boxSec:R('Your treasure box. These are free!'),
  sec1:R('Meadow things'),sec2:R('Village things'),sec3:R('Kingdom things'),paintPick:R('Which house do you want to paint?'),
  paintTitle:R('Paint the house! Tap the pictures.'),nameTitle:R('What should we name your village?'),named:R('What a wonderful name for your village!'),
  stage1:R('Your village is a little meadow. Rescue 3 ponies to make it a village!'),stage2:R('Your village is a real village! Rescue 5 ponies to make it a kingdom!'),
  stage3:R('Your village is a Pony Kingdom! Hooray!'),kingdomSign:R('Pony Kingdom'),noHouses:R('Build a house with the hammer first!')});
const stageV=()=>Math.max(1,S().stage||0);
let newDeco=false;
function openDecorate(){if(mode){endMode();return;}closePonyMenu();newDeco=false;const st=stageV();
  const card=(c,e,t,sy)=>`<div class="vilCard" data-c="${c}" data-say="${sy}"><span class="e">${e}</span>${t}</div>`;
  openC2(`<h2 data-say="${L.decoTitle}">🖌️ Decorate</h2>
    <div class="sell" data-say="${L['stage'+st]}"><span class="what">${['','🌼','🏡','🏰'][st]}</span><b>${['','Meadow','Village','Kingdom'][st]}</b></div>
    <div class="vilHub">${card('shop','🛍️','Add decorations',L.cShop)}${card('move','✋','Move things',L.cMove)}${card('paint','🎨','Paint the houses',L.cPaint)}${card('name','🪧','Name your village',L.cName)}</div>`);
  say(L.decoTitle,'narrator',$('c2body').querySelector('h2'));
  $('c2body').querySelectorAll('.vilCard').forEach(el=>el.onclick=()=>{initAudio();sfx('tap');const c=el.dataset.c;
    if(c==='shop')openShop();else if(c==='move')startMove();else if(c==='paint')openPaint();else openNaming();});}
function costHTML(c){return`<div class="vilCost">${Object.keys(c).map(r=>`<span class="${have(r)>=c[r]?'':'no'}">${RES[r]} ${c[r]}</span>`).join('')||'<span>🎁</span>'}</div>`;}
function openShop(){const st=stageV(),store=S().store;
  const card=(k,src)=>{const D=DECO[k],lock=src==='buy'&&D.st>st,ok=src==='store'||canAfford(D.cost);
    return`<div class="item pick vilIt ${lock?'vilLock':''} ${!lock&&!ok?'cant':''}" data-k="${k}" data-src="${src}" data-say="${D.n}"><img class="por" src="${decoPic(k)}" alt="">
      ${src==='store'?`<span class="vilN">×${store[k]}</span><div class="vilCost"><span>🎁</span></div>`:lock?'<span class="vilBadge">🔒</span>':costHTML(D.cost)}</div>`;};
  const sec=(n,ks)=>ks.length?`<div class="vilSec" data-say="${L['sec'+n]}">${['','🌼 Meadow things','🏡 Village things','🏰 Kingdom things'][n]}</div><div class="items">${ks.map(k=>card(k,'buy')).join('')}</div>`:'';
  const sk=Object.keys(store).filter(k=>DECO[k]&&store[k]>0),buy=s=>Object.keys(DECO).filter(k=>!DECO[k].rare&&DECO[k].st===s);
  openC2(`<h2 data-say="${L.shopTitle}">🛍️ Decorations</h2>
    ${sk.length?`<div class="vilSec" data-say="${L.boxSec}">📦 Treasure box</div><div class="items">${sk.map(k=>card(k,'store')).join('')}</div>`:''}
    ${sec(1,buy(1))}${sec(2,buy(2))}${sec(3,buy(3))}`);
  say(L.shopTitle,'narrator',$('c2body').querySelector('h2'));
  $('c2body').querySelectorAll('.vilIt').forEach(el=>el.onclick=()=>{initAudio();const k=el.dataset.k,src=el.dataset.src,D=DECO[k];
    if(src==='buy'){if(D.st>st){sfx('nope');say(D.st>=3?L.lock3:L.lock2,'narrator');return;}
      if(!canAfford(D.cost)){sfx('nope');const r=Object.keys(D.cost).find(r=>have(r)<D.cost[r]);say(r==='wood'?L.needWood:r==='coins'?L.needCoins:L.needFlowers,'narrator');return;}}
    startPlace(k,src);});}
// more cottage colors, door colors, roof patterns and front-yard decorations
const MORE_COLORS=[{id:'vmint',name:'Mint cottage',wall:'#e6fff3',roof:'#4fc99a'},{id:'vpeach',name:'Peach cottage',wall:'#fff1e6',roof:'#ff8a5c'},
  {id:'vsnow',name:'Snowy cottage',wall:'#ffffff',roof:'#9fb3dc'},{id:'vberry',name:'Strawberry cottage',wall:'#fff0f2',roof:'#ff5c6c'},
  {id:'vsky',name:'Sky cottage',wall:'#eef9ff',roof:'#4fc3f7'},{id:'vlilac',name:'Lilac cottage',wall:'#fbefff',roof:'#d07de8'}];
MORE_COLORS.forEach(c=>{if(!COTTAGE_COLORS.some(o=>o.id===c.id)){COTTAGE_COLORS.push(c);reg('narrator',c.name);}});
const DOORS=[['#b5713f',R('Wooden door')],['#ff7eb6',R('Pink door')],['#9b6cf0',R('Purple door')],['#5fa8f5',R('Blue door')],['#ffd34d',R('Yellow door')],
  ['#5fcf8a',R('Green door')],['#ff5c5c',R('Red door')],['#ffffff',R('White door')]];
const ROOFS={plain:R('Plain roof'),stripes:R('Stripy roof'),hearts:R('Heart roof'),stars:R('Star roof'),dots:R('Polka dot roof'),shingles:R('Shingle roof'),rainbow:R('Rainbow roof')};
const FRONTS={none:{n:R('Just the house'),e:'🏠'},tulips:{n:R('Tulips'),e:'🌷'},sunflowers:{n:R('Sunflowers'),e:'🌻'},roses:{n:R('Rose bushes'),e:'🌹'},
  lights:{n:R('Fairy lights'),e:'💡'},hearts:{n:R('Heart garland'),e:'💕'}};
const colObj=c=>Object.assign({},COT(c.color),{vd:c.vd,vr:c.vr,vf:c.vf});
function cottageImg(col,name,w,s){const cv=document.createElement('canvas');cv.width=cv.height=w;const g=cv.getContext('2d'),sC=ctx;
  try{ctx=g;drawCottageAt(w/2,w*.9,s,col,name,1);}finally{ctx=sC;}return cv.toDataURL();}
function openPaint(){const C=state.cottages;if(!C.length){sfx('nope');say(L.noHouses,'narrator');return;}if(C.length===1)return openCottage(0);
  openC2(`<h2 data-say="${L.paintPick}">🎨 Paint a house</h2><div class="items">${C.map((c,i)=>`<div class="item pick vilIt" data-i="${i}" ${c.pony?`data-say="${ponyName(c.pony)}"`:''}>
    <img class="por" src="${cottageImg(colObj(c),null,200,52)}" alt=""><span class="nm">${c.pony?ponyName(c.pony):'🏠'}</span></div>`).join('')}</div>`);
  say(L.paintPick,'narrator',$('c2body').querySelector('h2'));
  $('c2body').querySelectorAll('.vilIt').forEach(el=>el.onclick=()=>{initAudio();sfx('tap');openCottage(+el.dataset.i);});}
function openCottage(ci){const c=state.cottages[ci];if(!c)return;
  const roofPic=k=>`<img src="${pic('rf'+k+c.color,128,128,(w,h)=>drawCottageAt(64,120,34,Object.assign({},COT(c.color),{vr:k}),null,1))}" alt="">`;
  openEditor({title:'🎨 Paint the House',say:L.paintTitle,img:()=>cottageImg(colObj(c),c.pony&&ponyName(c.pony),250,62),tabs:[
    {icon:'🖍️',say:R('Pick a color!'),sel:()=>c.color,pick:o=>{c.color=o.key;},items:()=>COTTAGE_COLORS.map(k=>({key:k.id,name:k.name,html:sw(`linear-gradient(${k.roof} 0 50%,${k.wall} 50% 100%)`)}))},
    {icon:'🚪',say:R('Pick a door!'),sel:()=>c.vd||'#b5713f',pick:o=>{c.vd=o.key==='#b5713f'?null:o.key;},items:()=>DOORS.map(([k,n])=>({key:k,name:n,html:sw(k)}))},
    {icon:'🏠',say:R('Pick a roof!'),sel:()=>c.vr||'plain',pick:o=>{c.vr=o.key==='plain'?null:o.key;},items:()=>Object.keys(ROOFS).map(k=>({key:k,name:ROOFS[k],html:roofPic(k)}))},
    {icon:'🌷',say:R('Pick some flowers!'),sel:()=>c.vf||'none',pick:o=>{c.vf=o.key==='none'?null:o.key;},items:()=>Object.keys(FRONTS).map(k=>({key:k,name:FRONTS[k].n,html:`<span>${FRONTS[k].e}</span>`}))}]});}
const VNAMES=[['🌈','Rainbow Village','Rainbow Kingdom'],['✨','Sparkle Village','Sparkle Kingdom'],['⭐','Starlight Village','Starlight Kingdom'],
  ['🧁','Cupcake Village','Cupcake Kingdom'],['💖','Heart Village','Heart Kingdom'],['🌸','Flower Village','Flower Kingdom'],['🦄','Unicorn Village','Unicorn Kingdom'],
  ['🐴','Pony Village','Pony Kingdom']].map(([e,n,k])=>({e,n:R(n),k:R(k)}));
function signText(){const v=S(),k3=(v.stage||0)>=3;if(v.name)return k3&&v.nameK?v.nameK:v.name;return k3?L.kingdomSign:N2.villageSign;}
function openNaming(){const k3=stageV()>=3,cur=signText();
  openC2(`<h2 data-say="${L.nameTitle}">🪧 Name your village</h2><div class="vilNames">${VNAMES.map((o,i)=>{const t=k3?o.k:o.n;
    return`<div class="vilName ${cur===t?'sel':''}" data-i="${i}" data-say="${t}"><span class="e">${o.e}</span>${t}</div>`;}).join('')}</div>
    <div class="row"><button class="small" id="vilTypeV">✏️ Type a name (grown-ups)</button></div>`);
  say(L.nameTitle,'narrator',$('c2body').querySelector('h2'));
  const done=(n,k)=>{S().name=n;S().nameK=k||null;closeC2();sfx('fanfare');celebrate(true);const sg=SIGNS.find(s=>s.village);sg.text=signText();
    burst(sg.x,sg.y-1,'✨',12,1.2);sg.hit=state.time;saveGame();setTimeout(()=>say(L.named,'narrator'),300);};
  $('c2body').querySelectorAll('.vilName').forEach(el=>el.onclick=()=>{initAudio();const o=VNAMES[+el.dataset.i];done(o.n,o.k);});
  $('vilTypeV').onclick=()=>{say(L.typeName,'narrator');const n=(prompt('Type a name for the village:')||'').trim().slice(0,22);if(n)done(n,null);};}

// ---------- Cottage outsides: wraps drawCottage / drawCottageAt ----------
let curC=null;
const prevDC=drawCottage;
drawCottage=function(c,t){curC=c;try{prevDC(c,t);}finally{curC=null;}};
const prevDCA=drawCottageAt;
drawCottageAt=function(bx,by,s,col,name,k){const ex=curC||col||{};
  if(!(ex.vd||(ex.vr&&ex.vr!=='plain')||(ex.vf&&ex.vf!=='none')))return prevDCA(bx,by,s,col,name,k);
  prevDCA(bx,by,s,col,null,k);ctx.save();ctx.translate(bx,by);ctx.scale(k,k);ctx.lineCap='round';ctx.lineJoin='round';
  try{cottageExtras(s,col,ex);
    if(name){ctx.font=`bold ${Math.round(s*.24)}px "Chalkboard SE","Comic Sans MS",sans-serif`;const tw=ctx.measureText(name).width+s*.24;
      ctx.fillStyle='#fff';ctx.strokeStyle=col.roof;ctx.lineWidth=s*.04;rr(-tw/2,-s*1.72,tw,s*.34,s*.1);ctx.fill();ctx.stroke();
      ctx.fillStyle='#d94f9b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,0,-s*1.54);}}
  finally{ctx.restore();}};
function cottageExtras(s,col,ex){const T=nowS(),vr=ex.vr;
  if(vr&&vr!=='plain'){const roof=()=>{ctx.beginPath();ctx.moveTo(-s*1.6,-s*1.3);ctx.quadraticCurveTo(0,-s*2.95,s*1.6,-s*1.3);ctx.closePath();};
    ctx.save();roof();ctx.clip();
    if(vr==='rainbow'){ctx.lineWidth=s*.14;ctx.lineCap='butt';STARS.forEach((st,i)=>{const o=(i+.5)*s*.13;ctx.strokeStyle=st.c;ctx.beginPath();ctx.moveTo(-s*1.8,-s*1.2+o);ctx.quadraticCurveTo(0,-s*2.95+o,s*1.8,-s*1.2+o);ctx.stroke();});}
    else if(vr==='stripes'){ctx.fillStyle='rgba(255,255,255,.32)';for(let x=-1.6;x<1.6;x+=.42)ctx.fillRect(x*s,-s*3,s*.2,s*2);}
    else if(vr==='shingles'){ctx.strokeStyle=shadeHex(col.roof,-.28);ctx.lineWidth=s*.025;for(let r=0;r<5;r++){const y=-s*(2.1-r*.18);for(let i=-9;i<10;i++){ctx.beginPath();ctx.arc(i*s*.2+(r%2)*s*.1,y,s*.1,0,Math.PI);ctx.stroke();}}}
    else{ctx.fillStyle=vr==='dots'?'rgba(255,255,255,.45)':'rgba(255,255,255,.6)';
      for(let r=0;r<4;r++)for(let i=-4;i<=4;i++){const x=(i*.38+(r%2)*.19)*s,y=-s*(2.0-r*.2);
        if(vr==='hearts')heartPath(x,y,s*.06);else if(vr==='stars')starPath(x,y,s*.075);else circ(x,y,s*.05);ctx.fill();}}
    ctx.restore();}
  if(ex.vd){const dc=ex.vd;ctx.fillStyle=dc;ctx.strokeStyle=shadeHex(dc==='#ffffff'?'#d0c0e0':dc,-.35);ctx.lineWidth=Math.max(1,s*.04);
    ctx.beginPath();ctx.moveTo(-s*.32,0);ctx.lineTo(-s*.32,-s*.72);ctx.arc(0,-s*.72,s*.32,Math.PI,0);ctx.lineTo(s*.32,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.7)';heartPath(0,-s*.7,s*.08);ctx.fill();ctx.fillStyle='#ffd34d';circ(s*.18,-s*.38,s*.05);ctx.fill();}
  const vf=ex.vf;if(!vf||vf==='none')return;
  if(vf==='tulips')[-1.12,-.86,-.6,.6,.86,1.12].forEach((x,i)=>drawEmoji('🌷',x*s,-s*(.13+(i%2)*.03),s*.3));
  else if(vf==='sunflowers')for(const x of[-1.45,1.45]){ctx.strokeStyle='#4f9a3e';ctx.lineWidth=s*.04;line(x*s,0,x*s,-s*.75);ctx.fillStyle='#5fb45a';ell(x*s+s*.08,-s*.4,s*.08,s*.035);ctx.fill();drawEmoji('🌻',x*s,-s*.85,s*.42);}
  else if(vf==='roses')for(const x of[-.62,.62]){ctx.fillStyle='#3e9a47';for(const[a,b,r]of[[-.1,-.1,.12],[.1,-.1,.12],[0,-.22,.13]]){circ((x+a)*s,b*s,r*s);ctx.fill();}
    ctx.fillStyle='#55b552';circ((x-.03)*s,-s*.24,s*.08);ctx.fill();[[-.1,-.15],[.08,-.25],[.12,-.08],[-.02,-.3]].forEach(([a,b],i)=>{ctx.fillStyle=i%2?'#ff5c8a':'#ff9ad5';circ((x+a)*s,b*s,s*.045);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';circ((x+a-.01)*s,(b-.01)*s,s*.015);ctx.fill();});}
  else if(vf==='lights'){ctx.strokeStyle='#4a6a3a';ctx.lineWidth=Math.max(1,s*.015);ctx.beginPath();ctx.moveTo(-s*1.5,-s*1.34);ctx.quadraticCurveTo(0,-s*1.1,s*1.5,-s*1.34);ctx.stroke();
    for(let i=0;i<9;i++){const u=(i+.5)/9,x=-1.5*s+3*s*u,y=(1-u)*(1-u)*-1.34*s+2*u*(1-u)*-1.1*s+u*u*-1.34*s+s*.05,on=Math.floor(T*2+i)%2===0,c=STARS[i%7].c;
      if(on){const g=glowSprite(c);ctx.globalAlpha=.6;ctx.drawImage(g,x-s*.15,y-s*.15,s*.3,s*.3);ctx.globalAlpha=1;}ctx.fillStyle=c;ell(x,y,s*.04,s*.055);ctx.fill();}}
  else if(vf==='hearts')for(let i=0;i<5;i++){const a=Math.PI*(1.1+i*.2),x=Math.cos(a)*s*.48,y=-s*.72+Math.sin(a)*s*.48;ctx.fillStyle=i%2?'#ff9ad5':'#ff5c8a';heartPath(x,y,s*.07);ctx.fill();}}

// ---------- Village growth: stepping-stone paths, entrance arch / castle gate, flags ----------
let pathCache={ver:-1};
const PASTEL=['#ffc9c9','#ffdcb8','#fff1a8','#c9f2c9','#c4e3ff','#dccfff','#ffc9ec'];
function pathTiles(){const st=S().stage||0,n=state.cottages.length;if(pathCache.ver===ver&&pathCache.st===st&&pathCache.n===n)return pathCache.tiles;
  const set=new Set(),doors=state.cottages.map(c=>[c.x+1,c.y+2]);S().decor.forEach(d=>{const o=doorOf(d);if(o)doors.push([o.x,o.y]);});
  if(st>=2)for(const[x,y]of doors)for(const p of bfsTiles(x,y,20,32))if(map[p.y][p.x]==='.'&&!walkDecoAt(p.x,p.y))set.add(p.x+','+p.y);
  pathCache={ver,st,n,tiles:[...set].map(k=>k.split(',').map(Number))};return pathCache.tiles;}
function drawPaths(x0,y0,x1,y1){const st=S().stage||0;if(st<2)return;const s=ts,k3=st>=3;
  for(const[x,y]of pathTiles()){if(x<x0-1||x>x1+1||y<y0-1||y>y1+1)continue;const h=hash(x,y);
    for(let i=0;i<2;i++){const px=SX(x)+s*(.3+.4*i+(hash(x+i,y)-.5)*.15),py=SY(y)+s*(.33+.34*((i+Math.floor(h*2))%2)),r=s*(.13+hash(x,y+i)*.04);
      ctx.fillStyle='rgba(60,80,30,.2)';ell(px,py+r*.28,r,r*.62);ctx.fill();ctx.fillStyle=k3?PASTEL[(x*3+y+i)%7]:'#efe8da';ell(px,py,r,r*.62);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.6)';ell(px-r*.25,py-r*.2,r*.45,r*.22);ctx.fill();}}}
function drawEntrance(t){const st=S().stage||0,s=ts,X=SX(20.5),Y=SY(32.05);ctx.lineCap='round';ctx.lineJoin='round';
  if(st===2){shadow(X-s*.75,Y,s*.2,s*.06);shadow(X+s*.75,Y,s*.2,s*.06);
    const arch=()=>{ctx.beginPath();ctx.moveTo(X-s*.75,Y);ctx.lineTo(X-s*.75,Y-s*1.15);ctx.arc(X,Y-s*1.15,s*.75,Math.PI,0);ctx.lineTo(X+s*.75,Y);};
    arch();ctx.strokeStyle='#c9b8d8';ctx.lineWidth=s*.2;ctx.stroke();arch();ctx.strokeStyle='#fff';ctx.lineWidth=s*.14;ctx.stroke();
    ctx.strokeStyle='#5fb45a';ctx.lineWidth=s*.04;ctx.beginPath();for(let i=0;i<=24;i++){const u=i/24,a=Math.PI+u*Math.PI,x=X+Math.cos(a)*s*.75+Math.sin(u*40)*s*.04,y=Y-s*1.15+Math.sin(a)*s*.75;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    const C=['#ff7eb6','#fff','#ffd34d','#c9a6ff'];for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;flower(X+Math.cos(a)*s*.75,Y-s*1.15+Math.sin(a)*s*.75,s*.055,C[i%4]);}
    for(const sd of[-1,1])for(let j=0;j<3;j++)flower(X+sd*s*.75,Y-s*(.25+j*.33),s*.05,C[(j+1)%4]);
    ctx.fillStyle='#ff5c8a';heartPath(X,Y-s*1.98,s*.14);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.03;ctx.stroke();}
  else if(st>=3){for(const sd of[-1,1]){const tx=X+sd*s*.98;shadow(tx,Y,s*.38,s*.1);ctx.fillStyle='#f6eefc';ctx.strokeStyle='#c4a0e8';ctx.lineWidth=s*.03;rr(tx-s*.3,Y-s*1.6,s*.6,s*1.6,s*.05);ctx.fill();ctx.stroke();
      for(let i=0;i<3;i++){rr(tx-s*.34+i*s*.24,Y-s*1.75,s*.2,s*.2,s*.03);ctx.fill();ctx.stroke();}
      ctx.fillStyle='#ff9ad5';ctx.beginPath();ctx.moveTo(tx-s*.36,Y-s*1.7);ctx.lineTo(tx,Y-s*2.3);ctx.lineTo(tx+s*.36,Y-s*1.7);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';ctx.lineWidth=s*.04;rr(tx-s*.09,Y-s*1.2,s*.18,s*.3,s*.09);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#8a6aa0';ctx.lineWidth=s*.025;line(tx,Y-s*2.3,tx,Y-s*2.6);aFlag(tx,Y,s,t,2.6,sd<0?'#ff7eb6':'#9b6cf0');}
    ctx.fillStyle='#f6eefc';ctx.strokeStyle='#c4a0e8';ctx.lineWidth=s*.03;ctx.beginPath();ctx.moveTo(X-s*.7,Y-s*1.5);ctx.lineTo(X+s*.7,Y-s*1.5);ctx.lineTo(X+s*.7,Y-s*.85);
    ctx.arc(X,Y-s*.85,s*.7,0,Math.PI,true);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<4;i++){rr(X-s*.68+i*s*.38,Y-s*1.67,s*.22,s*.2,s*.03);ctx.fill();ctx.stroke();}
    drawEmoji('👑',X,Y-s*1.26,s*.36);STARS.forEach((c,i)=>{ctx.strokeStyle=c.c;ctx.lineWidth=s*.035;ctx.beginPath();ctx.arc(X,Y-s*.85,s*(.66-i*.035),Math.PI,0);ctx.stroke();});}}
const FLAGS=[[7.5,'#ff7eb6'],[12.5,'#ffd34d'],[28.5,'#9fd3ff'],[33.5,'#c9a6ff']];
function drawFlag(x,col,t){const s=ts,X=SX(x),Y=SY(31.0);ctx.strokeStyle='#8a6aa0';ctx.lineWidth=s*.04;ctx.lineCap='round';line(X,Y,X,Y-s*1.6);
  ctx.fillStyle='#ffd34d';circ(X,Y-s*1.62,s*.05);ctx.fill();const w=Math.sin(t*4+x)*s*.06;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(X,Y-s*1.55);
  ctx.quadraticCurveTo(X+s*.3,Y-s*1.6+w,X+s*.55,Y-s*1.42+w);ctx.quadraticCurveTo(X+s*.3,Y-s*1.3+w,X,Y-s*1.22);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';drawStar(X+s*.2,Y-s*1.4+w*.6,s*.05,'#fff',false);}
function stageUpdate(){const v=S(),now=stageNow();if(now<=(v.stage||0))return;
  if(now===1){v.stage=1;return;}
  if(state.cottages.length<3||!inVillage(player.x,player.y)||dlgOpen||mode||$('c2modal').classList.contains('show'))return;
  v.stage=now;newDeco=true;changed();celebrate();sfx('fanfare');burst(20.5,32,'🎉',14,1.5);saveGame();
  talk(now>=3?[['narrator','Wow! Five ponies live here now! Your village grew into a Pony Kingdom!'],['narrator','Look at the castle gate, the flags and the rainbow paths!'],
      ['narrator','New decorations are ready! Tap the paint brush to see them.']]
    :[['narrator','Hooray! Three ponies live here now! Your Pony Village is a real village!'],['narrator','Look! A flower arch and little stone paths!'],
      ['narrator','New decorations are ready! Tap the paint brush to see them.']]);}

// ---------- Village life: personalities and activities ----------
// Ponies pick favourite things to do. Other modules can add personalities: VIL_PERSONA[id]={likes:[...]}.
const VIL_PERSONA={twinkle:{likes:['garden','snack','playground']},peaches:{likes:['playground','pond']},puff:{likes:['follow','playground','pond']},
  moonbeam:{likes:['nap','garden']},sugarplum:{likes:['bakery','playground']}};
window.VIL_PERSONA=VIL_PERSONA;
const DEF_LIKES=['pond','playground','visit','garden','nap'];
let lifePause=0,lifeSayAt=0;
window.vilPauseLife=sec=>{lifePause=state.time+(sec||10);for(const id of PONY_IDS)if(ents[id])endAct(id,ents[id]);};
const decoOf=k=>S().decor.filter(d=>d.k===k&&d!==hold());
const modalOpen=()=>$('c2modal').classList.contains('show');
function lifeOK(id,e,t){return!!state.ponies[id]&&!!e&&state.follower!==id&&!(hide&&id==='puff')&&!(e.visitUntil>t)&&!e.goHome&&menuPony!==id&&!(e.pause>t)
  &&areaAt(e.x,e.y)==='valley'&&homeOf(id).y>=30&&homeOf(id).y<48&&t>lifePause&&!flight;}
function lifeSay(id,text){const e=ents[id],t=state.time;if(t<lifeSayAt||dlgOpen||modalOpen()||speaking()||dist(e.x,e.y,player.x,player.y)>5||!onScreen(e.x,e.y))return;lifeSayAt=t+22;say(text,id);}
function avail(k,id){const pl=inVillage(player.x,player.y)&&!inClouds(player.x),e=ents[id];
  if(k==='playground')return decoOf('playground').some(d=>{const o=occ(d);return!o.swing||!o.slide;});
  if(k==='pond')return decoOf('pond').some(d=>occ(d).pond.length<3);
  if(k==='bakery')return decoOf('bakery').length>0;
  if(k==='follow'||k==='snack')return pl&&dist(e.x,e.y,player.x,player.y)<12&&!dlgOpen;
  if(k==='visit')return S().decor.some(d=>!DECO[d.k].flat&&d!==hold());
  return k==='garden'||k==='nap';}
function planAct(id,e,t){const likes=(VIL_PERSONA[id]&&VIL_PERSONA[id].likes)||DEF_LIKES;let k=null;
  for(const l of likes)if(Math.random()<.55&&avail(l,id)){k=l;break;}
  if(!k)k=pick(DEF_LIKES.filter(l=>avail(l,id)));startAct(id,e,k,t);}
const clampV=(x,y)=>({x:clamp(x,4.6,38.4),y:clamp(y,31.4,44.6)});
function startAct(id,e,k,t){let a=null;
  if(k==='follow'){e.visitUntil=t+16;e.vNext=t+rand(40,60);return;}
  if(k==='playground'){const d=pick(decoOf('playground').filter(d=>{const o=occ(d);return!o.swing||!o.slide;})),o=occ(d),og=originOf(d);
    const slot=!o.swing&&(o.slide||Math.random()<.5)?'swing':'slide';o[slot]=id;a={k:slot,d,tx:og.x+(slot==='swing'?PG.px:.6),ty:og.y+.3};}
  else if(k==='pond'){const d=pick(decoOf('pond').filter(d=>occ(d).pond.length<3)),o=occ(d),og=originOf(d),i=[0,1,2].find(i=>!o.pond.some(p=>p.i===i));
    o.pond.push({id,i});a={k:'pond',d,tx:og.x+[-.6,.55,0][i],ty:og.y-[.75,.62,1.12][i]};}
  else if(k==='bakery'){const d=pick(decoOf('bakery')),og=originOf(d);a={k:'bakery',d,tx:og.x+(Math.random()<.5?-1:1)*rand(.7,1.2),ty:og.y+.45};}
  else if(k==='garden'){const fl=S().decor.filter(d=>DECO[d.k].tag==='flower'&&d!==hold()),d=fl.length?pick(fl):null,og=d&&originOf(d);
    a={k:'garden',d,tx:og?og.x+(Math.random()<.5?.75:-.75):rand(8,34),ty:og?og.y+.1:rand(34,43)};}
  else if(k==='nap'){const tr=S().decor.filter(d=>DECO[d.k].tag==='tree'&&d!==hold());let tx,ty;
    if(tr.length){const og=originOf(pick(tr));tx=og.x+(Math.random()<.5?.7:-.7);ty=og.y+.15;}else{tx=rand(6,36);ty=31.5;}a={k:'nap',tx,ty};}
  else if(k==='visit'){const d=pick(S().decor.filter(d=>!DECO[d.k].flat&&d!==hold())),og=originOf(d);a={k:'visit',d,tx:og.x+rand(-.4,.4),ty:og.y+.6};}
  else if(k==='snack')a={k:'snack',tx:player.x,ty:player.y};
  if(!a)return;if(a.k!=='pond'&&a.k!=='snack'){const c=clampV(a.tx,a.ty);a.tx=c.x;a.ty=c.y;}
  a.ph='go';a.t0=t;a.lock=true;e.vAct=a;e.tx=null;}
function endAct(id,e){const a=e&&e.vAct;if(!a)return;
  if(a.d){const o=occ(a.d);if(o.swing===id)o.swing=null;if(o.slide===id)o.slide=null;o.pond=o.pond.filter(p=>p.id!==id);}
  e.vAct=null;e.vLift=0;e.tx=null;e.vNext=state.time+rand(15,30);}
function lifeUpdate(dt){const t=state.time;
  for(const id of PONY_IDS){const e=ents[id];if(!e||!state.ponies[id])continue;
    if(e.vAct&&!lifeOK(id,e,t)){endAct(id,e);continue;}
    if(!e.vAct){if(!lifeOK(id,e,t))continue;if(e.vNext==null)e.vNext=t+rand(3,14);if(t>e.vNext)planAct(id,e,t);continue;}
    const a=e.vAct;if(a.d&&(!S().decor.includes(a.d)||a.d===hold())){endAct(id,e);continue;}
    if(a.ph==='go'){let tx=a.tx,ty=a.ty;if(a.k==='snack'){tx=player.x+(e.x<player.x?-1.3:1.3);ty=player.y+.1;}
      const arrived=moveToward(e,tx,ty,2.3,dt)||(a.k==='snack'&&dist(e.x,e.y,player.x,player.y)<1.9);
      if(arrived){a.ph='do';a.t1=t;a.st=t;a.n=t+1;a.until=t+(a.k==='snack'?4:a.k==='visit'?6:rand(11,17));e.moving=false;e.hop=t;actBegin(id,e,a,t);}
      else if(t-a.t0>18||(a.k==='snack'&&!inVillage(player.x,player.y)))endAct(id,e);continue;}
    actDo(id,e,a,t,dt);if(t>a.until)endAct(id,e);}}
function actBegin(id,e,a,t){
  if(a.k==='swing'||a.k==='slide'){a.sp='climb';lifeSay(id,PL.playground);}
  else if(a.k==='pond'){for(let i=0;i<5;i++)particles.push({x:e.x+rand(-.3,.3),y:e.y-.15,vx:rand(-.9,.9),vy:rand(-2.4,-1.2),g:4,life:.7,max:.7,e:'💧',size:rand(.13,.19)});lifeSay(id,PL.pond);}
  else if(a.k==='bakery'){e.emote={e:'🧁',until:t+3};lifeSay(id,PL.bakery);}
  else if(a.k==='garden'){e.emote={e:'🌸',until:t+3};lifeSay(id,PL.garden);}
  else if(a.k==='nap')lifeSay(id,PL.nap);
  else if(a.k==='visit')e.emote={e:'💗',until:t+3};
  else if(a.k==='snack'){e.emote={e:PONIES[id].fav,until:t+7};e.flip=player.x<e.x;if(!dlgOpen&&!modalOpen()&&!speaking())say(PL.snack,id);}}
function actDo(id,e,a,t,dt){const near=onScreen(e.x,e.y)&&dist(e.x,e.y,player.x,player.y)<7;
  if(a.k==='swing'){const og=originOf(a.d),th=Math.sin((t-a.t1)*2.4)*.55*Math.min(1,(t-a.t1)/1.5),px=og.x+PG.px,py=og.y-PG.bar,sx=px+Math.sin(th)*PG.L,sy=py+Math.cos(th)*PG.L;
    e.x=sx;e.y=og.y-.28;e.vLift=e.y-sy;e.flip=false;e.moving=false;a.seat=[px,py,sx,sy];}
  else if(a.k==='slide'){const og=originOf(a.d),lx=og.x+.38,k=t-a.st;e.y=og.y-.1;
    if(a.sp==='climb'){e.x=lx;e.vLift=Math.min(1.2,k*.9);e.flip=false;e.moving=true;e.walkT=(e.walkT||0)+dt*8;if(e.vLift>=1.2){a.sp='top';a.st=t;}}
    else if(a.sp==='top'){e.moving=false;e.x=lx+.1;if(k>.5){a.sp='slide';a.st=t;}}
    else if(a.sp==='slide'){const u=Math.min(1,k/.8);e.moving=false;e.x=lx+.15+u*(og.x+1.45-lx-.15);e.vLift=1.18*Math.pow(1-u,1.7)+.05*u;e.flip=false;
      if(near&&Math.random()<dt*12)particles.push({x:e.x-.2,y:e.y-e.vLift-.3,vx:-.3,vy:-.2,g:0,life:.6,max:.6,e:'✨',size:.18});
      if(u>=1){a.sp='walk';a.st=t;e.hop=t;}}
    else{e.vLift=0;if(moveToward(e,lx,e.y,1.7,dt)){a.sp='climb';a.st=t;}}}
  else if(a.k==='pond'){e.moving=false;e.vLift=-.06;if(t>a.n){a.n=t+rand(1.8,3.4);e.hop=t;if(near){for(let i=0;i<3;i++)particles.push({x:e.x+rand(-.3,.3),y:e.y-.15,vx:rand(-.8,.8),vy:rand(-2.2,-1.2),g:4,life:.7,max:.7,e:'💧',size:rand(.13,.19)});if(Math.random()<.3)sfx('water');}if(Math.random()<.3)e.flip=!e.flip;}}
  else if(a.k==='nap'){e.moving=false;if(t>a.n){a.n=t+1.6;if(near)particles.push({x:e.x+(e.flip?-.3:.3),y:e.y-.95,vx:e.flip?-.12:.12,vy:-.35,g:0,life:1.6,max:1.6,e:'💤',size:.26});}}
  else if(a.k==='bakery'||a.k==='garden'){e.moving=false;if(t>a.n){a.n=t+rand(3,4.5);e.emote={e:pick(a.k==='bakery'?['🧁','🍰','🍪','💗']:['🌸','🦋','💗','🌼']),until:t+2.2};if(Math.random()<.4)e.hop=t;}}
  else if(a.k==='chase'){const k=t-a.t1,b=e.vBfly;if(!b){e.moving=false;return;}b.x=b.x0+Math.sin(k*1.4)*1.7;b.y=b.y0+Math.sin(k*2.8)*.45;const c=clampV(b.x,b.y+.9);moveToward(e,c.x,c.y,2.6,dt);
    if(t>a.until-.1){burst(b.x,b.y,'✨',5,.5);e.vBfly=null;}}
  else e.moving=false;}
// keep ponies that are busy with village life where village life put them (ch2Update would wander them home)
const prevC2U=ch2Update;
ch2Update=function(dt){const keep=[];for(const id of PONY_IDS){const e=ents[id];if(e&&e.vAct&&e.vAct.lock)keep.push([e,e.x,e.y,e.flip,e.moving,e.walkT]);}
  prevC2U(dt);for(const[e,x,y,f,m,w]of keep){e.x=x;e.y=y;e.flip=f;e.moving=m;e.walkT=w;}};

// ---------- Little moments & greetings ----------
let momentAt=0,wasInV=false,leftV=-999,greetAt=0,beginT=0;
function momentUpdate(){const t=state.time;if(t<momentAt)return;momentAt=t+rand(32,52);
  if(dlgOpen||menuPony||mode||modalOpen()||flight||speaking()||offV()){momentAt=t+6;return;}
  const c=PONY_IDS.filter(id=>{const e=ents[id];return state.ponies[id]&&e&&areaAt(e.x,e.y)==='valley'&&onScreen(e.x,e.y)&&dist(e.x,e.y,player.x,player.y)<6.5&&!(hide&&id==='puff')
    &&!(e.vAct&&e.vAct.ph==='do'&&['swing','slide','nap','chase'].includes(e.vAct.k));});
  if(!c.length){momentAt=t+8;return;}
  const id=pick(c),e=ents[id],opts=['trick','butterfly','sneeze','snack','sleepy','wave','sing','hiccup','love','look'];
  if(!(S().giftAt>t))opts.push('gift','gift');if(!S().garden&&inVillage(player.x,player.y))opts.push('secret','secret');if(Object.keys(S().babies).length)opts.push('babies');
  doMoment(id,e,pick(opts),t);}
function doMoment(id,e,k,t){endAct(id,e);e.pause=t+4;e.hop=t;e.flip=player.x<e.x;
  if(k==='gift'){S().giftAt=t+150;e.pause=0;e.visitUntil=t+5;setTimeout(()=>{state.inv.flower++;floatText(player.x,player.y-1.3,'+1 🌸');burst(player.x,player.y-.9,'🌸',5,.6);sfx('harvest');refreshBar(true);},1100);}
  else if(k==='trick')e.trick=t;
  else if(k==='butterfly'){e.pause=0;e.vBfly={x0:e.x+.8,y0:e.y-1.1,x:e.x+.8,y:e.y-1.1};e.vAct={k:'chase',ph:'do',lock:true,t0:t,t1:t,until:t+6};}
  else if(k==='sneeze')setTimeout(()=>{burst(e.x+(e.flip?-.5:.5),e.y-.8,'✨',10,.8);sfx('sparkle');e.hop=state.time;},1400);
  else if(k==='snack')e.emote={e:PONIES[id].fav,until:t+7};
  else if(k==='sleepy'){e.pause=t+7;for(let i=0;i<4;i++)setTimeout(()=>particles.push({x:e.x+.3,y:e.y-.95,vx:.12,vy:-.35,g:0,life:1.6,max:1.6,e:'💤',size:.26}),i*1300);}
  else if(k==='wave')e.emote={e:'👋',until:t+3};
  else if(k==='sing')for(let i=0;i<5;i++)setTimeout(()=>burst(e.x,e.y-1,'🎵',1,.5),i*350);
  else if(k==='hiccup')for(let i=0;i<3;i++)setTimeout(()=>{e.hop=state.time;burst(e.x,e.y-.9,'🫧',2,.4);},i*700);
  else if(k==='love')burst(e.x,e.y-1,'💗',8,.9);
  else if(k==='secret'){e.emote={e:'✨',until:t+4};e.flip=GAP.x<e.x;}
  else if(k==='babies')e.emote={e:'🐾',until:t+4};
  else if(k==='look')e.emote={e:'🏡',until:t+4};
  say(PL[k],id);}
function greetUpdate(){const t=state.time,inV=inVillage(player.x,player.y)&&!inClouds(player.x);
  if(inV&&!wasInV&&t-leftV>60&&t-beginT>20&&t>greetAt&&!dlgOpen){
    const c=PONY_IDS.filter(id=>state.ponies[id]&&ents[id]&&areaAt(ents[id].x,ents[id].y)==='valley'&&state.follower!==id&&!(hide&&id==='puff'));
    if(c.length){const id=pick(c),e=ents[id];endAct(id,e);e.visitUntil=t+7;e.emote={e:'💗',until:t+4};greetAt=t+120;
      setTimeout(()=>{if(!dlgOpen&&!speaking())say(pick([PL.greet1,PL.greet2,PL.greet3]),id);},800);}}
  if(!inV&&wasInV)leftV=t;wasInV=inV;}

// ---------- Little surprises: treasure chests ----------
Object.assign(L,{chestHere:R('Look! A sparkly treasure chest!'),tryPony:R('Tap a pony, then tap the paint button to try it on!'),
  tryWard:R('Tap the dress button to try it on!'),tryDeco:R('It is in your treasure box. Tap the paint brush in your village to put it out!'),
  coins:R('You found 5 shiny coins!'),babyFollow:R('It wants to come home with you! Take it to your Pony Village!'),
  garden1:R('You found a secret garden! It is so magical!'),garden2:R('Look! A golden treasure chest! Tap it to open it!'),
  gold1:R('Wow! A unicorn headband and fairy wings for you!'),gold2:R('And a crystal tree and a golden unicorn statue for your village! They are in your treasure box.'),
  magic:R('A magic flower!')});
const CHEST=[['p:head:butterfly','You found butterfly clips for your ponies!'],['p:head:heart','You found a heart clip for your ponies!'],
  ['p:neck:pearls','You found a pearl necklace for your ponies!'],['p:face:heart','You found heart glasses for your ponies!'],
  ['p:mane:sunset','You found sunset colors for your ponies!'],['p:mane:galaxy','You found galaxy colors for your ponies!'],
  ['p:trail:bubbles','You found a bubble trail for your ponies!'],['p:trail:flowers','You found a flower trail for your ponies!'],
  ['p:trail:butterflies','You found a butterfly trail for your ponies!'],['w:head:tiara','You found a sparkly tiara for you!'],
  ['w:head:crown','You found a golden crown for you!'],['w:head:bunny','You found bunny ears for you!'],['w:head:cat','You found kitty ears for you!'],
  ['w:eyes:heart','You found heart glasses for you!'],['w:eyes:star','You found star glasses for you!'],['w:back:butterfly','You found butterfly wings for you!'],
  ['d:heartbush','You found a heart bush!'],['d:starlamp','You found a star lamp!'],['d:rainbowbed','You found a rainbow flower bed!']].map(([u,t])=>({u,say:R(t)}));
let chestAnim=null;
function freeSpotNear(minD,maxD){const inV=inVillage(player.x,player.y),px=Math.floor(player.x),py=Math.floor(player.y),out=[];
  for(let y=py-5;y<=py+5;y++)for(let x=px-8;x<=px+8;x++){if(!walkable(x,y)||inVillage(x,y)!==inV||areaAt(x,y)!=='valley')continue;const c=map[y][x];
    if(c==='S'||c===GARDEN||c==='Ω'||(c==='='&&Math.random()<.7)||(inGlade(x,y)&&!state.gateOpen))continue;
    const d=dist(x+.5,y+.5,player.x,player.y);if(d<minD||d>maxD)continue;const sx=(x+.5)*ts-cam.x,sy=(y+.5)*ts-cam.y;if(sx<90||sx>vw-90||sy<170||sy>vh-160)continue;out.push([x,y]);}
  for(let i=0;i<12&&out.length;i++){const j=Math.floor(Math.random()*out.length),[x,y]=out[j];out.splice(j,1);if(bfsTiles(px,py,x,y).length)return{x:x+.5,y:y+.6};}return null;}
function chestUpdate(){const v=S(),t=state.time;
  if(!v.chest&&t>v.chestAt&&!offV()&&!dlgOpen&&!mode&&!modalOpen()&&!flight){const p=freeSpotNear(3,8);
    if(!p){v.chestAt=t+8;return;}v.chest={x:p.x,y:p.y};sfx('sparkle');burst(p.x,p.y-.5,'✨',10,1);if(!speaking())say(L.chestHere,'narrator');saveGame();}}
function pickReward(){const v=S(),un=CHEST.filter(r=>r.u[0]!=='d'&&!v.unl[r.u]),dec=CHEST.filter(r=>r.u[0]==='d');
  if(un.length&&Math.random()<.7)return pick(un);return Math.random()<.3?{u:'coins',say:L.coins}:pick(dec);}
function giveReward(r){const v=S();if(r.u==='coins'){state.coins+=5;return null;}
  if(r.u[0]==='d'){const k=r.u.slice(2);v.store[k]=(v.store[k]||0)+1;newDeco=true;return L.tryDeco;}
  v.unl[r.u]=true;if(r.u[0]==='w'){newWard=true;return L.tryWard;}return L.tryPony;}
function openChest(){const v=S(),c=v.chest;if(!c)return;v.chest=null;v.chestAt=state.time+rand(150,220);chestAnim={x:c.x,y:c.y,t0:state.time};
  sfx('fanfare');const r=pickReward(),two=giveReward(r);refreshBar(true);saveGame();
  setTimeout(()=>{burst(c.x,c.y-.8,'✨',14,1.2);celebrate(true);talk(two?[['narrator',r.say],['narrator',two]]:[['narrator',r.say]]);},650);}
function drawChest(X,Y,s,t,openK,gold){const body=gold?'#ffd34d':'#c98e55',dark=gold?'#c99a1a':'#7a4a24',band=gold?'#ff9ad5':'#ffd34d';
  const g=glowSprite(gold?'#fff3a0':'#fff6c4'),k=.45+.2*Math.sin(t*3);ctx.globalAlpha=k*(1-openK*.5);ctx.drawImage(g,X-s*.75,Y-s*1.05,s*1.5,s*1.5);ctx.globalAlpha=1;
  shadow(X,Y,s*.36,s*.1);ctx.lineWidth=Math.max(1,s*.025);ctx.lineJoin='round';
  if(openK>0){ctx.save();ctx.translate(X,Y-s*.42);ctx.rotate(-openK*1.9);ctx.fillStyle=body;ctx.strokeStyle=dark;rr(-s*.34,-s*.22,s*.68,s*.24,s*.1);ctx.fill();ctx.stroke();ctx.restore();
    const ray=glowSprite('#fff6a8');ctx.globalAlpha=openK;ctx.drawImage(ray,X-s*.6,Y-s*1.2,s*1.2,s*1.2);ctx.globalAlpha=1;}
  ctx.fillStyle=body;ctx.strokeStyle=dark;rr(X-s*.34,Y-s*.44,s*.68,s*.4,s*.06);ctx.fill();ctx.stroke();
  ctx.fillStyle=band;for(const dx of[-.22,.16])ctx.fillRect(X+dx*s,Y-s*.44,s*.07,s*.4);
  if(!openK){ctx.fillStyle=body;rr(X-s*.36,Y-s*.66,s*.72,s*.26,s*.12);ctx.fill();ctx.stroke();ctx.fillStyle=band;for(const dx of[-.22,.16])ctx.fillRect(X+dx*s,Y-s*.65,s*.07,s*.24);
    ctx.fillStyle=band;ctx.strokeStyle=dark;rr(X-s*.07,Y-s*.5,s*.14,s*.14,s*.03);ctx.fill();ctx.stroke();ctx.fillStyle=dark;circ(X,Y-s*.44,s*.02);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.35)';rr(X-s*.3,Y-s*.4,s*.18,s*.05,s*.02);ctx.fill();
  if(!openK)for(let i=0;i<3;i++){const tw=Math.sin(t*3+i*2.1);if(tw>.2)twinkle(X+[-.42,.4,.05][i]*s,Y-s*[.6,.45,.95][i],s*.07*tw,tw);}}

// ---------- Little surprises: baby animals ----------
const BABIES=[['bunny','🐇','pop','A baby bunny! Hello, little bunny!','The baby bunny loves your village! Now it lives here!'],
  ['duck','🐥','quack','A baby duckling! Hello, little duckling!','The baby duckling loves your village! Now it lives here!'],
  ['kitten','🐈','meow','A baby kitten! Hello, little kitten!','The baby kitten loves your village! Now it lives here!'],
  ['fawn','🦌','pop','A baby fawn! Hello, little fawn!','The baby fawn loves your village! Now it lives here!'],
  ['lamb','🐑','pop','A baby lamb! Hello, little lamb!','The baby lamb loves your village! Now it lives here!'],
  ['hedgehog','🦔','pop','A baby hedgehog! Hello, little hedgehog!','The baby hedgehog loves your village! Now it lives here!'],
  ['piglet','🐖','pop','A baby piglet! Hello, little piglet!','The baby piglet loves your village! Now it lives here!'],
  ['squirrel','🐿️','pop','A baby squirrel! Hello, little squirrel!','The baby squirrel loves your village! Now it lives here!']]
  .map(([id,e,snd,hi,home])=>({id,e,snd,hi:R(hi),home:R(home)}));
const BABY=Object.fromEntries(BABIES.map(b=>[b.id,b]));
const CRIT=['Squeak! I love you!','Hee hee! That tickles!','I love my new home!','Can we play together?'].map(t=>reg('critter',t));
let wild=null;const bEnt={};
function babyHome(){for(let i=0;i<60;i++){const x=Math.floor(rand(6,37)),y=Math.floor(rand(33,44));if(map[y][x]==='.')return{x:x+.5,y:y+.5};}return{x:20.5,y:38.5};}
function moveInBaby(id,b,quiet){const v=S(),h=babyHome();v.babies[id]=h;bEnt[id]={x:b?b.x:h.x,y:b?b.y:h.y};v.babyFollow=null;delete bEnt.f;v.babyAt=state.time+rand(110,170);saveGame();
  if(!quiet){celebrate(true);sfx(BABY[id].snd);burst(bEnt[id].x,bEnt[id].y-.5,'💗',8,.8);talk([['narrator',BABY[id].home]]);}}
function befriend(){if(!wild)return;const b=BABY[wild.id],v=S();v.babyFollow=wild.id;bEnt.f={x:wild.x,y:wild.y,flip:wild.flip};wild=null;
  sfx(b.snd);burst(bEnt.f.x,bEnt.f.y-.5,'💗',6,.7);talk([['narrator',b.hi],['narrator',L.babyFollow]]);saveGame();}
function babyUpdate(dt){const v=S(),t=state.time,inV=inVillage(player.x,player.y)&&!inClouds(player.x);
  const left=BABIES.filter(b=>!v.babies[b.id]&&v.babyFollow!==b.id);
  if(!wild&&!v.babyFollow&&left.length&&t>v.babyAt&&!inV&&!offV()&&!dlgOpen&&!flight&&!modalOpen()){const p=freeSpotNear(4,8);
    if(p){const b=pick(left);wild={id:b.id,x:p.x,y:p.y,hx:p.x,hy:p.y};sfx(b.snd);burst(p.x,p.y-.4,'✨',6,.6);}else v.babyAt=t+8;}
  if(wild){wander(wild,dt,[wild.hx-1.4,wild.hy-.8,wild.hx+1.4,wild.hy+.8],1.2);
    if(dist(wild.x,wild.y,player.x,player.y)>15||offV()||inV){wild=null;v.babyAt=t+25;}}
  if(v.babyFollow){const b=bEnt.f||(bEnt.f={x:player.x-1,y:player.y+.3});if(!offV()){if(dist(b.x,b.y,player.x,player.y)>12){b.x=player.x-1;b.y=player.y+.3;}follow(b,1.9,dt);}
    if(inV&&!dlgOpen)moveInBaby(v.babyFollow,b);}
  for(const id in v.babies){const h=v.babies[id];const e=bEnt[id]||(bEnt[id]={x:h.x,y:h.y});wander(e,dt,[h.x-1.6,h.y-.9,h.x+1.6,h.y+.9],1.1);}}
function drawBaby(b,e,t){const s=ts,X=SX(e.x),Y=SY(e.y),hop=e.moving?Math.abs(Math.sin((e.walkT||0)*.9))*s*.12:Math.abs(Math.sin(t*2+e.x))*s*.015;
  shadow(X,Y,s*.2,s*.06);drawEmoji(b.e,X,Y-s*.22-hop,s*.48,!e.flip);}

// ---------- Little surprises: the secret garden behind the trees ----------
const GFL=[[40.5,33.6],[42.5,33.7],[41.5,36.6],[40.5,42.6],[42.5,43.6]],GCHEST={x:41.5,y:40.4},WISH={x:42.5,y:41.88},CRYS={x:42.5,y:35.88};
let wishAt=0;
function carveGarden(){for(let y=33;y<=43;y++){map[y][39]=y===GAP.y?'Ω':'T';for(let x=40;x<=42;x++)map[y][x]=GARDEN;}map[35][42]=BLOCK;map[41][42]=BLOCK;}
function gardenUpdate(){const v=S(),t=state.time;if(offV()||player.y<32)return;const c=map[Math.floor(player.y)][Math.floor(player.x)];
  if(!v.garden&&(c===GARDEN||c==='Ω')){v.garden=true;GFX.sig='';sfx('fanfare');celebrate();
    for(let y=33;y<=43;y+=2)burst(41.5,y,'🍃',3,.8);talk([['narrator',L.garden1],['narrator',L.garden2]]);saveGame();}
  if(v.garden)GFL.forEach(([x,y],i)=>{if(!(v.gflowers[i]>t)&&dist(player.x,player.y,x,y)<.55)pickMagic(i);});}
function pickMagic(i){const[x,y]=GFL[i];S().gflowers[i]=state.time+40;state.inv.flower++;sfx('harvest');floatText(x,y-.4,'+1 🌸');burst(x,y-.4,'✨',5,.5);if(!speaking())say(L.magic,'narrator');refreshBar(true);}
function openGold(){const v=S();if(v.gchest)return;v.gchest=true;chestAnim={x:GCHEST.x,y:GCHEST.y,t0:state.time,gold:true};sfx('fanfare');
  ['w:head:unicorn','w:back:fairy'].forEach(u=>v.unl[u]=true);['crystal','unistatue'].forEach(k=>v.store[k]=(v.store[k]||0)+1);newWard=newDeco=true;refreshBar(true);saveGame();
  setTimeout(()=>{celebrate();burst(GCHEST.x,GCHEST.y-.8,'🌈',10,1.3);talk([['narrator',L.gold1],['narrator',L.gold2]]);},650);}
function makeWish(){const t=state.time;if(t<wishAt)return;wishAt=t+5;sfx('sparkle');burst(WISH.x,WISH.y-1.2,'✨',14,1.2);say(L.wish,'narrator');
  for(const id of PONY_IDS){const e=ents[id];if(state.ponies[id]&&e&&dist(e.x,e.y,player.x,player.y)<9){e.hop=t+Math.random()*.4;burst(e.x,e.y-1,'💗',3,.5);}}}
function drawWishFlower(t){const s=ts,X=SX(WISH.x),Y=SY(WISH.y),g=glowSprite('#ffc9ec'),k=.5+.2*Math.sin(t*2);ctx.globalAlpha=k;ctx.drawImage(g,X-s*.9,Y-s*2,s*1.8,s*1.8);ctx.globalAlpha=1;
  shadow(X,Y,s*.3,s*.08);ctx.strokeStyle='#4f9a3e';ctx.lineWidth=s*.07;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X+s*.15,Y-s*.6,X,Y-s*1.1);ctx.stroke();
  ctx.fillStyle='#5fb45a';ell(X-s*.18,Y-s*.4,s*.18,s*.07);ctx.fill();ell(X+s*.2,Y-s*.65,s*.16,s*.06);ctx.fill();
  const sw=Math.sin(t*1.5)*.08;ctx.save();ctx.translate(X,Y-s*1.15);ctx.rotate(sw);for(let i=0;i<7;i++){ctx.save();ctx.rotate(i/7*Math.PI*2+t*.2);ctx.fillStyle=PASTEL[i];ell(0,-s*.24,s*.13,s*.22);ctx.fill();ctx.restore();}
  ctx.fillStyle='#ffe27a';circ(0,0,s*.15);ctx.fill();ctx.fillStyle='#4a2c5e';circ(-s*.05,-s*.02,s*.02);ctx.fill();circ(s*.05,-s*.02,s*.02);ctx.fill();
  ctx.strokeStyle='#4a2c5e';ctx.lineWidth=Math.max(1,s*.015);ctx.beginPath();ctx.arc(0,s*.02,s*.05,.3,Math.PI-.3);ctx.stroke();ctx.restore();}
function gardenLayer(L2,t,x0,y0,x1,y1){const v=S(),s=ts;if(x1<38)return;
  if(!v.garden){for(let y=33;y<=43;y++)for(let x=40;x<=42;x++)if(y>=y0-1&&y<=y1+2)L2.push([y+.9,()=>drawTree(x,y)]);
    L2.push([GAP.y+.85,()=>{drawHedge(GAP.x,GAP.y);const k=Math.sin(t*2.5);if(k>0)twinkle(SX(GAP.x+.7),SY(GAP.y+.2),s*.08*k,k);const k2=Math.sin(t*2.5+2);if(k2>0)twinkle(SX(GAP.x+.25),SY(GAP.y-.1),s*.06*k2,k2);}]);return;}
  L2.push([GAP.y+.9,()=>{const X=SX(GAP.x+.5),Y=SY(GAP.y+.92);ctx.strokeStyle='#5fb45a';ctx.lineWidth=s*.08;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X,Y-s*1.1);ctx.stroke();
    const C=['#ff7eb6','#fff','#c9a6ff','#ffd34d'];for(let i=0;i<6;i++)flower(X+Math.sin(i)*s*.06,Y-s*(.2+i*.17),s*.045,C[i%4]);}]);
  L2.push([CRYS.y,()=>{const X=SX(CRYS.x),Y=SY(CRYS.y);aGlow(X,Y,s*1.2,t,{x:1,y:2});ctx.save();ctx.translate(X,Y);ctx.scale(1.25,1.25);dCrystal(s);ctx.restore();}]);
  L2.push([WISH.y,()=>drawWishFlower(t)]);
  GFL.forEach(([x,y],i)=>{if(v.gflowers[i]>t)return;L2.push([y,()=>{const X=SX(x),Y=SY(y),g=glowSprite('#ffe9f7');ctx.globalAlpha=.6;ctx.drawImage(g,X-s*.4,Y-s*.75,s*.8,s*.8);ctx.globalAlpha=1;
    const im=rainbowEmoji('🌸',Math.round(s*.42));ctx.drawImage(im,X-im._s/2,Y-s*.32-im._s/2+Math.sin(t*2+i)*s*.03,im._s,im._s);}]);});
  if(!v.gchest)L2.push([GCHEST.y,()=>drawChest(SX(GCHEST.x),SY(GCHEST.y),ts,t,0,true)]);
  L2.push([99,()=>{for(let i=0;i<2;i++){const x=41.5+Math.sin(t*.7+i*3)*1.1,y=38+Math.sin(t*.45+i*2)*4.5;drawEmoji('🦋',SX(x),SY(y)-s*.6,s*.32*(.8+.2*Math.abs(Math.sin(t*9+i))));}}]);}

// ---------- Map & ground: new walkable tiles, grass under decorations ----------
const prevWalk=isWalkChar;
isWalkChar=function(c,g){return c===GARDEN||c==='Ω'||prevWalk(c,g);};
// The ground chunks treat unknown tiles as holes; draw normal grass under decorations/cottages and a magic glade in the garden.
function withGround(fn,args){const sw=[];for(let y=30;y<H;y++){const r=map[y];for(let x=0;x<44;x++){const c=r[x];
  if(c===BLOCK||c==='Y'){sw.push(x,y,c);r[x]='.';}else if(c===GARDEN||c==='Ω'){sw.push(x,y,c);r[x]=state.vil&&state.vil.garden?'g':'T';}}}
  try{return fn.apply(null,args);}finally{for(let i=0;i<sw.length;i+=3)map[sw[i+1]][sw[i]]=sw[i+2];}}
const prevChunk=buildChunk;buildChunk=function(){return withGround(prevChunk,arguments);};
const prevField=buildField;buildField=function(){return withGround(prevField,arguments);};
HOOK.tile.push((c,x,y,sx,sy,s,h,t)=>{if(x>=44)return false;
  if(c===GARDEN||c==='Ω'){if(state.vil&&state.vil.garden&&h>.86)drawStar(sx+s*.5,sy+s*.5,s*.06*(1+.3*Math.sin(t*3+h*20)),'#fff6a8',false);return true;}
  return c===BLOCK||c==='Y';});

// ---------- Hooks ----------
HOOK.init.push(()=>{carveGarden();regPonyLines();});
HOOK.begin.push(isNew=>{initState();regPonyLines();const v=S();
  for(const c of state.cottages)if(cottageTiles(c.x,c.y).every(([x,y])=>map[y][x]==='.'||map[y][x]==='Y'))applyCottage(c);
  v.decor=v.decor.filter(d=>{if(!DECO[d.k])return false;if(d.id==null)d.id=v.nextId++;if(!applyDeco(d)){v.store[d.k]=(v.store[d.k]||0)+1;return false;}return true;});
  for(const c of state.cottages)bumpPlayer(cottageTiles(c.x,c.y));for(const d of v.decor)if(!DECO[d.k].walk)bumpPlayer(decoTiles(d));
  if(v.babyFollow&&BABY[v.babyFollow])moveInBaby(v.babyFollow,null,true);
  mode=null;moveCi=-1;wild=null;GFX.sig='';changed();beginT=state.time;wasInV=inVillage(player.x,player.y);momentAt=state.time+25;
  newWard=newWard||false;refreshBar(true);});
HOOK.update.push(dt=>{if(!state.vil)return;
  const vs=SIGNS.find(s=>s.village);if(vs&&state.cottages.length)vs.text=signText();
  if(mode&&(placing||!inVillage(player.x,player.y)||inClouds(player.x)))endMode();
  stageUpdate();trailUpdate(dt);lifeUpdate(dt);momentUpdate();greetUpdate();chestUpdate();babyUpdate(dt);gardenUpdate();
  if(state.ch3&&state.ch3.crown&&!S().unl['w:head:rcrown']&&!dlgOpen&&!modalOpen()){S().unl['w:head:rcrown']=true;S().ward.head='rcrown';newWard=true;
    celebrate();sfx('fanfare');burst(player.x,player.y-1.2,'🌈',10,1.2);refreshBar(true);saveGame();
    talk([['narrator','You got the Rainbow Crown! You look like a real rainbow princess!'],['narrator','It is in your wardrobe. Tap the dress button any time!']]);}});
function tapDeco(d){const D=DECO[d.k],o=originOf(d),fx=o.x,fy=d.y+D.h+.45;
  goDo(fx,fy,D.w>=3?2.2:1.6,()=>{sfx('tap');burst(o.x,o.y-D.hg*.6,'✨',5,.6);
    if(d.k==='bakery'){if(typeof window.ch3OpenBakery==='function')window.ch3OpenBakery();else say(L.bakeryReady,'narrator');return;}
    say(D.say||D.n,'narrator');if(D.say===L.wish){sfx('sparkle');burst(o.x,o.y-1,'💫',6,.8);}});}
HOOK.tap.push((wx,wy)=>{if(!state.vil||placing||flight)return false;
  if(mode){if(mode.t==='place')placeTap(wx,wy);else moveTap(wx,wy);return true;}
  if(menuPony)return false;
  const v=S(),cl=offV();
  if(v.chest&&!cl&&dist(wx,wy,v.chest.x,v.chest.y-.35)<.8){goDo(v.chest.x,v.chest.y+.1,1.3,openChest);return true;}
  if(wild&&dist(wx,wy,wild.x,wild.y-.25)<.7){goDo(wild.x,wild.y,1.4,befriend,wild);return true;}
  for(const id in bEnt){const e=bEnt[id];if(cl||dist(wx,wy,e.x,e.y-.25)>=.6)continue;const b=BABY[id==='f'?v.babyFollow:id];if(!b)continue;
    goDo(e.x,e.y,1.4,()=>{sfx(b.snd);burst(e.x,e.y-.6,'💗',5,.6);e.hop=state.time;say(pick(CRIT),'critter');},e);return true;}
  if(PONY_IDS.some(id=>{const e=ents[id];return e&&sameArea(e,player)&&dist(wx,wy,e.x,e.y-.5)<.9;}))return false;
  if(cl)return false;
  if(v.garden&&wx>=39.5&&wx<=43.2&&wy>=32.4&&wy<=44.6){
    if(!v.gchest&&dist(wx,wy,GCHEST.x,GCHEST.y-.35)<.8){goDo(GCHEST.x,GCHEST.y+.1,1.3,openGold);return true;}
    if(dist(wx,wy,WISH.x,WISH.y-1)<1){goDo(41.5,WISH.y,1.4,makeWish);return true;}
    if(dist(wx,wy,CRYS.x,CRYS.y-1)<.9){goDo(41.5,CRYS.y,1.4,()=>{sfx('sparkle');burst(CRYS.x,CRYS.y-1.2,'💎',5,.7);say(DECO.crystal.n,'narrator');});return true;}
    for(let i=0;i<GFL.length;i++){const[x,y]=GFL[i];if(!(v.gflowers[i]>state.time)&&dist(wx,wy,x,y-.3)<.6){goDo(x,y,.5,()=>{if(!(S().gflowers[i]>state.time))pickMagic(i);});return true;}}}
  if(inVillage(wx,wy)){const h=hitObject(wx,wy);if(h&&h.t==='d'&&!DECO[h.d.k].walk){tapDeco(h.d);return true;}}
  return false;});
HOOK.ground.push((t,x0,y0,x1,y1)=>{if(!state.vil||offV()||y1<30)return;drawPaths(x0,y0,x1,y1);
  if(!mode)return;const s=ts;let w=1,h=1;
  if(mode.t==='place'){w=DECO[mode.k].w;h=DECO[mode.k].h;}else if(mode.hold){if(mode.hold.t==='c'){w=3;h=2;}else{w=DECO[mode.hold.d.k].w;h=DECO[mode.hold.d.k].h;}}
  mode.spots.forEach((p,i)=>{const x=SX(p.x),y=SY(p.y);if(x<-3*s||x>vw+s||y<-3*s||y>vh+s)return;const k=.5+.5*Math.sin(t*4+i);
    ctx.fillStyle=`rgba(255,255,255,${(.22+.18*k).toFixed(3)})`;ctx.strokeStyle='#ff7eb6';ctx.lineWidth=3;ctx.setLineDash([8,6]);
    rr(x+s*.08,y+s*.08,s*(w-.16),s*(h-.16),s*.3);ctx.fill();ctx.stroke();ctx.setLineDash([]);drawStar(x+s*w/2,y+s*(h/2-.05*k),s*.09*(1+k*.4),'#fff6a8',true);});
  if(mode.t==='move'&&mode.hold){const H=mode.hold,x=H.t==='c'?H.ox:H.ox,y=H.oy;ctx.strokeStyle='rgba(255,126,182,.8)';ctx.lineWidth=3;ctx.setLineDash([4,6]);
    rr(SX(x)+s*.05,SY(y)+s*.05,s*(w-.1),s*(h-.1),s*.25);ctx.stroke();ctx.setLineDash([]);}});
HOOK.layer.push((L2,t,x0,y0,x1,y1)=>{if(!state.vil||offV())return;const v=S(),s=ts;
  if(y1>=29){
    for(const d of v.decor){const D=DECO[d.k];if(d.x+D.w<x0-1||d.x>x1+1||d.y+D.h<y0-1||d.y-D.hg>y1+1)continue;
      if(d===hold())L2.push([99,()=>{ctx.globalAlpha=.8;drawDeco(d,t,s*(.35+.08*Math.sin(t*5)));ctx.globalAlpha=1;}]);
      else L2.push([D.flat?d.y+.02:D.sortAt!=null?d.y+D.sortAt:d.y+D.h-.15,()=>drawDeco(d,t)]);}
    if((v.stage||0)>=2&&y0<=33)L2.push([32.05,()=>drawEntrance(t)]);
    if((v.stage||0)>=3&&y0<=32){FLAGS.forEach(([x,c])=>L2.push([31.0,()=>drawFlag(x,c,t)]));const sg=SIGNS.find(q=>q.village);L2.push([sg.y+.01,()=>drawEmoji('👑',SX(sg.x),SY(sg.y)-s*1.05,s*.34)]);}
    gardenLayer(L2,t,x0,y0,x1,y1);
    for(const id in v.babies){const e=bEnt[id];if(e&&onScreen(e.x,e.y))L2.push([e.y,()=>drawBaby(BABY[id],e,t)]);}
    for(const id of PONY_IDS){const e=ents[id],a=e&&e.vAct;if(!a||a.ph!=='do')continue;
      if(a.k==='swing'&&a.seat){const[px,py,sx,sy]=a.seat;L2.push([e.y-.001,()=>swingDraw(SX(px),SY(py),SX(sx),SY(sy),s)]);}
      else if(a.k==='pond')L2.push([e.y+.001,()=>{const X=SX(e.x),Y=SY(e.y)+s*.03,sc=PONIES[id].look.scale||1;ctx.fillStyle='rgba(120,205,245,.94)';ell(X,Y,s*.46*sc,s*.13);ctx.fill();
        const k=(t*.8+e.x)%1;ctx.strokeStyle=`rgba(255,255,255,${(.8*(1-k)).toFixed(3)})`;ctx.lineWidth=Math.max(1,s*.025);ell(X,Y,s*(.3+k*.35)*sc,s*(.08+k*.08));ctx.stroke();}]);}
    if(mode&&mode.t==='move'&&!mode.hold){const mk=(x,y,i)=>L2.push([99,()=>{const b=Math.sin(t*5+i)*s*.08;drawEmoji('✋',SX(x),SY(y)+b,s*.42);}]);
      state.cottages.forEach((c,i)=>mk(c.x+1.5,c.y-1.1,i));v.decor.forEach((d,i)=>mk(d.x+DECO[d.k].w/2,d.y+DECO[d.k].h-DECO[d.k].hg-.25,i+5));}}
  for(const id of PONY_IDS){const e=ents[id];if(e&&e.vBfly&&onScreen(e.vBfly.x,e.vBfly.y))L2.push([99,()=>drawEmoji('🦋',SX(e.vBfly.x),SY(e.vBfly.y),s*.36*(.8+.2*Math.abs(Math.sin(t*12))))]);}
  if(v.chest&&!inClouds(v.chest.x)&&onScreen(v.chest.x,v.chest.y))L2.push([v.chest.y,()=>drawChest(SX(v.chest.x),SY(v.chest.y),s,t,0)]);
  if(chestAnim){const k=Math.min(1,(t-chestAnim.t0)/.5);if(t-chestAnim.t0>2.2)chestAnim=null;else{const c=chestAnim,al=Math.min(1,(2.2-(t-c.t0))/.5);
    L2.push([c.y,()=>{ctx.globalAlpha=al;drawChest(SX(c.x),SY(c.y),s,t,k,c.gold);ctx.globalAlpha=1;}]);}}
  if(wild&&onScreen(wild.x,wild.y))L2.push([wild.y,()=>{drawBaby(BABY[wild.id],wild,t);const k=Math.sin(t*3);if(k>.3)twinkle(SX(wild.x)+s*.3,SY(wild.y)-s*.6,s*.06*k,k);}]);
  if(v.babyFollow&&bEnt.f)L2.push([bEnt.f.y,()=>drawBaby(BABY[v.babyFollow],bEnt.f,t)]);});
HOOK.bar.push(()=>{if(!state.vil||flight)return[];const out=[];
  if(mode){if(mode.hold&&mode.hold.t==='d')out.push({key:'vstore',html:'📦',label:'put away',cls:'hammer',onTap:storeHeld});
    out.push({key:'vdone',html:'✅',label:'done',cls:'hammer',onTap:endMode});return out;}
  if(inVillage(player.x,player.y)&&!inClouds(player.x)&&state.cottages.length&&!placing)out.push({key:'vdeco',html:'🖌️',label:'decorate',cls:newDeco?'pulse':'',onTap:openDecorate});
  out.push({key:'vward',html:'👗',label:'clothes',cls:newWard?'pulse':'',onTap:openWardrobe});return out;});
HOOK.ponyButtons.push({act:'dress',icon:'🎨',show:id=>!!(state.vil&&state.ponies[id]),onTap:id=>{closePonyMenu();openDress(id);}});
HOOK.ponyButtons.push({act:'trick',icon:'✨',show:id=>!!(state.vil&&state.ponies[id])&&vp(id).lv>=2,onTap:id=>doTrick(id)});
HOOK.target.push(()=>{if(!state.vil||qid()!=='freeEnd')return undefined;const v=S(),cl=offV();if(mode)return null;
  if(v.babyFollow&&!inVillage(player.x,player.y)&&!cl)return VILLAGE_GATE;
  if(v.chest&&!cl)return{x:v.chest.x,y:v.chest.y-.4};
  if(v.garden&&!v.gchest&&inVillage(player.x,player.y))return{x:GCHEST.x,y:GCHEST.y-.4};
  return undefined;});
// small API for other modules
window.vilFind=k=>state.vil?state.vil.decor.filter(d=>d.k===k).map(d=>({x:d.x,y:d.y,w:DECO[d.k].w,h:DECO[d.k].h,door:doorOf(d)})):[];
window.vilLevel=id=>state.vil&&state.ponies[id]?vp(id).lv:0;
window.vilDebug=()=>({wild,mode,moment:()=>{momentAt=0;}});
})();
