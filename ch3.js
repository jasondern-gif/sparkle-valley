'use strict';
// ---------- Chapter 3: The Rain Fountain and the Surprise Party (Cloud Kingdom part 2) ----------
// New ponies Moonbeam and Sugarplum, the Rain Fountain and Drizzle the rain cloud, the Moon Garden and the
// Party Meadow (south of the fluffy clouds), plus mini-games: treasure hunt, fireflies, baking, rainbow race, tag.
(()=>{
const R=reg;
const NEW=['moonbeam','sugarplum'];

// ===== Speakers, ponies, crops, items =====
Object.assign(SPK,{
  moonbeam:{n:'Moonbeam',f:'🐴',portrait:true,p:1.25,r:.9},
  sugarplum:{n:'Sugarplum',f:'🐴',portrait:true,p:1.5,r:1.05},
  hoot:{n:'Hoot',f:'🦉',p:.8,r:.9},
  drizzle:{n:'Drizzle',f:'🌧️',p:.9,r:.95}});
Object.assign(PONIES,{
  moonbeam:{names:['Moonbeam','Luna','Starlight','Dreamy'],fav:'moonflower',acc:'🌙',home:{x:52.5,y:36.2},
    look:{body:'#ddd6ff',mane:['#4b3f9e','#7a6fd6','#b9b3ff','#fff4b8'],hoof:'#5a4fa8',snout:'#f1edff',wings:'#ece8ff',horn:true,hornColor:'#fff4b8',scale:.9}},
  sugarplum:{names:['Sugarplum','Candy','Jellybean','Sprinkles'],fav:'staroat',acc:'🍭',home:{x:67.5,y:36.4},
    look:{body:'#ffbfdf',mane:['#ff4fa3','#62d0ff','#ffe94d','#a77bff'],hoof:'#e0569a',snout:'#ffe3f0',wings:'#fff4b8',scale:.85}}});
PONY_IDS.push(...NEW);
for(const id of NEW){PONIES[id].names.forEach(n=>R('narrator',n));
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(id,T2[k]);}
Object.assign(CROPS,{
  staroat:{e:'🌾',name:'star oat',st:['','🌱','🌿','🌾']},
  moonflower:{e:'💮',name:'moonflower',st:['','🌱','🌿','💮'],glow:true}});
Object.assign(ICON,{staroat:'🌾',moonflower:'💮',cupcake:'🧁',sdrop:'💧'});
Object.assign(PRICE,{staroat:3,moonflower:5,cupcake:3,sdrop:0});
Object.assign(ITEM_NAMES,{staroat:'Star oats',moonflower:'Moonflowers',cupcake:'Cupcakes',sdrop:'Sparkle drops'});
FOODS.push('staroat');

// ===== Map: Rain Fountain by the castle, a cloud path south, the Moon Garden and the Party Meadow =====
const K=(x,y)=>x+y*W;
const PATH=[[57,29],[58,29],[57,30],[58,30]];
rect(61,12,62,13,'U');
rect(46,31,59,44,'n');[[46,31],[47,31],[46,32],[46,44],[47,44],[46,43],[58,44],[59,44],[59,43]].forEach(([x,y])=>map[y][x]='X');
rect(52,39,54,39,'S');
rect(60,37,62,37,'r');
rect(63,31,78,43,'c');[[63,31],[64,31],[63,32],[77,31],[78,31],[78,32],[63,43],[64,43],[63,42],[77,43],[78,43],[78,42]].forEach(([x,y])=>map[y][x]='X');
PATH.forEach(([x,y])=>map[y][x]='Z');
const LANTERNS=[[47,37],[49,42],[55,43],[58,34],[52,32]];
const HOOT={x:48.5,y:33.9},TABLE={x:70.5,y:34.9},PARTY_C={x:70.5,y:37.6},FOUNT={x:62,y:13.95},BED={x:52.5,y:36.2};
const BLOCK=new Set();LANTERNS.forEach(([x,y])=>BLOCK.add(K(x,y)));BLOCK.add(K(48,33));[69,70,71].forEach(x=>BLOCK.add(K(x,34)));
const PARTY_SPOTS=[[66.4,35.6],[74.6,35.6],[67.4,38.8],[73.6,38.8],[70.5,40],[65.2,38],[75.8,38.2]];
const STORY_COURSE=[[76.5,36.5],[72.5,40.8],[66.5,41.5],[64.4,37.5],[61.5,37.5],[56.5,40.5],[50.5,42.6],[47.5,39.5],[50.5,34.6],[56.5,32.6]].map(([x,y])=>({x,y}));
const START=STORY_COURSE[0];
const MAZE=(x,y)=>x>=60&&x<=72&&y>=2&&y<=6;
SIGNS.push({x:55.6,y:31.9,text:'Moon Garden'},{x:64.4,y:36.3,text:'Party Meadow'},{x:59.9,y:15.0,text:'Rain Fountain'});

// Fluffy clouds in the fluffy-cloud field: each connected group of 'p' tiles is one cloud to search
const FL=[],tileG=new Map();
{const seen=new Set();
  for(let y=21;y<=28;y++)for(let x=53;x<=76;x++){if(map[y][x]!=='p'||seen.has(K(x,y)))continue;
    const g={tiles:[]},st=[[x,y]];seen.add(K(x,y));
    while(st.length){const[a,b]=st.pop();g.tiles.push([a,b]);tileG.set(K(a,b),FL.length);
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=a+dx,ny=b+dy;if(map[ny]&&map[ny][nx]==='p'&&!seen.has(K(nx,ny))){seen.add(K(nx,ny));st.push([nx,ny]);}}}
    FL.push(g);}}

// ===== Spoken lines (said with say(), so registered) =====
const L={
  looked:R('narrator','You already looked in this cloud. Try another one!'),
  dry:R('narrator','The Rain Fountain is dry. It needs 3 sparkle drops.'),
  splash:R('narrator','Splish, splash! The Rain Fountain sparkles!'),
  zzz:R('moonbeam','Zzz... Zzz... moonflowers... Zzz...'),
  sugarNeed:R('sugarplum','I need 3 strawberries and 3 star oats for the cake!'),
  sugarSecret:R('sugarplum','Shh! I am planning a secret surprise!'),
  sugarStay:R('sugarplum','I will stay here and get the party ready. After the party, I will fly to your Pony Village!'),
  sugarBake:R('sugarplum','Tap me when you are ready to bake!'),
  tagStart:R('twinkle','Let us play tag! Catch me if you can!'),
  tagDone:R('twinkle','You got me three times! You are so fast!'),
  raceStart:R('peaches','Let us race! Run through the rainbow rings!'),
  raceWin:R('peaches','You won! You are super fast! Let us race again soon!'),
  medal:R('narrator','🥇 You win! 🥇'),
  flyStart:R('moonbeam','Let us catch fireflies! Walk close to them!'),
  flyDone:R('moonbeam','You caught them all! Look how they glow!'),
  cupThanks:R('sugarplum','Yummy cupcakes! Give them to your pony friends!'),
  cupDone:R('narrator','You baked 3 cupcakes! Every pony loves cupcakes.'),
  lantern:R('narrator','The lantern is glowing!'),
  princessHi:R('cloudberry','I love parties! I mean... I love walks! Hee hee!'),
};
const SURPRISES=[
  {e:'🐰',kind:'pop',t:R('narrator','Boo! A little cloud bunny! Hee hee!')},
  {e:'🦋',kind:'fly',t:R('narrator','A butterfly! Flutter, flutter!')},
  {e:'⭐',kind:'rise',t:R('narrator','A twinkly star! So shiny!')},
  {e:'🎈',kind:'float',t:R('narrator','A balloon! Up, up it goes!')},
  {e:'🐦',kind:'fly',t:R('narrator','Tweet, tweet! A little bird says hello!')},
  {e:'☁️',kind:'puff',t:R('narrator','Just a soft, fluffy cloud. Try another one!')}];
const DROP_LINES=[R('narrator','You found a sparkle drop! Two more to go!'),R('narrator','You found a sparkle drop! Just one more!'),R('narrator','You found all 3 sparkle drops!')];
const DRIZ=[R('drizzle','Drip, drop! I water all the cloud gardens!'),R('drizzle','Pitter, patter! Hee hee!'),R('drizzle','Plant some seeds, and I will water them for you!')];
const HOOT_IDLE=[R('hoot','Hoo hoo! The night is so pretty.'),R('hoot','Hoo hoo! Fireflies make the best night lights.')];
const TAG=[R('twinkle','Tag! You got me! Hee hee!'),R('twinkle','You got me again! Catch me one more time!')];
const TEASE=[R('twinkle','Hee hee! Over here!'),R('twinkle','Catch me if you can!')];
const COUNT=[R('narrator','Three!'),R('narrator','Two!'),R('narrator','One!'),R('narrator','Go!')];
const CUPCAKE='Mmm! A cupcake! I love cupcakes!';
PONY_IDS.forEach(id=>R(id,CUPCAKE));

// ===== Quests =====
const CH3Q=[
{id:'c3letter',icon:'🐦',text:'The bluebird has another letter! Tap the bluebird.',
 start:[['narrator','Look! The little bluebird is back. It has another letter!'],()=>{C3().letterSeen=true;bird.leaving=false;bird.x=player.x+6;bird.y=player.y-4;}],
 hint:'Tap the little bluebird to read the letter!'},
{id:'c3fly',icon:'🎈',text:'Fly the Rainbow Balloon to the Cloud Kingdom.',
 hint:'The Rainbow Balloon is next to the farm, by the big road. Tap it to fly!'},
{id:'c3drops',icon:'💧',text:'Find 3 sparkle drops! Tap the fluffy clouds to look inside.',goal:3,handin:true,prog:()=>C3().found,
 start:[['cloudberry','You came back! Look at my Rain Fountain. It is all dry!'],
   ['cloudberry','The storm blew its 3 sparkle drops into the fluffy clouds.'],
   ['cloudberry','Tap a fluffy cloud to look inside. What will you find?'],()=>initDrops()],
 hint:'Tap the fluffy clouds to look inside. Follow the arrow!'},
{id:'c3fountain',icon:'⛲',text:'Put the sparkle drops in the Rain Fountain by the castle.',
 start:[['cloudberry','You found all 3 sparkle drops! Let us put them in the Rain Fountain.']],
 hint:'The Rain Fountain is next to the castle. Tap it!'},
{id:'c3moon',icon:'🌙',text:'Follow the new cloud path to the Moon Garden.',
 start:[['narrator','A new cloud path! It goes down, past the fluffy clouds, to the Moon Garden.']],
 hint:'Walk down the new cloud path, past the fluffy clouds, to the Moon Garden.'},
{id:'c3fireflies',icon:'✨',text:'Catch 5 fireflies to light the lanterns.',goal:5,prog:()=>C3().lanterns,
 start:[()=>startFlies('story'),['narrator','Walk close to a glowing firefly to catch it!']],
 hint:'Walk close to the glowing fireflies to catch them. Each one lights a lantern!'},
{id:'c3moonflower',icon:'💮',text:'Grow a moonflower and give it to Moonbeam.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.moonflower),
 start:[['hoot','Hoo hoo! You lit all the lanterns! The Moon Garden is glowing!'],
   ['hoot','Now the moonflowers can grow. Here are some moonflower seeds!'],
   ()=>{state.seeds.moonflower=true;state.seed='moonflower';refreshBar(true);},
   ['narrator','Plant the seeds in the Moon Garden. Drizzle will water them for you!']],
 hint:'Plant moonflower seeds in the Moon Garden. Drizzle will water them. Then give the moonflower to Moonbeam.'},
{id:'c3sugar',icon:'🍭',text:'Cross the rainbow bridge to the Party Meadow and say hi.',
 start:[['narrator','Listen! Someone is singing a happy song over the rainbow bridge.']],
 hint:'Walk over the rainbow bridge next to the Moon Garden. Then say hi to the pony in the Party Meadow!'},
{id:'c3cakeFood',icon:'🍓',text:'Grow 3 strawberries and 3 star oats for the party cake.',goal:6,handin:true,
 prog:()=>Math.min(3,state.inv.strawberry)+Math.min(3,state.inv.staroat),
 start:[['narrator','Plant strawberries and star oats in a cloud garden. Drizzle will water them!'],()=>{state.seed='strawberry';refreshBar(true);}],
 hint:'Plant strawberry seeds and star oat seeds in a cloud garden. Then bring them to Sugarplum.'},
{id:'c3bake',icon:'🎂',text:'Bake the party cake with Sugarplum! Tap on her.',
 start:[['sugarplum','Now let us bake the cake together! Tap me when you are ready.']],
 hint:'Tap on Sugarplum in the Party Meadow to bake the cake!'},
{id:'c3race',icon:'🏁',text:'Win the Rainbow Race! Go to the starting line.',
 start:[()=>{C3().gather=true;},['narrator','Whoosh! Your pony friends flew up to the Party Meadow!'],
   ['peaches',"Let's have a Rainbow Race before the party! Go to the starting line!"]],
 hint:'Go to the starting line in the Party Meadow. Then run through the rainbow rings, one by one!'},
{id:'c3tag',icon:'🌸',text:'Play tag with Twinkle in the flower maze. Tag her 3 times!',goal:3,handin:true,prog:()=>C3().tags,
 start:[()=>startTag('story'),['twinkle','That race was so fun! Now let us play tag in the flower maze!'],
   ['twinkle','Come and find me in the maze. Tag me 3 times!']],
 hint:'Twinkle is in the flower maze, by the castle. Walk up close to tag her!'},
{id:'c3party',icon:'🎉',text:'Bring Princess Cloudberry to the Party Meadow. Shh, it is a surprise!',
 start:[['sugarplum','The party is all ready! Now we need the princess.'],
   ['sugarplum',"Can you bring Princess Cloudberry to the Party Meadow? Shh! Don't tell her!"]],
 hint:'Tap on Princess Cloudberry at the castle. Then walk with her to the Party Meadow!'},
{id:'c3flyHome',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
 start:[['cloudberry','Moonbeam and Sugarplum want to live in your Pony Village, too!'],
   ['cloudberry','Fly home and build them cozy cottages. Come back and visit me soon!']],
 hint:'Tap the Rainbow Balloon to fly home.'},
{id:'c3build',icon:'🏠',text:'Build cottages for Moonbeam and Sugarplum in Pony Village.',goal:2,handin:true,
 prog:()=>NEW.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
 start:[()=>fillEmptyCottages(),['grandma','Welcome home! What a big adventure!'],
   ['grandma','Moonbeam and Sugarplum need cozy cottages in Pony Village.'],
   ['narrator','Pick up 3 pieces of wood. Then tap the hammer to build a cottage!']],
 hint:'Pick up 3 pieces of wood in Pony Village. Then tap the hammer to build a cottage!'},
];
addChapter(CH3Q);
CH3Q.forEach(q=>R('cloudberry',q.hint));
['c3fireflies','c3moonflower','c3moon'].forEach(id=>R('hoot',CH3Q.find(q=>q.id===id).hint));
const isCh3=()=>{const q=qid();return q.startsWith('c3');};

// ===== State =====
const DEF={letterSeen:false,letterRead:false,dropG:null,searched:[],found:0,misses:0,surpr:0,fountain:false,pathOpen:false,
  metHoot:false,lanterns:0,flowerPlaced:false,awake:false,metSugar:false,foodGiven:false,cake:null,cakeDone:false,
  gather:false,medal:false,tags:0,princessFollow:false,partyNow:false,partyDone:false,crown:false,ended:false};
function ensure(){if(!state.ch3||typeof state.ch3!=='object')state.ch3={};
  for(const k in DEF)if(state.ch3[k]===undefined)state.ch3[k]=Array.isArray(DEF[k])?[]:DEF[k];
  for(const k of ['staroat','moonflower','cupcake','sdrop'])if(!(state.inv[k]>=0))state.inv[k]=0;
  return state.ch3;}
const C3=()=>state.ch3||ensure();
function openPath(fx){const C=C3();C.pathOpen=true;
  PATH.forEach(([x,y],i)=>{map[y][x]='c';if(fx)setTimeout(()=>burst(x+.5,y+.5,'☁️',4,.6),i*180);});}
function initDrops(){const C=C3();if(C.dropG&&C.dropG.length)return;
  const ids=FL.map((_,i)=>i).sort(()=>Math.random()-.5);C.dropG=ids.slice(0,3);}

// Entities that belong to this chapter
const bird={x:0,y:0,leaving:true,flip:false,leftAt:-99};
const driz={x:62,y:12,sleepy:false,rain:-9,show:false};
let race=null,tag=null,flies=null,bk=null,searching=false,fw=null;
const wigT=new Map(),fx=[];

// ===== Monkey-patches of shared functions (wrapped, never replaced) =====
{const prev=homeOf;homeOf=function(id){const C=state.ch3;
  if(C&&C.gather&&rescued(id)&&typeof player!=='undefined'&&inClouds(player.x)){
    const i=PONY_IDS.filter(rescued).indexOf(id),s=PARTY_SPOTS[i%PARTY_SPOTS.length];return{x:s[0],y:s[1]};}
  if(id==='sugarplum'&&rescued(id)&&!(C&&C.partyDone))return PONIES.sugarplum.home;
  return prev(id);};}
{const prev=rescue;rescue=function(id){
  if(id==='sugarplum'&&!C3().partyDone){talk([['sugarplum',L.sugarStay]],()=>{hearts(ents.sugarplum);completeQuest();});return;}
  return prev(id);};}
{const prev=seedsHere;seedsHere=function(){const r=prev();
  if(typeof player!=='undefined'&&inClouds(player.x))for(const k of ['staroat','moonflower'])if(state.seeds[k]&&!r.includes(k))r.push(k);
  return r;};}
{const prev=drawCrop;drawCrop=function(c,st,x,y,size,t){prev(c,st,x,y,size,t);
  if(c==='staroat'&&st===3)drawStar(x+size*.28,y-size*.3,size*.12*(1+.25*Math.sin(t*4+x)),'#ffe14d',true);};}
{const prev=feedChoice;feedChoice=function(id){if(state.inv.cupcake>0)return 'cupcake';return prev(id);};}
{const prev=ponyAction;ponyAction=function(id,act){
  if(act==='feed'&&state.ponies[id]&&state.inv.cupcake>0&&coolLeft(id,'feed')<=0){
    const e=ents[id];e.pause=state.time+5;e.hop=state.time;startCool(id,'feed');state.inv.cupcake--;sfx('crunch');
    burst(e.x,e.y-1,'🧁',3);burst(e.x,e.y-1,'💗',5);say(CUPCAKE,id);addHeart(id,2);refreshPonyMenu();refreshBar(true);saveGame();return;}
  if(act==='play')stopGames();
  return prev(id,act);};}
{const prev=talkPrincess;talkPrincess=function(){const q=qid(),C=C3(),e=ents.princess;
  if(q==='c3party'&&!C.princessFollow&&!C.partyNow){burst(e.x,e.y-1.2,'💖',4);
    talk([['narrator','You whisper: Please come for a little walk with me, Princess!'],['cloudberry','A little walk? Oh, how fun! Lead the way!']],
      ()=>{C.princessFollow=true;});return;}
  if(q==='c3party'&&C.princessFollow){burst(e.x,e.y-1.2,'💖',3);say(L.princessHi,'cloudberry');return;}
  if(isCh3()&&q!=='c3build'){burst(e.x,e.y-1.2,'💖',4);talk([['cloudberry',Q[state.quest].hint]]);return;}
  return prev();};}
{const prev=drawPonyEnt;drawPonyEnt=function(id,t){const C=state.ch3;
  if(C){if(id==='moonbeam'&&!rescued('moonbeam')&&!C.awake){drawSleeping(t);return;}
    if(qid()==='c3party'&&!C.partyNow&&C.gather&&rescued(id)&&id!=='sugarplum'&&state.follower!==id)return;}
  prev(id,t);};}
{const prev=drawPuffCloud;drawPuffCloud=function(x,y,t){
  const g=wigT.size?tileG.get(K(x,y)):undefined,w=g!==undefined&&wigT.has(g)?t-wigT.get(g):9;
  if(w<1){const s=ts,bx=SX(x)+s/2,by=SY(y)+s*.95,k=1-w;ctx.save();ctx.translate(bx,by);ctx.rotate(Math.sin(w*30)*.12*k);
    ctx.scale(1+.1*Math.sin(w*22)*k,1-.06*Math.sin(w*22)*k);ctx.translate(-bx,-by);prev(x,y,t);ctx.restore();return;}
  prev(x,y,t);};}
// ch2Begin runs before HOOK.begin and moves the player if her tile isn't walkable, so restore the path first
{const prev=ch2Begin;ch2Begin=function(isNew){const C=ensure();if(C.pathOpen)openPath(false);
  const px=Math.floor(player.x),py=Math.floor(player.y);
  if(inClouds(player.x)&&!walkable(px,py)){let b=null,bd=9;
    for(let y=py-3;y<=py+3;y++)for(let x=px-3;x<=px+3;x++)if(walkable(x,y)&&inClouds(x)){const d=dist(x,y,px,py);if(d<bd){bd=d;b=[x,y];}}
    if(b){player.x=b[0]+.5;player.y=b[1]+.5;}}
  return prev(isNew);};}
HOOK.init.push(()=>{
  {const prev=walkable;walkable=function(x,y){if(BLOCK.has(K(x,y)))return false;return prev(x,y);};}
  {const prev=refreshBar;refreshBar=function(force){prev(force);
    if(started&&qid()==='c3build'&&state.inv.wood>=3&&!placing){const b=$('bar').querySelector('[data-build]');if(b)b.classList.add('pulse');}};}
});
HOOK.keep.push(k=>{if(k==='sdrop'||k==='cupcake')return 1e9;const q=qid();
  if(q==='c3moonflower'&&k==='moonflower')return 1;
  if((q==='c3sugar'||q==='c3cakeFood')&&(k==='strawberry'||k==='staroat'))return 3;
  return 0;});

// ===== Story =====
function readLetter(){if(qid()!=='c3letter')return;const cl=inClouds(player.x);
  talk([['narrator','The letter says...'],
    ['cloudberry','Dear friend. Thank you for saving Twinkle, Peaches, and Puff!'],
    ['cloudberry','But oh no! My Rain Fountain stopped working, and the cloud gardens are so thirsty.'],
    ['cloudberry','And two more ponies are still lost: Moonbeam and Sugarplum. Please come back and help us!'],
    ['cloudberry','Love, Princess Cloudberry.'],
    cl?['narrator','You are already in the Cloud Kingdom! Let us go and find the princess.']:['narrator',"Let's fly the Rainbow Balloon to the Cloud Kingdom!"]],
    ()=>{C3().letterRead=true;bird.leaving=true;bird.leftAt=state.time;if(inClouds(player.x))state.quest=qi('c3fly');completeQuest();});}
function tapCloud(g,x,y){if(searching)return;
  if(C3().searched.includes(g)){sfx('tap');say(L.looked,'narrator');return;}
  goDo(x+.5,y+.5,1.5,()=>searchCloud(g,x,y));}
function searchCloud(g,x,y){if(searching||C3().searched.includes(g)||qid()!=='c3drops')return;
  searching=true;wigT.set(g,state.time);sfx('pop');burst(x+.5,y-.2,'☁️',3,.5);
  setTimeout(()=>{searching=false;wigT.delete(g);revealCloud(g,x,y);},850);}
function revealCloud(g,x,y){const C=C3();if(C.searched.includes(g))return;initDrops();C.searched.push(g);
  const left=FL.map((_,i)=>i).filter(i=>!C.searched.includes(i)),need=3-C.found;
  let drop=C.dropG.includes(g);
  if(!drop&&(C.misses>=2||left.length<need)){drop=true;const j=C.dropG.findIndex(i=>!C.searched.includes(i));if(j>=0)C.dropG.splice(j,1);C.dropG.push(g);}
  const ox=x+.5,oy=y-.1;
  if(drop&&C.found<3){C.found++;C.misses=0;state.inv.sdrop++;sfx('sparkle');celebrate(true);
    fx.push({kind:'drop',x:ox,y:oy,t0:state.time,dur:1.6});refreshBar(true);saveGame();
    if(C.found>=3)talk([['narrator',DROP_LINES[2]]],completeQuest);else say(DROP_LINES[C.found-1],'narrator');return;}
  C.misses++;const s=SURPRISES[C.surpr++%SURPRISES.length];sfx(s.kind==='puff'?'tap':'pop');
  fx.push({kind:s.kind,e:s.e,x:ox,y:oy,t0:state.time,dur:s.kind==='pop'?2.2:2.6});say(s.t,'narrator');saveGame();}
function tapFountain(){const C=C3();
  if(qid()==='c3fountain'&&state.inv.sdrop>=3){talk([
    ['narrator','You put the 3 sparkle drops in the Rain Fountain...'],
    ()=>{state.inv.sdrop=0;C.fountain=true;sfx('water');celebrate(true);burst(FOUNT.x,FOUNT.y-1.8,'💧',12,1.2);refreshBar(true);},
    ['narrator','Splash! The Rain Fountain is working again!'],
    ()=>{driz.x=FOUNT.x+1.7;driz.y=FOUNT.y-1.5;driz.sleepy=true;driz.show=true;sfx('sparkle');burst(driz.x,driz.y,'✨',10,1);},
    ['narrator','Look! Something is waking up in the fountain mist...'],
    ()=>{driz.sleepy=false;sfx('fanfare');burst(driz.x,driz.y-.4,'💙',6);},
    ['drizzle','Yaaawn! Hello! I am Drizzle, the rain cloud of the Cloud Kingdom!'],
    ['drizzle','The storm made me so sleepy. Thank you for waking me up!'],
    ['drizzle','Now I can water all the cloud gardens for you. Drip, drop!'],
    ['cloudberry','Thank you, Drizzle! Two of our ponies are still lost. Can you help us find them?'],
    ['drizzle','Yes! I will make a new cloud path, down past the fluffy clouds. Look!'],
    ()=>{openPath(true);celebrate(true);saveGame();}],completeQuest);return;}
  sfx('water');say(C.fountain?L.splash:L.dry,'narrator');if(C.fountain)burst(FOUNT.x,FOUNT.y-1.8,'💧',6,.8);}
function meetMoon(){player.path=[];player.action=null;C3().metHoot=true;talk([
  ['narrator','Shh! A pony is fast asleep on a little cloud.'],
  ['moonbeam','Zzz... Zzz...'],
  ['hoot','Hoo hoo! Hello there! I am Hoot, the wise owl of the Moon Garden.'],
  ['hoot','This is Moonbeam. The big storm was so loud, she fell into a very deep sleep.'],
  ['hoot','Only a glowing moonflower can wake her up. And moonflowers need firefly light to grow!'],
  ['hoot','Can you catch 5 fireflies? They will light up the lanterns.']],completeQuest);}
function wakeMoon(){const C=C3(),e=ents.moonbeam;talk([
  ['narrator','You put the glowing moonflower next to Moonbeam...'],
  ()=>{state.inv.moonflower--;C.flowerPlaced=true;sfx('sparkle');burst(BED.x+1,BED.y-.4,'✨',14,1);refreshBar(true);},
  ['narrator','It smells so sweet... Look! She is waking up!'],
  ()=>{C.awake=true;e.hop=state.time;burst(e.x,e.y-1,'💜',8);sfx('neigh');saveGame();},
  ['moonbeam','Yawn... Good morning! Oh, hello! Did you wake me up with a moonflower?'],
  ['moonbeam','I was so sleepy after the big storm. Thank you, thank you!'],
  ['moonbeam','Will you be my friend?']],()=>namePony('moonbeam'));}
function meetSugar(){player.path=[];player.action=null;const C=C3();C.metSugar=true;talk([
  ['sugarplum','Oh! Hi there! I am Sugarplum!'],
  ['sugarplum','Shh! Can you keep a secret? I am planning a surprise party for Princess Cloudberry!'],
  ['sugarplum','But the big storm blew my party cake away. Boo hoo!'],
  ['sugarplum','Will you help me bake a new one? We need 3 strawberries and 3 star oats.'],
  ['sugarplum','Here are some star oat seeds!'],
  ()=>{state.seeds.staroat=true;state.seed='strawberry';refreshBar(true);sfx('sparkle');}],completeQuest);}
function talkNew(id){const q=qid(),C=C3(),e=ents[id];e.pause=state.time+5;hearts(e);
  if(id==='moonbeam'){
    if(C.awake)return talk([['moonbeam','Will you be my friend?']],()=>namePony('moonbeam'));
    if(q==='c3moon')return meetMoon();
    if(q==='c3moonflower'&&state.inv.moonflower>0)return wakeMoon();
    return say(L.zzz,'moonbeam');}
  if(q==='c3sugar')return meetSugar();
  if(q==='c3cakeFood'){
    if(state.inv.strawberry>=3&&state.inv.staroat>=3)return talk([['sugarplum','Yay! Strawberries and star oats! Thank you!'],
      ()=>{state.inv.strawberry-=3;state.inv.staroat-=3;C.foodGiven=true;sfx('harvest');refreshBar(true);}],completeQuest);
    return say(L.sugarNeed,'sugarplum');}
  if(q==='c3bake'){if(C.cakeDone)return afterCake();return openBake('cake',tops=>{C.cake=tops;C.cakeDone=true;cakeCv=null;saveGame();afterCake();});}
  say(state.quest<qi('c3sugar')?L.sugarSecret:T2.shy,id);}
function afterCake(){talk([['sugarplum','Our cake is perfect! I put it on the party table.'],
  ['sugarplum','You are the best baker in the whole sky! Will you be my friend, too?']],()=>namePony('sugarplum'));}
function talkHoot(){const q=qid();burst(HOOT.x+.4,HOOT.y-1.9,'💜',3);
  if(q==='c3moon')return meetMoon();
  if(q==='c3fireflies'||q==='c3moonflower')return talk([['hoot',Q[state.quest].hint]]);
  say(pick(HOOT_IDLE),'hoot');}
function surprise(){const C=C3();player.path=[];player.action=null;C.partyNow=true;C.princessFollow=false;
  const pr=ents.princess;pr.x=PARTY_C.x;pr.y=PARTY_C.y-.4;
  PONY_IDS.filter(rescued).forEach(id=>{const e=ents[id],h=homeOf(id);if(state.follower===id)return;e.x=h.x;e.y=h.y;e.tx=null;e.hop=state.time+Math.random()*.4;burst(e.x,e.y-.8,'🎉',5);});
  celebrate();startFireworks(16);sfx('fanfare');
  talk([['sugarplum','SURPRISE!'],
    ['cloudberry','Oh my! A surprise party? For ME?'],
    ['sugarplum','Yes! And {name} helped me bake the cake!'],
    ['cloudberry','My fountain is working, my ponies are safe, and now a party! This is the best day ever!'],
    ['cloudberry','{name}, you are the kindest, bravest friend in the whole sky.'],
    ['cloudberry','So I have a special present for you. The Rainbow Crown!'],
    ()=>{C.crown=true;celebrate();sfx('sparkle');burst(player.x,player.y-1.5,'🌈',10,1.2);particles.push({x:player.x,y:player.y-1.7,vx:0,vy:-.5,g:0,life:1.8,max:1.8,e:'👑',size:.6});saveGame();},
    ['narrator','You got the Rainbow Crown! Now you are a real hero of the Cloud Kingdom!'],
    ['moonbeam','Hooray for {name}!'],
    ['twinkle','Let us eat cake! Yum, yum!']],()=>{C.partyDone=true;completeQuest();});}
function fillEmptyCottages(){const free=NEW.filter(id=>rescued(id)&&!state.cottages[state.ponies[id].home]);
  state.cottages.forEach((c,i)=>{if(!c.pony&&free.length)moveIn(i,free.shift());});}

// ===== Mini-game: fireflies =====
const GARDEN=[47.3,32.4,58.7,43.5];
function startFlies(mode){const C=C3();let rc,n;
  if(mode==='story'){rc=GARDEN;n=Math.max(0,5-C.lanterns)+1;}
  else{const cl=inClouds(player.x),vil=inVillage(player.x,player.y);
    rc=[player.x-5,player.y-3.2,player.x+5,player.y+3.2];
    if(vil){rc[0]=Math.max(rc[0],VILLAGE.x0+.5);rc[2]=Math.min(rc[2],VILLAGE.x1+.5);rc[1]=Math.max(rc[1],VILLAGE.y0+.5);rc[3]=Math.min(rc[3],VILLAGE.y1+.5);}
    else if(!cl){const P=AREAS[areaAt(player.x,player.y)].play;rc[0]=Math.max(rc[0],P[0]);rc[2]=Math.min(rc[2],P[2]);rc[1]=Math.max(rc[1],P[1]);rc[3]=Math.min(rc[3],P[3]);}
    else{rc[0]=Math.max(rc[0],45.5);}
    n=5;say(L.flyStart,'moonbeam');}
  const list=[];for(let i=0;i<n;i++){let x,y,tries=0;
    do{x=rand(rc[0],rc[2]);y=rand(rc[1],rc[3]);tries++;}while(tries<40&&(!walkable(Math.floor(x),Math.floor(y))||dist(x,y,player.x,player.y)<2.2));
    list.push({x,y,tx:x,ty:y,ph:Math.random()*6,st:'free',walkT:0});}
  flies={mode,rc,list,need:mode==='story'?Math.max(0,5-C.lanterns):5,got:0,pend:0,end:0};}
function catchFly(f){if(!flies||f.st!=='free')return;const C=C3();f.st='go';sfx('sparkle');burst(f.x,f.y-.3,'✨',5,.6);
  if(flies.mode==='story'){const i=C.lanterns+flies.pend;flies.pend++;if(i>=LANTERNS.length){f.st='gone';return;}f.lan=i;}
  else f.orb=flies.got+flies.pend++;}
function fliesUpdate(dt){const F=flies,t=state.time,C=C3();
  if(F.mode==='story'&&qid()!=='c3fireflies'){flies=null;return;}
  if(F.end&&t>F.end){flies=null;return;}
  for(const f of F.list){
    if(f.st==='free'){const d=dist(f.x,f.y,player.x,player.y);
      if(d<.85){catchFly(f);continue;}
      if(d<1.9){const k=1/(d||1);f.tx=clamp(f.x+(f.x-player.x)*k*1.5,F.rc[0],F.rc[2]);f.ty=clamp(f.y+(f.y-player.y)*k*1.5,F.rc[1],F.rc[3]);moveToward(f,f.tx,f.ty,2.1,dt);}
      else{if(dist(f.x,f.y,f.tx,f.ty)<.1||Math.random()<dt*.3){f.tx=clamp(f.x+rand(-2,2),F.rc[0],F.rc[2]);f.ty=clamp(f.y+rand(-1.5,1.5),F.rc[1],F.rc[3]);}moveToward(f,f.tx,f.ty,.9,dt);}}
    else if(f.st==='go'){
      if(F.mode==='story'){const[lx,ly]=LANTERNS[f.lan];if(moveToward(f,lx+.5,ly-.15,6,dt)){f.st='done';F.pend--;C.lanterns++;sfx('sparkle');
          burst(lx+.5,ly-.6,'✨',8,.8);floatText(lx+.5,ly-1.2,'💡 '+C.lanterns+'/5');saveGame();}}
      else{const m=ents.moonbeam;if(moveToward(f,m.x,m.y-1.2,6,dt)){f.st='orbit';F.pend--;F.got++;sfx('pop');
          if(F.got>=F.need){say(L.flyDone,'moonbeam');celebrate(true);if(rescued('moonbeam'))addHeart('moonbeam',2);m.hop=t;m.pause=t+6;F.end=t+7;saveGame();}}}}
    else if(f.st==='orbit'){const m=ents.moonbeam,a=t*1.6+f.orb*1.257;f.x=m.x+Math.cos(a)*.8;f.y=m.y-1.1+Math.sin(a)*.35;}
  }}

// ===== Mini-game: tag with Twinkle =====
function bfsD(sx,sy,ok,maxD){const D=new Map([[K(sx,sy),0]]),q=[[sx,sy]];
  for(let h=0;h<q.length;h++){const[x,y]=q[h],d=D.get(K(x,y));if(maxD&&d>=maxD)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=K(nx,ny);if(D.has(k)||!ok(nx,ny))continue;D.set(k,d+1);q.push([nx,ny]);}}
  return D;}
function startTag(mode){const e=ents.twinkle;if(!rescued('twinkle'))return;
  const px=Math.floor(player.x),py=Math.floor(player.y),cl=inClouds(player.x),vil=inVillage(player.x,player.y);
  let reg2,sx,sy;
  if(mode==='story'||MAZE(px,py)){reg2=MAZE;if(mode==='story'){sx=66;sy=4;}else{sx=Math.floor(e.x);sy=Math.floor(e.y);if(!MAZE(sx,sy)||!walkable(sx,sy)){sx=66;sy=4;}}}
  else{const x0=px-7,x1=px+7,y0=py-4,y1=py+4,ar=areaAt(player.x,player.y);
    reg2=(x,y)=>x>=x0&&x<=x1&&y>=y0&&y<=y1&&areaAt(x,y)===ar&&(!vil||inVillage(x,y))&&(vil||ar!=='valley'||y<29);
    sx=Math.floor(e.x);sy=Math.floor(e.y);if(!reg2(sx,sy)||!walkable(sx,sy)){sx=px;sy=py;}}
  const ok=bfsD(sx,sy,(x,y)=>reg2(x,y)&&walkable(x,y),0);
  tag={mode,ok,x:sx+.5,y:sy+.5,cx:sx,cy:sy,nx:null,px:-1,py:-1,pause:state.time+(mode==='story'?0:1.4),cool:state.time+1.4,n:mode==='story'?C3().tags:0,flip:false,walkT:0,moving:false,teaseT:state.time+4,done:false};
  if(mode==='play'){say(L.tagStart,'twinkle');e.hop=state.time;}}
function tagD(){const px=Math.floor(player.x),py=Math.floor(player.y);
  if(tag.ok.has(K(px,py)))return bfsD(px,py,(x,y)=>tag.ok.has(K(x,y)),0);return null;}
function tagScore(D,x,y){return D?(D.get(K(x,y))||0):dist(x+.5,y+.5,player.x,player.y);}
function tagUpdate(dt){const T=tag,t=state.time,e=ents.twinkle;
  if(T.mode==='story'&&qid()!=='c3tag'&&!T.done){tag=null;return;}
  const d=dist(player.x,player.y,T.x,T.y);
  if(!T.done&&T.pause<=t){
    if(T.nx===null){const D=tagD(),far=d>7;let best=null,bs=-1e9;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=T.cx+dx,y=T.cy+dy;if(!T.ok.has(K(x,y)))continue;
        const sc=far?Math.random():tagScore(D,x,y)+Math.random()*.7-(x===T.px&&y===T.py?1.6:0);if(sc>bs){bs=sc;best=[x,y];}}
      if(best){T.nx=best[0];T.ny=best[1];}else T.pause=t+1;}
    if(T.nx!==null&&moveToward(T,T.nx+.5,T.ny+.5,d<4?2.6:d>7?1:1.7,dt)){T.px=T.cx;T.py=T.cy;T.cx=T.nx;T.cy=T.ny;T.nx=null;
      if(Math.random()<(d>7?.35:.1)){T.pause=t+rand(.6,1.2);e.emote={e:pick(['😆','🎵','💗']),until:t+1.2};}}
  }else T.moving=false;
  if(!T.done&&d>6&&t>T.teaseT){T.teaseT=t+rand(7,11);if(onScreen(T.x,T.y)&&!dlgOpen)say(pick(TEASE),'twinkle');}
  if(!T.done&&t>T.cool&&d<.95&&!dlgOpen)tagHit();
  e.x=T.x;e.y=T.y;e.flip=T.flip;e.walkT=T.walkT;e.moving=T.moving;e.pause=t+1;e.tx=null;}
function tagHit(){const T=tag,t=state.time,e=ents.twinkle;T.n++;sfx('pop');burst(T.x,T.y-.8,'✨',10,1);burst(T.x,T.y-.5,'💗',5);celebrate(true);
  if(T.mode==='story'){C3().tags=T.n;saveGame();}
  if(T.n>=3){T.done=true;T.moving=false;e.hop=t;
    if(T.mode==='story')talk([['twinkle','You tagged me 3 times! You are so good at tag!']],()=>{tag=null;completeQuest();});
    else{say(L.tagDone,'twinkle');addHeart('twinkle',2);tag=null;e.pause=t+4;saveGame();}return;}
  say(TAG[T.n-1],'twinkle');
  // poof to a far spot
  const D=tagD(),cands=[];for(const k of T.ok.keys()){const x=k%W,y=(k/W)|0,s=tagScore(D,x,y);
    if(T.mode==='play'&&(Math.abs(x+.5-player.x)>6||Math.abs(y+.5-player.y)>3.6))continue;cands.push([s,x,y]);}
  cands.sort((a,b)=>b[0]-a[0]);const c=cands.length?cands[Math.floor(Math.random()*Math.min(4,cands.length))]:null;
  burst(T.x,T.y-.4,'💨',6,.8);
  if(c){T.x=c[1]+.5;T.y=c[2]+.5;T.cx=c[1];T.cy=c[2];T.nx=null;T.px=-1;}
  burst(T.x,T.y-.6,'✨',8,.8);T.cool=t+1.2;T.pause=t+1.1;e.emote={e:'😆',until:t+1.5};}

// ===== Mini-game: rainbow race =====
function genCourse(n){const vil=inVillage(player.x,player.y),ar=areaAt(player.x,player.y);
  const ok=(x,y)=>walkable(x,y)&&areaAt(x,y)===ar&&(!vil||inVillage(x,y))&&(vil||ar!=='valley'||y<29)&&!state.plots[x+','+y]&&map[y][x]!=='r'&&map[y][x]!=='S';
  const pts=[{x:player.x,y:player.y}];let cur=[Math.floor(player.x),Math.floor(player.y)];
  for(let i=0;i<n;i++){const D=bfsD(cur[0],cur[1],ok,8);let best=null,bs=-1e9;
    for(const[k,d]of D){if(d<4||d>7)continue;const x=k%W,y=(k/W)|0,lp=pts[pts.length-1];if(Math.abs(y+.5-lp.y)>3.6||Math.abs(x+.5-lp.x)>6.4)continue;let m=1e9;for(const p of pts)m=Math.min(m,dist(x+.5,y+.5,p.x,p.y));
      const sc=Math.min(m,5)-dist(x+.5,y+.5,player.x,player.y)*.18+Math.random()*1.5;if(sc>bs){bs=sc;best=[x,y];}}
    if(!best)break;pts.push({x:best[0]+.5,y:best[1]+.5});cur=best;}
  return pts.length>=4?pts:null;}
function startRace(mode,course,ids){closePonyMenu();player.path=[];player.action=null;
  if(mode==='story'){player.x=course[0].x-.3;player.y=course[0].y;}
  race={mode,course,next:1,phase:'count',t0:state.time,said:-1,racers:ids.map((id,i)=>({id,i,p:0,x:course[0].x,y:course[0].y}))};
  if(mode==='play')say(L.raceStart,'peaches');}
function segLen(i){const c=race.course;return Math.max(.5,dist(c[i].x,c[i].y,c[i+1].x,c[i+1].y));}
function posAt(p,lat){const c=race.course,n=c.length-1,i=Math.min(n-1,Math.max(0,Math.floor(p))),f=clamp(p-i,0,1),a=c[i],b=c[i+1];
  const dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1;return{x:a.x+dx*f-dy/l*lat,y:a.y+dy*f+dx/l*lat};}
function raceUpdate(dt){const R=race,t=state.time,c=R.course,n=c.length-1;
  if(R.mode==='story'&&qid()!=='c3race'){race=null;return;}
  if(R.phase==='count'){player.path=[];const k=Math.floor((t-R.t0)/.9);
    if(k!==R.said&&k<=3){R.said=k;say(COUNT[k],'narrator');sfx(k<3?'tap':'fanfare');}
    if(k>=3){R.phase='go';}}
  else if(R.phase==='go'){const g=c[R.next];
    if(dist(player.x,player.y,g.x,g.y)<.9){burst(g.x,g.y-.8,'🌈',6,.9);sfx(R.next===n?'fanfare':'sparkle');R.next++;
      if(R.next>n){R.phase='done';R.tDone=t;celebrate();startFireworks(3);showToast(L.medal);}}}
  else if(R.phase==='done'&&t-R.tDone>2.6&&!dlgOpen){finishRace();return;}
  // pony racers fly along the course, close behind or a little ahead, but never win
  const k=Math.min(R.next,n),seg=Math.max(0,k-1),frac=R.phase==='go'?clamp(1-dist(player.x,player.y,c[k].x,c[k].y)/segLen(seg),0,.98):0;
  const pp=R.phase==='done'?n:seg+frac,N=R.racers.length;
  for(const r of R.racers){const e=ents[r.id];
    let tgt=R.phase==='count'?0:R.phase==='done'?n-.02:pp+(k>=n?-.3-.15*r.i:.35-.22*r.i);
    const old={x:r.x,y:r.y};
    if(tgt>r.p){const s=Math.min(Math.floor(r.p),n-1);r.p=Math.min(tgt,r.p+5.2*dt/segLen(s));}
    const lat=(r.i-(N-1)/2)*.75+(N===1?.7:0),q=posAt(r.p,lat);r.x=q.x;r.y=q.y;
    const mv=dist(old.x,old.y,r.x,r.y);e.x=r.x;e.y=r.y;e.moving=mv>.002;if(e.moving){e.walkT=(e.walkT||0)+dt*14;if(Math.abs(r.x-old.x)>.001)e.flip=r.x<old.x;}
    e.pause=t+1;e.tx=null;}}
function finishRace(){const R=race;race=null;
  if(R.mode==='story')talk([['peaches','Wow! You won the Rainbow Race! You are super fast!'],
    ()=>{C3().medal=true;saveGame();},['narrator','You got a gold medal! 🥇']],completeQuest);
  else{say(L.raceWin,'peaches');if(rescued('peaches'))addHeart('peaches',2);const e=ents.peaches;e.hop=state.time;e.pause=state.time+4;saveGame();}}
function lineUp(){const ids=PONY_IDS.filter(rescued);ids.forEach((id,i)=>{const e=ents[id];
  if(state.follower===id)return;e.x=START.x+1.2+(i%2)*.5;e.y=START.y-1.4+i*.62;e.flip=true;e.moving=false;e.pause=state.time+1;e.tx=null;
  if(Math.random()<.004)e.hop=state.time;});}

// ===== Stop replayable mini-games =====
function stopGames(){if(race&&race.mode==='play')race=null;if(tag)tag=null;if(flies&&flies.mode==='play')flies=null;}
HOOK.play.twinkle=()=>{stopGames();startTag('play');};
HOOK.play.peaches=()=>{stopGames();const c=genCourse(5);
  if(!c){const e=ents.peaches;e.trick=state.time;sfx('fanfare');say(pick(T2.play),'peaches');addHeart('peaches',1);return;}
  startRace('play',c,['peaches']);};
HOOK.play.moonbeam=()=>{stopGames();startFlies('play');};
HOOK.play.sugarplum=()=>{stopGames();openBake('cup',()=>gotCupcakes(true));};
function gotCupcakes(fromPony){state.inv.cupcake+=3;sfx('harvest');floatText(player.x,player.y-1.2,'+3 🧁');refreshBar(true);
  if(fromPony&&rescued('sugarplum')){addHeart('sugarplum',2);const e=ents.sugarplum;e.hop=state.time;burst(e.x,e.y-1,'💗',6);say(L.cupThanks,'sugarplum');}
  else say(L.cupDone,'narrator');saveGame();}
window.ch3OpenBakery=()=>{closePonyMenu();stopGames();openBake('bakery',()=>gotCupcakes(false));};

// ===== Fireworks =====
function startFireworks(sec){fw={until:state.time+sec,next:0,list:[]};}
function fwUpdate(dt){const F=fw,t=state.time;
  if(t<F.until&&t>F.next){F.next=t+rand(.25,.6);const c=pick(STARS).c;F.list.push({x:rand(vw*.15,vw*.85),y:vh+10,vy:-rand(vh*.9,vh*1.2),ty:rand(vh*.15,vh*.45),c,ex:false,t:0});sfx('pop');}
  for(let i=F.list.length-1;i>=0;i--){const r=F.list[i];r.t+=dt;
    if(!r.ex){r.y+=r.vy*dt;if(r.y<=r.ty){r.ex=true;r.t=0;}}
    else if(r.t>1.3)F.list.splice(i,1);}
  if(t>F.until&&!F.list.length)fw=null;}

// ===== Per-frame update =====
const NEEDS={c3moonflower:{moonflower:1},c3cakeFood:{strawberry:3,staroat:3}};
function plantedOf(k){let n=0;for(const key in state.plots){const p=state.plots[key];if(p.c===k&&+key.split(',')[0]>=45)n++;}return n;}
function needPlant(q){const nd=NEEDS[q];if(!nd)return[];return Object.keys(nd).filter(k=>state.inv[k]+plantedOf(k)<nd[k]);}
function drizUpdate(dt){const t=state.time;
  if(!C3().fountain||!inClouds(player.x)||driz.sleepy)return;
  let best=null,bd=1e9;for(const k in state.plots){const p=state.plots[k];if(p.w)continue;const[x,y]=k.split(',').map(Number);if(x<45)continue;
    const d=dist(driz.x,driz.y,x+.5,y-.65);if(d<bd){bd=d;best={x,y,p};}}
  if(best){if(bd>18){driz.x=best.x+3;driz.y=best.y-3;}
    if(moveToward(driz,best.x+.5,best.y-.65,7,dt)){best.p.w=true;rainAt(best.x+.5,best.y+.5);const pt=particles[particles.length-1];
      if(pt&&pt.draw===drawRainCloud)pt.draw=drawRainDrops;driz.rain=t;}
    return;}
  if(dist(driz.x,driz.y,player.x,player.y)>13){driz.x=player.x+5;driz.y=player.y-4;}
  const tx=player.x+2.8*Math.sin(t*.21),ty=player.y-2.9+Math.sin(t*.6)*.4,d=dist(driz.x,driz.y,tx,ty);
  moveToward(driz,tx,ty,d>4?5:.8,dt);}
function drawRainDrops(p,al){const s=ts,x=SX(p.x),y=SY(p.y);ctx.save();ctx.globalAlpha=al;ctx.strokeStyle='#5fb8ff';ctx.lineWidth=Math.max(1.5,s*.04);ctx.lineCap='round';
  for(let i=0;i<6;i++){const k=((p.max-p.life)*2.2+i*.19)%1,dx=(i-2.5)*s*.13;ctx.beginPath();ctx.moveTo(x+dx,y+s*.15+k*s*.75);ctx.lineTo(x+dx-s*.03,y+s*.27+k*s*.75);ctx.stroke();}
  ctx.restore();}
function resumeDone(q,C){switch(q){
  case 'c3letter':return C.letterRead;case 'c3drops':return C.found>=3;case 'c3fountain':return C.fountain;case 'c3moon':return C.metHoot;
  case 'c3moonflower':return rescued('moonbeam');case 'c3sugar':return C.metSugar;case 'c3cakeFood':return C.foodGiven;
  case 'c3bake':return rescued('sugarplum');case 'c3race':return C.medal;case 'c3tag':return C.tags>=3&&!tag;case 'c3party':return C.partyDone;}return false;}
HOOK.update.push(dt=>{
  const C=C3(),t=state.time,q=qid(),cl=inClouds(player.x);
  // bluebird
  if(q==='c3letter'&&!bird.leaving){if(dist(bird.x,bird.y,player.x,player.y)>12){bird.x=player.x+6;bird.y=player.y-4;}
    moveToward(bird,player.x+1.6+Math.sin(t*.9)*.4,player.y-1.2+Math.sin(t*2.3)*.25,5,dt);}
  else if(bird.leaving&&t-bird.leftAt<5){bird.x+=dt*5;bird.y-=dt*4;}
  drizUpdate(dt);
  if(flies)fliesUpdate(dt);
  if(tag)tagUpdate(dt);
  if(race)raceUpdate(dt);
  if(fw)fwUpdate(dt);
  for(let i=fx.length-1;i>=0;i--)if(t-fx[i].t0>fx[i].dur)fx.splice(i,1);
  if(q==='c3race'&&!race&&cl)lineUp();
  // princess follows during the surprise
  const pr=ents.princess;
  if(C.princessFollow&&cl){if(dist(pr.x,pr.y,player.x,player.y)>10){pr.x=player.x-1;pr.y=player.y+.2;}follow(pr,1.9,dt);}
  else if(!C.partyNow&&cl&&dist(pr.x,pr.y,57.5,11.4)>.1&&!onScreen(pr.x,pr.y)){pr.x=57.5;pr.y=11.4;}
  // sparkle hints on the clouds that hold drops
  if(q==='c3drops'&&cl&&C.dropG)for(const g of C.dropG){if(C.searched.includes(g)||Math.random()>dt*.45)continue;
    const[x,y]=pick(FL[g].tiles);particles.push({x:x+.5+rand(-.3,.3),y:y-rand(.1,.6),vx:0,vy:-.5,g:0,life:1,max:1,e:'✨',size:.26});}
  // wishes above the ponies' heads
  const sp=ents.sugarplum;
  if(!rescued('sugarplum')){if(q==='c3cakeFood')sp.emote={e:Math.floor(t/2)%2?'🍓':'🌾',until:t+1};else if(q==='c3bake')sp.emote={e:'🎂',until:t+1};else if(q==='c3sugar')sp.emote={e:'🎵',until:t+1};}
  // pick the right seed for the current growing task
  const np=needPlant(q);if(cl&&np.length&&!np.includes(state.seed)&&seedsHere().includes(np[0])){state.seed=np[0];refreshBar(true);}
  if(q==='c3build'){if(state.inv.wood>=3&&!C.woodSaid&&inVillage(player.x,player.y)){C.woodSaid=true;say(N2.woodReady,'narrator');}if(state.inv.wood<3)C.woodSaid=false;}
  if(isCh3()){const qq=Q[state.quest];if(qq.goal){const s=`${Math.min(state.qprog,qq.goal)}/${qq.goal}`,el=$('objProg');if(el.textContent!==s)el.textContent=s;}}
  // story triggers
  const busy=dlgOpen||player.action||flight||bk||$('c2modal').classList.contains('show');
  if(busy)return;
  const near=(e,r)=>dist(player.x,player.y,e.x,e.y)<r;
  if(q==='c3fly'&&cl)return completeQuest();
  if(q==='c3flyHome'&&!cl)return completeQuest();
  if(resumeDone(q,C)){if(q==='c3fountain'&&!C.pathOpen)openPath(true);if(q==='c3party')C.crown=true;return completeQuest();}
  if(q==='c3fountain'&&C.fountain&&!C.pathOpen)openPath(true);
  if(q==='c3moon'&&cl&&near(ents.moonbeam,2.6))return meetMoon();
  if(q==='c3sugar'&&cl&&near(ents.sugarplum,2.4))return meetSugar();
  if(q==='c3fireflies'&&!flies)startFlies('story');
  if(q==='c3tag'&&!tag&&C.tags<3&&!race&&!flies)startTag('story');
  if(q==='c3race'&&!race&&cl&&near(START,1.1))return talk([['peaches','Ready? Run through all the rainbow rings!']],
    ()=>startRace('story',STORY_COURSE,PONY_IDS.filter(id=>rescued(id)&&state.follower!==id)));
  if(q==='c3party'&&C.princessFollow&&!C.partyNow&&near(PARTY_C,4.2)&&dist(pr.x,pr.y,PARTY_C.x,PARTY_C.y)<7)return surprise();
  if(q==='c3build'&&!C.ended&&Q[state.quest].prog()>=2&&NEW.every(id=>!ents[id].goHome)){C.ended=true;
    talk([['narrator','Hooray! You fixed the Rain Fountain, rescued Moonbeam and Sugarplum, and threw the best party in the sky!'],
      ['narrator','Tap on a pony and press the play button. Each pony has a special game to play with you!']],()=>{celebrate();completeQuest();});}
});

// ===== Taps =====
function walkTo(wx,wy){player.action=null;player.path=findPath(wx,wy);}
HOOK.tap.push((wx,wy)=>{
  const C=C3(),q=qid(),cl=inClouds(player.x);
  if(race){if(race.phase==='count')return true;
    if(race.phase==='go'){const g=race.course[race.next];if(g&&dist(wx,wy,g.x,g.y-.6)<1.1)walkTo(g.x,g.y);else walkTo(wx,wy);return true;}}
  if(tag&&!tag.done){if(dist(wx,wy,tag.x,tag.y-.5)<1.2){goDo(tag.x,tag.y,.8,()=>{},ents.twinkle);return true;}
    if(tag.mode==='play'){walkTo(wx,wy);return true;}}
  if(flies)for(const f of flies.list)if(f.st==='free'&&dist(wx,wy,f.x,f.y)<1){goDo(f.x,f.y,.8,()=>catchFly(f),f);return true;}
  if(q==='c3letter'&&!bird.leaving&&dist(wx,wy,bird.x,bird.y)<1.1){goDo(bird.x,bird.y+1.2,2,readLetter,bird);return true;}
  if(!cl)return false;
  if(wx>60.7&&wx<63.3&&wy>10.4&&wy<14.2){goDo(FOUNT.x,FOUNT.y+.75,1.8,tapFountain);return true;}
  if(q==='c3drops'){const tx=Math.floor(wx);for(const yy of [Math.floor(wy),Math.floor(wy+.45)]){const g=tileG.get(K(tx,yy));
    if(g!==undefined){tapCloud(g,tx,yy);return true;}}}
  for(const id of NEW){if(rescued(id))continue;const e=ents[id];
    if(dist(wx,wy,e.x,e.y-.5)<1){goDo(e.x,e.y,1.7,()=>talkNew(id),e);return true;}}
  if(dist(wx,wy,HOOT.x+.35,HOOT.y-1.5)<1.1){goDo(HOOT.x+.9,HOOT.y+.5,1.8,talkHoot);return true;}
  if(C.fountain&&!driz.sleepy&&dist(wx,wy,driz.x,driz.y)<.75&&map[Math.floor(wy)][Math.floor(wx)]!=='S'){sfx('water');say(pick(DRIZ),'drizzle');driz.rain=state.time;driz.hop=state.time;return true;}
  if(C.cakeDone&&dist(wx,wy,TABLE.x,TABLE.y-1)<1.2&&!C.partyDone){goDo(TABLE.x,TABLE.y+1,1.6,()=>{sfx('sparkle');burst(TABLE.x,TABLE.y-1.4,'✨',6);});return true;}
  return false;
});

// ===== Guiding arrow =====
const up=(e,h)=>({x:e.x,y:e.y-(h||.6)});
function soilT(kinds,moonFirst){const pl=Object.entries(state.plots).map(([k,p])=>{const[x,y]=k.split(',').map(Number);return{x:x+.5,y:y+.5,p};})
    .filter(o=>o.x>=45&&kinds.includes(o.p.c));
  const ripe=nearest(pl.filter(o=>stageOf(o.p)>=3));if(ripe)return ripe;
  if(!needPlant(qid()).length){const g=nearest(pl);if(g)return g;}
  const free=[];for(let y=0;y<H;y++)for(let x=45;x<W;x++)if(map[y][x]==='S'&&!state.plots[x+','+y])free.push({x:x+.5,y:y+.5,moon:y>=29});
  const pref=free.filter(f=>f.moon===!!moonFirst);return nearest(pref)||nearest(free)||nearest(pl)||{x:52.5,y:17.5};}
HOOK.target.push(()=>{
  if(race&&race.phase!=='done'){const g=race.course[race.next];return race.phase==='go'&&g?{x:g.x,y:g.y-.3}:null;}
  if(tag&&!tag.done)return{x:tag.x,y:tag.y-.6};
  if(flies&&flies.mode==='play'){const f=nearest(flies.list.filter(f=>f.st==='free'));return f?{x:f.x,y:f.y+.4}:null;}
  if(!isCh3())return undefined;
  const C=C3(),q=qid(),cl=inClouds(player.x),padV={x:PADS.valley.x,y:PADS.valley.y-1.6},padC={x:PADS.clouds.x,y:PADS.clouds.y-1.6};
  if(q==='c3letter')return bird.leaving?null:{x:bird.x,y:bird.y-.2};
  if(q==='c3fly')return cl?null:padV;
  if(q==='c3flyHome')return cl?padC:null;
  if(q==='c3build'){if(cl)return padC;if(!inVillage(player.x,player.y))return VILLAGE_GATE;
    if(state.inv.wood<3)return nearest(LOG_SPOTS.map(([x,y],i)=>({x,y,i})).filter(o=>!(state.logsAt[o.i]>state.time)));return null;}
  if(!cl)return padV;
  switch(q){
    case 'c3drops':{let b=null,bd=1e9;FL.forEach((g,i)=>{if(C.searched.includes(i))return;for(const[x,y]of g.tiles){const d=dist(x+.5,y+.5,player.x,player.y);if(d<bd){bd=d;b={x:x+.5,y:y+.2};}}});return b;}
    case 'c3fountain':return{x:FOUNT.x,y:FOUNT.y-.2};
    case 'c3moon':return up(ents.moonbeam);
    case 'c3fireflies':{const f=flies&&nearest(flies.list.filter(f=>f.st==='free'));return f?{x:f.x,y:f.y+.4}:null;}
    case 'c3moonflower':return state.inv.moonflower>0||C.awake?up(ents.moonbeam):soilT(['moonflower'],true);
    case 'c3sugar':case 'c3bake':return up(ents.sugarplum);
    case 'c3cakeFood':return state.inv.strawberry>=3&&state.inv.staroat>=3?up(ents.sugarplum):soilT(['strawberry','staroat'].filter(k=>state.inv[k]<3),false);
    case 'c3race':return{x:START.x,y:START.y-.2};
    case 'c3tag':return up(ents.twinkle);
    case 'c3party':return C.partyNow?null:C.princessFollow?PARTY_C:up(ents.princess);
  }
  return null;
});

// ===== Begin / land / bar =====
HOOK.begin.push(isNew=>{const C=ensure(),q=qid();
  race=null;tag=null;flies=null;fw=null;searching=false;wigT.clear();
  bird.leaving=q!=='c3letter';bird.x=player.x+6;bird.y=player.y-4;
  driz.x=player.x+4;driz.y=player.y-3;driz.sleepy=false;
  if(q==='c3drops')initDrops();
  if(!isNew&&q==='c3letter'&&!C.letterSeen)talk(Q[state.quest].start);
  if(C.partyNow&&!C.partyDone){C.partyNow=false;C.princessFollow=true;}
  if(C.princessFollow&&inClouds(player.x)){ents.princess.x=player.x-1.2;ents.princess.y=player.y+.2;}
  if(C.partyDone&&C.gather&&inClouds(player.x)){C.partyNow=true;ents.princess.x=PARTY_C.x;ents.princess.y=PARTY_C.y-.4;}
  placePonies();
});
HOOK.land.push(to=>{const C=C3();stopGames();
  if(to==='clouds'){driz.x=player.x+4;driz.y=player.y-3;if(C.princessFollow){ents.princess.x=player.x-1.2;ents.princess.y=player.y+.2;}}
  else if(C.partyDone){C.gather=false;C.partyNow=false;ents.princess.x=57.5;ents.princess.y=11.4;}});
HOOK.bar.push(()=>{const g=(race&&race.mode==='play')||(tag&&tag.mode==='play')||(flies&&flies.mode==='play');
  return g?[{key:'c3stop',html:'✖',label:'stop',onTap:()=>{stopGames();sfx('tap');refreshBar(true);}}]:null;});

// ===== Drawing =====
let nightSpr=null;
function nightSprite(){if(!nightSpr){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),gr=g.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,'rgba(30,22,84,.6)');gr.addColorStop(.62,'rgba(30,22,84,.52)');gr.addColorStop(1,'rgba(30,22,84,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);nightSpr=c;}return nightSpr;}
const NSTARS=[...Array(46)].map((_,i)=>({x:45.2+hash(i,301)*16,y:28.5+hash(i,302)*19,r:.03+hash(i,303)*.05,p:hash(i,304)*6}));
HOOK.tile.push((c,x,y,sx,sy,s,h,t)=>{
  if(c!=='Z')return false;
  ctx.save();ctx.globalAlpha=.35+.1*Math.sin(t*2+y);ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(2,s*.05);ctx.setLineDash([s*.12,s*.1]);
  rr(sx+s*.08,sy+s*.08,s*.84,s*.84,s*.3);ctx.stroke();ctx.restore();return true;});
HOOK.ground.push((t,x0,y0,x1,y1)=>{
  if(!inClouds(player.x)||y1<27)return;const s=ts,C=C3();
  // the Moon Garden is always night-time
  const cx=SX(52.6),cy=SY(38.4);ctx.drawImage(nightSprite(),cx-s*10.5,cy-s*9.2,s*21,s*18.4);
  for(const st of NSTARS){if(st.x<x0-1||st.x>x1+1||st.y<y0-1||st.y>y1+1)continue;const c=map[Math.floor(st.y)][Math.floor(st.x)];
    const a=.5+.5*Math.sin(t*2+st.p);if(c==='X')twinkle(SX(st.x),SY(st.y),s*st.r*2.4*a+1,.9);else if(c==='n'&&a>.8)twinkle(SX(st.x),SY(st.y),s*st.r*1.6,.7);}
  if(x0<50&&y0<33){ctx.drawImage(glowSprite('#fff4b8'),SX(47.6)-s*1.4,SY(30.1)-s*1.4,s*2.8,s*2.8);drawEmoji('🌙',SX(47.6),SY(30.1),s*1.25);}
  // picnic blanket under the party table
  if(x1>=66&&y1>=33){const bx=SX(67.6),by=SY(33.5),w=s*5.8,hh=s*3.2;ctx.save();rr(bx,by,w,hh,s*.25);ctx.fillStyle='#fff';ctx.fill();ctx.clip();
    ctx.fillStyle='rgba(255,126,182,.45)';for(let i=0;i<12;i++){ctx.fillRect(bx+i*s*.5,by,s*.25,hh);}for(let j=0;j<7;j++)ctx.fillRect(bx,by+j*s*.5,w,s*.25);ctx.restore();
    ctx.strokeStyle='#ff9ad5';ctx.lineWidth=Math.max(2,s*.04);rr(bx,by,w,hh,s*.25);ctx.stroke();}
  if(C.partyDone)for(let y=Math.max(31,y0);y<=Math.min(43,y1);y++)for(let x=Math.max(63,x0);x<=Math.min(78,x1);x++){if(map[y][x]!=='c')continue;
    for(let i=0;i<2;i++){const h=hash(x*3+i,y*7);ctx.fillStyle=STARS[Math.floor(h*7)].c;ctx.fillRect(SX(x+hash(x,y+i)),SY(y+hash(x+i,y)),s*.08,s*.05);}}
  // start line
  if(qid()==='c3race'||(race&&race.mode==='story')){const sx=SX(START.x),sy=SY(START.y);ctx.fillStyle='#fff';rr(sx-s*.3,sy-s*1.15,s*.6,s*2.3,s*.12);ctx.fill();
    for(let i=0;i<8;i++)for(let j=0;j<2;j++){ctx.fillStyle=(i+j)%2?'#fff':'#4a2c5e';ctx.fillRect(sx-s*.24+j*s*.24,sy-s*1.08+i*s*.27,s*.24,s*.27);}
    drawEmoji('🏁',sx,sy-s*1.45,s*.5);}
  // little glowing night flowers in the Moon Garden
  for(let y=Math.max(31,y0);y<=Math.min(44,y1);y++)for(let x=Math.max(46,x0);x<=Math.min(59,x1);x++){if(map[y][x]!=='n')continue;const h=hash(x*5,y*3);if(h<.72)continue;
    const fx2=SX(x+.2+hash(x,y*2)*.6),fy=SY(y+.3+hash(x*2,y)*.5),col=h>.86?'#b9d4ff':'#ffd6f5',k=.75+.25*Math.sin(t*2+h*30);
    ctx.globalAlpha=k*.7;ctx.drawImage(glowSprite(col),fx2-s*.2,fy-s*.2,s*.4,s*.4);ctx.globalAlpha=1;ctx.fillStyle=col;for(let i=0;i<5;i++){const a=i*1.257;circ(fx2+Math.cos(a)*s*.045,fy+Math.sin(a)*s*.045,s*.035);ctx.fill();}
    ctx.fillStyle='#fff6a8';circ(fx2,fy,s*.025);ctx.fill();}
});
function drawFountain(t){const s=ts,bx=SX(FOUNT.x),by=SY(FOUNT.y),C=C3(),on=C.fountain;
  shadow(bx,by,s*1.25,s*.22);ctx.lineWidth=Math.max(1,s*.035);ctx.lineJoin='round';
  if(on){ctx.save();ctx.globalAlpha=.32;ctx.lineWidth=s*.07;STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ctx.beginPath();ctx.arc(bx,by-s*.9,s*(1.45-i*.07),Math.PI*1.05,Math.PI*1.95);ctx.stroke();});ctx.restore();}
  ctx.fillStyle='#efe4ff';ctx.strokeStyle='#bba3e6';rr(bx-s*1.1,by-s*.62,s*2.2,s*.6,s*.22);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)';rr(bx-s*.95,by-s*.48,s*1.9,s*.07,s*.035);ctx.fill();
  for(let i=0;i<5;i++){ctx.fillStyle=['#ff9ad5','#c9a6ff','#9fd3ff','#ffe14d','#9be3a6'][i];circ(bx-s*.8+i*s*.4,by-s*.24,s*.06);ctx.fill();}
  ctx.fillStyle='#fbf6ff';ell(bx,by-s*.62,s*1.12,s*.3);ctx.fill();ctx.stroke();
  ctx.fillStyle=on?'#7cc8ff':'#dcd0ee';ell(bx,by-s*.62,s*.95,s*.21);ctx.fill();
  if(on){ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=Math.max(1,s*.025);for(let i=0;i<2;i++){const k=(t*.6+i*.5)%1;ctx.globalAlpha=1-k;ell(bx,by-s*.62,s*(.25+.65*k),s*(.06+.14*k));ctx.stroke();}ctx.globalAlpha=1;}
  else{ctx.strokeStyle='rgba(150,120,190,.5)';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.moveTo(bx-s*.5,by-s*.65);ctx.lineTo(bx-s*.3,by-s*.58);ctx.lineTo(bx-s*.1,by-s*.66);ctx.moveTo(bx+s*.3,by-s*.7);ctx.lineTo(bx+s*.45,by-s*.6);ctx.stroke();}
  ctx.lineWidth=Math.max(1,s*.035);ctx.fillStyle='#f6efff';ctx.strokeStyle='#bba3e6';rr(bx-s*.16,by-s*1.6,s*.32,s*1.0,s*.08);ctx.fill();ctx.stroke();
  const glowIt=qid()==='c3fountain'&&state.inv.sdrop>=3;
  for(let i=0;i<3;i++){const dx=bx+(i-1)*s*.0,dy=by-s*(.8+i*.25),r=s*.075;
    if(on||glowIt){ctx.drawImage(glowSprite('#9fe0ff'),dx-r*3,dy-r*3,r*6,r*6);}
    ctx.beginPath();ctx.moveTo(dx,dy-r*1.6);ctx.quadraticCurveTo(dx+r*1.1,dy-r*.2,dx,dy+r);ctx.quadraticCurveTo(dx-r*1.1,dy-r*.2,dx,dy-r*1.6);
    ctx.fillStyle=on?'#6fc3ff':glowIt&&Math.sin(t*5)>0?'#bfe6ff':'#e7defa';ctx.fill();ctx.strokeStyle='#a993d9';ctx.lineWidth=Math.max(1,s*.02);ctx.stroke();}
  ctx.lineWidth=Math.max(1,s*.035);ctx.fillStyle='#fbf6ff';ctx.strokeStyle='#bba3e6';
  ctx.beginPath();ctx.moveTo(bx-s*.6,by-s*1.62);ctx.quadraticCurveTo(bx,by-s*1.2,bx+s*.6,by-s*1.62);ctx.closePath();ctx.fill();ctx.stroke();
  ell(bx,by-s*1.62,s*.6,s*.15);ctx.fill();ctx.stroke();ctx.fillStyle=on?'#7cc8ff':'#dcd0ee';ell(bx,by-s*1.62,s*.48,s*.1);ctx.fill();
  if(on){ctx.fillStyle='#8fd3ff';for(let i=0;i<14;i++){const k=(t*.9+i/14)%1,side=i%2?1:-1,a=(i%7)/7;
      const px=bx+side*s*(.15+k*(.55+a*.3)),py=by-s*1.75-s*(1.1*k-1.25*k*k)*1.4+s*k*.1;circ(px,py,s*(.045+.02*(1-k)));ctx.fill();}
    for(let i=0;i<6;i++){const k=(t*1.3+i/6)%1;ctx.globalAlpha=1-k;circ(bx+Math.sin(i*2.1)*s*.05,by-s*1.7-k*s*.9,s*.05);ctx.fill();}ctx.globalAlpha=1;
    if(Math.sin(t*3)>.7)drawStar(bx+s*.5,by-s*2.2,s*.07,'#fff6a8',true);}
}
function drawDrizzle(t){const s=ts*1.25,x=SX(driz.x),y=SY(driz.y)+Math.sin(t*1.7)*ts*.06-(driz.hop&&t-driz.hop<.5?Math.sin(Math.PI*(t-driz.hop)/.5)*ts*.3:0);
  ctx.save();ctx.globalAlpha=.25;shadow(x,SY(driz.y)+ts*1.65,s*.55,s*.1);ctx.restore();
  if(t-driz.rain<1.4){ctx.strokeStyle='#5fb8ff';ctx.lineWidth=Math.max(1.5,ts*.04);ctx.lineCap='round';
    for(let i=0;i<7;i++){const k=((t-driz.rain)*2.2+i*.17)%1,dx=(i-3)*s*.11;ctx.beginPath();ctx.moveTo(x+dx,y+s*.25+k*s*.7);ctx.lineTo(x+dx-s*.03,y+s*.36+k*s*.7);ctx.stroke();}}
  const P=[[-.44,.04,.28],[.44,.04,.28],[-.18,-.2,.36],[.2,-.24,.38],[0,.08,.36],[-.42,.12,.28],[.42,.12,.28],[0,.18,.34]];
  ctx.fillStyle='#9fb0ea';for(const[a,b,r]of P){circ(x+a*s,y+b*s,r*s+Math.max(2,s*.035));ctx.fill();}
  ctx.fillStyle='#c9d6ff';for(const[a,b,r]of[[-.42,.12,.28],[.42,.12,.28],[0,.18,.34]]){circ(x+a*s,y+b*s,r*s);ctx.fill();}
  ctx.fillStyle='#fff';for(const[a,b,r]of[[-.44,.04,.27],[.44,.04,.27],[-.18,-.2,.36],[.2,-.24,.38],[0,.06,.35]]){circ(x+a*s,y+b*s,r*s);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.9)';circ(x-s*.25,y-s*.36,s*.1);ctx.fill();
  const ink='#4a2c5e',sleepy=driz.sleepy;ctx.strokeStyle=ink;ctx.lineWidth=Math.max(1.5,s*.035);ctx.lineCap='round';
  for(const sd of[-1,1]){const ex=x+sd*s*.17,ey=y-s*.04;
    if(sleepy){ctx.beginPath();ctx.arc(ex,ey-s*.02,s*.06,.2,Math.PI-.2);ctx.stroke();}
    else{const bl=((t+sd*.1)%4)<.12;if(bl){ctx.beginPath();ctx.moveTo(ex-s*.05,ey);ctx.lineTo(ex+s*.05,ey);ctx.stroke();}
      else{ctx.fillStyle=ink;ell(ex,ey,s*.05,s*.068);ctx.fill();ctx.fillStyle='#fff';circ(ex+s*.015,ey-s*.025,s*.02);ctx.fill();}}}
  ctx.fillStyle='rgba(255,130,180,.5)';ell(x-s*.32,y+s*.08,s*.07,s*.04);ctx.fill();ell(x+s*.32,y+s*.08,s*.07,s*.04);ctx.fill();
  if(sleepy){ctx.beginPath();ctx.arc(x,y+s*.08,s*.04,0,Math.PI*2);ctx.stroke();drawEmoji('💤',x+s*.55,y-s*.45,s*.3);}
  else{ctx.fillStyle='#ff7eb6';ctx.beginPath();ctx.arc(x,y+s*.07,s*.08,0,Math.PI);ctx.closePath();ctx.fill();ctx.stroke();}
}
function drawLantern(i,t){const[lx,ly]=LANTERNS[i],s=ts,x=SX(lx+.5),y=SY(ly+.85),lit=i<C3().lanterns;
  shadow(x,y,s*.22,s*.06);ctx.fillStyle='#5b4a8e';rr(x-s*.04,y-s*1.05,s*.08,s*1.05,s*.03);ctx.fill();
  if(lit)ctx.drawImage(glowSprite('#ffd86b'),x-s*.9,y-s*1.95,s*1.8,s*1.8);
  ctx.fillStyle='#7b68c8';rr(x-s*.2,y-s*1.38,s*.4,s*.08,s*.03);ctx.fill();
  ctx.fillStyle=lit?'#fff3b0':'#3d356b';ctx.strokeStyle='#7b68c8';ctx.lineWidth=Math.max(1,s*.03);rr(x-s*.15,y-s*1.32,s*.3,s*.34,s*.08);ctx.fill();ctx.stroke();
  ctx.fillStyle='#7b68c8';ctx.beginPath();ctx.moveTo(x-s*.22,y-s*1.36);ctx.lineTo(x,y-s*1.55);ctx.lineTo(x+s*.22,y-s*1.36);ctx.fill();
  if(lit){ctx.fillStyle='#ffb800';circ(x+Math.sin(t*3+i)*s*.05,y-s*1.15+Math.cos(t*4+i)*s*.04,s*.04);ctx.fill();}}
function drawHootTree(t){const s=ts,x=SX(HOOT.x),y=SY(HOOT.y);shadow(x,y,s*.7,s*.14);
  ctx.fillStyle='#6a4f8f';rr(x-s*.12,y-s*1.4,s*.24,s*1.4,s*.08);ctx.fill();
  ctx.strokeStyle='#6a4f8f';ctx.lineWidth=s*.09;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y-s*1.05);ctx.lineTo(x+s*.55,y-s*1.25);ctx.stroke();
  ctx.fillStyle='#5d4fa8';for(const[a,b,r]of[[-.4,-1.75,.42],[.35,-1.85,.45],[0,-2.2,.5]]){circ(x+a*s,y+b*s,r*s);ctx.fill();}
  ctx.fillStyle='#7d6cd0';for(const[a,b,r]of[[-.3,-1.9,.3],[.3,-2.0,.3],[0,-2.35,.32]]){circ(x+a*s,y+b*s,r*s);ctx.fill();}
  for(let i=0;i<6;i++){const a=hash(i,55),b=hash(i,56),k=.5+.5*Math.sin(t*2+i);ctx.fillStyle=`rgba(255,240,170,${.5+.5*k})`;circ(x+(a-.5)*s*1.1,y-s*(1.6+b*.9),s*.04);ctx.fill();}
  drawEmoji('🦉',x+s*.52+Math.sin(t*1.3)*s*.02,y-s*1.5,s*.62);}
function drawBed(t){const s=ts,x=SX(BED.x),y=SY(BED.y);ctx.fillStyle='#e6e0ff';ell(x,y-s*.05,s*.78,s*.24);ctx.fill();
  ctx.fillStyle='#fff';for(const[a,b,r]of[[-.55,-.1,.2],[-.2,-.16,.24],[.2,-.16,.24],[.55,-.1,.2]]){circ(x+a*s,y+b*s,r*s);ctx.fill();}
  if(C3().flowerPlaced){const fx2=SX(BED.x+1.05),fy=SY(BED.y+.15);ctx.drawImage(glowSprite('#bcd0ff'),fx2-s*.5,fy-s*.8,s,s);drawEmoji('💮',fx2,fy-s*.3,s*.42);}}
function drawSleeping(t){const e=ents.moonbeam,o=Object.assign({},ponyLook('moonbeam'),{flip:false,walkT:0,moving:false}),s=ts*(o.scale||1),x=SX(e.x),y=SY(e.y)+s*.12;
  drawHorse(x,y,o);
  const ex=x+s*.445,ey=y-s*.9;ctx.fillStyle=o.body;ell(ex,ey,s*.062,s*.074);ctx.fill();
  ctx.strokeStyle='#3a2340';ctx.lineWidth=Math.max(1.2,s*.022);ctx.lineCap='round';ctx.beginPath();ctx.arc(ex,ey-s*.012,s*.042,.25,Math.PI-.25);ctx.stroke();
  ctx.fillStyle='#fff';for(const[dx,r]of[[-.45,.2],[-.16,.23],[.13,.22],[.42,.2]]){circ(x+dx*s,y-s*.06,r*s);ctx.fill();}
  ctx.fillStyle='rgba(200,190,245,.45)';ell(x,y+s*.05,s*.6,s*.08);ctx.fill();
  ctx.save();ctx.font=`bold ${Math.round(ts*.28)}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.textAlign='center';
  for(let i=0;i<3;i++){const k=(nowS()*.45+i/3)%1;ctx.globalAlpha=Math.min(1,(1-k)*1.6);ctx.fillStyle='#fff';ctx.strokeStyle='#7a6fd6';ctx.lineWidth=3;
    const zx=x+s*(.55+k*.55),zy=y-s*(1.15+k*.9);ctx.font=`bold ${Math.round(ts*(.2+k*.16))}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.strokeText('z',zx,zy);ctx.fillText('z',zx,zy);}
  ctx.restore();}
function drawFly(f,t){const s=ts*1.35,x=SX(f.x),y=SY(f.y)-ts*.5+Math.sin(t*3+f.ph)*ts*.08,k=.7+.3*Math.sin(t*6+f.ph);
  ctx.globalAlpha=k;ctx.drawImage(glowSprite('#f6ff8a'),x-s*.5,y-s*.5,s,s);ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,.85)';const w=Math.sin(t*30+f.ph)*.5+.5;ell(x-s*.07,y-s*.06,s*.07,s*.035*(.4+w));ctx.fill();ell(x+s*.07,y-s*.06,s*.07,s*.035*(.4+w));ctx.fill();
  ctx.fillStyle='#4a3a2a';circ(x-s*.03,y,s*.04);ctx.fill();ctx.fillStyle='#fff36b';circ(x+s*.04,y+s*.01,s*.055);ctx.fill();}
function drawTable(t){const s=ts,x=SX(TABLE.x),y=SY(TABLE.y),C=C3();shadow(x,y,s*1.2,s*.2);
  ctx.fillStyle='#d69c62';for(const d of[-.8,.8])ctx.fillRect(x+d*s-s*.05,y-s*.6,s*.1,s*.6);
  ctx.fillStyle='#fff';ell(x,y-s*.62,s*1.3,s*.32);ctx.fill();ctx.fillStyle='#ff9ad5';ctx.beginPath();ctx.moveTo(x-s*1.3,y-s*.62);
  for(let i=0;i<=10;i++){const a=x-s*1.3+i*s*.26;ctx.quadraticCurveTo(a-s*.13,y-s*.32,a,y-s*.42);}ctx.lineTo(x+s*1.3,y-s*.62);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffe3f2';ell(x,y-s*.66,s*1.22,s*.26);ctx.fill();
  if(C.cakeDone){const c=cakeCanvas();ctx.drawImage(c,x-s*.85,y-s*.66-s*1.4,s*1.7,s*1.47);
    if(C.partyNow||C.partyDone)for(let i=0;i<3;i++){const fx2=x+(i-1)*s*.22,fy=y-s*.66-s*1.35;ctx.drawImage(glowSprite('#ffcf5a'),fx2-s*.15,fy-s*.15,s*.3,s*.3);}}
  else{ctx.fillStyle='#fff';ctx.strokeStyle='#ffc2e2';ctx.lineWidth=2;ell(x,y-s*.72,s*.5,s*.12);ctx.fill();ctx.stroke();drawEmoji('🍽️',x+s*.75,y-s*.78,s*.3);}
  drawEmoji('🧁',x-s*.95,y-s*.82,s*.32);drawEmoji('🍭',x+s*1.0,y-s*.86,s*.32);}
function drawBunting(t){const s=ts,a={x:SX(64.6),y:SY(31.7)},b={x:SX(76.4),y:SY(31.7)};
  for(const p of[a,b]){shadow(p.x,p.y,s*.15,s*.05);ctx.fillStyle='#fff';rr(p.x-s*.05,p.y-s*1.7,s*.1,s*1.7,s*.04);ctx.fill();ctx.fillStyle='#ff9ad5';circ(p.x,p.y-s*1.72,s*.09);ctx.fill();}
  const sag=s*.55,top=a.y-s*1.6;ctx.strokeStyle='#c9a6ff';ctx.lineWidth=Math.max(1.5,s*.025);ctx.beginPath();ctx.moveTo(a.x,top);ctx.quadraticCurveTo((a.x+b.x)/2,top+sag*2,b.x,top);ctx.stroke();
  const n=14;for(let i=1;i<n;i++){const u=i/n,px=a.x+(b.x-a.x)*u,py=top+4*u*(1-u)*sag,sw=Math.sin(t*2+i)*s*.02;
    ctx.fillStyle=STARS[i%7].c;ctx.beginPath();ctx.moveTo(px-s*.15,py);ctx.lineTo(px+s*.15,py);ctx.lineTo(px+sw,py+s*.32);ctx.closePath();ctx.fill();}}
function drawBalloon(x,y,c,t,i){const s=ts,bx=SX(x)+Math.sin(t*1.3+i)*s*.06,by=SY(y)-s*1.6+Math.sin(t*1.7+i)*s*.08;
  ctx.strokeStyle='rgba(120,90,150,.6)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(SX(x),SY(y));ctx.quadraticCurveTo(SX(x)+s*.1,SY(y)-s*.6,bx,by+s*.3);ctx.stroke();
  ctx.fillStyle=c;ell(bx,by,s*.24,s*.3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ell(bx-s*.08,by-s*.1,s*.06,s*.1);ctx.fill();
  ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(bx,by+s*.28);ctx.lineTo(bx-s*.05,by+s*.36);ctx.lineTo(bx+s*.05,by+s*.36);ctx.fill();}
function drawRing(g,t,next,num,fin){const s=ts,x=SX(g.x),y=SY(g.y),p=next?1+.07*Math.sin(t*6):1,rw=s*.62*p,rh=s*.82*p,cy=y-s*.82;
  ctx.save();if(!next)ctx.globalAlpha=.5;ctx.lineWidth=s*.065;
  STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ell(x,cy,rw-i*s*.055,rh-i*s*.055);ctx.stroke();});
  ctx.fillStyle='#fff';circ(x-rw*.75,y-s*.08,s*.17);ctx.fill();circ(x+rw*.75,y-s*.08,s*.17);ctx.fill();
  if(fin){drawEmoji('🏁',x,cy-rh-s*.15,s*.45);}
  else{ctx.fillStyle='#fff';circ(x,cy-rh-s*.1,s*.17);ctx.fill();ctx.fillStyle='#d94f9b';ctx.font=`bold ${Math.round(s*.24)}px "Chalkboard SE","Comic Sans MS",sans-serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(num),x,cy-rh-s*.09);}
  if(next&&Math.sin(t*4)>.3)drawStar(x+rw*.6,cy-rh*.6,s*.07,'#fff6a8',true);ctx.restore();}
function drawFx(f,t){const s=ts,k=(t-f.t0)/f.dur,x=SX(f.x),y=SY(f.y);
  if(f.kind==='drop'){let px=x,py=y-s*Math.min(1,k*3)*1.1;if(k>.55){const u=(k-.55)/.45;px=x+(SX(player.x)-x)*u;py=py+(SY(player.y)-s*1-py)*u;}
    const r=s*.2*(1+.15*Math.sin(t*10));ctx.drawImage(glowSprite('#9fe0ff'),px-r*3,py-r*3,r*6,r*6);
    ctx.beginPath();ctx.moveTo(px,py-r*1.6);ctx.quadraticCurveTo(px+r*1.1,py-r*.2,px,py+r);ctx.quadraticCurveTo(px-r*1.1,py-r*.2,px,py-r*1.6);
    ctx.fillStyle='#6fc3ff';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='rgba(255,255,255,.8)';circ(px-r*.3,py-r*.2,r*.22);ctx.fill();
    if(Math.sin(t*12)>0)drawStar(px+r,py-r*1.2,r*.35,'#fff6a8',true);return;}
  const al=k>.8?(1-k)*5:1;
  if(f.kind==='pop'){const h=k<.15?k/.15:k>.8?(1-k)/.2:1;drawEmoji(f.e,x,y-s*.3-h*s*.5+Math.abs(Math.sin(t*8))*s*-.08,s*.6,false,Math.min(1,h*1.5));return;}
  if(f.kind==='fly'){drawEmoji(f.e,x+k*s*3+Math.sin(t*9)*s*.15,y-s*.4-k*s*2.2,s*.5,false,al);return;}
  if(f.kind==='rise'){drawStar(x,y-s*.4-k*s*1.6,s*.25*(1+.2*Math.sin(t*8)),'#ffe14d',true);return;}
  if(f.kind==='float'){const bx=x+Math.sin(t*2)*s*.2,by=y-s*.4-k*s*3;drawEmoji(f.e,bx,by,s*.6,false,al);return;}
  if(f.kind==='puff'){for(let i=0;i<5;i++){const a=i*1.257;drawEmoji('☁️',x+Math.cos(a)*k*s*.9,y-s*.4+Math.sin(a)*k*s*.5,s*.3,false,1-k);}}}
HOOK.layer.push((L,t,x0,y0,x1,y1)=>{
  const C=C3(),q=qid(),s=ts,cl=inClouds(player.x),vis=(x,y,m)=>x>x0-(m||2)&&x<x1+(m||2)&&y>y0-(m||2)&&y<y1+(m||3);
  if(cl){
    if(vis(FOUNT.x,FOUNT.y,3))L.push([FOUNT.y,()=>drawFountain(t)]);
    if(C.fountain&&(driz.show||q!=='c3fountain')&&vis(driz.x,driz.y,3))L.push([driz.y+3,()=>drawDrizzle(t)]);
    if(y1>=29){
      if(vis(HOOT.x,HOOT.y,3))L.push([HOOT.y,()=>drawHootTree(t)]);
      LANTERNS.forEach(([lx,ly],i)=>{if(vis(lx,ly))L.push([ly+.85,()=>drawLantern(i,t)]);});
      if(vis(BED.x,BED.y))L.push([BED.y-.05,()=>drawBed(t)]);
      if(vis(TABLE.x,TABLE.y,3))L.push([TABLE.y,()=>drawTable(t)]);
      if(vis(70,31.7,8))L.push([31.7,()=>drawBunting(t)]);
      const bl=[[68.1,34.4,'#ff7eb6'],[72.9,34.4,'#9fd3ff'],[73.5,35.6,'#ffe14d']];
      if(C.partyNow||C.partyDone)bl.push([64.6,33.4,'#c9a6ff'],[76.2,33.6,'#9be3a6'],[65.5,41.6,'#ff9a3c'],[75.8,41.4,'#ff7eb6']);
      bl.forEach(([x,y,c],i)=>{if(vis(x,y))L.push([y,()=>drawBalloon(x,y,c,t,i)]);});
      if(vis(73.8,35.8))L.push([35.8,()=>drawEmoji('🎁',SX(73.8),SY(35.8)-s*.25,s*.5)]);
      if(vis(67.2,35.6))L.push([35.6,()=>drawEmoji('🎁',SX(67.2),SY(35.6)-s*.22,s*.42)]);
    }
  }
  if(race){const c=race.course,n=c.length-1;for(let i=race.next;i<=n;i++){const g=c[i];if(vis(g.x,g.y))L.push([g.y+.05,()=>drawRing(g,t,i===race.next,i,i===n)]);}}
  else if(q==='c3race'&&cl){STORY_COURSE.forEach((g,i)=>{if(i&&vis(g.x,g.y))L.push([g.y+.05,()=>drawRing(g,t,i===1,i,i===STORY_COURSE.length-1)]);});}
  if(flies)for(const f of flies.list){if(f.st==='done'||f.st==='gone'||!vis(f.x,f.y))continue;L.push([f.y+1.5,()=>drawFly(f,t)]);}
  if((q==='c3letter'||t-bird.leftAt<5)&&onScreen(bird.x,bird.y))L.push([99,()=>{const f=Math.sin(t*14);
    drawEmoji('✉️',SX(bird.x)+(bird.flip?s*.2:-s*.2),SY(bird.y)+s*.28,s*.32);drawEmoji('🐦',SX(bird.x),SY(bird.y)+f*s*.04,s*.6,!bird.flip);}]);
  for(const f of fx)L.push([99,()=>drawFx(f,t)]);
});
// Screen-space: countdown, game counter, medal, fireworks
function pill(text){ctx.save();ctx.font='bold 30px "Chalkboard SE","Comic Sans MS",sans-serif';const w=ctx.measureText(text).width+40,x=vw/2-w/2,y=Math.min(150,vh*.16);
  ctx.fillStyle='rgba(255,255,255,.94)';ctx.strokeStyle='#ffc2e2';ctx.lineWidth=4;rr(x,y,w,52,26);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d94f9b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,vw/2,y+27);ctx.restore();}
HOOK.overlay.push(t=>{
  if(fw)for(const r of fw.list){if(!r.ex){ctx.fillStyle=r.c;circ(r.x,r.y,4);ctx.fill();ctx.fillStyle='rgba(255,240,200,.6)';circ(r.x,r.y+10,3);ctx.fill();continue;}
    const k=r.t/1.3;ctx.globalAlpha=Math.max(0,1-k);ctx.fillStyle=r.c;for(let i=0;i<20;i++){const a=i*Math.PI/10,d=k*110*(1-k*.35);circ(r.x+Math.cos(a)*d,r.y+Math.sin(a)*d+k*k*40,4*(1-k)+1.5);ctx.fill();}
    ctx.fillStyle='#fff';for(let i=0;i<10;i++){const a=i*Math.PI/5+.3,d=k*60;circ(r.x+Math.cos(a)*d,r.y+Math.sin(a)*d+k*k*30,2);ctx.fill();}ctx.globalAlpha=1;}
  if(race){const n=race.course.length-1;
    if(race.phase==='count'){const k=(t-race.t0)/.9,i=Math.floor(k),f=k-i,txt=['3','2','1','GO!'][Math.min(3,i)];
      ctx.save();ctx.translate(vw/2,vh*.42);const sc=1+.6*(1-Math.min(1,f*3));ctx.scale(sc,sc);ctx.font='bold 120px "Chalkboard SE","Comic Sans MS",sans-serif';
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=12;ctx.strokeStyle='#fff';ctx.strokeText(txt,0,0);ctx.fillStyle=STARS[(i*2)%7].c;ctx.fillText(txt,0,0);ctx.restore();}
    pill('🌈 '+Math.min(n,race.next-1)+' / '+n);
    if(race.phase==='done'){const k=t-race.tDone;drawEmoji('🥇',vw/2,vh*.42,140*Math.min(1,k*3)*(1+.06*Math.sin(t*6)));}}
  else if(tag&&tag.mode==='play')pill('🏃 '+tag.n+' / 3');
  else if(flies&&flies.mode==='play')pill('✨ '+flies.got+' / 5');
});

// ===== Mini-game: baking (DOM overlay, every line spoken) =====
document.head.insertAdjacentHTML('beforeend',`<style>
#c3bake .box{width:min(820px,96vw);text-align:center;padding:12px 16px}
#c3bake h2{margin:0 0 4px;font-size:28px}
.c3top{display:flex;align-items:center;gap:12px;justify-content:center;min-height:88px;padding:0 50px}
.c3top img,.c3top .c3f{width:80px;height:80px;border-radius:50%;background:#ffe9f5;font-size:52px;display:flex;align-items:center;justify-content:center;flex:none}
#c3face{flex:none}
.c3say{font-size:27px;font-weight:bold;line-height:1.25;text-align:left}
#c3cv{width:440px;height:300px;max-width:88vw;max-height:38vh;object-fit:contain;touch-action:none;border-radius:24px;background:linear-gradient(#fff7fc,#ffe3f2);display:block;margin:4px auto}
#c3cv.tapme{animation:c3tap 1.1s ease-in-out infinite}
@keyframes c3tap{0%,100%{box-shadow:0 0 0 0 rgba(255,211,77,.9)}50%{box-shadow:0 0 0 10px rgba(255,211,77,.9)}}
.c3opts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px;min-height:96px}
.c3opts button{width:90px;height:90px;border-radius:24px;background:#fff6fb;border:4px solid #ffd0e8;font-size:52px;padding:0;box-shadow:0 4px 0 rgba(200,120,170,.35)}
.c3opts button:active{transform:scale(.92)}
.c3opts button.sel{background:#ffe08a;border-color:#ff9a3c;transform:scale(1.1)}
.c3opts button.glow{animation:c3glow .8s ease-in-out infinite}
.c3opts button.go{width:auto;padding:0 30px;font-size:40px;background:#5fc96b;color:#fff;border-color:#3c9a47;font-weight:bold}
.c3opts button.gone{visibility:hidden}
.c3opts button.shake{animation:shake .4s}
@keyframes c3glow{0%,100%{box-shadow:0 0 0 0 #ffd34d}50%{box-shadow:0 0 0 10px #ffd34d;transform:scale(1.1)}}
</style>`);
document.body.insertAdjacentHTML('beforeend',`<div id="c3bake" class="modal"><div class="panel box"><button class="close" id="c3bkX">✖</button>
<h2 id="c3title"></h2><div class="c3top"><span id="c3face"></span><div class="c3say" id="c3say"></div></div>
<canvas id="c3cv" width="880" height="600"></canvas><div class="c3opts" id="c3opts"></div></div></div>`);
const BL=t=>(R('sugarplum',t),R('narrator',t),t);
const BK={title:{cake:BL('🎂 Party Cake'),cup:BL('🧁 Cupcakes'),bakery:BL('🧁 Pony Bakery')},
  ask:[BL("Let's bake! First, put the star oats in the bowl."),BL('Now put in the strawberries!'),BL('Now crack an egg!'),BL('Now pour in the milk!')],
  hint:[BL('Not that one! Look for the star oats.'),BL('Not that one! Look for the strawberries.'),BL('Not that one! Look for the egg.'),BL('Not that one! Look for the milk.')],
  sock:BL("Silly! Socks don't go in cakes!"),teddy:BL('A teddy bear in a cake? No way! Hee hee!'),
  stir:BL('Now stir it up! Tap the bowl to stir.'),batter:BL('Yummy batter! Now tap the oven to bake it.'),
  wait:BL('Wait for the ding!'),ding:BL('Ding! It is ready! Tap the oven to take it out.'),
  deco:BL('Now decorate! Pick a topping, then tap the cake.'),decoCup:BL('Now decorate! Pick a topping, then tap the cupcake.'),
  done:BL('Tap the green check when you are done!'),tada:BL('Ta-da! What a beautiful cake!'),tadaCup:BL('Ta-da! Yummy cupcakes!')};
const ING=[['staroat','🌾'],['strawberry','🍓'],['egg','🥚'],['milk','🥛']],SILLY=[['sock','🧦'],['teddy','🧸']];
const TOPS=['🍓','🍒','🫐','⭐','🌸','🍬','🦋'];
const BATTER=['#f6ead0','#f3e2c6','#f7d2dc','#f9dcb0','#fbe6cc'];
const nowT=()=>performance.now()/1000;
let cakeCv=null;
function openBake(mode,onDone){closePonyMenu();player.path=[];player.action=null;
  const who=mode==='bakery'&&!rescued('sugarplum')?'narrator':'sugarplum';
  bk={mode,who,step:'mix',want:0,added:[],stir:0,stirT:-9,ovenT:0,dingT:0,tops:[],sel:TOPS[0],plop:null,onDone,openT:nowT()};
  $('c3face').innerHTML=who==='sugarplum'?`<img src="${portrait('sugarplum')}" alt="">`:'<span class="c3f">🧁</span>';
  const h=$('c3title');h.textContent=BK.title[mode];h.dataset.say=BK.title[mode];h.dataset.who=who;addSayButtons($('c3bake'));
  $('c3bake').classList.add('show');refreshBar(true);bkMix();requestAnimationFrame(bkLoop);}
function closeBake(){bk=null;$('c3bake').classList.remove('show');refreshBar(true);}
$('c3bkX').onclick=()=>{stopSpeech();closeBake();};
$('c3bake').addEventListener('pointerdown',e=>e.stopPropagation());
function bkSay(t){const el=$('c3say');el.textContent=t;el.dataset.say=t;el.dataset.who=bk.who;addSayButtons(el.parentNode);say(t,bk.who,el);}
function bkOpts(list){const el=$('c3opts');el.innerHTML='';list.forEach(o=>{const b=document.createElement('button');b.textContent=o.e;b.dataset.k=o.k||'';if(o.cls)b.className=o.cls;
  b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();initAudio();if(bk)o.fn(b);});el.appendChild(b);});}
function tapMe(on){$('c3cv').classList.toggle('tapme',!!on);}
function bkMix(){bk.step='mix';tapMe(false);bkOpts([...ING,...SILLY].sort(()=>Math.random()-.5).map(([k,e])=>({k,e,fn:b=>mixTap(k,e,b)})));bkSay(BK.ask[0]);}
function mixTap(k,e,b){if(bk.step!=='mix')return;const want=ING[bk.want][0];
  $('c3opts').querySelectorAll('.glow').forEach(x=>x.classList.remove('glow'));
  if(k===want){sfx('pop');bk.added.push(e);bk.plop={e,t:nowT()};b.classList.add('gone');bk.want++;
    if(bk.want<ING.length)bkSay(BK.ask[bk.want]);else{bk.step='mixed';setTimeout(()=>{if(bk&&bk.step==='mixed')bkStir();},800);}return;}
  sfx('nope');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');
  bkSay(k==='sock'?BK.sock:k==='teddy'?BK.teddy:BK.hint[bk.want]);
  const w=$('c3opts').querySelector(`[data-k="${want}"]`);if(w)w.classList.add('glow');}
function bkStir(){bk.step='stir';tapMe(true);bkOpts([{e:'🥄',fn:stirTap}]);bkSay(BK.stir);}
function stirTap(){if(bk.step!=='stir')return;bk.stir++;bk.stirT=nowT();sfx('tap');
  if(bk.stir>=8){sfx('sparkle');bk.step='oven';bkSay(BK.batter);bkOpts([{e:'♨️',fn:ovenTap}]);}}
function ovenTap(){if(bk.step!=='oven')return;
  if(!bk.ovenT){bk.ovenT=nowT();sfx('pop');tapMe(false);bkSay(BK.wait);$('c3opts').innerHTML='';}
  else if(bk.dingT)bkDeco();}
function bkDeco(){bk.step='deco';tapMe(true);sfx('harvest');
  bkOpts(TOPS.map(e=>({e,k:e,cls:e===bk.sel?'sel':'',fn:b=>{bk.sel=e;sfx('tap');$('c3opts').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b));}})));
  bkSay(bk.mode==='cake'?BK.deco:BK.decoCup);}
function addDone(){const el=$('c3opts');if(el.querySelector('.go'))return;const b=document.createElement('button');b.className='go glow';b.textContent='✔';
  b.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();if(bk&&bk.step==='deco')bkTada();});el.appendChild(b);bkSay(BK.done);}
function bkTada(){bk.step='tada';bk.tadaT=nowT();tapMe(false);sfx('fanfare');celebrate(true);bkSay(bk.mode==='cake'?BK.tada:BK.tadaCup);
  bkOpts([{e:'✔ Yay!',cls:'go',fn:()=>{const tops=bk.tops.slice(),cb=bk.onDone;closeBake();if(cb)cb(tops);}}]);}
function inCake(mode,x,y){if(mode==='cake')return(x>-116&&x<116&&y>-96&&y<-8)||(x>-78&&x<78&&y>-172&&y<-96);
  const e=(cx,cy,rx,ry)=>((x-cx)/rx)**2+((y-cy)/ry)**2<1;return e(0,-92,92,36)||e(0,-125,72,30)||e(0,-153,48,26);}
const cv=$('c3cv');
cv.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();initAudio();if(!bk)return;
  const r=cv.getBoundingClientRect(),x=(ev.clientX-r.left)*440/r.width,y=(ev.clientY-r.top)*300/r.height;
  if(bk.step==='stir')return stirTap();
  if(bk.step==='oven')return ovenTap();
  if(bk.step==='deco'){const cm=bk.mode==='cake'?'cake':'cup',ux=(x-220)/1,uy=(y-278)/1;
    if(!inCake(cm,ux,uy)||bk.tops.length>=20){sfx('tap');return;}
    bk.tops.push({e:bk.sel,x:ux,y:uy,t:nowT()});sfx('pop');if(bk.tops.length===4)addDone();}});
function drawCakeShape(cx,cy,k,mode,tops,tt,candles){
  ctx.lineWidth=Math.max(1,3*k);
  if(mode==='cake'){ctx.fillStyle='#fff';ctx.strokeStyle='#ffc2e2';ell(cx,cy,150*k,22*k);ctx.fill();ctx.stroke();
    const tier=(w,top,h,col)=>{ctx.fillStyle=col;rr(cx-w*k,cy+top*k,2*w*k,h*k,22*k);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<6;i++){circ(cx+(-w+18+i*(2*w-36)/5)*k,cy+(top+h*.62)*k,5*k);ctx.fill();}
      ctx.fillStyle='#fff';rr(cx-w*k,cy+top*k,2*w*k,24*k,18*k);ctx.fill();
      for(let i=0;i<Math.floor(w/11);i++){const dx=-w+10+i*22;if(dx>w-8)break;rr(cx+dx*k-7*k,cy+(top+12)*k,14*k,(12+hash(i,w)*20)*k,7*k);ctx.fill();}};
    tier(120,-100,96,'#ffb3d6');tier(82,-176,80,'#ffd6ea');
    if(candles)for(let i=-1;i<=1;i++){const x=cx+i*38*k,y=cy-176*k;ctx.fillStyle=['#9fd3ff','#ffe14d','#c9a6ff'][i+1];rr(x-5*k,y-34*k,10*k,34*k,4*k);ctx.fill();
      ctx.fillStyle='#ffb800';ell(x,y-42*k+Math.sin(tt*9+i)*k,6*k,10*k);ctx.fill();ctx.fillStyle='#fff3b0';ell(x,y-40*k,3*k,5*k);ctx.fill();}}
  else{ctx.fillStyle='#9fd3ff';ctx.beginPath();ctx.moveTo(cx-75*k,cy-80*k);ctx.lineTo(cx+75*k,cy-80*k);ctx.lineTo(cx+58*k,cy);ctx.lineTo(cx-58*k,cy);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#6fb3ee';ctx.lineWidth=5*k;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx+i*20*k,cy-78*k);ctx.lineTo(cx+i*15.5*k,cy-2*k);ctx.stroke();}
    for(const[y,rx,ry,c]of[[-92,95,34,'#ffb3d6'],[-125,75,30,'#ffc6e0'],[-153,50,25,'#ffd6ea']]){ctx.fillStyle=c;ell(cx,cy+y*k,rx*k,ry*k);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.4)';ell(cx-rx*.35*k,cy+(y-ry*.35)*k,rx*.3*k,ry*.25*k);ctx.fill();}
    ctx.fillStyle='#ff6f9f';circ(cx,cy-178*k,13*k);ctx.fill();}
  for(const tp of tops){const pop=tt-(tp.t||0)<.25?1+(.25-(tt-tp.t))*2:1;drawEmoji(tp.e,cx+tp.x*k,cy+tp.y*k,36*k*pop);}}
function cakeCanvas(){if(cakeCv)return cakeCv;const c=document.createElement('canvas'),sc=Math.max(1,Math.min(2,dpr))*1.2;c.width=Math.ceil(300*sc);c.height=Math.ceil(236*sc);
  const g=c.getContext('2d');g.setTransform(sc,0,0,sc,0,0);withCtx(g,()=>drawCakeShape(150,212,.95,'cake',(C3().cake||[]).map(t=>({e:t.e,x:t.x,y:t.y,t:-9})),0,true));
  cakeCv=c;return c;}
function drawBowl(t){const B=bk,cx=220,cy=150,n=B.added.length;
  ctx.fillStyle='#8cc8f5';ell(cx,cy,152,40);ctx.fill();
  ctx.fillStyle=B.step==='stir'||B.step==='oven'?(B.stir>=8?'#ffd0e4':BATTER[n]):BATTER[n];ell(cx,cy+4,136,30);ctx.fill();
  const st=B.stir,spin=st*.75+(t-B.stirT<.4?(t-B.stirT)*4:0);
  if(n){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy+4,30+i*30,7+i*7,0,spin+i,spin+i+2.4);ctx.stroke();}}
  if(st<4)B.added.forEach((e,i)=>{if(B.plop&&B.plop.e===e&&t-B.plop.t<.45)return;drawEmoji(e,cx+[-70,-20,30,75][i]*Math.cos(spin*.3),cy+2+[4,-6,6,-4][i],34);});
  if(B.plop&&t-B.plop.t<.45){const k=(t-B.plop.t)/.45;drawEmoji(B.plop.e,cx,10+k*(cy-10),48);}
  else if(B.plop&&t-B.plop.t<.8){const k=(t-B.plop.t-.45)/.35;ctx.fillStyle=`rgba(255,255,255,${1-k})`;for(let i=0;i<6;i++){circ(cx+Math.cos(i)*k*60,cy-Math.abs(Math.sin(i*2))*k*40,5);ctx.fill();}}
  ctx.fillStyle='#bfe6ff';ctx.beginPath();ctx.ellipse(cx,cy,152,140,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++){circ(cx-100+i*50,cy+60+Math.sin(i)*8,9);ctx.fill();}
  ctx.strokeStyle='#fff';ctx.lineWidth=8;ell(cx,cy,152,40);ctx.stroke();
  if(B.step==='stir'||B.step==='mixed'){drawEmoji('🥄',cx+Math.cos(spin)*70,cy-30+Math.sin(spin)*14,70);
    ctx.fillStyle='#ffd0e8';rr(cx-100,284,200,10,5);ctx.fill();ctx.fillStyle='#ff7eb6';rr(cx-100,284,200*Math.min(1,st/8),10,5);ctx.fill();}}
function drawOven(t){const B=bk,cx=220;ctx.fillStyle='#ff9ac8';ctx.strokeStyle='#e06aa3';ctx.lineWidth=4;rr(cx-120,26,240,262,30);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffc6e0';rr(cx-110,36,220,64,20);ctx.fill();
  const p=B.ovenT?Math.min(1,(t-B.ovenT)/4):0;
  ctx.fillStyle='#fff';circ(cx,68,24);ctx.fill();ctx.strokeStyle='#e06aa3';ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle='#4a2c5e';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,68);ctx.lineTo(cx+Math.sin(p*Math.PI*2)*18,68-Math.cos(p*Math.PI*2)*18);ctx.stroke();
  for(const d of[-70,70]){ctx.fillStyle='#fff';circ(cx+d,68,13);ctx.fill();ctx.fillStyle='#e06aa3';circ(cx+d,68,5);ctx.fill();}
  ctx.fillStyle='#b55a8a';rr(cx-70,112,140,9,4);ctx.fill();
  ctx.fillStyle='#5b3a5e';rr(cx-90,128,180,138,22);ctx.fill();
  if(B.ovenT){ctx.fillStyle=`rgba(255,160,60,${.25+.35*p+(B.dingT?0:.1*Math.sin(t*8))})`;rr(cx-90,128,180,138,22);ctx.fill();}
  ctx.fillStyle='#c9c2d6';rr(cx-60,226,120,22,6);ctx.fill();
  if(B.mode==='cake'){const h=12+40*p;ctx.fillStyle=B.dingT?'#f3c27a':'#ffd0e4';rr(cx-56,226-h,112,h+6,Math.min(20,h/2));ctx.fill();}
  else for(let i=-1;i<=1;i++){const h=10+28*p;ctx.fillStyle=B.dingT?'#f3c27a':'#ffd0e4';ell(cx+i*38,228-h/2,16,h/2+3);ctx.fill();}
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(cx-70,145);ctx.lineTo(cx-40,145);ctx.stroke();
  if(B.ovenT&&!B.dingT){ctx.fillStyle='#fff';circ(cx+150,68,26);ctx.fill();ctx.fillStyle='#d94f9b';ctx.font='bold 36px "Chalkboard SE","Comic Sans MS",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(Math.max(1,Math.ceil(4-(t-B.ovenT)))),cx+150,68);}
  if(B.dingT){const k=Math.min(1,(t-B.dingT)*3);ctx.save();ctx.translate(cx+150,60);ctx.scale(k,k);ctx.fillStyle='#ffe14d';ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.font='bold 34px "Chalkboard SE","Comic Sans MS",sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeText('DING!',0,0);ctx.fillText('DING!',0,0);ctx.restore();
    for(let i=0;i<4;i++)drawStar(cx+Math.cos(t*2+i*1.6)*100,150+Math.sin(t*2+i*1.6)*80,8,STARS[i*2].c,true);}
  if(!B.ovenT||B.dingT)drawEmoji('👆',cx+120,250+Math.sin(t*6)*6,46);}
function bkLoop(){if(!bk)return;const t=nowT(),B=bk;
  if(B.step==='oven'&&B.ovenT&&!B.dingT&&t-B.ovenT>4){B.dingT=t;sfx('coin');setTimeout(()=>sfx('sparkle'),150);bkSay(BK.ding);tapMe(true);
    bkOpts([{e:'♨️',fn:ovenTap}]);}
  const g=cv.getContext('2d');g.setTransform(2,0,0,2,0,0);g.clearRect(0,0,440,300);
  withCtx(g,()=>{
    if(B.step==='mix'||B.step==='mixed'||B.step==='stir')drawBowl(t);
    else if(B.step==='oven')drawOven(t);
    else{const cm=B.mode==='cake'?'cake':'cup';
      if(B.step==='tada'&&cm==='cup'){for(let i=-1;i<=1;i++)drawCakeShape(220+i*130,278,.62,cm,B.tops,t,false);}
      else drawCakeShape(220,278,1,cm,B.tops,t,cm==='cake');
      if(B.step==='tada')for(let i=0;i<6;i++)drawStar(220+Math.cos(t*1.5+i)*190,150+Math.sin(t*1.5+i)*120,9,STARS[i].c,true);
      else if(B.tops.length<1)drawEmoji('👆',330,250+Math.sin(t*6)*6,46);}});
  requestAnimationFrame(bkLoop);}

window.ch3Debug={get race(){return race;},get tag(){return tag;},get flies(){return flies;},get bk(){return bk;},get driz(){return driz;},FL,openBake,startTag,startFlies,STORY_COURSE,LANTERNS};
})();
