'use strict';
// ---------- Chapter 5: The Mermaid Lagoon ----------
// A magic bubble brings Princess Marina's message in a bottle. In the lagoon she pops bubbles to free Coral, collects seashells
// with Pinch the crab, rebuilds the Seashell Palace, plays the clam memory game to find Pearl, and rides Splash the dolphin
// to rescue Misty. A magic bubble lets her walk on the reef under the sea. All drawing is in LandArt.lagoon at the bottom.
(()=>{
const R=reg,ART=LandArt.lagoon,NEW=['coral','pearl','misty'];
const CUPCAKE='Mmm! A cupcake! I love cupcakes!';

// ===== Speakers, ponies, crops =====
Object.assign(SPK,{
  marina:{n:'Princess Marina',f:'🧜‍♀️',p:1.2,r:.93},
  pinch:{n:'Pinch',f:'🦀',p:1.3,r:1.05},
  splash:{n:'Splash',f:'🐬',p:1.7,r:1.1},
  coral:{n:'Coral',f:'🐴',portrait:true,p:1.5,r:1.05},
  pearl:{n:'Pearl',f:'🐴',portrait:true,p:1.45,r:.95},
  misty:{n:'Misty',f:'🐴',portrait:true,p:1.35,r:1}});
Object.assign(PONIES,{
  coral:{names:['Coral','Bubbles','Wavy','Starla'],fav:'seagrape',acc:'🌺',home:{x:15.5,y:101.4},
    look:{body:'#ffc2b8',mane:['#ff6f61','#ffd1c9','#ff9a8b'],hoof:'#e0566a',snout:'#ffe6e1',wings:'#a8ecff',scale:.78,assetId:'coral'}},
  pearl:{names:['Pearl','Shelly','Opal','Sandy'],fav:'melon',acc:'🐚',home:{x:27.0,y:106.5},
    look:{body:'#f6f8ff',mane:['#bfe9ff','#e6d6ff','#ffffff','#ffd6ec'],hoof:'#9fb8e0',snout:'#ffffff',wings:'#dff6ff',scale:.74,assetId:'pearl'}},
  misty:{names:['Misty','Marina','Ripple','Splashy'],fav:'seagrape',acc:'🌊',home:{x:35.6,y:102.6},
    look:{body:'#b2ecef',mane:['#2fa9bd','#7fd9e0','#d0fbff'],hoof:'#2f8fa0',snout:'#e6fdff',wings:'#c6f7ff',scale:.82,assetId:'misty'}}});
PONY_IDS.push(...NEW);
for(const id of NEW){PONIES[id].names.forEach(n=>R('narrator',n));
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(id,T2[k]);R(id,CUPCAKE);}
Object.assign(CROPS,{
  seagrape:{e:'🍇',name:'sea grape',st:['','🌱','🌿','🍇']},
  melon:{e:'🍉',name:'beach melon',st:['','🌱','🌿','🍉']}});
Object.assign(ICON,{seagrape:'🍇',melon:'🍉'});
Object.assign(PRICE,{seagrape:4,melon:5});
Object.assign(ITEM_NAMES,{seagrape:'Sea grapes',melon:'Beach melons'});
FOODS.push('seagrape','melon');
if(window.VIL_PERSONA)Object.assign(VIL_PERSONA,{coral:{likes:['pond','playground']},pearl:{likes:['pond','garden','nap']},misty:{likes:['pond','follow']}});

// ===== The land: x0-43, y80-111 =====
Object.assign(AREAS.lagoon,{name:R('narrator','Mermaid Lagoon'),icon:'🧜‍♀️',sky:['#7fd8ff','#e0fbff'],
  go:R('narrator','Off to Mermaid Lagoon!'),seeds:['seagrape','melon','strawberry','carrot'],
  cam:{x0:3,y0:82,x1:41,y1:110},unlocked:()=>state.quest>=qi('m5fly')});
PADS.lagoon={x:9.5,y:88.4};
const PAL={x:32.5,y:91.4},MARINA={x:28.8,y:93.2},CORALP={x:15.5,y:101.4},DOCK={x:36.5,y:104.5},SPLASH={x:39.4,y:104.8};
const CLAMS=[{x:22.5,y:104.4},{x:25.5,y:105.9},{x:28.5,y:104.4}];
const SHELLS=[[7.5,86.5],[9.5,90.6],[12.5,84.5],[16.5,90.5],[20.5,85.5],[23.5,89.5],[22.5,91.6],[6.5,89.5]];
const CORALS=[[10,97],[12,105],[19,98],[33,100],[35,96],[9,103],[31,106],[37,99]];
{const T=(x0,y0,x1,y1,c)=>rect(x0,y0,x1,y1,c);
  T(0,80,43,111,'w');T(5,83,25,92,'d');T(18,92,22,95,'d');T(7,95,38,107,'u');T(26,86,38,94,'u');
  [[5,83],[6,83],[25,83],[25,84],[5,92],[38,86],[38,107],[7,107],[7,95],[37,107],[38,95]].forEach(([x,y])=>map[y][x]='w');
  [[6,84],[7,91],[24,84],[19,83],[11,83],[5,88]].forEach(([x,y])=>map[y][x]='T');
  T(14,86,18,87,'S');}
const K=(x,y)=>x+y*W,BLOCK=new Set();
for(let x=31;x<=34;x++)for(let y=89;y<=90;y++)BLOCK.add(K(x,y));
CLAMS.forEach(c=>BLOCK.add(K(Math.floor(c.x),Math.floor(c.y-.3))));
CORALS.forEach(([x,y])=>BLOCK.add(K(x,y)));BLOCK.add(K(28,92));
SIGNS.push({x:12.6,y:89.7,text:'Mermaid Lagoon'},{x:19.6,y:88.6,text:'Beach Garden'},{x:27.4,y:95.7,text:'Seashell Palace'},
  {x:21.6,y:97.6,text:'Coral Reef'},{x:35.4,y:103.4,text:'Dolphin Dock'});

// ===== Spoken lines (said with say(), so registered) =====
const L={
  marinaIdle:[R('marina','The sea is so happy you are here!'),R('marina','Splish, splash! Welcome to my lagoon!')],
  pinchIdle:[R('pinch','Click, click! Hello, friend!'),R('pinch','I love the beach! Click, click!')],
  splashIdle:[R('splash','Eee eee! Hello!'),R('splash','Eee eee! Want to swim?')],
  bubbleHi:R('narrator','Somebody is stuck inside a giant bubble!'),
  pop:[R('narrator','Pop! A little fish!'),R('narrator','Pop! A starfish!'),R('narrator','Pop! A shiny pearl!'),R('narrator','Pop! So many bubbles!')],
  coralHungry:R('coral','Do you have sea grapes for me?'),
  shell:R('narrator','A pretty seashell!'),
  needShells:R('pinch','Click, click! Find more seashells on the beach!'),
  ruins:R('marina','My poor palace. Let us build it again!'),
  palaceDone:R('marina','My beautiful palace!'),
  clamClosed:R('narrator','The giant clam is closed tight.'),
  clamTitle:R('marina','Clam Match'),matchPlay:R('pearl','Clam Match! Find two that are the same!'),
  matchStart:R('marina','Tap two clams to open them. Find two that are the same!'),
  match:[R('narrator','A match!'),R('narrator','Hooray! They are the same!')],
  noMatch:R('narrator','Not the same. Try again!'),
  pearlHungry:R('pearl','Do you have a beach melon for me?'),
  rideTitle:R('splash','Dolphin Ride'),
  rideStart:R('splash','Eee eee! Move your finger up and down to swim. Catch the sparkles!'),
  rideHalf:R('splash','Eee eee! You are doing great!'),
  rideSee:R('splash','Look! There she is!'),
  ridePlay:R('misty','Let us ride with Splash and catch sparkles!'),rideDone:R('misty','Wheee! That was so fun!'),
  palaceTitle:R('marina','Build the Seashell Palace'),
  playBubbles:R('coral','Bubbles! Pop them all!'),bubblesDone:R('coral','Pop, pop, pop! Hee hee!'),
  matchDone:R('pearl','You found them all! You are so smart!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  bubbleOn:R('narrator','A magic bubble! Now you can walk under the sea!'),
};
const CARDS=['🐠','🐙','🦀','⭐','🐳','🐚'];
const NAME={pink:R('narrator','Pink'),blue:R('narrator','Blue'),purple:R('narrator','Purple'),gold:R('narrator','Gold'),
  shells:R('narrator','Seashells'),stars:R('narrator','Starfish'),flowers:R('narrator','Flowers'),jewels:R('narrator','Jewels'),
  crown:R('narrator','A crown'),heart:R('narrator','A heart'),star:R('narrator','A star'),moon:R('narrator','A moon'),
  fpink:R('narrator','Pink flags'),fblue:R('narrator','Blue flags'),fyellow:R('narrator','Yellow flags'),fgreen:R('narrator','Green flags')};
const TOWER={pink:'#ffc2dc',blue:'#a9e2ff',purple:'#dcc6ff',gold:'#ffe7a0'},DECOR={shells:'🐚',stars:'⭐',flowers:'🌸',jewels:'💎'};
const TOP={crown:'👑',heart:'💗',star:'🌟',moon:'🌙'},FLAG={pink:'#ff6fb5',blue:'#4f9be8',yellow:'#ffd83d',green:'#5fc96b'};
const sw=c=>`<span class="lgSw" style="background:${c}"></span>`;
const PALACE_STAGES=[
  {id:'tower',say:R('marina','Pick a color for the towers!'),opts:Object.keys(TOWER).map(k=>({k,html:sw(TOWER[k]),say:NAME[k]}))},
  {id:'decor',say:R('marina','What should we put on the walls?'),opts:Object.keys(DECOR).map(k=>({k,html:DECOR[k],say:NAME[k]}))},
  {id:'top',say:R('marina','What goes on the very top?'),opts:Object.keys(TOP).map(k=>({k,html:TOP[k],say:NAME[k]}))},
  {id:'flag',say:R('marina','Pick the flags!'),opts:Object.keys(FLAG).map(k=>({k,html:sw(FLAG[k]),say:NAME['f'+k]}))}];

// ===== Quests =====
const M5Q=[
{id:'m5letter',icon:'🌊',chapter:'The Mermaid Lagoon',chapterIcon:'🧜‍♀️',text:'A big bubble with a bottle inside is floating to you! Tap the bubble.',
 start:[['narrator','Look! A big shiny bubble is floating this way. There is a bottle inside!'],()=>{C5().letterSeen=true;bub.arrive();}],
 hint:'Tap the big shiny bubble to get the bottle!'},
{id:'m5fly',icon:'🎈',text:'Fly the Rainbow Balloon to Mermaid Lagoon.',
 start:[['grandma','A mermaid princess needs your help! Tap the Rainbow Balloon!']],
 hint:'Tap the Rainbow Balloon. Then tap the Mermaid Lagoon picture!'},
{id:'m5meet',icon:'🧜‍♀️',text:'Say hello to Princess Marina by the broken palace.',
 start:[['narrator','Welcome to Mermaid Lagoon! Look at the sparkly blue sea!'],
   ['pinch','Click, click! Hello! I am Pinch the crab. The princess is waiting for you by her palace!']],
 hint:'Princess Marina is next to her broken palace. Follow the arrow!'},
{id:'m5bubbles',icon:'🐠',text:'Pop the bubbles to free the little sea pony!',goal:8,handin:true,prog:()=>C5().popped,
 start:[['narrator','Tap the bubbles to pop them!']],
 hint:'Walk onto the coral reef. Then tap the bubbles to pop them!'},
{id:'m5coral',icon:'🍇',text:'Grow sea grapes and give them to the little sea pony.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.seagrape),
 start:[['marina','Plant sea grape seeds in the beach garden. Water them, and they will grow!'],()=>{state.seed='seagrape';refreshBar(true);}],
 hint:'Plant sea grape seeds in the beach garden and water them. Then give sea grapes to the sea pony.'},
{id:'m5shells',icon:'🐚',text:'Collect 8 seashells on the beach for the palace.',goal:8,prog:()=>C5().shells.length,
 start:[['marina','Now let us fix my palace! We need seashells.'],['pinch','Click, click! I saw lots of seashells on the beach! Let us find 8!']],
 hint:'Walk on the beach and pick up 8 seashells. Follow the arrow!'},
{id:'m5palace',icon:'🏰',text:'Build the Seashell Palace! Tap the broken palace.',
 start:[['marina','You found 8 seashells! Now tap my broken palace, and let us build it together!']],
 hint:'Tap the broken palace. Then pick the colors and shells you like!'},
{id:'m5clams',icon:'🦪',text:'Play the clam game to find who is hiding. Tap a giant clam.',
 start:[['marina','My palace is beautiful again! Thank you!'],['marina','Listen! Someone is giggling inside the giant clams on the reef.'],
   ['marina','The clams only open when you find two that are the same. Tap a giant clam to play!']],
 hint:'Tap a giant clam on the reef. Then find two that are the same!'},
{id:'m5pearl',icon:'🍉',text:'Grow a beach melon and give it to Pearl.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.melon),
 start:[()=>{state.seed='melon';refreshBar(true);},['narrator','Plant beach melon seeds in the beach garden. Then give a beach melon to Pearl!']],
 hint:'Plant beach melon seeds in the beach garden. Then give a beach melon to Pearl.'},
{id:'m5misty',icon:'🐬',text:'Ride Splash the dolphin to find the last sea pony! Tap Splash.',
 start:[['marina','One more sea pony is lost, far out in the big blue sea.'],['marina','Splash the dolphin can take you there. He is waiting at the Dolphin Dock!']],
 hint:'Go to the Dolphin Dock and tap Splash. Then move your finger up and down to swim!'},
{id:'m5flyHome',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
 start:[['marina','You saved Coral, Pearl, and Misty, and you fixed my palace! Hooray!'],
   ['marina','Your new friends want to live in your Pony Village. Here is a big bundle of magic driftwood to build their cottages!'],
   ()=>LG.giftWood(NEW),['marina','Come back and swim with us any time!']],
 hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
{id:'m5build',icon:'🏠',text:'Build cottages for Coral, Pearl, and Misty in Pony Village.',goal:3,handin:true,
 prog:()=>NEW.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
 start:[()=>{LG.fillCottages(NEW);LG.giftWood(NEW);},['grandma','Welcome home, sweetie! You smell like the sea!'],
   ['grandma','Coral, Pearl, and Misty need cozy cottages in Pony Village.'],
   ['narrator','Go to Pony Village. Then tap the hammer to build a cottage!']],
 hint:'Go to Pony Village and tap the hammer to build a cottage.'},
];
addChapter(M5Q);
M5Q.forEach(q=>{R('marina',q.hint);R('pinch',q.hint);});
LG.NEED.m5fly='lagoon';LG.NEED.m5flyHome='valley';LG.BUILD.add('m5build');
const isCh5=()=>qid().startsWith('m5');

// ===== State =====
const DEF={letterSeen:false,letterRead:false,met:false,popped:0,coralFree:false,shells:[],palace:null,pearlFound:false,mistyFound:false,done:false};
function ensure(){if(!state.ch5||typeof state.ch5!=='object')state.ch5={};const C=state.ch5;
  for(const k in DEF)if(C[k]===undefined)C[k]=JSON.parse(JSON.stringify(DEF[k]));
  for(const k of ['seagrape','melon'])if(!(state.inv[k]>=0))state.inv[k]=0;
  return C;}
const C5=()=>state.ch5||ensure();
const bub=LG.messenger('lagoon.bottle');
const pinch={x:12.5,y:90.4,tx:null,flip:false,walkT:0,moving:false};
let ride=null;
// ===== Shared functions we extend (wrapped, never replaced) =====
{const prev=drawPonyEnt;drawPonyEnt=function(id,t){const C=state.ch5;
  if(C&&!rescued(id)){
    if(id==='coral'&&!C.coralFree){prev(id,t);ART.bigBubble(ents.coral,t);return;}
    if(id==='pearl'&&!C.pearlFound)return;
    if(id==='misty'&&!C.mistyFound)return;}
  prev(id,t);};}
HOOK.init.push(()=>{const prev=walkable;walkable=function(x,y){if(BLOCK.has(K(x,y)))return false;return prev(x,y);};});
HOOK.keep.push(k=>{const q=qid();if(q==='m5coral'&&k==='seagrape')return 1;if(q==='m5pearl'&&k==='melon')return 1;return 0;});
const onReef=(x,y)=>{const r=map[Math.floor(y)];return!!r&&r[Math.floor(x)]==='u';};

// ===== Story =====
function readLetter(){if(qid()!=='m5letter')return;
  talk([['narrator','Pop! The bubble had a message in a bottle!'],
    ['marina','Dear friend. I am Princess Marina, the mermaid princess of Mermaid Lagoon.'],
    ['marina','A big storm broke my seashell palace, and three little sea ponies got lost in the waves!'],
    ['marina','Please fly your Rainbow Balloon to Mermaid Lagoon and help us. Love, Princess Marina.'],
    ()=>{C5().letterRead=true;bub.leave();}],completeQuest);}
function meetMarina(){player.path=[];player.action=null;C5().met=true;talk([
  ['marina','Hello, {name}! I am Princess Marina. Thank you for coming!'],
  ['marina','The storm broke my seashell palace, and three little sea ponies got lost.'],
  ['marina','Here are some beach seeds: sea grapes and beach melons!'],
  ()=>{state.seeds.seagrape=state.seeds.melon=true;refreshBar(true);sfx('sparkle');burst(player.x,player.y-1.2,'✨',10,1);},
  ['marina','Listen! I hear a little sea pony on the coral reef. She is stuck inside a giant bubble!']],completeQuest);}
function talkMarina(){burst(MARINA.x,MARINA.y-1.4,'💖',4);const q=qid();
  if(q==='m5meet')return meetMarina();
  if(q==='m5palace')return tapPalace();
  if(isCh5()&&q!=='m5build')return talk([['marina',Q[state.quest].hint]]);
  say(pick(L.marinaIdle),'marina');}
function startBubbles(mode){const C=C5();
  if(mode==='story'){const n=8-C.popped;if(n<=0)return;const items=[];
    for(let i=0;i<n;i++){const a=i/n*6.28+.4,r=1.6+(i%3)*.55;items.push({x:CORALP.x+Math.cos(a)*r*1.3,y:CORALP.y+Math.sin(a)*r*.8,bx:CORALP.x+Math.cos(a)*r*1.3,by:CORALP.y+Math.sin(a)*r*.8});}
    LG.field({id:'bubbles',mode,quest:'m5bubbles',area:'lagoon',items,art:'lagoon.bubble',r:.85,hy:.6,move:bobble,
      onPop:(it,left)=>{C.popped++;bubblePop(it);saveGame();},onDone:freeCoral});return;}
  const sp=LG.spotsNear(7,1.4,5);if(sp.length<4){say(L.noRoom,'narrator');return;}say(L.playBubbles,'coral');
  LG.field({id:'bubbles',mode,area:hereArea(),items:sp.map(o=>({x:o.x,y:o.y,bx:o.x,by:o.y})),art:'lagoon.bubble',r:.85,hy:.6,move:bobble,onPop:it=>bubblePop(it),
    onDone:()=>{say(L.bubblesDone,'coral');celebrate(true);if(rescued('coral')){addHeart('coral',2);ents.coral.hop=state.time;}saveGame();}});}
function bobble(it,dt,t){it.x=it.bx+Math.sin(t*.9+it.ph)*.35;it.y=it.by+Math.sin(t*1.3+it.ph*2)*.25;}
function bubblePop(it){sfx('pop');const e=['🐠','⭐','🐚','🐟','💎'][it.i%5];burst(it.x,it.y-.6,e,3,.6);burst(it.x,it.y-.6,'✨',5,.6);say(L.pop[it.i%L.pop.length],'narrator');}
function freeCoral(){const C=C5();if(C.coralFree)return;C.coralFree=true;const e=ents.coral;e.hop=state.time;sfx('fanfare');burst(e.x,e.y-.8,'💦',10,1.2);celebrate(true);saveGame();
  talk([['coral','Wheee! Thank you! I was stuck in that big bubble!'],['coral','I am Coral. I am so hungry. Do you have sea grapes? They are my favorite!']],completeQuest);}
function talkCoral(){const e=ents.coral;e.pause=state.time+5;hearts(e);
  if(qid()==='m5coral'&&state.inv.seagrape>0)return talk([()=>{state.inv.seagrape--;sfx('crunch');hearts(e);},
    ['coral','Yum, yum! Sea grapes are the best!'],['coral','Will you be my friend?']],()=>namePony('coral'));
  say(qid()==='m5coral'?L.coralHungry:T2.shy,'coral');}
function takeShell(i){const C=C5();if(C.shells.includes(i))return;C.shells.push(i);const[x,y]=SHELLS[i];sfx('harvest');floatText(x,y-.4,'+1 🐚');burst(x,y-.3,'✨',5,.5);saveGame();
  if(C.shells.length<8)say(L.shell,'narrator');}
function tapPalace(){const C=C5(),q=qid();
  if(C.palace){burst(PAL.x,PAL.y-2.4,'✨',8,1);sfx('sparkle');say(L.palaceDone,'marina');return;}
  if(q==='m5palace')return LG.builder({mode:'story',quest:'m5palace',title:'🏰 Build the Seashell Palace',titleSay:L.palaceTitle,who:'marina',stages:PALACE_STAGES,art:'lagoon.palaceBuilder',
    onDone:ch=>{C.palace=ch;sfx('fanfare');celebrate();burst(PAL.x,PAL.y-2,'✨',16,1.4);burst(PAL.x,PAL.y-2,DECOR[ch.decor],8,1.2);saveGame();
      talk([['marina','Look! My Seashell Palace is even more beautiful than before!'],['pinch','Click, click! Hooray!']],completeQuest);}});
  say(q==='m5shells'?L.needShells:L.ruins,q==='m5shells'?'pinch':'marina');}
// ----- Clam Match: a memory game with cards on the screen -----
function clamMatch(mode){const pairs=4,faces=[...CARDS].sort(()=>Math.random()-.5).slice(0,pairs),deck=[...faces,...faces].sort(()=>Math.random()-.5);
  if(mode==='play')say(L.matchPlay,'pearl');
  const g=LG.screenGame({mode,quest:mode==='story'?'m5clams':null,title:'🦪 Clam Match',titleSay:L.clamTitle,who:mode==='story'?'marina':'pearl',
    html:`<div class="lgCards" id="m5cards" style="grid-template-columns:repeat(4,110px)">${deck.map((f,i)=>`<button data-i="${i}">🦪</button>`).join('')}</div>`});
  const st={open:[],got:new Set(),lock:false};
  setTimeout(()=>{if(LG.active()===g)LG.screenSay(L.matchStart,'marina');},1600);
  const els=[...document.querySelectorAll('#m5cards button')];
  els.forEach(b=>b.onclick=()=>{if(LG.active()!==g||st.lock)return;const i=+b.dataset.i;if(st.got.has(i)||st.open.includes(i))return;initAudio();
    sfx('pop');b.textContent=deck[i];b.classList.add('up');st.open.push(i);
    if(st.open.length<2)return;const[a,c]=st.open;st.lock=true;
    if(deck[a]===deck[c]){setTimeout(()=>{st.got.add(a);st.got.add(c);els[a].classList.add('got');els[c].classList.add('got');st.open=[];st.lock=false;sfx('sparkle');
        if(st.got.size>=deck.length){sfx('fanfare');LG.screenSay(mode==='story'?pick(L.match):L.matchDone,mode==='story'?'narrator':'pearl');LG.finishScreen(g,()=>clamDone(mode),1600);}
        else LG.screenSay(pick(L.match),'narrator');},350);}
    else setTimeout(()=>{LG.screenSay(L.noMatch,'narrator');setTimeout(()=>{els[a].textContent=els[c].textContent='🦪';els[a].classList.remove('up');els[c].classList.remove('up');st.open=[];st.lock=false;},700);},400);});}
function clamDone(mode){if(mode!=='story'){celebrate(true);if(rescued('pearl')){addHeart('pearl',2);ents.pearl.trick=state.time;}saveGame();return;}
  const C=C5(),e=ents.pearl;C.pearlFound=true;e.hop=state.time;sfx('fanfare');burst(e.x,e.y-.8,'✨',14,1.2);celebrate(true);saveGame();
  talk([['pearl','Peekaboo! I am Pearl! I was hiding in the clam because the storm was so loud.'],
    ['pearl','I am a little bit hungry. Do you have a beach melon? It is my favorite!']],completeQuest);}
function talkPearl(){const e=ents.pearl;e.pause=state.time+5;hearts(e);
  if(qid()==='m5pearl'&&state.inv.melon>0)return talk([()=>{state.inv.melon--;sfx('crunch');hearts(e);},
    ['pearl','Mmm! Juicy and sweet! Thank you!'],['pearl','Can I be your friend and come home with you?']],()=>namePony('pearl'));
  say(qid()==='m5pearl'?L.pearlHungry:T2.shy,'pearl');}
// ----- Dolphin Ride: swim with Splash, move up and down to catch sparkles -----
function dolphinRide(mode){const need=mode==='story'?8:6,W2=720,H2=400;
  const S=ride={y:H2/2,ty:H2/2,got:0,list:[],next:.6,end:0,misty:-1,t:0,last:0,said:false};
  if(mode==='play')say(L.ridePlay,'misty');
  const g=LG.screenGame({mode,quest:mode==='story'?'m5misty':null,title:'🐬 Dolphin Ride',titleSay:L.rideTitle,who:'splash',w:W2,h:H2,
    move:(x,y,down)=>{S.ty=clamp(y,50,H2-40);},
    draw:(c,w,h,t)=>{const dt=Math.min(.05,t-(S.last||t));S.last=t;S.t=t;
      if(t>1.4&&LG.active()===g&&!S.said){S.said=true;LG.screenSay(L.rideStart,'splash');}
      S.y+=(S.ty-S.y)*Math.min(1,dt*6);
      if(S.got<need&&t>2){S.next-=dt;if(S.next<=0){S.next=1.1+Math.random()*.5;const lastY=S.list.length?S.list[S.list.length-1].y:S.y;
          S.list.push({x:w+40,y:clamp(lastY+(Math.random()-.5)*220,60,h-60),hit:0});}}
      for(const s of S.list){s.x-=170*dt;if(!s.hit&&S.got<need&&Math.abs(s.x-160)<55&&Math.abs(s.y-S.y)<60){s.hit=t;S.got++;sfx('sparkle');
        if(S.got===Math.floor(need/2))LG.screenSay(L.rideHalf,'splash');
        if(S.got>=need){S.misty=t;LG.screenSay(mode==='story'?L.rideSee:L.rideDone,mode==='story'?'splash':'misty');}}}
      S.list=S.list.filter(s=>s.x>-60&&!(s.hit&&t-s.hit>.5));
      if(S.misty>0&&!S.end&&t-S.misty>2.6){S.end=t;sfx('fanfare');LG.finishScreen(g,()=>rideDone(mode),1400);}
      ART.rideScene(w,h,t,S,need);}});
  return g;}
function rideDone(mode){if(mode!=='story'){celebrate(true);if(rescued('misty')){addHeart('misty',2);ents.misty.trick=state.time;}saveGame();return;}
  const C=C5(),e=ents.misty;C.mistyFound=true;e.x=DOCK.x-1;e.y=DOCK.y-.4;e.hop=state.time;burst(e.x,e.y-.8,'💦',10,1.2);celebrate();saveGame();
  talk([['misty','You found me! I was lost in the big waves, and I was so scared.'],['misty','Thank you, Splash! And thank you, {name}! Can I come home with you?']],()=>namePony('misty'));}
function talkSplash(){const q=qid();sfx('pop');burst(SPLASH.x,SPLASH.y-1,'💦',5,.8);
  if(q==='m5misty')return dolphinRide('story');
  say(pick(L.splashIdle),'splash');}
// ===== Pinch the crab scuttles on the beach =====
function pinchUpdate(dt){if(hereArea()!=='lagoon')return;wander(pinch,dt,[8,85,22,91.5],1.4);}

// ===== Every frame =====
function resumeDone(q,C){switch(q){case 'm5letter':return C.letterRead;case 'm5meet':return C.met;case 'm5bubbles':return C.coralFree;
  case 'm5coral':return rescued('coral');case 'm5palace':return!!C.palace;case 'm5clams':return C.pearlFound;case 'm5pearl':return rescued('pearl');case 'm5misty':return rescued('misty');}return false;}
let wasReef=false;
HOOK.update.push(dt=>{const C=C5(),q=qid(),here=hereArea();
  bub.update(dt,q==='m5letter');pinchUpdate(dt);
  if(here==='lagoon'){if(q==='m5coral')LG.wantSeed('seagrape');if(q==='m5pearl')LG.wantSeed('melon');
    const reef=onReef(player.x,player.y);if(reef&&!wasReef){sfx('pop');burst(player.x,player.y-.8,'💧',5,.6);if(!C.reefSaid){C.reefSaid=true;say(L.bubbleOn,'narrator');}}wasReef=reef;
    if(reef&&Math.random()<dt*2.5)particles.push({x:player.x+rand(-.3,.3),y:player.y-rand(.6,1.1),vx:rand(-.1,.1),vy:-.7,g:0,life:1.2,max:1.2,draw:ART.riseBubble});
    if(q==='m5shells'||C.shells.length<8)SHELLS.forEach(([x,y],i)=>{if(!C.shells.includes(i)&&q==='m5shells'&&dist(player.x,player.y,x,y)<.6)takeShell(i);});}
  if(isCh5()){const qq=Q[state.quest];if(qq.goal){const s=`${Math.min(state.qprog,qq.goal)}/${qq.goal}`,el=$('objProg');if(el.textContent!==s)el.textContent=s;}}
  const busy=dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show');if(busy)return;
  if(q==='m5fly'&&here==='lagoon')return completeQuest();
  if(q==='m5flyHome'&&here==='valley')return completeQuest();
  if(resumeDone(q,C))return completeQuest();
  if(here!=='lagoon'){if(q==='m5build'&&!C.done&&Q[state.quest].prog()>=3&&NEW.every(id=>!ents[id].goHome)){C.done=true;
      talk([['narrator','Hooray! You fixed the Seashell Palace and rescued three sea ponies!'],
        ['narrator','Tap a pony and press the play button. Coral, Pearl, and Misty have new games to play with you!']],()=>{celebrate();completeQuest();});}return;}
  const near=(e,r)=>dist(player.x,player.y,e.x,e.y)<r;
  if(q==='m5meet'&&near(MARINA,2.8))return meetMarina();
  if(q==='m5bubbles'&&!LG.active()&&C.popped<8&&near(CORALP,6))startBubbles('story');
  if(q==='m5bubbles'&&C.popped>=8&&!C.coralFree&&!LG.active())return freeCoral();
});

// ===== Taps =====
HOOK.tap.push((wx,wy)=>{const C=C5(),q=qid();
  if(q==='m5letter'&&bub.hit(wx,wy)){goDo(bub.x,bub.y+1.2,2,readLetter,bub);return true;}
  if(hereArea()!=='lagoon')return false;
  const pad=PADS.lagoon,onBalloon=state.balloonAt==='lagoon'&&Math.abs(wx-pad.x)<1.1&&wy>pad.y-3.6&&wy<pad.y+.3;if(onBalloon)return false;
  if(dist(wx,wy,MARINA.x,MARINA.y-.8)<1.1){goDo(MARINA.x+.2,MARINA.y+.8,1.7,talkMarina);return true;}
  if(dist(wx,wy,pinch.x,pinch.y-.3)<.7){goDo(pinch.x,pinch.y,1.5,()=>{sfx('pop');burst(pinch.x,pinch.y-.6,'💗',3,.5);say(isCh5()&&q!=='m5build'?Q[state.quest].hint:pick(L.pinchIdle),'pinch');},pinch);return true;}
  if(Math.abs(wx-PAL.x)<2.4&&wy>PAL.y-4.2&&wy<PAL.y+.4){goDo(PAL.x,PAL.y+1.2,2,tapPalace);return true;}
  if(dist(wx,wy,SPLASH.x,SPLASH.y-.4)<1.3||dist(wx,wy,DOCK.x,DOCK.y)<.8){goDo(DOCK.x,DOCK.y,1.4,talkSplash);return true;}
  for(let i=0;i<SHELLS.length;i++){const[x,y]=SHELLS[i];if(q==='m5shells'&&!C.shells.includes(i)&&dist(wx,wy,x,y-.2)<.6){goDo(x,y,.5,()=>takeShell(i));return true;}}
  for(const id of NEW){if(rescued(id))continue;const e=ents[id];if(dist(wx,wy,e.x,e.y-.4)>1)continue;
    if((id==='pearl'&&!C.pearlFound)||(id==='misty'&&!C.mistyFound)){player.path=findPath(wx,wy);return true;}
    if(id==='coral'&&!C.coralFree){say(L.bubbleHi,'narrator');return true;}
    goDo(e.x,e.y,1.8,id==='coral'?talkCoral:talkPearl,e);return true;}
  for(const c of CLAMS)if(dist(wx,wy,c.x,c.y-.35)<.85){goDo(c.x,c.y+.8,1.5,()=>{sfx('tap');if(q==='m5clams')clamMatch('story');else say(L.clamClosed,'narrator');});return true;}
  return false;});

// ===== Guiding arrow =====
const up=(e,h)=>({x:e.x,y:e.y-(h||.7)});
HOOK.target.push(()=>{if(!isCh5())return undefined;const C=C5(),q=qid();
  if(q==='m5letter')return bub.leaving?null:{x:bub.x,y:bub.y-.2};
  if(q==='m5flyHome')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='m5build')return LG.villageTarget();
  const g=LG.goArea('lagoon');if(g!==null)return g;
  switch(q){
    case 'm5fly':return null;
    case 'm5meet':return up(MARINA,1.2);
    case 'm5bubbles':return up(CORALP,.4);
    case 'm5coral':return state.inv.seagrape>0?up(ents.coral):LG.cropTarget(['seagrape'],'lagoon');
    case 'm5shells':{const s=nearest(SHELLS.map(([x,y],i)=>({x,y,i})).filter(o=>!C.shells.includes(o.i)));return s?{x:s.x,y:s.y-.2}:null;}
    case 'm5palace':return{x:PAL.x,y:PAL.y-2.6};
    case 'm5clams':{const c=nearest(CLAMS);return{x:c.x,y:c.y-.7};}
    case 'm5pearl':return state.inv.melon>0?up(ents.pearl):LG.cropTarget(['melon'],'lagoon');
    case 'm5misty':return{x:SPLASH.x-.3,y:SPLASH.y-1};}
  return null;});

// ===== Begin / land / play =====
HOOK.begin.push(isNew=>{const C=ensure();
  if(!isNew&&qid()==='freeEnd'&&!C.done){state.quest=qi('m5letter');state.qprog=0;updateObjective();}
  const q=qid();if(q==='m5letter')bub.arrive();else bub.leaving=true;
  if(!isNew&&q==='m5letter'&&!C.letterSeen)talk(Q[state.quest].start);
  wasReef=onReef(player.x,player.y);});
HOOK.land.push(to=>{if(to==='lagoon'&&C5().met&&!isCh5())say(pick(L.pinchIdle),'pinch');});
HOOK.play.coral=()=>startBubbles('play');
HOOK.play.pearl=()=>clamMatch('play');
HOOK.play.misty=()=>dolphinRide('play');
window.ch5Debug=()=>({bub,pinch,ride});

// ===== Drawing hooks (all looks come from the ART table) =====
CHUNK_HOOKS.push((ax,ay,bx,by,s)=>{if(by<80||ay>112||ax>44)return;const sea=[],sand=[],reef=[];
  for(let y=Math.max(ay,80);y<Math.min(by,112);y++)for(let x=ax;x<Math.min(bx,44);x++){const c=map[y][x];if(c==='w')sea.push([x,y]);else if(c==='d')sand.push([x,y]);else if(c==='u')reef.push([x,y]);}
  for(const[x,y]of sand)ART.sandTile(x,y,s);for(const[x,y]of reef)ART.reefTile(x,y,s);if(sea.length)ART.seaLayer(sea,s);});
HOOK.tile.push((c,x,y,sx,sy,s,h,t)=>{if(c!=='w'||y<80||y>=112)return false;ART.seaSparkle(sx,sy,s,h,t);return true;});
HOOK.layer.push((L,t,x0,y0,x1,y1)=>{bub.layer(L,t);if(hereArea()!=='lagoon')return;const C=C5(),s=ts;
  const vis=(x,y,m)=>x>x0-(m||2)&&x<x1+(m||2)&&y>y0-(m||2)&&y<y1+(m||4);
  if(vis(PAL.x,PAL.y,4))L.push([PAL.y,()=>ART.palace(SX(PAL.x),SY(PAL.y),s,t,C.palace)]);
  if(vis(MARINA.x,MARINA.y))L.push([MARINA.y,()=>ART.marina(SX(MARINA.x),SY(MARINA.y),s,t)]);
  if(vis(pinch.x,pinch.y))L.push([pinch.y,()=>ART.pinch(SX(pinch.x),SY(pinch.y),s,t,pinch)]);
  if(vis(SPLASH.x,SPLASH.y,3))L.push([SPLASH.y,()=>ART.splash(SX(SPLASH.x),SY(SPLASH.y),s,t,qid()==='m5misty')]);
  CLAMS.forEach((c,i)=>{if(vis(c.x,c.y))L.push([c.y,()=>ART.clam(SX(c.x),SY(c.y),s,t,i,C.pearlFound&&i===1,qid()==='m5clams')]);});
  CORALS.forEach(([x,y],i)=>{if(vis(x,y))L.push([y+.8,()=>ART.coral(SX(x+.5),SY(y+.85),s,t,i)]);});
  if(qid()==='m5shells')SHELLS.forEach(([x,y],i)=>{if(!C.shells.includes(i)&&vis(x,y))L.push([y,()=>ART.shellPickup(SX(x),SY(y),s,t,i)]);});
  if(onReef(player.x,player.y))L.push([player.y+.01,()=>ART.playerBubble(SX(player.x),SY(player.y),s,t)]);});
HOOK.overlay.push(t=>{if(hereArea()==='lagoon'&&onReef(player.x,player.y))ART.underwater(t);});
// ===================== LandArt.lagoon: every Mermaid Lagoon look (swap any of these for sprite art) =====================
ART.sandTile=function(x,y,s){const r=mulberry32(x*7919+y*104729),X=x*s,Y=y*s;
  for(let i=0;i<6;i++){ctx.fillStyle=r()<.5?'rgba(200,160,90,.35)':'rgba(255,255,255,.5)';circ(X+r()*s,Y+r()*s,s*(.01+r()*.012));ctx.fill();}
  if(r()<.25){ctx.strokeStyle='rgba(200,160,90,.35)';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();const yy=Y+s*(.3+r()*.4);ctx.moveTo(X+s*.15,yy);ctx.quadraticCurveTo(X+s*.5,yy-s*.08,X+s*.85,yy);ctx.stroke();}
  const v=r();if(v<.05){ctx.fillStyle='#ff9a8b';starPath(X+s*(.3+r()*.4),Y+s*(.3+r()*.4),s*.07);ctx.fill();}
  else if(v<.1){ctx.fillStyle='#fff3e8';ctx.strokeStyle='#e8c0a8';ctx.lineWidth=Math.max(1,s*.015);ell(X+s*(.3+r()*.4),Y+s*(.3+r()*.4),s*.06,s*.045);ctx.fill();ctx.stroke();}};
ART.reefTile=function(x,y,s){const r=mulberry32(x*15485863+y*32452843),X=x*s,Y=y*s;ctx.lineCap='round';
  if(r()<.5){ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();const yy=Y+s*(.2+r()*.6),xx=X+s*r()*.4;
    ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+s*.15,yy-s*.06,xx+s*.3,yy);ctx.quadraticCurveTo(xx+s*.45,yy+s*.06,xx+s*.6,yy);ctx.stroke();}
  const v=r();if(v<.18){const sx2=X+s*(.2+r()*.6),sy2=Y+s*(.5+r()*.4),hh=s*(.18+r()*.14);ctx.strokeStyle=r()<.5?'#3f9a6a':'#57b97a';ctx.lineWidth=Math.max(1.2,s*.035);
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(sx2+(i-1)*s*.05,sy2);ctx.quadraticCurveTo(sx2+(i-1)*s*.05+s*.06,sy2-hh*.5,sx2+(i-1)*s*.06-s*.02,sy2-hh);ctx.stroke();}}
  else if(v<.26){ctx.fillStyle=['#ff9ad5','#ffb36b','#c9a6ff'][Math.floor(r()*3)];for(let i=0;i<4;i++){circ(X+s*(.3+r()*.4),Y+s*(.3+r()*.4),s*.03);ctx.fill();}}
  else if(v<.32){ctx.fillStyle='rgba(255,255,255,.55)';ell(X+s*(.3+r()*.4),Y+s*(.3+r()*.4),s*.05,s*.035);ctx.fill();}};
ART.seaLayer=function(tiles,s){const is=(x,y)=>{const c=tileAt(x,y);return c===undefined||c==='w';};
  blobLayer(tiles,s,-.05,.46,is,'rgba(255,255,255,.6)',.4);blobLayer(tiles,s,.02,.44,is,'#8fe0f7',.36);
  blobLayer(tiles,s,.14,.36,is,'#46b6e6',.36);blobLayer(tiles,s,.3,.2,is,'#2b93cc',.36);
  for(const[x,y]of tiles){const h=hash(x,y);if(h<.3){ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();
    const X=x*s+s*(.2+h),Y=y*s+s*(.3+h);ctx.moveTo(X,Y);ctx.quadraticCurveTo(X+s*.12,Y-s*.06,X+s*.24,Y);ctx.stroke();}}};
ART.seaSparkle=function(sx,sy,s,h,t){if(h>.18)return;const k=Math.sin(t*2+h*40);if(k>.3)twinkle(sx+s*(.3+h*2),sy+s*(.4+h),s*.07*k,k);};
function palmSprite(){const s=ts;return getSprite('palm',2*s,2.4*s,1*s,2.25*s,()=>{ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='#a0703f';ctx.lineWidth=s*.16;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(s*.15,-s*.7,s*.05,-s*1.45);ctx.stroke();
  ctx.strokeStyle='rgba(90,50,20,.35)';ctx.lineWidth=s*.03;for(let i=1;i<7;i++){const y=-s*i*.2,x=s*.15*Math.sin(i*.3);ctx.beginPath();ctx.moveTo(x-s*.07,y);ctx.lineTo(x+s*.07,y-s*.02);ctx.stroke();}
  const top={x:s*.05,y:-s*1.45};for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/6+.1,L2=s*(.7+.15*(i%2));ctx.strokeStyle='#2f8a4a';ctx.lineWidth=s*.12;ctx.beginPath();ctx.moveTo(top.x,top.y);
    ctx.quadraticCurveTo(top.x+Math.cos(a)*L2*.6,top.y+Math.sin(a)*L2*.6-s*.2,top.x+Math.cos(a)*L2,top.y+Math.sin(a)*L2+s*.25);ctx.stroke();
    ctx.strokeStyle='#4fb36a';ctx.lineWidth=s*.06;ctx.stroke();}
  ctx.fillStyle='#7a4a24';for(const[a,b]of[[-.08,-1.38],[.12,-1.36],[.02,-1.3]]){circ(a*s,b*s,s*.08);ctx.fill();}});}
ART.tree=function(x,y){const s=ts,h=hash(x,y),cx=SX(x)+s/2,base=SY(y)+s*.9,spr=palmSprite();shadow(cx,base,s*.4,s*.12);
  const k=Math.sin(nowS()*1.3+h*12)*.03;ctx.save();ctx.translate(cx,base);if(h>.5)ctx.scale(-1,1);ctx.transform(1,0,k,1,0,0);ctx.drawImage(spr,-spr._ox,-spr._oy,spr._w,spr._h);ctx.restore();};
ART.bottle=function(m,t){const s=ts,x=SX(m.x),y=SY(m.y)+Math.sin(t*2)*s*.06;ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='rgba(200,240,255,.35)';circ(x,y,s*.42);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=Math.max(1.5,s*.03);circ(x,y,s*.42);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ell(x-s*.15,y-s*.2,s*.1,s*.05);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(x,y);ctx.rotate(-.5+Math.sin(t*1.5)*.15);ctx.fillStyle='rgba(120,200,170,.85)';ctx.strokeStyle='#3f8a7a';ctx.lineWidth=Math.max(1,s*.02);
  rr(-s*.09,-s*.2,s*.18,s*.32,s*.06);ctx.fill();ctx.stroke();rr(-s*.04,-s*.3,s*.08,s*.12,s*.02);ctx.fill();ctx.stroke();ctx.fillStyle='#c98e55';rr(-s*.045,-s*.34,s*.09,s*.06,s*.02);ctx.fill();
  ctx.fillStyle='#fff6e0';rr(-s*.06,-s*.12,s*.12,s*.16,s*.02);ctx.fill();ctx.restore();};
// Seashell Palace in pixels: X,Y = bottom center, s = tile size, ch = choices {tower,decor,top,flag} (missing = not chosen yet), null = ruins
ART.palaceAt=function(X,Y,s,t,ch,ghost){ctx.lineJoin='round';ctx.lineWidth=Math.max(1,s*.035);
  if(!ch){ctx.fillStyle='#f3e6d8';ctx.strokeStyle='#c9b39a';for(const[a,h2]of[[-1.3,1.1],[-.4,.6],[.6,1.4],[1.4,.5]]){rr(X+a*s-s*.18,Y-h2*s,s*.36,h2*s,s*.06);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(X+a*s-s*.18,Y-h2*s);ctx.lineTo(X+a*s,Y-h2*s-s*.15);ctx.lineTo(X+a*s+s*.18,Y-h2*s+s*.05);ctx.stroke();}
    for(let i=0;i<5;i++)drawEmoji('🐚',X+(i-2)*s*.55,Y-s*.08,s*.28);return;}
  const tc=TOWER[ch.tower||'pink'],dk=shadeHex(tc,-.25),dc=DECOR[ch.decor],fc=FLAG[ch.flag];
  const tower=(x,w,h)=>{ctx.fillStyle=tc;ctx.strokeStyle=dk;rr(x-w/2,Y-h,w,h,s*.08);ctx.fill();ctx.stroke();ctx.fillStyle=shadeHex(tc,.3);
    ctx.beginPath();ctx.moveTo(x-w/2-s*.08,Y-h+s*.04);ctx.quadraticCurveTo(x-w*.1,Y-h-w*.9,x,Y-h-w*1.25);ctx.quadraticCurveTo(x+w*.1,Y-h-w*.9,x+w/2+s*.08,Y-h+s*.04);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#bfe9ff';rr(x-s*.11,Y-h+s*.3,s*.22,s*.3,s*.11);ctx.fill();};
  ctx.fillStyle=tc;ctx.strokeStyle=dk;rr(X-s*1.7,Y-s*1.5,s*3.4,s*1.5,s*.12);ctx.fill();ctx.stroke();
  tower(X-s*1.55,s*.8,s*2.3);tower(X+s*1.55,s*.8,s*2.3);tower(X,s*1.05,s*3.1);
  ctx.fillStyle='#7fd8f5';ctx.beginPath();ctx.moveTo(X-s*.38,Y);ctx.lineTo(X-s*.38,Y-s*.6);ctx.arc(X,Y-s*.6,s*.38,Math.PI,0);ctx.lineTo(X+s*.38,Y);ctx.fill();
  if(dc)for(let i=0;i<4;i++)drawEmoji(dc,X+[-1.1,-.65,.65,1.1][i]*s,Y-s*(.75+(i%2)*.25),s*.3);
  if(fc)for(const fx2 of[X-s*1.55,X+s*1.55]){const ty=Y-s*2.3-s*.8*1.25;ctx.strokeStyle='#8a6a4a';ctx.lineWidth=Math.max(1,s*.03);ctx.beginPath();ctx.moveTo(fx2,ty);ctx.lineTo(fx2,ty-s*.5);ctx.stroke();
    ctx.fillStyle=fc;ctx.beginPath();ctx.moveTo(fx2,ty-s*.5);ctx.lineTo(fx2+s*(.38+Math.sin(t*4)*.05),ty-s*.4);ctx.lineTo(fx2,ty-s*.28);ctx.closePath();ctx.fill();}
  if(ch.top){const ty=Y-s*3.1-s*1.05*1.25;ctx.globalAlpha=.6+.3*Math.sin(t*2);ctx.drawImage(glowSprite('#fff6a8'),X-s*.5,ty-s*.7,s,s);ctx.globalAlpha=1;drawEmoji(TOP[ch.top],X,ty-s*.2,s*.5);}
  if(!ghost)for(let i=0;i<4;i++){const a=t*.8+i*1.6;twinkle(X+Math.cos(a)*s*1.9,Y-s*1.8+Math.sin(a*1.3)*s*.9,s*.07,.9);}};
ART.palace=function(X,Y,s,t,ch){shadow(X,Y,s*2,s*.3);ART.palaceAt(X,Y,s,t,ch);
  if(!ch&&qid()==='m5palace'&&Math.sin(t*3)>0)twinkle(X+s*.8,Y-s*1.6,s*.1,1);};
ART.palaceBuilder=function(w,h,t,g){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#bff0ff');gr.addColorStop(1,'#5fc3ea');ctx.fillStyle=gr;rr(0,0,w,h,24);ctx.fill();
  ctx.fillStyle='#f6e2b8';ell(w/2,h*.92,w*.45,h*.08);ctx.fill();const now=performance.now()/1000,b=g.pop?Math.max(0,1-(now-g.pop)/.35):0;
  const has=Object.keys(g.ch).length;if(!has){ctx.globalAlpha=.3;ART.palaceAt(w/2,h*.92,58,t,{tower:'pink',decor:'shells',top:'crown',flag:'pink'},true);ctx.globalAlpha=1;}
  else ART.palaceAt(w/2,h*.92,58*(1+b*.04),t,Object.assign({tower:'pink'},g.ch),true);
  for(let i=0;i<6;i++){const k=(t*.3+i/6)%1;ctx.globalAlpha=1-k;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;circ(30+i*70,h-k*h,5+i%3*2);ctx.stroke();}ctx.globalAlpha=1;
  if(g.tada){const k2=Math.min(1,(now-g.tada)/.6);for(let i=0;i<10;i++){const a=i/10*6.28+now;drawStar(w/2+Math.cos(a)*170*k2,h*.5+Math.sin(a)*100*k2,8,STARS[i%7].c,true);}}};
ART.marina=function(X,Y,s,t){shadow(X,Y,s*.6,s*.12);ctx.fillStyle='#9aa6b8';ctx.strokeStyle='#6f7b8e';ctx.lineWidth=Math.max(1,s*.03);ell(X,Y-s*.2,s*.6,s*.28);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.3)';ell(X-s*.2,Y-s*.32,s*.2,s*.08);ctx.fill();const b=Math.sin(t*1.8)*s*.04;
  ctx.globalAlpha=.5;ctx.drawImage(glowSprite('#bff0ff'),X-s*.8,Y-s*1.7+b,s*1.6,s*1.6);ctx.globalAlpha=1;drawEmoji('🧜‍♀️',X,Y-s*.95+b,s*1);drawEmoji('👑',X+s*.02,Y-s*1.55+b,s*.3);};
ART.pinch=function(X,Y,s,t,p){shadow(X,Y,s*.25,s*.06);const w=p.moving?Math.sin(t*20)*s*.03:0;drawEmoji('🦀',X+w,Y-s*.22,s*.5);};
ART.splash=function(X,Y,s,t,excited){const per=excited?2.2:4.5,k=(t%per)/per,jump=k<.35?Math.sin(k/.35*Math.PI):0,y=Y-jump*s*1.4;
  ctx.fillStyle='rgba(255,255,255,.55)';ell(X,Y,s*.55,s*.14);ctx.fill();
  if(excited){ctx.globalAlpha=.5+.3*Math.sin(t*4);ctx.drawImage(glowSprite('#fff6a8'),X-s*.8,y-s*1.2,s*1.6,s*1.6);ctx.globalAlpha=1;}
  ctx.save();ctx.translate(X,y-s*.35);ctx.rotate(jump?-(k/.35-.5)*1.2:Math.sin(t*2)*.08);drawEmoji('🐬',0,0,s*.85,true);ctx.restore();
  if(jump>.05){ctx.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<3;i++)circ(X+(i-1)*s*.2,Y-s*.1-jump*s*.3*(i%2+.5),s*.05);ctx.fill();}};
ART.clam=function(X,Y,s,t,i,open,glow){shadow(X,Y,s*.5,s*.1);if(glow){ctx.globalAlpha=.35+.25*Math.sin(t*3+i);ctx.drawImage(glowSprite('#ffe9f5'),X-s*.8,Y-s*1.2,s*1.6,s*1.6);ctx.globalAlpha=1;}
  ctx.lineWidth=Math.max(1,s*.03);ctx.fillStyle='#f6c6dc';ctx.strokeStyle='#c98aa8';ctx.beginPath();ctx.ellipse(X,Y-s*.18,s*.48,s*.22,0,0,Math.PI);ctx.fill();ctx.stroke();
  const lift=open?.7:Math.max(0,Math.sin(t*1.5+i*2))*.08;ctx.save();ctx.translate(X,Y-s*.18);ctx.rotate(-lift);ctx.beginPath();ctx.ellipse(0,0,s*.48,s*.36,0,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(180,100,140,.5)';for(let j=-2;j<=2;j++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(j*s*.16,-s*.32+Math.abs(j)*s*.05);ctx.stroke();}ctx.restore();
  if(open){ctx.fillStyle='#fff';circ(X,Y-s*.28,s*.1);ctx.fill();ctx.fillStyle='rgba(200,220,255,.8)';circ(X-s*.03,Y-s*.31,s*.04);ctx.fill();}};
ART.coral=function(X,Y,s,t,i){const c=['#ff8fb1','#ffb36b','#c9a6ff','#ff6f61'][i%4],k=Math.sin(t*1.2+i)*.04;shadow(X,Y,s*.35,s*.08);ctx.strokeStyle=c;ctx.lineCap='round';
  ctx.save();ctx.translate(X,Y);ctx.rotate(k);for(const[a,l,w]of[[0,.9,.13],[-.5,.6,.1],[.5,.65,.1],[-.25,.45,.08],[.3,.4,.08]]){ctx.lineWidth=s*w;ctx.beginPath();ctx.moveTo(0,0);
    ctx.quadraticCurveTo(Math.sin(a)*s*.3,-l*s*.5,Math.sin(a)*s*.45,-l*s);ctx.stroke();ctx.fillStyle=shadeHex(c,.3);circ(Math.sin(a)*s*.45,-l*s,s*w*.6);ctx.fill();}ctx.restore();};
ART.shellPickup=function(X,Y,s,t,i){const b=Math.sin(t*3+i)*s*.05;shadow(X,Y,s*.2,s*.05);drawEmoji('🐚',X,Y-s*.2+b,s*.42);if(Math.sin(t*2.5+i*1.7)>.5)twinkle(X+s*.2,Y-s*.4+b,s*.07,1);};
ART.bubble=function(it,t,g){const s=ts,X=SX(it.x),Y=SY(it.y)-s*.6,r=s*(.32+.06*Math.sin(t*2+it.ph));
  if(it.st==='pop'){const k=Math.min(1,(t-it.t0)/.4);ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,s*.03);circ(X,Y,r*(1+k*.8));ctx.stroke();ctx.restore();return;}
  ctx.fillStyle='rgba(190,240,255,.28)';circ(X,Y,r);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=Math.max(1.5,s*.03);circ(X,Y,r);ctx.stroke();
  ctx.strokeStyle='rgba(255,170,230,.5)';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.arc(X,Y,r*.8,.3,1.4);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.85)';ell(X-r*.4,Y-r*.4,r*.22,r*.13);ctx.fill();
  drawEmoji(['🐠','⭐','🐚','🐟','💎'][it.i%5],X,Y,s*.28,false,.55);};
ART.bigBubble=function(e,t){const s=ts,X=SX(e.x),Y=SY(e.y)-s*.55,r=s*(.85+.04*Math.sin(t*2));ctx.save();ctx.fillStyle='rgba(190,240,255,.22)';circ(X,Y,r);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=Math.max(2,s*.04);circ(X,Y,r);ctx.stroke();ctx.strokeStyle='rgba(160,220,255,.6)';ctx.beginPath();ctx.arc(X,Y,r*.85,3.6,4.6);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.8)';ell(X-r*.45,Y-r*.5,r*.2,r*.1);ctx.fill();ctx.restore();};
ART.playerBubble=function(X,Y,s,t){const r=s*(.62+.02*Math.sin(t*3));ctx.save();ctx.fillStyle='rgba(200,245,255,.12)';circ(X,Y-s*.45,r);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1.5,s*.025);circ(X,Y-s*.45,r);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ell(X-r*.45,Y-s*.45-r*.5,r*.18,r*.09);ctx.fill();ctx.restore();};
ART.riseBubble=function(p,al){const s=ts;ctx.save();ctx.globalAlpha=al*.8;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,s*.02);circ(SX(p.x),SY(p.y),s*.06);ctx.stroke();ctx.restore();};
ART.underwater=function(t){ctx.save();ctx.fillStyle='rgba(40,150,220,.10)';ctx.fillRect(0,0,vw,vh);
  const g=getSprite('lrays',300,600,0,0,()=>{const gr=ctx.createLinearGradient(0,0,300,0);gr.addColorStop(0,'rgba(220,250,255,0)');gr.addColorStop(.5,'rgba(220,250,255,.18)');gr.addColorStop(1,'rgba(220,250,255,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,300,600);},1);
  for(let i=0;i<3;i++){const x=((i*400+Math.sin(t*.3+i)*60-cam.x*.1)%(vw+400)+vw+400)%(vw+400)-200;ctx.save();ctx.translate(x,-40);ctx.rotate(.2);ctx.drawImage(g,0,0,120+i*30,vh*1.4);ctx.restore();}ctx.restore();};
ART.rideScene=function(w,h,t,S,need){const gr=ctx.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#8fe3ff');gr.addColorStop(.25,'#46b6e6');gr.addColorStop(1,'#1b6ea8');ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<12;i++){const x=((i*90-t*120)%(w+90)+w+90)%(w+90)-45;ctx.beginPath();ctx.ellipse(x,26+Math.sin(t*2+i)*4,40,7,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#e8c98a';ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w;x+=40)ctx.lineTo(x,h-24-Math.sin((x+t*150)*.02)*10);ctx.lineTo(w,h);ctx.fill();
  for(let i=0;i<8;i++){const x=((i*110-t*150)%(w+110)+w+110)%(w+110)-55;ctx.strokeStyle=i%2?'#3f9a6a':'#57b97a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,h-20);ctx.quadraticCurveTo(x+18,h-60,x+Math.sin(t*2+i)*10,h-90-(i%3)*20);ctx.stroke();}
  for(let i=0;i<10;i++){const k=(t*.25+i/10)%1;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=2;circ((i*73)%w,h-k*h,4+i%3*2);ctx.stroke();}
  for(const s of S.list){if(s.hit){const k=(t-s.hit)/.5;ctx.globalAlpha=1-k;drawStar(s.x,s.y-k*30,22+k*20,'#fff36b',true);ctx.globalAlpha=1;}else drawStar(s.x,s.y,22+3*Math.sin(t*6+s.y),STARS[Math.floor(s.y)%7].c,true);}
  if(S.misty>0){const k=Math.min(1,(t-S.misty)/1.6),mx=w+90-(w*.42)*k,o=Object.assign({},ponyLook('misty'),{flip:true,walkT:t*10,moving:k<1,scale:1});const sTs=ts;ts=95;drawHorse(mx,h*.62+Math.sin(t*3)*6,o);ts=sTs;
    if(k>=1)for(let i=0;i<5;i++)twinkle(mx+Math.cos(t*3+i)*60,h*.45+Math.sin(t*3+i)*40,8,1);}
  const dx=160+(S.misty>0?Math.min(1,(t-S.misty)/1.6)*120:0),dy=S.y;ctx.save();ctx.translate(dx,dy);ctx.rotate(clamp((S.ty-S.y)*.004,-.4,.4));drawEmoji('🐬',0,0,110,true);drawEmoji(state.hero,-6,-46,46);ctx.restore();
  for(let i=0;i<need;i++){const x=w/2-(need-1)*18+i*36;drawStar(x,64,12,i<S.got?'#ffd83d':'rgba(255,255,255,.45)',i<S.got);}};
ART.flightScene=function(gy,s,t){ctx.fillStyle='#46b6e6';ell(vw*.5,gy+vh*.15,vw*.75,vh*.28);ctx.fill();ctx.fillStyle='#8fe0f7';ell(vw*.5,gy+vh*.05,vw*.6,vh*.12);ctx.fill();
  ctx.fillStyle='#f6e2b8';ell(vw*.32,gy+vh*.02,vw*.14,vh*.05);ctx.fill();drawEmoji('🌴',vw*.3,gy-s*.5,s*1.1);drawEmoji('🏰',vw*.66,gy-s*.25,s*.9);
  drawEmoji('🐬',vw*.5+Math.sin(t*2)*s*.5,gy+s*.3-Math.abs(Math.sin(t*2))*s*.4,s*.6);drawEmoji('🐚',vw*.2,gy+s*.3,s*.4);};
})();
