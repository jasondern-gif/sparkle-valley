'use strict';
// Chapter 10: help a stranded pony relight Rainbow Island's beacon.
(()=>{
const R=reg, ART=LandArt.island, ID='skye';
SPK.skye={n:'Skye',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.skye={names:['Skye','Rainbow','Sunny','Cloud'],fav:'strawberry',acc:'🌈',home:{x:28.5,y:263.5},
  look:{body:'#d8f6ff',mane:['#ff9ad5','#ffe181','#a7d6ff','#c6a9df'],hoof:'#85b5cf',snout:'#f4ffff',scale:.84}};
PONY_IDS.push(ID);
PONIES.skye.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.skye={likes:['pond','playground']};

Object.assign(AREAS.island,{name:R('narrator','Rainbow Island'),icon:'🌈',sky:['#8cddf4','#fff4d5'],
  go:R('narrator','Off to Rainbow Island!'),seeds:['strawberry','carrot'],
  cam:{x0:3,y0:242,x1:41,y1:270},unlocked:()=>state.quest>=qi('c10fly')});
PADS.island={x:9.5,y:249.4};
rect(0,240,43,271,'T');rect(5,243,38,268,'.');rect(5,254,38,254,'T');
const BRIDGE={x:22.5,y:253}, BEACON={x:22.5,y:261.5};
const COLORS=[[12.5,258.5],[17.5,264.5],[23.5,266.5],[30.5,266.5],[34.5,259.5]];
SIGNS.push({x:12.5,y:251.7,text:'Rainbow Island'});
const L={
  found:R('narrator','You found a rainbow light!'),
  done:R('narrator','The rainbow beacon is shining!'),
  play:R(ID,'Let us find rainbow lights together!'),
  playDone:R(ID,'That was colorful fun!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  bridge:R('narrator','Mend the rainbow bridge'),
  sun:R('narrator','Tap the sun!'),cloud:R('narrator','Tap the cloud!'),
  title:R('narrator','Light the rainbow beacon'),
  color:R('narrator','Pick a beacon color!'),topper:R('narrator','Pick a beacon topper!'),
  pink:R('narrator','Pink'),blue:R('narrator','Blue'),
  star:R('narrator','A star'),heart:R('narrator','A heart')
};
const STAGES=[
  {id:'color',say:L.color,opts:[{k:'pink',html:'💗',say:L.pink},{k:'blue',html:'💙',say:L.blue}]},
  {id:'topper',say:L.topper,opts:[{k:'star',html:'⭐',say:L.star},{k:'heart',html:'💖',say:L.heart}]}
];
const quests=[
  {id:'c10fly',chapter:'Rainbow Island',chapterIcon:'🌈',icon:'🎈',text:'Fly the Rainbow Balloon to Rainbow Island.',
    start:[['grandma','A little pony is stranded on Rainbow Island! Its beacon has lost its lights.'],
      ['grandma','Take the Rainbow Balloon to Rainbow Island and help her!']],
    hint:'Tap the Rainbow Balloon. Then tap the Rainbow Island picture!'},
  {id:'c10bridge',icon:'🌉',text:'Mend the rainbow bridge. Tap the bridge.',
    start:[['skye','Hello! I am Skye. The bridge to my beacon needs a little magic.'],
      ['skye','Let us play the sun and cloud pattern to mend it!']],
    hint:'Follow the arrow to the bridge. Tap the pictures you hear!'},
  {id:'c10lights',icon:'✨',text:'Find 5 rainbow lights. Tap them or walk to them.',goal:5,handin:true,prog:()=>C10().lights.length,
    start:[['skye','The bridge is ready! Can you find the five rainbow lights?']],
    hint:'Follow the arrow to each rainbow light. Tap it or walk to it!'},
  {id:'c10beacon',icon:'🌈',text:'Light the rainbow beacon. Tap the beacon.',
    start:[['skye','You found every light! Let us make the beacon shine again.']],
    hint:'Tap the beacon and pick the colors and topper you like!'},
  {id:'c10friend',icon:'🐴',text:'Say hello to Skye. Tap the pony.',
    start:[['skye','The beacon is shining! Come and say hello!']],
    hint:'Follow the arrow and tap Skye the pony!'},
  {id:'c10home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['skye','May I live in Pony Village? Here is magic wood for a cottage.'],()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c10build',icon:'🏠',text:'Make a cottage for Skye in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},
      ['grandma','Welcome home! Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c10fly='island';LG.NEED.c10home='valley';LG.BUILD.add('c10build');
const isChapter=()=>qid().startsWith('c10');
function C10(){
  if(!state.ch10||typeof state.ch10!=='object')state.ch10={};
  const c=state.ch10;
  if(!Array.isArray(c.lights))c.lights=[];
  if(c.bridge===undefined)c.bridge=false;
  if(c.beacon===undefined)c.beacon=null;
  if(c.done===undefined)c.done=false;
  return c;
}
function syncBridge(){rect(21,254,23,254,C10().bridge?'.':'T');}
function collect(mode){
  const items=mode==='story'?COLORS.map(([x,y],i)=>({x,y,pi:i})).filter(o=>!C10().lights.includes(o.pi)):LG.spotsNear(5,1.5,5);
  if(!items.length){if(mode==='play')say(L.noRoom,'narrator');return;}
  if(mode==='play')say(L.play,ID);
  LG.field({id:'islandLights',mode,quest:mode==='story'?'c10lights':undefined,area:hereArea(),items,art:'island.light',r:1,hy:.5,walkPop:.9,
    onPop:it=>{sfx('pop');burst(it.x,it.y-.5,'✨',5);say(L.found,'narrator');
      if(mode==='story'&&!C10().lights.includes(it.pi)){C10().lights.push(it.pi);saveGame();}},
    onDone:()=>{if(mode==='play'){say(L.playDone,ID);celebrate(true);if(rescued(ID))addHeart(ID,2);saveGame();}}});
}
function mend(){
  if(qid()!=='c10bridge'){say(C10().bridge?L.done:(isChapter()?Q[state.quest].hint:L.bridge),'narrator');return;}
  LG.pickGame({mode:'story',title:'🌉 Mend the rainbow bridge',titleSay:L.bridge,who:'narrator',art:'island.bridgePreview',
    recipe:true,steps:[{say:L.sun,want:'sun'},{say:L.cloud,want:'cloud'},{say:L.sun,want:'sun'}],
    opts:[{k:'sun',html:'☀️'},{k:'cloud',html:'☁️'}],
    onDone:()=>{C10().bridge=true;syncBridge();saveGame();celebrate();completeQuest();}});
}
function lightBeacon(){
  if(qid()!=='c10beacon'){say(C10().beacon?L.done:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  LG.builder({mode:'story',quest:'c10beacon',title:'🌈 Light the rainbow beacon',titleSay:L.title,who:'narrator',
    stages:STAGES,art:'island.preview',onDone:choices=>{C10().beacon=choices;saveGame();celebrate();completeQuest();}});
}
function meet(){
  if(qid()==='c10friend'&&!rescued(ID))return talk([
    ['skye','Thank you for bringing the rainbow lights home!'],
    ['skye','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.restore.push(syncBridge);
HOOK.begin.push(isNew=>{const c=C10();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c10fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C10(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='c10fly'&&here==='island')return completeQuest();
  if(q==='c10bridge'&&c.bridge)return completeQuest();
  if(q==='c10lights'&&here==='island'){
    if(c.lights.length>=COLORS.length&&!LG.active())return completeQuest();
    if(!LG.active()&&c.lights.length<COLORS.length)collect('story');
  }
  if(q==='c10beacon'&&c.beacon)return completeQuest();
  if(q==='c10friend'&&rescued(ID))return completeQuest();
  if(q==='c10home'&&here==='valley')return completeQuest();
  if(q==='c10build'&&quests[6].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Skye has a home, and the rainbow beacon is shining!'],
      ['skye','Thank you, friend! We can play together whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='island')return false;
  const p=PADS.island;
  if(state.balloonAt==='island'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(Math.abs(wx-BRIDGE.x)<1.5&&wy>BRIDGE.y-2&&wy<BRIDGE.y+.5){goDo(BRIDGE.x,BRIDGE.y,1.8,mend);return true;}
  if(dist(wx,wy,BEACON.x,BEACON.y-.5)<1.5){goDo(BEACON.x,BEACON.y+1,2,lightBeacon);return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meet,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c10home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c10build')return LG.villageTarget();
  const g=LG.goArea('island');if(g!==null)return g;
  if(q==='c10bridge')return{x:BRIDGE.x,y:BRIDGE.y-1};
  if(q==='c10beacon')return{x:BEACON.x,y:BEACON.y-.5};
  if(q==='c10friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>collect('play');
HOOK.layer.push(layers=>{
  if(hereArea()!=='island')return;
  layers.push([BRIDGE.y,()=>ART.bridge(SX(BRIDGE.x),SY(BRIDGE.y),ts,C10().bridge)]);
  layers.push([BEACON.y,()=>ART.beacon(SX(BEACON.x),SY(BEACON.y),ts,C10().beacon)]);
});
ART.bridge=function(x,y,s,open){drawEmoji(open?'🌈':'☁️',x,y-s*.5,s*1.6);};
ART.beacon=function(x,y,s,choice){
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=choice?(choice.color==='pink'?'#f59bd2':'#91ceef'):'#d5d9df';
  ctx.fillRect(-s*.45,-s*1.5,s*.9,s*1.5);
  drawEmoji(choice?(choice.topper==='star'?'⭐':'💖'):'☁️',0,-s*1.6,s*.8);
  if(choice)drawEmoji('🌈',0,-s*.7,s*.8);
  ctx.restore();
};
ART.preview=function(w,h,t,g){ART.beacon(w/2,h*.8,100,g.ch.color?g.ch:null);};
ART.bridgePreview=function(w,h){drawEmoji('🌈',w/2,h/2,120);};
ART.light=function(it,t){drawEmoji('✨',SX(it.x),SY(it.y-.5),ts*(.8+Math.sin(t*3)*.06));};
ART.tree=function(x,y){drawEmoji('🌴',SX(x+.5),SY(y+1),ts*1.5);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.14)drawEmoji('🌺',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=function(y,s){drawEmoji('🌴',vw*.3,y,s*1.4);drawEmoji('🌈',vw*.65,y,s*1.2);};
})();
