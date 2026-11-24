'use strict';
// Chapter 9: uncover a hidden path and bring a secret garden back to bloom.
(()=>{
const R=reg, ART=LandArt.garden, ID='bloom';
SPK.bloom={n:'Bloom',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.bloom={names:['Bloom','Petal','Daisy','Rose'],fav:'carrot',acc:'🌸',home:{x:28.5,y:231.5},
  look:{body:'#fff0df',mane:['#ef9fc5','#f8d6a5','#c6a9df'],hoof:'#bd87a0',snout:'#fff9f1',scale:.84}};
PONY_IDS.push(ID);
PONIES.bloom.names.forEach(n=>R('narrator',n));
for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(ID,t));
for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(ID,T2[k]);
R(ID,'Mmm! A cupcake! I love cupcakes!');
if(window.VIL_PERSONA)VIL_PERSONA.bloom={likes:['pond','playground']};

Object.assign(AREAS.garden,{name:R('narrator','Secret Garden'),icon:'🌷',sky:['#b8e9c2','#fff4d8'],
  go:R('narrator','Off to the Secret Garden!'),seeds:['carrot','strawberry'],
  cam:{x0:3,y0:210,x1:41,y1:238},unlocked:()=>state.quest>=qi('c9fly')});
PADS.garden={x:9.5,y:217.4};
rect(0,208,43,239,'T');rect(5,211,38,236,'.');rect(5,222,38,222,'T');
const GATE={x:22.5,y:221}, GARDEN={x:22.5,y:229.5};
const SEEDS=[[12.5,226.5],[17.5,232.5],[23.5,234.5],[30.5,234.5],[34.5,227.5]];
SIGNS.push({x:12.5,y:219.7,text:'Secret Garden'});
const L={
  found:R('narrator','You found a flower seed!'),
  done:R('narrator','The secret garden is blooming!'),
  play:R(ID,'Let us find flower seeds together!'),
  playDone:R(ID,'That was blooming fun!'),
  noRoom:R('narrator','Find a bigger open space to play!'),
  path:R('narrator','Open the hidden path'),
  leaf:R('narrator','Tap the leaf!'),flower:R('narrator','Tap the flower!'),
  title:R('narrator','Plant the secret garden'),
  color:R('narrator','Pick your flowers!'),center:R('narrator','Pick a garden decoration!'),
  pink:R('narrator','Pink flowers'),yellow:R('narrator','Yellow flowers'),
  butterfly:R('narrator','A butterfly'),star:R('narrator','A star')
};
const STAGES=[
  {id:'color',say:L.color,opts:[{k:'pink',html:'🌸',say:L.pink},{k:'yellow',html:'🌼',say:L.yellow}]},
  {id:'center',say:L.center,opts:[{k:'butterfly',html:'🦋',say:L.butterfly},{k:'star',html:'⭐',say:L.star}]}
];
const quests=[
  {id:'c9fly',chapter:'Secret Garden',chapterIcon:'🌷',icon:'🎈',text:'Fly the Rainbow Balloon to the Secret Garden.',
    start:[['grandma','A little pony found a hidden garden, but its flowers need help!'],
      ['grandma','Take the Rainbow Balloon to the Secret Garden!']],
    hint:'Tap the Rainbow Balloon. Then tap the Secret Garden picture!'},
  {id:'c9path',icon:'🌿',text:'Open the hidden path. Tap the leafy arch.',
    start:[['bloom','Hello! I am Bloom. The garden is hiding behind these leaves.'],
      ['bloom','Let us play the leaf and flower pattern to open the path!']],
    hint:'Follow the arrow to the leafy arch. Tap the pictures you hear!'},
  {id:'c9seeds',icon:'🌱',text:'Find 5 flower seeds. Tap them or walk to them.',goal:5,handin:true,prog:()=>C9().seeds.length,
    start:[['bloom','The path is open! Can you find the five flower seeds inside?']],
    hint:'Follow the arrow to each seed. Tap it or walk to it!'},
  {id:'c9garden',icon:'🌸',text:'Plant the secret garden. Tap the garden bed.',
    start:[['bloom','You found every seed! Let us plant a beautiful garden together.']],
    hint:'Tap the garden bed and pick the flowers and decoration you like!'},
  {id:'c9friend',icon:'🐴',text:'Say hello to Bloom. Tap the pony.',
    start:[['bloom','The garden is blooming! Come and say hello!']],
    hint:'Follow the arrow and tap Bloom the pony!'},
  {id:'c9home',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
    start:[['bloom','May I live in Pony Village? Here is magic wood for a cottage.'],()=>LG.giftWood([ID])],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'c9build',icon:'🏠',text:'Make a cottage for Bloom in Pony Village.',goal:1,handin:true,
    prog:()=>rescued(ID)&&!!state.cottages[state.ponies[ID].home]?1:0,
    start:[()=>{LG.fillCottages([ID]);LG.giftWood([ID]);},
      ['grandma','Welcome home! Let us make a cozy cottage for your new friend.']],
    hint:'Go to Pony Village and tap the hammer to build a cottage.'}
];
addChapter(quests);
LG.NEED.c9fly='garden';LG.NEED.c9home='valley';LG.BUILD.add('c9build');
const isChapter=()=>qid().startsWith('c9');
function C9(){
  if(!state.ch9||typeof state.ch9!=='object')state.ch9={};
  const c=state.ch9;
  if(!Array.isArray(c.seeds))c.seeds=[];
  if(c.path===undefined)c.path=false;
  if(c.garden===undefined)c.garden=null;
  if(c.done===undefined)c.done=false;
  return c;
}
function syncPath(){rect(21,222,23,222,C9().path?'.':'T');}
function collect(mode){
  const items=mode==='story'?SEEDS.map(([x,y],i)=>({x,y,pi:i})).filter(o=>!C9().seeds.includes(o.pi)):LG.spotsNear(5,1.5,5);
  if(!items.length){if(mode==='play')say(L.noRoom,'narrator');return;}
  if(mode==='play')say(L.play,ID);
  LG.field({id:'gardenSeeds',mode,quest:mode==='story'?'c9seeds':undefined,area:hereArea(),items,art:'garden.seed',r:1,hy:.5,walkPop:.9,
    onPop:it=>{sfx('pop');burst(it.x,it.y-.5,'✨',5);say(L.found,'narrator');
      if(mode==='story'&&!C9().seeds.includes(it.pi)){C9().seeds.push(it.pi);saveGame();}},
    onDone:()=>{if(mode==='play'){say(L.playDone,ID);celebrate(true);if(rescued(ID))addHeart(ID,2);saveGame();}}});
}
function openPath(){
  if(qid()!=='c9path'){say(C9().path?L.done:(isChapter()?Q[state.quest].hint:L.path),'narrator');return;}
  LG.pickGame({mode:'story',title:'🌿 Open the hidden path',titleSay:L.path,who:'narrator',art:'garden.pathPreview',
    recipe:true,steps:[{say:L.leaf,want:'leaf'},{say:L.flower,want:'flower'},{say:L.leaf,want:'leaf'}],
    opts:[{k:'leaf',html:'🌿'},{k:'flower',html:'🌸'}],
    onDone:()=>{C9().path=true;syncPath();saveGame();celebrate();completeQuest();}});
}
function plant(){
  if(qid()!=='c9garden'){say(C9().garden?L.done:(isChapter()?Q[state.quest].hint:L.title),'narrator');return;}
  LG.builder({mode:'story',quest:'c9garden',title:'🌸 Plant the secret garden',titleSay:L.title,who:'narrator',
    stages:STAGES,art:'garden.preview',onDone:choices=>{C9().garden=choices;saveGame();celebrate();completeQuest();}});
}
function meet(){
  if(qid()==='c9friend'&&!rescued(ID))return talk([
    ['bloom','Thank you for bringing the garden back to bloom!'],
    ['bloom','Will you be my friend?']],()=>namePony(ID));
  say(T2.shy,ID);
}
HOOK.restore.push(syncPath);
HOOK.begin.push(isNew=>{const c=C9();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('c9fly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
});
HOOK.update.push(()=>{
  const c=C9(),q=qid(),here=hereArea();
  if(isChapter()&&Q[state.quest].goal){
    const text=`${Math.min(state.qprog,Q[state.quest].goal)}/${Q[state.quest].goal}`;
    if($('objProg').textContent!==text)$('objProg').textContent=text;
  }
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='c9fly'&&here==='garden')return completeQuest();
  if(q==='c9path'&&c.path)return completeQuest();
  if(q==='c9seeds'&&here==='garden'){
    if(c.seeds.length>=SEEDS.length&&!LG.active())return completeQuest();
    if(!LG.active()&&c.seeds.length<SEEDS.length)collect('story');
  }
  if(q==='c9garden'&&c.garden)return completeQuest();
  if(q==='c9friend'&&rescued(ID))return completeQuest();
  if(q==='c9home'&&here==='valley')return completeQuest();
  if(q==='c9build'&&quests[6].prog()&&!ents[ID].goHome){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','Hooray! Bloom has a home, and the secret garden is blooming!'],
      ['bloom','Thank you, friend! We can play together whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((wx,wy)=>{
  if(hereArea()!=='garden')return false;
  const p=PADS.garden;
  if(state.balloonAt==='garden'&&Math.abs(wx-p.x)<1.1&&wy>p.y-3.6&&wy<p.y+.3)return false;
  if(Math.abs(wx-GATE.x)<1.5&&wy>GATE.y-2&&wy<GATE.y+.5){goDo(GATE.x,GATE.y,1.8,openPath);return true;}
  if(dist(wx,wy,GARDEN.x,GARDEN.y-.5)<1.5){goDo(GARDEN.x,GARDEN.y+1,2,plant);return true;}
  const e=ents[ID];
  if(!rescued(ID)&&dist(wx,wy,e.x,e.y-.3)<1){goDo(e.x,e.y,1.9,meet,e);return true;}
  return false;
});
HOOK.target.push(()=>{
  if(!isChapter())return undefined;
  const q=qid();
  if(q==='c9home')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='c9build')return LG.villageTarget();
  const g=LG.goArea('garden');if(g!==null)return g;
  if(q==='c9path')return{x:GATE.x,y:GATE.y-1};
  if(q==='c9garden')return{x:GARDEN.x,y:GARDEN.y-.5};
  if(q==='c9friend')return{x:ents[ID].x,y:ents[ID].y-.7};
  return null;
});
HOOK.play[ID]=()=>collect('play');
HOOK.layer.push(layers=>{
  if(hereArea()!=='garden')return;
  layers.push([GATE.y,()=>ART.path(SX(GATE.x),SY(GATE.y),ts,C9().path)]);
  layers.push([GARDEN.y,()=>ART.bed(SX(GARDEN.x),SY(GARDEN.y),ts,C9().garden)]);
});
ART.path=function(x,y,s,open){drawEmoji(open?'🌿':'🌳',x,y-s*.5,s*1.6);};
ART.bed=function(x,y,s,choice){
  ctx.save();ctx.translate(x,y);ctx.fillStyle='#956b4a';ell(0,0,s*1.3,s*.45);ctx.fill();
  if(choice){for(const dx of [-.8,0,.8])drawEmoji(choice.color==='pink'?'🌸':'🌼',dx*s,-s*.3,s*.65);
    drawEmoji(choice.center==='star'?'⭐':'🦋',0,-s*.9,s*.6);}
  else drawEmoji('🌱',0,-s*.3,s*.6);
  ctx.restore();
};
ART.preview=function(w,h,t,g){ART.bed(w/2,h*.75,80,g.ch);};
ART.pathPreview=function(w,h){drawEmoji('🌿',w/2,h/2,120);};
ART.seed=function(it,t){drawEmoji('🌱',SX(it.x),SY(it.y-.5),ts*(.8+Math.sin(t*3)*.06));};
ART.tree=function(x,y){drawEmoji('🌳',SX(x+.5),SY(y+1),ts*1.5);};
ART.grassDeco=function(x,y,c,s,r){if(r()<.14)drawEmoji('🌼',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=function(y,s){drawEmoji('🌳',vw*.3,y,s*1.4);drawEmoji('🌷',vw*.65,y,s*1.2);};
})();
