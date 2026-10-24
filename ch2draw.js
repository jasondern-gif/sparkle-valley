'use strict';
// ---------- Chapter 2 drawing ----------
const cloudy=(x,y)=>{const c=map[y]&&map[y][x];return c==='c'||c==='h'||c==='p'||c==='Q'||c==='n'||c==='U'||c==='Z'||(c==='S'&&x>=45);};
function drawTileExtra(c,x,y,sx,sy,s,h,t){
  if(x<45)return false;
  if(c==='X')return true;
  if(c==='b'||c==='r'){drawBridgeTile(c,x,sx,sy,s,t);return true;}
  const cx=sx+s/2,cy=sy+s/2,n=cloudy(x,y-1),so=cloudy(x,y+1),w=cloudy(x-1,y),e=cloudy(x+1,y);
  if(!so){ctx.fillStyle='#d9cff4';ell(cx,sy+s*.86,s*.66,s*.36);ctx.fill();}
  ctx.fillStyle='#fdfbff';circ(cx,cy,s*.64);ctx.fill();
  if(n||so)ctx.fillRect(sx,n?sy:cy,s,(n?s/2:0)+(so?s/2+1:0));
  if(w||e)ctx.fillRect(w?sx:cx,sy,(w?s/2:0)+(e?s/2+1:0),s);
  if(h<.35){ctx.fillStyle='rgba(205,190,245,.28)';ell(sx+s*(.25+h),sy+s*(.3+h),s*.2,s*.08);ctx.fill();}
  if(h>.9)drawStar(cx,cy,s*.06*(1+.3*Math.sin(t*3+h*20)),'#ffe9a8',false);
  return true;
}
function drawBridgeTile(c,x,sx,sy,s,t){
  const cy=sy+s/2;
  if(c==='r'){STARS.forEach((st,i)=>{ctx.fillStyle=st.c;ctx.fillRect(sx,cy-s*.32+i*s*.092,s+1,s*.095);});
    ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(sx,cy-s*.4,s+1,s*.07);ctx.fillRect(sx,cy+s*.33,s+1,s*.07);
    if(Math.sin(t*3+x)>.6)drawStar(sx+s*.5,cy-s*.1,s*.08,'#fff',true);return;}
  ctx.fillStyle='#c98e55';ctx.strokeStyle='#8e5a2e';ctx.lineWidth=Math.max(1,s*.03);
  if(x===67){rr(sx-2,cy-s*.28,s*.5,s*.56,s*.05);ctx.fill();ctx.stroke();}
  if(x===69){rr(sx+s*.5,cy-s*.28,s*.5+2,s*.56,s*.05);ctx.fill();ctx.stroke();}
  if(x===68){ctx.save();ctx.translate(sx+s*.3,cy+s*.35);ctx.rotate(.5+Math.sin(t*1.5)*.08);rr(0,0,s*.14,s*.5,s*.03);ctx.fill();ctx.stroke();ctx.restore();}
  ctx.strokeStyle='#a0703f';ctx.beginPath();ctx.moveTo(sx,cy-s*.3);ctx.quadraticCurveTo(sx+s*.5,cy+s*.25,sx+s,cy-s*.3);ctx.stroke();
}
const FAR_CLOUDS=[...Array(9)].map((_,i)=>({x:hash(i,3)*1600,y:hash(i,7)*700,r:40+hash(i,9)*60}));
function drawBackdrop(){
  const g=ctx.createLinearGradient(0,0,0,vh);g.addColorStop(0,'#9fd6ff');g.addColorStop(.6,'#d9e8ff');g.addColorStop(1,'#ffd9f0');
  ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);ctx.fillStyle='rgba(255,255,255,.7)';
  for(const c of FAR_CLOUDS){const x=((c.x-cam.x*.25)%(vw+400)+vw+400)%(vw+400)-200,y=((c.y-cam.y*.25)%(vh+300)+vh+300)%(vh+300)-150;
    circ(x,y,c.r);ctx.fill();circ(x+c.r*.9,y+c.r*.2,c.r*.7);ctx.fill();circ(x-c.r*.9,y+c.r*.25,c.r*.6);ctx.fill();}
}
function drawHedge(x,y){const s=ts,bx=SX(x)+s/2,by=SY(y)+s*.95,h=hash(x,y);
  shadow(bx,by,s*.5,s*.1);ctx.fillStyle='#6cc25a';circ(bx-s*.26,by-s*.4,s*.38);ctx.fill();circ(bx+s*.26,by-s*.42,s*.38);ctx.fill();
  ctx.fillStyle='#86d872';circ(bx,by-s*.66,s*.4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';circ(bx-s*.1,by-s*.78,s*.15);ctx.fill();
  const cols=['#ff9ad5','#fff','#ffe14d','#c9a6ff'];for(let i=0;i<4;i++){ctx.fillStyle=cols[(i+Math.floor(h*4))%4];
    circ(bx+s*(hash(x+i,y)-.5)*.7,by-s*(.3+hash(x,y+i)*.6),s*.06);ctx.fill();}}
function drawPuffCloud(x,y,t){const s=ts,bx=SX(x)+s/2,by=SY(y)+s*.95,k=1+Math.sin(t*1.2+hash(x,y)*6)*.025;
  ctx.fillStyle='#d6caf2';ell(bx,by-s*.12,s*.62*k,s*.2);ctx.fill();ctx.fillStyle='#fff';
  circ(bx-s*.32,by-s*.45,s*.42*k);ctx.fill();circ(bx+s*.3,by-s*.48,s*.44*k);ctx.fill();circ(bx,by-s*.82,s*.5*k);ctx.fill();
  ctx.fillStyle='rgba(200,185,245,.35)';ell(bx,by-s*.2,s*.55,s*.12);ctx.fill();}
function drawCloudCastle(t){
  const s=ts,bx=SX(57.5),by=SY(10);shadow(bx,by,s*2.6,s*.25);ctx.lineWidth=Math.max(1,s*.04);
  const tower=(x,w,h,roof)=>{ctx.fillStyle='#fff6fd';ctx.strokeStyle='#d6c0f2';rr(x-w/2,by-h,w,h,s*.08);ctx.fill();ctx.stroke();
    ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-w/2-s*.12,by-h+s*.05);ctx.lineTo(x,by-h-w*1.2);ctx.lineTo(x+w/2+s*.12,by-h+s*.05);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#bfe6ff';rr(x-s*.13,by-h+s*.35,s*.26,s*.36,s*.13);ctx.fill();};
  ctx.fillStyle='#f3e8ff';ctx.strokeStyle='#d6c0f2';rr(bx-2.1*s,by-1.9*s,4.2*s,1.9*s,s*.12);ctx.fill();ctx.stroke();
  for(let i=0;i<7;i++){rr(bx-2.1*s+i*.62*s,by-2.12*s,s*.36,s*.28,s*.05);ctx.fill();ctx.stroke();}
  tower(bx-2.05*s,s*.95,2.7*s,'#b28cf5');tower(bx+2.05*s,s*.95,2.7*s,'#b28cf5');tower(bx,s*1.25,3.4*s,'#ff9ad5');
  const fy=by-3.4*s-1.5*s;ctx.strokeStyle='#c4a0e8';ctx.beginPath();ctx.moveTo(bx,fy+s*.05);ctx.lineTo(bx,fy-s*.4);ctx.stroke();
  ctx.fillStyle='#ff7eb6';ctx.beginPath();ctx.moveTo(bx,fy-s*.4);ctx.lineTo(bx+s*(.4+Math.sin(t*4)*.05),fy-s*.3);ctx.lineTo(bx,fy-s*.2);ctx.fill();
  ctx.fillStyle='#c98be8';ctx.beginPath();ctx.moveTo(bx-s*.42,by);ctx.lineTo(bx-s*.42,by-s*.7);ctx.arc(bx,by-s*.7,s*.42,Math.PI,0);ctx.lineTo(bx+s*.42,by);ctx.fill();
  drawEmoji('💖',bx,by-s*1.45,s*.4);
  ctx.fillStyle='#fff';for(let i=-3;i<=3;i++){circ(bx+i*s*.72,by-s*.05,s*(.32+hash(i,1)*.15));ctx.fill();}
}
const COT=id=>COTTAGE_COLORS.find(c=>c.id===id)||COTTAGE_COLORS[0];
function drawCottageAt(bx,by,s,col,name,k){
  ctx.save();ctx.translate(bx,by);ctx.scale(k,k);ctx.lineWidth=Math.max(1,s*.04);
  ctx.fillStyle='rgba(40,60,20,.22)';ell(0,0,s*1.55,s*.22);ctx.fill();
  ctx.fillStyle='#c97b5d';ctx.fillRect(s*.7,-s*2.45,s*.32,s*.6);
  ctx.fillStyle=col.wall;ctx.strokeStyle='rgba(120,80,120,.35)';rr(-s*1.32,-s*1.5,s*2.64,s*1.5,s*.12);ctx.fill();ctx.stroke();
  ctx.fillStyle=col.roof;ctx.beginPath();ctx.moveTo(-s*1.6,-s*1.3);ctx.quadraticCurveTo(0,-s*2.95,s*1.6,-s*1.3);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<6;i++){circ(-s*1.35+i*s*.54,-s*1.33,s*.16);ctx.fill();}
  ctx.fillStyle='#b5713f';ctx.strokeStyle='#8a5129';ctx.beginPath();ctx.moveTo(-s*.32,0);ctx.lineTo(-s*.32,-s*.72);ctx.arc(0,-s*.72,s*.32,Math.PI,0);ctx.lineTo(s*.32,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffd34d';circ(s*.18,-s*.42,s*.05);ctx.fill();
  ctx.fillStyle='#bfe6ff';ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;circ(-s*.84,-s*.85,s*.26);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-s*1.1,-s*.85);ctx.lineTo(-s*.58,-s*.85);ctx.moveTo(-s*.84,-s*1.11);ctx.lineTo(-s*.84,-s*.59);ctx.stroke();
  rr(s*.58,-s*1.12,s*.52,s*.48,s*.06);ctx.fillStyle='#bfe6ff';ctx.fill();ctx.stroke();
  ctx.fillStyle='#a86d36';ctx.fillRect(s*.52,-s*.66,s*.64,s*.12);['#ff7eb6','#ffd34d','#c9a6ff'].forEach((c,i)=>{ctx.fillStyle=c;circ(s*(.62+i*.22),-s*.7,s*.07);ctx.fill();});
  if(name){ctx.font=`bold ${Math.round(s*.24)}px "Chalkboard SE","Comic Sans MS",sans-serif`;const tw=ctx.measureText(name).width+s*.24;
    ctx.fillStyle='#fff';ctx.strokeStyle=col.roof;ctx.lineWidth=s*.04;rr(-tw/2,-s*1.72,tw,s*.34,s*.1);ctx.fill();ctx.stroke();
    ctx.fillStyle='#d94f9b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,0,-s*1.54);}
  ctx.restore();
}
function drawCottage(c,t){const age=t-c.built,k=age<0||age>1.2?1:Math.max(.01,1+2.7*Math.pow(age/1.2-1,3)+1.7*Math.pow(age/1.2-1,2));
  drawCottageAt(SX(c.x+1.5),SY(c.y+2),ts,COT(c.color),c.pony&&ponyName(c.pony),k);}
function drawBalloonAt(x,y,s,stage,t,riders){
  ctx.save();ctx.translate(x,y);shadow(0,0,s*.6,s*.14);
  const lift=stage>=3?-s*.18+Math.sin(t*2)*s*.07:0;ctx.translate(0,lift);ctx.lineWidth=Math.max(1,s*.035);
  if(stage===2){ctx.strokeStyle='#8e5a2e';ctx.beginPath();ctx.moveTo(-s*.4,-s*.1);ctx.lineTo(-s*.8,s*.05);ctx.moveTo(s*.4,-s*.1);ctx.lineTo(s*.8,s*.05);ctx.stroke();}
  if(stage>=2){
    ctx.strokeStyle='#8e5a2e';ctx.beginPath();for(const[a,b]of[[-.36,-.78],[.36,.78],[-.12,-.3],[.12,.3]]){ctx.moveTo(a*s,-s*.6);ctx.lineTo(b*s,-s*1.62);}ctx.stroke();
    ctx.save();ctx.beginPath();ctx.moveTo(-s*.36,-s*1.42);ctx.bezierCurveTo(-s*.9,-s*1.7,-s*1.05,-s*2,-s*1.05,-s*2.45);
    ctx.bezierCurveTo(-s*1.05,-s*3.85,s*1.05,-s*3.85,s*1.05,-s*2.45);ctx.bezierCurveTo(s*1.05,-s*2,s*.9,-s*1.7,s*.36,-s*1.42);ctx.closePath();
    ctx.save();ctx.clip();const sw=2.1*s/7;STARS.forEach((st,i)=>{ctx.fillStyle=st.c;ctx.fillRect(-s*1.05+i*sw,-s*3.9,sw+1,s*2.6);});
    ctx.fillStyle='rgba(255,255,255,.35)';ell(-s*.45,-s*2.85,s*.22,s*.45);ctx.fill();ctx.restore();
    ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1.5,s*.05);ctx.stroke();ctx.restore();
    ctx.fillStyle='#ffd34d';rr(-s*.4,-s*1.5,s*.8,s*.14,s*.05);ctx.fill();
    for(const sd of[-1,1]){ctx.strokeStyle=sd<0?'#ff7eb6':'#9b5cff';ctx.lineWidth=s*.07;ctx.beginPath();ctx.moveTo(sd*s*.98,-s*2.3);
      for(let i=1;i<=6;i++)ctx.lineTo(sd*s*(1.02+.07*Math.sin(t*5+i)),-s*2.3+i*s*.15);ctx.stroke();}
  }
  if(riders){drawEmoji(state.hero,-s*.16,-s*.78,s*.5);drawEmoji('🦄',s*.22,-s*.76,s*.42,true);}
  ctx.lineWidth=Math.max(1,s*.035);ctx.fillStyle='#c98e55';ctx.strokeStyle='#8e5a2e';rr(-s*.42,-s*.58,s*.84,s*.58,s*.1);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(120,70,30,.45)';ctx.beginPath();for(let i=1;i<3;i++){ctx.moveTo(-s*.4,-s*.58+i*s*.19);ctx.lineTo(s*.4,-s*.58+i*s*.19);}
  for(let i=1;i<5;i++){ctx.moveTo(-s*.42+i*s*.17,-s*.56);ctx.lineTo(-s*.42+i*s*.17,-s*.04);}ctx.stroke();
  ctx.fillStyle='#a86d36';rr(-s*.47,-s*.66,s*.94,s*.12,s*.05);ctx.fill();
  if(stage>=3)for(let i=0;i<5;i++){const a=t*1.5+i*1.26;drawStar(Math.cos(a)*s*1.25,-s*2.4+Math.sin(a)*s*1.1,s*.08,'#fff6a8',true);}
  ctx.restore();
}
