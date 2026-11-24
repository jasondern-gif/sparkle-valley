// Generates the PLACEHOLDER images for the asset-pipeline prototype (node assets/make_placeholders.js).
// These are not art: flat silhouettes plus a magenta border marking each frame's exact bounds, so the
// pipeline (loading, frames, origin, scale, flip) can be tested end to end. Final art replaces these files.
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib');

function img(w,h){return{w,h,d:new Uint8Array(w*h*4)};}
function hex(c){const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255,255];}
function px(im,x,y,c){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=im.w||y>=im.h)return;const i=(y*im.w+x)*4;im.d.set(c,i);}
function rect(im,x,y,w,h,c){c=hex(c);for(let j=0;j<h;j++)for(let i=0;i<w;i++)px(im,x+i,y+j,c);}
function ellipse(im,cx,cy,rx,ry,c){c=hex(c);for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
  const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)px(im,x,y,c);}}
function tri(im,ax,ay,bx,by,cx,cy,c){c=hex(c);const minX=Math.floor(Math.min(ax,bx,cx)),maxX=Math.ceil(Math.max(ax,bx,cx)),minY=Math.floor(Math.min(ay,by,cy)),maxY=Math.ceil(Math.max(ay,by,cy));
  const s=(x1,y1,x2,y2,x3,y3)=>(x1-x3)*(y2-y3)-(x2-x3)*(y1-y3);
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){const p=[x+.5,y+.5],d1=s(p[0],p[1],ax,ay,bx,by),d2=s(p[0],p[1],bx,by,cx,cy),d3=s(p[0],p[1],cx,cy,ax,ay);
    if(!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)))px(im,x,y,c);}}
function border(im,ox,oy,w,h){const c=hex('#ff00ff');for(let i=0;i<w;i++){px(im,ox+i,oy,c);px(im,ox+i,oy+h-1,c);}for(let j=0;j<h;j++){px(im,ox,oy+j,c);px(im,ox+w-1,oy+j,c);}}

function crc32(buf){let c,crc=0xffffffff;for(let n=0;n<buf.length;n++){c=(crc^buf[n])&255;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;crc=(crc>>>8)^c;}return(crc^0xffffffff)>>>0;}
function chunk(type,data){const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(td));return Buffer.concat([len,td,crc]);}
function png(im){const raw=Buffer.alloc((im.w*4+1)*im.h);for(let y=0;y<im.h;y++){raw[y*(im.w*4+1)]=0;Buffer.from(im.d.buffer,y*im.w*4,im.w*4).copy(raw,y*(im.w*4+1)+1);}
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(im.w,0);ihdr.writeUInt32BE(im.h,4);ihdr[8]=8;ihdr[9]=6;ihdr[10]=0;ihdr[11]=0;ihdr[12]=0;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
function save(rel,im){const f=path.join(__dirname,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,png(im));console.log('wrote',rel,im.w+'x'+im.h);}

// tree: 4 frames of 36x48 (round, blossom, apple, pine); anchor = bottom-center of each frame
{const im=img(144,48);for(let f=0;f<4;f++){const ox=f*36,cx=ox+18;
  rect(im,cx-2,34,4,14,'#8a5a33');
  if(f===3){tri(im,cx,6,cx-13,30,cx+13,30,'#2f7f52');tri(im,cx,2,cx-10,20,cx+10,20,'#3f9f66');}
  else{ellipse(im,cx,20,14,14,['#3e9a47','#3e9a47','#3e9a47'][f]);
    if(f===1)for(const[a,b]of[[-6,14],[5,12],[-2,24],[8,22],[-9,20]])ellipse(im,cx+a,b,2,2,'#ffb3d1');
    if(f===2)for(const[a,b]of[[-6,16],[5,14],[-1,25],[8,23]])ellipse(im,cx+a,b,2,2,'#ff3b3b');}
  border(im,ox,0,36,48);}
 save('tiles/tree.png',im);}

// crop_carrot: 3 frames of 24x24 (stage1, stage2, stage3); anchor = bottom-center (soil line)
{const im=img(72,24);for(let f=0;f<3;f++){const ox=f*24,cx=ox+12;
  if(f===0){rect(im,cx-1,17,2,7,'#5fb45a');ellipse(im,cx-2,16,2,1.5,'#6fd38a');ellipse(im,cx+2,16,2,1.5,'#6fd38a');}
  if(f===1){rect(im,cx-1,12,2,12,'#4f9f4a');for(const[a,b]of[[-4,11],[4,11],[0,8]])ellipse(im,cx+a,b,3,2,'#5fb45a');}
  if(f===2){tri(im,cx-4,14,cx+4,14,cx,23,'#ff8a2b');for(const[a,b]of[[-4,8],[4,8],[0,5]])ellipse(im,cx+a,b,3,3,'#4f9f4a');}
  border(im,ox,0,24,24);}
 save('crops/carrot.png',im);}

// farmhouse: 120x108, bottom-center = world (5,6). Chimney at px x80-90 matches the procedural smoke position.
{const im=img(120,108);
  rect(im,80,21,10,24,'#d98a6a');
  rect(im,17,52,86,56,'#fff6e3');
  tri(im,60,17,10,60,110,60,'#f4739f');
  rect(im,63,74,18,34,'#bd7a45');rect(im,24,63,17,17,'#a8dcff');rect(im,86,63,13,17,'#a8dcff');
  border(im,0,0,120,108);
 save('buildings/farmhouse.png',im);}

// buttercup: 5 frames of 36x36 (0 = idle, 1-4 = walk), facing RIGHT; anchor = bottom-center between the hooves.
// Head center at frame px (27.6,14.9) = world (+0.40,-0.88) tiles from the anchor (accessory anchor). No baked-in bob.
{const im=img(180,36),T=24;for(let f=0;f<5;f++){const ox=f*36,ax=ox+18,ay=36,P=(x,y)=>[ax+x*T,ay+y*T];
  const legs=[[-.2,0],[-.12,Math.PI],[.15,Math.PI],[.23,0]];
  for(const[lx,ph]of legs){const sw=f?Math.sin((f-1)*Math.PI/2+ph)*.07:0,[x,y]=P(lx+sw,-.38);rect(im,x-1,y,3,ay-y-1,'#ffe08a');const[hx]=P(lx+sw,0);rect(im,hx-1,ay-2,3,2,'#a0643a');}
  {const[x,y]=P(-.4,-.5);ellipse(im,x,y+3,2.5,6,'#ff6fb5');}
  {const[x,y]=P(0,-.43);ellipse(im,x,y,7.5,5,'#ffe08a');}
  {const[a,b]=P(.12,-.55),[c,d]=P(.33,-.85),[e,g]=P(.3,-.45);tri(im,a,b,c,d,e,g,'#ffe08a');}
  {const[x,y]=P(.4,-.88);ellipse(im,x,y,4.5,4,'#ffe08a');ellipse(im,x+3.5,y+1.5,3,2.4,'#ffd0a0');px(im,x+1,y-1,hex('#3a2340'));
   for(let k=0;k<5;k++){const[mx,my]=P(.3-k*.05,-1.0+k*.09);ellipse(im,mx,my,2,2,'#ff8cc6');}}
  border(im,ox,0,36,36);}
 save('characters/buttercup.png',im);}
