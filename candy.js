'use strict';
// Chapter 7: a small Candy Castle adventure.
(()=>{
const R=reg, ART=LandArt.candy, ID='toffee';
SPK.toffee={n:'Toffee',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.toffee={names:['Toffee','Caramel','Honey','Sprinkle'],fav:'strawberry',acc:'🍬',home:{x:28.5,y:158.5},
  look:{body:'#ffd6a5',mane:['#c77d66','#fff0c8','#f4a8ba','#c77d66'],hoof:'#ad6f5b',snout:'#fff0df',scale:.84,assetId:'toffee'}};
PONY_IDS.push(ID);
PONIES.toffee.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.toffee={likes:['bakery','playground']};

Object.assign(AREAS.candy,{name:R('narrator','Candy Castle'),icon:'🍬',sky:['#ffb9d8','#fff0c7'],
  go:R('narrator','Off to Candy Castle!'),seeds:['strawberry','carrot'],
  cam:{x0:3,y0:146,x1:41,y1:174},unlocked:()=>state.quest>=qi('c7fly')});
PADS.candy={x:9.5,y:153.4};
rect(0,144,43,175,'T');rect(5,147,38,172,'.');
const CASTLE={x:22.5,y:153.5};
const SWEETS=[[13.5,158.5],[17.5,164.5],[23.5,160.5],[29.5,165.5],[34.5,158.5]];
SIGNS.push({x:12.5,y:155.7,text:'Candy Castle'});

const L={
  found:R('narrator','You found a candy decoration!'),
  done:R('narrator','The Candy Castle is sparkling again!'),
  play:R('toffee','Let us find candy decorations together!'),
  playDone:R('toffee','That was sweet fun!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  title:R('narrator','Decorate Candy Castle'),
  roof:R('narrator','Pick a roof for the castle!'),
  topper:R('narrator','Pick a topper for the castle!'),
  pink:R('narrator','Pink'),blue:R('narrator','Blue'),
  star:R('narrator','A star'),heart:R('narrator','A heart')
};
const STAGES=[
  {id:'roof',say:L.roof,opts:[{k:'pink',html:'💗',say:L.pink},{k:'blue',html:'💙',say:L.blue}]},
  {id:'topper',say:L.topper,opts:[{k:'star',html:'⭐',say:L.star},{k:'heart',html:'💖',say:L.heart}]}
];
const quests=[
  {id:'c7fly',chapter:'Candy Castle',chapterIcon:'🍬',icon:'🎈',text:'Fly the Rainbow Balloon to Candy Castle.',
    start:[['grandma','A sweet invitation arrived from Candy Castle! Toffee the pony needs a helper.'],
      ['grandma','Tap the Rainbow Balloon and fly to Candy Castle!']],
    hint:'Tap the Rainbow Balloon. Then tap the Candy Castle picture!'},
  {id:'c7sweets',icon:'🍬',text:'Find 5 candy decorations. Tap them or walk to them.',goal:5,handin:true,prog:()=>C7().sweets.length,
    start:[['toffee','Hello! I am Toffee. The wind scattered the decorations for my castle.'],
      ['toffee','Can you help me find them? Tap them or walk to them!']],
    hint:'Follow the arrow to each candy decoration. Tap it or walk to it!'},
  {id:'c7castle',icon:'🏰',text:'Decorate Candy Castle. Tap the castle.',
    start:[['toffee','You found them all! Let us decorate the castle together. Tap the castle!']],
    hint:'Tap the castle, then pick the decorations you like!'},
  {id:'c7friend',icon:'🐴',text:'Say hello to Toffee. Tap the pony.',
    start:[['toffee','The castle looks wonderful! Come and say hello to me!']],
    hint:'Follow the arrow and tap Toffee the pony!'},
  {id:'c7home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['toffee','I would love to live in your Pony Village! Here is magic wood for a cottage.'],
      ()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c7build',icon:'🏠',text:'Make a cottage for Toffee in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},
      ['grandma','Welcome home! Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c7fly='candy';LG.NEED.c7home='valley';LG.BUILD.add('c7build');
const isChapter=()=>qid().startsWith('c7');
function ensure(){
  if(!state.ch7||typeof state.ch7!=='object')state.ch7={};
  const c=state.ch7;
  if(!Array.isArray(c.sweets))c.sweets=[];
  if(c.castle===undefined)c.castle=null;
  if(c.done===undefined)c.done=false;
  return c;
}
const C7=()=>ensure();

function collect(mode){
  const items=mode==='story'?SWEETS.map(([x,y],i)=>({x,y,pi:i})).filter(o=>!C7().sweets.includes(o.pi)):LG.spotsNear(5,1.5,5);
  if(!items.length){if(mode==='play')say(L.noRoom,'narrator');return;}
  if(mode==='play')say(L.play,ID);
  LG.field({id:'candySweets',mode,quest:mode==='story'?'c7sweets':undefined,area:hereArea(),items,art:'candy.sweet',r:1,hy:.5,walkPop:.9,
    onPop:it=>{sfx('pop');burst(it.x,it.y-.5,'✨',5);say(L.found,'narrator');
      if(mode==='story'&&!C7().sweets.includes(it.pi)){C7().sweets.push(it.pi);saveGame();}},
    onDone:()=>{if(mode==='play'){say(L.playDone,ID);celebrate(true);if(rescued(ID))addHeart(ID,2);saveGame();}}});
}
function decorate(){
  if(qid()!=='c7castle'){say(C7().castle?L.done:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  LG.builder({mode:'story',quest:'c7castle',title:'🏰 Decorate Candy Castle',titleSay:L.title,who:'narrator',
    stages:STAGES,art:'candy.preview',onDone:choices=>{C7().castle=choices;saveGame();celebrate();completeQuest();}});
}
function meetToffee(){
  if(qid()==='c7friend'&&!rescued(ID))return talk([
    ['toffee','Thank you for helping me make Candy Castle beautiful!'],
    ['toffee','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.begin.push(isNew=>{const c=ensure();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c7fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C7(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  const busy=dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show');
  if(busy)return;
  if(q==='c7fly'&&here==='candy')return completeQuest();
  if(q==='c7sweets'&&here==='candy'){
    if(c.sweets.length>=SWEETS.length&&!LG.active())return completeQuest();
    if(!LG.active()&&c.sweets.length<SWEETS.length)collect('story');
  }
  if(q==='c7castle'&&c.castle)return completeQuest();
  if(q==='c7friend'&&rescued(ID))return completeQuest();
  if(q==='c7home'&&here==='valley')return completeQuest();
  if(q==='c7build'&&quests[5].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Toffee has a home, and Candy Castle is beautiful again!'],
      ['toffee','Thank you, friend! We can play together whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='candy')return false;
  const p=PADS.candy;
  if(state.balloonAt==='candy'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(Math.abs(wx-CASTLE.x)<2&&wy>CASTLE.y-3.5&&wy<CASTLE.y+.5){goDo(CASTLE.x,CASTLE.y+1,2,decorate);return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meetToffee,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c7home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c7build')return LG.villageTarget();
  const g=LG.goArea('candy');if(g!==null)return g;
  if(q==='c7castle')return{x:CASTLE.x,y:CASTLE.y-2};
  if(q==='c7friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>collect('play');
HOOK.layer.push((layers,t)=>{
  if(hereArea()!=='candy')return;
  layers.push([CASTLE.y,()=>ART.castle(SX(CASTLE.x),SY(CASTLE.y),ts,C7().castle)]);
});

ART.castle=function(x,y,s,choice){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=choice?'#fff0c8':'#e9d8d1';ctx.fillRect(-s*1.25,-s*1.8,s*2.5,s*1.8);
  ctx.fillStyle=choice&&choice.roof==='blue'?'#81c9ef':'#f18ab6';
  ctx.beginPath();ctx.moveTo(-s*1.5,-s*1.8);ctx.lineTo(0,-s*3);ctx.lineTo(s*1.5,-s*1.8);ctx.closePath();ctx.fill();
  ctx.fillStyle='#bd7891';ctx.fillRect(-s*.3,-s*.7,s*.6,s*.7);
  if(choice)drawEmoji(choice.topper==='heart'?'💖':'⭐',0,-s*3.1,s*.6);
  ctx.restore();
};
ART.preview=function(w,h,t,g){ART.castle(w/2,h*.85,80,g.ch);};
ART.sweet=function(it,t){drawEmoji('🍬',SX(it.x),SY(it.y-.5),ts*(.8+Math.sin(t*3)*.06));};
ART.tree=function(x,y){drawEmoji('🍭',SX(x+.5),SY(y+1),ts*1.5);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.1)drawEmoji('✨',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=function(y,s){drawEmoji('🏰',vw/2,y,s*2);drawEmoji('🍬',vw*.25,y,s);};
})();
