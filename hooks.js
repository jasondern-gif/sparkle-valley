'use strict';
// ---------- Plug-in hooks: new content modules register here instead of editing shared files ----------
// Every module lives in its own file wrapped in an IIFE, and only exposes names with its own prefix.
const HOOK={
  init:[],        // f()                      once at startup, after chapter 2 setup
  begin:[],       // f(isNew)                 when a game starts or a save is continued
  update:[],      // f(dt)                    every frame while playing (not during the balloon flight)
  tap:[],         // f(wx,wy) -> true if used world tap (runs before chapter 2 taps)
  target:[],      // f() -> {x,y}|null|undefined   guiding arrow; first non-undefined wins
  ground:[],      // f(t,x0,y0,x1,y1)         draw on the ground, under everything else
  layer:[],       // f(L,t,x0,y0,x1,y1)       push [sortY, drawFn] into the depth-sorted list
  overlay:[],     // f(t)                     screen-space effects drawn on top of the world
  tile:[],        // f(c,x,y,sx,sy,s,h,t) -> true if the module drew this tile
  keep:[],        // f(itemKey) -> number     how many of an item must not be sold or fed
  bar:[],         // f() -> [{key,html,label,cls,onTap}]   extra buttons in the bottom bar
  ponyButtons:[], // {act,icon,show(id),onTap(id)}         extra buttons in the pony menu
  play:{},        // play[ponyId]=f(id)       what the pony menu "play" button does for that pony
  land:[],        // f(areaId)                after the balloon lands
};
// Insert a chapter's quests before the final free-play quest.
function addChapter(quests){const i=qi('freeEnd');Q.splice(i<0?Q.length:i,0,...quests);}

{
  const prevTile=drawTileExtra;
  drawTileExtra=function(c,x,y,sx,sy,s,h,t){for(const f of HOOK.tile)if(f(c,x,y,sx,sy,s,h,t))return true;return prevTile(c,x,y,sx,sy,s,h,t);};
  const prevKeep=keepFor;
  keepFor=function(k){let n=prevKeep(k);for(const f of HOOK.keep)n=Math.max(n,f(k)||0);return n;};
}
function hookTarget(){for(const f of HOOK.target){const r=f();if(r!==undefined)return r;}return ch2Target();}
function hookBarItems(){const out=[];for(const f of HOOK.bar){const r=f();if(r)out.push(...r);}return out;}

// The old "free2" ending becomes the permanent last quest that new chapters are inserted before.
Q.splice(qi('free2'),1,{id:'freeEnd',icon:'🏰',text:'Free play! Visit your ponies, decorate your village, and fly the balloon!',
  hint:'Visit your ponies, decorate your Pony Village, or fly the Rainbow Balloon!'});
