'use strict';
// ---------- Chapter 2: per-frame update, tapping, guiding arrow ----------
const logUp=i=>!(state.logsAt[i]>state.time);
function onScreen(x,y){const sx=x*ts-cam.x,sy=y*ts-cam.y;return sx>-ts&&sx<vw+ts&&sy>-ts&&sy<vh+ts;}
function flightUpdate(dt){flight.t+=dt;if(flight.t>=flight.dur)landFlight();}

function ch2Update(dt){
  const t=state.time,q=qid();
  // bluebird with the letter
  const b=ents.bird;
  if(q==='letter'&&!b.leaving){if(dist(b.x,b.y,player.x,player.y)>12){b.x=player.x+6;b.y=player.y-4;}
    moveToward(b,player.x+1.6+Math.sin(t*.9)*.4,player.y-1.2+Math.sin(t*2.3)*.25,5,dt);}
  else if(b.leaving){b.x+=dt*5;b.y-=dt*4;}
  // ponies
  for(const id of PONY_IDS){const e=ents[id],p=state.ponies[id];
    if(!p){e.moving=false;if(!(e.pause>t)&&Math.random()<dt*.3)e.flip=!e.flip;continue;}
    if(hide&&id==='puff'){e.moving=false;continue;}
    if(state.follower===id){follow(e,3.3,dt);continue;}
    if(e.visitUntil>t){if(dist(e.x,e.y,player.x,player.y)>1.9)moveToward(e,player.x+1.3,player.y+.2,5.5,dt);else e.moving=false;continue;}
    const h=homeOf(id);
    if(dist(e.x,e.y,h.x,h.y)>6&&!onScreen(e.x,e.y)){e.x=h.x;e.y=h.y;e.tx=null;}
    if(e.goHome){if(moveToward(e,h.x,h.y,3,dt)){e.goHome=false;e.hop=t;burst(e.x,e.y-.9,'💗',6);sfx('sparkle');talk([[id,T2.thanks]]);}continue;}
    if(dist(e.x,e.y,h.x,h.y)>6){moveToward(e,h.x,h.y,3,dt);continue;}
    wander(e,dt,[h.x-2.6,h.y-.4,h.x+2.6,h.y+1.6],1.1);
    if(!e.emoteAt||t>e.emoteAt){e.emoteAt=t+rand(7,14);e.emote={e:pick(['💗','🎵','✨',ICON[PONIES[id].fav]]),until:t+2};}
  }
  // wood logs in the village
  if(inVillage(player.x,player.y))LOG_SPOTS.forEach(([x,y],i)=>{if(logUp(i)&&dist(player.x,player.y,x,y)<.6)takeLog(i);});
  // hide and seek
  if(hide&&hide.phase==='hidden'){const e=ents.puff;
    if(dist(player.x,player.y,e.x,e.y)<1.4)foundPuff();
    else if(t-hide.t>16&&!hide.hinted){hide.hinted=true;say(N2.hint,'narrator');}
    else if(Math.random()<dt*(hide.hinted?1.6:.4))particles.push({x:e.x+rand(-.3,.3),y:e.y-rand(.4,.9),vx:0,vy:-.5,g:0,life:.9,max:.9,e:'✨',size:.22});}
  // story triggers by walking close
  if(!dlgOpen&&!player.action&&!flight){
    const near=(id,r)=>dist(player.x,player.y,ents[id].x,ents[id].y)<r;
    if((q==='findTwinkle'&&near('twinkle',2))||(q==='meetPeaches'&&near('peaches',2))||(q==='findPuff'&&near('puff',2.4))){
      player.path=[];talkCloudPony(q==='findTwinkle'?'twinkle':q==='meetPeaches'?'peaches':'puff');}
  }
  if(q==='findPuff'){let bi=0,bd=1e9;hoofprints.forEach((h,i)=>{const d=dist(h.x,h.y,player.x,player.y);if(d<bd){bd=d;bi=i;}});if(bd<2.5)printIdx=Math.max(printIdx,bi);}
  const vs=SIGNS.find(s=>s.village);vs.text=state.cottages.length?N2.villageSign:'Future Home of Pony Village!';
  if(menuPony){positionPonyMenu();updateCooldowns();}
}
function takeLog(i){const[x,y]=LOG_SPOTS[i];state.logsAt[i]=state.time+25;state.inv.wood++;sfx('harvest');floatText(x,y-.3,'+1 🪵');
  if(state.inv.wood===3&&qid()==='build')say(N2.woodReady,'narrator');}

// Returns true when the tap was used by chapter 2
function ch2Tap(wx,wy){
  if(placing){placeAt(wx,wy);return true;}
  if(menuPony){const e=ents[menuPony];const onIt=dist(wx,wy,e.x,e.y-.5)<.9;closePonyMenu();if(onIt)return true;}
  const near=(x,y,r)=>dist(wx,wy,x,y)<r;
  if(hide&&hide.phase==='hidden'&&near(ents.puff.x,ents.puff.y-.4,1.2)){foundPuff();return true;}
  const b=ents.bird;if(qid()==='letter'&&!b.leaving&&near(b.x,b.y,1)){goDo(b.x,b.y+1.2,2,readLetter,b);return true;}
  const pad=PADS[state.balloonAt||'valley'];
  const coreEnt=['grandma','hops','unicorn','pony'].some(k=>dist(wx,wy,ents[k].x,ents[k].y-.45)<.8);
  if(!coreEnt&&state.balloon>=1&&areaAt(pad.x,pad.y)===areaAt(player.x,player.y)&&Math.abs(wx-pad.x)<1.1&&wy>pad.y-3.6&&wy<pad.y+.3){
    goDo(pad.x+1.2,pad.y+.3,1.4,tapBalloon);return true;}
  if(inClouds(player.x)){
    const pr=ents.princess;if(near(pr.x,pr.y-.6,1)){goDo(pr.x,pr.y+.4,1.6,talkPrincess);return true;}
    if(!state.bridge&&wx>66.5&&wx<70.5&&wy>14&&wy<16.6){goDo(66.4,15.5,1.4,tapBridge);return true;}
  }
  for(const id of PONY_IDS){const e=ents[id];if(!sameArea(e,player)||!near(e.x,e.y-.5,.9))continue;
    if(!rescued(id)){if(id==='peaches'&&!state.bridge){talkCloudPony(id);return true;}goDo(e.x,e.y,1.6,()=>talkCloudPony(id),e);return true;}
    e.pause=state.time+6;goDo(e.x,e.y,1.6,()=>openPonyMenu(id),e);return true;}
  if(inVillage(wx,wy))for(let i=0;i<LOG_SPOTS.length;i++){const[x,y]=LOG_SPOTS[i];if(logUp(i)&&near(x,y,.7)){goDo(x,y,.6,()=>{if(logUp(i))takeLog(i);});return true;}}
  return false;
}

// ---------- Guiding arrow ----------
function cropTarget(kind){
  const cl=inClouds(player.x),here=p=>inClouds(p.x)===cl;
  const mine=(f)=>Object.entries(state.plots).filter(([k,p])=>p.c===kind&&f(p)).map(([k])=>{const[x,y]=k.split(',').map(Number);return{x:x+.5,y:y+.5};}).filter(here);
  const ripe=nearest(mine(p=>stageOf(p)>=3));if(ripe)return ripe;
  const dry=nearest(mine(p=>!p.w));if(dry)return dry;
  const growing=nearest(mine(()=>true));if(growing)return growing;
  const farm=cl?{x0:50,y0:17,x1:54,y1:18}:{x0:9,y0:3,x1:16,y1:6},free=[];
  for(let y=farm.y0;y<=farm.y1;y++)for(let x=farm.x0;x<=farm.x1;x++)if(!state.plots[x+','+y])free.push({x:x+.5,y:y+.5});
  return nearest(free)||(cl?{x:52.5,y:17.5}:FARM);
}
const above=(e,h)=>({x:e.x,y:e.y-(h||.6)});
function ch2Target(){
  const q=qid(),cl=inClouds(player.x),pad=areaPad(),padT={x:pad.x,y:pad.y-1.6};
  const needClouds=['findTwinkle','feedTwinkle','fixBridge','meetPeaches','findPuff','feedPuff','flyHome'].includes(q);
  if(needClouds&&!cl)return padT;
  switch(q){
    case 'letter':return ents.bird.leaving?null:above(ents.bird,.2);
    case 'basket':return state.inv.carrot>=5?above(ents.hops):cropTarget('carrot');
    case 'sew':return state.inv.sunflower<3?cropTarget('sunflower'):state.inv.flower<4?(nearest(wildFlowers.filter((f,i)=>flowerUp(i)))||{x:34,y:5}):above(ents.grandma);
    case 'magic':return above(ents.unicorn);
    case 'fly':return padT;
    case 'findTwinkle':return above(ents.twinkle);
    case 'feedTwinkle':return state.inv.rcarrot>0?above(ents.twinkle):cropTarget('rcarrot');
    case 'fixBridge':return state.inv.sunflower>=3?BRIDGE:cropTarget('sunflower');
    case 'meetPeaches':return above(ents.peaches);
    case 'findPuff':return hoofprints[Math.min(hoofprints.length-1,printIdx+3)];
    case 'feedPuff':return state.inv.cloudberry>0?above(ents.puff):cropTarget('cloudberry');
    case 'flyHome':return padT;
    case 'build':case 'friends':{
      if(cl)return padT;
      if(hide)return null;
      if(!inVillage(player.x,player.y))return VILLAGE_GATE;
      if(q==='friends'){const p=nearest(PONY_IDS.filter(id=>rescued(id)&&state.ponies[id].hearts<10).map(id=>ents[id]));return p?above(p):null;}
      if(state.inv.wood<3)return nearest(LOG_SPOTS.map(([x,y],i)=>({x,y,i})).filter(o=>logUp(o.i)));
      return null;}
  }
  return null;
}

function ch2Begin(isNew){
  if(!walkable(Math.floor(player.x),Math.floor(player.y))){player.x=5.5;player.y=7.3;}
  if(!state.balloonAt||!PADS[state.balloonAt])state.balloonAt=areaAt(player.x,player.y);
  if(!PADS[state.balloonAt])state.balloonAt='valley';
  if(state.bridge)rect(67,15,69,15,'r');
  placePonies();
  if(!isNew&&qid()==='letter'&&!state.ch2seen)talk(Q[state.quest].start);
  if(!isNew&&rescued('puff')&&areaAt(player.x,player.y)==='valley'){const e=ents.puff;e.x=player.x+5;e.y=player.y+.3;e.visitUntil=state.time+40;
    talk([['puff',T2.greet]]);}
}
