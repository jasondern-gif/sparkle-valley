'use strict';
// Rainbow Railway: make the track safe, guide a gentle train, and welcome two friends.
(()=>{
const R=t=>reg('narrator',t), ART=LandArt.railway, IDS=['piper','tinsel'];
document.head.insertAdjacentHTML('beforeend','<style>#railOpts .sayBtn{width:44px;height:44px;font-size:20px;border-width:2px;grid-column:2;grid-row:1}#railOpts .railChoice{display:grid;grid-template-columns:84px 44px;align-items:center;gap:4px}#railOpts .railLabel{grid-column:1 / -1;font-size:18px;text-align:center;max-width:132px}</style>');
for(const [id,names,look,home] of [
  ['piper',['Piper','Chime','Whistle','Daisy'],{body:'#ffdfb1',mane:['#ef9b9b','#f4e3a8','#a7d6ca'],hoof:'#b18a76',snout:'#fff3df',scale:.84},{x:28.5,y:412.5}],
  ['tinsel',['Tinsel','Star','Ribbon','Shimmer'],{body:'#cddbf4',mane:['#b8a5db','#f6c6d9','#f7e8a4'],hoof:'#8b91ad',snout:'#f4f4ff',scale:.84},{x:30.5,y:422.5}]
]){
  SPK[id]={n:names[0],f:'🐴',portrait:true,p:1.3,r:1};
  PONIES[id]={names,fav:'carrot',acc:'🚂',home,look};PONY_IDS.push(id);names.forEach(R);
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>reg(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])reg(id,T2[k]);
  reg(id,'Mmm! A cupcake! I love cupcakes!');
  if(window.VIL_PERSONA)VIL_PERSONA[id]={likes:['pond','playground']};
}
Object.assign(AREAS.railway,{name:R('Rainbow Railway'),icon:'🚂',sky:['#bde6ef','#fff0d3'],seeds:[],
  go:R('All aboard for Rainbow Railway!'),unlocked:()=>state.quest>=qi('railFly'),
  cam:{x0:3,y0:402,x1:41,y1:430}});
PADS.railway={x:9.5,y:409.4};
rect(0,400,43,431,'T');rect(5,403,38,428,'.');
SIGNS.push({x:12.5,y:411.7,text:'Rainbow Railway'});
const SPOTS={bridge:{x:17.5,y:408.5},outbound:{x:21.5,y:413.5},signals:{x:24.5,y:420.5},returning:{x:20.5,y:425.5},flags:{x:16.5,y:422.5}};
const QUEST={bridge:'railBridge',outbound:'railOutbound',signals:'railSignals',returning:'railReturn',flags:'railFlags'};
const stations=[
  {key:'flower',name:'Flower station',icon:'🌼'},
  {key:'hill',name:'Hill station',icon:'⛰️'},
  {key:'home',name:'Home station',icon:'🏠'}
];
const routes={outbound:['flower','hill'],returning:['hill','flower','home']};
const signalNotes=[{key:'soft',name:'Soft bell',icon:'🔔'},{key:'wave',name:'Friendly wave',icon:'👋'},{key:'rest',name:'Quiet pause',icon:'💤'}];
const descriptions={
  bridge:R('Help Piper make the bridge safe. Place each sleeper, then check it together.'),
  outbound:R('Guide the train to Flower station, then Hill station. Set the switch before each gentle journey.'),
  signals:R('Help Tinsel feel comfortable. Share a soft bell, a friendly wave, and a quiet pause.'),
  returning:R('Bring Tinsel home by train. Set the switch for each station before the train moves.'),
  flags:R('Choose three flags to welcome everyone to the railway!')};
const qs=[
  {id:'railFly',chapter:'Rainbow Railway',chapterIcon:'🚂',icon:'🎈',text:'Discover Rainbow Railway.',
    start:[['grandma','Rainbow Railway needs helpers! Piper is waiting beyond a bridge, and Tinsel is nervous about riding home.'],
      ['grandma','We can work together to make the railway safe and welcoming.']],hint:'Tap the Rainbow Balloon, then Rainbow Railway!'},
  {id:'railBridge',icon:'🛤️',text:'Make the railway bridge safe together.',goal:3,handin:true,prog:()=>C().bridge,
    start:[['piper','Hello! The bridge needs three sleepers. Place each one and let us check it before the train crosses.']],hint:descriptions.bridge},
  {id:'railOutbound',icon:'🚂',text:'Guide the train to Piper.',goal:2,handin:true,prog:()=>C().outbound.length,
    start:[['grandma','The bridge is ready. Let us set the switches and visit each station on the way to Piper.']],hint:descriptions.outbound},
  {id:'railPiper',icon:'🐴',text:'Welcome Piper. Tap the pony.',hint:'Follow the arrow to Piper and choose a name.'},
  {id:'railSignals',icon:'🔔',text:'Make a calm welcome for Tinsel.',goal:3,handin:true,prog:()=>C().signals.length,
    start:[['tinsel','The train feels a little unfamiliar. Could we share some gentle signals before I ride?']],hint:descriptions.signals},
  {id:'railReturn',icon:'🚉',text:'Guide Tinsel safely back through the stations.',goal:3,handin:true,prog:()=>C().returning.length,
    start:[['tinsel','I feel ready now. Let us visit the stations together on the way home!']],hint:descriptions.returning},
  {id:'railTinsel',icon:'🐴',text:'Welcome Tinsel. Tap the pony.',hint:'Follow the arrow to Tinsel and choose a name.'},
  {id:'railFlags',icon:'🎏',text:'Make a railway welcome display.',goal:3,handin:true,prog:()=>C().flags.length,
    start:[['piper','Let us leave colorful flags so everyone feels welcome at the station!']],hint:descriptions.flags},
  {id:'railHome',icon:'🎈',text:'Bring Piper and Tinsel home.',
    start:[['tinsel','May we join Pony Village? We brought magic wood for our cottages!'],()=>LG.giftWood(IDS)],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'railBuild',icon:'🏠',text:'Make cottages for Piper and Tinsel.',goal:2,handin:true,
    prog:()=>IDS.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
    start:[()=>{LG.fillCottages(IDS);LG.giftWood(IDS);},['grandma','Let us make cozy homes for our railway friends!']],
    hint:'Go to Pony Village and tap the hammer. The magic wood is a gift!'}
];
addChapter(qs);LG.NEED.railFly='railway';LG.NEED.railHome='valley';LG.BUILD.add('railBuild');
function C(){
  if(!state.ch15||typeof state.ch15!=='object'||Array.isArray(state.ch15))state.ch15={};
  const c=state.ch15;
  for(const k of ['outbound','signals','returning','flags'])if(!Array.isArray(c[k]))c[k]=[];
  if(typeof c.bridge!=='number')c.bridge=0;
  return c;
}
function play(key,mode='story',pony){
  if(mode==='story'&&qid()!==QUEST[key]){say(Q[state.quest].hint,'narrator');return;}
  const c=mode==='story'?C():{bridge:0,outbound:[],signals:[],returning:[],flags:[]};
  const done=()=>key==='bridge'?c.bridge>=3:c[key].length>= (routes[key]?routes[key].length:3);
  if(done())return;
  const g=LG.screenGame({mode,quest:mode==='story'?QUEST[key]:null,title:'🚂 '+descriptions[key],titleSay:descriptions[key],w:480,h:230,
    draw:(ctx,w,h)=>{
      ctx.fillStyle='#edf8ef';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.fillStyle='#53627b';ctx.font='22px sans-serif';
      if(key==='outbound'||key==='returning'){
        const n=c[key].length;
        ctx.strokeStyle='#9b806c';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(40,115);ctx.lineTo(220,115);
        ctx.lineTo(400,55);ctx.moveTo(220,115);ctx.lineTo(400,115);ctx.moveTo(220,115);ctx.lineTo(400,175);ctx.stroke();
        stations.forEach((s,i)=>{ctx.fillText(s.icon,425,65+i*60);ctx.fillText(s.name,330,48+i*60);});
        ctx.fillText('🚂',80+n*45,100);ctx.fillText('Next: '+stations.find(s=>s.key===routes[key][n]).name,240,215);
        if(c[key+'Switch'])ctx.fillText('Switch: '+stations.find(s=>s.key===c[key+'Switch']).name,120,165);
      }else if(key==='bridge'){
        ctx.strokeStyle='#a08367';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(50,90);ctx.lineTo(430,90);ctx.moveTo(50,145);ctx.lineTo(430,145);ctx.stroke();
        for(let i=0;i<3;i++){ctx.fillStyle=i<c.bridge?'#b98b60':i===c.bridge&&c.bridgePlaced?'#e6bb86':'#dce4dc';ctx.fillRect(115+i*120,80,24,75);}
        ctx.fillText(c.bridge+' / 3 checked',240,195);
      }else{
        const a=c[key];ctx.font='46px sans-serif';
        for(let i=0;i<3;i++)ctx.fillText(a[i]?(key==='flags'?stations:signalNotes).find(s=>s.key===a[i]).icon:'○',130+i*110,125);
        ctx.font='22px sans-serif';ctx.fillText(a.length+' / 3',240,195);
      }
    },html:'<div class="lgOpts" id="railOpts"></div>'});
  let finishing=false;
  function persist(){if(mode==='story')saveGame();}
  function finish(){
    finishing=true;$('railOpts').innerHTML='';LG.screenSay(R('Wonderful teamwork!'));
    setTimeout(()=>{if(LG.active()!==g)return;LG.stop(true);celebrate(true);
      if(mode==='play'&&rescued(pony)){addHeart(pony,2);saveGame();}},1200);
  }
  function hint(){
    if(key==='bridge')return c.bridgePlaced?R('Check the sleeper together before placing the next one.'):R('Place a sleeper on the bridge.');
    if(routes[key])return R('Set the switch to '+stations.find(s=>s.key===routes[key][c[key].length]).name+', then tap Travel.');
    if(key==='signals')return R('Try '+signalNotes[c.signals.length].name+' for Tinsel.');
    return R('Choose any flag for the station!');
  }
  function show(){
    const opts=key==='bridge'?[{key:'place',name:'Place sleeper',icon:'🪵'},{key:'check',name:'Check sleeper',icon:'✔'}]:
      routes[key]?[...stations,{key:'travel',name:'Travel',icon:'▶'}]:key==='signals'?signalNotes:stations;
    $('railOpts').innerHTML=opts.map(o=>{
      const selected=routes[key]&&o.key!=='travel'?c[key+'Switch']===o.key:undefined;
      const name=o.name+(selected?' selected':'');
      return `<div class="railChoice" data-say="${R(name)}"><button data-rail="${o.key}" aria-label="${name}" title="${name}"${selected===undefined?'':` aria-pressed="${selected}"`}>${o.icon}</button><span class="railLabel">${name}</span></div>`;
    }).join('');
    addSayButtons($('railOpts'));
    $('railOpts').querySelectorAll('[data-rail]').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g||finishing)return;
      const k=b.dataset.rail;
      if(key==='bridge'){
        if(k==='place')c.bridgePlaced=true;
        else if(c.bridgePlaced){c.bridge++;c.bridgePlaced=false;}
        else{LG.screenSay(hint());return;}
      }else if(routes[key]){
        if(k!=='travel')c[key+'Switch']=k;
        else if(c[key+'Switch']===routes[key][c[key].length]){c[key].push(c[key+'Switch']);c[key+'Switch']=null;}
        else{LG.screenSay(hint());return;}
      }else if(key==='signals'){
        if(k!==signalNotes[c.signals.length].key){LG.screenSay(hint());return;}
        c.signals.push(k);
      }else c.flags.push(k);
      persist();sfx('sparkle');if(done())finish();else show();
    });
    LG.screenSay(hint());
  }
  show();if(mode==='play')LG.screenSay(R('Let us play again! Our story stays safe.')+' '+hint());
}
HOOK.begin.push(isNew=>{
  const c=C();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('railFly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
  if(!isNew&&['railHome','railBuild'].includes(qid())){LG.fillCottages(IDS);LG.giftWood(IDS);}
});
HOOK.update.push(()=>{
  const c=C(),q=qid();
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='railFly'&&hereArea()==='railway')return completeQuest();
  const key=Object.keys(QUEST).find(k=>QUEST[k]===q);
  if(key&&(key==='bridge'?c.bridge>=3:c[key].length>=(routes[key]?routes[key].length:3)))return completeQuest();
  if(q==='railPiper'&&rescued('piper')||q==='railTinsel'&&rescued('tinsel'))return completeQuest();
  if(q==='railHome'&&hereArea()==='valley')return completeQuest();
  if(q==='railBuild'&&qs[9].prog()===2&&IDS.every(id=>!ents[id].goHome)){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','The railway is safe, and the station flags welcome everyone!'],
      ['tinsel','Thank you for traveling gently with us!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((x,y)=>{
  if(hereArea()!=='railway')return false;
  const p=PADS.railway;if(state.balloonAt==='railway'&&Math.abs(x-p.x)<1.1&&y>p.y-3.6&&y<p.y+.3)return false;
  for(const [key,spot] of Object.entries(SPOTS))if(dist(x,y,spot.x,spot.y-.5)<1.3){
    goDo(spot.x,spot.y+1,2,()=>play(key));return true;
  }
  for(const id of IDS){const e=ents[id];if(!rescued(id)&&dist(x,y,e.x,e.y-.3)<1){
    goDo(e.x,e.y,1.9,()=>{
      if(qid()===(id==='piper'?'railPiper':'railTinsel'))talk([[id,'Thank you for helping me! Will you be my friend?']],()=>namePony(id));
      else say(T2.shy,id);
    },e);return true;
  }}
  return false;
});
HOOK.target.push(()=>{
  if(!qid().startsWith('rail'))return undefined;
  if(qid()==='railHome')return hereArea()==='valley'?null:LG.padTarget();
  if(qid()==='railBuild')return LG.villageTarget();
  const g=LG.goArea('railway');if(g!==null)return g;
  const key=Object.keys(QUEST).find(k=>QUEST[k]===qid()),spot=SPOTS[key];
  if(spot)return{x:spot.x,y:spot.y-.5};
  const id=qid()==='railPiper'?'piper':qid()==='railTinsel'?'tinsel':null;
  return id?{x:ents[id].x,y:ents[id].y-.7}:null;
});
HOOK.play.piper=()=>play('outbound','play','piper');
HOOK.play.tinsel=()=>play('signals','play','tinsel');
HOOK.ground.push(()=>{
  if(hereArea()!=='railway')return;
  ctx.save();ctx.strokeStyle='#9b806c';ctx.lineWidth=ts*.15;
  for(const dy of [-.18,.18]){ctx.beginPath();ctx.moveTo(SX(15),SY(414+dy));ctx.lineTo(SX(33),SY(414+dy));ctx.stroke();}
  ctx.restore();
});
HOOK.layer.push(layers=>{
  if(hereArea()!=='railway')return;
  for(const [key,icon] of [['bridge','🛤️'],['outbound','🚂'],['signals','🔔'],['returning','🚉'],['flags','🎏']]){
    const spot=SPOTS[key];layers.push([spot.y,()=>drawEmoji(icon,SX(spot.x),SY(spot.y-.5),ts)]);
  }
  C().flags.forEach((key,i)=>layers.push([426,()=>drawEmoji(stations.find(s=>s.key===key).icon,SX(15+i*1.1),SY(426),ts*.8)]));
});
ART.tree=(x,y)=>drawEmoji('🌲',SX(x+.5),SY(y+1),ts*1.4);
ART.grassDeco=(x,y,c,s,r)=>{if(r()<.05)drawEmoji('🌼',(x+.5)*s,(y+.5)*s,s*.4);};
ART.flightScene=(y,s)=>{drawEmoji('🚂',vw*.35,y,s*1.2);drawEmoji('🚉',vw*.65,y,s);};
})();
