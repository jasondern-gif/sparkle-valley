'use strict';
// ---------- Chapter 2 logic ----------
let flight=null,placing=null,hide=null,menuPony=null,hoofprints=[],printIdx=0;
const areaPad=()=>inClouds(player.x)?PADS.clouds:PADS.valley;
const rescued=id=>!!state.ponies[id];
const ponyName=id=>(state.ponies[id]&&state.ponies[id].name)||PONIES[id].names[0];
function spName(who){return PONIES[who]?ponyName(who):(SPK[who]||SPK.narrator).n;}
function seedsHere(){if(inVillage(player.x,player.y))return [];
  const ks=inClouds(player.x)?['rcarrot','cloudberry','strawberry','sunflower']:['carrot','strawberry','sunflower'];return ks.filter(k=>state.seeds[k]);}
function validSeed(){const s=seedsHere();if(!s.includes(state.seed))state.seed=s[0]||'carrot';return state.seed;}

function ch2Init(){
  ents.bird={x:9,y:5,leaving:false};ents.princess={x:57.5,y:11.4};
  for(const id of PONY_IDS)ents[id]={x:0,y:0};placePonies();
  // sparkly hoofprints lead from the entrance of the fluffy clouds to Puff
  const path=bfsTiles(57,21,75,26);hoofprints=path.filter((p,i)=>i%2===1).map((p,i)=>({x:p.x+.5+(i%2?.18:-.18),y:p.y+.55}));
  state.cottages.forEach(applyCottage);
}
function bfsTiles(sx,sy,tx,ty){const prev=new Int32Array(W*H).fill(-2),q=[sx+sy*W];prev[q[0]]=-1;
  for(let h=0;h<q.length;h++){const c=q[h];if(c===tx+ty*W)break;const x=c%W,y=(c/W)|0;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=x+dx+(y+dy)*W;if(prev[n]===-2&&isWalkChar(map[y+dy][x+dx],true)){prev[n]=c;q.push(n);}}}
  const out=[];for(let c=tx+ty*W;c>=0&&prev[c]!==-2;c=prev[c])out.unshift({x:c%W,y:(c/W)|0});return out;}
function homeOf(id){const p=state.ponies[id];if(!p)return PONIES[id].home;
  const c=state.cottages[p.home];if(c)return{x:c.x+1.5,y:c.y+2.6};
  const i=PONY_IDS.indexOf(id);return{x:17+i*3,y:35+i};}
function placePonies(){for(const id of PONY_IDS){const h=homeOf(id),e=ents[id];e.x=h.x+rand(-.5,.5);e.y=h.y;e.tx=null;}}

// ---------- Story interactions ----------
function ch2Grandma(){
  if(state.quest<qi('letter'))return false;
  if(qid()==='sew'&&state.inv.sunflower>=3&&state.inv.flower>=4){talk([
    ['grandma','Ooh, what pretty colors! Snip, snip, sew, sew...'],
    ()=>{state.inv.sunflower-=3;state.inv.flower-=4;state.balloon=2;sfx('sparkle');burst(PADS.valley.x,PADS.valley.y-2,'🎀',8);},
    ['grandma','Ta-da! A big rainbow balloon with pretty ribbons!']],completeQuest);return true;}
  talk([['grandma',Q[state.quest].hint]]);return true;
}
function ch2Hops(){
  if(qid()!=='basket')return false;
  if(state.inv.carrot>=5)talk([['hops','Hippity hop! Five crunchy carrots! I will make you a strong basket.'],
    ()=>{state.inv.carrot-=5;state.balloon=1;sfx('pop');burst(PADS.valley.x,PADS.valley.y-.5,'✨',8);},
    ['hops','Weave, weave, weave... Ta-da! I put the basket next to the farm, by the big road.']],completeQuest);
  else talk([['hops','I need 5 carrots to make a basket. Grow some more carrots!']]);
  return true;
}
function ch2Unicorn(){
  if(qid()!=='magic')return false;
  talk([['stardust','A balloon to the pony kingdom? I can help!'],['stardust','Sparkle, sparkle, rainbow magic!'],
    ()=>{state.balloon=3;celebrate(true);burst(PADS.valley.x,PADS.valley.y-2.5,'✨',14,1.4);}],completeQuest);
  return true;
}
function readLetter(){
  if(qid()!=='letter')return;
  talk([['narrator','The letter says...'],
    ['cloudberry','Dear Sparkle Valley friend. High above the rainbow, there is a secret kingdom where magical ponies live.'],
    ['cloudberry','But a big storm blew some of our ponies far away. Now they are lost! Please come and help us find them.'],
    ['cloudberry','Love, Princess Cloudberry.'],
    ['grandma','A pony kingdom in the sky! But how can we get all the way up there?'],
    ['grandma','Oh! I know! We can build a Rainbow Balloon!']],()=>{ents.bird.leaving=true;completeQuest();});
}
function tapBalloon(){
  if(state.balloon<2){say(N2.basket,'narrator');return;}
  if(state.balloon<3){say(N2.needMagic,'narrator');return;}
  startFlight(inClouds(player.x)?'valley':'clouds');
}
function talkPrincess(){
  const e=ents.princess;burst(e.x,e.y-1.2,'💖',4);
  if(state.quest>=qi('findTwinkle')&&state.quest<=qi('flyHome'))talk([['cloudberry',Q[state.quest].hint]]);
  else talk([['cloudberry',pick(N2.princess)]]);
}
function talkCloudPony(id){
  const e=ents[id],q=qid();e.pause=state.time+5;
  if(id==='twinkle'){
    if(q==='findTwinkle')return talk([['twinkle','Oh! Who are you? I am a little bit shy...'],
      ['twinkle','I am so hungry. Do you have a rainbow carrot? They are my favorite!']],completeQuest);
    if(q==='feedTwinkle'&&state.inv.rcarrot>0)return talk([()=>{state.inv.rcarrot--;sfx('crunch');hearts(e);},
      ['twinkle','Crunch, crunch! Yummy! You are so kind.'],['twinkle','I am not scared anymore. Will you be my friend?']],()=>namePony('twinkle'));
  }
  if(id==='peaches'&&q==='meetPeaches')return talk([['peaches','Yay! You fixed the bridge! I am Peaches!'],
    ['peaches','I was stuck here all by myself. Thank you for saving me!']],()=>namePony('peaches'));
  if(id==='puff'){
    if(q==='findPuff')return talk([['puff','Hi! I am Puff! I was playing hide and seek, and then I got lost!'],
      ['puff','My tummy is rumbly. Do you have a cloudberry?']],completeQuest);
    if(q==='feedPuff'&&state.inv.cloudberry>0)return talk([()=>{state.inv.cloudberry--;sfx('crunch');hearts(e);},
      ['puff','Yum, yum! Cloudberries are the best!'],['puff','Can I come and live with you?']],()=>namePony('puff'));
  }
  hearts(e);
  const waiting={twinkle:'feedTwinkle',peaches:'fixBridge',puff:'feedPuff'}[id];
  say(q===waiting?T2.hungry[id]:T2.shy,id);
}
function rescue(id){
  talk([['narrator',N2.goHome]],()=>{const e=ents[id];burst(e.x,e.y-.6,'🌈',8,1.2);sfx('sparkle');
    const h=homeOf(id);e.x=h.x;e.y=h.y;completeQuest();});
}
function tapBridge(){
  if(state.bridge)return;
  if(qid()==='fixBridge'&&state.inv.sunflower>=3)talk([['narrator','You put the sunflowers on the broken bridge...'],
    ()=>{state.inv.sunflower-=3;fixBridge();celebrate(true);},['narrator','Sparkle, sparkle! It turned into a rainbow bridge!']],completeQuest);
  else say(N2.bridge,'narrator');
}
function fixBridge(){state.bridge=true;rect(67,15,69,15,'r');burst(BRIDGE.x,BRIDGE.y-.5,'🌈',10,1.4);}

// ---------- Rainbow Balloon flight ----------
function startFlight(to){
  stopSpeech();closePonyMenu();placing=null;hide=null;player.path=[];player.action=null;
  flight={t:0,dur:7,to};sfx('fanfare');say(to==='clouds'?N2.up:N2.down,'narrator');refreshBar(true);
}
function landFlight(){
  const to=flight.to,pad=PADS[to];flight=null;state.balloonAt=to;
  player.x=pad.x+1.3;player.y=pad.y+.4;trail.length=0;
  const near=(e,dx)=>{e.x=player.x+dx;e.y=player.y+.3;};
  if(state.ponyFriend&&!state.riding)near(ents.pony,-1);
  if(state.uniFollow)near(ents.unicorn,-1.8);
  if(state.follower)near(ents[state.follower],1.2);
  sfx('sparkle');refreshBar(true);saveGame();
  if((to==='clouds'&&qid()==='fly')||(to==='valley'&&qid()==='flyHome'))completeQuest();
}

// ---------- Pony care ----------
function ponyAction(id,act){
  const p=state.ponies[id],e=ents[id];if(!p)return;e.pause=state.time+5;e.hop=state.time;
  if(act==='pet'){sfx('pop');burst(e.x,e.y-1,'💗',6);say(pick(T2.pet),id);addHeart(id,1);}
  else if(act==='feed'){const f=feedChoice(id);
    if(!f){sfx('nope');say(T2.feedNone,id);}
    else{state.inv[f]--;sfx('crunch');burst(e.x,e.y-1,'💗',4);const fav=f===PONIES[id].fav;say(fav?T2.feedFav:T2.feed,id);addHeart(id,fav?2:1);}}
  else if(act==='brush'){sfx('sparkle');burst(e.x,e.y-1.1,'✨',8,.8);say(pick(T2.brush),id);addHeart(id,1);}
  else if(act==='play'){
    if(id==='puff'){closePonyMenu();startHide();return;}
    e.trick=state.time;sfx('fanfare');say(pick(T2.play),id);addHeart(id,1);}
  else if(act==='follow'){
    if(state.follower===id){state.follower=null;say(T2.followOff,id);}
    else{state.follower=id;say(T2.followOn,id);}
    sfx('tap');closePonyMenu();return;}
  refreshPonyMenu();saveGame();
}
function feedChoice(id){const fav=PONIES[id].fav;if(state.inv[fav]>0)return fav;return FOODS.find(k=>state.inv[k]>keepFor(k));}
function addHeart(id,n){const p=state.ponies[id];p.hearts=Math.min(10,p.hearts+n);
  if(p.hearts>=10&&!p.best){p.best=true;p.acc=PONIES[id].acc;closePonyMenu();
    setTimeout(()=>{celebrate();talk([[id,T2.best]]);},900);}}

// ---------- Hide and seek with Puff ----------
function startHide(){
  const e=ents.puff;say(T2.hideStart,'puff');hide={phase:'count',t:state.time};e.pause=state.time+99;
  setTimeout(()=>{if(!hide)return;const spot=hideSpot();burst(e.x,e.y-.5,'💨',6);
    e.x=spot.x;e.y=spot.y;e.flip=Math.random()<.5;hide.phase='hidden';hide.t=state.time;say(N2.count,'narrator');},2600);
}
function hideSpot(){
  const cands=[],px=Math.floor(player.x),py=Math.floor(player.y);
  for(let y=py-5;y<=py+4;y++)for(let x=px-7;x<=px+7;x++){if(y<1||x<1||y>=H-1||x>=W-1)continue;
    const c=map[y][x],open=[[1,0],[-1,0],[0,1]].some(([dx,dy])=>isWalkChar(map[y+dy][x+dx],true));
    if((c==='T'||c==='p'||c==='h')&&open&&dist(x,y,px,py)>2.5)cands.push({x:x+.5+(Math.random()<.5?-.3:.3),y:y+.5});}
  for(const c of state.cottages)if(dist(c.x+1.5,c.y+1,player.x,player.y)<9)cands.push({x:c.x+(Math.random()<.5?.2:2.8),y:c.y+1.3});
  const vis=cands.filter(c=>{const sx=c.x*ts-cam.x,sy=c.y*ts-cam.y;return sx>70&&sx<vw-70&&sy>150&&sy<vh-150;});
  return vis.length?pick(vis):cands.length?pick(cands):{x:player.x+4,y:player.y};
}
function foundPuff(){const e=ents.puff;hide=null;e.pause=state.time+4;e.hop=state.time;
  e.x=player.x+1.1;e.y=player.y+.2;burst(e.x,e.y-.8,'🎉',8);celebrate(true);say(T2.found,'puff');addHeart('puff',2);saveGame();}

// ---------- Building cottages ----------
function cottageTiles(ax,ay){const t=[];for(let y=ay;y<ay+2;y++)for(let x=ax;x<ax+3;x++)t.push([x,y]);return t;}
function applyCottage(c){for(const[x,y]of cottageTiles(c.x,c.y))map[y][x]='Y';}
function villageReach(){const seen=new Uint8Array(W*H),q=[Math.floor(VILLAGE_GATE.x)+Math.floor(VILLAGE_GATE.y)*W];seen[q[0]]=1;let n=0;
  while(q.length){const c=q.pop();n++;const x=c%W,y=(c/W)|0;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=x+dx+(y+dy)*W;if(!seen[k]&&inVillage(x+dx,y+dy)&&isWalkChar(map[y+dy][x+dx],true)){seen[k]=1;q.push(k);}}}
  return n;}
function spotOK(ax,ay){
  const V=VILLAGE;if(ax<V.x0+1||ay<V.y0+1||ax+2>V.x1-1||ay+3>V.y1)return false;
  const tiles=cottageTiles(ax,ay);if(tiles.some(([x,y])=>map[y][x]!=='.'))return false;
  if(!isWalkChar(map[ay+2][ax+1],true))return false;
  if(LOG_SPOTS.some(([lx,ly])=>lx>=ax&&lx<ax+3&&ly>=ay&&ly<ay+2))return false;
  if(SIGNS.some(s=>s.x>=ax-.5&&s.x<ax+3.5&&s.y>=ay&&s.y<ay+3))return false;
  const before=villageReach();tiles.forEach(([x,y])=>map[y][x]='Y');const after=villageReach();tiles.forEach(([x,y])=>map[y][x]='.');
  return after===before-6;
}
function buildSpots(){const out=[];for(let ay=33;ay<=41;ay+=4)for(let ax=6;ax<=36;ax+=4)if(spotOK(ax,ay))out.push({x:ax,y:ay});return out;}
function startPlacing(color){placing={color,spots:buildSpots()};say(N2.tapSpot,'narrator');refreshBar(true);}
function placeAt(wx,wy){
  let best=null,bd=1.8;for(const s of placing.spots){const d=dist(wx,wy,s.x+1.5,s.y+1);if(d<bd){bd=d;best=s;}}
  if(!best){sfx('nope');say(N2.badSpot,'narrator');return;}
  const c={x:best.x,y:best.y,color:placing.color,pony:null,built:state.time};placing=null;
  state.inv.wood-=3;state.cottages.push(c);applyCottage(c);
  if(cottageTiles(c.x,c.y).some(([x,y])=>Math.floor(player.x)===x&&Math.floor(player.y)===y)){player.x=c.x+1.5;player.y=c.y+2.5;}
  player.path=[];[0,250,500,750].forEach(ms=>setTimeout(()=>sfx('crunch'),ms));burst(c.x+1.5,c.y+1.2,'✨',14,1.3);
  refreshBar(true);saveGame();
  setTimeout(()=>{const free=PONY_IDS.filter(id=>rescued(id)&&!(state.cottages[state.ponies[id].home]));
    if(free.length)openPicker(state.cottages.length-1,free);else say(N2.empty,'narrator');},1500);
}
function moveIn(ci,id){const c=state.cottages[ci];c.pony=id;state.ponies[id].home=ci;const e=ents[id];e.goHome=true;e.tx=null;
  sfx('sparkle');saveGame();}
