'use strict';
// Sunflower Hills: repair a crossing, help pollinators, and welcome two ponies.
(()=>{
const R=reg, ART=LandArt.hills, IDS=['sunny','briar'];
SPK.sunny={n:'Sunny',f:'🐴',portrait:true,p:1.3,r:1};
SPK.briar={n:'Briar',f:'🐴',portrait:true,p:1.3,r:1};
PONIES.sunny={names:['Sunny','Goldie','Daisy','Honey'],fav:'sunflower',acc:'🌻',home:{x:28.5,y:348.5},
  look:{body:'#fff0a8',mane:['#f9b74e','#fff4cc','#f9a7a5'],hoof:'#d39a67',snout:'#fff8e4',scale:.84}};
PONIES.briar={names:['Briar','Clover','Petal','Fern'],fav:'strawberry',acc:'🌼',home:{x:30.5,y:359.5},
  look:{body:'#ddc4ed',mane:['#a8d7a1','#f5c5de','#fff1b1'],hoof:'#a382a8',snout:'#fff5ff',scale:.84}};
IDS.forEach(id=>{
  PONY_IDS.push(id);PONIES[id].names.forEach(n=>R('narrator',n));
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>R(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])R(id,T2[k]);
  R(id,'Mmm! A cupcake! I love cupcakes!');
  if(window.VIL_PERSONA)VIL_PERSONA[id]={likes:['garden','playground']};
});
Object.assign(AREAS.hills,{name:R('narrator','Sunflower Hills'),icon:'🌻',sky:['#a5ddf6','#fff1bb'],
  go:R('narrator','Off to Sunflower Hills!'),seeds:['sunflower','carrot'],
  cam:{x0:3,y0:338,x1:41,y1:366},unlocked:()=>state.quest>=qi('hillsFly')});
PADS.hills={x:9.5,y:345.4};
rect(0,336,43,367,'T');rect(5,339,38,364,'.');
SIGNS.push({x:12.5,y:347.7,text:'Sunflower Hills'});
const BRIDGE={x:20.5,y:348.5}, FLOWERS={x:20.5,y:356.5}, BELLS={x:27.5,y:355.5}, GARDEN={x:16.5,y:361.5};
const lines={
  bridge:R('narrator','Build a safe little bridge for Sunny.'),
  flowers:R('narrator','Make a flower picnic for the bees.'),
  bells:R('narrator','Play the gentle bell song to guide Briar.'),
  garden:R('narrator','Choose flowers for the welcome garden.'),
  wrong:R('narrator','That is a lovely choice. Let us try the one in the hint!'),
  done:R('narrator','Wonderful! You did it!'),
  replay:R('narrator','Let us play together again!')
};
const activities={
  bridge:{title:lines.bridge,icon:'🌉',key:'bridge',opts:[
    {key:'stone',icon:'🪨',label:'Stones'},{key:'plank',icon:'🪵',label:'Planks'},{key:'rope',icon:'🪢',label:'Rope'}],
    steps:[
      {want:'stone',hint:R('narrator','First, put stones in the stream for sturdy supports. Tap the stones!')},
      {want:'plank',hint:R('narrator','Now lay planks across the supports. Tap the planks!')},
      {want:'rope',hint:R('narrator','Finally, add a rope handrail. Tap the rope!')}]},
  flowers:{title:lines.flowers,icon:'🐝',key:'flowers',opts:[
    {key:'sunflower',icon:'🌻',label:'Sunflower'},{key:'clover',icon:'🌼',label:'Clover'},{key:'water',icon:'💧',label:'Water'}],
    steps:[
      {want:'sunflower',hint:R('narrator','Place a sunflower for the bees. Tap the sunflower!')},
      {want:'clover',hint:R('narrator','Bees love clover too. Tap the clover flower!')},
      {want:'water',hint:R('narrator','Give the bees a little water. Tap the water drop!')}]},
  bells:{title:lines.bells,icon:'🔔',key:'bells',opts:[
    {key:'sun',icon:'☀️',label:'Sun bell'},{key:'flower',icon:'🌼',label:'Flower bell'},{key:'moon',icon:'🌙',label:'Moon bell'}],
    steps:[
      {want:'sun',hint:R('narrator','Ring the sun bell first. Tap the sun!')},
      {want:'flower',hint:R('narrator','Now ring the flower bell. Tap the flower!')},
      {want:'moon',hint:R('narrator','Finish with the moon bell. Tap the moon!')}]},
  garden:{title:lines.garden,icon:'🌷',key:'garden',opts:[
    {key:'sunflower',icon:'🌻',label:'Sunflower'},{key:'tulip',icon:'🌷',label:'Tulip'},{key:'blossom',icon:'🌸',label:'Blossom'}],
    steps:[
      {hint:R('narrator','Pick any flower for the first garden bed!')},
      {hint:R('narrator','Pick any flower for the second garden bed!')},
      {hint:R('narrator','Pick any flower for the last garden bed!')}]}
};
const quests=[
  {id:'hillsFly',chapter:'Sunflower Hills',chapterIcon:'🌻',icon:'🎈',text:'Fly to Sunflower Hills.',
    start:[['grandma','Two pony friends need help in Sunflower Hills. The stream crossing is broken and the bees have lost their flowers.'],
      ['grandma','Let us fly there and help everyone feel safe!']],hint:'Tap the Rainbow Balloon, then Sunflower Hills!'},
  {id:'hillsBridge',icon:'🌉',text:'Repair the stream bridge for Sunny.',goal:3,handin:true,prog:()=>C().bridge.length,
    start:[['sunny','I am Sunny! The stream is too wide for me. Can you make a safe bridge?']],
    hint:'Follow the arrow to the bridge. Choose the pieces in the order you hear.'},
  {id:'hillsSunny',icon:'🐴',text:'Welcome Sunny. Tap the pony.',hint:'Follow the arrow to Sunny and tap the pony.'},
  {id:'hillsFlowers',icon:'🐝',text:'Make a flower picnic for the bees.',goal:3,handin:true,prog:()=>C().flowers.length,
    start:[['sunny','The bees are looking for food and water. Let us make them a picnic away from the path!']],
    hint:'Follow the arrow to the flowers and help the bees.'},
  {id:'hillsBells',icon:'🔔',text:'Play a bell song to guide Briar.',goal:3,handin:true,prog:()=>C().bells.length,
    start:[['briar','I am Briar! I cannot see the path through the tall flowers.'],
      ['briar','Please ring the bells gently, and I will follow their song!']],
    hint:'Follow the arrow to the bells. Tap each bell in the order you hear.'},
  {id:'hillsBriar',icon:'🐴',text:'Welcome Briar. Tap the pony.',hint:'Follow the arrow to Briar and tap the pony.'},
  {id:'hillsGarden',icon:'🌷',text:'Plant a welcome garden together.',goal:3,handin:true,prog:()=>C().garden.length,
    start:[['briar','The bees have a picnic and we are safe! Let us plant a welcome garden together.']],
    hint:'Follow the arrow to the garden and choose flowers for each bed.'},
  {id:'hillsHome',icon:'🎈',text:'Fly home to Pony Village.',
    start:[['sunny','May we live in Pony Village? We brought magic wood for our cottages!'],()=>LG.giftWood(IDS)],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'hillsBuild',icon:'🏠',text:'Make cottages for Sunny and Briar.',goal:2,handin:true,
    prog:()=>IDS.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
    start:[()=>{LG.fillCottages(IDS);LG.giftWood(IDS);},['grandma','Let us make cozy cottages for both new friends!']],
    hint:'Go to Pony Village and tap the hammer to build cottages.'}
];
addChapter(quests);
LG.NEED.hillsFly='hills';LG.NEED.hillsHome='valley';LG.BUILD.add('hillsBuild');
const chapter=()=>qid().startsWith('hills');
function C(){
  if(!state.ch13||typeof state.ch13!=='object')state.ch13={};
  const c=state.ch13;
  for(const key of Object.keys(activities))if(!Array.isArray(c[key]))c[key]=[];
  return c;
}
function play(key,mode,pony){
  const a=activities[key],quest={bridge:'hillsBridge',flowers:'hillsFlowers',bells:'hillsBells',garden:'hillsGarden'}[key];
  if(mode==='story'&&qid()!==quest){say(chapter()?Q[state.quest].hint:a.title,'narrator');return;}
  const choices=mode==='story'?C()[key]:[];
  if(choices.length>=a.steps.length)return;
  const g=LG.screenGame({mode,quest:mode==='story'?quest:null,title:a.icon+' '+a.title,titleSay:a.title,w:440,h:200,
    draw:(ctx,w,h)=>{
      ctx.fillStyle='#fff7d6';ctx.fillRect(0,0,w,h);
      drawEmoji(a.icon,w*.18,h*.48,75);
      for(let i=0;i<3;i++)drawEmoji(choices[i]?(a.opts.find(o=>o.key===choices[i])||{}).icon||'✨':'▫️',w*(.42+i*.23),h*.52,52);
    },html:'<div class="lgOpts" id="hillsOpts"></div>'});
  if(mode==='play')LG.screenSay(lines.replay);
  function show(){
    const step=a.steps[choices.length];
    $('hillsOpts').innerHTML=a.opts.map(o=>`<button data-hills="${o.key}" aria-label="${o.label}" title="${o.label}">${o.icon}</button>`).join('');
    $('hillsOpts').querySelectorAll('button').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g)return;
      if(step.want&&b.dataset.hills!==step.want){sfx('nope');LG.screenSay(lines.wrong+' '+step.hint);return;}
      choices.push(b.dataset.hills);sfx('sparkle');
      if(mode==='story')saveGame();
      if(choices.length===a.steps.length){
        $('hillsOpts').innerHTML='';LG.screenSay(lines.done);
        setTimeout(()=>{if(LG.active()!==g)return;LG.stop(true);celebrate(true);
          if(mode==='play'&&rescued(pony)){addHeart(pony,2);saveGame();}},1200);
      }else show();
    });
    LG.screenSay(step.hint);
  }
  show();
}
HOOK.begin.push(isNew=>{
  const c=C();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('hillsFly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
  if(!isNew&&(qid()==='hillsHome'||qid()==='hillsBuild')){LG.fillCottages(IDS);LG.giftWood(IDS);}
});
HOOK.update.push(()=>{
  const c=C(),q=qid();
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='hillsFly'&&hereArea()==='hills')return completeQuest();
  const activity={hillsBridge:'bridge',hillsFlowers:'flowers',hillsBells:'bells',hillsGarden:'garden'}[q];
  if(activity&&c[activity].length>=3)return completeQuest();
  if(q==='hillsSunny'&&rescued('sunny')||q==='hillsBriar'&&rescued('briar'))return completeQuest();
  if(q==='hillsHome'&&hereArea()==='valley')return completeQuest();
  if(q==='hillsBuild'&&quests[8].prog()===2&&IDS.every(id=>!ents[id].goHome)){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','The hills are blooming, the bees have a picnic, and both ponies have homes!'],
      ['briar','Thank you, friend! Come play with us whenever you like!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((x,y)=>{
  if(hereArea()!=='hills')return false;
  const p=PADS.hills;if(state.balloonAt==='hills'&&Math.abs(x-p.x)<1.1&&y>p.y-3.6&&y<p.y+.3)return false;
  for(const [key,spot] of [['bridge',BRIDGE],['flowers',FLOWERS],['bells',BELLS],['garden',GARDEN]])
    if(dist(x,y,spot.x,spot.y-.5)<1.3){goDo(spot.x,spot.y+1,2,()=>play(key,'story'));return true;}
  for(const id of IDS){const e=ents[id];if(!rescued(id)&&dist(x,y,e.x,e.y-.3)<1){
    goDo(e.x,e.y,1.9,()=>{if(qid()===(id==='sunny'?'hillsSunny':'hillsBriar'))
      talk([[id,'Thank you for helping me! Will you be my friend?']],()=>namePony(id));
      else say(T2.shy,id);},e);return true;}}
  return false;
});
HOOK.target.push(()=>{
  if(!chapter())return undefined;
  const q=qid();
  if(q==='hillsHome')return hereArea()==='valley'?null:LG.padTarget();
  if(q==='hillsBuild')return LG.villageTarget();
  const g=LG.goArea('hills');if(g!==null)return g;
  const spot={hillsBridge:BRIDGE,hillsFlowers:FLOWERS,hillsBells:BELLS,hillsGarden:GARDEN}[q];
  if(spot)return{x:spot.x,y:spot.y-.5};
  const id=q==='hillsSunny'?'sunny':q==='hillsBriar'?'briar':null;
  return id?{x:ents[id].x,y:ents[id].y-.7}:null;
});
HOOK.play.sunny=()=>play('bridge','play','sunny');
HOOK.play.briar=()=>play('bells','play','briar');
HOOK.layer.push(layers=>{
  if(hereArea()!=='hills')return;
  const c=C();
  for(const [spot,icon] of [[BRIDGE,c.bridge.length===3?'🌉':'🪵'],[FLOWERS,c.flowers.length===3?'🌻':'🐝'],[BELLS,c.bells.length===3?'✨':'🔔'],[GARDEN,'🌷']])
    layers.push([spot.y,()=>drawEmoji(icon,SX(spot.x),SY(spot.y-.5),ts*1.1)]);
  if(c.flowers.length===3)layers.push([FLOWERS.y+1,()=>drawEmoji('🐝',SX(FLOWERS.x+1),SY(FLOWERS.y+.5),ts*.7)]);
  c.garden.forEach((key,i)=>layers.push([GARDEN.y+1,()=>drawEmoji((activities.garden.opts.find(o=>o.key===key)||{}).icon||'🌻',SX(GARDEN.x+1+i),SY(GARDEN.y+.5),ts*.65)]));
});
ART.tree=(x,y)=>drawEmoji('🌻',SX(x+.5),SY(y+1),ts*1.4);
ART.grassDeco=(x,y,c,s,r)=>{if(r()<.1)drawEmoji('🌼',(x+.5)*s,(y+.5)*s,s*.25);};
ART.flightScene=(y,s)=>{drawEmoji('🌻',vw*.3,y,s*1.4);drawEmoji('🐝',vw*.65,y-s*.6,s*.7);};
})();
