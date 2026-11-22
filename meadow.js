'use strict';
// ---------- Chapter 6: Moonlight Meadow ----------
// Zip the shooting star brings Mother Moon's letter: the stars fell out of the sky and the star ponies are too sleepy to shine.
// She blows dandelions to find Nova's star, scoops Comet's star out of Mirror Lake, fixes the Wish Windmill to catch
// falling star pieces, plays the star bells to wake Dusk, and connects the stars into a pony in the sky.
// (Different from Chapter 3's Moon Garden: no owl, fireflies or lanterns.) All drawing is in LandArt.meadow at the bottom.
(()=>{
const R=reg,ART=LandArt.meadow,NEW=['nova','comet','dusk'];
const CUPCAKE='Mmm! A cupcake! I love cupcakes!';

// ===== Speakers, ponies, crops =====
Object.assign(SPK,{
  moon:{n:'Mother Moon',f:'🌝',p:.95,r:.88},
  zip:{n:'Zip',f:'🌠',p:1.7,r:1.15},
  nova:{n:'Nova',f:'🐴',portrait:true,p:1.4,r:1},
  comet:{n:'Comet',f:'🐴',portrait:true,p:1.3,r:1.08},
  dusk:{n:'Dusk',f:'🐴',portrait:true,p:1.2,r:.9}});
Object.assign(PONIES,{
  nova:{names:['Nova','Sunny','Goldie','Starbright'],fav:'daisy',acc:'⭐',home:{x:13.5,y:131.6},
    look:{body:'#fff4cc',mane:['#ffd83d','#ffb84d','#fff3a0','#ffd83d'],hoof:'#d8a23a',snout:'#fffbe8',wings:'#fffbe6',scale:.84,assetId:'nova'}},
  comet:{names:['Comet','Zoomy','Skye','Blue'],fav:'moonmelon',acc:'☄️',home:{x:27.5,y:137.4},
    look:{body:'#dbe7ff',mane:['#4f7dff','#a9c4ff','#ffffff','#4f7dff'],hoof:'#4060c0',snout:'#f2f6ff',wings:'#eef4ff',scale:.84,assetId:'comet'}},
  dusk:{names:['Dusk','Velvet','Dreamy','Lavender'],fav:'moonmelon',acc:'🌙',home:{x:35.5,y:120.6},
    look:{body:'#7a68c8',mane:['#ff9ad5','#ffd6f0','#c9a6ff','#ff9ad5'],hoof:'#3d2f78',snout:'#9c8ce0',wings:'#d6c9ff',scale:.9,assetId:'dusk'}}});
PONY_IDS.push(...NEW);
for(const id of NEW){PONIES[id].names.forEach(n=>R('narrator',n));
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(id,T2[k]);R(id,CUPCAKE);}
Object.assign(CROPS,{
  moonmelon:{e:'🍈',name:'moon melon',st:['','🌱','🌿','🍈'],glow:true},
  daisy:{e:'🌼',name:'dream daisy',st:['','🌱','🌿','🌼'],glow:true}});
Object.assign(ICON,{moonmelon:'🍈',daisy:'🌼'});
Object.assign(PRICE,{moonmelon:5,daisy:4});
Object.assign(ITEM_NAMES,{moonmelon:'Moon melons',daisy:'Dream daisies'});
FOODS.push('moonmelon','daisy');
if(window.VIL_PERSONA)Object.assign(VIL_PERSONA,{nova:{likes:['garden','playground']},comet:{likes:['pond','follow','playground']},dusk:{likes:['nap','garden']}});

// ===== The land: x0-43, y112-143 =====
Object.assign(AREAS.meadow,{name:R('narrator','Moonlight Meadow'),icon:'🌙',sky:['#2b2f6e','#7b6fc8'],
  go:R('narrator','Off to Moonlight Meadow!'),seeds:['moonmelon','daisy','strawberry','carrot'],
  cam:{x0:3,y0:114,x1:41,y1:142},unlocked:()=>state.quest>=qi('n6fly')});
PADS.meadow={x:9.5,y:121.4};
const MOON={x:27.5,y:118.6},MILL={x:19.5,y:121.2},LAKE={x:28.5,y:132.5},DFIELD={x:13.5,y:131.6};
const DANDS=[[9.5,128.4],[11.5,127.2],[14.5,127.6],[17.2,128.6],[9.2,131],[17.6,131.2],[10.4,134],[13.5,134.8],[16.6,134.2],[8.2,136.2],[18.6,136.4],[12,129.8],[15.4,130.2]];
const PUFFS=[[11.3,129.4],[15.9,129.6],[10.3,132.4],[16.8,132.8],[12.2,135.2],[15,135.6],[13.6,128.4]];
const PIECES=[[8.5,125.5],[23.5,124.5],[33.5,127.5],[36.5,133.5],[21.5,138.5]];
{const T=(x0,y0,x1,y1,c)=>rect(x0,y0,x1,y1,c);
  T(0,112,43,143,'T');T(5,115,38,140,'.');
  T(24,129,33,135,'W');[[24,129],[33,129],[24,135],[33,135],[25,129],[32,135]].forEach(([x,y])=>map[y][x]='.');
  T(14,124,17,125,'S');
  const r=mulberry32(6161);
  const zones=[[5,117,13,125],[14,116,24,126],[22,115,32,121],[6,126,20,138],[22,127,35,139],[30,117,38,125],[18,126,23,140],[33,126,38,140]];
  const inZ=(x,y)=>zones.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d);
  for(let y=115;y<=140;y++)for(let x=5;x<=38;x++)if(map[y][x]==='.'&&!inZ(x,y)&&r()<.35)map[y][x]='T';
  [[37,126],[5,139],[38,140],[21,115],[34,139]].forEach(([x,y])=>map[y][x]='T');}
const K=(x,y)=>x+y*W,BLOCK=new Set();
[[19,120],[20,120],[19,121],[20,121]].forEach(([x,y])=>BLOCK.add(K(x,y)));[[27,117],[28,117],[26,117]].forEach(([x,y])=>BLOCK.add(K(x,y)));
SIGNS.push({x:12.6,y:122.7,text:'Moonlight Meadow'},{x:17.6,y:123.7,text:'Wish Windmill'},{x:24.4,y:121.7,text:'Moon Hill'},
  {x:8.6,y:126.7,text:'Dandelion Field'},{x:22.6,y:136.7,text:'Mirror Lake'},{x:33.6,y:123.7,text:'Sleepy Hill'});

// ===== Spoken lines (said with say(), so registered) =====
const L={
  moonIdle:[R('moon','Goodnight, little one. Sweet dreams.'),R('moon','The stars are so happy you are here.')],
  zipIdle:[R('zip','Zoom, zoom! I am Zip!'),R('zip','Whee! Stardust for the garden!'),R('zip','I love to fly fast!')],
  sleepy:R('narrator','Shh! This star pony is fast asleep.'),
  zzz:R('narrator','Zzz... Zzz...'),
  blow:[R('narrator','Whoosh! The fluff flies away!'),R('narrator','Puff! Look at it float!'),R('narrator','Whoosh! No star in this one.')],
  starFound:R('narrator','There it is! A fallen star!'),
  tossTitle:R('moon','Star Toss'),
  tossSay:R('moon','Push the star up, up, up into the sky!'),
  tossUp:[R('narrator','Higher!'),R('narrator','Up, up!')],
  tossDone:R('moon','It is shining in the sky again!'),
  lakeTitle:R('moon','Mirror Lake'),
  lakeSay:R('moon','Tap a glowing ripple to scoop it up with your net!'),
  catchFish:R('narrator','A little fish! It says hello! Splash!'),
  catchFrog:R('narrator','Ribbit! A happy frog! Hop, hop!'),
  catchTurtle:R('narrator','A sleepy turtle! Hello, turtle!'),
  catchStar:R('narrator','A star! You found the fallen star!'),
  lakePlay:R('comet','Let us go fishing in the lake!'),lakeDone:R('comet','What a fun catch!'),
  needCrops:R('zip','The windmill needs 2 moon melons and 2 dream daisies!'),
  millTitle:R('zip','Fix the Wish Windmill'),
  millDone:R('narrator','The Wish Windmill is spinning!'),
  piece:[R('narrator','You caught a star piece!'),R('narrator','Another star piece!')],
  bellTitle:R('moon','Star Bells'),
  bellSay:R('moon','Tap the bells to play a wake-up song! Follow the glowing bell if you like.'),
  bellHalf:R('narrator','Dusk is waking up! Keep playing!'),
  bellPlay:R('dusk','Let us play the star bells together!'),bellDone:R('dusk','What a beautiful song!'),
  dotsTitle:R('moon','Connect the Stars'),
  dotsSay:R('moon','Tap the stars in order, one, two, three, and see what picture they make!'),
  dotsNext:R('narrator','Tap the glowing star!'),
  dotsDone:R('moon','A pony in the sky! Look at it go!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  playPuffs:R('nova','Let us blow dandelion fluff!'),puffsDone:R('nova','Whee! Look at all the fluff!'),
};
const MILL_NAME={pink:R('narrator','Pink'),blue:R('narrator','Blue'),purple:R('narrator','Purple'),white:R('narrator','White'),
  red:R('narrator','Red'),teal:R('narrator','Teal'),gold:R('narrator','Gold'),star:R('narrator','A star lamp'),moon:R('narrator','A moon lamp'),
  heart:R('narrator','A heart lamp'),rainbow:R('narrator','A rainbow lamp'),daisy:R('narrator','Daisies'),tulip:R('narrator','Tulips'),
  blossom:R('narrator','Blossoms'),sun:R('narrator','Sunflowers')};
const SAIL={pink:'#ffb3d9',blue:'#a9d4ff',purple:'#d6c2ff',white:'#ffffff'},ROOF={red:'#e8545e',teal:'#3fb8a8',purple:'#8a6ad8',gold:'#e8b23a'};
const LAMP={star:'⭐',moon:'🌙',heart:'💖',rainbow:'🌈'},MFLW={daisy:'🌼',tulip:'🌷',blossom:'🌸',sun:'🌻'};
const sw=c=>`<span class="lgSw" style="background:${c}"></span>`;
const MILL_STAGES=[
  {id:'sail',say:R('zip','Pick a color for the windmill sails!'),opts:Object.keys(SAIL).map(k=>({k,html:sw(SAIL[k]),say:MILL_NAME[k]}))},
  {id:'roof',say:R('zip','Pick a color for the roof!'),opts:Object.keys(ROOF).map(k=>({k,html:sw(ROOF[k]),say:MILL_NAME[k]}))},
  {id:'lamp',say:R('zip','Pick a lamp for the very top!'),opts:Object.keys(LAMP).map(k=>({k,html:LAMP[k],say:MILL_NAME[k]}))},
  {id:'flw',say:R('zip','Pick some flowers!'),opts:Object.keys(MFLW).map(k=>({k,html:MFLW[k],say:MILL_NAME[k]}))}];

// ===== Quests =====
const N6Q=[
{id:'n6letter',icon:'🌠',chapter:'Moonlight Meadow',chapterIcon:'🌙',text:'A shooting star has a letter for you! Tap the shooting star.',
 start:[['narrator','Whoosh! Look up! A little shooting star is zooming this way with a letter!'],()=>{C6().letterSeen=true;zipM.arrive();}],
 hint:'Tap the little shooting star to read the letter!'},
{id:'n6fly',icon:'🎈',text:'Fly the Rainbow Balloon to Moonlight Meadow.',
 start:[['grandma','Mother Moon needs your help! The Rainbow Balloon can fly you to Moonlight Meadow. Tap the balloon!']],
 hint:'Tap the Rainbow Balloon. Then tap the Moonlight Meadow picture!'},
{id:'n6meet',icon:'🌝',text:'Say hello to Mother Moon on Moon Hill.',
 start:[['narrator','Welcome to Moonlight Meadow! It is always a soft, cozy night here.'],
   ['zip','Zoom, zoom! I am Zip! Come and meet Mother Moon on Moon Hill!']],
 hint:'Mother Moon is resting on Moon Hill. Follow the arrow!'},
{id:'n6puffs',icon:'🌼',text:'Blow the dandelion fluff to find a fallen star. Tap the fluffy dandelions!',goal:7,handin:true,prog:()=>C6().blown.length,
 start:[['moon','Nova fell asleep in the dandelion field. Her star is hiding in a fluffy dandelion.'],['moon','Tap the fluffy dandelions to blow them!']],
 hint:'Go to the dandelion field. Tap the fluffy dandelions to blow them away!'},
{id:'n6nova',icon:'⭐',text:'Toss the fallen star back into the sky! Tap the star.',
 start:[['moon','You found Nova\'s star! Now toss it back up into the sky. Tap the star!']],
 hint:'Tap the fallen star. Then push it up, up, up into the sky!'},
{id:'n6lake',icon:'🎣',text:'Scoop Comet\'s star out of Mirror Lake. Tap the lake.',
 start:[['moon','Comet is sleeping by Mirror Lake. His star fell into the water with a big splash!'],['moon','Tap the lake to scoop it out with a net!']],
 hint:'Go to Mirror Lake and tap the water. Then tap the glowing ripples!'},
{id:'n6garden',icon:'🍈',text:'Grow 2 moon melons and 2 dream daisies for the Wish Windmill.',goal:4,handin:true,
 prog:()=>Math.min(2,state.inv.moonmelon)+Math.min(2,state.inv.daisy),
 start:[['moon','Two stars are home! But the last star broke into little pieces when it fell.'],
   ['moon','The Wish Windmill can blow the pieces up into the air. But it is broken.'],
   ['zip','Zoom! Let us fix it! Grow 2 moon melons and 2 dream daisies. I will water them with stardust!'],()=>{state.seed='moonmelon';refreshBar(true);}],
 hint:'Plant moon melons and dream daisies in the moon garden. Then take them to the Wish Windmill.'},
{id:'n6mill',icon:'🌬️',text:'Fix the Wish Windmill! Tap the windmill.',
 start:[['zip','Yay! Now tap the windmill, and let us fix it together!']],
 hint:'Tap the Wish Windmill. Then pick the colors you like!'},
{id:'n6pieces',icon:'✨',text:'Catch 5 sparkly star pieces floating in the meadow.',goal:5,handin:true,prog:()=>C6().pieces.length,
 start:[['narrator','Whoosh! The Wish Windmill is blowing the star pieces up into the air!'],['zip','Catch them! Walk to them or tap them!']],
 hint:'Walk to the sparkly star pieces, or tap them. Follow the arrow!'},
{id:'n6bells',icon:'🔔',text:'Wake up Dusk with a song on the star bells. Tap Dusk.',
 start:[['moon','You caught all the star pieces! They belong to Dusk, the sleepiest star pony.'],
   ['moon','She is sleeping on Sleepy Hill. Play her a wake-up song on the star bells!']],
 hint:'Go to Sleepy Hill and tap Dusk. Then tap the star bells to play a song!'},
{id:'n6stars',icon:'🌌',text:'Connect the stars to put Dusk\'s star back in the sky. Tap Dusk.',
 start:[['dusk','Yawn... What a beautiful song. Hello! I am Dusk.'],['dusk','My star broke into pieces. Can you help me put it back together in the sky? Tap me!']],
 hint:'Tap Dusk. Then tap the stars in order, one, two, three!'},
{id:'n6flyHome',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
 start:[['moon','All the stars are shining again, and the star ponies are wide awake. Thank you, little one!'],
   ['moon','Nova, Comet, and Dusk want to live in your Pony Village. Here is a bundle of moon wood to build their cottages!'],
   ()=>LG.giftWood(NEW),['moon','Come back and visit any night. Sweet dreams!']],
 hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
{id:'n6build',icon:'🏠',text:'Build cottages for Nova, Comet, and Dusk in Pony Village.',goal:3,handin:true,
 prog:()=>NEW.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
 start:[()=>{LG.fillCottages(NEW);LG.giftWood(NEW);},['grandma','Welcome home, sweetie! Did you see the stars? They are so bright tonight!'],
   ['grandma','Nova, Comet, and Dusk need cozy cottages in Pony Village.'],
   ['narrator','Go to Pony Village. Then tap the hammer to build a cottage!']],
 hint:'Go to Pony Village and tap the hammer to build a cottage.'},
];
addChapter(N6Q);
N6Q.forEach(q=>{R('moon',q.hint);R('zip',q.hint);});
LG.NEED.n6fly='meadow';LG.NEED.n6flyHome='valley';LG.BUILD.add('n6build');
const isCh6=()=>qid().startsWith('n6');

// ===== State =====
const DEF={letterSeen:false,letterRead:false,met:false,blown:[],novaStar:false,novaAwake:false,cometAwake:false,cropsGiven:false,
  mill:null,pieces:[],duskAwake:false,duskStar:false,done:false};
function ensure(){if(!state.ch6||typeof state.ch6!=='object')state.ch6={};const C=state.ch6;
  for(const k in DEF)if(C[k]===undefined)C[k]=JSON.parse(JSON.stringify(DEF[k]));C._ok=1;
  for(const k of ['moonmelon','daisy'])if(!(state.inv[k]>=0))state.inv[k]=0;
  return C;}
const C6=()=>state.ch6&&state.ch6._ok?state.ch6:ensure();
const zipM=LG.messenger('meadow.zipLetter');
const zip={x:0,y:0,flip:false,dust:-9};
// ===== Shared functions we extend (wrapped, never replaced) =====
const awake=id=>{const C=state.ch6;return!!C&&(id==='nova'?C.novaAwake:id==='comet'?C.cometAwake:C.duskAwake);};
{const prev=ponyLook;ponyLook=function(id){const o=prev(id);
  if(o&&NEW.includes(id)&&!rescued(id)&&!awake(id))return Object.assign(o,{body:shadeHex(o.body,-.25),mane:o.mane.map(c=>shadeHex(c,-.35))});
  return o;};}
{const prev=drawPonyEnt;drawPonyEnt=function(id,t){if(NEW.includes(id)&&!rescued(id)&&!awake(id)){ART.sleepingStarPony(ents[id],id,t);return;}prev(id,t);};}
HOOK.init.push(()=>{const prev=walkable;walkable=function(x,y){if(BLOCK.has(K(x,y)))return false;return prev(x,y);};});
HOOK.keep.push(k=>{const q=qid();if(q==='n6garden'&&(k==='moonmelon'||k==='daisy'))return 2;return 0;});

// ===== Story =====
function readLetter(){if(qid()!=='n6letter')return;
  talk([['zip','Zoom, zoom! Special delivery! A letter from Mother Moon!'],
    ['moon','Dear little one. I am Mother Moon, and I watch over Moonlight Meadow.'],
    ['moon','Oh dear. Last night, three stars fell out of the sky! And without their stars, my star ponies are too sleepy to wake up.'],
    ['moon','Please fly your Rainbow Balloon to Moonlight Meadow and help us. Love, Mother Moon.'],
    ()=>{C6().letterRead=true;zipM.leave();}],completeQuest);}
function meetMoon(){player.path=[];player.action=null;C6().met=true;talk([
  ['moon','Hello, little one. Thank you for coming all the way to Moonlight Meadow.'],
  ['moon','My star ponies Nova, Comet, and Dusk are fast asleep. They need their stars back in the sky.'],
  ['moon','Here are some moon seeds: moon melons and dream daisies. Zip will water them with stardust.'],
  ()=>{state.seeds.moonmelon=state.seeds.daisy=true;refreshBar(true);sfx('sparkle');burst(player.x,player.y-1.2,'✨',10,1);}],completeQuest);}
function talkMoon(){burst(MOON.x,MOON.y-2.4,'💛',4);if(qid()==='n6meet')return meetMoon();
  if(isCh6()&&qid()!=='n6build')return talk([['moon',Q[state.quest].hint]]);
  say(pick(L.moonIdle),'moon');}
// ----- Dandelion puffs (world tap field) -----
function startPuffs(mode){const C=C6();
  if(mode==='story'){const items=PUFFS.map(([x,y],pi)=>({x,y,pi})).filter(o=>!C.blown.includes(o.pi));if(!items.length)return;
    LG.field({id:'puffs',mode,quest:'n6puffs',area:'meadow',items,art:'meadow.puff',r:.9,hy:.55,
      onPop:(it,left)=>{if(!C.blown.includes(it.pi))C.blown.push(it.pi);blowPuff(it,left);saveGame();},onDone:foundNovaStar});return;}
  const sp=LG.spotsNear(6,1.5,5);if(sp.length<4){say(L.noRoom,'narrator');return;}say(L.playPuffs,'nova');
  LG.field({id:'puffs',mode,area:hereArea(),items:sp,art:'meadow.puff',r:.9,hy:.55,onPop:(it,left)=>blowPuff(it,left),
    onDone:()=>{say(L.puffsDone,'nova');celebrate(true);if(rescued('nova')){addHeart('nova',2);ents.nova.hop=state.time;}saveGame();}});}
function blowPuff(it,left){sfx('pop');for(let i=0;i<6;i++)particles.push({x:it.x,y:it.y-.6,vx:rand(.3,1.4),vy:rand(-1.2,-.3),g:-.1,life:2.2,max:2.2,draw:ART.fluff});
  if(left)say(L.blow[it.i%L.blow.length],'narrator');}
function foundNovaStar(){const C=C6();if(C.novaStar)return;C.novaStar=true;sfx('fanfare');burst(DFIELD.x,DFIELD.y-.4,'✨',12,1);saveGame();
  talk([['narrator','There it is! A fallen star!']],completeQuest);}
// ----- Star Toss: push a fallen star back up into the sky (screen game) -----
function starToss(who,onDone){const W2=560,H2=420,S={y:H2-70,vy:0,drag:false,done:0,hits:0,said:0};
  const g=LG.screenGame({mode:'story',title:'⭐ Star Toss',titleSay:L.tossTitle,who:'moon',w:W2,h:H2,
    tap:(x,y)=>{if(S.done)return;if(Math.abs(x-W2/2)<90&&Math.abs(y-S.y)<90){S.drag=true;S.vy=-640;S.hits++;sfx('pop');if(S.hits%2)LG.screenSay(pick(L.tossUp),'narrator');}},
    move:(x,y,down)=>{if(S.done||!down||!S.drag)return;if(y<S.y)S.y=Math.max(70,y);},
    draw:(c,w,h,t)=>{const dt=1/60;if(!S.done){if(S.vy<0){S.y+=S.vy*dt;S.vy+=900*dt;if(S.vy>0)S.vy=0;}else if(S.y<h-70&&!S.drag)S.y=Math.min(h-70,S.y+60*dt);
        if(S.y<=95){S.done=t;sfx('fanfare');LG.screenSay(L.tossDone,'moon');LG.finishScreen(g,onDone,2200);}}
      if(t>1.4&&!S.said){S.said=1;LG.screenSay(L.tossSay,'moon');}
      ART.tossScene(w,h,t,S,who);}});
  g.S=S;$('lgCv').addEventListener('pointerup',()=>{S.drag=false;});}
function talkNova(){const C=C6(),q=qid(),e=ents.nova;
  if(!rescued('nova')&&q==='n6nova')return starToss('nova',()=>{C.novaAwake=true;e.hop=state.time;celebrate();burst(e.x,e.y-.9,'⭐',10,1.2);saveGame();
    talk([['nova','Yawn... Oh! My star is shining again! I feel so bright and happy!'],['nova','Thank you! I am Nova. Can I be your friend?']],()=>namePony('nova'));});
  if(!awake('nova'))return say(L.sleepy,'narrator');
  hearts(e);say(T2.shy,'nova');}
// ----- Mirror Lake fishing (screen game) -----
const CATCH=[{e:'🐟',say:L.catchFish},{e:'🐸',say:L.catchFrog},{e:'🐢',say:L.catchTurtle}];
function lakeFish(mode){const W2=640,H2=400,S={rip:[],net:null,n:0,said:0,last:0};
  for(let i=0;i<3;i++)S.rip.push({x:120+i*190,y:180+(i%2)*90,vx:(i%2?-1:1)*30,ph:i});
  if(mode==='play')say(L.lakePlay,'comet');
  const need=mode==='story'?4:5;
  const g=LG.screenGame({mode,quest:mode==='story'?'n6lake':null,title:'🎣 Mirror Lake',titleSay:L.lakeTitle,who:mode==='story'?'moon':'comet',w:W2,h:H2,
    tap:(x,y)=>{if(S.net||S.n>=need)return;let best=null,bd=90;for(const r of S.rip){const d=Math.hypot(x-r.x,y-r.y);if(d<bd){bd=d;best=r;}}if(!best)return;
      S.n++;const last=S.n>=need,it=mode==='story'&&last?{e:'⭐',say:L.catchStar}:CATCH[(S.n-1)%CATCH.length];
      S.net={x:best.x,y:best.y,t:S.last,it};sfx('water');setTimeout(()=>{if(LG.active()!==g)return;sfx(it.e==='⭐'?'fanfare':'sparkle');LG.screenSay(it.say,'narrator');},450);
      best.x=60+Math.random()*(W2-120);best.y=150+Math.random()*(H2-210);
      if(last)LG.finishScreen(g,()=>lakeDone(mode),2600);},
    draw:(c,w,h,t)=>{S.last=t;if(t>1.4&&!S.said){S.said=1;LG.screenSay(L.lakeSay,mode==='story'?'moon':'comet');}
      if(S.net&&t-S.net.t>2.1&&S.n<need)S.net=null;for(const r of S.rip){r.x+=r.vx/60;if(r.x<60||r.x>w-60)r.vx*=-1;}
      ART.lakeScene(w,h,t,S,need);}});g.S=S;}
function lakeDone(mode){if(mode!=='story'){say(L.lakeDone,'comet');celebrate(true);if(rescued('comet')){addHeart('comet',2);ents.comet.hop=state.time;}saveGame();return;}
  starToss('comet',()=>{const C=C6(),e=ents.comet;C.cometAwake=true;e.hop=state.time;celebrate();burst(e.x,e.y-.9,'☄️',8,1.2);saveGame();
    talk([['comet','Whoa! I am awake! My star is zooming across the sky again!'],['comet','Thank you! I am Comet. Can I come and live with you?']],()=>namePony('comet'));});}
function talkComet(){const q=qid(),e=ents.comet;if(!rescued('comet')&&q==='n6lake')return lakeFish('story');
  if(!awake('comet'))return say(L.sleepy,'narrator');hearts(e);say(T2.shy,'comet');}
// ----- Wish Windmill (staged builder) and the floating star pieces -----
function tapMill(){const C=C6(),q=qid();
  if(C.mill){sfx('sparkle');burst(MILL.x,MILL.y-2.4,'✨',6,.8);return say(L.millDone,'narrator');}
  if(q==='n6garden'){if(state.inv.moonmelon>=2&&state.inv.daisy>=2)return talk([()=>{state.inv.moonmelon-=2;state.inv.daisy-=2;C.cropsGiven=true;sfx('harvest');burst(MILL.x,MILL.y-1,'🍈',4,.8);refreshBar(true);},
      ['zip','Zoom, zoom! Moon melons and dream daisies! Now we can fix the windmill!']],completeQuest);
    return say(L.needCrops,'zip');}
  if(q==='n6mill')return LG.builder({mode:'story',quest:'n6mill',title:'🌬️ Fix the Wish Windmill',titleSay:L.millTitle,who:'zip',stages:MILL_STAGES,art:'meadow.millBuilder',
    onDone:ch=>{C.mill=ch;sfx('fanfare');celebrate();burst(MILL.x,MILL.y-2.5,'✨',16,1.4);saveGame();
      talk([['zip','Yay! The Wish Windmill is spinning again!']],completeQuest);}});
  say(L.needCrops,'zip');}
function startPieces(){const C=C6(),items=PIECES.map(([x,y],pi)=>({x,y,pi,bx:x,by:y})).filter(o=>!C.pieces.includes(o.pi));if(!items.length)return;
  LG.field({id:'pieces',mode:'story',quest:'n6pieces',area:'meadow',items,art:'meadow.starPiece',r:1,hy:.8,walkPop:.9,move:(it,dt,t)=>{it.y=it.by+Math.sin(t*1.4+it.ph)*.25;},
    onPop:(it,left)=>{if(!C.pieces.includes(it.pi))C.pieces.push(it.pi);sfx('sparkle');burst(it.x,it.y-.8,'✨',8,.8);floatText(it.x,it.y-1.2,'+1 ⭐');say(L.piece[left?1:0],'narrator');saveGame();},
    onDone:()=>{}});}
// ----- Star Bells: play a wake-up song for Dusk (screen game) -----
const BELLS=[{c:'#ff7eb6',f:523.3},{c:'#ffd83d',f:587.3},{c:'#5fc96b',f:659.3},{c:'#5fa8f5',f:784},{c:'#a77bd8',f:880}];
const TUNE=[0,0,3,3,4,4,3,2,2,1,1,0];
function bellGame(mode){const W2=640,H2=330,S={n:0,need:TUNE.length,hit:[],notes:[],said:0,end:0};
  if(mode==='play')say(L.bellPlay,'dusk');
  const g=LG.screenGame({mode,quest:mode==='story'?'n6bells':null,title:'🔔 Star Bells',titleSay:L.bellTitle,who:mode==='story'?'moon':'dusk',w:W2,h:H2,
    tap:(x,y)=>{if(S.n>=S.need)return;const i=Math.floor((x-40)/(W2-80)*5);if(i<0||i>4||y<130)return;
      if(actx){note(BELLS[i].f,actx.currentTime,.9,'sine',.25);note(BELLS[i].f*2,actx.currentTime,.4,'triangle',.05);}
      S.hit[i]=S.last;S.notes.push({i,t:S.last});const good=TUNE[S.n]===i;S.n++;if(good)S.notes.push({i,t:S.last,star:1});
      if(S.n===6)LG.screenSay(mode==='story'?L.bellHalf:L.bellDone,'narrator');
      if(S.n>=S.need){sfx('fanfare');LG.finishScreen(g,()=>bellDone(mode),1800);}},
    draw:(c,w,h,t)=>{S.last=t;if(t>1.4&&!S.said){S.said=1;LG.screenSay(L.bellSay,mode==='story'?'moon':'dusk');}ART.bellScene(w,h,t,S,BELLS,TUNE);}});g.S=S;}
function bellDone(mode){if(mode!=='story'){say(L.bellDone,'dusk');celebrate(true);if(rescued('dusk')){addHeart('dusk',2);ents.dusk.trick=state.time;}saveGame();return;}
  const C=C6(),e=ents.dusk;C.duskAwake=true;e.hop=state.time;burst(e.x,e.y-.9,'🎵',8,1);celebrate(true);saveGame();completeQuest();}
// ----- Connect the Stars: tap numbered stars in order to draw a pony in the sky (screen game) -----
const DOTS=[[.18,.78],[.24,.52],[.36,.36],[.46,.14],[.56,.3],[.74,.34],[.84,.5],[.7,.6],[.52,.58],[.46,.82]];
function connectStars(){const W2=600,H2=380,S={i:0,miss:0,done:0,said:0,last:0};
  const g=LG.screenGame({mode:'story',quest:'n6stars',title:'🌌 Connect the Stars',titleSay:L.dotsTitle,who:'moon',w:W2,h:H2,
    tap:(x,y)=>{if(S.done)return;let k=-1,bd=48;DOTS.forEach(([a,b],j)=>{const d=Math.hypot(x-a*W2,y-b*H2);if(d<bd){bd=d;k=j;}});if(k<0)return;
      if(k===S.i){S.i++;sfx('sparkle');if(actx)note(500+S.i*60,actx.currentTime,.4,'sine',.2);
        if(S.i>=DOTS.length){S.done=S.last;sfx('fanfare');LG.screenSay(L.dotsDone,'moon');LG.finishScreen(g,starsDone,3600);}}
      else if(k>=S.i){S.miss++;sfx('nope');LG.screenSay(L.dotsNext,'narrator');}},
    draw:(c,w,h,t)=>{S.last=t;if(t>1.4&&!S.said){S.said=1;LG.screenSay(L.dotsSay,'moon');}ART.dotsScene(w,h,t,S,DOTS);}});g.S=S;}
function starsDone(){const C=C6(),e=ents.dusk;C.duskStar=true;e.hop=state.time;celebrate();burst(e.x,e.y-1,'🌟',10,1.3);saveGame();
  talk([['dusk','My star is back in the sky, and it is a pony! It is the most beautiful thing I ever saw!'],['dusk','Thank you, {name}. Can I be your friend and live with you?']],()=>namePony('dusk'));}
function talkDusk(){const q=qid(),e=ents.dusk;
  if(!rescued('dusk')&&q==='n6bells')return bellGame('story');
  if(!rescued('dusk')&&q==='n6stars')return connectStars();
  if(!awake('dusk'))return say(L.sleepy,'narrator');hearts(e);say(T2.shy,'dusk');}
// ===== Zip, the little shooting star: follows her in the meadow and waters the moon garden with stardust =====
function zipUpdate(dt){const t=state.time;if(hereArea()!=='meadow')return;
  let best=null,bd=1e9;for(const k in state.plots){const p=state.plots[k];if(p.w)continue;const[x,y]=k.split(',').map(Number);if(areaAt(x,y)!=='meadow')continue;
    const d=dist(zip.x,zip.y,x+.5,y-.6);if(d<bd){bd=d;best={x,y,p};}}
  if(best&&C6().met){if(bd>16){zip.x=best.x+3;zip.y=best.y-3;}zip.flip=best.x+.5<zip.x;
    if(moveToward(zip,best.x+.5,best.y-.6,8,dt)){best.p.w=true;zip.dust=t;sfx('sparkle');burst(best.x+.5,best.y+.1,'✨',6,.5);}return;}
  if(dist(zip.x,zip.y,player.x,player.y)>12){zip.x=player.x+4;zip.y=player.y-3;}
  const tx=player.x+1.4+Math.cos(t*.8)*.8,ty=player.y-1.8+Math.sin(t*1.6)*.35;zip.flip=tx<zip.x;moveToward(zip,tx,ty,dist(zip.x,zip.y,tx,ty)>3?7:1.6,dt);}

// ===== Every frame =====
function resumeDone(q,C){switch(q){case 'n6letter':return C.letterRead;case 'n6meet':return C.met;case 'n6puffs':return C.novaStar;case 'n6nova':return rescued('nova');
  case 'n6lake':return rescued('comet');case 'n6garden':return C.cropsGiven;case 'n6mill':return!!C.mill;case 'n6pieces':return C.pieces.length>=5;
  case 'n6bells':return C.duskAwake;case 'n6stars':return rescued('dusk');}return false;}
HOOK.update.push(dt=>{const C=C6(),q=qid(),here=hereArea();
  zipM.update(dt,q==='n6letter');zipUpdate(dt);
  if(here==='meadow'&&q==='n6garden'){const want=state.inv.moonmelon<2?'moonmelon':state.inv.daisy<2?'daisy':null;if(want)LG.wantSeed(want);}
  if(here==='meadow'&&Math.random()<dt*.25){const x=rand(cam.x/ts,(cam.x+vw)/ts),y=cam.y/ts+rand(.5,3);particles.push({x,y,vx:-3,vy:1.5,g:0,life:.6,max:.6,draw:ART.shootingStar});}
  if(isCh6()){const qq=Q[state.quest];if(qq.goal){const s=`${Math.min(state.qprog,qq.goal)}/${qq.goal}`,el=$('objProg');if(el.textContent!==s)el.textContent=s;}}
  const busy=dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show');if(busy)return;
  if(q==='n6fly'&&here==='meadow')return completeQuest();
  if(q==='n6flyHome'&&here==='valley')return completeQuest();
  if(resumeDone(q,C))return completeQuest();
  if(here!=='meadow'){if(q==='n6build'&&!C.done&&Q[state.quest].prog()>=3&&NEW.every(id=>!ents[id].goHome)){C.done=true;
      talk([['narrator','Hooray! You put the stars back in the sky and woke up three star ponies!'],
        ['narrator','Tap a pony and press the play button. Nova, Comet, and Dusk have new games to play with you!'],
        ['narrator','You have helped every land the Rainbow Balloon can fly to. You are a true pony hero!']],()=>{celebrate();completeQuest();});}return;}
  const near=(e,r)=>dist(player.x,player.y,e.x,e.y)<r;
  if(q==='n6meet'&&near({x:MOON.x,y:MOON.y+1.5},2.6))return meetMoon();
  if(q==='n6puffs'&&!LG.active()&&C.blown.length<PUFFS.length&&near(DFIELD,6))startPuffs('story');
  if(q==='n6puffs'&&C.blown.length>=PUFFS.length&&!C.novaStar&&!LG.active())return foundNovaStar();
  if(q==='n6pieces'&&!LG.active()&&C.pieces.length<5)startPieces();
});

// ===== Taps =====
HOOK.tap.push((wx,wy)=>{const C=C6(),q=qid();
  if(q==='n6letter'&&zipM.hit(wx,wy)){goDo(zipM.x,zipM.y+1.2,2,readLetter,zipM);return true;}
  if(hereArea()!=='meadow')return false;
  const pad=PADS.meadow,onBalloon=state.balloonAt==='meadow'&&Math.abs(wx-pad.x)<1.1&&wy>pad.y-3.6&&wy<pad.y+.3;if(onBalloon)return false;
  if(dist(wx,wy,zip.x,zip.y)<.6){sfx('sparkle');burst(zip.x,zip.y,'✨',5,.5);say(isCh6()&&q!=='n6build'?Q[state.quest].hint:pick(L.zipIdle),'zip');return true;}
  if(dist(wx,wy,MOON.x,MOON.y-1.6)<1.5){goDo(MOON.x,MOON.y+1.4,2.2,talkMoon);return true;}
  if(Math.abs(wx-MILL.x)<1.4&&wy>MILL.y-3.6&&wy<MILL.y+.3){goDo(MILL.x,MILL.y+1.3,1.8,tapMill);return true;}
  if(q==='n6nova'&&!rescued('nova')&&dist(wx,wy,DFIELD.x+.9,DFIELD.y-.2)<1){goDo(DFIELD.x+.9,DFIELD.y+.6,1.6,talkNova);return true;}
  for(const id of NEW){if(rescued(id))continue;const e=ents[id];if(dist(wx,wy,e.x,e.y-.3)>1)continue;
    goDo(e.x,e.y+.2,1.9,id==='nova'?talkNova:id==='comet'?talkComet:talkDusk,e);return true;}
  if(q==='n6lake'&&wx>23.5&&wx<34.5&&wy>128.5&&wy<136){goDo(LAKE.x,LAKE.y+3.2,2.2,()=>lakeFish('story'));return true;}
  return false;});

// ===== Guiding arrow =====
const up=(e,h)=>({x:e.x,y:e.y-(h||.7)});
HOOK.target.push(()=>{if(!isCh6())return undefined;const C=C6(),q=qid();
  if(q==='n6letter')return zipM.leaving?null:{x:zipM.x,y:zipM.y-.2};
  if(q==='n6flyHome')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='n6build')return LG.villageTarget();
  const g=LG.goArea('meadow');if(g!==null)return g;
  switch(q){
    case 'n6fly':return null;
    case 'n6meet':return{x:MOON.x,y:MOON.y-2.2};
    case 'n6puffs':return up(DFIELD,.2);
    case 'n6nova':return{x:DFIELD.x+.9,y:DFIELD.y-.6};
    case 'n6lake':return up(ents.comet);
    case 'n6garden':{if(state.inv.moonmelon>=2&&state.inv.daisy>=2)return{x:MILL.x,y:MILL.y-2.4};return LG.cropTarget([state.inv.moonmelon<2?'moonmelon':'daisy'],'meadow');}
    case 'n6mill':return{x:MILL.x,y:MILL.y-2.4};
    case 'n6pieces':return null;
    case 'n6bells':case 'n6stars':return up(ents.dusk);}
  return null;});

// ===== Begin / land / play =====
HOOK.begin.push(isNew=>{const C=ensure();
  if(!isNew&&qid()==='freeEnd'&&!C.done){state.quest=qi('n6letter');state.qprog=0;updateObjective();}
  const q=qid();if(q==='n6letter')zipM.arrive();else zipM.leaving=true;
  if(!isNew&&q==='n6letter'&&!C.letterSeen)talk(Q[state.quest].start);
  zip.x=player.x+2;zip.y=player.y-2;});
HOOK.land.push(to=>{if(to==='meadow'){zip.x=player.x+2;zip.y=player.y-2.5;if(C6().met&&!isCh6())say(pick(L.zipIdle),'zip');}});
HOOK.play.nova=()=>startPuffs('play');
HOOK.play.comet=()=>lakeFish('play');
HOOK.play.dusk=()=>bellGame('play');
window.ch6Debug=()=>({zipM,zip});

// ===== Drawing hooks (all looks come from the ART table) =====
HOOK.layer.push((L,t,x0,y0,x1,y1)=>{zipM.layer(L,t);if(hereArea()!=='meadow')return;const C=C6(),s=ts,q=qid();
  const vis=(x,y,m)=>x>x0-(m||2)&&x<x1+(m||2)&&y>y0-(m||2)&&y<y1+(m||4);
  if(vis(MOON.x,MOON.y,4))L.push([MOON.y,()=>ART.motherMoon(SX(MOON.x),SY(MOON.y),s,t)]);
  if(vis(MILL.x,MILL.y,4))L.push([MILL.y,()=>ART.windmill(SX(MILL.x),SY(MILL.y),s,t,C.mill)]);
  DANDS.forEach(([x,y],i)=>{if(vis(x,y))L.push([y,()=>ART.dandelion(SX(x),SY(y),s,t,i)]);});
  const fieldOn=LG.active()&&LG.active().id==='puffs'&&LG.active().mode==='story';
  PUFFS.forEach(([x,y],i)=>{if(!vis(x,y))return;if(C.blown.includes(i))L.push([y,()=>ART.stem(SX(x),SY(y),s,t)]);else if(!fieldOn)L.push([y,()=>ART.puff({x,y,st:'on',ph:i},t)]);});
  if(C.novaStar&&!rescued('nova')&&!C.novaAwake&&vis(DFIELD.x,DFIELD.y))L.push([DFIELD.y+.1,()=>ART.fallenStar(SX(DFIELD.x+.9),SY(DFIELD.y),s,t)]);
  if(vis(LAKE.x,LAKE.y,6))L.push([LAKE.y-3,()=>ART.lakeGlow(t,q==='n6lake')]);
  L.push([zip.y+2,()=>ART.zip(SX(zip.x),SY(zip.y),s,t,zip.flip,t-zip.dust<.8)]);});
HOOK.overlay.push(t=>{if(hereArea()==='meadow')ART.nightSky(t,[C6().novaAwake,C6().cometAwake,C6().duskStar].filter(Boolean).length);});
// ===================== LandArt.meadow: every Moonlight Meadow look (swap any of these for sprite art) =====================
function mtreeSprite(kind){const s=ts;return getSprite('mtree'+kind,1.8*s,2.2*s,.9*s,2.05*s,()=>{ctx.lineJoin='round';ctx.lineCap='round';
  ctx.fillStyle=kind===1?'#e8e4f4':'#4a3a6a';ctx.strokeStyle=kind===1?'#9e98b8':'#2e2348';ctx.lineWidth=s*.035;ctx.beginPath();ctx.moveTo(-s*.13,0);ctx.quadraticCurveTo(-s*.07,-s*.1,-s*.07,-s*.7);
  ctx.lineTo(s*.07,-s*.7);ctx.quadraticCurveTo(s*.07,-s*.1,s*.13,0);ctx.closePath();ctx.fill();ctx.stroke();
  const B=[[-.36,-.85,.34],[.36,-.88,.34],[0,-.8,.36],[-.22,-1.22,.34],[.24,-1.25,.33],[0,-1.52,.3]];
  const dk=kind===2?'#3c4f9a':'#3a3d7a',md=kind===2?'#5268c0':'#4d529c',lt=kind===2?'#7d90e0':'#6c72c0';
  ctx.strokeStyle=dk;ctx.lineWidth=s*.05;for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.stroke();}ctx.fillStyle=md;for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.fill();}
  ctx.fillStyle=lt;for(const[a,b,r]of B.slice(2)){circ((a-.08)*s,(b-.1)*s,r*.5*s);ctx.fill();}
  ctx.fillStyle='rgba(220,230,255,.5)';for(const[a,b,r]of B.slice(3)){ell((a-.1)*s,(b-.16)*s,r*.25*s,r*.12*s);ctx.fill();}
  for(const[a,b]of[[-.3,-.9],[.28,-1.2],[.05,-1.5],[.4,-.75],[-.15,-1.3]]){ctx.fillStyle='#fff6c8';circ(a*s,b*s,s*.03);ctx.fill();}});}
ART.tree=function(x,y){const s=ts,h=hash(x,y),kind=h<.25?1:h>.7?2:0,cx=SX(x)+s/2,base=SY(y)+s*.9,spr=mtreeSprite(kind);shadow(cx,base,s*.44,s*.14);
  const k=Math.sin(nowS()*.9+h*12)*.02;ctx.save();ctx.translate(cx,base);ctx.transform(1,0,k,1,0,0);ctx.drawImage(spr,-spr._ox,-spr._oy,spr._w,spr._h);ctx.restore();};
ART.grassDeco=function(x,y,c,s,r){const X=x*s,Y=y*s;if(c!=='.')return;ctx.lineCap='round';
  if(r()<.35){const tx=X+s*(.2+r()*.6),ty=Y+s*(.4+r()*.5);ctx.strokeStyle='rgba(170,190,255,.35)';ctx.lineWidth=Math.max(1,s*.022);ctx.beginPath();
    for(let i=0;i<3;i++){ctx.moveTo(tx+(i-1)*s*.03,ty);ctx.quadraticCurveTo(tx+(i-1)*s*.05,ty-s*.08,tx+(i-1)*s*.07,ty-s*.14);}ctx.stroke();}
  const v=r();if(v<.12){const fx2=X+s*(.2+r()*.6),fy=Y+s*(.2+r()*.6);ctx.fillStyle='rgba(255,250,210,.25)';circ(fx2,fy,s*.07);ctx.fill();flower(fx2,fy,s*.025,r()<.5?'#fff6c8':'#cfe0ff');}
  else if(v<.18){ctx.fillStyle='rgba(255,255,255,.7)';const px=X+s*(.2+r()*.6),py=Y+s*(.2+r()*.6);for(let i=0;i<8;i++){const a=i*.785;ctx.fillRect(px+Math.cos(a)*s*.035,py+Math.sin(a)*s*.035,s*.012,s*.012);}}};
ART.nightSky=function(t,n){const g=getSprite('nvig|'+vw+'x'+vh,vw,vh,0,0,()=>{const gr=ctx.createRadialGradient(vw/2,vh*.55,Math.min(vw,vh)*.35,vw/2,vh*.55,Math.max(vw,vh)*.75);
    gr.addColorStop(0,'rgba(20,20,70,0)');gr.addColorStop(1,'rgba(20,20,70,.45)');ctx.fillStyle=gr;ctx.fillRect(0,0,vw,vh);},1);ctx.drawImage(g,0,0,vw,vh);
  const m=8+n*8;for(let i=0;i<m;i++){const x=hash(i,901)*vw,y=hash(i,902)*vh*.25+8,k=.5+.5*Math.sin(t*(1.5+hash(i,903))+i);twinkle(x,y,(2+hash(i,904)*3)*(.6+k*.6),k*.8);}};
ART.shootingStar=function(p,al){const s=ts,x=SX(p.x),y=SY(p.y);ctx.save();ctx.globalAlpha=al;const g=ctx.createLinearGradient(x,y,x+s*1.2,y-s*.6);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.strokeStyle=g;ctx.lineWidth=Math.max(1.5,s*.03);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+s*1.2,y-s*.6);ctx.stroke();ctx.restore();};
ART.motherMoon=function(X,Y,s,t){ctx.fillStyle='rgba(120,130,220,.35)';ell(X,Y,s*1.9,s*.45);ctx.fill();ctx.fillStyle='#5a62b8';ell(X,Y-s*.15,s*1.6,s*.5);ctx.fill();
  const b=Math.sin(t*.9)*s*.08,my=Y-s*2.3+b;ctx.globalAlpha=.55+.15*Math.sin(t*1.3);ctx.drawImage(glowSprite('#fff6c8'),X-s*2.2,my-s*2.2,s*4.4,s*4.4);ctx.globalAlpha=1;
  drawEmoji('🌝',X,my,s*2.2);ctx.fillStyle='rgba(255,170,200,.35)';circ(X-s*.55,my+s*.25,s*.18);ctx.fill();circ(X+s*.55,my+s*.25,s*.18);ctx.fill();
  for(let i=0;i<5;i++){const a=t*.5+i*1.25;drawStar(X+Math.cos(a)*s*1.6,my+Math.sin(a)*s*.9,s*.06,'#fff6a8',true);}};
ART.zipLetter=function(m,t){const s=ts,x=SX(m.x),y=SY(m.y);ART.zip(x,y,s,t,m.flip,false);drawEmoji('✉️',x+(m.flip?s*.25:-s*.25),y+s*.32,s*.32);};
ART.zip=function(X,Y,s,t,flip,dust){const b=Math.sin(t*4)*s*.06;ctx.save();ctx.globalAlpha=.8;const d=flip?1:-1;
  for(let i=0;i<4;i++){ctx.fillStyle=['#fff6a8','#ffd6f0','#cfe0ff','#fff'][i];circ(X+d*s*(.25+i*.15),Y+b+s*(.08+i*.03),s*(.08-i*.015));ctx.fill();}ctx.restore();
  ctx.globalAlpha=.6;ctx.drawImage(glowSprite('#fff6a8'),X-s*.45,Y-s*.45+b,s*.9,s*.9);ctx.globalAlpha=1;drawStar(X,Y+b,s*.2,'#ffd83d',false);
  ctx.fillStyle='#4a2c5e';circ(X-s*.06,Y+b-s*.01,s*.025);ctx.fill();circ(X+s*.06,Y+b-s*.01,s*.025);ctx.fill();ctx.strokeStyle='#4a2c5e';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.arc(X,Y+b+s*.03,s*.04,.2,Math.PI-.2);ctx.stroke();
  if(dust)for(let i=0;i<3;i++)twinkle(X+(i-1)*s*.2,Y+b+s*.3,s*.06,1);};
ART.dandelion=function(X,Y,s,t,i){ctx.strokeStyle='#7fae6a';ctx.lineWidth=Math.max(1,s*.025);const w=Math.sin(t*1.3+i)*s*.03;ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X+w,Y-s*.25,X+w*1.5,Y-s*.42);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';circ(X+w*1.5,Y-s*.45,s*.11);ctx.fill();ctx.fillStyle='#fff';for(let j=0;j<8;j++){const a=j*.785;circ(X+w*1.5+Math.cos(a)*s*.09,Y-s*.45+Math.sin(a)*s*.09,s*.018);ctx.fill();}};
ART.puff=function(it,t){const s=ts,X=SX(it.x),Y=SY(it.y),k=it.st==='pop'?Math.min(1,(t-it.t0)/.5):0,w=Math.sin(t*1.5+it.ph)*s*.05;
  ctx.strokeStyle='#8fbf78';ctx.lineWidth=Math.max(1.5,s*.04);ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X+w,Y-s*.35,X+w*1.4,Y-s*.62);ctx.stroke();
  if(k<1){const hx=X+w*1.4,hy=Y-s*.68,r=s*.3*(1-k*.5);ctx.save();ctx.globalAlpha=1-k;ctx.drawImage(glowSprite('#ffffff'),hx-r*1.6,hy-r*1.6,r*3.2,r*3.2);
    ctx.fillStyle='rgba(255,255,255,.45)';circ(hx,hy,r);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=Math.max(1,s*.015);
    for(let j=0;j<16;j++){const a=j/16*6.28;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(a)*r,hy+Math.sin(a)*r);ctx.stroke();ctx.fillStyle='#fff';circ(hx+Math.cos(a)*r,hy+Math.sin(a)*r,s*.025);ctx.fill();}
    ctx.restore();if(it.st==='on'&&Math.sin(t*3+it.ph*2)>.75)twinkle(hx+r,hy-r*.6,s*.07,1);}};
ART.stem=function(X,Y,s,t){ctx.strokeStyle='#8fbf78';ctx.lineWidth=Math.max(1.5,s*.04);ctx.beginPath();ctx.moveTo(X,Y);ctx.quadraticCurveTo(X,Y-s*.3,X+s*.03,Y-s*.55);ctx.stroke();ctx.fillStyle='#c9e0a8';circ(X+s*.03,Y-s*.57,s*.05);ctx.fill();};
ART.fluff=function(p,al){const s=ts,x=SX(p.x),y=SY(p.y);ctx.save();ctx.globalAlpha=al;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,s*.015);
  for(let j=0;j<5;j++){const a=j*1.256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*s*.06,y+Math.sin(a)*s*.06);ctx.stroke();}ctx.restore();};
ART.fallenStar=function(X,Y,s,t){const b=Math.abs(Math.sin(t*3))*s*.1;ctx.globalAlpha=.7;ctx.drawImage(glowSprite('#fff36b'),X-s*.7,Y-s*1.1-b,s*1.4,s*1.4);ctx.globalAlpha=1;drawStar(X,Y-s*.4-b,s*.28,'#ffd83d',false);
  ctx.fillStyle='#4a2c5e';circ(X-s*.08,Y-s*.42-b,s*.03);ctx.fill();circ(X+s*.08,Y-s*.42-b,s*.03);ctx.fill();};
ART.starPiece=function(it,t){const s=ts,X=SX(it.x),Y=SY(it.y)-s*.8;if(it.st==='pop'){const k=Math.min(1,(t-it.t0)/.6);ctx.globalAlpha=1-k;drawStar(X,Y-k*s,s*.2*(1+k),'#fff36b',true);ctx.globalAlpha=1;return;}
  ctx.fillStyle='rgba(20,20,60,.25)';ell(X,SY(it.y),s*.2,s*.06);ctx.fill();ctx.save();ctx.translate(X,Y);ctx.rotate(Math.sin(t*2+it.ph)*.4);drawStar(0,0,s*.17,'#fff36b',true);ctx.restore();
  twinkle(X+Math.cos(t*3+it.ph)*s*.3,Y+Math.sin(t*3+it.ph)*s*.2,s*.06,1);};
ART.lakeGlow=function(t,want){const s=ts,x=SX(28.6),y=SY(131.6);ctx.globalAlpha=.35+.1*Math.sin(t);drawEmoji('🌕',x,y,s*1.2);ctx.globalAlpha=1;
  for(let i=0;i<6;i++){const a=hash(i,71),b=hash(i,72),k=(t*.4+a)%1;ctx.strokeStyle=`rgba(255,255,255,${(.5*(1-k)).toFixed(2)})`;ctx.lineWidth=Math.max(1,s*.02);
    ell(SX(25+a*8),SY(130+b*4.5),s*(.1+k*.4),s*(.04+k*.14));ctx.stroke();}
  if(want){const k=.5+.5*Math.sin(t*3);ctx.globalAlpha=k;ctx.drawImage(glowSprite('#fff36b'),SX(29.5)-s*.6,SY(133)-s*.6,s*1.2,s*1.2);ctx.globalAlpha=1;}};
ART.sleepingStarPony=function(e,id,t){const s0=ts,o=Object.assign({},ponyLook(id),{flip:id==='dusk',walkT:0,moving:false}),s=s0*(o.scale||1),x=SX(e.x),y=SY(e.y)+s*.1;
  ctx.fillStyle='rgba(180,190,255,.25)';ell(x,y+s*.02,s*.7,s*.15);ctx.fill();drawHorse(x,y,o);
  const d=o.flip?-1:1,ex=x+d*s*.445,ey=y-s*.9;ctx.fillStyle=o.body;ell(ex,ey,s*.062,s*.074);ctx.fill();ctx.strokeStyle='#2a1f36';ctx.lineWidth=Math.max(1.2,s*.022);ctx.beginPath();ctx.arc(ex,ey-s*.012,s*.042,.25,Math.PI-.25);ctx.stroke();
  ctx.save();ctx.textAlign='center';for(let i=0;i<3;i++){const k=(nowS()*.45+i/3)%1;ctx.globalAlpha=Math.min(1,(1-k)*1.6);ctx.fillStyle='#fff';ctx.strokeStyle='#5a62b8';ctx.lineWidth=3;
    const zx=x+d*s*(.55+k*.5),zy=y-s*(1.15+k*.9);ctx.font=`bold ${Math.round(s0*(.2+k*.16))}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.strokeText('z',zx,zy);ctx.fillText('z',zx,zy);}ctx.restore();};
ART.windmillAt=function(X,Y,s,t,ch,ghost){ctx.lineJoin='round';ctx.lineWidth=Math.max(1,s*.035);
  ctx.fillStyle='#efe6d6';ctx.strokeStyle='#a8977c';ctx.beginPath();ctx.moveTo(X-s*.75,Y);ctx.lineTo(X-s*.5,Y-s*2.2);ctx.lineTo(X+s*.5,Y-s*2.2);ctx.lineTo(X+s*.75,Y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#6a4a8a';ctx.beginPath();ctx.moveTo(X-s*.2,Y);ctx.lineTo(X-s*.2,Y-s*.5);ctx.arc(X,Y-s*.5,s*.2,Math.PI,0);ctx.lineTo(X+s*.2,Y);ctx.fill();
  ctx.fillStyle='#fff3b0';circ(X,Y-s*1.3,s*.15);ctx.fill();
  const rc=ch&&ch.roof?ROOF[ch.roof]:'#8a7a9a';ctx.fillStyle=rc;ctx.strokeStyle=shadeHex(rc,-.3);ctx.beginPath();ctx.moveTo(X-s*.65,Y-s*2.15);ctx.quadraticCurveTo(X,Y-s*3.1,X+s*.65,Y-s*2.15);ctx.closePath();ctx.fill();ctx.stroke();
  const hx=X,hy=Y-s*2.05;if(ch&&ch.sail){const sc=SAIL[ch.sail],a0=ghost?t*.6:t*1.6;for(let i=0;i<4;i++){const a=a0+i*Math.PI/2;ctx.save();ctx.translate(hx,hy);ctx.rotate(a);
      ctx.fillStyle='#8a6a4a';ctx.fillRect(-s*.04,-s*1.35,s*.08,s*1.35);ctx.fillStyle=sc;ctx.strokeStyle=shadeHex(sc,-.25);rr(s*.04,-s*1.3,s*.36,s*1.0,s*.06);ctx.fill();ctx.stroke();ctx.restore();}}
  else{ctx.strokeStyle='#8a6a4a';ctx.lineWidth=s*.08;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-s*.5,hy+s*.9);ctx.stroke();ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+s*.3,hy-s*.6);ctx.stroke();}
  ctx.fillStyle='#d8c8a8';circ(hx,hy,s*.12);ctx.fill();
  if(ch&&ch.lamp){const ly=Y-s*3.1;ctx.globalAlpha=.6+.3*Math.sin(t*2);ctx.drawImage(glowSprite('#fff6a8'),X-s*.55,ly-s*.75,s*1.1,s*1.1);ctx.globalAlpha=1;drawEmoji(LAMP[ch.lamp],X,ly-s*.2,s*.42);}
  if(ch&&ch.flw){drawEmoji(MFLW[ch.flw],X-s*.85,Y-s*.1,s*.32);drawEmoji(MFLW[ch.flw],X+s*.88,Y-s*.08,s*.3);}};
ART.windmill=function(X,Y,s,t,ch){shadow(X,Y,s*.9,s*.18);ART.windmillAt(X,Y,s,t,ch);
  if(ch)for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;ctx.globalAlpha=1-k;ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();
    const yy=Y-s*(1+i*.5);ctx.moveTo(X+s*(1+k*2),yy);ctx.quadraticCurveTo(X+s*(1.4+k*2),yy-s*.15,X+s*(1.8+k*2),yy);ctx.stroke();ctx.globalAlpha=1;}
  if(!ch&&['n6garden','n6mill'].includes(qid())&&Math.sin(t*3)>.4)twinkle(X+s*.7,Y-s*2.4,s*.09,1);};
ART.millBuilder=function(w,h,t,g){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2b2f6e');gr.addColorStop(1,'#6a5fb8');ctx.fillStyle=gr;rr(0,0,w,h,24);ctx.fill();
  for(let i=0;i<20;i++)twinkle(hash(i,5)*w,hash(i,6)*h*.6,2+hash(i,7)*3,.5+.5*Math.sin(t*2+i));ctx.fillStyle='#3a3d7a';ell(w/2,h*.95,w*.45,h*.1);ctx.fill();
  const now=performance.now()/1000,b=g.pop?Math.max(0,1-(now-g.pop)/.35):0;
  ART.windmillAt(w/2,h*.93,62*(1+b*.04),t,Object.assign({},g.ch),!g.tada);
  if(g.tada){const k2=Math.min(1,(now-g.tada)/.6);for(let i=0;i<10;i++){const a=i/10*6.28+now;drawStar(w/2+Math.cos(a)*170*k2,h*.5+Math.sin(a)*110*k2,8,STARS[i%7].c,true);}}};
ART.tossScene=function(w,h,t,S,who){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#141a4a');gr.addColorStop(1,'#5a4fa8');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
  for(let i=0;i<30;i++)twinkle(hash(i,11)*w,hash(i,12)*h*.7,1.5+hash(i,13)*2.5,.4+.6*Math.abs(Math.sin(t*1.5+i)));
  ctx.fillStyle='#3a3d7a';ell(w/2,h+20,w*.7,70);ctx.fill();
  const sy=78,k=.5+.5*Math.sin(t*3);ctx.strokeStyle=`rgba(255,246,168,${(.5+.5*k).toFixed(2)})`;ctx.lineWidth=3;ctx.setLineDash([6,6]);starPath(w/2,sy,32);ctx.stroke();ctx.setLineDash([]);
  if(!S.done){ctx.globalAlpha=.6;ctx.drawImage(glowSprite('#fff36b'),w/2-70,S.y-70,140,140);ctx.globalAlpha=1;drawStar(w/2,S.y,34,'#ffd83d',false);
    ctx.fillStyle='#4a2c5e';circ(w/2-10,S.y-2,4);ctx.fill();circ(w/2+10,S.y-2,4);ctx.fill();
    const a=Math.sin(t*4)*8;drawEmoji('👆',w/2+60,S.y+30+a,40);for(let i=0;i<3;i++){const yy=S.y-60-i*26-((t*40)%26);ctx.globalAlpha=.5;drawEmoji('⬆️',w/2,yy,22);ctx.globalAlpha=1;}}
  else{const k2=Math.min(1,(t-S.done)/1);ctx.globalAlpha=.8;ctx.drawImage(glowSprite('#fff36b'),w/2-90*(1+k2),sy-90*(1+k2),180*(1+k2),180*(1+k2));ctx.globalAlpha=1;drawStar(w/2,sy,34+6*Math.sin(t*6),'#ffd83d',true);
    for(let i=0;i<12;i++){const a=i/12*6.28+t;drawStar(w/2+Math.cos(a)*120*k2,sy+Math.sin(a)*60*k2,6,STARS[i%7].c,true);}}
  const o=Object.assign({},ponyLook(who),{flip:false,walkT:0,moving:false});const sTs=ts;ts=90;drawHorse(80,h-18,o);ts=sTs;};
ART.lakeScene=function(w,h,t,S,need){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#141a4a');gr.addColorStop(.3,'#2b3a8a');gr.addColorStop(1,'#1b2a6a');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#3a4fa0';ell(w/2,h*.62,w*.48,h*.36);ctx.fill();ctx.globalAlpha=.5;drawEmoji('🌕',w*.7,h*.45,70);ctx.globalAlpha=1;
  for(let i=0;i<14;i++)twinkle(hash(i,21)*w,hash(i,22)*h*.22,2+hash(i,23)*2,.5+.5*Math.sin(t*2+i));
  for(const r of S.rip){const k=(t*.8+r.ph*.3)%1;ctx.globalAlpha=.55+.3*Math.sin(t*3+r.ph);ctx.drawImage(glowSprite('#fff6c8'),r.x-40,r.y-26,80,52);ctx.globalAlpha=1;
    ctx.strokeStyle=`rgba(255,255,255,${(.8*(1-k)).toFixed(2)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(r.x,r.y,14+k*30,5+k*11,0,0,Math.PI*2);ctx.stroke();}
  if(S.net){const k=Math.min(1,(t-S.net.t)/.45),k2=Math.max(0,(t-S.net.t-.45)/1.6);const nx=S.net.x,ny=S.net.y-k*30;
    if(k2<1){ctx.strokeStyle='#c98e55';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(nx+60,ny-70);ctx.lineTo(nx+18,ny-14);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(nx,ny,24,12,0,0,Math.PI*2);ctx.stroke();
      if(k>=1){drawEmoji(S.net.it.e,nx,ny-26-k2*30,44+k2*10);}}}
  ctx.fillStyle='#2e8a4a';for(const[x,y]of[[60,h-40],[w-70,h-50],[120,h-20]]){ell(x,y,26,10);ctx.fill();}
  for(let i=0;i<need;i++){const x=w/2-(need-1)*20+i*40;drawEmoji('🎣',x,30,i<S.n?28:22,false,i<S.n?1:.35);}};
ART.bellScene=function(w,h,t,S,bells,tune){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1d2260');gr.addColorStop(1,'#4a3f98');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
  for(let i=0;i<24;i++)twinkle(hash(i,31)*w,hash(i,32)*h*.4,2+hash(i,33)*2,.4+.6*Math.abs(Math.sin(t*1.7+i)));
  const k=Math.min(1,S.n/S.need),o=Object.assign({},ponyLook('dusk'),{flip:false,walkT:0,moving:false});if(k<1){o.body=mix('#5a4f86',PONIES.dusk.look.body,k);}const sTs=ts;ts=80;drawHorse(w/2,112,o);ts=sTs;
  if(k<1){ctx.save();ctx.font='bold 22px "Comic Sans MS",sans-serif';ctx.fillStyle='#fff';ctx.globalAlpha=1-k;ctx.fillText('z z z',w/2+40,40+Math.sin(t*2)*4);ctx.restore();}
  ctx.fillStyle='rgba(255,255,255,.25)';rr(w/2-120,14,240,12,6);ctx.fill();ctx.fillStyle='#ffd83d';rr(w/2-120,14,240*k,12,6);ctx.fill();
  const bw=(w-80)/5,nxt=tune[S.n];for(let i=0;i<5;i++){const x=40+bw*i+bw/2,y=230,hit=S.hit[i]!=null?Math.max(0,1-(S.last-S.hit[i])/.5):0,sw2=Math.sin(S.last*20)*hit*.3;
    if(i===nxt&&S.n<S.need){ctx.globalAlpha=.5+.4*Math.sin(t*5);ctx.drawImage(glowSprite('#fff6a8'),x-60,y-70,120,120);ctx.globalAlpha=1;}
    ctx.save();ctx.translate(x,y-50);ctx.rotate(sw2);ctx.fillStyle=bells[i].c;ctx.strokeStyle=shadeHex(bells[i].c,-.3);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,50);ctx.quadraticCurveTo(-30,0,0,-6);
    ctx.quadraticCurveTo(30,0,34,50);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.4)';ell(-12,18,6,18);ctx.fill();ctx.fillStyle=shadeHex(bells[i].c,-.3);circ(0,54,8);ctx.fill();ctx.restore();
    drawStar(x,y-60,8,'#fff6a8',hit>0);}
  for(const n of S.notes){const a=(S.last-n.t)/1.4;if(a>1)continue;const x=40+bw*n.i+bw/2+(n.star?20:0);ctx.globalAlpha=1-a;n.star?drawStar(x,170-a*120,8,'#ffd83d',true):drawEmoji('🎵',x,170-a*120,28);ctx.globalAlpha=1;}
  S.notes=S.notes.filter(n=>S.last-n.t<1.4);};
ART.dotsScene=function(w,h,t,S,dots){ctx.fillStyle='#141a4a';ctx.fillRect(0,0,w,h);for(let i=0;i<40;i++)twinkle(hash(i,41)*w,hash(i,42)*h,1+hash(i,43)*2,.3+.5*Math.abs(Math.sin(t+i)));
  const P=dots.map(([a,b])=>[a*w,b*h]);ctx.strokeStyle='rgba(255,246,168,.9)';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();for(let i=0;i<S.i;i++){const[x,y]=P[i];if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
  if(S.done){ctx.lineTo(P[0][0],P[0][1]);}ctx.stroke();
  if(S.done){const k=Math.min(1,(t-S.done)/1.5);ctx.globalAlpha=k*.35;ctx.fillStyle='#fff6a8';ctx.beginPath();P.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    const o=Object.assign({},ponyLook('dusk'),{flip:false,walkT:t*12,moving:true,body:'#fff6c8',mane:['#ffd83d','#fff','#ffd83d']}),sTs=ts;ts=70;ctx.globalAlpha=k;drawHorse(-60+((t-S.done)*160)%(w+120),h-30,o);ctx.globalAlpha=1;ts=sTs;}
  P.forEach(([x,y],i)=>{const next=i===S.i&&!S.done,got=i<S.i||S.done;if(next){ctx.globalAlpha=.6+.4*Math.sin(t*5);ctx.drawImage(glowSprite('#fff6a8'),x-36,y-36,72,72);ctx.globalAlpha=1;}
    drawStar(x,y,got?15:12,got?'#ffd83d':'#c9c9ff',got);ctx.save();ctx.font='bold 18px "Comic Sans MS",sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(String(i+1),x,y+34);ctx.restore();});};
ART.flightScene=function(gy,s,t){ctx.fillStyle='#3a3d7a';ell(vw*.3,gy+vh*.12,vw*.5,vh*.24);ctx.fill();ctx.fillStyle='#4d529c';ell(vw*.8,gy+vh*.16,vw*.5,vh*.26);ctx.fill();
  drawEmoji('🌝',vw*.72,gy-s*1.2,s*1.3);drawEmoji('🌳',vw*.15,gy-s*.1,s*.9);drawEmoji('🌼',vw*.4,gy+s*.3,s*.5);drawEmoji('⭐',vw*.55,gy-s*.8+Math.sin(t*3)*s*.1,s*.5);
  for(let i=0;i<6;i++)twinkle(vw*hash(i,51),gy-s*(1+hash(i,52)*2),s*.08,1);};
})();
