'use strict';
// ---------- Chapter 2 drawing: scene layers and the balloon flight ----------
function ch2Ground(t,x0,y0,x1,y1){
  const s=ts;
  if(inClouds(player.x))for(let y=Math.max(0,y0);y<=Math.min(29,y1);y++)for(let x=Math.max(45,x0);x<=x1;x++){if(map[y][x]!=='S')continue;
    const p=state.plots[x+','+y],wet=p&&p.w&&stageOf(p)<3,sx=SX(x),sy=SY(y);
    ctx.fillStyle=wet?'#a993d9':'#cbb8ef';rr(sx+s*.06,sy+s*.08,s*.88,s*.84,s*.18);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=Math.max(1,s*.03);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.18)';rr(sx+s*.16,sy+s*.16,s*.68,s*.2,s*.1);ctx.fill();}
  if(!rescued('puff')&&inClouds(player.x))hoofprints.forEach((h,i)=>{if(h.x<x0-1||h.x>x1+1||h.y<y0-1||h.y>y1+1)return;
    const a=.55+.35*Math.sin(t*3-i*.6),hx=SX(h.x),hy=SY(h.y);ctx.fillStyle=`rgba(255,200,60,${a})`;
    ctx.beginPath();ctx.ellipse(hx,hy,s*.1,s*.13,0,Math.PI*.15,Math.PI*1.85,true);ctx.lineWidth=s*.05;ctx.strokeStyle=ctx.fillStyle;ctx.stroke();
    if(Math.sin(t*2+i)>.85)drawStar(hx,hy-s*.15,s*.06,'#fff6a8',true);});
  if(placing)placing.spots.forEach((p,i)=>{const x=SX(p.x),y=SY(p.y),k=.5+.5*Math.sin(t*4+i);
    ctx.fillStyle=`rgba(255,255,255,${.25+.2*k})`;ctx.strokeStyle='#ff7eb6';ctx.lineWidth=3;ctx.setLineDash([8,6]);
    rr(x+s*.1,y+s*.1,s*2.8,s*1.8,s*.3);ctx.fill();ctx.stroke();ctx.setLineDash([]);
    drawEmoji('🔨',x+s*1.5,y+s*(.85-.12*k),s*.6);drawStar(x+s*.4,y+s*.3,s*.08*(1+k*.5),'#fff6a8',true);});
}
function ponyOptsFor(id,e,t){
  const o=Object.assign({},ponyLook(id),{flip:e.flip,walkT:e.walkT||0,moving:e.moving});let dy=0;
  if(e.hop&&t-e.hop<.5)dy=-Math.sin(Math.PI*(t-e.hop)/.5)*ts*.35;
  if(e.trick&&t-e.trick<1.2){const k=(t-e.trick)/1.2;dy=-Math.sin(Math.PI*k)*ts*1.1;o.flip=Math.floor(k*6)%2===0;}
  return[o,dy];}
function drawPonyEnt(id,t){
  const e=ents[id],[o,dy]=ponyOptsFor(id,e,t),s=ts*(o.scale||1),x=SX(e.x),y=SY(e.y);
  if(dy){ctx.fillStyle='rgba(40,60,20,.18)';ell(x,y,s*.35,s*.08);ctx.fill();}
  drawHorse(x,y+dy,o);
  if(e.trick&&t-e.trick<1.2)drawStar(x-s*.4,y+dy-s*.5,s*.1,pick(STARS).c,true);
  const hidden=hide&&id==='puff';
  if(rescued(id)&&!hidden){const n=ponyName(id);ctx.font=`bold ${Math.round(ts*.22)}px "Chalkboard SE","Comic Sans MS",sans-serif`;
    const tw=ctx.measureText(n).width+ts*.2,ty=y+dy-s*1.32-ts*.1;ctx.fillStyle='rgba(255,255,255,.88)';rr(x-tw/2,ty-ts*.15,tw,ts*.3,ts*.12);ctx.fill();
    ctx.fillStyle='#d94f9b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n,x,ty+1);}
  const want={twinkle:['feedTwinkle','rcarrot'],peaches:['fixBridge','sunflower'],puff:['feedPuff','cloudberry']}[id];
  let bub=null;if(!rescued(id)&&want&&qid()===want[0])bub=want[1];else if(e.emote&&t<e.emote.until)bub=e.emote.e;
  if(bub&&!hidden){const bx=x+s*.55+ts*.3,by=y+dy-s*1.3-ts*.45;ctx.fillStyle='rgba(255,255,255,.95)';circ(bx,by,ts*.24);ctx.fill();
    circ(bx-ts*.16,by+ts*.22,ts*.06);ctx.fill();
    if(bub==='rcarrot'){const c=rainbowEmoji('🥕',Math.round(ts*.3));ctx.drawImage(c,bx-c._s/2,by-c._s/2,c._s,c._s);}
    else drawEmoji(ICON[bub]||bub,bx,by,ts*.3);}
}
function ch2Layer(L,t,x0,y0,x1,y1){
  const s=ts;
  if(inClouds(player.x)){
    for(let y=Math.max(0,y0-1);y<=Math.min(29,y1+2);y++)for(let x=Math.max(45,x0-1);x<=Math.min(W-1,x1+1);x++){const c=map[y][x];
      if(c==='h')L.push([y+.85,()=>drawHedge(x,y)]);else if(c==='p')L.push([y+.9,()=>drawPuffCloud(x,y,t)]);}
    L.push([10,()=>drawCloudCastle(t)]);
    const pr=ents.princess;pr.flip=player.x<pr.x;
    L.push([pr.y,()=>drawHorse(SX(pr.x),SY(pr.y),Object.assign({},ponyLook('cloudberry'),{flip:pr.flip,walkT:0,moving:false}))]);
  }else{
    for(const c of state.cottages)if(c.y+3>y0&&c.y-3<y1)L.push([c.y+2,()=>drawCottage(c,t)]);
    if(inVillage(player.x,player.y)||y1>=30)LOG_SPOTS.forEach(([x,y],i)=>{if(!logUp(i)||y<y0-1||y>y1+1)return;
      L.push([y,()=>{shadow(SX(x),SY(y),s*.28,s*.07);drawEmoji('🪵',SX(x),SY(y)-s*.18,s*.55);if(Math.sin(t*2+i*2)>.9)drawStar(SX(x)+s*.2,SY(y)-s*.4,s*.06,'#fff6a8',true);}]);});
  }
  const pad=PADS[state.balloonAt||'valley'];
  if(state.balloon>=1&&inClouds(pad.x)===inClouds(player.x))L.push([pad.y,()=>drawBalloonAt(SX(pad.x),SY(pad.y),s,state.balloon,t)]);
  for(const id of PONY_IDS){const e=ents[id];if(inClouds(e.x)!==inClouds(player.x)||!onScreen(e.x,e.y))continue;L.push([e.y,()=>drawPonyEnt(id,t)]);}
  const b=ents.bird;if((qid()==='letter'||b.leaving)&&onScreen(b.x,b.y)){L.push([99,()=>{const f=Math.sin(t*14);
    drawEmoji('✉️',SX(b.x)+(b.flip?s*.2:-s*.2),SY(b.y)+s*.28,s*.32);drawEmoji('🐦',SX(b.x),SY(b.y)+f*s*.04,s*.6,!b.flip);}]);}
}
function drawCrop(c,st,x,y,size,t){
  const cr=CROPS[c];
  if(st===3&&cr.rainbow){const im=rainbowEmoji(cr.st[3],Math.round(size));ctx.drawImage(im,x-im._s/2,y-im._s/2,im._s,im._s);return;}
  if(st===3&&cr.glow){ctx.fillStyle=`rgba(160,190,255,${.35+.15*Math.sin(t*3+x)})`;circ(x,y,size*.55);ctx.fill();}
  drawEmoji(cr.st[st],x,y,size);
}
function rainAt(x,y){sfx('water');particles.push({x,y:y-1.15,vx:0,vy:0,g:0,life:1.3,max:1.3,draw:drawRainCloud});}
function drawRainCloud(p,al){const s=ts,x=SX(p.x),y=SY(p.y);ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle='#5fb8ff';ctx.lineWidth=Math.max(1.5,s*.04);ctx.lineCap='round';
  for(let i=0;i<5;i++){const k=((p.max-p.life)*2.2+i*.23)%1,dx=(i-2)*s*.12;ctx.beginPath();ctx.moveTo(x+dx,y+s*.15+k*s*.75);ctx.lineTo(x+dx-s*.03,y+s*.27+k*s*.75);ctx.stroke();}
  ctx.fillStyle='#fff';circ(x-s*.2,y,s*.2);ctx.fill();circ(x+s*.2,y,s*.2);ctx.fill();circ(x,y-s*.12,s*.25);ctx.fill();
  ctx.fillStyle='#4a2c5e';circ(x-s*.08,y-s*.05,s*.03);ctx.fill();circ(x+s*.08,y-s*.05,s*.03);ctx.fill();
  ctx.strokeStyle='#4a2c5e';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.arc(x,y,s*.06,.2,Math.PI-.2);ctx.stroke();ctx.restore();}

// The flight: the valley drops away, the balloon floats through the rainbow, and the Cloud Kingdom rises up (or the reverse).
function mix(a,b,k){const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=p(a),B=p(b);return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*k)).join(',')})`;}
function drawFlight(t){
  const p=clamp(flight.t/flight.dur,0,1),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,k=flight.to==='clouds'?e:1-e,s=Math.min(vw,vh)/7;
  const g=ctx.createLinearGradient(0,0,0,vh);g.addColorStop(0,mix('#7cc8ff','#b8a6ff',k));g.addColorStop(1,mix('#d6f0ff','#ffe1f2',k));
  ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);
  const gy=vh*.72+k*vh*1.6;
  if(gy<vh+40){ctx.fillStyle='#8fd16a';ell(vw*.25,gy+vh*.1,vw*.45,vh*.22);ctx.fill();ctx.fillStyle='#7cc35a';ell(vw*.8,gy+vh*.15,vw*.5,vh*.25);ctx.fill();
    drawEmoji('🏡',vw*.3,gy-s*.1,s*.9);drawEmoji('🌳',vw*.15,gy+s*.1,s*.8);drawEmoji('🌳',vw*.72,gy+s*.2,s*.8);drawEmoji('🐴',vw*.55,gy+s*.3,s*.5);}
  ctx.fillStyle='rgba(255,255,255,.8)';
  for(let i=0;i<10;i++){const cy=((hash(i,1)*vh*2.4+k*vh*3.2*(.6+hash(i,2)))%(vh*2.4))-vh*.7,cx=hash(i,3)*vw,r=s*(.4+hash(i,4)*.5);
    circ(cx,cy,r);ctx.fill();circ(cx+r*.9,cy+r*.15,r*.7);ctx.fill();circ(cx-r*.9,cy+r*.2,r*.6);ctx.fill();}
  const ry=vh*.48+(k-.5)*vh*2.6,R=vw*.42,bw=s*.22;ctx.lineWidth=bw+1;
  STARS.forEach((st,i)=>{ctx.strokeStyle=st.c;ctx.beginPath();ctx.arc(vw/2,ry+vh*.35,R-i*bw,Math.PI,Math.PI*2);ctx.stroke();});
  const iy=vh*.86+(1-k)*vh*1.7;
  if(iy<vh+vh*.4){ctx.fillStyle='#fdfbff';ell(vw/2,iy+vh*.12,vw*.6,vh*.2);ctx.fill();for(let i=-4;i<=4;i++){circ(vw/2+i*vw*.13,iy,s*(.6+hash(i,5)*.3));ctx.fill();}
    drawEmoji('🏰',vw*.68,iy-s*.6,s*1.5);}
  drawBalloonAt(vw/2,vh*.62+Math.sin(t*2)*s*.08,s*1.1,3,t,true);
  for(let i=0;i<8;i++){const a=(t*.6+i*.13)%1,dir=flight.to==='clouds'?1:-1;drawStar(vw/2+Math.sin(i*2.4)*s*1.4,vh*.6+dir*(a-.3)*vh*.8,s*.07,STARS[i%7].c,true);}
}
