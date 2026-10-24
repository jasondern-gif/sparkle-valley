'use strict';
// ---------- Entities ----------
const player={x:5.5,y:7.3,path:[],action:null,flip:false,walkT:0,moving:false};
const ents={grandma:{x:7.5,y:6.9},hops:{x:17.5,y:23.6},pony:{x:6,y:16},unicorn:{x:38.5,y:18.5},kitty:{x:8,y:7.2},duck:{x:24.9,y:14.4,a:0}};
const chickens=[{x:11.6,y:13.4},{x:13.4,y:14.3},{x:12.5,y:12.8}];
const butterflies=[[14,7.5],[30,4],[36,6],[19,17],[9,20],[37,20]].map(([x,y],i)=>({bx:x,by:y,x,y,p:i*1.7}));
const trail=[];
const particles=[],confetti=[];let tapMark=null;

function burst(x,y,e,n,spread){spread=spread||1;for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-1.5,1.5)*spread,vy:rand(-3,-1)*spread,g:3,life:1.1,max:1.1,e,size:rand(.3,.45)});}
function floatText(x,y,text){particles.push({x,y,vx:0,vy:-.9,g:0,life:1.4,max:1.4,text});}
function celebrate(small){sfx('sparkle');const n=small?60:180;const cols=STARS.map(s=>s.c);
  for(let i=0;i<n;i++)confetti.push({x:rand(0,vw),y:rand(-vh*.5,-10),vx:rand(-40,40),vy:rand(120,260),r:rand(0,6),vr:rand(-6,6),c:pick(cols),life:rand(3,5)});}

// ---------- Walking & pathfinding ----------
function walkable(x,y){if(x<0||y<0||x>=W||y>=H)return false;return isWalkChar(map[y][x],state.gateOpen);}
function lineClear(a,b){const d=dist(a.x,a.y,b.x,b.y),n=Math.ceil(d/.1);
  for(let i=0;i<=n;i++){const x=a.x+(b.x-a.x)*i/n,y=a.y+(b.y-a.y)*i/n;
    for(const[ox,oy]of[[.25,0],[-.25,0],[0,.25],[0,-.25]])if(!walkable(Math.floor(x+ox),Math.floor(y+oy)))return false;}
  return true;}
function findPath(gx,gy){
  const sx=Math.floor(player.x),sy=Math.floor(player.y),tx=Math.floor(gx),ty=Math.floor(gy);
  const prev=new Int32Array(W*H).fill(-2),q=new Int32Array(W*H);let h=0,t=0;const s=sx+sy*W;prev[s]=-1;q[t++]=s;
  let best=s,bestD=dist(sx,sy,tx,ty);
  while(h<t){const c=q[h++],cx=c%W,cy=(c/W)|0;const d=dist(cx,cy,tx,ty);if(d<bestD){bestD=d;best=c;}if(d===0)break;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(!walkable(nx,ny))continue;const n=nx+ny*W;if(prev[n]!==-2)continue;prev[n]=c;q[t++]=n;}}
  const tiles=[];for(let c=best;c!==s&&c>=0;c=prev[c])tiles.push(c);tiles.reverse();
  const pts=tiles.map(c=>({x:c%W+.5,y:((c/W)|0)+.5}));
  if(best===tx+ty*W&&walkable(tx,ty)&&pts.length)pts[pts.length-1]={x:clamp(gx,tx+.3,tx+.7),y:clamp(gy,ty+.3,ty+.7)};
  const out=[];let cur={x:player.x,y:player.y},i=0;
  while(i<pts.length){let j=pts.length-1;while(j>i&&!lineClear(cur,pts[j]))j--;out.push(pts[j]);cur=pts[j];i=j+1;}
  return out;
}
function goDo(tx,ty,reach,fn,ent,fail){
  player.action={tx,ty,reach,fn,ent,fail,tries:0};
  if(dist(player.x,player.y,tx,ty)<=reach){player.path=[];player.action=null;fn();return;}
  player.path=findPath(tx,ty);
}
function trailPoint(d){let acc=0;for(let i=1;i<trail.length;i++){acc+=dist(trail[i-1].x,trail[i-1].y,trail[i].x,trail[i].y);if(acc>=d)return trail[i];}
  return trail.length?trail[trail.length-1]:null;}
function moveToward(e,tx,ty,speed,dt){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);if(d<.02){e.moving=false;return true;}
  const st=Math.min(d,speed*dt);e.x+=dx/d*st;e.y+=dy/d*st;if(Math.abs(dx)>.01)e.flip=dx<0;e.walkT=(e.walkT||0)+dt*12;e.moving=true;return d<=st+.001;}
function wander(e,dt,b,speed){if(e.pause>state.time){e.moving=false;return;}if(e.wait>0){e.wait-=dt;e.moving=false;return;}
  if(e.tx==null){e.tx=rand(b[0],b[2]);e.ty=rand(b[1],b[3]);}if(moveToward(e,e.tx,e.ty,speed,dt)){e.tx=null;e.wait=rand(1,3.5);}}
function follow(e,d,dt){const p=trailPoint(d);if(!p){e.moving=false;return;}const dd=dist(e.x,e.y,p.x,p.y);
  if(dd<.05){e.moving=false;return;}moveToward(e,p.x,p.y,dd>3?14:(state.riding?7.5:5),dt);}

// ---------- Tapping ----------
function tapWorld(sx,sy){
  if(flight)return;
  const wx=(sx+cam.x)/ts,wy=(sy+cam.y)/ts;tapMark={x:wx,y:wy,life:.5};
  if(ch2Tap(wx,wy))return;
  for(const sg of SIGNS)if(Math.abs(wx-sg.x)<1.2&&wy>sg.y-1.05&&wy<sg.y-.25){sg.hit=state.time;sfx('tap');say(sg.text,'narrator',sg);return;}
  if(state.riding&&dist(wx,wy,player.x,player.y-.6)<.8){toggleRide();return;}
  const cands=[['grandma',interactGrandma,1.6],['hops',interactHops,1.6],['unicorn',interactUnicorn,1.6]];
  if(!state.riding)cands.push(['pony',interactPony,1.5]);
  let best=null,bd=.8;
  for(const[k,fn,reach]of cands){const e=ents[k];const d=dist(wx,wy,e.x,e.y-.45);if(d<bd){bd=d;best={e,fn,reach};}}
  for(const c of chickens){const d=dist(wx,wy,c.x,c.y-.25);if(d<Math.min(bd,.6)){bd=d;best={e:c,fn:()=>{sfx('cluck');hearts(c);},reach:1.4};}}
  if(state.decor.kitty){const k=ents.kitty,d=dist(wx,wy,k.x,k.y-.25);if(d<Math.min(bd,.6)){bd=d;best={e:k,fn:()=>{sfx('meow');hearts(k);},reach:1.4};}}
  {const k=ents.duck,d=dist(wx,wy,k.x,k.y-.2);if(d<Math.min(bd,.7)){sfx('quack');burst(k.x,k.y-.5,'💙',3);return;}}
  if(best){const e=best.e;e.pause=state.time+6;
    goDo(e.x,e.y,best.reach,best.fn,e,e===ents.unicorn&&!state.gateOpen?interactUnicorn:null);return;}
  const tx=Math.floor(wx),ty=Math.floor(wy);if(tx<0||ty<0||tx>=W||ty>=H)return;
  if(qid()==='stars')for(let i=0;i<STARS.length;i++){const st=STARS[i];if(!state.stars.includes(i)&&dist(wx,wy,st.x,st.y-.3)<.8){goDo(st.x,st.y,.6,()=>{if(!state.stars.includes(i))collectStar(i);});return;}}
  for(let i=0;i<state.eggs.length;i++){const e=state.eggs[i];if(dist(wx,wy,e.x,e.y)<.6){goDo(e.x,e.y,.6,()=>{const j=state.eggs.indexOf(e);if(j>=0)collectEgg(j);});return;}}
  for(let i=0;i<wildFlowers.length;i++){const f=wildFlowers[i];if(flowerUp(i)&&dist(wx,wy,f.x,f.y)<.6){goDo(f.x,f.y,.6,()=>{if(flowerUp(i))collectFlower(i);});return;}}
  if(map[ty][tx]==='K'){goDo(STONE.x,STONE.y,1.5,interactStone);return;}
  if(map[ty][tx]==='S'){goDo(tx+.5,ty+.5,1.3,()=>interactSoil(tx,ty));return;}
  if(map[ty][tx]==='M'){goDo(ents.hops.x,ents.hops.y,1.6,interactHops);return;}
  player.action=null;player.path=findPath(wx,wy);
}
const flowerUp=i=>!(state.flowerAt[i]>state.time);

// ---------- Quest target for the helper arrow ----------
function nearest(list){let b=null,bd=1e9;for(const p of list){const d=dist(player.x,player.y,p.x,p.y);if(d<bd){bd=d;b=p;}}return b;}
function plotList(f){return Object.entries(state.plots).filter(([k,p])=>f(p)).map(([k])=>{const[x,y]=k.split(',').map(Number);return{x:x+.5,y:y+.5};});}
const FARM={x:12.5,y:5};
function questTarget(){
  switch(qid()){
    case 'meet':case 'crown':return ents.grandma;
    case 'plant':return Object.keys(state.plots).length?FARM:{x:10.5,y:4.5};
    case 'water':return nearest(plotList(p=>!p.w))||FARM;
    case 'harvest':case 'berries':return nearest(plotList(p=>stageOf(p)>=3))||nearest(plotList(p=>!p.w))||FARM;
    case 'pony':return state.inv.carrot>0?ents.pony:(nearest(plotList(p=>stageOf(p)>=3))||FARM);
    case 'eggs':return nearest(state.eggs)||{x:12.5,y:13.5};
    case 'market':return ents.hops;
    case 'flowers':return nearest(wildFlowers.filter((f,i)=>flowerUp(i)))||{x:34,y:5};
    case 'unicorn':return ents.unicorn;
    case 'feedUni':return state.inv.strawberry>0?ents.unicorn:(nearest(plotList(p=>stageOf(p)>=3))||FARM);
    case 'stars':return nearest(STARS.filter((s,i)=>!state.stars.includes(i)));
    case 'finale':return STONE;
  }return ch2Target();
}

// ---------- Update ----------
let saveT=0,eggT=0;
function update(dt){
  state.time+=dt;
  if(flight){flightUpdate(dt);return;}
  // player
  const speed=state.riding?6.5:4;
  if(player.path.length){const p=player.path[0];if(moveToward(player,p.x,p.y,speed,dt))player.path.shift();}else player.moving=false;
  if(player.moving&&(!trail.length||dist(trail[0].x,trail[0].y,player.x,player.y)>.1)){trail.unshift({x:player.x,y:player.y});if(trail.length>150)trail.pop();}
  const a=player.action;
  if(a){if(a.ent){a.tx=a.ent.x;a.ty=a.ent.y;}
    if(dist(player.x,player.y,a.tx,a.ty)<=a.reach){player.path=[];player.action=null;a.fn();}
    else if(!player.path.length){if(a.ent&&a.tries<3){a.tries++;player.path=findPath(a.tx,a.ty);if(!player.path.length){player.action=null;a.fail&&a.fail();}}
      else{player.action=null;a.fail&&a.fail();}}}
  // friends
  if(state.ponyFriend){if(state.riding){ents.pony.x=player.x;ents.pony.y=player.y;}else follow(ents.pony,1.2,dt);}
  else wander(ents.pony,dt,[3.6,14.6,7.4,17.6],1.2);
  if(state.uniFollow)follow(ents.unicorn,state.ponyFriend&&!state.riding?2.5:1.3,dt);
  else wander(ents.unicorn,dt,[35,16,40.5,21],.9);
  for(const c of chickens)wander(c,dt,[11.3,12.8,14.7,14.8],.8);
  if(state.decor.kitty)wander(ents.kitty,dt,[6.5,6.4,9.5,7.6],1.4);
  const d=ents.duck;d.a+=dt*.35;const nx=24.9+Math.cos(d.a)*1.7,ny=14.4+Math.sin(d.a)*1.1;d.flip=nx<d.x;d.x=nx;d.y=ny;
  for(const b of butterflies){b.x=b.bx+Math.sin(state.time*.5+b.p)*1.6;b.y=b.by+Math.sin(state.time*.8+b.p*2)*.8;}
  // crops grow
  for(const k in state.plots){const p=state.plots[k];if(p.w&&p.g<GROW*2)p.g=Math.min(GROW*2,p.g+dt);}
  // chickens lay eggs
  eggT+=dt;if(eggT>6){eggT=0;if(state.eggs.length<3){const c=pick(chickens);state.eggs.push({x:clamp(c.x+rand(-.3,.3),11.3,14.7),y:clamp(c.y,12.6,14.8)});sfx('cluck');}}
  // walk-over pickups
  for(let i=state.eggs.length-1;i>=0;i--)if(dist(player.x,player.y,state.eggs[i].x,state.eggs[i].y)<.55)collectEgg(i);
  wildFlowers.forEach((f,i)=>{if(flowerUp(i)&&dist(player.x,player.y,f.x,f.y)<.5)collectFlower(i);});
  if(qid()==='stars')STARS.forEach((s,i)=>{if(!state.stars.includes(i)&&dist(player.x,player.y,s.x,s.y)<.65)collectStar(i);});
  // story triggers by walking close
  if(!dlgOpen&&!player.action){
    if(qid()==='unicorn'&&state.gateOpen&&dist(player.x,player.y,ents.unicorn.x,ents.unicorn.y)<2){player.path=[];interactUnicorn();}
    else if(qid()==='finale'&&dist(player.x,player.y,STONE.x,STONE.y)<1.7){player.path=[];interactStone();}
  }
  ch2Update(dt);
  checkQuest();
  // effects
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;if(p.life<=0)particles.splice(i,1);}
  for(let i=confetti.length-1;i>=0;i--){const c=confetti[i];c.life-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=c.vr*dt;if(c.life<=0||c.y>vh+20)confetti.splice(i,1);}
  if(state.rainbow&&Math.random()<dt*3){const u=ents.unicorn;particles.push({x:u.x+rand(-.5,.5),y:u.y-rand(.3,1.2),vx:0,vy:-.4,g:0,life:1,max:1,e:'✨',size:.25});}
  if(tapMark){tapMark.life-=dt;if(tapMark.life<=0)tapMark=null;}
  saveT+=dt;if(saveT>3){saveT=0;saveGame();}
  refreshBar(false);
}

// ---------- Render ----------
const UNI_SAD=['#d8d0e8','#cfc6e0'],UNI_HAPPY=['#ffc2e2','#c9b6ff','#bfe6ff','#fff2a8'];
function render(){
  const t=state.time;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(flight){drawFlight(t);return;}
  const A=inClouds(player.x)?CLOUD_AREA:GROUND_AREA,aw=(A.x1-A.x0)*ts,ah=(A.y1-A.y0)*ts;
  cam.x=aw<vw?A.x0*ts-(vw-aw)/2:clamp(player.x*ts-vw/2,A.x0*ts,A.x1*ts-vw);
  cam.y=ah<vh?A.y0*ts-(vh-ah)/2:clamp(player.y*ts-vh/2,A.y0*ts,A.y1*ts-vh);
  if(A===CLOUD_AREA)drawBackdrop();else{ctx.fillStyle='#4f9a3e';ctx.fillRect(0,0,vw,vh);}
  const x0=Math.max(0,Math.floor(cam.x/ts)),y0=Math.max(0,Math.floor(cam.y/ts)),x1=Math.min(W-1,Math.ceil((cam.x+vw)/ts)),y1=Math.min(H-1,Math.ceil((cam.y+vh)/ts));
  drawGround(x0,y0,x1,y1,t);
  ch2Ground(t,x0,y0,x1,y1);
  const s=ts;
  // crops
  for(const k in state.plots){const[x,y]=k.split(',').map(Number);if(x<x0-1||x>x1+1||y<y0-1||y>y1+1)continue;
    const p=state.plots[k],st=stageOf(p),cx=SX(x)+s/2,cy=SY(y)+s/2;
    if(st===0){ctx.fillStyle='#4a2c1a';for(let i=0;i<3;i++){circ(cx+(i-1)*s*.15,cy+(i%2)*s*.06,s*.04);ctx.fill();}}
    else{const sz=[0,.42,.58,.72][st]*s,b=st===3?Math.sin(t*4+x)*s*.04:0;drawCrop(p.c,st,cx,cy-s*.1+b,sz,t);
      if(st===3&&Math.sin(t*3+x*2+y)>.7)drawStar(cx+s*.3,cy-s*.35,s*.07,'#fff6a8',true);}
    if(!p.w){const b=Math.sin(t*4+x)*s*.05;ctx.fillStyle='rgba(255,255,255,.9)';circ(cx+s*.25,cy-s*.4+b,s*.17);ctx.fill();drawEmoji('💧',cx+s*.25,cy-s*.4+b,s*.24);}
  }
  for(const e of state.eggs)drawEmoji('🥚',SX(e.x),SY(e.y)-s*.1,s*.34);
  wildFlowers.forEach((f,i)=>{if(flowerUp(i))drawEmoji(f.e,SX(f.x),SY(f.y)-s*.15+Math.sin(t*2+i)*s*.02,s*.45);});
  {const d=ents.duck;drawEmoji('🦆',SX(d.x),SY(d.y)-s*.15,s*.5,!d.flip);}
  if(qid()==='stars')STARS.forEach((st,i)=>{if(!state.stars.includes(i))drawStar(SX(st.x),SY(st.y)-s*.35+Math.sin(t*3+i)*s*.08,s*.26,st.c,true);});
  if(tapMark){ctx.strokeStyle=`rgba(255,255,255,${tapMark.life*1.6})`;ctx.lineWidth=3;circ(SX(tapMark.x),SY(tapMark.y),s*(.5-tapMark.life*.5));ctx.stroke();}
  // y-sorted things
  const L=[];
  for(let y=Math.max(0,y0-1);y<=Math.min(H-1,y1+2);y++)for(let x=Math.max(0,x0-1);x<=Math.min(W-1,x1+1);x++){const c=map[y][x];
    if(c==='T')L.push([y+.9,()=>drawTree(x,y)]);else if(c==='F')L.push([y+.55,()=>drawFence(x,y)]);else if(c==='G')L.push([y+.55,()=>drawGate(x,y,t)]);}
  for(const sg of SIGNS)if(sg.x>x0-3&&sg.x<x1+3&&sg.y>y0-1&&sg.y<y1+3)L.push([sg.y,()=>drawSign(sg,t)]);
  L.push([6,drawHouse],[14,drawBarn],[23,drawMarket],[14.95,()=>drawStone(t)],[13,()=>drawEmoji('🛖',SX(14.5),SY(12.4),s*1.15)]);
  if(state.decor.tulips)[[18.6,6.7],[19.4,6.5],[20.2,6.75],[21,6.5],[21.8,6.7]].forEach(([x,y])=>L.push([y,()=>drawEmoji('🌷',SX(x),SY(y)-s*.25,s*.55)]));
  const big=(e,x,y,z)=>L.push([y,()=>{shadow(SX(x),SY(y),s*z*.4,s*z*.1);drawEmoji(e,SX(x),SY(y)-s*z*.45,s*z);}]);
  if(state.decor.fountain)big('⛲',20.6,5.4,1.6);if(state.decor.carousel)big('🎠',23.6,5.5,1.9);if(state.decor.castle)big('🏰',26.6,5.7,2.8);
  if(state.decor.kitty){const k=ents.kitty;L.push([k.y,()=>{shadow(SX(k.x),SY(k.y),s*.2,s*.06);drawEmoji('🐈',SX(k.x),SY(k.y)-s*.25,s*.5,!k.flip);}]);}
  for(const c of chickens)L.push([c.y,()=>{shadow(SX(c.x),SY(c.y),s*.18,s*.05);drawEmoji('🐔',SX(c.x),SY(c.y)-s*.25+(c.moving?Math.abs(Math.sin(c.walkT))*-s*.05:0),s*.5,!c.flip);}]);
  const g=ents.grandma;L.push([g.y,()=>drawPerson(SX(g.x),SY(g.y),'👵','#a77bd8',player.x<g.x,0,false)]);
  const hp=ents.hops;L.push([hp.y,()=>drawPerson(SX(hp.x),SY(hp.y),'🐰','#7cc6ff',false,0,false,{apron:true})]);
  const pony=ents.pony,ponyOpts=()=>({body:'#ffe08a',mane:['#ff8cc6','#ff6fb5'],hoof:'#a0643a',snout:'#ffd0a0',bow:!!state.decor.bow});
  const u=ents.unicorn;
  L.push([u.y,()=>drawHorse(SX(u.x),SY(u.y),{body:state.rainbow?'#fff':'#f1eef6',mane:state.rainbow?STARS.map(x=>x.c):state.uniFollow?UNI_HAPPY:UNI_SAD,
    hoof:'#c9b6ff',snout:'#ffe1ef',horn:true,hornColor:state.rainbow||state.uniFollow?'#ffd34d':'#ddd2a8',crown:state.uniCrown,flip:u.flip,walkT:u.walkT,moving:u.moving})]);
  if(state.riding){L.push([player.y,()=>{const o=ponyOpts();o.flip=player.flip;o.walkT=player.walkT;o.moving=player.moving;drawHorse(SX(player.x),SY(player.y),o);
    drawPerson(SX(player.x)+(player.flip?s*.05:-s*.05),SY(player.y)-s*.36,state.hero,state.dress,player.flip,0,false,{seated:true});}]);}
  else{L.push([pony.y,()=>{const o=ponyOpts();o.flip=pony.flip;o.walkT=pony.walkT;o.moving=pony.moving;drawHorse(SX(pony.x),SY(pony.y),o);}]);
    L.push([player.y,()=>drawPerson(SX(player.x),SY(player.y),state.hero,state.dress,player.flip,player.walkT,player.moving)]);}
  ch2Layer(L,t,x0,y0,x1,y1);
  L.sort((a,b)=>a[0]-b[0]);for(const[,f]of L)f();
  for(const b of butterflies)if(b.x*s>cam.x-s&&b.x*s<cam.x+vw+s)drawEmoji('🦋',SX(b.x),SY(b.y)-s*.8,s*.35*(.8+.2*Math.abs(Math.sin(t*10+b.p))));
  for(const p of particles){const al=clamp(p.life/p.max*1.5,0,1);
    if(p.draw)p.draw(p,al);
    else if(p.e)drawEmoji(p.e,SX(p.x),SY(p.y),s*p.size,false,al);
    else{ctx.save();ctx.globalAlpha=al;ctx.font=`bold ${Math.round(s*.36)}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#fff';
      ctx.strokeText(p.text,SX(p.x),SY(p.y));ctx.fillStyle='#d94f9b';ctx.fillText(p.text,SX(p.x),SY(p.y));ctx.restore();}}
  drawRainbow();
  const tg=!dlgOpen&&questTarget();if(tg&&dist(player.x,player.y,tg.x,tg.y)>1.4)drawArrow(tg.x,tg.y-(tg===ents.grandma||tg===ents.hops||tg===ents.pony||tg===ents.unicorn?.6:0),t,Q[state.quest].icon);
  for(const c of confetti){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.r);ctx.fillStyle=c.c;ctx.fillRect(-6,-3,12,6);ctx.restore();}
}

// ---------- HUD bar ----------
let barSig='';
function refreshBar(force){
  $('coins').textContent='🪙 '+state.coins;
  const sig=JSON.stringify([state.inv,state.seeds,state.seed,state.ponyFriend,state.riding,seedsHere(),!!placing,!!flight,inVillage(player.x,player.y),Object.keys(state.ponies).length,qid()]);
  if(!force&&sig===barSig)return;barSig=sig;
  const bar=$('bar');let h='';
  const sh=seedsHere();if(sh.length&&!sh.includes(state.seed))state.seed=sh[0];
  for(const k of sh)h+=`<button class="slot ${state.seed===k?'sel':''}" data-seed="${k}"><span class="lbl">seeds</span>${iconHTML(k)}</button>`;
  if(sh.length)h+='<div class="sep"></div>';
  for(const k of Object.keys(ICON))if(state.inv[k]>0)h+=`<button class="slot" data-item="${k}">${iconHTML(k)}<span class="n">${state.inv[k]}</span></button>`;
  if(inVillage(player.x,player.y)&&Object.keys(state.ponies).length)h+=`<div class="sep"></div><button class="slot hammer ${qid()==='build'&&state.inv.wood>=3&&!placing?'pulse':''}" data-build="1"><span class="lbl">${placing?'stop':'build'}</span>${placing?'✖':'🔨'}</button>`;
  if(state.ponyFriend)h+=`<div class="sep"></div><button class="slot ride" data-ride="1"><span class="lbl">${state.riding?'walk':'ride'}</span>${state.riding?'🚶':'🐴'}</button>`;
  bar.innerHTML=h;bar.style.display=dlgOpen||!started||flight?'none':'flex';
  bar.querySelectorAll('[data-seed]').forEach(b=>b.onpointerdown=e=>{e.stopPropagation();state.seed=b.dataset.seed;sfx('tap');say(CROPS[state.seed].name+' seeds','narrator');refreshBar(true);});
  bar.querySelectorAll('[data-item]').forEach(b=>b.onpointerdown=e=>{e.stopPropagation();sfx('tap');say(ITEM_NAMES[b.dataset.item],'narrator');});
  bar.querySelectorAll('[data-build]').forEach(b=>b.onpointerdown=e=>{e.stopPropagation();sfx('tap');openBuild();});
  bar.querySelectorAll('[data-ride]').forEach(b=>b.onpointerdown=e=>{e.stopPropagation();toggleRide();});
}
// Adds a 🔊 button to every element with data-say, so any text on screen can be read out loud.
function addSayButtons(root){
  root.querySelectorAll('[data-say]').forEach(el=>{
    if(el.querySelector(':scope > .sayBtn'))return;
    const b=document.createElement('button');b.className='sayBtn';b.textContent='🔊';b.setAttribute('aria-label','Read out loud');
    b.addEventListener('pointerdown',e=>e.stopPropagation());
    b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();initAudio();say(el.dataset.say,el.dataset.who||'narrator',el);});
    el.appendChild(b);});
}

// ---------- Start screen & menu ----------
let started=false;
const HEROES=['👧','👧🏻','👧🏼','👧🏽','👧🏾','👧🏿','👸','🧚‍♀️','👦'],DRESSES=['#ff7eb6','#a77bd8','#5fb8ff','#ffd34d','#6fd38a','#ff8a5c'];
let pickHero=HEROES[0],pickDress=DRESSES[0];
function buildStart(){
  const saved=loadGame();
  $('continueWrap').style.display=saved?'block':'none';$('newWrap').style.display=saved?'none':'block';
  $('heroes').innerHTML=HEROES.map(h=>`<button class="choice ${h===pickHero?'sel':''}" data-h="${h}">${h}</button>`).join('');
  $('colors').innerHTML=DRESSES.map(c=>`<button class="swatch ${c===pickDress?'sel':''}" data-c="${c}" style="background:${c}"></button>`).join('');
  $('heroes').querySelectorAll('button').forEach(b=>b.onclick=()=>{pickHero=b.dataset.h;initAudio();sfx('tap');buildStartSel();});
  $('colors').querySelectorAll('button').forEach(b=>b.onclick=()=>{pickDress=b.dataset.c;initAudio();sfx('tap');buildStartSel();});
  $('continueBtn').onclick=()=>{state=loadGame()||defaultState();begin(false);};
  $('newBtn').onclick=()=>{$('continueWrap').style.display='none';$('newWrap').style.display='block';};
  $('playBtn').onclick=()=>{state=defaultState();state.hero=pickHero;state.dress=pickDress;state.name=($('nameIn').value.trim()||'Friend').slice(0,14);begin(true);};
}
function buildStartSel(){
  $('heroes').querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.h===pickHero));
  $('colors').querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.c===pickDress));
}
function begin(isNew){
  initAudio();started=true;$('start').style.display='none';$('hud').style.display='flex';
  player.x=state.px;player.y=state.py;player.path=[];player.action=null;trail.length=0;
  if(state.ponyFriend&&!state.riding){ents.pony.x=player.x-1;ents.pony.y=player.y;}
  if(state.uniFollow){ents.unicorn.x=player.x-1.6;ents.unicorn.y=player.y+.2;}
  if(isNew)ch2Begin(true);
  updateObjective();refreshBar(true);updateMenu();
  if(isNew)talk([['narrator',"Once upon a time, {name} came to visit Grandma's farm in Sparkle Valley."],
    ['narrator','Tap on the grass to walk. Tap on things to use them!'],
    ['narrator',"Look! There's Grandma. Tap on her to say hi!"]],()=>{updateObjective();sayObjective();});
  else{talk([['narrator','Welcome back, {name}!']]);ch2Begin(false);talk([],()=>sayObjective());}
  saveGame();
}
function updateMenu(){$('voiceBtn').textContent=state.settings.voice?'🔊 Voice: ON':'🔇 Voice: OFF';$('musicBtn').textContent=state.settings.music?'🎵 Music: ON':'🎵 Music: OFF';}

// ---------- Wiring ----------
canvas.addEventListener('pointerdown',e=>{if(!started)return;initAudio();if(dlgOpen){advanceDlg();return;}tapWorld(e.clientX,e.clientY);});
$('dialog').addEventListener('pointerdown',e=>{e.stopPropagation();advanceDlg();});
$('dlgSay').addEventListener('pointerdown',e=>{e.stopPropagation();if(curLine)say(curLine[2],curLine[0],$('dlgText'));});
$('objSay').onclick=()=>{initAudio();sayObjective();};
$('coins').onclick=()=>{initAudio();sfx('coin');say(COINS_SAY,'narrator');};
$('menuBtn').onclick=()=>{updateMenu();$('menu').classList.add('show');};
$('menuClose').onclick=()=>$('menu').classList.remove('show');
$('shopClose').onclick=closeShop;
$('voiceBtn').onclick=()=>{state.settings.voice=!state.settings.voice;if(!state.settings.voice)stopSpeech();else say('Voice is on!');updateMenu();saveGame();};
$('musicBtn').onclick=()=>{state.settings.music=!state.settings.music;updateMenu();saveGame();};
$('resetBtn').onclick=()=>{if(confirm('Start over from the beginning? All progress will be lost.')){localStorage.removeItem(SAVE_KEY);location.reload();}};
document.addEventListener('touchmove',e=>{if(!e.target.closest('.box,#start'))e.preventDefault();},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)saveGame();});
window.addEventListener('resize',resize);

let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;hlTick();if(started)update(dt);render();requestAnimationFrame(frame);}
ch2Init();resize();buildStart();addSayButtons(document);requestAnimationFrame(frame);
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__game={get state(){return state;},player,ents,Q,completeQuest,map};

