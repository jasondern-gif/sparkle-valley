'use strict';
// ---------- Chapter 4: The Fairy Forest ----------
// A butterfly brings Queen Willow's leaf letter. In the forest she meets Pip the tiny fairy, clears thorny vines to free Clover,
// builds fairy houses, mixes a big-again potion for tiny Button, plays the fairy lights game to open a secret path,
// and gives baby unicorn Glimmer her magic colors back. All drawing is in the LandArt.forest table at the bottom.
(()=>{
const R=reg,ART=LandArt.forest,NEW=['clover','button','glimmer'];
const CUPCAKE='Mmm! A cupcake! I love cupcakes!';

// ===== Speakers, ponies, crops =====
Object.assign(SPK,{
  willow:{n:'Queen Willow',f:'🧚‍♀️',p:1.15,r:.92},
  pip:{n:'Pip',f:'🧚',p:1.8,r:1.1},
  clover:{n:'Clover',f:'🐴',portrait:true,p:1.3,r:1},
  button:{n:'Button',f:'🐴',portrait:true,p:1.7,r:1.1},
  glimmer:{n:'Glimmer',f:'🦄',portrait:true,p:1.6,r:.95}});
Object.assign(PONIES,{
  clover:{names:['Clover','Fern','Hazel','Mossy'],fav:'acorn',acc:'🍀',home:{x:14.5,y:68.6},
    look:{body:'#d6f2b8',mane:['#4f9a3e','#8fd16a','#ffd34d','#8fd16a'],hoof:'#6b8f3a',snout:'#f1ffe4',scale:.85,assetId:'clover'}},
  button:{names:['Button','Pebble','Peanut','Tiny'],fav:'mushroom',acc:'🍄',home:{x:35.7,y:58.2},
    look:{body:'#ffe2c4',mane:['#a0643a','#ff9ad5','#a0643a'],hoof:'#8a552b',snout:'#fff1e2',scale:.72,assetId:'button'}},
  glimmer:{names:['Glimmer','Shimmer','Dewdrop','Twinkletoes'],fav:'strawberry',acc:'⭐',home:{x:36.5,y:70.4},
    look:{body:'#ffffff',mane:['#ff9ad5','#c9a6ff','#9fd3ff','#9be3a6','#ffe14d'],hoof:'#c9a6ff',snout:'#fff0f8',horn:true,hornColor:'#ffd34d',scale:.7,assetId:'glimmer'}}});
PONY_IDS.push(...NEW);
for(const id of NEW){PONIES[id].names.forEach(n=>R('narrator',n));
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(id,T2[k]);R(id,CUPCAKE);}
Object.assign(CROPS,{
  mushroom:{e:'🍄',name:'fairy mushroom',st:['','🌱','🌿','🍄']},
  acorn:{e:'🌰',name:'golden acorn',st:['','🌱','🌿','🌰']}});
Object.assign(ICON,{mushroom:'🍄',acorn:'🌰'});
Object.assign(PRICE,{mushroom:4,acorn:4});
Object.assign(ITEM_NAMES,{mushroom:'Fairy mushrooms',acorn:'Golden acorns'});
FOODS.push('acorn','mushroom');
if(window.VIL_PERSONA)Object.assign(VIL_PERSONA,{clover:{likes:['garden','playground']},button:{likes:['follow','playground','snack']},glimmer:{likes:['pond','nap']}});

// ===== The land: x0-43, y48-79 =====
Object.assign(AREAS.forest,{name:R('narrator','Fairy Forest'),icon:'🧚',sky:['#9fe0b0','#e6ffe0'],
  go:R('narrator','Off to the Fairy Forest!'),seeds:['mushroom','acorn','strawberry','carrot'],
  cam:{x0:3,y0:50,x1:41,y1:78},unlocked:()=>state.quest>=qi('f4fly')});
PADS.forest={x:9.5,y:58.4};
const THRONE={x:20.5,y:56.3},RING={x:25.5,y:71.6},BRAMBLE={x:14.5,y:68.6};
const HOUSES=[{x:26.5,y:56.9},{x:30.5,y:55.9},{x:34.5,y:57.4}];
const VINES=[[12.4,67.3],[14.5,66.5],[16.6,67.3],[12.1,69.7],[16.9,69.8],[14.5,70.9]];
const RINGPOS=[{x:23.5,y:71.2},{x:25.5,y:69.9},{x:27.6,y:71.4},{x:25.5,y:73.4}];
const SECRET=[[29,70],[30,70],[31,70],[32,70]];
{const T=(x0,y0,x1,y1,c)=>rect(x0,y0,x1,y1,c);
  T(0,48,43,79,'T');T(5,51,38,76,'.');
  T(31,62,32,76,'W');T(33,65,38,65,'T');T(33,75,38,76,'T');T(29,66,30,74,'T');T(28,68,28,69,'T');
  T(11,59,36,59,'=');T(20,59,20,70,'=');T(20,70,22,70,'=');T(16,65,19,65,'=');T(10,59,10,62,'=');
  T(8,63,12,64,'S');
  // keep the forest walkable while scattering trees
  const zones=[[5,54,15,62],[16,53,24,58],[24,53,38,61],[6,61,14,66],[9,64,20,74],[20,66,30,76],[31,60,38,76],[18,58,22,72]];
  const inZ=(x,y)=>zones.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d);
  const reach=()=>{const seen=new Set([11+59*W]),q=[11+59*W];let n=0;while(q.length){const c=q.pop();n++;const x=c%W,y=(c/W)|0;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+ny*W;if(ny<48||ny>79||nx<0||nx>43||seen.has(k)||!isWalkChar(map[ny][nx],true))continue;seen.add(k);q.push(k);}}return n;};
  const r=mulberry32(4242);let base=reach();
  for(let y=52;y<=75;y++)for(let x=6;x<=37;x++){if(map[y][x]!=='.'||inZ(x,y)||r()>(y<55?.3:.16))continue;map[y][x]='T';const c=reach();if(c!==base-1)map[y][x]='.';else base=c;}
  [[34,67],[37,68],[33,73],[38,72],[6,66],[7,72],[19,75],[11,75]].forEach(([x,y])=>{if(map[y][x]==='.')map[y][x]='T';});}
const K=(x,y)=>x+y*W,BLOCK=new Set();
[[19,55],[20,55],[21,55],[20,54]].forEach(([x,y])=>BLOCK.add(K(x,y)));
HOUSES.forEach(h=>BLOCK.add(K(Math.floor(h.x),Math.floor(h.y-.3))));
SIGNS.push({x:13.4,y:58.6,text:'Fairy Forest'},{x:17.6,y:57.6,text:"Queen Willow's Throne"},{x:24.4,y:60.7,text:'Fairy Houses'},
  {x:7.6,y:62.7,text:'Fairy Garden'},{x:21.6,y:68.6,text:'Mushroom Ring'});

// ===== Spoken lines (said with say(), so registered) =====
const L={
  willowIdle:[R('willow','Welcome to the Fairy Forest, {name}!'),R('willow','The fairies love you!')],
  pipIdle:[R('pip','Hi hi hi! I am Pip!'),R('pip','Sprinkle, sprinkle! I water the fairy garden!'),R('pip','Fairies love flowers and mushrooms!')],
  thorny:R('narrator','Prickly thorns! Tap them with your magic wand!'),
  vinePop:[R('narrator','Pop! Flowers!'),R('narrator','Sparkle, sparkle! No more thorns!'),R('narrator','So pretty!')],
  crying:R('narrator','Somebody is crying behind the thorny vines!'),
  cloverHungry:R('clover','Do you have a golden acorn for me?'),
  needMush:R('pip','We need 3 fairy mushrooms to build the fairy houses!'),
  broken:R('narrator','This fairy house is broken.'),
  fairyIn:R('pip','Yay! A fairy moved in!'),
  houseNext:R('pip','Tap another broken fairy house!'),
  houseDone:R('narrator','A pretty fairy house!'),
  squeak:R('button','Squeak! Squeak!'),
  bigAgain:R('button','Can you make me big again?'),
  watch:R('pip','Watch the fairy lights!'),
  yourTurn:R('pip','Your turn! Tap the mushrooms in the same order!'),
  great:R('pip','Great job! Now a longer one!'),
  again:R('pip','Hee hee! Let me show you again!'),
  goRing:R('pip','Come to the mushroom ring!'),
  glimmerSad:R('glimmer','My horn lost its sparkle...'),
  glimmerHi:R('glimmer','Sparkle, sparkle! I love you!'),
  potionTitle:R('pip','Big-Again Potion'),potionPlay:R('button','Silly Potion'),
  colorTitle:R('glimmer','Magic Colors'),
  houseTitle:R('pip','Build a Fairy House'),
  playVines:R('clover','Oh no! More thorny vines! Can you help?'),vinesDone:R('clover','Hooray! Flowers everywhere!'),
  playPotion:R('button','Let us mix a silly potion!'),potionDone:R('button','Bubble, bubble! What a fun potion!'),
  playLights:R('glimmer','Let us play the fairy lights game! Watch the mushrooms!'),lightsDone:R('glimmer','You remembered them all! Sparkle, sparkle!'),
  lightsTurn:R('glimmer','Your turn! Tap the mushrooms in the same order!'),lightsAgain:R('glimmer','Hee hee! Watch again!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
};
const STEP={mushroom:R('pip','First, a fairy mushroom!'),acorn:R('pip','Now a golden acorn!'),dew:R('pip','Now a drop of dew!'),sparkle:R('pip','And a sprinkle of sparkles!')};
const STEP2={mushroom:R('button','A fairy mushroom, please!'),acorn:R('button','A golden acorn, please!'),dew:R('button','A drop of dew, please!'),sparkle:R('button','Some sparkles, please!')};
const POTION_OPTS=[{k:'mushroom',html:'🍄'},{k:'acorn',html:'🌰'},{k:'dew',html:'💧'},{k:'sparkle',html:'✨'},{k:'sock',html:'🧦'},{k:'frog',html:'🐸'},{k:'pizza',html:'🍕'},{k:'balloon',html:'🎈'}];
const COLORS={pink:'#ff7eb6',purple:'#a77bd8',blue:'#5fa8f5',yellow:'#ffd83d',green:'#5fc96b',orange:'#ff9a3c'};
const ASK={pink:R('glimmer','Pink, please!'),purple:R('glimmer','Purple, please!'),blue:R('glimmer','Blue, please!'),
  yellow:R('glimmer','Yellow, please!'),green:R('glimmer','Green, please!'),orange:R('glimmer','Orange, please!')};
const CAP={red:'#ff5a5f',pink:'#ff7eb6',purple:'#a77bd8',blue:'#5fa8f5',yellow:'#ffcf33'},DOOR={brown:'#a0643a',green:'#5fc96b',blue:'#4f8fe0',pink:'#ff6fb5'};
const WIN={round:'⭕',heart:'💗',star:'⭐',moon:'🌙'},FLW={pink:'🌸',yellow:'🌼',tulip:'🌷',sun:'🌻'};
const NAME={red:R('narrator','Red'),pink:R('narrator','Pink'),purple:R('narrator','Purple'),blue:R('narrator','Blue'),yellow:R('narrator','Yellow'),
  brown:R('narrator','Brown'),green:R('narrator','Green'),round:R('narrator','Round window'),heart:R('narrator','Heart window'),star:R('narrator','Star window'),
  moon:R('narrator','Moon window'),fpink:R('narrator','Pink flowers'),fyellow:R('narrator','Yellow flowers'),ftulip:R('narrator','Tulips'),fsun:R('narrator','Sunflowers')};
const sw=c=>`<span class="lgSw" style="background:${c}"></span>`;
const HOUSE_STAGES=[
  {id:'cap',say:R('pip','Pick a color for the mushroom roof!'),opts:Object.keys(CAP).map(k=>({k,html:sw(CAP[k]),say:NAME[k]}))},
  {id:'door',say:R('pip','Pick a color for the door!'),opts:Object.keys(DOOR).map(k=>({k,html:sw(DOOR[k]),say:NAME[k]}))},
  {id:'win',say:R('pip','Pick a window!'),opts:Object.keys(WIN).map(k=>({k,html:WIN[k],say:NAME[k]}))},
  {id:'flw',say:R('pip','Pick some flowers!'),opts:Object.keys(FLW).map(k=>({k,html:FLW[k],say:NAME['f'+k]}))}];

// ===== Quests =====
const F4Q=[
{id:'f4letter',icon:'🦋',chapter:'The Fairy Forest',chapterIcon:'🧚',text:'A butterfly has a leaf letter for you! Tap the butterfly.',
 start:[['narrator','Look! A pretty butterfly is fluttering this way. It is carrying a leaf letter!'],()=>{C4().letterSeen=true;bf.arrive();}],
 hint:'Tap the butterfly to read the leaf letter!'},
{id:'f4fly',icon:'🎈',text:'Fly the Rainbow Balloon to the Fairy Forest.',
 start:[['grandma','A fairy forest! The Rainbow Balloon can take you there. Tap the balloon!']],
 hint:'Tap the Rainbow Balloon. Then tap the Fairy Forest picture!'},
{id:'f4meet',icon:'👑',text:'Say hello to Queen Willow on her mushroom throne.',
 start:[['narrator','Welcome to the Fairy Forest! Look at all the tall trees and mushrooms!'],
   ['pip','Hi hi hi! I am Pip, a tiny fairy! Come and meet our queen!']],
 hint:'Queen Willow is on her mushroom throne. Follow the arrow!'},
{id:'f4vines',icon:'🌿',text:'Tap the thorny vines to turn them into flowers!',goal:6,handin:true,prog:()=>C4().vineGone.length,
 start:[['narrator','Tap each thorny vine with your magic wand!']],
 hint:'Tap each thorny vine with your magic wand. Follow the arrow!'},
{id:'f4clover',icon:'🌰',text:'Grow a golden acorn and give it to the forest pony.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.acorn),
 start:[['pip','Plant golden acorn seeds in the fairy garden. I will water them for you!'],()=>{state.seed='acorn';refreshBar(true);}],
 hint:'Plant golden acorn seeds in the fairy garden. Pip will water them! Then give a golden acorn to the pony.'},
{id:'f4mush',icon:'🍄',text:'Grow 3 fairy mushrooms for the fairy houses.',goal:3,handin:true,prog:()=>Math.min(3,state.inv.mushroom),
 start:[['willow','Thank you for saving Clover! But look. The thorny vines broke the little fairy houses.'],
   ['willow','Fairy houses are made from fairy mushrooms. Can you grow 3 fairy mushrooms?'],()=>{state.seed='mushroom';refreshBar(true);}],
 hint:'Plant fairy mushroom seeds in the fairy garden. Then take 3 fairy mushrooms to the broken fairy houses.'},
{id:'f4houses',icon:'🏡',text:'Build 3 fairy houses! Tap a broken house.',goal:3,handin:true,prog:()=>C4().houses.filter(Boolean).length,
 start:[['pip','Now let us build the fairy houses! Tap a broken house, and pick the colors you like!']],
 hint:'Tap a broken fairy house to build it. Pick the colors you like!'},
{id:'f4button',icon:'🐴',text:'Say hi to the teeny tiny pony by the fairy houses.',
 start:[['pip','Listen! Somebody is squeaking by the last fairy house!']],
 hint:'Tap the teeny tiny pony next to the fairy houses.'},
{id:'f4potion',icon:'🧪',text:'Mix the big-again potion! Tap Button to start.',
 start:[['pip','Let us mix the big-again potion! Tap Button when you are ready.']],
 hint:'Tap the tiny pony. Then tap the pictures in the recipe, one by one!'},
{id:'f4lights',icon:'✨',text:'Play the fairy lights game at the mushroom ring.',
 start:[['willow','You are such a good helper! Now we must find baby Glimmer.'],
   ['pip','I know a secret path! It only opens with the fairy lights game.'],
   ['pip','Come to the mushroom ring. Watch the mushrooms light up, then tap them in the same order!']],
 hint:'Go to the mushroom ring. Watch the lights, then tap the mushrooms in the same order.'},
{id:'f4path',icon:'🦄',text:'Follow the secret path to find Glimmer.',
 hint:'Walk across the glowing stepping stones to the secret glade.'},
{id:'f4colors',icon:'🌈',text:'Give Glimmer the magic colors she asks for. Tap Glimmer.',
 hint:'Tap Glimmer. Then tap the color she asks for!'},
{id:'f4flyHome',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
 start:[['willow','You saved Clover, Button, and baby Glimmer! The Fairy Forest is happy again!'],
   ['willow','Your new friends want to live in your Pony Village. Here is a big bundle of magic wood to build their cottages!'],
   ()=>LG.giftWood(NEW),['willow','Come back and visit us any time!']],
 hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
{id:'f4build',icon:'🏠',text:'Build cottages for Clover, Button, and Glimmer in Pony Village.',goal:3,handin:true,
 prog:()=>NEW.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
 start:[()=>{LG.fillCottages(NEW);LG.giftWood(NEW);},['grandma','Welcome home, sweetie! What a magical adventure!'],
   ['grandma','Your new pony friends need cozy cottages in Pony Village.'],
   ['narrator','Go to Pony Village. Then tap the hammer to build a cottage!']],
 hint:'Go to Pony Village and tap the hammer to build a cottage.'},
];
addChapter(F4Q);
F4Q.forEach(q=>{R('willow',q.hint);R('pip',q.hint);});
LG.NEED.f4fly='forest';LG.NEED.f4flyHome='valley';LG.BUILD.add('f4build');
const isCh4=()=>qid().startsWith('f4');

// ===== State =====
const DEF={letterSeen:false,letterRead:false,met:false,vineGone:[],cloverFree:false,houses:[null,null,null],mushGiven:false,
  buttonMet:false,big:false,pathOpen:false,glimmerMet:false,sparkle:false,done:false};
function ensure(){if(!state.ch4||typeof state.ch4!=='object')state.ch4={};const C=state.ch4;
  for(const k in DEF)if(C[k]===undefined)C[k]=JSON.parse(JSON.stringify(DEF[k]));C._ok=1;
  for(const k of ['mushroom','acorn'])if(!(state.inv[k]>=0))state.inv[k]=0;
  return C;}
const C4=()=>state.ch4&&state.ch4._ok?state.ch4:ensure();
function openPath(fx){C4().pathOpen=true;SECRET.forEach(([x,y],i)=>{map[y][x]='j';if(fx)setTimeout(()=>{burst(x+.5,y+.5,'✨',6,.7);sfx('sparkle');},i*300);});}

const bf=LG.messenger('forest.butterfly');
const pip={x:0,y:0,flip:false,sprinkle:-9};
let simon=null;

// ===== Shared functions we extend (wrapped, never replaced) =====
{const prev=ch2Begin;ch2Begin=function(isNew){const C=ensure();if(C.pathOpen)openPath(false);return prev(isNew);};}
{const prev=ponyLook;ponyLook=function(id){const o=prev(id);
  if(id==='glimmer'&&o&&!(state.ch4&&state.ch4.sparkle))return Object.assign(o,{mane:['#e8e2ee','#d9d2e2','#efe9f4'],hornColor:'#d8d0c0',body:'#f3f0f6'});
  return o;};}
{const prev=drawPonyEnt;drawPonyEnt=function(id,t){const C=state.ch4;
  if(C&&!rescued(id)){
    if(id==='clover'&&!C.cloverFree)return;
    if(id==='button'&&!C.big){if(C.houses.every(Boolean))ART.tinyPony(ents.button,t);return;}}
  prev(id,t);};}
HOOK.init.push(()=>{const prev=walkable;walkable=function(x,y){if(BLOCK.has(K(x,y)))return false;return prev(x,y);};});
HOOK.keep.push(k=>{const q=qid();if(q==='f4clover'&&k==='acorn')return 1;if(q==='f4mush'&&k==='mushroom')return 3;return 0;});

// ===== Story =====
function readLetter(){if(qid()!=='f4letter')return;
  talk([['narrator','The leaf letter says...'],
    ['willow','Dear friend. I am Queen Willow, the queen of the Fairy Forest.'],
    ['willow','A baby unicorn named Glimmer is lost in our forest. And prickly thorn vines tangled up everything!'],
    ['willow','Please fly your Rainbow Balloon to the Fairy Forest and help us. Love, Queen Willow.'],
    ()=>{C4().letterRead=true;bf.leave();}],completeQuest);}
function meetQueen(){player.path=[];player.action=null;C4().met=true;talk([
  ['willow','Hello, {name}! Thank you for coming all the way to the Fairy Forest!'],
  ['willow','Here is a magic fairy wand. Tap a thorny vine with it, and the vine will turn into flowers!'],
  ['willow','And here are some fairy seeds: fairy mushrooms and golden acorns!'],
  ()=>{state.seeds.mushroom=state.seeds.acorn=true;refreshBar(true);sfx('sparkle');burst(player.x,player.y-1.2,'✨',10,1);},
  ['pip','I heard a little pony crying behind the thorny vines. Let us go and help!']],completeQuest);}
function talkQueen(){burst(THRONE.x,THRONE.y-1.6,'💖',4);
  if(qid()==='f4meet')return meetQueen();
  if(isCh4()&&qid()!=='f4build')return talk([['willow',Q[state.quest].hint]]);
  say(pick(L.willowIdle),'willow');}
function startVines(mode){const C=C4();
  if(mode==='story'){const items=VINES.map(([x,y],vi)=>({x,y,vi})).filter(o=>!C.vineGone.includes(o.vi));if(!items.length)return;
    LG.field({id:'vines',mode,quest:'f4vines',area:'forest',items,art:'forest.vine',r:1.05,hy:.45,
      onPop:(it,left)=>{if(!C.vineGone.includes(it.vi))C.vineGone.push(it.vi);vinePop(it);if(left)say(pick(L.vinePop),'narrator');saveGame();},
      onDone:freeClover});return;}
  const sp=LG.spotsNear(5,1.6,5);if(sp.length<3){say(L.noRoom,'narrator');return;}say(L.playVines,'clover');
  LG.field({id:'vines',mode,area:hereArea(),items:sp,art:'forest.vine',r:1.05,hy:.45,onPop:it=>vinePop(it),
    onDone:()=>{say(L.vinesDone,'clover');celebrate(true);if(rescued('clover')){addHeart('clover',2);const e=ents.clover;e.hop=state.time;e.pause=state.time+4;}saveGame();}});}
function vinePop(it){sfx('sparkle');burst(it.x,it.y-.5,'🌸',5,.8);burst(it.x,it.y-.5,'✨',6,.6);
  particles.push({x:player.x,y:player.y-1,vx:(it.x-player.x)*2.2,vy:(it.y-.6-player.y+1)*2.2,g:0,life:.45,max:.45,e:'✨',size:.3});}
function freeClover(){const C=C4();if(C.cloverFree)return;C.cloverFree=true;const e=ents.clover;e.hop=state.time;celebrate(true);saveGame();
  talk([['clover','Oh, thank you! The thorny vines were all around me!'],['clover','I am Clover. I am sooo hungry. Do you have a golden acorn? They are my favorite!']],completeQuest);}
function talkClover(){const e=ents.clover;e.pause=state.time+5;hearts(e);
  if(qid()==='f4clover'&&state.inv.acorn>0)return talk([()=>{state.inv.acorn--;sfx('crunch');hearts(e);},
    ['clover','Crunch, crunch! Yummy! You are my hero!'],['clover','Will you be my friend?']],()=>namePony('clover'));
  say(qid()==='f4clover'?L.cloverHungry:T2.shy,'clover');}
function tapHouse(i){const C=C4(),q=qid(),h=HOUSES[i];
  if(C.houses[i]){burst(h.x,h.y-1.4,'✨',5,.6);sfx('sparkle');say(L.houseDone,'narrator');return;}
  if(q==='f4mush'){if(state.inv.mushroom>=3)return talk([()=>{state.inv.mushroom-=3;C.mushGiven=true;sfx('harvest');burst(h.x,h.y-1,'🍄',6,.8);refreshBar(true);},
      ['pip','Three fairy mushrooms! Yay! Now we can build the fairy houses!']],completeQuest);
    return say(L.needMush,'pip');}
  if(q==='f4houses')return LG.builder({mode:'story',quest:'f4houses',title:'🍄 Build a Fairy House',titleSay:L.houseTitle,who:'pip',stages:HOUSE_STAGES,art:'forest.houseBuilder',
    onDone:ch=>{C.houses[i]=ch;sfx('fanfare');burst(h.x,h.y-1.2,'✨',14,1.2);burst(h.x,h.y-1,FLW[ch.flw],6,.9);saveGame();
      if(C.houses.every(Boolean))talk([['pip','Yay! All three fairies have new houses!'],['narrator','Squeak! Squeak! What was that?']],completeQuest);
      else talk([['pip','Yay! A fairy moved in!'],['pip','Tap another broken fairy house!']]);}});
  say(L.broken,'narrator');}
function talkButton(){const e=ents.button,q=qid();e.pause=state.time+5;burst(e.x,e.y-.6,'💗',3,.5);
  if(q==='f4button'){C4().buttonMet=true;return talk([['button','Squeak! Hello! I am Button. Oh no, I am as tiny as a fairy!'],
    ['pip','Oopsy! That was me! My magic spell went wrong, and it made him teeny tiny!'],['pip','We can fix it with a big-again potion! Let us mix it together!']],completeQuest);}
  if(q==='f4potion')return potion('story');
  say(L.bigAgain,'button');}
function potion(mode){const order=mode==='story'?['mushroom','acorn','dew','sparkle']:['mushroom','acorn','dew','sparkle'].sort(()=>Math.random()-.5).slice(0,3);
  if(mode==='play')say(L.playPotion,'button');
  LG.pickGame({mode,quest:mode==='story'?'f4potion':null,title:mode==='story'?'🧪 Big-Again Potion':'🧪 Silly Potion',titleSay:mode==='story'?L.potionTitle:L.potionPlay,
    who:mode==='story'?'pip':'button',recipe:true,steps:order.map(k=>({want:k,say:(mode==='story'?STEP:STEP2)[k]})),opts:POTION_OPTS,art:'forest.cauldron',
    onDone:()=>{if(mode==='story')return growButton();say(L.potionDone,'button');celebrate(true);if(rescued('button')){addHeart('button',2);ents.button.trick=state.time;}saveGame();}});}
function growButton(){const C=C4(),e=ents.button;C.big=true;sfx('fanfare');burst(e.x,e.y-.6,'💨',10,1.2);burst(e.x,e.y-.8,'✨',14,1.3);e.hop=state.time;saveGame();
  talk([['narrator','Bubble, bubble... POOF!'],['button','I am big again! Thank you, thank you!'],['button','Can I be your friend and live in your Pony Village?']],()=>namePony('button'));}
function meetGlimmer(){player.path=[];player.action=null;const C=C4();C.glimmerMet=true;const e=ents.glimmer;e.hop=state.time;
  talk([['glimmer','Oh! Hello... I am Glimmer. I got lost, and now my horn lost its sparkle.'],
    ['glimmer','Can you help me get my sparkle back? I need three magic colors. Tap me when you are ready!']],completeQuest);}
function talkGlimmer(){const e=ents.glimmer,q=qid();e.pause=state.time+5;hearts(e);
  if(q==='f4colors')return colors('story');
  say(C4().sparkle?L.glimmerHi:L.glimmerSad,'glimmer');}
function colors(mode){const ks=Object.keys(COLORS).sort(()=>Math.random()-.5).slice(0,3);
  LG.pickGame({mode,quest:'f4colors',title:'🌈 Magic Colors',titleSay:L.colorTitle,who:'glimmer',steps:ks.map(k=>({want:k,say:ASK[k]})),
    opts:Object.keys(COLORS).map(k=>({k,html:sw(COLORS[k])})),art:'forest.hornScreen',
    onDone:()=>{const C=C4();C.sparkle=true;const e=ents.glimmer;e.hop=state.time;celebrate();burst(e.x,e.y-1,'🌈',10,1.2);saveGame();
      talk([['glimmer','Look! My horn is sparkling again! Thank you!'],['glimmer','Can I live with you and be your friend?']],()=>namePony('glimmer'));}});}

// ===== Fairy lights (a "copy the order" game on glowing mushrooms) =====
const TONES=[523.3,659.3,784,1046.5];
function tone(k){if(!actx)return;note(TONES[k],actx.currentTime,.6,'sine',.22);note(TONES[k]*2,actx.currentTime,.3,'sine',.05);}
function startSimon(mode,pos){LG.stop(true);
  simon={mode,pos,area:hereArea(),lens:[3,4],round:0,seq:[],i:0,phase:'wait',t:0,lit:-1,litT:-9,miss:0,shown:-1};newSeq(1.4);
  say(mode==='story'?L.watch:L.playLights,mode==='story'?'pip':'glimmer');refreshBar(true);}
function newSeq(wait){const S=simon,n=S.lens[S.round];S.seq=[];for(let i=0;i<n;i++){let k;do{k=Math.floor(Math.random()*4);}while(i&&k===S.seq[i-1]);S.seq.push(k);}
  S.i=0;S.phase='wait';S.t=state.time+(wait||1.6);S.shown=-1;}
function simonUpdate(){const S=simon,t=state.time;if(!S)return;
  if((S.mode==='story'&&qid()!=='f4lights')||hereArea()!==S.area||flight){simon=null;refreshBar(true);return;}
  if(S.phase==='wait'&&t>=S.t&&!dlgOpen){S.phase='show';S.t=t;S.shown=-1;}
  if(S.phase==='show'){const k=Math.floor((t-S.t)/.9);if(k!==S.shown&&k<S.seq.length){S.shown=k;S.lit=S.seq[k];S.litT=t;tone(S.lit);}
    if(k>=S.seq.length&&t-S.t>S.seq.length*.9+.2){S.phase='input';S.i=0;say(S.mode==='story'?L.yourTurn:L.lightsTurn,S.mode==='story'?'pip':'glimmer');}}}
function simonTap(k){const S=simon,t=state.time;S.lit=k;S.litT=t;tone(k);
  if(S.seq[S.i]!==k){S.miss++;sfx('nope');say(S.mode==='story'?L.again:L.lightsAgain,S.mode==='story'?'pip':'glimmer');S.phase='wait';S.t=t+2;S.i=0;S.shown=-1;return;}
  S.i++;burst(S.pos[k].x,S.pos[k].y-.6,'✨',4,.5);
  if(S.i<S.seq.length)return;
  S.miss=0;S.round++;
  if(S.round<S.lens.length){sfx('sparkle');say(L.great,S.mode==='story'?'pip':'glimmer');newSeq(2);return;}
  const mode=S.mode;simon=null;refreshBar(true);celebrate(true);
  if(mode==='story'){openPath(true);saveGame();talk([['pip','You did it! You are so good at remembering!'],['narrator','Look! Glowing stepping stones appeared over the stream. It is the secret path!']],completeQuest);}
  else{say(L.lightsDone,'glimmer');if(rescued('glimmer')){addHeart('glimmer',2);ents.glimmer.trick=t;}saveGame();}}

// ===== Pip, the tiny fairy helper: follows her in the forest and waters the fairy garden =====
function pipUpdate(dt){const t=state.time;if(hereArea()!=='forest')return;
  let best=null,bd=1e9;for(const k in state.plots){const p=state.plots[k];if(p.w)continue;const[x,y]=k.split(',').map(Number);if(areaAt(x,y)!=='forest')continue;
    const d=dist(pip.x,pip.y,x+.5,y-.6);if(d<bd){bd=d;best={x,y,p};}}
  if(best&&C4().met){if(bd>16){pip.x=best.x+3;pip.y=best.y-3;}pip.flip=best.x+.5<pip.x;
    if(moveToward(pip,best.x+.5,best.y-.6,7,dt)){best.p.w=true;pip.sprinkle=t;sfx('water');burst(best.x+.5,best.y+.2,'💧',4,.4);burst(best.x+.5,best.y-.3,'✨',4,.5);}return;}
  if(dist(pip.x,pip.y,player.x,player.y)>12){pip.x=player.x+4;pip.y=player.y-3;}
  const tx=player.x-1.3+Math.sin(t*.7)*.5,ty=player.y-1.6+Math.sin(t*1.9)*.25;pip.flip=tx<pip.x;moveToward(pip,tx,ty,dist(pip.x,pip.y,tx,ty)>3?6:1.2,dt);}

// ===== Every frame =====
function resumeDone(q,C){switch(q){case 'f4letter':return C.letterRead;case 'f4meet':return C.met;case 'f4vines':return C.cloverFree;
  case 'f4clover':return rescued('clover');case 'f4mush':return C.mushGiven;case 'f4houses':return C.houses.every(Boolean);case 'f4button':return C.buttonMet;
  case 'f4potion':return rescued('button');case 'f4lights':return C.pathOpen;case 'f4path':return C.glimmerMet;case 'f4colors':return rescued('glimmer');}return false;}
HOOK.update.push(dt=>{const C=C4(),q=qid(),here=hereArea();
  bf.update(dt,q==='f4letter');pipUpdate(dt);simonUpdate();
  if(here==='forest'){if(q==='f4clover')LG.wantSeed('acorn');if(q==='f4mush')LG.wantSeed('mushroom');}
  if(!C.cloverFree&&here==='forest'&&Math.random()<dt*.5)particles.push({x:BRAMBLE.x+rand(-.3,.3),y:BRAMBLE.y-1.1,vx:0,vy:-.4,g:0,life:1,max:1,e:'💧',size:.2});
  if(isCh4()){const qq=Q[state.quest];if(qq.goal){const s=`${Math.min(state.qprog,qq.goal)}/${qq.goal}`,el=$('objProg');if(el.textContent!==s)el.textContent=s;}}
  const busy=dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show');if(busy)return;
  if(q==='f4fly'&&here==='forest')return completeQuest();
  if(q==='f4flyHome'&&here==='valley')return completeQuest();
  if(resumeDone(q,C))return completeQuest();
  if(here!=='forest'){if(q==='f4build'&&!C.done&&Q[state.quest].prog()>=3&&NEW.every(id=>!ents[id].goHome)){C.done=true;
      talk([['narrator','Hooray! You saved the Fairy Forest and rescued three new pony friends!'],
        ['narrator','Tap a pony and press the play button. Clover, Button, and Glimmer have new games to play with you!']],()=>{celebrate();completeQuest();});}return;}
  const near=(e,r)=>dist(player.x,player.y,e.x,e.y)<r;
  if(q==='f4meet'&&near(THRONE,3.2))return meetQueen();
  if(q==='f4vines'&&!LG.active()&&C.vineGone.length<VINES.length)startVines('story');
  if(q==='f4vines'&&C.vineGone.length>=VINES.length&&!C.cloverFree&&!LG.active())return freeClover();
  if(q==='f4lights'&&!simon&&near(RING,3.2)){startSimon('story',RINGPOS);player.action=null;player.path=findPath(RING.x,RING.y+.2);}
  if(q==='f4path'&&C.pathOpen&&near(ents.glimmer,2.6))return meetGlimmer();
});

// ===== Taps =====
HOOK.tap.push((wx,wy)=>{const C=C4(),q=qid();
  if(q==='f4letter'&&bf.hit(wx,wy)){goDo(bf.x,bf.y+1.2,2,readLetter,bf);return true;}
  if(simon){for(let k=0;k<4;k++){const p=simon.pos[k];if(dist(wx,wy,p.x,p.y-.35)<.85){if(simon.phase==='input')simonTap(k);return true;}}
    if(simon.mode==='play'){player.action=null;player.path=findPath(wx,wy);return true;}}
  if(hereArea()!=='forest')return false;
  const pad=PADS.forest,onBalloon=state.balloonAt==='forest'&&Math.abs(wx-pad.x)<1.1&&wy>pad.y-3.6&&wy<pad.y+.3;
  if(!onBalloon&&dist(wx,wy,pip.x,pip.y)<.6){sfx('sparkle');burst(pip.x,pip.y,'✨',5,.5);say(isCh4()&&q!=='f4build'?Q[state.quest].hint:pick(L.pipIdle),'pip');return true;}
  if(dist(wx,wy,THRONE.x,THRONE.y-1.2)<1.4){goDo(THRONE.x,THRONE.y+.8,1.6,talkQueen);return true;}
  for(let i=0;i<HOUSES.length;i++){const h=HOUSES[i];if(Math.abs(wx-h.x)<.9&&wy>h.y-1.9&&wy<h.y+.3){goDo(h.x,h.y+.7,1.5,()=>tapHouse(i));return true;}}
  for(const id of NEW){if(rescued(id))continue;const e=ents[id];if(dist(wx,wy,e.x,e.y-.4)>1)continue;
    if(id==='clover'&&!C.cloverFree){say(L.thorny,'narrator');return true;}
    if(id==='button'&&!C.houses.every(Boolean)){player.path=findPath(wx,wy);return true;}
    const fn=id==='clover'?talkClover:id==='button'?talkButton:talkGlimmer;goDo(e.x,e.y,id==='button'?1.4:1.8,fn,e);return true;}
  if(!C.cloverFree&&dist(wx,wy,BRAMBLE.x,BRAMBLE.y-.5)<1.6&&!LG.active()){say(q==='f4vines'?L.thorny:L.crying,'narrator');return true;}
  return false;});

// ===== Guiding arrow =====
const up=(e,h)=>({x:e.x,y:e.y-(h||.7)});
HOOK.target.push(()=>{
  if(simon){const S=simon;if(S.phase==='input'&&S.miss>=2){const p=S.pos[S.seq[S.i]];return{x:p.x,y:p.y-.5};}return null;}
  if(!isCh4())return undefined;
  const C=C4(),q=qid();
  if(q==='f4letter')return bf.leaving?null:{x:bf.x,y:bf.y-.2};
  if(q==='f4flyHome')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='f4build')return LG.villageTarget();
  const g=LG.goArea('forest');if(g!==null)return g;
  switch(q){
    case 'f4fly':return null;
    case 'f4meet':return{x:THRONE.x,y:THRONE.y-1.4};
    case 'f4vines':return BRAMBLE;
    case 'f4clover':return state.inv.acorn>0?up(ents.clover):LG.cropTarget(['acorn'],'forest');
    case 'f4mush':return state.inv.mushroom>=3?{x:HOUSES[0].x,y:HOUSES[0].y-1.2}:LG.cropTarget(['mushroom'],'forest');
    case 'f4houses':{const h=nearest(HOUSES.filter((h,i)=>!C.houses[i]));return h?{x:h.x,y:h.y-1.2}:null;}
    case 'f4button':case 'f4potion':return up(ents.button,.4);
    case 'f4lights':return{x:RING.x,y:RING.y-.6};
    case 'f4path':return C.pathOpen&&player.x<31?{x:SECRET[0][0]+.5,y:SECRET[0][1]+.3}:up(ents.glimmer);
    case 'f4colors':return up(ents.glimmer);}
  return null;});

// ===== Begin / land / play / bar =====
HOOK.begin.push(isNew=>{const C=ensure();simon=null;
  if(!isNew&&qid()==='freeEnd'&&!C.done){state.quest=qi('f4letter');state.qprog=0;updateObjective();}
  const q=qid();
  if(q==='f4letter')bf.arrive();else bf.leaving=true;
  if(!isNew&&q==='f4letter'&&!C.letterSeen)talk(Q[state.quest].start);
  pip.x=player.x-2;pip.y=player.y-2;
  if(hereArea()==='forest'&&q==='f4vines')startVines('story');});
HOOK.land.push(to=>{simon=null;if(to==='forest'){pip.x=player.x-2;pip.y=player.y-2.5;if(C4().met&&!isCh4())say(pick(L.pipIdle),'pip');}});
HOOK.play.clover=()=>{simon=null;startVines('play');};
HOOK.play.button=()=>{simon=null;potion('play');};
HOOK.play.glimmer=()=>{const sp=LG.spotsNear(4,1.6,4.6);if(sp.length<4){say(L.noRoom,'narrator');return;}startSimon('play',sp);};
HOOK.bar.push(()=>simon&&simon.mode==='play'?[{key:'f4stop',html:'✖',label:'stop',onTap:()=>{simon=null;sfx('tap');refreshBar(true);}}]:null);
window.ch4Debug=()=>({simon,pip,bf});

// ===== Drawing hooks (all looks come from the ART table) =====
CHUNK_HOOKS.push((ax,ay,bx,by,s)=>{if(by<48||ay>80||ax>44)return;
  for(let y=Math.max(ay,48);y<Math.min(by,80);y++)for(let x=ax;x<Math.min(bx,44);x++)if(map[y][x]==='j')ART.stoneTile(x,y,s);});
HOOK.tile.push((c,x,y,sx,sy,s,h,t)=>{if(c!=='j')return false;ART.stoneSparkle(x,y,sx,sy,s,h,t);return true;});
HOOK.layer.push((L,t,x0,y0,x1,y1)=>{bf.layer(L,t);if(hereArea()!=='forest')return;const C=C4(),s=ts;
  const vis=(x,y,m)=>x>x0-(m||2)&&x<x1+(m||2)&&y>y0-(m||2)&&y<y1+(m||3);
  if(vis(THRONE.x,THRONE.y,3))L.push([THRONE.y,()=>ART.throne(SX(THRONE.x),SY(THRONE.y),s,t)]);
  HOUSES.forEach((h,i)=>{if(vis(h.x,h.y))L.push([h.y,()=>ART.fairyHouse(SX(h.x),SY(h.y),s,t,C.houses[i],i)]);});
  if(!C.cloverFree&&vis(BRAMBLE.x,BRAMBLE.y))L.push([BRAMBLE.y+.05,()=>ART.bramble(SX(BRAMBLE.x),SY(BRAMBLE.y),s,t)]);
  const fieldOn=LG.active()&&LG.active().id==='vines'&&LG.active().mode==='story';
  VINES.forEach(([x,y],i)=>{if(!vis(x,y))return;if(C.vineGone.includes(i))L.push([y-.3,()=>ART.vineFlowers(SX(x),SY(y),s,t,i)]);
    else if(!fieldOn)L.push([y,()=>ART.vine({x,y,st:'on',ph:i},t)]);});
  if(vis(RING.x,RING.y,4))RINGPOS.forEach((p,i)=>L.push([p.y,()=>ART.mushroomLight(SX(p.x),SY(p.y),s,t,i,simon&&simon.pos===RINGPOS?simonLit(i,t):0,qid()==='f4lights')]));
  if(C.pathOpen&&vis(34,70,6))L.push([66,()=>ART.gladeGlow(t)]);
  L.push([pip.y+2,()=>ART.pip(SX(pip.x),SY(pip.y),s,t,pip.flip,t-pip.sprinkle<.8)]);});
// mushrooms for the fairy lights game when it is played somewhere else
HOOK.layer.push((L,t)=>{if(!simon||simon.pos===RINGPOS)return;simon.pos.forEach((p,i)=>{if(onScreen(p.x,p.y))L.push([p.y,()=>ART.mushroomLight(SX(p.x),SY(p.y),ts,t,i,simonLit(i,t),true)]);});});
function simonLit(i,t){return simon&&simon.lit===i&&t-simon.litT<.6?1-(t-simon.litT)/.6:0;}
HOOK.overlay.push(t=>{if(hereArea()==='forest')ART.lightRays(t);});

// ===================== LandArt.forest: every Fairy Forest look (swap any of these for sprite art) =====================
// Trees: four kinds picked by tile hash (oak, pine, birch, giant mushroom)
function ftreeSprite(kind){const s=ts;return getSprite('ftree'+kind,1.8*s,2.3*s,.9*s,2.1*s,()=>{ctx.lineJoin='round';ctx.lineCap='round';
  if(kind===3){ctx.fillStyle='#fff3e0';ctx.strokeStyle='#d8b98f';ctx.lineWidth=s*.035;rr(-s*.14,-s*.7,s*.28,s*.72,s*.1);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ff5a5f';ctx.strokeStyle='#c43a3f';ctx.beginPath();ctx.moveTo(-s*.62,-s*.62);ctx.quadraticCurveTo(-s*.55,-s*1.32,0,-s*1.36);ctx.quadraticCurveTo(s*.55,-s*1.32,s*.62,-s*.62);
    ctx.quadraticCurveTo(0,-s*.5,-s*.62,-s*.62);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';for(const[a,b,r]of[[-.3,-.95,.09],[.12,-1.12,.11],[.36,-.85,.07],[-.05,-.75,.06]]){circ(a*s,b*s,r*s);ctx.fill();}
    ctx.fillStyle='rgba(255,255,255,.3)';ell(-s*.2,-s*1.15,s*.15,s*.06);ctx.fill();return;}
  const trunk=kind===2?'#efe9e0':'#7a5234',tl=kind===2?'#b8ad9f':'#4e3220';
  ctx.fillStyle=trunk;ctx.strokeStyle=tl;ctx.lineWidth=s*.035;ctx.beginPath();ctx.moveTo(-s*.15,0);ctx.quadraticCurveTo(-s*.08,-s*.1,-s*.08,-s*.7);ctx.lineTo(s*.08,-s*.7);ctx.quadraticCurveTo(s*.08,-s*.1,s*.15,0);ctx.closePath();ctx.fill();ctx.stroke();
  if(kind===2){ctx.fillStyle='#3b3330';for(let i=0;i<4;i++)ctx.fillRect(-s*.06+(i%2)*s*.05,-s*(.15+i*.14),s*.05,s*.02);}
  if(kind===1){const tiers=[[-.45,.6,.55],[-.85,.48,.5],[-1.22,.36,.45],[-1.55,.24,.4]];
    for(const[b,w,hh]of tiers){ctx.beginPath();ctx.moveTo(0,(b-hh)*s);ctx.lineTo(w*s,b*s);ctx.quadraticCurveTo(0,(b+.1)*s,-w*s,b*s);ctx.closePath();ctx.fillStyle='#2f7d4f';ctx.fill();ctx.strokeStyle='#1d5536';ctx.lineWidth=s*.04;ctx.stroke();
      ctx.fillStyle='rgba(120,200,140,.35)';ctx.beginPath();ctx.moveTo(0,(b-hh)*s);ctx.lineTo(-w*.85*s,(b-.02)*s);ctx.lineTo(-w*.2*s,(b-.04)*s);ctx.closePath();ctx.fill();}return;}
  const B=kind===2?[[-.3,-.85,.3],[.3,-.9,.3],[0,-1.2,.34],[-.18,-1.45,.26],[.2,-1.48,.25]]:[[-.4,-.85,.36],[.4,-.88,.36],[0,-.8,.38],[-.25,-1.25,.36],[.27,-1.28,.36],[0,-1.58,.32]];
  const dark=kind===2?'#5aa846':'#2a6b3a',mid=kind===2?'#7cc35a':'#3b8a4a',lite=kind===2?'#a6dc84':'#58a65e';
  ctx.strokeStyle=dark;ctx.lineWidth=s*.05;for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.stroke();}
  ctx.fillStyle=mid;for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.fill();}
  ctx.fillStyle=lite;for(const[a,b,r]of B.slice(2)){circ((a-.08)*s,(b-.1)*s,r*.55*s);ctx.fill();}
  if(kind===0)for(const[a,b]of[[-.35,-.9],[.3,-1.15],[0,-1.5],[.42,-.75]]){ctx.fillStyle='#fff6a8';circ(a*s,b*s,s*.035);ctx.fill();}});}
ART.tree=function(x,y){const s=ts,h=hash(x,y),kind=h<.12?3:h<.42?1:h>.86?2:0,cx=SX(x)+s/2,base=SY(y)+s*.9,spr=ftreeSprite(kind);
  shadow(cx,base,s*.48,s*.15);const k=Math.sin(nowS()*1.1+h*12)*.02;ctx.save();ctx.translate(cx,base);ctx.transform(1,0,k,1,0,0);ctx.drawImage(spr,-spr._ox,-spr._oy,spr._w,spr._h);ctx.restore();};
// Ground details baked into the cached ground: ferns, tiny mushrooms, clover and blue flowers
ART.grassDeco=function(x,y,c,s,r){const X=x*s,Y=y*s;if(c!=='.')return;ctx.lineCap='round';
  if(r()<.3){const tx=X+s*(.2+r()*.6),ty=Y+s*(.4+r()*.5);ctx.strokeStyle='#2f7d3a';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();
    for(let i=0;i<5;i++){const a=-1.2+i*.6;ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+Math.sin(a)*s*.08,ty-s*.1,tx+Math.sin(a)*s*.16,ty-Math.cos(a)*s*.14);}ctx.stroke();}
  const v=r();if(v<.07){const mx=X+s*(.2+r()*.6),my=Y+s*(.3+r()*.5);ctx.fillStyle='#fff3e0';ctx.fillRect(mx-s*.015,my-s*.05,s*.03,s*.06);
    ctx.fillStyle=r()<.5?'#ff5a5f':'#c58b4a';ctx.beginPath();ctx.arc(mx,my-s*.05,s*.05,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';circ(mx-s*.015,my-s*.07,s*.01);ctx.fill();}
  else if(v<.16){const fx2=X+s*(.2+r()*.6),fy=Y+s*(.2+r()*.6);ctx.fillStyle='#6cbd4c';for(let i=0;i<3;i++){const a=i*2.09;circ(fx2+Math.cos(a)*s*.025,fy+Math.sin(a)*s*.025,s*.025);ctx.fill();}}
  else if(v<.24){flower(X+s*(.2+r()*.6),Y+s*(.2+r()*.6),s*.028,r()<.5?'#9fd3ff':'#e6d6ff');}
  if(r()<.25){ctx.fillStyle='rgba(150,220,120,.25)';ell(X+r()*s,Y+r()*s,s*.12,s*.05);ctx.fill();}};
ART.stoneTile=function(x,y,s){const X=x*s+s/2,Y=y*s+s/2;ctx.fillStyle='rgba(30,60,40,.25)';ell(X+s*.03,Y+s*.06,s*.36,s*.24);ctx.fill();
  ctx.fillStyle='#d9d2e8';ctx.strokeStyle='#9b8fc0';ctx.lineWidth=Math.max(1,s*.03);ell(X,Y,s*.36,s*.24);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.6)';ell(X-s*.1,Y-s*.07,s*.14,s*.06);ctx.fill();ctx.strokeStyle='rgba(255,240,150,.8)';ctx.lineWidth=Math.max(1,s*.025);ell(X,Y,s*.4,s*.28);ctx.stroke();};
ART.stoneSparkle=function(x,y,sx,sy,s,h,t){const k=Math.sin(t*3+h*20);if(k>.4)twinkle(sx+s*(.3+h*.4),sy+s*(.3+(h*7%1)*.3),s*.07*k,k);};
ART.lightRays=function(t){const g=getSprite('frays',300,600,0,0,()=>{const gr=ctx.createLinearGradient(0,0,300,0);gr.addColorStop(0,'rgba(255,250,200,0)');gr.addColorStop(.5,'rgba(255,250,200,.16)');gr.addColorStop(1,'rgba(255,250,200,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,300,600);},1);
  ctx.save();ctx.globalAlpha=.7+.3*Math.sin(t*.4);for(let i=0;i<3;i++){const x=((i*430-cam.x*.15)%(vw+500)+vw+500)%(vw+500)-250;ctx.save();ctx.translate(x,-40);ctx.rotate(.35);ctx.drawImage(g,0,0,140+i*40,vh*1.4);ctx.restore();}ctx.restore();};
ART.throne=function(X,Y,s,t){shadow(X,Y,s*1.2,s*.22);ctx.lineWidth=Math.max(1,s*.035);
  ctx.fillStyle='#fff3e0';ctx.strokeStyle='#d8b98f';rr(X-s*.35,Y-s*1.2,s*.7,s*1.2,s*.2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ff7eb6';ctx.strokeStyle='#d94f9b';ctx.beginPath();ctx.moveTo(X-s*1.25,Y-s*1.1);ctx.quadraticCurveTo(X-s*1.1,Y-s*2.35,X,Y-s*2.4);ctx.quadraticCurveTo(X+s*1.1,Y-s*2.35,X+s*1.25,Y-s*1.1);ctx.quadraticCurveTo(X,Y-s*.9,X-s*1.25,Y-s*1.1);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';for(const[a,b,r]of[[-.6,-1.6,.15],[.1,-2.0,.17],[.65,-1.5,.12],[-.15,-1.35,.1],[.4,-1.9,.08]]){circ(X+a*s,Y+b*s,r*s);ctx.fill();}
  ctx.fillStyle='#ffd34d';ctx.strokeStyle='#c99a1a';rr(X-s*.55,Y-s*.75,s*1.1,s*.3,s*.12);ctx.fill();ctx.stroke();
  for(let i=0;i<5;i++){const a=t*1.2+i*1.25;drawStar(X+Math.cos(a)*s*1.2,Y-s*1.6+Math.sin(a)*s*.45,s*.06,['#fff6a8','#ffb3e6','#b3e6ff'][i%3],true);}
  ART.queen(X,Y-s*.35,s,t);};
ART.queen=function(X,Y,s,t){const b=Math.sin(t*2)*s*.06;ctx.globalAlpha=.6;ctx.drawImage(glowSprite('#ffe9f5'),X-s*.8,Y-s*1.6+b,s*1.6,s*1.6);ctx.globalAlpha=1;
  drawEmoji('🧚‍♀️',X,Y-s*.8+b,s*.95);drawEmoji('👑',X+s*.02,Y-s*1.35+b,s*.32);};
ART.pip=function(X,Y,s,t,flip,spr){const b=Math.sin(t*5)*s*.05;ctx.globalAlpha=.55;ctx.drawImage(glowSprite('#fff6a8'),X-s*.35,Y-s*.35+b,s*.7,s*.7);ctx.globalAlpha=1;
  drawEmoji('🧚',X,Y+b,s*.48,flip);if(spr||Math.sin(t*7)>.6)twinkle(X+(flip?s*.25:-s*.25),Y+s*.2+b,s*.06,.9);};
ART.butterfly=function(m,t){const s=ts,x=SX(m.x),y=SY(m.y),f=Math.sin(t*14);drawEmoji('🍃',x+(m.flip?s*.2:-s*.2),y+s*.3,s*.36);
  ctx.save();ctx.translate(x,y);ctx.scale(.75+.25*Math.abs(f),1);drawEmoji('🦋',0,0,s*.6,m.flip);ctx.restore();};
ART.bramble=function(X,Y,s,t){shadow(X,Y,s*1.2,s*.2);ctx.lineCap='round';
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=s*(.55+.2*hash(i,3));ctx.strokeStyle=i%2?'#4b3a5c':'#5b4a2c';ctx.lineWidth=s*.08;ctx.beginPath();ctx.moveTo(X,Y-s*.4);
    ctx.quadraticCurveTo(X+Math.cos(a)*r*1.2,Y-s*.4+Math.sin(a)*r*.5-s*.5,X+Math.cos(a+.6)*r,Y-s*.4+Math.sin(a+.6)*r*.55);ctx.stroke();}
  ctx.fillStyle='#3d6b35';for(const[a,b,r]of[[-.5,-.4,.35],[.45,-.45,.35],[0,-.75,.42],[-.2,-.25,.3],[.25,-.2,.3]]){circ(X+a*s,Y+b*s,r*s);ctx.fill();}
  ctx.fillStyle='#e8e0d0';for(let i=0;i<14;i++){const a=hash(i,11)*6.28,r=s*(.3+hash(i,12)*.5),px=X+Math.cos(a)*r,py=Y-s*.45+Math.sin(a)*r*.6;
    ctx.beginPath();ctx.moveTo(px,py-s*.06);ctx.lineTo(px+s*.03,py);ctx.lineTo(px-s*.03,py);ctx.closePath();ctx.fill();}
  const bx=X+s*.7,by=Y-s*1.35;ctx.fillStyle='rgba(255,255,255,.95)';circ(bx,by,s*.24);ctx.fill();circ(bx-s*.15,by+s*.22,s*.06);ctx.fill();drawEmoji('😢',bx,by,s*.3);};
ART.vine=function(it,t){const s=ts,X=SX(it.x),Y=SY(it.y),k=it.st==='pop'?Math.min(1,(t-it.t0)/.5):0,w=Math.sin(t*2+it.ph)*.08;
  if(k<1){ctx.save();ctx.globalAlpha=1-k;ctx.translate(X,Y);ctx.scale(1-k*.5,1-k*.5);ctx.rotate(w);shadow(0,0,s*.35,s*.08);ctx.lineCap='round';
    for(let j=0;j<3;j++){const a=-.9+j*.9;ctx.strokeStyle=j===1?'#4b3a5c':'#5a2f4f';ctx.lineWidth=s*.075;ctx.beginPath();ctx.moveTo(0,0);
      ctx.bezierCurveTo(Math.sin(a)*s*.5,-s*.3,Math.sin(a)*s*.1-s*.2,-s*.7,Math.sin(a)*s*.35,-s*.95);ctx.stroke();
      ctx.fillStyle='#e8e0d0';for(let i=1;i<5;i++){const u=i/5,px=Math.sin(a)*s*.35*u+Math.sin(u*6)*s*.08,py=-s*.95*u;ctx.beginPath();ctx.moveTo(px+s*.07,py);ctx.lineTo(px,py-s*.04);ctx.lineTo(px,py+s*.04);ctx.closePath();ctx.fill();}}
    ctx.fillStyle='#3d6b35';ell(-s*.15,-s*.5,s*.1,s*.06);ctx.fill();ell(s*.18,-s*.35,s*.1,s*.06);ctx.fill();ctx.restore();
    if(it.st==='on'&&Math.sin(t*3+it.ph*2)>.7)twinkle(X+s*.3,Y-s*.8,s*.07,1);}
  if(k>0){const g=Math.min(1,(t-it.t0)/.7);['🌸','🌼','🌷'].forEach((e,i)=>drawEmoji(e,X+(i-1)*s*.28*g,Y-s*(.3+.2*g)-Math.abs(i-1)*-s*.05,s*.4*g));}};
ART.vineFlowers=function(X,Y,s,t,i){const b=Math.sin(t*1.5+i)*s*.02;['🌸','🌼','🌷'].forEach((e,j)=>drawEmoji(e,X+(j-1)*s*.28,Y-s*.3+b+(j===1?-s*.08:0),s*.36));};
ART.mushroomLight=function(X,Y,s,t,i,lit,ready){const cols=['#ff5a5f','#5fa8f5','#ffd83d','#a77bd8'],c=cols[i],g=lit>0?lit:0,idle=ready?.25+.15*Math.sin(t*2+i):.12;
  ctx.globalAlpha=Math.min(1,idle+g);ctx.drawImage(glowSprite(c),X-s*(.6+g*.4),Y-s*(.95+g*.4),s*(1.2+g*.8),s*(1.2+g*.8));ctx.globalAlpha=1;
  shadow(X,Y,s*.3,s*.07);ctx.fillStyle='#fff3e0';ctx.strokeStyle='#d8b98f';ctx.lineWidth=Math.max(1,s*.025);rr(X-s*.08,Y-s*.42,s*.16,s*.42,s*.06);ctx.fill();ctx.stroke();
  ctx.fillStyle=g>0?shadeHex(c,.35):c;ctx.strokeStyle=shadeHex(c,-.3);ctx.beginPath();ctx.moveTo(X-s*.36,Y-s*.4);ctx.quadraticCurveTo(X-s*.3,Y-s*.82,X,Y-s*.84);ctx.quadraticCurveTo(X+s*.3,Y-s*.82,X+s*.36,Y-s*.4);
  ctx.quadraticCurveTo(X,Y-s*.32,X-s*.36,Y-s*.4);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.85)';circ(X-s*.12,Y-s*.62,s*.05);ctx.fill();circ(X+s*.1,Y-s*.68,s*.04);ctx.fill();
  if(g>0)for(let j=0;j<3;j++)twinkle(X+Math.cos(t*4+j*2)*s*.4,Y-s*.7+Math.sin(t*4+j*2)*s*.2,s*.07*g,g);};
ART.gladeGlow=function(t){const s=ts;for(let i=0;i<10;i++){const x=33.3+hash(i,61)*5.4,y=66.3+hash(i,62)*8,k=.5+.5*Math.sin(t*2+i);if(!onScreen(x,y))continue;
  ctx.globalAlpha=k*.6;ctx.drawImage(glowSprite('#ffe9f5'),SX(x)-s*.25,SY(y)-s*.25,s*.5,s*.5);ctx.globalAlpha=1;twinkle(SX(x),SY(y),s*.06*k,k);}};
// Mushroom fairy house drawn in pixels: X,Y = bottom center, s = tile size, h = the choices {cap,door,win,flw} or null (broken)
ART.fairyHouseAt=function(X,Y,s,t,h){ctx.lineJoin='round';ctx.lineWidth=Math.max(1,s*.035);
  if(!h){ctx.fillStyle='#e8dcc8';ctx.strokeStyle='#b8a68a';rr(X-s*.35,Y-s*.75,s*.7,s*.75,s*.12);ctx.fill();ctx.stroke();
    ctx.fillStyle='#b9a6a0';ctx.strokeStyle='#8a7670';ctx.beginPath();ctx.moveTo(X-s*.6,Y-s*.7);ctx.lineTo(X-s*.2,Y-s*1.05);ctx.lineTo(X-s*.05,Y-s*.8);ctx.lineTo(X+s*.2,Y-s*1.1);ctx.lineTo(X+s*.6,Y-s*.7);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#5a2f4f';ctx.lineWidth=s*.05;ctx.beginPath();ctx.moveTo(X-s*.45,Y-s*.1);ctx.quadraticCurveTo(X,Y-s*.6,X+s*.45,Y-s*.2);ctx.stroke();
    ctx.fillStyle='#4a3a2a';rr(X-s*.1,Y-s*.4,s*.2,s*.4,s*.08);ctx.fill();return;}
  ctx.fillStyle='#fff6e8';ctx.strokeStyle='#d8b98f';rr(X-s*.42,Y-s*.95,s*.84,s*.95,s*.2);ctx.fill();ctx.stroke();
  ctx.fillStyle=DOOR[h.door]||'#a0643a';ctx.strokeStyle=shadeHex(DOOR[h.door]||'#a0643a',-.3);ctx.beginPath();ctx.moveTo(X-s*.14,Y);ctx.lineTo(X-s*.14,Y-s*.32);ctx.arc(X,Y-s*.32,s*.14,Math.PI,0);ctx.lineTo(X+s*.14,Y);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffd34d';circ(X+s*.07,Y-s*.18,s*.025);ctx.fill();
  const wx=X+s*.24,wy=Y-s*.62;ctx.save();ctx.globalAlpha=.6+.3*Math.sin(t*2);ctx.drawImage(glowSprite('#fff3a0'),wx-s*.2,wy-s*.2,s*.4,s*.4);ctx.restore();drawEmoji(WIN[h.win]||'⭕',wx,wy,s*.22);
  const cc=CAP[h.cap]||'#ff5a5f';ctx.fillStyle=cc;ctx.strokeStyle=shadeHex(cc,-.3);ctx.beginPath();ctx.moveTo(X-s*.75,Y-s*.82);ctx.quadraticCurveTo(X-s*.68,Y-s*1.72,X,Y-s*1.78);
  ctx.quadraticCurveTo(X+s*.68,Y-s*1.72,X+s*.75,Y-s*.82);ctx.quadraticCurveTo(X,Y-s*.66,X-s*.75,Y-s*.82);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff';for(const[a,b,r]of[[-.4,-1.15,.1],[.05,-1.45,.12],[.42,-1.1,.08],[-.1,-1.0,.06]]){circ(X+a*s,Y+b*s,r*s);ctx.fill();}
  const f=FLW[h.flw]||'🌸';drawEmoji(f,X-s*.48,Y-s*.08,s*.3);drawEmoji(f,X+s*.5,Y-s*.06,s*.28);
  const a=t*1.6;drawEmoji('🧚',X+Math.cos(a)*s*.7,Y-s*1.3+Math.sin(a*1.7)*s*.2,s*.3,Math.sin(a)>0);};
ART.fairyHouse=function(X,Y,s,t,h,i){shadow(X,Y,s*.6,s*.12);ART.fairyHouseAt(X,Y,s,t,h);
  if(!h&&['f4mush','f4houses'].includes(qid())&&Math.sin(t*3+i)>.5)twinkle(X+s*.5,Y-s*1.1,s*.08,1);};
ART.houseBuilder=function(w,h,t,g){ctx.fillStyle='#e6f6dc';rr(0,0,w,h,24);ctx.fill();ctx.fillStyle='#bfe6a8';ell(w/2,h*.88,w*.42,h*.1);ctx.fill();
  const ch=Object.assign({},g.ch),now=performance.now()/1000,bounce=g.pop?Math.max(0,1-(now-g.pop)/.35):0,s=130*(1+bounce*.06);
  const house=g.si>0||Object.keys(ch).length?{cap:ch.cap||'pink',door:ch.door||'brown',win:ch.win||'round',flw:ch.flw||'pink'}:null;
  if(!ch.cap){ctx.globalAlpha=.35;ART.fairyHouseAt(w/2,h*.88,s,t,{cap:'pink',door:'brown',win:'round',flw:'pink'});ctx.globalAlpha=1;}else ART.fairyHouseAt(w/2,h*.88,s,t,house);
  if(g.tada){const k2=Math.min(1,(now-g.tada)/.6);for(let i=0;i<10;i++){const a=i/10*6.28+now;drawStar(w/2+Math.cos(a)*170*k2,h*.5+Math.sin(a)*90*k2,8,STARS[i%7].c,true);}}};
ART.cauldron=function(w,h,t,g){ctx.fillStyle='#efe4ff';rr(0,0,w,h,24);ctx.fill();const X=w/2+40,Y=h*.86,n=g.ok.length,cols=['#8fd16a','#c58b4a','#9fd3ff','#ffe14d','#ff9ad5'];
  const liquid=cols[Math.min(n,cols.length-1)],now=performance.now()/1000,hit=g.hit?Math.max(0,1-(now-g.hit)/.6):0,done=g.i>=g.steps.length;
  ctx.fillStyle='rgba(60,40,80,.2)';ell(X,Y,92,14);ctx.fill();ctx.fillStyle='#4a3a5a';ctx.strokeStyle='#2a1f36';ctx.lineWidth=4;
  ctx.beginPath();ctx.ellipse(X,Y-58,86,62,0,0,Math.PI);ctx.fill();ctx.stroke();ctx.fillStyle=liquid;ell(X,Y-58,80,16);ctx.fill();
  for(let i=0;i<6;i++){const k=(t*.8+i/6)%1;ctx.globalAlpha=1-k;ctx.fillStyle='#fff';circ(X-50+i*20,Y-62-k*60*(1+hit),5+3*hash(i,5));ctx.fill();}ctx.globalAlpha=1;
  ctx.strokeStyle='#2a1f36';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(X-86,Y-58);ctx.lineTo(X+86,Y-58);ctx.stroke();
  if(hit>0)drawEmoji('✨',X,Y-90-40*(1-hit),40*hit+10);
  if(done){const k=Math.min(1,(now-g.hit)/.8);ctx.globalAlpha=1-k*.6;drawEmoji('💨',X,Y-120,60+120*k);ctx.globalAlpha=1;}
  const bt=performance.now()/1000,sc=done?Math.min(1,(now-g.hit)/1)*.5+.35:.35,o=Object.assign({},ponyLook('button'),{scale:sc,flip:false,walkT:0,moving:false});
  const sTs=ts;ts=100;drawHorse(70,h*.88+Math.sin(bt*3)*2,o);ts=sTs;drawEmoji('🧚',X+110,70+Math.sin(bt*4)*6,40,true);};
ART.hornScreen=function(w,h,t,g){ctx.fillStyle='#fff0fb';rr(0,0,w,h,24);ctx.fill();const now=performance.now()/1000,n=g.ok.length;
  const o=Object.assign({},ponyLook('glimmer'),{flip:false,walkT:0,moving:false,scale:1});
  if(n)o.mane=g.ok.map(k=>COLORS[k]).concat(o.mane.slice(0,3-n));if(n>=g.steps.length)o.hornColor='#ffd34d';
  const sTs=ts;ts=170;drawHorse(w/2-30,h*.95,o);ts=sTs;
  const hx=w/2-30+.4*170+30,hy=h*.95-.88*170-40;for(let i=0;i<n;i++){const a=now*2+i*2.1;drawStar(hx+Math.cos(a)*40,hy+Math.sin(a)*22,9,COLORS[g.ok[i]],true);}
  const hit=g.hit?Math.max(0,1-(now-g.hit)/.6):0;if(hit>0)drawEmoji('✨',hx,hy,30+40*hit);};
ART.tinyPony=function(e,t){const s=ts,o=Object.assign({},ponyLook('button'),{scale:.34,flip:e.flip,walkT:0,moving:false}),X=SX(e.x),Y=SY(e.y)-Math.abs(Math.sin(t*4))*s*.04;
  drawHorse(X,Y,o);if(Math.sin(t*2.5)>.3){ctx.fillStyle='rgba(255,255,255,.95)';circ(X+s*.35,Y-s*.6,s*.2);ctx.fill();drawEmoji('❗',X+s*.35,Y-s*.6,s*.22);}};
ART.flightScene=function(gy,s,t){ctx.fillStyle='#4f9a3e';ell(vw*.3,gy+vh*.12,vw*.5,vh*.24);ctx.fill();ctx.fillStyle='#3b8a4a';ell(vw*.8,gy+vh*.16,vw*.5,vh*.26);ctx.fill();
  drawEmoji('🌲',vw*.12,gy-s*.1,s*1);drawEmoji('🌳',vw*.28,gy-s*.25,s*1.1);drawEmoji('🍄',vw*.45,gy+s*.2,s*.6);drawEmoji('🌲',vw*.7,gy-s*.05,s*1);drawEmoji('🌳',vw*.86,gy+s*.1,s*.9);
  drawEmoji('🧚',vw*.58,gy-s*.6+Math.sin(t*3)*s*.1,s*.5);};
})();
