'use strict';
// Chapter 8: restore the mountain's guiding lantern with a new friend.
(()=>{
const R=reg, ART=LandArt.mountain, ID='frost';
SPK.frost={n:'Frost',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.frost={names:['Frost','Snowdrop','Flurry','Crystal'],fav:'carrot',acc:'❄️',home:{x:28.5,y:190.5},
  look:{body:'#e5f7ff',mane:['#9ed8ed','#ffffff','#b8b2ec'],hoof:'#83b8d5',snout:'#ffffff',scale:.84}};
PONY_IDS.push(ID);
PONIES.frost.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.frost={likes:['pond','playground']};

Object.assign(AREAS.mountain,{name:R('narrator','Snowy Mountain'),icon:'🏔️',sky:['#a4d8f3','#f5fbff'],
  go:R('narrator','Off to Snowy Mountain!'),seeds:['carrot','strawberry'],
  cam:{x0:3,y0:178,x1:41,y1:206},unlocked:()=>state.quest>=qi('c8fly')});
PADS.mountain={x:9.5,y:185.4};
rect(0,176,43,207,'T');rect(5,179,38,204,'.');
const LANTERN={x:22.5,y:185.5}, BELLS={x:16.5,y:194.5};
const FLAKES=[[13.5,190.5],[19.5,197.5],[24.5,192.5],[30.5,198.5],[34.5,190.5]];
SIGNS.push({x:12.5,y:187.7,text:'Snowy Mountain'});
const L={
  found:R('narrator','You found a snowflake!'),
  done:R('narrator','The mountain lantern is shining!'),
  play:R('frost','Let us find snowflakes together!'),
  playDone:R('frost','That was snowy fun!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  title:R('narrator','Light the mountain lantern'),
  color:R('narrator','Pick a lantern color!'),
  topper:R('narrator','Pick a lantern topper!'),
  blue:R('narrator','Blue'),pink:R('narrator','Pink'),
  star:R('narrator','A star'),heart:R('narrator','A heart'),
  bells:R('narrator','Play the mountain bells'),
  bellStar:R('narrator','Tap the star bell!'),
  bellHeart:R('narrator','Tap the heart bell!')
};
const STAGES=[
  {id:'color',say:L.color,opts:[{k:'blue',html:'💙',say:L.blue},{k:'pink',html:'💗',say:L.pink}]},
  {id:'topper',say:L.topper,opts:[{k:'star',html:'⭐',say:L.star},{k:'heart',html:'💖',say:L.heart}]}
];
const quests=[
  {id:'c8fly',chapter:'Snowy Mountain',chapterIcon:'🏔️',icon:'🎈',text:'Fly the Rainbow Balloon to Snowy Mountain.',
    start:[['grandma','A snowy mountain friend needs help lighting the way home!'],
      ['grandma','Tap the Rainbow Balloon and fly to Snowy Mountain!']],
    hint:'Tap the Rainbow Balloon. Then tap the Snowy Mountain picture!'},
  {id:'c8flakes',icon:'❄️',text:'Find 5 snowflakes. Tap them or walk to them.',goal:5,handin:true,prog:()=>C8().flakes.length,
    start:[['frost','Hello! I am Frost. The wind scattered the magic snowflakes for our lantern.'],
      ['frost','Can you help me find them? Tap them or walk to them!']],
    hint:'Follow the arrow to each snowflake. Tap it or walk to it!'},
  {id:'c8bells',icon:'🔔',text:'Play the mountain bells. Tap the bells.',
    start:[['frost','The snowflakes are safe! Play the bells to wake their magic.']],
    hint:'Tap the bells, then tap the pictures you hear!'},
  {id:'c8lantern',icon:'🏮',text:'Light the mountain lantern. Tap the lantern.',
    start:[['frost','The magic is awake! Let us make the lantern shine together.']],
    hint:'Tap the lantern, then pick the decorations you like!'},
  {id:'c8friend',icon:'🐴',text:'Say hello to Frost. Tap the pony.',
    start:[['frost','Now everyone can find their way! Come and say hello!']],
    hint:'Follow the arrow and tap Frost the pony!'},
  {id:'c8home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['frost','May I live in Pony Village? Here is magic wood for a cottage.'],()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c8build',icon:'🏠',text:'Make a cottage for Frost in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},
      ['grandma','Welcome home! Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c8fly='mountain';LG.NEED.c8home='valley';LG.BUILD.add('c8build');
const isChapter=()=>qid().startsWith('c8');
function C8(){
  if(!state.ch8||typeof state.ch8!=='object')state.ch8={};
  const c=state.ch8;
  if(!Array.isArray(c.flakes))c.flakes=[];
  if(c.bells===undefined)c.bells=false;
  if(c.lantern===undefined)c.lantern=null;
  if(c.done===undefined)c.done=false;
  return c;
}
function collect(mode){
  const items=mode==='story'?FLAKES.map(([x,y],i)=>({x,y,pi:i})).filter(o=>!C8().flakes.includes(o.pi)):LG.spotsNear(5,1.5,5);
  if(!items.length){if(mode==='play')say(L.noRoom,'narrator');return;}
  if(mode==='play')say(L.play,ID);
  LG.field({id:'mountainFlakes',mode,quest:mode==='story'?'c8flakes':undefined,area:hereArea(),items,art:'mountain.flake',r:1,hy:.5,walkPop:.9,
    onPop:it=>{sfx('pop');burst(it.x,it.y-.5,'✨',5);say(L.found,'narrator');
      if(mode==='story'&&!C8().flakes.includes(it.pi)){C8().flakes.push(it.pi);saveGame();}},
    onDone:()=>{if(mode==='play'){say(L.playDone,ID);celebrate(true);if(rescued(ID))addHeart(ID,2);saveGame();}}});
}
function bells(){
  if(qid()!=='c8bells'){say(C8().bells?L.done:(isChapter()?Q[state.quest].hint:L.bells),'narrator');return;}
  LG.pickGame({mode:'story',title:'🔔 Play the mountain bells',titleSay:L.bells,who:'narrator',art:'mountain.bellPreview',
    recipe:true,steps:[{say:L.bellStar,want:'star'},{say:L.bellHeart,want:'heart'},{say:L.bellStar,want:'star'}],
    opts:[{k:'star',html:'⭐'},{k:'heart',html:'💖'}],
    onDone:()=>{C8().bells=true;saveGame();celebrate();completeQuest();}});
}
function light(){
  if(qid()!=='c8lantern'){say(C8().lantern?L.done:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  LG.builder({mode:'story',quest:'c8lantern',title:'🏮 Light the mountain lantern',titleSay:L.title,who:'narrator',
    stages:STAGES,art:'mountain.preview',onDone:choices=>{C8().lantern=choices;saveGame();celebrate();completeQuest();}});
}
function meet(){
  if(qid()==='c8friend'&&!rescued(ID))return talk([
    ['frost','Thank you for making the mountain lantern shine!'],
    ['frost','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.begin.push(isNew=>{const c=C8();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c8fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C8(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='c8fly'&&here==='mountain')return completeQuest();
  if(q==='c8flakes'&&here==='mountain'){
    if(c.flakes.length>=FLAKES.length&&!LG.active())return completeQuest();
    if(!LG.active()&&c.flakes.length<FLAKES.length)collect('story');
  }
  if(q==='c8bells'&&c.bells)return completeQuest();
  if(q==='c8lantern'&&c.lantern)return completeQuest();
  if(q==='c8friend'&&rescued(ID))return completeQuest();
  if(q==='c8home'&&here==='valley')return completeQuest();
  if(q==='c8build'&&quests[6].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Frost has a home, and the mountain lantern shines again!'],
      ['frost','Thank you, friend! We can play together whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='mountain')return false;
  const p=PADS.mountain;
  if(state.balloonAt==='mountain'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(dist(wx,wy,BELLS.x,BELLS.y-.5)<1.3){goDo(BELLS.x,BELLS.y+1,2,bells);return true;}
  if(Math.abs(wx-LANTERN.x)<1.5&&wy>LANTERN.y-3&&wy<LANTERN.y+.5){goDo(LANTERN.x,LANTERN.y+1,2,light);return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meet,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c8home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c8build')return LG.villageTarget();
  const g=LG.goArea('mountain');if(g!==null)return g;
  if(q==='c8bells')return{x:BELLS.x,y:BELLS.y-.5};
  if(q==='c8lantern')return{x:LANTERN.x,y:LANTERN.y-2};
  if(q==='c8friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>collect('play');
HOOK.layer.push(layers=>{
  if(hereArea()!=='mountain')return;
  layers.push([LANTERN.y,()=>ART.lantern(SX(LANTERN.x),SY(LANTERN.y),ts,C8().lantern)]);
  layers.push([BELLS.y,()=>drawEmoji('🔔',SX(BELLS.x),SY(BELLS.y-.5),ts)]);
});
ART.lantern=function(x,y,s,choice){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#8c9dad';ctx.fillRect(-s*.12,-s*1.8,s*.24,s*1.8);
  ctx.fillStyle=choice?(choice.color==='pink'?'#ffb3d9':'#a7e7ff'):'#b4c1cc';
  rr(-s*.55,-s*2.7,s*1.1,s*.95,s*.18);ctx.fill();
  if(choice){drawStar(0,-s*2.2,s*.2,'#fff6b0',true);drawEmoji(choice.topper==='heart'?'💖':'⭐',0,-s*2.9,s*.48);}
  ctx.restore();
};
ART.preview=function(w,h,t,g){ART.lantern(w/2,h*.85,80,g.ch);};
ART.bellPreview=function(w,h){drawEmoji('🔔',w/2,h/2,120);};
ART.flake=function(it,t){drawEmoji('❄️',SX(it.x),SY(it.y-.5),ts*(.8+Math.sin(t*3)*.06));};
ART.tree=function(x,y){drawEmoji('🌲',SX(x+.5),SY(y+1),ts*1.5);drawEmoji('❄️',SX(x+.5),SY(y+.45),ts*.35);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.1)drawEmoji('❄️',(x+.5)*s,(y+.5)*s,s*.2);};
ART.flightScene=function(y,s){drawEmoji('🏔️',vw/2,y,s*2);drawEmoji('❄️',vw*.25,y,s);};
})();
