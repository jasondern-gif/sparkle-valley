'use strict';
// Chapter 11: follow landmarks to guide a lost pony out of the orchard.
(()=>{
const R=reg, ART=LandArt.orchard, ID='luma';
SPK.luma={n:'Luma',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.luma={names:['Luma','Star','Apple','Dusk'],fav:'strawberry',acc:'⭐',home:{x:28.5,y:295.5},
  look:{body:'#e9d8ff',mane:['#ffe9a3','#e7b5ee','#a9c8ff'],hoof:'#a78cc9',snout:'#fff5ff',scale:.84}};
PONY_IDS.push(ID);
PONIES.luma.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.luma={likes:['garden','playground']};

Object.assign(AREAS.orchard,{name:R('narrator','Starlight Orchard'),icon:'🍎',sky:['#766bb3','#f7cce5'],
  go:R('narrator','Off to Starlight Orchard!'),seeds:['strawberry','carrot'],
  cam:{x0:3,y0:274,x1:41,y1:302},unlocked:()=>state.quest>=qi('c11fly')});
PADS.orchard={x:9.5,y:281.4};
rect(0,272,43,303,'T');rect(5,275,38,300,'.');
const SIGN={x:21.5,y:284.5}, GROVE={x:27.5,y:292.5};
SIGNS.push({x:12.5,y:283.7,text:'Starlight Orchard'});
const L={
  title:R('narrator','Guide Luma through the orchard'),
  wrong:R('narrator','That path is not on our map. Try the other one!'),
  step:R('narrator','You found the way!'),
  finished:R('narrator','Luma found the way home! The orchard stars are glowing!'),
  replay:R('luma','Let us follow the orchard map together again!'),
  replayDone:R('luma','That was a lovely walk together!'),
  hints:[
    R('narrator','First, follow the apple tree. Tap the apple tree path!'),
    R('narrator','Next, follow the little pond. Tap the pond path!'),
    R('narrator','Finally, follow the star lantern. Tap the star lantern path!')
  ]
};
const ROUTE=[
  [{key:'apple',emoji:'🍎',label:'Apple tree'},{key:'flower',emoji:'🌸',label:'Flower path'}],
  [{key:'bridge',emoji:'🌉',label:'Bridge path'},{key:'pond',emoji:'💧',label:'Pond path'}],
  [{key:'star',emoji:'⭐',label:'Star lantern'},{key:'moon',emoji:'🌙',label:'Moon path'}]
];
const ANSWERS=['apple','pond','star'];
const quests=[
  {id:'c11fly',chapter:'Starlight Orchard',chapterIcon:'🍎',icon:'🎈',text:'Fly the Rainbow Balloon to Starlight Orchard.',
    start:[['grandma','A little pony is lost among the trees in Starlight Orchard.'],
      ['grandma','Fly there and use the orchard map to guide her back!']],
    hint:'Tap the Rainbow Balloon. Then tap the Starlight Orchard picture!'},
  {id:'c11guide',icon:'🗺️',text:'Guide Luma through the orchard. Tap the map.',goal:3,handin:true,prog:()=>C11().steps,
    start:[['luma','Hello! I am Luma. I can see landmarks, but I need help finding my way.'],
      ['luma','Tap the map, then choose the path to each landmark!']],
    hint:'Follow the arrow to the map. Listen for the landmark and tap its path!'},
  {id:'c11friend',icon:'🐴',text:'Say hello to Luma. Tap the pony.',
    start:[['luma','You guided me out! The orchard stars are shining again. Come say hello!']],
    hint:'Follow the arrow and tap Luma the pony!'},
  {id:'c11home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['luma','May I live in Pony Village? Here is magic wood for a cottage.'],()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c11build',icon:'🏠',text:'Make a cottage for Luma in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},['grandma','Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c11fly='orchard';LG.NEED.c11home='valley';LG.BUILD.add('c11build');
const isChapter=()=>qid().startsWith('c11');
function C11(){
  if(!state.ch11||typeof state.ch11!=='object')state.ch11={};
  const c=state.ch11;
  if(!Number.isInteger(c.steps)||c.steps<0||c.steps>ROUTE.length)c.steps=0;
  if(c.done===undefined)c.done=false;
  return c;
}
function guide(mode){
  if(mode==='story'&&qid()!=='c11guide'){say(C11().steps===ROUTE.length?L.finished:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  let step=mode==='story'?C11().steps:0;
  if(step>=ROUTE.length)return;
  if(mode==='play')say(L.replay,ID);
  const g=LG.screenGame({mode,quest:mode==='story'?'c11guide':null,title:'🗺️ Guide Luma through the orchard',
    titleSay:L.title,who:'narrator',w:440,h:220,
    draw:(ctx,w,h)=>ART.route(w,h,step),
    html:'<div class="lgOpts" id="orchardOpts"></div>'});
  function show(){
    $('orchardOpts').innerHTML=ROUTE[step].map(o=>`<button data-path="${o.key}" aria-label="${o.label}" title="${o.label}">${o.emoji}</button>`).join('');
    $('orchardOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g)return;
      if(b.dataset.path!==ANSWERS[step]){sfx('nope');LG.screenSay(L.wrong+' '+L.hints[step]);return;}
      sfx('sparkle');step++;
      if(mode==='story'){C11().steps=step;saveGame();}
      if(step===ROUTE.length){
        $('orchardOpts').innerHTML='';
        LG.screenSay(mode==='story'?L.finished:L.replayDone,mode==='story'?'narrator':ID);
        LG.finishScreen(g,()=>{if(mode==='play'){if(rescued(ID))addHeart(ID,2);saveGame();}celebrate(true);},1200);
      }else{show();}
    });
    LG.screenSay(L.hints[step]);
  }
  show();
}
function meet(){
  if(qid()==='c11friend'&&!rescued(ID))return talk([
    ['luma','Thank you for helping me find my way!'],['luma','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.begin.push(isNew=>{const c=C11();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c11fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C11(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='c11fly'&&here==='orchard')return completeQuest();
  if(q==='c11guide'&&c.steps===ROUTE.length)return completeQuest();
  if(q==='c11friend'&&rescued(ID))return completeQuest();
  if(q==='c11home'&&here==='valley')return completeQuest();
  if(q==='c11build'&&quests[4].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Luma has a home, and the orchard stars are shining!'],
      ['luma','Thank you, friend! We can follow the map again whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='orchard')return false;
  const p=PADS.orchard;
  if(state.balloonAt==='orchard'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(dist(wx,wy,SIGN.x,SIGN.y-.5)<1.5){goDo(SIGN.x,SIGN.y+1,2,()=>guide('story'));return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meet,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c11home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c11build')return LG.villageTarget();
  const g=LG.goArea('orchard');if(g!==null)return g;
  if(q==='c11guide')return{x:SIGN.x,y:SIGN.y-.5};
  if(q==='c11friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>guide('play');
HOOK.layer.push(layers=>{
  if(hereArea()!=='orchard')return;
  layers.push([SIGN.y,()=>drawEmoji('🗺️',SX(SIGN.x),SY(SIGN.y-.5),ts*1.1)]);
  layers.push([GROVE.y,()=>ART.grove(SX(GROVE.x),SY(GROVE.y),ts,C11().steps===ROUTE.length)]);
});
ART.grove=function(x,y,s,lit){drawEmoji('🌳',x,y-s*.5,s*2);if(lit){drawEmoji('⭐',x-s*.6,y-s*1.2,s*.6);drawEmoji('✨',x+s*.6,y-s*1.1,s*.6);}};
ART.route=function(w,h,step){
  ctx.fillStyle='#e2d5f3';ctx.fillRect(0,0,w,h);
  drawEmoji('🐴',w*(.18+step*.18),h*.65,65);
  for(let i=0;i<3;i++)drawEmoji(i<step?'⭐':'🌳',w*(.32+i*.22),h*.35,55);
};
ART.tree=function(x,y){drawEmoji('🌳',SX(x+.5),SY(y+1),ts*1.5);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.1)drawEmoji('✨',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=function(y,s){drawEmoji('🌳',vw*.3,y,s*1.4);drawEmoji('⭐',vw*.65,y-s*.6,s*.8);};
})();
