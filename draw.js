'use strict';
// ---------- Rendering ----------
const canvas=$('game');let ctx=canvas.getContext('2d');
let ts=64,dpr=1,vw=0,vh=0;const cam={x:0,y:0};
const emojiCache=new Map();
const EMOJI_FONT='"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
// graphics caches (ground chunks, sprites); all cleared on resize
const GFX={chunks:new Map(),pool:[],sprites:new Map(),field:null,sig:'',frame:0,vig:null,vigKey:''};
const CHUNK=4,FP=4,KNOWN_TILES='.=SWTFGHBCMmgK';
const nowS=()=>performance.now()/1000;

function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);vw=window.innerWidth;vh=window.innerHeight;
  canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);canvas.style.width=vw+'px';canvas.style.height=vh+'px';
  ts=Math.max(44,Math.round(Math.min(vw/13,vh/9.5)));emojiCache.clear();gfxReset();
}
function gfxReset(){
  for(const ch of GFX.chunks.values()){ch.cv.width=ch.cv.height=0;}GFX.chunks.clear();
  for(const c of GFX.pool)c.width=c.height=0;GFX.pool.length=0;
  for(const c of GFX.sprites.values())c.width=c.height=0;GFX.sprites.clear();
  GFX.sig='';GFX.vig=null;GFX.vigKey='';
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
function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function rrSub(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function ell(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);}
function circ(x,y,r){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);}
function shadow(x,y,rx,ry){const c=shadowSprite();ctx.drawImage(c,x-rx*1.25,y-ry*1.25,rx*2.5,ry*2.5);}
const SX=x=>x*ts-cam.x, SY=y=>y*ts-cam.y;

// --- small helpers ---
function withCtx(g,fn){const o=ctx;ctx=g;try{fn();}finally{ctx=o;}}
function hexRgb(c){if(typeof c!=='string'||c[0]!=='#')return null;let h=c.slice(1);if(h.length===3)h=h.replace(/./g,'$&$&');if(h.length<6)return null;
  const n=parseInt(h.slice(0,6),16);return isNaN(n)?null:[n>>16&255,n>>8&255,n&255];}
function shadeHex(c,amt){const v=hexRgb(c);if(!v)return c;const f=x=>Math.round(amt<0?x*(1+amt):x+(255-x)*amt);return `rgb(${f(v[0])},${f(v[1])},${f(v[2])})`;}
function rgbaOf(c,a){const v=hexRgb(c);return v?`rgba(${v[0]},${v[1]},${v[2]},${a})`:`rgba(255,255,255,${a})`;}
function hslRgb(h,s,l){h=(((h%360)+360)%360)/360;s/=100;l/=100;const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
  const f=t=>{t=((t%1)+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255];}
function vnoise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=hash(ix,iy),b=hash(ix+1,iy),c=hash(ix,iy+1),d=hash(ix+1,iy+1);return(a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;}
function strSeed(s){s=String(s);let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%9973;return h/997;}
// cached sprite canvases (css-px sized, rendered at dpr). (ox,oy) = local origin inside the sprite.
function getSprite(key,w,h,ox,oy,fn,scale){
  let c=GFX.sprites.get(key);if(c)return c;const k=scale||dpr;
  c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*k));c.height=Math.max(1,Math.ceil(h*k));
  const g=c.getContext('2d');g.setTransform(k,0,0,k,ox*k,oy*k);withCtx(g,fn);
  c._w=w;c._h=h;c._ox=ox;c._oy=oy;GFX.sprites.set(key,c);return c;
}
function drawSprite(c,x,y){ctx.drawImage(c,x-c._ox,y-c._oy,c._w,c._h);}
function shadowSprite(){return getSprite('shadow',64,64,32,32,()=>{const g=ctx.createRadialGradient(0,0,0,0,0,32);
  g.addColorStop(0,'rgba(45,60,25,.30)');g.addColorStop(.55,'rgba(45,60,25,.22)');g.addColorStop(1,'rgba(45,60,25,0)');ctx.fillStyle=g;ctx.fillRect(-32,-32,64,64);},1);}
function glowSprite(color){return getSprite('glow|'+color,64,64,32,32,()=>{const g=ctx.createRadialGradient(0,0,0,0,0,32);
  g.addColorStop(0,rgbaOf(color,.85));g.addColorStop(.35,rgbaOf(color,.4));g.addColorStop(1,rgbaOf(color,0));ctx.fillStyle=g;ctx.fillRect(-32,-32,64,64);},1);}

function starPath(x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}ctx.closePath();}
function drawStar(x,y,r,color,glow){ctx.save();
  if(glow){const g=glowSprite(color),d=r*3.4;ctx.drawImage(g,x-d,y-d,d*2,d*2);}
  starPath(x,y,r);ctx.fillStyle=color;ctx.fill();
  ctx.lineJoin='round';ctx.lineWidth=Math.max(1.5,r*.14);ctx.strokeStyle='#fff';ctx.stroke();ctx.restore();}
function twinkle(x,y,r,a){ctx.save();ctx.globalAlpha*=a;ctx.fillStyle='#fff';ctx.beginPath();
  ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.quadraticCurveTo(x,y,x,y+r);ctx.quadraticCurveTo(x,y,x-r,y);ctx.quadraticCurveTo(x,y,x,y-r);ctx.fill();ctx.restore();}

function inGlade(x,y){return x>=33&&x<=41&&y>=11&&y<=27;}
function groundColor(x,y,h){
  h=(h-.5)*.4+.5;
  if(inGlade(x,y))return state.rainbow?`hsl(${318+h*14},72%,${85+h*2}%)`:`hsl(${266+h*8},42%,${83+h*2}%)`;
  if(map[y]&&map[y][x]==='m')return `hsl(${80+h*6},62%,${65+h*3}%)`;
  return `hsl(${97+h*5},54%,${57+h*3}%)`;
}
function stageOf(p){return p.w?Math.min(3,1+Math.floor(p.g/GROW)):0;}

// ---------- Ground: smooth color field + cached chunks ----------
function tileAt(x,y){const r=map[y];return r?r[x]:undefined;}
function groundClass(x,y){const c=tileAt(x,y);if(c===undefined)return 0;if(c==='g'||inGlade(x,y))return 2;if(c==='m')return 1;return 0;}
function fieldPal(h,s,l,dh,dl,dl2){const b=hslRgb(h,s,l),a=hslRgb(h+dh/2,s,l+dl/2),z=hslRgb(h-dh/2,s,l-dl/2),p=hslRgb(h,s,l+dl2/2),q=hslRgb(h,s,l-dl2/2);
  return[b,[0,1,2].map(i=>a[i]-z[i]),[0,1,2].map(i=>p[i]-q[i])];}
function buildField(){
  const Hm=map.length,Wm=map[0].length,fw=Wm*FP,fh=Hm*FP,n=fw*fh,R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),rb=!!state.rainbow;
  const cls=new Uint8Array(Wm*Hm);for(let y=0;y<Hm;y++)for(let x=0;x<Wm;x++)cls[y*Wm+x]=groundClass(x,y);
  const pals=[fieldPal(99,54,57.5,16,7,3),fieldPal(78,64,65,14,6,2.5),rb?fieldPal(322,74,85,70,4,2):fieldPal(267,44,83,26,5,2)];
  const a3=hslRgb(336,74,85),b3=hslRgb(308,74,85),D3=[0,1,2].map(i=>(a3[i]-b3[i])/2);
  for(let py=0;py<fh;py++){const wy=(py+.5)/FP,ty=Math.floor(wy);
    for(let px=0;px<fw;px++){const wx=(px+.5)/FP,cl=cls[ty*Wm+Math.floor(wx)],P=pals[cl];
      const n1=vnoise(wx/3.4,wy/3.4)-.5,n2=vnoise(wx/1.3+31.7,wy/1.3+17.3)-.5,sn=cl===2&&rb?Math.sin((wx+wy)*.35):0,i=py*fw+px;
      R[i]=P[0][0]+n1*P[1][0]+n2*P[2][0]+sn*D3[0];G[i]=P[0][1]+n1*P[1][1]+n2*P[2][1]+sn*D3[1];B[i]=P[0][2]+n1*P[1][2]+n2*P[2][2]+sn*D3[2];}}
  const r=FP>>1;for(const A of[R,G,B]){boxBlur(A,fw,fh,r);boxBlur(A,fw,fh,r);}
  const cv=GFX.field&&GFX.field.width===fw&&GFX.field.height===fh?GFX.field:document.createElement('canvas');cv.width=fw;cv.height=fh;
  const g=cv.getContext('2d'),im=g.createImageData(fw,fh),d=im.data;
  for(let i=0;i<n;i++){d[i*4]=R[i];d[i*4+1]=G[i];d[i*4+2]=B[i];d[i*4+3]=255;}
  g.putImageData(im,0,0);GFX.field=cv;
}
function boxBlur(A,w,h,r){const T=new Float32Array(Math.max(w,h)),k=1/(2*r+1);
  for(let y=0;y<h;y++){const o=y*w;let s=0;for(let i=-r;i<=r;i++)s+=A[o+Math.min(w-1,Math.max(0,i))];
    for(let x=0;x<w;x++){T[x]=s*k;s+=A[o+Math.min(w-1,x+r+1)]-A[o+Math.max(0,x-r)];}for(let x=0;x<w;x++)A[o+x]=T[x];}
  for(let x=0;x<w;x++){let s=0;for(let i=-r;i<=r;i++)s+=A[Math.min(h-1,Math.max(0,i))*w+x];
    for(let y=0;y<h;y++){T[y]=s*k;s+=A[Math.min(h-1,y+r+1)*w+x]-A[Math.max(0,y-r)*w+x];}for(let y=0;y<h;y++)A[y*w+x]=T[y];}}
function mapSig(){let h=2166136261;for(let y=0;y<map.length;y++){const r=map[y];for(let x=0;x<r.length;x++){const c=r[x];h=Math.imul(h^(c?String(c).charCodeAt(0):0),16777619);}h=Math.imul(h^r.length,16777619);}
  return h+'|'+map.length+'|'+(state.rainbow?1:0)+'|'+ts+'|'+dpr;}
function gfxSync(){const sg=mapSig();if(sg!==GFX.sig){GFX.sig=sg;for(const ch of GFX.chunks.values())ch.stale=true;buildField();}}

// rounded "blob" autotile: adds one tile's piece of a smooth region (path, pond, bed) to the current path
function blobTile(x,y,s,e,r,is,fk){
  const X=x*s,Y=y*s,E=e*s,R=Math.min(r,.5-e)*s,h=s/2,u=is(x,y-1),d=is(x,y+1),l=is(x-1,y),rt=is(x+1,y);
  rrSub(X+E,Y+E,s-2*E,s-2*E,R);
  if(u)ctx.rect(X+E,Y,s-2*E,h);if(d)ctx.rect(X+E,Y+h,s-2*E,h);if(l)ctx.rect(X,Y+E,h,s-2*E);if(rt)ctx.rect(X+h,Y+E,h,s-2*E);
  const q=(a,b,dg,qx,qy,px,py,sx,sy)=>{if(!a||!b)return;if(dg){ctx.rect(X+qx,Y+qy,h,h);return;}
    const F=Math.max(0,e+(fk||0))*s;if(F<1)return;const Px=X+px,Py=Y+py;ctx.moveTo(Px,Py);ctx.lineTo(Px,Py-sy*F);ctx.arc(Px-sx*F,Py-sy*F,F,sx>0?0:Math.PI,sy>0?Math.PI/2:-Math.PI/2,sx*sy<0);ctx.closePath();};
  q(u,l,is(x-1,y-1),0,0,E,E,1,1);q(u,rt,is(x+1,y-1),h,0,s-E,E,-1,1);q(d,l,is(x-1,y+1),0,h,E,s-E,1,-1);q(d,rt,is(x+1,y+1),h,h,s-E,s-E,-1,-1);
}
function blobLayer(tiles,s,e,r,is,fill,fk){ctx.beginPath();for(const[x,y]of tiles)blobTile(x,y,s,e,r,is,fk);ctx.fillStyle=fill;ctx.fill();}
const isPathC=c=>c==='='||c==='H'||c==='B'||c==='M';
const isGrassy=c=>c==='.'||c==='m'||c==='g'||c==='T'||c==='F'||c==='G'||c==='K'||c==='C';

function grassTexture(x,y,c,s){
  const r=mulberry32(x*92821+y*68917+13),X=x*s,Y=y*s,cl=groundClass(x,y);
  const dark=cl===2?(state.rainbow?'rgba(220,110,180,.22)':'rgba(140,105,200,.22)'):cl===1?'rgba(105,150,35,.26)':'rgba(45,120,40,.22)';
  const lite=cl===2?'rgba(255,255,255,.38)':'rgba(240,255,200,.30)';
  if(r()<.3){ctx.fillStyle=r()<.5?'rgba(255,255,255,.05)':cl===2?'rgba(150,100,200,.04)':'rgba(40,110,30,.035)';ell(X+r()*s,Y+r()*s,s*(.25+r()*.25),s*(.15+r()*.15));ctx.fill();}
  ctx.lineCap='round';ctx.lineWidth=Math.max(1,s*.022);
  for(const col of[dark,lite]){ctx.beginPath();const n=col===dark?6:3;
    for(let i=0;i<n;i++){const bx=X+r()*s,by=Y+r()*s,hh=s*(.04+r()*.05),ln=(r()-.5)*s*.06;ctx.moveTo(bx,by);ctx.quadraticCurveTo(bx+ln*.2,by-hh*.6,bx+ln,by-hh);}
    ctx.strokeStyle=col;ctx.stroke();}
}
function flower(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();for(let i=0;i<5;i++){const a=i*1.2566+.3,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;ctx.moveTo(px+r*.78,py);ctx.arc(px,py,r*.78,0,Math.PI*2);}ctx.fill();
  ctx.fillStyle='#ffcf33';circ(x,y,r*.62);ctx.fill();}
function grassDeco(x,y,c,s){
  const r=mulberry32(x*15731+y*789221+7),X=x*s,Y=y*s,cl=groundClass(x,y),h=hash(x,y);
  ctx.lineCap='round';
  if(r()<(cl===1?.5:.32)){const tx=X+s*(.15+r()*.7),ty=Y+s*(.3+r()*.6),n=3+Math.floor(r()*3),hh=s*(.1+r()*.06);
    const cols=cl===2?(state.rainbow?['#e98bc8','#f6b6dc']:['#a98ad8','#c7b2ee']):['#4c9a3a','#6cbd4c'];
    for(let k=0;k<2;k++){ctx.strokeStyle=cols[k];ctx.lineWidth=Math.max(1.2,s*(k?.024:.034));ctx.beginPath();
      for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*1.1,bx=tx+(i-(n-1)/2)*s*.025;ctx.moveTo(bx,ty);ctx.quadraticCurveTo(bx+Math.sin(a)*hh*.3,ty-hh*.6,bx+Math.sin(a)*hh*.75,ty-hh*Math.cos(a)*(k?.9:1));}
      ctx.stroke();}}
  const pal=['#ffffff','#ffe14d','#ff9ad5','#c9a6ff','#ffb3c7'];
  if(cl===1){const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){const fx=X+s*(.12+r()*.76),fy=Y+s*(.12+r()*.76);
      ctx.strokeStyle='rgba(60,130,40,.6)';ctx.lineWidth=Math.max(1,s*.018);ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+s*.01,fy+s*.08);ctx.stroke();
      flower(fx,fy,s*(.03+r()*.015),pal[Math.floor(r()*5)]);}}
  else if(cl===2){if(r()<.3){const fx=X+s*(.15+r()*.7),fy=Y+s*(.15+r()*.7);flower(fx,fy,s*.03,state.rainbow?['#fff','#ffe14d','#9fd8ff','#c9a6ff'][Math.floor(r()*4)]:['#fff','#ffd6f0','#fff6a8'][Math.floor(r()*3)]);}
    if(c==='g'&&h>.96){ctx.fillStyle='rgba(90,60,120,.18)';ell(X+s*.5,Y+s*.66,s*.16,s*.05);ctx.fill();drawEmoji('🍄',X+s*.5,Y+s*.5,s*.35);}}
  else if(c==='.'&&r()<.12){const fx=X+s*(.15+r()*.7),fy=Y+s*(.15+r()*.7),col=pal[Math.floor(r()*5)];
    flower(fx,fy,s*.032,col);if(r()<.6)flower(fx+s*(r()<.5?-.1:.1),fy+s*.06,s*.026,pal[Math.floor(r()*5)]);}
  if(c==='.'){const nb=[[0,-1],[0,1],[-1,0],[1,0]].filter(([dx,dy])=>tileAt(x+dx,y+dy)==='W');
    if(nb.length>=2||(nb.length===1&&h<.4)){let ax=0,ay=0;for(const[dx,dy]of nb){ax+=dx;ay+=dy;}
      const bx=X+s*(.5+ax*.28),by=Y+s*(.55+ay*.28);
      for(let i=0;i<4;i++){const rx=bx+(i-1.5)*s*.07+(r()-.5)*s*.04,hh=s*(.3+r()*.18),lean=(r()-.5)*s*.08;
        ctx.strokeStyle='#4f9a3e';ctx.lineWidth=Math.max(1,s*.025);ctx.beginPath();ctx.moveTo(rx,by);ctx.quadraticCurveTo(rx,by-hh*.6,rx+lean,by-hh);ctx.stroke();
        if(i%2===0){ctx.fillStyle='#9a6038';ell(rx+lean*.85,by-hh*.95,s*.028,s*.075);ctx.fill();}}
      ctx.strokeStyle='#6cbd4c';ctx.lineWidth=Math.max(1,s*.022);ctx.beginPath();ctx.moveTo(bx-s*.12,by);ctx.quadraticCurveTo(bx-s*.2,by-s*.15,bx-s*.26,by-s*.18);ctx.moveTo(bx+s*.12,by);ctx.quadraticCurveTo(bx+s*.2,by-s*.12,bx+s*.27,by-s*.14);ctx.stroke();}}
}
function pathDeco(x,y,s){const r=mulberry32(x*3571+y*1987+5),X=x*s,Y=y*s;
  for(let i=0;i<5;i++){ctx.fillStyle='rgba(190,150,90,.35)';circ(X+s*(.18+r()*.64),Y+s*(.18+r()*.64),s*.012);ctx.fill();}
  const n=r()<.6?2:1;for(let i=0;i<n;i++){const px=X+s*(.22+r()*.56),py=Y+s*(.22+r()*.56),pr=s*(.035+r()*.03);
    ctx.fillStyle='#d2b07a';ell(px,py+pr*.25,pr*1.25,pr*.95);ctx.fill();ctx.fillStyle='#e9d3a6';ell(px,py,pr*1.2,pr*.85);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.55)';ell(px-pr*.4,py-pr*.3,pr*.4,pr*.25);ctx.fill();}}
function lilyPad(x,y,s,h){const cx=x*s+s*(.3+(h*7%1)*.4),cy=y*s+s*(.3+(h*13%1)*.4),r=s*.15,a=h*6;
  ctx.fillStyle='rgba(20,80,120,.18)';ell(cx+s*.02,cy+s*.03,r,r*.7);ctx.fill();
  ctx.fillStyle='#6fcf6a';ctx.strokeStyle='#3f9a4a';ctx.lineWidth=Math.max(1,s*.02);ctx.beginPath();ctx.ellipse(cx,cy,r,r*.72,0,a+.35,a+Math.PI*2-.15);ctx.lineTo(cx,cy);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a+2.5)*r*.7,cy+Math.sin(a+2.5)*r*.5);ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a+4)*r*.7,cy+Math.sin(a+4)*r*.5);ctx.stroke();
  if(h>.9){ctx.fillStyle='#ffb3d1';for(let i=0;i<6;i++){const b=i*1.047;ell(cx+Math.cos(b)*r*.22,cy-r*.15+Math.sin(b)*r*.14,r*.2,r*.13);ctx.fill();}ctx.fillStyle='#fff3a0';circ(cx,cy-r*.15,r*.12);ctx.fill();}}
function soilMound(X,Y,s,wet){
  ctx.fillStyle=wet?'rgba(40,20,10,.25)':'rgba(70,40,20,.18)';rr(X+s*.12,Y+s*.15,s*.76,s*.76,s*.18);ctx.fill();
  ctx.fillStyle=wet?'#6a4128':'#bb8452';ctx.strokeStyle=wet?'#4a2b19':'#94603a';ctx.lineWidth=Math.max(1,s*.028);rr(X+s*.12,Y+s*.11,s*.76,s*.76,s*.18);ctx.fill();ctx.stroke();
  ctx.lineCap='round';ctx.lineWidth=Math.max(1,s*.04);
  for(let i=0;i<3;i++){const yy=Y+s*(.32+i*.19);ctx.strokeStyle=wet?'rgba(35,18,8,.5)':'rgba(120,75,40,.55)';ctx.beginPath();ctx.moveTo(X+s*.25,yy);ctx.lineTo(X+s*.75,yy);ctx.stroke();
    ctx.strokeStyle=wet?'rgba(255,255,255,.10)':'rgba(255,240,210,.35)';ctx.beginPath();ctx.moveTo(X+s*.27,yy-s*.05);ctx.lineTo(X+s*.73,yy-s*.05);ctx.stroke();}
  if(wet){ctx.fillStyle='rgba(170,215,255,.45)';for(const[a,b]of[[.3,.24],[.62,.46],[.4,.66],[.7,.78]]){ell(X+s*a,Y+s*b,s*.035,s*.018);ctx.fill();}}
}

function buildChunk(ch){
  const s=ts,C=CHUNK*s,cv=ch.cv,g=cv.getContext('2d'),Wm=map[0].length,Hm=map.length;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  g.setTransform(dpr,0,0,dpr,-ch.cx*C*dpr,-ch.cy*C*dpr);
  const ax=Math.max(0,ch.cx*CHUNK-1),ay=Math.max(0,ch.cy*CHUNK-1),bx=Math.min(Wm,ch.cx*CHUNK+CHUNK+1),by=Math.min(Hm,ch.cy*CHUNK+CHUNK+1);
  if(bx<=ax||by<=ay)return;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(GFX.field,ax*FP,ay*FP,(bx-ax)*FP,(by-ay)*FP,ax*s,ay*s,(bx-ax)*s,(by-ay)*s);
  withCtx(g,()=>{
    const P=[],Wt=[],S=[],U=[],Gr=[];
    for(let y=ay;y<by;y++)for(let x=ax;x<bx;x++){const c=map[y][x];
      if(c==='=')P.push([x,y]);else if(c==='W')Wt.push([x,y]);else if(c==='S')S.push([x,y]);else if(KNOWN_TILES.indexOf(c)<0)U.push([x,y]);
      if(isGrassy(c)){Gr.push([x,y,c]);grassTexture(x,y,c,s);}}
    if(P.length){const is=(x,y)=>{const c=tileAt(x,y);return c===undefined||isPathC(c);};
      blobLayer(P,s,.05,.42,is,'rgba(90,110,30,.16)',.14);blobLayer(P,s,.085,.4,is,'#d9b97f',.14);blobLayer(P,s,.125,.36,is,'#f0d9a6',.14);
      blobLayer(P,s,.3,.2,is,'rgba(255,250,232,.38)',.14);for(const[x,y]of P)pathDeco(x,y,s);}
    if(Wt.length){const is=(x,y)=>{const c=tileAt(x,y);return c===undefined||c==='W';};
      blobLayer(Wt,s,0,.48,is,'rgba(60,110,40,.22)',.36);blobLayer(Wt,s,.035,.46,is,'#f4e7bd',.36);blobLayer(Wt,s,.09,.41,is,'#a4e9f7',.36);
      blobLayer(Wt,s,.15,.35,is,'#66cbf1',.36);blobLayer(Wt,s,.32,.18,is,'#52b9eb',.36);
      for(const[x,y]of Wt){const h=hash(x,y);if(h<.3){ctx.fillStyle='rgba(255,255,255,.16)';ell(x*s+s*(.3+h),y*s+s*(.4+h*.5),s*.18,s*.035);ctx.fill();}}
      for(const[x,y]of Wt){const h=hash(x,y);if(h>.8)lilyPad(x,y,s,h);}}
    if(S.length){const is=(x,y)=>{const c=tileAt(x,y);return c===undefined||c==='S';};
      blobLayer(S,s,-.02,.22,is,'rgba(70,60,20,.22)');blobLayer(S,s,.01,.2,is,'#8a5832');blobLayer(S,s,.04,.18,is,'#cf9a62');
      blobLayer(S,s,.1,.12,is,'#8d5b37');for(const[x,y]of S)soilMound(x*s,y*s,s,false);}
    for(const[x,y,c]of Gr)grassDeco(x,y,c,s);
    for(const[x,y]of U)ctx.clearRect(x*s,y*s,s,s);
  });
}
function chunkCanvas(){const c=GFX.pool.pop()||document.createElement('canvas'),n=Math.ceil(CHUNK*ts*dpr);if(c.width!==n||c.height!==n){c.width=n;c.height=n;}return c;}
function getChunk(cx,cy){const k=cy*4096+cx;let ch=GFX.chunks.get(k);
  if(!ch){ch={cx,cy,cv:chunkCanvas(),last:0};buildChunk(ch);GFX.chunks.set(k,ch);}ch.last=GFX.frame;return ch;}
function drawChunks(){
  const C=CHUNK*ts,ncx=Math.ceil(map[0].length/CHUNK),ncy=Math.ceil(map.length/CHUNK);GFX.frame++;
  const cr=m=>[Math.max(0,Math.floor((cam.x-m)/C)),Math.min(ncx-1,Math.floor((cam.x+vw+m)/C)),Math.max(0,Math.floor((cam.y-m)/C)),Math.min(ncy-1,Math.floor((cam.y+vh+m)/C))];
  const[a0,a1,b0,b1]=cr(0);let stale=3;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  for(let cy=b0;cy<=b1;cy++)for(let cx=a0;cx<=a1;cx++){const ch=getChunk(cx,cy),l=Math.round((cx*C-cam.x)*dpr),t=Math.round((cy*C-cam.y)*dpr);
    if(ch.stale&&stale>0){buildChunk(ch);ch.stale=false;stale--;}
    ctx.drawImage(ch.cv,l,t,Math.round(((cx+1)*C-cam.x)*dpr)-l,Math.round(((cy+1)*C-cam.y)*dpr)-t);}
  ctx.restore();
  let budget=stale>0?2:0;const[p0,p1,q0,q1]=cr(ts*1.5);
  for(let cy=q0;cy<=q1&&budget>0;cy++)for(let cx=p0;cx<=p1&&budget>0;cx++){const ch=GFX.chunks.get(cy*4096+cx);
    if(!ch){getChunk(cx,cy);budget--;}else if(ch.stale){buildChunk(ch);ch.stale=false;budget--;}}
  const maxN=(Math.ceil((vw+3*ts)/C)+1)*(Math.ceil((vh+3*ts)/C)+1);
  if(GFX.chunks.size>maxN){const arr=[...GFX.chunks.entries()].sort((a,b)=>a[1].last-b[1].last);
    while(GFX.chunks.size>maxN&&arr.length){const[k,ch]=arr.shift();if(ch.last>=GFX.frame)break;GFX.chunks.delete(k);GFX.pool.push(ch.cv);}}
}
function wetSprite(){return getSprite('soilwet',ts,ts,0,0,()=>soilMound(0,0,ts,true));}
function waterAnim(sx,sy,s,h,t){
  const ph=t*1.2+h*20,wx=sx+s*(.32+.36*(h*3%1))+Math.sin(ph*.5)*s*.05,wy=sy+s*(.35+.3*(h*5%1));
  ctx.lineCap='round';ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=Math.max(1.2,s*.024);
  ctx.beginPath();ctx.moveTo(wx-s*.11,wy);ctx.quadraticCurveTo(wx-s*.055,wy-s*.045,wx,wy);ctx.quadraticCurveTo(wx+s*.055,wy+s*.045,wx+s*.11,wy);ctx.stroke();
  if(h<.45){const k=(t*.35+h*7)%1;ctx.strokeStyle=`rgba(255,255,255,${(.45*(1-k)).toFixed(3)})`;ctx.lineWidth=Math.max(1,s*.018);
    ell(sx+s*(.42+h*.3),sy+s*(.6-h*.3),s*(.05+k*.19),s*(.025+k*.08));ctx.stroke();}
  const tw=Math.sin(t*2.1+h*50);if(tw>.55){const a=(tw-.55)/.45;twinkle(sx+s*(.25+.5*(h*11%1)),sy+s*(.25+.5*(h*17%1)),s*(.03+.05*a),a);}
}
function cloudSprite(){return getSprite('cloud',200,110,0,0,()=>{
  for(const[a,b,r]of[[60,60,42],[100,48,48],[145,58,42],[82,74,36],[124,76,38]]){const g=ctx.createRadialGradient(a,b,0,a,b,r);
    g.addColorStop(0,'rgba(30,60,80,.5)');g.addColorStop(1,'rgba(30,60,80,0)');ctx.fillStyle=g;ctx.fillRect(a-r,b-r,r*2,r*2);}},1);}
function drawCloudShadows(t){
  const s=ts,c=cloudSprite(),Wm=map[0].length,Hm=map.length,span=Wm+16;
  for(let i=0;i<6;i++){const w=(5+hash(i,3)*3)*s,hh=w*.55,wx=(((hash(i,5)*span+t*.22)%span)-8)*s,wy=(hash(i,9)*Hm+Math.sin(t*.03+i)*1.5)*s;
    const x=wx-cam.x,y=wy-cam.y-hh/2;if(x+w<0||x>vw||y+hh<0||y>vh)continue;ctx.globalAlpha=.15;ctx.drawImage(c,x,y,w,hh);}
  ctx.globalAlpha=1;
}

function drawGround(x0,y0,x1,y1,t){
  const s=ts;gfxSync();drawChunks();
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const c=map[y][x],sx=x*s-cam.x,sy=y*s-cam.y,h=hash(x,y);
    if(typeof drawTileExtra==='function'&&drawTileExtra(c,x,y,sx,sy,s,h,t))continue;
    if(c==='S'){const p=state.plots[x+','+y];if(p&&p.w&&stageOf(p)<3)drawSprite(wetSprite(),sx,sy);}
    else if(c==='W')waterAnim(sx,sy,s,h,t);
    else if(c==='g'){if(h>.88&&h<=.96)drawStar(sx+s*.5,sy+s*.5,s*.07*(1+.3*Math.sin(t*3+h*20)),'#fff6a8',false);}
    else if(KNOWN_TILES.indexOf(c)<0){ctx.fillStyle=groundColor(x,y,h);ctx.fillRect(sx,sy,s+1,s+1);}
  }
  drawCloudShadows(t);
}

// ---------- Props ----------
function drawFence(x,y,gold){
  const s=ts,cx=SX(x)+s/2,cy=SY(y)+s*.55;
  const isF=(xx,yy)=>{const r=map[yy];const c=r&&r[xx];return c==='F'||(c==='G'&&!state.gateOpen);};
  const wood=gold?'#ffd34d':'#d69c62',dark=gold?'#b88a00':'#8a552b',post=gold?'#ffcf33':'#c4844a',hi=gold?'rgba(255,255,255,.6)':'rgba(255,236,200,.55)';
  ctx.lineWidth=Math.max(1,s*.028);ctx.lineCap='round';
  if(isF(x+1,y))for(const ry of[cy-s*.31,cy-s*.11]){ctx.fillStyle=wood;ctx.strokeStyle=dark;rr(cx,ry,s,s*.1,s*.045);ctx.fill();ctx.stroke();
    ctx.strokeStyle=hi;ctx.beginPath();ctx.moveTo(cx+s*.1,ry+s*.032);ctx.lineTo(cx+s*.9,ry+s*.032);ctx.stroke();}
  if(isF(x,y+1)){ctx.fillStyle=wood;ctx.strokeStyle=dark;rr(cx-s*.05,cy,s*.1,s,s*.045);ctx.fill();ctx.stroke();
    ctx.strokeStyle=hi;ctx.beginPath();ctx.moveTo(cx-s*.018,cy+s*.1);ctx.lineTo(cx-s*.018,cy+s*.9);ctx.stroke();}
  ctx.fillStyle='rgba(50,70,20,.18)';ell(cx,cy+s*.08,s*.12,s*.04);ctx.fill();
  ctx.fillStyle=post;ctx.strokeStyle=dark;rr(cx-s*.085,cy-s*.44,s*.17,s*.52,s*.07);ctx.fill();ctx.stroke();
  ctx.fillStyle=hi;rr(cx-s*.055,cy-s*.36,s*.035,s*.36,s*.018);ctx.fill();ell(cx,cy-s*.405,s*.05,s*.022);ctx.fill();
  if(gold){drawStar(cx,cy-s*.5,s*.075,'#fff6a8',false);}
}
function drawGate(x,y,t){
  const s=ts,cx=SX(x)+s/2,cy=SY(y)+s*.5;
  if(!state.gateOpen){drawFence(x,y,true);drawEmoji('🔒',cx,cy-s*.15,s*.45);
    const k=Math.sin(t*2.5);if(k>.3)twinkle(cx+s*.22,cy-s*.4,s*.08*k,k);}
  else{const g=glowSprite('#fff6a8'),p=1+Math.sin(t*2)*.08;ctx.globalAlpha=.55;ctx.drawImage(g,cx-s*.6*p,cy-s*.6*p,s*1.2*p,s*1.2*p);ctx.globalAlpha=1;
    for(let i=0;i<3;i++){const a=t*2+i*2.1;drawStar(cx+Math.cos(a)*s*.3,cy+Math.sin(a)*s*.25,s*.07,['#fff6a8','#ffb3e6','#b3e6ff'][i],true);}}
}
function treeKind(h){return h>=.72?3:h<.1?1:h<.2?2:0;}
function treeSprite(kind){const s=ts;return getSprite('tree'+kind,1.6*s,1.85*s,.8*s,1.65*s,()=>{
  ctx.lineJoin='round';ctx.lineCap='round';
  if(kind===3){
    ctx.fillStyle='#9b6a43';ctx.strokeStyle='#6e4426';ctx.lineWidth=s*.035;rr(-s*.07,-s*.32,s*.14,s*.34,s*.04);ctx.fill();ctx.stroke();
    const tiers=[[-.3,.47,.52],[-.6,.39,.48],[-.88,.3,.43],[-1.13,.2,.36]];
    for(const[b,w,hh]of tiers){const top=b-hh;
      const path=()=>{ctx.beginPath();ctx.moveTo(0,top*s);ctx.quadraticCurveTo(w*.35*s,(top+hh*.55)*s,w*s,b*s);
        ctx.quadraticCurveTo(w*.5*s,(b+.09)*s,0,(b+.05)*s);ctx.quadraticCurveTo(-w*.5*s,(b+.09)*s,-w*s,b*s);ctx.quadraticCurveTo(-w*.35*s,(top+hh*.55)*s,0,top*s);ctx.closePath();};
      path();ctx.fillStyle='#3f9f66';ctx.fill();ctx.strokeStyle='#2a7148';ctx.lineWidth=s*.04;ctx.stroke();
      ctx.save();path();ctx.clip();ctx.fillStyle='#57b97a';ctx.fillRect(-w*s,top*s,w*s*.85,(hh+.2)*s);ctx.fillStyle='rgba(20,70,40,.18)';ell(0,(b+.06)*s,w*s,.07*s);ctx.fill();ctx.restore();}
    ctx.fillStyle='rgba(255,255,255,.35)';ell(-s*.05,-s*1.4,s*.04,s*.025);ctx.fill();
    return;}
  ctx.fillStyle='#a06a3f';ctx.strokeStyle='#6e4426';ctx.lineWidth=s*.035;ctx.beginPath();ctx.moveTo(-s*.14,0);ctx.quadraticCurveTo(-s*.07,-s*.06,-s*.075,-s*.5);
  ctx.lineTo(s*.075,-s*.5);ctx.quadraticCurveTo(s*.07,-s*.06,s*.14,0);ctx.quadraticCurveTo(0,s*.03,-s*.14,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,220,180,.35)';ctx.beginPath();ctx.moveTo(-s*.03,-s*.08);ctx.lineTo(-s*.035,-s*.42);ctx.stroke();
  const B=[[-.33,-.66,.27],[.33,-.68,.27],[0,-.62,.3],[-.22,-.98,.29],[.22,-1.0,.29],[0,-1.22,.26]];
  ctx.strokeStyle='#2c7a3a';ctx.lineWidth=s*.05;for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.stroke();}
  ctx.fillStyle='#3e9a47';for(const[a,b,r]of B){circ(a*s,b*s,r*s);ctx.fill();}
  ctx.fillStyle='#55b552';for(const[a,b,r]of B){circ((a-.03)*s,(b-.045)*s,r*.84*s);ctx.fill();}
  ctx.fillStyle='#74cc62';for(const[a,b,r]of B.slice(2)){circ((a-.08)*s,(b-.1)*s,r*.5*s);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.22)';for(const[a,b,r]of B.slice(3)){ell((a-.12)*s,(b-.16)*s,r*.2*s,r*.12*s);ctx.fill();}
  const D=[[-.3,-.62],[.18,-.75],[-.12,-.96],[.3,-1.0],[.02,-1.2],[-.36,-.9],[.4,-.62]];
  if(kind===1)for(const[a,b]of D){ctx.fillStyle='#ffb3d1';for(let i=0;i<5;i++){const q=i*1.2566;circ((a+Math.cos(q)*.035)*s,(b+Math.sin(q)*.035)*s,.03*s);ctx.fill();}ctx.fillStyle='#fff3a0';circ(a*s,b*s,.022*s);ctx.fill();}
  if(kind===2)for(const[a,b]of D.slice(0,6)){ctx.fillStyle='#ff5a5f';circ(a*s,b*s,.06*s);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';circ((a-.02)*s,(b-.02)*s,.017*s);ctx.fill();}
});}
function drawTree(x,y){
  const s=ts,h=hash(x,y),cx=SX(x)+s/2,sy=SY(y),base=sy+s*.9,spr=treeSprite(treeKind(h));
  shadow(cx,base,s*.44,s*.14);
  const k=Math.sin(nowS()*1.1+h*12)*.022;
  ctx.save();ctx.translate(cx,base);ctx.transform(1,0,k,1,0,0);ctx.drawImage(spr,-spr._ox,-spr._oy,spr._w,spr._h);ctx.restore();
}

// ---------- Buildings (cached sprites + small live details) ----------
function houseSprite(){const s=ts;return getSprite('house',4.8*s,4.6*s,.4*s,.25*s,()=>{
  const x=0,y=0,w=4*s;ctx.lineJoin='round';ctx.lineCap='round';
  shadow(x+w/2,y+3.98*s,w*.56,s*.3);
  ctx.fillStyle='#d98a6a';ctx.strokeStyle='#a85f45';ctx.lineWidth=Math.max(1,s*.04);rr(x+2.85*s,y+.45*s,.42*s,.9*s,s*.04);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(140,70,50,.35)';ctx.lineWidth=s*.02;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(x+2.87*s,y+(.45+i*.2)*s);ctx.lineTo(x+3.25*s,y+(.45+i*.2)*s);ctx.stroke();}
  ctx.fillStyle='#c9765a';ctx.strokeStyle='#a85f45';ctx.lineWidth=s*.04;rr(x+2.79*s,y+.38*s,.54*s,.14*s,s*.05);ctx.fill();ctx.stroke();
  // walls
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#fff6e3';ctx.strokeStyle='#d8ae7c';rr(x+.22*s,y+1.65*s,w-.44*s,2.3*s,s*.1);ctx.fill();ctx.stroke();
  ctx.save();rr(x+.22*s,y+1.65*s,w-.44*s,2.3*s,s*.1);ctx.clip();
  ctx.strokeStyle='rgba(216,174,124,.22)';ctx.lineWidth=s*.025;for(let i=1;i<8;i++){const yy=y+(1.65+i*.29)*s;ctx.beginPath();ctx.moveTo(x+.22*s,yy);ctx.lineTo(x+w-.22*s,yy);ctx.stroke();}
  ctx.fillStyle='rgba(120,70,30,.10)';ctx.fillRect(x+.22*s,y+1.65*s,w,s*.22);
  ctx.fillStyle='#ead2ad';ctx.fillRect(x+.22*s,y+3.72*s,w-.44*s,.25*s);
  ctx.fillStyle='#dcc19a';for(let i=0;i<9;i++){rr(x+(.3+i*.4)*s,y+3.77*s,.32*s,.14*s,.06*s);ctx.fill();}
  ctx.restore();
  // roof
  const roof=()=>{ctx.beginPath();ctx.moveTo(x-.08*s,y+1.95*s);ctx.lineTo(x+w/2,y+.2*s);ctx.lineTo(x+w+.08*s,y+1.95*s);ctx.closePath();};
  roof();ctx.fillStyle='#f4739f';ctx.fill();
  ctx.save();roof();ctx.clip();
  for(let r=0;r<6;r++){const yy=y+(.48+r*.3)*s;ctx.fillStyle=r%2?'#f78bb0':'#f27aa6';ctx.strokeStyle='rgba(190,50,100,.35)';ctx.lineWidth=s*.025;
    for(let i=-1;i<15;i++){const xx=x+(i*.3+(r%2)*.15)*s;ctx.beginPath();ctx.arc(xx,yy,.15*s,0,Math.PI);ctx.fill();ctx.stroke();}}
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(x+w/2,y+.2*s);ctx.lineTo(x+.3*s,y+1.8*s);ctx.lineTo(x+.9*s,y+1.8*s);ctx.closePath();ctx.fill();
  ctx.restore();
  roof();ctx.strokeStyle='#c4436f';ctx.lineWidth=s*.07;ctx.stroke();
  ctx.fillStyle='#e8578d';ctx.strokeStyle='#c4436f';ctx.lineWidth=s*.035;rr(x-.14*s,y+1.88*s,w+.28*s,.16*s,.08*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)';rr(x-.06*s,y+1.905*s,w+.12*s,.04*s,.02*s);ctx.fill();
  // attic window
  ctx.fillStyle='#c8ecff';circ(x+w/2,y+1.25*s,.27*s);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;ctx.stroke();
  ctx.strokeStyle='#c4436f';ctx.lineWidth=s*.02;circ(x+w/2,y+1.25*s,.31*s);ctx.stroke();drawEmoji('💗',x+w/2,y+1.25*s,.3*s);
  // windows
  for(const wx of[x+.5*s,x+3.05*s]){const wy=y+2.3*s;
    ctx.fillStyle='rgba(120,70,30,.12)';rr(wx-.02*s,wy+.04*s,.76*s,.74*s,.1*s);ctx.fill();
    ctx.fillStyle='#a8dcff';rr(wx,wy,.7*s,.7*s,.1*s);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(wx+.08*s,wy+.5*s);ctx.lineTo(wx+.42*s,wy+.08*s);ctx.lineTo(wx+.56*s,wy+.08*s);ctx.lineTo(wx+.16*s,wy+.6*s);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffc2dc';for(const sd of[0,1]){const ex=sd?wx+.7*s:wx;ctx.beginPath();ctx.moveTo(ex,wy);ctx.lineTo(ex+(sd?-.22:.22)*s,wy);ctx.quadraticCurveTo(ex+(sd?-.05:.05)*s,wy+.25*s,ex,wy+.45*s);ctx.closePath();ctx.fill();}
    ctx.strokeStyle='#fff';ctx.lineWidth=s*.06;rr(wx,wy,.7*s,.7*s,.1*s);ctx.stroke();
    ctx.beginPath();ctx.moveTo(wx+.35*s,wy);ctx.lineTo(wx+.35*s,wy+.7*s);ctx.moveTo(wx,wy+.35*s);ctx.lineTo(wx+.7*s,wy+.35*s);ctx.stroke();
    ctx.fillStyle='#b07a4a';ctx.strokeStyle='#8a5129';ctx.lineWidth=s*.025;rr(wx-.06*s,y+3.0*s,.82*s,.16*s,.05*s);ctx.fill();ctx.stroke();
    ctx.fillStyle='#5fb45a';for(let i=0;i<5;i++){ell(wx+(.03+i*.16)*s,y+2.99*s,.07*s,.045*s);ctx.fill();}
    ['#ff7eb6','#ffd34d','#c9a6ff','#ff7eb6'].forEach((c,i)=>flower(wx+(.1+i*.2)*s,y+2.95*s,.038*s,c));}
  // door
  const dx=x+2.12*s;ctx.fillStyle='rgba(120,70,30,.15)';rr(dx-.06*s,y+2.7*s,.88*s,1.26*s,.3*s);ctx.fill();
  ctx.fillStyle='#bd7a45';ctx.strokeStyle='#8a5129';ctx.lineWidth=s*.04;rr(dx,y+2.75*s,.76*s,1.2*s,.25*s);ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(120,70,35,.35)';ctx.lineWidth=s*.02;for(const k of[.25,.5]){ctx.beginPath();ctx.moveTo(dx+k*s*1.02,y+2.82*s);ctx.lineTo(dx+k*s*1.02,y+3.92*s);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.18)';rr(dx+.06*s,y+2.85*s,.12*s,1.0*s,.06*s);ctx.fill();
  ctx.fillStyle='#ffd34d';ctx.strokeStyle='#c99a1a';ctx.lineWidth=s*.015;circ(dx+.6*s,y+3.4*s,.06*s);ctx.fill();ctx.stroke();drawEmoji('💖',dx+.38*s,y+3.05*s,.25*s);
  ctx.fillStyle='#e3d6c2';ctx.strokeStyle='#bfae95';ctx.lineWidth=s*.02;rr(dx-.1*s,y+3.9*s,.96*s,.13*s,.06*s);ctx.fill();ctx.stroke();
  // bushes
  for(const[bx,by]of[[x+.25*s,y+3.85*s],[x+3.75*s,y+3.85*s]]){ctx.fillStyle='#4fa64a';ctx.strokeStyle='#3a8a3c';ctx.lineWidth=s*.025;
    for(const[a,b,r]of[[-.13,.02,.14],[.13,.02,.14],[0,-.08,.16]]){circ(bx+a*s,by+b*s,r*s);ctx.fill();ctx.stroke();}
    ctx.fillStyle='#5fb85a';for(const[a,b,r]of[[-.13,.02,.14],[.13,.02,.14],[0,-.08,.16]]){circ(bx+a*s,by+b*s,r*s*.92);ctx.fill();}
    for(const[a,b]of[[-.1,-.02],[.08,-.1],[.14,.06]])flower(bx+a*s,by+b*s,.03*s,'#ff9ad5');}
});}
function drawHouse(){
  const s=ts,x=SX(3),y=SY(2),T=nowS();drawSprite(houseSprite(),x,y);
  for(let i=0;i<3;i++){const k=(T*.28+i/3)%1,px=x+3.06*s+Math.sin(k*5+i)*s*.12+k*s*.25,py=y+.3*s-k*s*.9;
    ctx.fillStyle=`rgba(255,255,255,${(.55*(1-k)).toFixed(3)})`;circ(px,py,s*(.08+k*.13));ctx.fill();}
}
function barnSprite(){const s=ts;return getSprite('barn',2.6*s,2.5*s,.3*s,.3*s,()=>{
  const x=0,y=0,w=2*s;ctx.lineJoin='round';ctx.lineCap='round';shadow(x+w/2,y+2*s,w*.6,s*.22);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#e85d5d';ctx.strokeStyle='#a83232';rr(x+.1*s,y+.85*s,w-.2*s,1.12*s,s*.06);ctx.fill();ctx.stroke();
  ctx.save();rr(x+.1*s,y+.85*s,w-.2*s,1.12*s,s*.06);ctx.clip();ctx.strokeStyle='rgba(140,30,30,.25)';ctx.lineWidth=s*.02;
  for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(x+(.1+i*.18)*s,y+.85*s);ctx.lineTo(x+(.1+i*.18)*s,y+2*s);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x+.1*s,y+.85*s,.25*s,1.2*s);ctx.restore();
  ctx.fillStyle='#fff';rr(x+.1*s,y+.85*s,.1*s,1.12*s,.04*s);ctx.fill();rr(x+w-.2*s,y+.85*s,.1*s,1.12*s,.04*s);ctx.fill();
  const roof=()=>{ctx.beginPath();ctx.moveTo(x-.07*s,y+.97*s);ctx.lineTo(x+.33*s,y+.35*s);ctx.lineTo(x+w/2,y+.04*s);ctx.lineTo(x+w-.33*s,y+.35*s);ctx.lineTo(x+w+.07*s,y+.97*s);ctx.closePath();};
  roof();ctx.fillStyle='#a8474a';ctx.fill();ctx.save();roof();ctx.clip();ctx.strokeStyle='rgba(90,20,30,.3)';ctx.lineWidth=s*.022;
  for(let i=1;i<7;i++){ctx.beginPath();ctx.moveTo(x-.1*s,y+(.04+i*.15)*s);ctx.lineTo(x+w+.1*s,y+(.04+i*.15)*s);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x,y,w/2,s);ctx.restore();
  roof();ctx.strokeStyle='#fff';ctx.lineWidth=s*.07;ctx.stroke();
  ctx.fillStyle='#c84444';ctx.fillRect(x+.6*s,y+1.15*s,.8*s,.8*s);ctx.strokeStyle='#fff';ctx.lineWidth=s*.065;ctx.strokeRect(x+.6*s,y+1.15*s,.8*s,.8*s);
  ctx.beginPath();ctx.moveTo(x+.6*s,y+1.15*s);ctx.lineTo(x+1.4*s,y+1.95*s);ctx.moveTo(x+1.4*s,y+1.15*s);ctx.lineTo(x+.6*s,y+1.95*s);ctx.stroke();
  ctx.fillStyle='#ffe08a';circ(x+w/2,y+.6*s,.17*s);ctx.fill();ctx.save();circ(x+w/2,y+.6*s,.17*s);ctx.clip();
  ctx.strokeStyle='#e0b84a';ctx.lineWidth=s*.02;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(x+(.85+i*.06)*s,y+.75*s);ctx.lineTo(x+(.88+i*.05)*s,y+.48*s);ctx.stroke();}ctx.restore();
  ctx.strokeStyle='#fff';ctx.lineWidth=s*.05;circ(x+w/2,y+.6*s,.17*s);ctx.stroke();
  ctx.strokeStyle='#8a5a33';ctx.lineWidth=s*.03;ctx.beginPath();ctx.moveTo(x+w/2,y+.04*s);ctx.lineTo(x+w/2,y-.18*s);ctx.stroke();
  ctx.fillStyle='#ff6fa8';ctx.beginPath();const hx=x+w/2,hy=y-.22*s,r=.07*s;ctx.moveTo(hx,hy+r*1.2);ctx.bezierCurveTo(hx-r*1.8,hy,hx-r*.6,hy-r*1.3,hx,hy-r*.4);ctx.bezierCurveTo(hx+r*.6,hy-r*1.3,hx+r*1.8,hy,hx,hy+r*1.2);ctx.fill();
  for(const bx of[x+.05*s,x+w-.05*s]){ctx.fillStyle='#f3cf62';ctx.strokeStyle='#c9a13a';ctx.lineWidth=s*.02;rr(bx-.17*s,y+1.72*s,.34*s,.26*s,.06*s);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(bx-.12*s,y+1.8*s);ctx.lineTo(bx+.12*s,y+1.8*s);ctx.moveTo(bx-.12*s,y+1.9*s);ctx.lineTo(bx+.12*s,y+1.9*s);ctx.stroke();}
});}
function drawBarn(){drawSprite(barnSprite(),SX(3),SY(12));}
function marketSprite(){const s=ts;return getSprite('market',3.6*s,2.85*s,.3*s,.6*s,()=>{
  const x=0,y=0,w=3*s;ctx.lineJoin='round';ctx.lineCap='round';shadow(x+w/2,y+2*s,w*.55,s*.2);
  ctx.fillStyle='#a8703f';ctx.strokeStyle='#7a4a24';ctx.lineWidth=s*.025;rr(x+.15*s,y+.4*s,.15*s,1.5*s,.04*s);ctx.fill();ctx.stroke();rr(x+w-.3*s,y+.4*s,.15*s,1.5*s,.04*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(80,40,20,.15)';ctx.fillRect(x+.3*s,y+.62*s,w-.6*s,.5*s);
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#d9a066';ctx.strokeStyle='#8e5a2e';rr(x+.05*s,y+1.15*s,w-.1*s,.82*s,s*.08);ctx.fill();ctx.stroke();
  ctx.save();rr(x+.05*s,y+1.15*s,w-.1*s,.82*s,s*.08);ctx.clip();ctx.strokeStyle='rgba(120,70,30,.3)';ctx.lineWidth=s*.02;
  for(let i=1;i<10;i++){ctx.beginPath();ctx.moveTo(x+i*.3*s,y+1.3*s);ctx.lineTo(x+i*.3*s,y+2*s);ctx.stroke();}
  ctx.fillStyle='#c4864c';ctx.fillRect(x,y+1.15*s,w,.16*s);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(x,y+1.17*s,w,.04*s);ctx.restore();
  ['🥕','🍓','🥚','🌻','🍓'].forEach((e,i)=>drawEmoji(e,x+(.35+i*.58)*s,y+1.08*s,s*.38));
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(x-.05*s,y+.12*s);ctx.lineTo(x+w+.05*s,y+.12*s);ctx.lineTo(x+w+.05*s,y+.55*s);ctx.lineTo(x-.05*s,y+.55*s);ctx.closePath();ctx.fill();
  for(let i=0;i<6;i++){const sx=x+i*w/6;ctx.fillStyle=i%2?'#fff':'#ff7eb6';ctx.fillRect(sx,y+.12*s,w/6+.5,.45*s);circ(sx+w/12,y+.57*s,w/12);ctx.fill();
    ctx.strokeStyle=i%2?'rgba(230,150,190,.6)':'#e0609c';ctx.lineWidth=s*.02;ctx.beginPath();ctx.arc(sx+w/12,y+.57*s,w/12,0,Math.PI);ctx.stroke();}
  ctx.fillStyle='rgba(255,255,255,.3)';ctx.fillRect(x,y+.14*s,w,.06*s);
  ctx.fillStyle='#e0609c';rr(x-.08*s,y+.04*s,w+.16*s,.12*s,.06*s);ctx.fill();
  ctx.strokeStyle='#a8703f';ctx.lineWidth=s*.025;ctx.beginPath();ctx.moveTo(x+w/2-.5*s,y+.06*s);ctx.lineTo(x+w/2-.55*s,y-.1*s);ctx.moveTo(x+w/2+.5*s,y+.06*s);ctx.lineTo(x+w/2+.55*s,y-.1*s);ctx.stroke();
  ctx.fillStyle='#fff';ctx.strokeStyle='#ff7eb6';ctx.lineWidth=s*.05;rr(x+w/2-.75*s,y-.32*s,1.5*s,.44*s,s*.12);ctx.fill();ctx.stroke();
  ctx.fillStyle='#d94f9b';ctx.font=`bold ${Math.round(s*.27)}px "Chalkboard SE","Comic Sans MS",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MARKET',x+w/2,y-.1*s);
  drawEmoji('⭐',x+w/2-.86*s,y-.1*s,s*.2);drawEmoji('⭐',x+w/2+.86*s,y-.1*s,s*.2);
});}
function drawMarket(){drawSprite(marketSprite(),SX(16),SY(21));}
function drawStone(t){
  const s=ts,x=SX(37),y=SY(14);shadow(x+s/2,y+s*.95,s*.48,s*.13);
  if(state.rainbow){const g=glowSprite('#fff6a8'),p=1+Math.sin(t*2)*.06;ctx.globalAlpha=.6;ctx.drawImage(g,x+s/2-s*.8*p,y+s*.48-s*.8*p,s*1.6*p,s*1.6*p);ctx.globalAlpha=1;}
  ctx.lineWidth=Math.max(1,s*.04);ctx.fillStyle='#c7c0d8';ctx.strokeStyle='#8d86a3';rr(x+.12*s,y+.05*s,.76*s,.9*s,.3*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)';rr(x+.2*s,y+.13*s,.18*s,.5*s,.09*s);ctx.fill();
  ctx.fillStyle='rgba(90,80,120,.12)';rr(x+.6*s,y+.2*s,.2*s,.7*s,.1*s);ctx.fill();
  ctx.fillStyle='#8fcf6a';ell(x+.3*s,y+.9*s,.17*s,.06*s);ctx.fill();ell(x+.72*s,y+.92*s,.12*s,.05*s);ctx.fill();
  flower(x+.2*s,y+.9*s,.028*s,'#ffb3d1');flower(x+.8*s,y+.9*s,.026*s,'#c9a6ff');
  starPath(x+s/2,y+.48*s,s*.2);
  if(state.rainbow){ctx.fillStyle='#fff6a8';ctx.fill();ctx.strokeStyle='#ffcf33';ctx.lineWidth=s*.02;ctx.stroke();STARS.forEach((st,i)=>{const a=Math.PI+(i+.5)*Math.PI/7;drawStar(x+s/2+Math.cos(a)*s*.62,y+.55*s+Math.sin(a)*s*.62,s*.11,st.c,true);});}
  else{ctx.fillStyle='rgba(120,110,150,.25)';ctx.fill();ctx.strokeStyle='#8d86a3';ctx.stroke();}
}

// ---------- Characters ----------
function drawPerson(x,y,face,dress,flip,walkT,moving,opts){
  opts=opts||{};const s=ts,T=nowS(),seated=!!opts.seated;walkT=walkT||0;
  ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.lineCap='round';ctx.lineJoin='round';
  const top=seated?-.48:-.52,bot=seated?-.2:-.16,line='rgba(70,30,70,.38)',lw=Math.max(1,s*.024);
  const shoe=shadeHex(dress,-.45),legC='#86669a',skin='#ffd8b5';
  let bob=0;
  if(!seated){shadow(0,0,s*.26,s*.08);
    bob=moving?-Math.abs(Math.sin(walkT))*s*.035:Math.sin(T*2.2)*s*.004;
    const sw=moving?Math.sin(walkT)*s*.05:0;
    for(const[lx,lift]of[[-.065,Math.max(0,sw)],[.065,Math.max(0,-sw)]]){
      ctx.fillStyle=legC;rr(lx*s-s*.037,-s*.22+bob,s*.074,s*.21-lift-bob,s*.03);ctx.fill();
      ctx.fillStyle=shoe;ell(lx*s+s*.008,-s*.025-lift,s*.06,s*.036);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';ell(lx*s-s*.008,-s*.038-lift,s*.022,s*.011);ctx.fill();}
  }else{ctx.fillStyle=legC;rr(s*.0,s*bot-s*.04,s*.074,s*.17,s*.03);ctx.fill();ctx.fillStyle=shoe;ell(s*.045,s*bot+s*.13,s*.06,s*.036);ctx.fill();}
  ctx.translate(0,bob);
  const as=moving?Math.sin(walkT)*.35:Math.sin(T*1.6)*.05;
  const arm=(side,front)=>{const sx=side*s*.115,sy=s*(top+.07),a=(side>0?-.42:.42)+(front?as:-as)*side,ex=sx+Math.sin(-a)*s*.17,ey=sy+Math.cos(a)*s*.17;
    ctx.strokeStyle=line;ctx.lineWidth=s*.07+lw;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle=skin;ctx.lineWidth=s*.07;ctx.stroke();ctx.fillStyle=skin;circ(ex,ey,s*.045);ctx.fill();
    ctx.fillStyle=dress;circ(sx,sy+s*.01,s*.055);ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();};
  arm(-1,false);
  const bw=seated?.23:.25,tw=.12,dressPath=()=>{ctx.beginPath();ctx.moveTo(-tw*s,top*s);ctx.lineTo(tw*s,top*s);
    ctx.quadraticCurveTo((tw+.03)*s,(top+bot)/2*s,bw*s,bot*s);ctx.quadraticCurveTo(0,(bot+.06)*s,-bw*s,bot*s);ctx.quadraticCurveTo(-(tw+.03)*s,(top+bot)/2*s,-tw*s,top*s);ctx.closePath();};
  dressPath();ctx.fillStyle=dress;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();
  ctx.save();dressPath();ctx.clip();ctx.fillStyle='rgba(60,0,60,.10)';ctx.fillRect(s*.07,top*s,s*.3,s*.6);
  ctx.fillStyle='rgba(255,255,255,.25)';ell(-s*.1,(top+bot)/2*s,s*.035,s*.13);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.75)';for(let i=-3;i<=3;i++){const px=i*.068,py=bot+.03*(1-(px/bw)*(px/bw))-.025;circ(px*s,py*s,s*.016);ctx.fill();}
  ctx.restore();
  if(opts.apron){ctx.fillStyle='#fff';ctx.strokeStyle='rgba(120,140,170,.5)';ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(-s*.08,s*(top+.1));ctx.lineTo(s*.08,s*(top+.1));ctx.lineTo(s*.15,s*(bot+.01));ctx.quadraticCurveTo(0,s*(bot+.04),-s*.15,s*(bot+.01));ctx.closePath();ctx.fill();ctx.stroke();
    rr(-s*.05,s*(top+.2),s*.1,s*.07,s*.02);ctx.stroke();}
  ctx.fillStyle='#fff';ell(-s*.045,s*(top+.015),s*.055,s*.03);ctx.fill();ell(s*.045,s*(top+.015),s*.055,s*.03);ctx.fill();
  arm(1,true);
  drawEmoji(face,0,s*(top-.2)+(moving?0:Math.sin(T*2.2+.6)*s*.004),s*.56);
  ctx.restore();
}
function drawHorse(x,y,o){
  o=o||{};const s=ts*(o.scale||1),T=nowS(),wt=o.walkT||0,mv=!!o.moving,cols=(o.mane&&o.mane.length)?o.mane:['#ff8cc6','#ff6fb5'];
  const body=o.body||'#fff',bv=hexRgb(body),line=bv?`rgb(${bv.map((c,i)=>Math.round((c*.6+[95,45,115][i]*.4)*.82)).join(',')})`:'rgba(95,55,105,.6)',lw=Math.max(1,s*.024),seed=strSeed(body)+(o.horn?2.3:0)+(o.wings?1.1:0);
  ctx.save();ctx.translate(x,y);if(o.flip)ctx.scale(-1,1);ctx.lineCap='round';ctx.lineJoin='round';
  shadow(0,0,s*.42,s*.1);
  const bob=mv?-Math.abs(Math.sin(wt))*s*.05:Math.sin(T*2.1+seed)*s*.006;
  // legs (far ones tinted darker), all behind the body
  for(const[lx,ph,far]of[[-.12,Math.PI,1],[.23,0,1],[-.2,0,0],[.15,Math.PI,0]]){
    const sw=mv?Math.sin(wt+ph):0,fx=lx*s+sw*s*.075,lift=mv?Math.max(0,Math.cos(wt+ph))*s*.07:0,hx=lx*s,hy=-.38*s+bob,fy=-lift-.05*s;
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(fx,fy);ctx.strokeStyle=line;ctx.lineWidth=s*.1+lw*2;ctx.stroke();
    ctx.strokeStyle=body;ctx.lineWidth=s*.1;ctx.stroke();if(far){ctx.strokeStyle='rgba(70,30,90,.16)';ctx.stroke();}
    ctx.fillStyle=o.hoof||'#a0643a';ctx.strokeStyle=line;ctx.lineWidth=lw;rr(fx-s*.06,-lift-s*.07,s*.12,s*.07,s*.03);ctx.fill();ctx.stroke();}
  // tail
  ctx.save();ctx.translate(-.27*s,-.52*s+bob);ctx.rotate(Math.sin(T*2.4+seed)*.13+(mv?Math.sin(wt)*.22:0));
  const n=Math.max(3,Math.min(7,cols.length)),sw=s*.22/n*1.3,strand=d=>{ctx.beginPath();ctx.moveTo(d*.25*.87,d*.25*.49);
    ctx.bezierCurveTo(-s*.2+d*.87,-s*.12+d*.49,-s*.34+d*.87,s*.1+d*.49,-s*.2+d*.6*.87,s*.36+d*.6*.49);};
  ctx.strokeStyle=line;ctx.lineWidth=sw+lw*2;for(let i=0;i<n;i++){strand((i-(n-1)/2)*s*.22/n);ctx.stroke();}
  for(let i=0;i<n;i++){const d=(i-(n-1)/2)*s*.22/n;ctx.strokeStyle=cols[i%cols.length];ctx.lineWidth=sw;strand(d);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=s*.02;strand(-s*.05);ctx.stroke();
  ctx.restore();
  // wings
  const wc=typeof o.wings==='string'?o.wings:'#ffffff',flap=mv?Math.sin(T*10+seed)*.45:Math.sin(T*2.4+seed)*.16;
  const wing=far=>{ctx.save();ctx.translate((far?.05:-.03)*s,-.57*s+bob);ctx.rotate(-flap*(far?.8:1));if(far)ctx.scale(.85,.85);
    const F=[[.22,1.45,.06],[.3,1.0,.068],[.36,.55,.075]];
    for(const[L,a,th]of F){ctx.save();ctx.rotate(a);ell(-L*s/2,0,L*s/2,th*s);ctx.fillStyle=wc;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();
      ctx.fillStyle=rgbaOf(cols[0],.5);ell(-L*s*.8,0,L*s*.18,th*s*.6);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.55)';ell(-L*s*.45,-th*s*.35,L*s*.25,th*s*.22);ctx.fill();
      if(far){ctx.fillStyle='rgba(70,30,90,.13)';ell(-L*s/2,0,L*s/2,th*s);ctx.fill();}ctx.restore();}
    ctx.fillStyle=wc;circ(0,0,s*.06);ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();
    ctx.restore();};
  if(o.wings)wing(true);
  // neck + body
  ctx.fillStyle=body;ctx.strokeStyle=line;ctx.lineWidth=lw;
  ctx.beginPath();ctx.moveTo(s*.06,-s*.5+bob);ctx.quadraticCurveTo(s*.15,-s*.8+bob,s*.27,-s*.92+bob);ctx.lineTo(s*.44,-s*.82+bob);ctx.quadraticCurveTo(s*.33,-s*.64+bob,s*.31,-s*.42+bob);ctx.closePath();ctx.fill();ctx.stroke();
  ell(0,-s*.43+bob,s*.31,s*.2);ctx.fill();ctx.stroke();
  ctx.save();ell(0,-s*.43+bob,s*.31,s*.2);ctx.clip();ctx.fillStyle='rgba(90,40,120,.10)';ell(s*.02,-s*.27+bob,s*.36,s*.1);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.4)';ell(-s*.06,-s*.55+bob,s*.16,s*.05);ctx.fill();ctx.restore();
  if(o.wings)wing(false);
  // mane along the neck
  const Hx=.4*s,Hy=-.88*s+bob,mw=Math.sin(T*3+seed)*s*.006+(mv?Math.sin(wt)*s*.012:0),P=[];
  for(let k=0;k<6;k++){const u=k/5,a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;P.push([(a*.3+b*.1+c*.06)*s+mw*(1-u),(a*-1.0+b*-.86+c*-.56)*s+bob,(.095-.025*u)*s]);}
  ctx.strokeStyle=line;ctx.lineWidth=lw*2;for(const[a,b,r]of P){circ(a,b,r);ctx.stroke();}
  P.forEach(([a,b,r],i)=>{ctx.fillStyle=cols[i%cols.length];circ(a,b,r);ctx.fill();});
  ctx.fillStyle='rgba(255,255,255,.35)';for(const[a,b,r]of P){circ(a-r*.3,b-r*.35,r*.3);ctx.fill();}
  // head
  ctx.save();ctx.translate(Hx,Hy);ctx.rotate(.18);
  const ear=()=>{ctx.beginPath();ctx.moveTo(-s*.12,-s*.08);ctx.quadraticCurveTo(-s*.13,-s*.26,-s*.06,-s*.31);ctx.quadraticCurveTo(-s*.0,-s*.22,s*.02,-s*.12);ctx.closePath();};
  ear();ctx.fillStyle=body;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();
  ctx.fillStyle='#ffc4dc';ctx.beginPath();ctx.moveTo(-s*.09,-s*.11);ctx.quadraticCurveTo(-s*.1,-s*.22,-s*.065,-s*.26);ctx.quadraticCurveTo(-s*.03,-s*.2,-s*.02,-s*.13);ctx.closePath();ctx.fill();
  ctx.lineWidth=lw;ell(0,0,s*.19,s*.165);ctx.stroke();ell(s*.15,s*.07,s*.115,s*.095);ctx.stroke();
  ctx.fillStyle=body;ell(0,0,s*.19,s*.165);ctx.fill();ctx.fillStyle=o.snout||'#ffd0a0';ell(s*.15,s*.07,s*.115,s*.095);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.35)';ell(-s*.05,-s*.09,s*.08,s*.035);ctx.fill();
  ctx.fillStyle='rgba(90,40,70,.55)';ell(s*.22,s*.045,s*.017,s*.012);ctx.fill();
  ctx.strokeStyle='rgba(90,40,70,.6)';ctx.lineWidth=Math.max(1,s*.016);ctx.beginPath();ctx.arc(s*.17,s*.085,s*.04,.5,1.9);ctx.stroke();
  ctx.restore();
  // horn
  if(o.horn){const hc=o.hornColor||'#ffd34d',hp=()=>{ctx.beginPath();ctx.moveTo(Hx-s*.035,Hy-s*.14);ctx.lineTo(Hx+s*.13,Hy-s*.45);ctx.lineTo(Hx+s*.06,Hy-s*.12);ctx.closePath();};
    hp();ctx.fillStyle=hc;ctx.fill();ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.stroke();
    ctx.save();hp();ctx.clip();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=s*.02;
    for(let i=0;i<4;i++){const k=.2+i*.2;ctx.beginPath();ctx.moveTo(Hx-s*.05+k*s*.17,Hy-s*.1-k*s*.33);ctx.lineTo(Hx+s*.08+k*s*.09,Hy-s*.18-k*s*.28);ctx.stroke();}ctx.restore();
    if(state.rainbow||state.uniFollow){const k=Math.sin(T*3+seed);if(k>.2)twinkle(Hx+s*.15,Hy-s*.47,s*.06*k,k);}}
  // forelock
  const F=[[Hx-s*.08,Hy-s*.15,s*.075],[Hx+s*.0,Hy-s*.16,s*.065]];
  ctx.strokeStyle=line;ctx.lineWidth=lw*2;for(const[a,b,r]of F){circ(a,b,r);ctx.stroke();}
  F.forEach(([a,b,r],i)=>{ctx.fillStyle=cols[(i+1)%cols.length];circ(a,b,r);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';circ(a-r*.3,b-r*.35,r*.3);ctx.fill();});
  // eye (blinks)
  const ex=Hx+s*.045,ey=Hy-s*.02,blink=((T+seed*1.7)%3.8)<.13;
  if(blink){ctx.strokeStyle='#3a2340';ctx.lineWidth=Math.max(1.2,s*.022);ctx.beginPath();ctx.arc(ex,ey-s*.01,s*.042,.25,Math.PI-.25);ctx.stroke();}
  else{ctx.fillStyle='#3a2340';ell(ex,ey,s*.045,s*.06);ctx.fill();ctx.fillStyle='#6b4a8a';ell(ex,ey+s*.025,s*.03,s*.025);ctx.fill();
    ctx.fillStyle='#fff';circ(ex+s*.014,ey-s*.022,s*.019);ctx.fill();circ(ex-s*.014,ey+s*.022,s*.009);ctx.fill();
    ctx.strokeStyle='#3a2340';ctx.lineWidth=Math.max(1,s*.016);ctx.beginPath();ctx.moveTo(ex-s*.03,ey-s*.045);ctx.lineTo(ex-s*.058,ey-s*.068);ctx.moveTo(ex-s*.04,ey-s*.03);ctx.lineTo(ex-s*.07,ey-s*.04);ctx.stroke();}
  ctx.fillStyle='rgba(255,120,170,.42)';ell(ex+s*.06,ey+s*.075,s*.042,s*.026);ctx.fill();
  if(o.crown){drawEmoji('🌸',Hx-s*.14,Hy-s*.17,s*.17);drawEmoji('🌼',Hx-s*.05,Hy-s*.22,s*.15);}
  if(o.bow)drawEmoji('🎀',Hx-s*.22,Hy-s*.07,s*.24);
  if(o.acc)drawEmoji(o.acc,Hx-(o.horn?s*.13:s*.06),Hy-s*.25,s*.26);
  ctx.restore();
}

function drawSign(sg,t){
  const s=ts,x=SX(sg.x),y=SY(sg.y),bounce=sg.hit&&t-sg.hit<.4?Math.sin((t-sg.hit)*25)*s*.04:0;
  ctx.font=`bold ${Math.round(s*.2)}px "Chalkboard SE","Comic Sans MS",sans-serif`;
  const tw=ctx.measureText(sg.text).width,w=tw+s*.5,h=s*.36,by=y-s*.78+bounce;
  shadow(x,y,s*.18,s*.06);
  ctx.fillStyle='#a86d36';rr(x-s*.045,by+h-2,s*.09,y-(by+h)+2,s*.03);ctx.fill();ctx.fillStyle='rgba(255,230,190,.35)';ctx.fillRect(x-s*.03,by+h,s*.02,y-(by+h)-s*.02);
  ctx.fillStyle='#c98e55';rr(x-w/2,by+s*.035,w,h,s*.08);ctx.fill();
  ctx.lineWidth=Math.max(1,s*.03);ctx.fillStyle='#f6dfae';ctx.strokeStyle='#8e5a2e';rr(x-w/2,by,w,h,s*.08);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.4)';rr(x-w/2+s*.06,by+s*.03,w-s*.12,s*.035,s*.02);ctx.fill();
  ctx.textAlign='left';ctx.textBaseline='middle';
  const cur=HL.target===sg?HL.idx:-1,sp=ctx.measureText(' ').width;let wx=x-w/2+s*.08;
  sg.text.split(' ').forEach((wd,i)=>{const ww=ctx.measureText(wd).width;
    if(i===cur){ctx.fillStyle='#ffe14d';rr(wx-s*.04,by+s*.03,ww+s*.08,h-s*.06,s*.06);ctx.fill();}
    ctx.fillStyle=cur>=0&&i<cur?'#d94f9b':'#6b3f1d';ctx.fillText(wd,wx,by+h/2+1);wx+=ww+sp;});
  drawEmoji('🔊',x+w/2-s*.17,by+h/2,s*.22);
}
function drawArrow(tx,ty,t,icon){
  const s=ts,x=SX(tx),y=SY(ty);const m=60;
  if(x>m&&x<vw-m&&y>130&&y<vh-110){
    const b=Math.sin(t*5)*s*.12,ay=y-s*1.45+b;
    ctx.save();ctx.fillStyle='#ffd83d';ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(2,s*.06);ctx.lineJoin='round';
    const ap=()=>{ctx.beginPath();ctx.moveTo(x-s*.22,ay-s*.3);ctx.lineTo(x+s*.22,ay-s*.3);ctx.lineTo(x+s*.22,ay);ctx.lineTo(x+s*.38,ay);ctx.lineTo(x,ay+s*.38);ctx.lineTo(x-s*.38,ay);ctx.lineTo(x-s*.22,ay);ctx.closePath();};
    ctx.fillStyle='rgba(0,0,0,.15)';ctx.translate(0,s*.05);ap();ctx.fill();ctx.translate(0,-s*.05);
    ap();ctx.fillStyle='#ffd83d';ctx.fill();ctx.stroke();ctx.restore();
  }else{
    const cx=vw/2,cy=vh/2,a=Math.atan2(y-cy,x-cx);
    const ex=clamp(cx+Math.cos(a)*vw,m,vw-m),ey=clamp(cy+Math.sin(a)*vh,130,vh-110);
    const p=1+Math.sin(t*6)*.08;ctx.save();ctx.translate(ex,ey);
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.strokeStyle='#ffd83d';ctx.lineWidth=5;circ(0,0,32*p);ctx.fill();ctx.stroke();
    ctx.rotate(a);ctx.fillStyle='#ffb800';ctx.beginPath();ctx.moveTo(48*p,0);ctx.lineTo(32*p,-12*p);ctx.lineTo(32*p,12*p);ctx.closePath();ctx.fill();
    ctx.restore();if(icon)drawEmoji(icon,ex,ey,34);
  }
}
// soft floating pollen/sparkles + gentle vignette (screen space)
function drawAmbient(){
  const T=nowS(),g=glowSprite('#fffbe6'),Wb=vw+80,Hb=vh+80,rb=state.rainbow;
  for(let i=0;i<18;i++){const a=hash(i,77),b=hash(i,91),c=hash(i,13);
    let px=(a*Wb+T*(6+c*10)-cam.x*.4+Math.sin(T*.7+i*2)*18)%Wb;if(px<0)px+=Wb;
    let py=(b*Hb-T*(4+c*6)-cam.y*.4+Math.sin(T*.5+i)*10)%Hb;if(py<0)py+=Hb;
    const al=.45+.4*Math.sin(T*1.8+i*1.7);if(al<=.05)continue;const r=3+c*4;
    ctx.globalAlpha=al;ctx.drawImage(rb&&i%3===0?glowSprite(['#ffb3e6','#b3e6ff','#fff3a0'][i%9/3|0]):g,px-40-r*2,py-40-r*2,r*4,r*4);}
  ctx.globalAlpha=1;
  const k=vw+'x'+vh;if(GFX.vigKey!==k){GFX.vigKey=k;const gr=ctx.createRadialGradient(vw/2,vh*.48,Math.min(vw,vh)*.42,vw/2,vh/2,Math.hypot(vw,vh)*.56);
    gr.addColorStop(0,'rgba(70,40,100,0)');gr.addColorStop(1,'rgba(70,40,100,.16)');GFX.vig=gr;}
  ctx.fillStyle=GFX.vig;ctx.fillRect(0,0,vw,vh);
}
function drawRainbow(){
  drawAmbient();
  const qid=Q[state.quest].id;let cols;
  if(state.rainbow)cols=STARS.map(s=>s.c);else if(qid==='stars'||qid==='finale')cols=STARS.map((s,i)=>state.stars.includes(i)?s.c:null);else return;
  const cx=vw/2,cy=vh*1.15,R=Math.max(vw*.56,vh*1.05),bw=Math.max(8,ts*.16);
  ctx.save();ctx.globalAlpha=.32;ctx.lineWidth=bw+1;
  cols.forEach((c,i)=>{if(!c)return;ctx.strokeStyle=c;ctx.beginPath();ctx.arc(cx,cy,R-i*bw,Math.PI,Math.PI*2);ctx.stroke();});ctx.restore();
}
