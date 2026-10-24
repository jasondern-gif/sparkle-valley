'use strict';
// ---------- Rendering ----------
const canvas=$('game'),ctx=canvas.getContext('2d');
let ts=64,dpr=1,vw=0,vh=0;const cam={x:0,y:0};
const emojiCache=new Map();
const EMOJI_FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);vw=window.innerWidth;vh=window.innerHeight;
  canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);canvas.style.width=vw+'px';canvas.style.height=vh+'px';
  ts=Math.max(44,Math.round(Math.min(vw/13,vh/9.5)));emojiCache.clear();
}
function emo(e,size){
  size=Math.max(6,Math.round(size));const k=e+'|'+size;let c=emojiCache.get(k);
  if(!c){if(emojiCache.size>600)emojiCache.clear();
    c=document.createElement('canvas');const s=Math.ceil(size*1.4);c.width=c.height=Math.ceil(s*dpr);
    const g=c.getContext('2d');g.scale(dpr,dpr);g.font=size+'px '+EMOJI_FONT;g.textAlign='center';g.textBaseline='middle';
    g.fillText(e,s/2,s/2+size*.07);c._s=s;emojiCache.set(k,c);}
  return c;
}
function drawEmoji(e,x,y,size,flip,alpha){const c=emo(e,size),s=c._s;ctx.save();if(alpha!=null)ctx.globalAlpha*=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(c,-s/2,-s/2,s,s);ctx.restore();}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function ell(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);}
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(40,60,20,.22)';ell(x,y,rx,ry);ctx.fill();}
const SX=x=>x*ts-cam.x, SY=y=>y*ts-cam.y;
function starPath(x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}ctx.closePath();}
function drawStar(x,y,r,color,glow){ctx.save();if(glow){ctx.shadowColor=color;ctx.shadowBlur=r*1.3;}starPath(x,y,r);ctx.fillStyle=color;ctx.fill();
  ctx.shadowBlur=0;ctx.lineWidth=Math.max(1.5,r*.14);ctx.strokeStyle='#fff';ctx.stroke();ctx.restore();}

function inGlade(x,y){return x>=33&&x<=41&&y>=11&&y<=27;}
function groundColor(x,y,h){
  if(inGlade(x,y))return state.rainbow?`hsl(${300+h*30},75%,${84+h*4}%)`:`hsl(${265+h*20},40%,${82+h*4}%)`;
  if(map[y][x]==='m')return `hsl(${86+h*10},62%,${63+h*4}%)`;
  return `hsl(${96+h*8},52%,${57+h*5}%)`;
}
function stageOf(p){return p.w?Math.min(3,1+Math.floor(p.g/GROW)):0;}

function drawGround(x0,y0,x1,y1,t){
  const s=ts;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const c=map[y][x],sx=x*s-cam.x,sy=y*s-cam.y,h=hash(x,y);
    if(c==='='){ctx.fillStyle='#ead39d';ctx.fillRect(sx,sy,s+1,s+1);
      ctx.fillStyle='#d8bd82';if(h<.6){ell(sx+s*(.2+h),sy+s*(.3+h*.6),s*.06,s*.04);ctx.fill();}if(h>.4){ell(sx+s*(1-h*.8),sy+s*(.75),s*.05,s*.035);ctx.fill();}}
    else if(c==='S'){const p=state.plots[x+','+y];const wet=p&&p.w&&stageOf(p)<3;
      ctx.fillStyle=wet?'#6e4530':'#a46f45';ctx.fillRect(sx,sy,s+1,s+1);
      ctx.strokeStyle=wet?'#5a3725':'#8d5c37';ctx.lineWidth=Math.max(1,s*.04);
      for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(sx+s*.1,sy+s*i/4);ctx.lineTo(sx+s*.9,sy+s*i/4);ctx.stroke();}
      ctx.strokeStyle='rgba(255,255,255,.12)';ctx.strokeRect(sx+1,sy+1,s-2,s-2);}
    else if(c==='W'){ctx.fillStyle='#5cc6f0';ctx.fillRect(sx,sy,s+1,s+1);
      ctx.fillStyle='#bdf0ff';const e=s*.1;
      if(map[y-1][x]!=='W')ctx.fillRect(sx,sy,s,e);if(map[y+1][x]!=='W')ctx.fillRect(sx,sy+s-e,s,e);
      if(map[y][x-1]!=='W')ctx.fillRect(sx,sy,e,s);if(map[y][x+1]!=='W')ctx.fillRect(sx+s-e,sy,e,s);
      ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(1.5,s*.035);const yy=sy+s*(.45+.15*Math.sin(t*1.5+h*6));
      ctx.beginPath();ctx.moveTo(sx+s*(.2+h*.3),yy);ctx.quadraticCurveTo(sx+s*(.35+h*.3),yy-s*.06,sx+s*(.5+h*.3),yy);ctx.stroke();
      if(h>.82){ctx.fillStyle='#6fcf6a';ctx.beginPath();ctx.arc(sx+s*.5,sy+s*.6,s*.15,.4,Math.PI*2-.1);ctx.lineTo(sx+s*.5,sy+s*.6);ctx.fill();}}
    else{ctx.fillStyle=groundColor(x,y,h);ctx.fillRect(sx,sy,s+1,s+1);
      if(c==='.'||c==='m'||c==='g'){
        if(h<.3){ctx.strokeStyle=inGlade(x,y)?'rgba(150,110,200,.5)':'rgba(70,140,50,.55)';ctx.lineWidth=Math.max(1,s*.03);
          const bx=sx+s*(.2+h*2),by=sy+s*(.4+h);ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-s*.04,by-s*.12);ctx.moveTo(bx+s*.06,by);ctx.lineTo(bx+s*.08,by-s*.13);ctx.stroke();}
        const fl=(c==='m'&&h>.5)||(c==='.'&&h>.93);
        if(fl){const cols=['#fff','#ffe14d','#ff9ad5','#c9a6ff'];ctx.fillStyle=cols[Math.floor(h*97)%4];
          const fx=sx+s*(.3+(h*7%1)*.4),fy=sy+s*(.3+(h*13%1)*.4);circ(fx,fy,s*.05);ctx.fill();ctx.fillStyle='#ffcf33';circ(fx,fy,s*.022);ctx.fill();}
        if(c==='g'&&h>.88){if(h>.96)drawEmoji('🍄',sx+s*.5,sy+s*.5,s*.35);else drawStar(sx+s*.5,sy+s*.5,s*.07*(1+.3*Math.sin(t*3+h*20)),'#fff6a8',false);}
      }}
  }
}

function drawFence(x,y,gold){
  const s=ts,cx=SX(x)+s/2,cy=SY(y)+s*.55;
  const isF=(xx,yy)=>{const r=map[yy];const c=r&&r[xx];return c==='F'||(c==='G'&&!state.gateOpen);};
  ctx.lineWidth=Math.max(1,s*.03);ctx.strokeStyle=gold?'#b88a00':'#8e5a2e';ctx.fillStyle=gold?'#ffd34d':'#c98e55';
  if(isF(x+1,y)){rr(cx,cy-s*.3,s,s*.1,s*.03);ctx.fill();ctx.stroke();rr(cx,cy-s*.1,s,s*.1,s*.03);ctx.fill();ctx.stroke();}
  if(isF(x,y+1)){rr(cx-s*.05,cy,s*.1,s,s*.03);ctx.fill();ctx.stroke();}
  ctx.fillStyle=gold?'#ffcf33':'#b5773f';rr(cx-s*.08,cy-s*.42,s*.16,s*.5,s*.05);ctx.fill();ctx.stroke();
}
function drawGate(x,y,t){
  const s=ts,cx=SX(x)+s/2,cy=SY(y)+s*.5;
  if(!state.gateOpen){drawFence(x,y,true);drawEmoji('🔒',cx,cy-s*.15,s*.45);}
  else for(let i=0;i<3;i++){const a=t*2+i*2.1;drawStar(cx+Math.cos(a)*s*.3,cy+Math.sin(a)*s*.25,s*.07,'#fff6a8',true);}
}
function drawTree(x,y){const s=ts,h=hash(x,y),cx=SX(x)+s/2,sy=SY(y);shadow(cx,sy+s*.88,s*.4,s*.12);
  drawEmoji(h<.72?'🌳':'🌲',cx,sy+s*.28,s*1.3);}

function drawHouse(){
  const s=ts,x=SX(3),y=SY(2),w=4*s;
  shadow(x+w/2,y+4*s,w*.52,s*.25);
  ctx.fillStyle='#c97b5d';ctx.fillRect(x+2.85*s,y+.45*s,.42*s,.9*s);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#fff3d9';ctx.strokeStyle='#d8b07c';rr(x+.22*s,y+1.65*s,w-.44*s,2.3*s,s*.08);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f0679a';ctx.strokeStyle='#c4436f';ctx.beginPath();ctx.moveTo(x-.05*s,y+1.95*s);ctx.lineTo(x+w/2,y+.2*s);ctx.lineTo(x+w+.05*s,y+1.95*s);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.35)';for(let i=1;i<4;i++){const yy=y+.2*s+i*.43*s,half=(yy-(y+.2*s))/(1.75*s)*(w/2+.05*s);ctx.beginPath();ctx.moveTo(x+w/2-half,yy);ctx.lineTo(x+w/2+half,yy);ctx.stroke();}
  ctx.fillStyle='#bfe8ff';circ(x+w/2,y+1.25*s,.27*s);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.05;ctx.stroke();drawEmoji('💗',x+w/2,y+1.25*s,.3*s);
  for(const wx of[x+.5*s,x+3.05*s]){ctx.fillStyle='#a8dcff';rr(wx,y+2.3*s,.7*s,.7*s,.08*s);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;ctx.stroke();
    ctx.beginPath();ctx.moveTo(wx+.35*s,y+2.3*s);ctx.lineTo(wx+.35*s,y+3*s);ctx.moveTo(wx,y+2.65*s);ctx.lineTo(wx+.7*s,y+2.65*s);ctx.stroke();
    ctx.fillStyle='#b07a4a';ctx.fillRect(wx-.05*s,y+3.02*s,.8*s,.14*s);
    ['#ff7eb6','#ffd34d','#c9a6ff','#ff7eb6'].forEach((c,i)=>{ctx.fillStyle=c;circ(wx+.08*s+i*.2*s,y+2.98*s,.07*s);ctx.fill();});}
  const dx=x+2.12*s;ctx.fillStyle='#b5713f';ctx.strokeStyle='#8a5129';ctx.lineWidth=s*.04;rr(dx,y+2.75*s,.76*s,1.2*s,.25*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffd34d';circ(dx+.6*s,y+3.4*s,.06*s);ctx.fill();drawEmoji('💖',dx+.38*s,y+3.05*s,.25*s);
}
function drawBarn(){
  const s=ts,x=SX(3),y=SY(12),w=2*s;shadow(x+w/2,y+2*s,w*.55,s*.2);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#e05252';ctx.strokeStyle='#a83232';rr(x+.1*s,y+.85*s,w-.2*s,1.12*s,s*.05);ctx.fill();ctx.stroke();
  ctx.fillStyle='#9a3d3d';ctx.beginPath();ctx.moveTo(x-.05*s,y+.95*s);ctx.lineTo(x+.35*s,y+.35*s);ctx.lineTo(x+w/2,y+.05*s);ctx.lineTo(x+w-.35*s,y+.35*s);ctx.lineTo(x+w+.05*s,y+.95*s);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff';ctx.stroke();
  ctx.fillStyle='#c84242';ctx.fillRect(x+.6*s,y+1.15*s,.8*s,.8*s);ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;ctx.strokeRect(x+.6*s,y+1.15*s,.8*s,.8*s);
  ctx.beginPath();ctx.moveTo(x+.6*s,y+1.15*s);ctx.lineTo(x+1.4*s,y+1.95*s);ctx.moveTo(x+1.4*s,y+1.15*s);ctx.lineTo(x+.6*s,y+1.95*s);ctx.stroke();
  ctx.fillStyle='#ffe08a';circ(x+w/2,y+.6*s,.16*s);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.04;ctx.stroke();
}
function drawMarket(){
  const s=ts,x=SX(16),y=SY(21),w=3*s;shadow(x+w/2,y+2*s,w*.52,s*.18);
  ctx.fillStyle='#a8703f';ctx.fillRect(x+.15*s,y+.4*s,.15*s,1.5*s);ctx.fillRect(x+w-.3*s,y+.4*s,.15*s,1.5*s);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#d49a5e';ctx.strokeStyle='#8e5a2e';rr(x+.05*s,y+1.15*s,w-.1*s,.82*s,s*.06);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(120,70,30,.4)';ctx.beginPath();ctx.moveTo(x+.1*s,y+1.55*s);ctx.lineTo(x+w-.1*s,y+1.55*s);ctx.stroke();
  ['🥕','🍓','🥚','🌻','🍓'].forEach((e,i)=>drawEmoji(e,x+(.35+i*.58)*s,y+1.08*s,s*.38));
  for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#fff':'#ff7eb6';ctx.fillRect(x+i*w/6,y+.12*s,w/6+1,.45*s);circ(x+i*w/6+w/12,y+.57*s,w/12);ctx.fill();}
  ctx.fillStyle='#fff';ctx.strokeStyle='#ff7eb6';ctx.lineWidth=s*.05;rr(x+w/2-.75*s,y-.32*s,1.5*s,.44*s,s*.1);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d94f9b';ctx.font=`bold ${Math.round(s*.27)}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MARKET',x+w/2,y-.1*s);
}
function drawStone(t){
  const s=ts,x=SX(37),y=SY(14);shadow(x+s/2,y+s*.95,s*.45,s*.12);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#bdb6cf';ctx.strokeStyle='#8d86a3';rr(x+.12*s,y+.05*s,.76*s,.9*s,.3*s);ctx.fill();ctx.stroke();
  starPath(x+s/2,y+.48*s,s*.2);
  if(state.rainbow){ctx.fillStyle='#fff6a8';ctx.fill();STARS.forEach((st,i)=>{const a=Math.PI+(i+.5)*Math.PI/7;drawStar(x+s/2+Math.cos(a)*s*.62,y+.55*s+Math.sin(a)*s*.62,s*.11,st.c,true);});}
  else{ctx.strokeStyle='#8d86a3';ctx.stroke();}
}

function drawPerson(x,y,face,dress,flip,walkT,moving,opts){
  opts=opts||{};const s=ts;ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);
  if(!opts.seated){shadow(0,0,s*.26,s*.08);
    const sw=moving?Math.sin(walkT)*s*.05:0;ctx.fillStyle='#7a5a8c';
    ctx.fillRect(-s*.1,-s*.2+Math.max(0,sw),s*.07,s*.2-Math.max(0,sw));ctx.fillRect(s*.03,-s*.2+Math.max(0,-sw),s*.07,s*.2-Math.max(0,-sw));
    ctx.fillStyle='#5a3a2a';ell(-s*.065,-s*.01,s*.06,s*.035);ctx.fill();ell(s*.065,-s*.01,s*.06,s*.035);ctx.fill();}
  const top=opts.seated?-.48:-.52,bot=opts.seated?-.2:-.16;
  ctx.fillStyle=dress;ctx.strokeStyle='rgba(60,30,60,.3)';ctx.lineWidth=Math.max(1,s*.025);
  ctx.beginPath();ctx.moveTo(-s*.12,s*top);ctx.lineTo(s*.12,s*top);ctx.lineTo(s*.24,s*bot);ctx.lineTo(-s*.24,s*bot);ctx.closePath();ctx.fill();ctx.stroke();
  if(opts.apron){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-s*.08,s*(top+.1));ctx.lineTo(s*.08,s*(top+.1));ctx.lineTo(s*.15,s*bot);ctx.lineTo(-s*.15,s*bot);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#ffd8b5';circ(-s*.17,s*(top+.12),s*.055);ctx.fill();circ(s*.17,s*(top+.12),s*.055);ctx.fill();
  drawEmoji(face,0,s*(top-.2),s*.56);
  ctx.restore();
}
function drawHorse(x,y,o){
  const s=ts*(o.scale||1);ctx.save();ctx.translate(x,y);if(o.flip)ctx.scale(-1,1);
  ctx.lineWidth=Math.max(1,s*.025);ctx.strokeStyle='rgba(80,40,80,.35)';
  shadow(0,0,s*.42,s*.1);
  const wt=o.walkT||0,mv=o.moving,cols=o.mane;
  const leg=(lx,ph)=>{const sw=mv?Math.sin(wt+ph)*s*.06:0;ctx.fillStyle=o.body;rr(lx*s+sw-s*.045,-s*.36,s*.09,s*.36,s*.03);ctx.fill();ctx.stroke();
    ctx.fillStyle=o.hoof;rr(lx*s+sw-s*.05,-s*.06,s*.1,s*.06,s*.02);ctx.fill();};
  leg(-.22,0);leg(.16,Math.PI);
  for(let i=0;i<6;i++){const k=i/5;ctx.fillStyle=cols[i%cols.length];circ((-.33-.12*k)*s,(-.52+.34*k+Math.sin(wt*.4+i)*.01)*s,(.085-.025*k)*s);ctx.fill();}
  ctx.fillStyle=o.body;ell(0,-s*.42,s*.33,s*.19);ctx.fill();ctx.stroke();
  leg(-.12,Math.PI);leg(.24,0);
  ctx.fillStyle=o.body;ctx.beginPath();ctx.moveTo(s*.12,-s*.5);ctx.lineTo(s*.25,-s*.84);ctx.lineTo(s*.43,-s*.8);ctx.lineTo(s*.32,-s*.42);ctx.closePath();ctx.fill();
  ctx.save();ctx.translate(s*.38,-s*.84);ctx.rotate(.38);
  ctx.fillStyle=o.body;ell(0,0,s*.17,s*.12);ctx.fill();ctx.stroke();
  ctx.fillStyle=o.snout;ell(s*.13,s*.02,s*.085,s*.08);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(80,40,60,.5)';circ(s*.17,s*.0,s*.015);ctx.fill();
  ctx.restore();
  ctx.fillStyle=o.body;ctx.beginPath();ctx.moveTo(s*.27,-s*.93);ctx.lineTo(s*.3,-s*1.06);ctx.lineTo(s*.36,-s*.94);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#3a2340';circ(s*.37,-s*.87,s*.034);ctx.fill();ctx.fillStyle='#fff';circ(s*.38,-s*.88,s*.012);ctx.fill();
  ctx.fillStyle='rgba(255,120,170,.45)';circ(s*.43,-s*.79,s*.035);ctx.fill();
  for(let i=0;i<5;i++){const k=i/4;ctx.fillStyle=cols[i%cols.length];circ((.27-.14*k)*s,(-.96+.42*k)*s,s*.075);ctx.fill();}
  if(o.horn){ctx.fillStyle=o.hornColor||'#ffd34d';ctx.beginPath();ctx.moveTo(s*.34,-s*.95);ctx.lineTo(s*.48,-s*1.22);ctx.lineTo(s*.41,-s*.92);ctx.closePath();ctx.fill();ctx.stroke();}
  if(o.crown){drawEmoji('🌸',s*.22,-s*1.0,s*.17);drawEmoji('🌼',s*.31,-s*1.04,s*.15);}
  if(o.bow)drawEmoji('🎀',s*.17,-s*.94,s*.24);
  ctx.restore();
}

function drawSign(sg,t){
  const s=ts,x=SX(sg.x),y=SY(sg.y),bounce=sg.hit&&t-sg.hit<.4?Math.sin((t-sg.hit)*25)*s*.04:0;
  ctx.font=`bold ${Math.round(s*.2)}px "Chalkboard SE","Comic Sans MS",sans-serif`;
  const tw=ctx.measureText(sg.text).width,w=tw+s*.5,h=s*.36,by=y-s*.78+bounce;
  shadow(x,y,s*.15,s*.05);
  ctx.fillStyle='#a86d36';ctx.fillRect(x-s*.04,by+h-2,s*.08,y-(by+h)+2);
  ctx.lineWidth=Math.max(1,s*.03);ctx.fillStyle='#f3d9a4';ctx.strokeStyle='#8e5a2e';rr(x-w/2,by,w,h,s*.08);ctx.fill();ctx.stroke();
  ctx.fillStyle='#6b3f1d';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(sg.text,x-w/2+s*.08,by+h/2+1);
  drawEmoji('🔊',x+w/2-s*.17,by+h/2,s*.22);
}
function drawArrow(tx,ty,t,icon){
  const s=ts,x=SX(tx),y=SY(ty);const m=60;
  if(x>m&&x<vw-m&&y>130&&y<vh-110){
    const b=Math.sin(t*5)*s*.12,ay=y-s*1.45+b;
    ctx.save();ctx.fillStyle='#ffd83d';ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(2,s*.06);
    ctx.beginPath();ctx.moveTo(x-s*.22,ay-s*.3);ctx.lineTo(x+s*.22,ay-s*.3);ctx.lineTo(x+s*.22,ay);ctx.lineTo(x+s*.38,ay);ctx.lineTo(x,ay+s*.38);ctx.lineTo(x-s*.38,ay);ctx.lineTo(x-s*.22,ay);ctx.closePath();
    ctx.shadowColor='rgba(0,0,0,.25)';ctx.shadowBlur=6;ctx.fill();ctx.shadowBlur=0;ctx.stroke();ctx.restore();
  }else{
    const cx=vw/2,cy=vh/2,a=Math.atan2(y-cy,x-cx);
    const ex=clamp(cx+Math.cos(a)*vw,m,vw-m),ey=clamp(cy+Math.sin(a)*vh,130,vh-110);
    const p=1+Math.sin(t*6)*.08;ctx.save();ctx.translate(ex,ey);
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.strokeStyle='#ffd83d';ctx.lineWidth=5;circ(0,0,32*p);ctx.fill();ctx.stroke();
    ctx.rotate(a);ctx.fillStyle='#ffb800';ctx.beginPath();ctx.moveTo(48*p,0);ctx.lineTo(32*p,-12*p);ctx.lineTo(32*p,12*p);ctx.closePath();ctx.fill();
    ctx.restore();if(icon)drawEmoji(icon,ex,ey,34);
  }
}
function drawRainbow(){
  const qid=Q[state.quest].id;let cols;
  if(state.rainbow)cols=STARS.map(s=>s.c);else if(qid==='stars'||qid==='finale')cols=STARS.map((s,i)=>state.stars.includes(i)?s.c:null);else return;
  const cx=vw/2,cy=vh*1.15,R=Math.max(vw*.56,vh*1.05),bw=Math.max(8,ts*.16);
  ctx.save();ctx.globalAlpha=.32;ctx.lineWidth=bw+1;
  cols.forEach((c,i)=>{if(!c)return;ctx.strokeStyle=c;ctx.beginPath();ctx.arc(cx,cy,R-i*bw,Math.PI,Math.PI*2);ctx.stroke();});ctx.restore();
}
