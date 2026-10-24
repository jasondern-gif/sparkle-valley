'use strict';
// ---------- Tap and hold to move: keep a finger down and she walks toward it (slide to steer) ----------
(()=>{
  let hold=null;
  const HOLD_MS=220,DRAG_PX=24;
  canvas.addEventListener('pointerdown',e=>{
    // game.js has already handled this tap; only a plain "walk there" tap can turn into hold-to-move
    if(!started||dlgOpen||flight||!window.__tapWalk)return;
    hold={id:e.pointerId,x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now(),on:false};
    try{canvas.setPointerCapture(e.pointerId);}catch(err){}
  });
  canvas.addEventListener('pointermove',e=>{if(!hold||e.pointerId!==hold.id)return;hold.x=e.clientX;hold.y=e.clientY;
    if(!hold.on&&Math.hypot(hold.x-hold.x0,hold.y-hold.y0)>DRAG_PX)hold.on=true;});
  const end=e=>{if(!hold||(e&&e.pointerId!==hold.id))return;if(hold.on){player.path=[];player.moving=false;}hold=null;};
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  window.addEventListener('blur',()=>end());

  const clear=(x,y)=>[[.25,0],[-.25,0],[0,.25],[0,-.25]].every(([ox,oy])=>walkable(Math.floor(x+ox),Math.floor(y+oy)));
  HOOK.update.push(dt=>{
    if(!hold)return;
    if(dlgOpen||flight||placing||document.querySelector('.modal.show')){hold=null;return;}
    if(!hold.on){if(performance.now()-hold.t<HOLD_MS)return;hold.on=true;}
    player.path=[];player.action=null;
    const tx=(hold.x+cam.x)/ts,ty=(hold.y+cam.y)/ts,dx=tx-player.x,dy=ty-player.y,d=Math.hypot(dx,dy);
    if(d<.3){player.moving=false;return;}
    const st=Math.min(d,(state.riding?6.5:4)*dt),mx=dx/d*st,my=dy/d*st;
    // slide along walls: try the full step, then each direction on its own
    let nx=player.x,ny=player.y;
    if(clear(player.x+mx,player.y+my)){nx+=mx;ny+=my;}
    else if(Math.abs(mx)>.001&&clear(player.x+mx,player.y))nx+=mx;
    else if(Math.abs(my)>.001&&clear(player.x,player.y+my))ny+=my;
    if(nx===player.x&&ny===player.y){player.moving=false;return;}
    player.x=nx;player.y=ny;if(Math.abs(mx)>.01)player.flip=mx<0;player.walkT=(player.walkT||0)+dt*12;player.moving=true;
    // followers (pony, unicorn, pony friends) follow the trail
    if(!trail.length||dist(trail[0].x,trail[0].y,player.x,player.y)>.1){trail.unshift({x:player.x,y:player.y});if(trail.length>150)trail.pop();}
  });
})();
