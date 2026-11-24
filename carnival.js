'use strict';
// Chapter 12: balance the cloud carousel to bring a stranded pony safely down.
(()=>{
const R=reg, ART=LandArt.carnival, ID='pippin';
SPK.pippin={n:'Pippin',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.pippin={names:['Pippin','Bubbles','Cloud','Twirl'],fav:'strawberry',acc:'🎠',home:{x:28.5,y:327.5},
  look:{body:'#fff0c8',mane:['#ffadd5','#b4dfff','#d9bdff'],hoof:'#d69ab6',snout:'#fff9f2',scale:.84}};
PONY_IDS.push(ID);
PONIES.pippin.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.pippin={likes:['garden','playground']};

Object.assign(AREAS.carnival,{name:R('narrator','Cloud Carnival'),icon:'🎠',sky:['#a5dcf4','#ffe3f4'],
  go:R('narrator','Off to Cloud Carnival!'),seeds:['strawberry','carrot'],
  cam:{x0:3,y0:306,x1:41,y1:334},unlocked:()=>state.quest>=qi('c12fly')});
PADS.carnival={x:9.5,y:313.4};
rect(0,304,43,335,'T');rect(5,307,38,332,'.');
const LEVER={x:21.5,y:316.5}, RIDE={x:27.5,y:324.5};
SIGNS.push({x:12.5,y:315.7,text:'Cloud Carnival'});
const L={
  title:R('narrator','Balance the cloud carousel'),
  left:R('narrator','The carousel tilts left. Tap the right arrow to balance it!'),
  right:R('narrator','The carousel tilts right. Tap the left arrow to balance it!'),
  balanced:R('narrator','Wonderful! The carousel is balanced!'),
  finished:R('narrator','The carousel is safe and Pippin can come down!'),
  replay:R('pippin','Let us balance the carousel together again!'),
  replayDone:R('pippin','That was a wonderful ride!')
};
const TILTS=[-2,3,-3];
const quests=[
  {id:'c12fly',chapter:'Cloud Carnival',chapterIcon:'🎠',icon:'🎈',text:'Fly the Rainbow Balloon to Cloud Carnival.',
    start:[['grandma','A little pony is stranded on the wobbly carousel at Cloud Carnival.'],
      ['grandma','Fly there and help balance the ride so she can come down safely!']],
    hint:'Tap the Rainbow Balloon. Then tap the Cloud Carnival picture!'},
  {id:'c12balance',icon:'🎠',text:'Balance the cloud carousel. Tap the lever.',goal:3,handin:true,prog:()=>C12().rounds,
    start:[['pippin','Hello! I am Pippin. My carousel is wobbling up in the clouds!'],
      ['pippin','Tap the arrows to move the balance marker to the star. There is no hurry!']],
    hint:'Follow the arrow to the lever. Move the marker toward the star!'},
  {id:'c12friend',icon:'🐴',text:'Say hello to Pippin. Tap the pony.',
    start:[['pippin','The carousel is safe! Thank you for helping me down. Come say hello!']],
    hint:'Follow the arrow and tap Pippin the pony!'},
  {id:'c12home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['pippin','May I live in Pony Village? Here is magic wood for a cottage.'],()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c12build',icon:'🏠',text:'Make a cottage for Pippin in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},['grandma','Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c12fly='carnival';LG.NEED.c12home='valley';LG.BUILD.add('c12build');
const isChapter=()=>qid().startsWith('c12');
function C12(){
  if(!state.ch12||typeof state.ch12!=='object')state.ch12={};
  const c=state.ch12;
  if(!Number.isInteger(c.rounds)||c.rounds<0||c.rounds>TILTS.length)c.rounds=0;
  if(c.done===undefined)c.done=false;
  return c;
}
function balance(mode){
  if(mode==='story'&&qid()!=='c12balance'){say(C12().rounds===TILTS.length?L.finished:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  let round=mode==='story'?C12().rounds:0;
  if(round>=TILTS.length)return;
  let tilt=TILTS[round],finished=false;
  if(mode==='play')say(L.replay,ID);
  const g=LG.screenGame({mode,quest:mode==='story'?'c12balance':null,title:'🎠 Balance the cloud carousel',
    titleSay:L.title,who:'narrator',w:440,h:220,
    draw:(ctx,w,h)=>ART.balance(w,h,tilt,round),
    html:'<div class="lgOpts" id="carnivalOpts"><button data-move="-1" aria-label="Move left" title="Move left">⬅️</button><button data-move="1" aria-label="Move right" title="Move right">➡️</button></div>'});
  function hint(){LG.screenSay(tilt<0?L.left:L.right);}
  $('carnivalOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>{
    if(LG.active()!==g||finished)return;
    tilt=clamp(tilt+Number(b.dataset.move),-3,3);
    if(tilt!==0){sfx('tap');hint();return;}
    sfx('sparkle');round++;
    if(mode==='story'){C12().rounds=round;saveGame();}
    if(round===TILTS.length){
      finished=true;$('carnivalOpts').innerHTML='';
      LG.screenSay(mode==='story'?L.finished:L.replayDone,mode==='story'?'narrator':ID);
      setTimeout(()=>{if(LG.active()!==g)return;LG.stop(true);if(mode==='play'&&rescued(ID)){addHeart(ID,2);saveGame();}celebrate(true);},1200);
    }else{tilt=TILTS[round];LG.screenSay(L.balanced+' '+(tilt<0?L.left:L.right));}
  });
  hint();
}
function meet(){
  if(qid()==='c12friend'&&!rescued(ID))return talk([
    ['pippin','Thank you for balancing my carousel!'],['pippin','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.begin.push(isNew=>{const c=C12();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c12fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C12(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='c12fly'&&here==='carnival')return completeQuest();
  if(q==='c12balance'&&c.rounds===TILTS.length)return completeQuest();
  if(q==='c12friend'&&rescued(ID))return completeQuest();
  if(q==='c12home'&&here==='valley')return completeQuest();
  if(q==='c12build'&&quests[4].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Pippin has a home, and the cloud carousel is safe again!'],
      ['pippin','Thank you, friend! We can balance the carousel again whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='carnival')return false;
  const p=PADS.carnival;
  if(state.balloonAt==='carnival'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(dist(wx,wy,LEVER.x,LEVER.y-.5)<1.5){goDo(LEVER.x,LEVER.y+1,2,()=>balance('story'));return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meet,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c12home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c12build')return LG.villageTarget();
  const g=LG.goArea('carnival');if(g!==null)return g;
  if(q==='c12balance')return{x:LEVER.x,y:LEVER.y-.5};
  if(q==='c12friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>balance('play');
HOOK.layer.push(layers=>{
  if(hereArea()!=='carnival')return;
  layers.push([LEVER.y,()=>drawEmoji('🕹️',SX(LEVER.x),SY(LEVER.y-.5),ts*1.1)]);
  layers.push([RIDE.y,()=>ART.carousel(SX(RIDE.x),SY(RIDE.y),ts,C12().rounds===TILTS.length)]);
});
ART.carousel=function(x,y,s,safe){drawEmoji('🎠',x,y-s*.5,s*2.2);if(safe){drawEmoji('✨',x-s*.8,y-s*1.4,s*.6);drawEmoji('🎈',x+s*.9,y-s*1.5,s*.7);}};
ART.balance=function(w,h,tilt,round){
  ctx.fillStyle='#e3f6ff';ctx.fillRect(0,0,w,h);
  drawEmoji('🎠',w/2,h*.33,85);
  ctx.fillStyle='#b8a5d6';ctx.fillRect(70,160,300,10);
  drawEmoji('⭐',w/2,135,35);
  drawEmoji('🎈',w/2+tilt*45,177,40);
  ctx.fillStyle='#594273';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText(`${Math.min(round+1,TILTS.length)} / 3`,w/2,210);
};
ART.tree=function(x,y){drawEmoji('☁️',SX(x+.5),SY(y+1),ts*1.5);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.1)drawEmoji('✨',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=function(y,s){drawEmoji('☁️',vw*.3,y,s*1.4);drawEmoji('🎠',vw*.65,y-s*.6,s*1.1);};
})();
