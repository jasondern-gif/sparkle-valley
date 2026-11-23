'use strict';
// Butterfly Brook: observe wing patterns, route a boat, and mend a mirrored kite.
(()=>{
const R=t=>reg('narrator',t), ART=LandArt.brook, IDS=['ripple','mallow'];
document.head.insertAdjacentHTML('beforeend','<style>#brookOpts .sayBtn{width:36px;height:36px;font-size:20px;border-width:2px;grid-column:2;grid-row:1;}#brookOpts .brookChoice{display:grid;grid-template-columns:84px 36px;align-items:center;gap:4px;}#brookOpts .brookLabel{grid-column:1 / -1;font-size:18px;text-align:center;max-width:124px;}</style>');
const PATTERNS=[{key:'spots',icon:'●',name:'Spots'},{key:'stripes',icon:'≡',name:'Stripes'},{key:'stars',icon:'★',name:'Stars'}];
for(const [id,look,home] of [
  ['ripple',{body:'#b9e5e8',mane:['#5baebc','#f9e5ac','#b7d3f2'],hoof:'#698f9d',snout:'#f0ffff',scale:.84},{x:27.5,y:380.5}],
  ['mallow',{body:'#f4cde2',mane:['#bdace4','#f9f0bb','#e8a6c6'],hoof:'#ac859f',snout:'#fff4fa',scale:.84},{x:30.5,y:390.5}]
]){
  const names=id==='ripple'?['Ripple','Pebble','Dewdrop','Skipper']:['Mallow','Silky','Flutter','Velvet'];
  SPK[id]={n:names[0],f:'🐴',portrait:true,p:1.3,r:1};
  PONIES[id]={names,fav:'carrot',acc:'🦋',home,look};PONY_IDS.push(id);
  names.forEach(R);
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>reg(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])reg(id,T2[k]);
  reg(id,'Mmm! A cupcake! I love cupcakes!');
  if(window.VIL_PERSONA)VIL_PERSONA[id]={likes:['pond','playground']};
}
Object.assign(AREAS.brook,{name:R('Butterfly Brook'),icon:'🦋',sky:['#b9e9ef','#f8e9cf'],seeds:[],
  go:R('Let us visit Butterfly Brook!'),unlocked:()=>state.quest>=qi('brookFly'),
  cam:{x0:3,y0:370,x1:41,y1:398}});
PADS.brook={x:9.5,y:377.4};
rect(0,368,43,399,'T');rect(5,371,38,396,'.');
SIGNS.push({x:12.5,y:379.7,text:'Butterfly Brook'});
const SPOTS={observe:{x:17.5,y:376.5},route:{x:21.5,y:381.5},kite:{x:24.5,y:388.5},mural:{x:17.5,y:393.5}};
const QUEST={observe:'brookObserve',route:'brookRoute',kite:'brookKite',mural:'brookMural'};
const L={
  observe:R('Look closely at each butterfly. Discover spots, stripes, and stars!'),
  route:R('Ripple is in a little boat on a dry channel. Open the boat gate, close the reed gate, then float the boat!'),
  kite:R('Mend the butterfly kite. Each right wing patch should match the left wing.'),
  mural:R('Make a wing-pattern mural for our butterfly friends. Choose any pattern for each flag!'),
  again:R('Let us play again! Our story stays safe.'),
  match:R('Look at the left wing. Try the same shape on the right wing. There is no hurry!'),
  done:R('Wonderful teamwork!'),
  seen:[R('Round spots! These butterflies rest on smooth stones.'),
    R('Long stripes! These butterflies shelter among the reeds.'),
    R('Pointy stars! These butterflies gather above the willow.')]
};
const quests=[
  {id:'brookFly',chapter:'Butterfly Brook',chapterIcon:'🦋',icon:'🎈',text:'Discover Butterfly Brook.',
    start:[['grandma','Butterfly Brook has two new pony friends! Ripple is in a boat on a dry channel. Mallow feels shy among fluttering wings.'],
      ['grandma','We can help by watching carefully and working together.']],hint:'Tap the Rainbow Balloon, then Butterfly Brook!'},
  {id:'brookObserve',icon:'🔎',text:'Discover three butterfly wing patterns.',goal:3,handin:true,prog:()=>C().observe.length,
    start:[['ripple','Hello! I am Ripple. Before we move the water, let us learn where the butterflies rest.']],
    hint:'Follow the arrow to the butterfly lookout. Tap each different wing pattern.'},
  {id:'brookRoute',icon:'💧',text:'Route the brook into Ripple’s boat channel.',handin:true,
    start:[['ripple','My boat is resting safely, but it cannot float yet! Keep water away from the butterfly reeds.']],
    hint:L.route},
  {id:'brookRipple',icon:'🐴',text:'Welcome Ripple. Tap the pony.',hint:'Follow the arrow to Ripple and choose a name.'},
  {id:'brookKite',icon:'🪁',text:'Mend a butterfly kite for Mallow.',goal:3,handin:true,prog:()=>C().kite.length,
    start:[['mallow','I am Mallow. So many fluttering wings feel tickly! Could a butterfly kite lead my little friends to the willow?'],
      ['ripple','We learned their wing patterns. Let us match both sides of the kite!']],
    hint:'Follow the arrow to the kite. Match each right wing to the left wing.'},
  {id:'brookMallow',icon:'🐴',text:'Welcome Mallow. Tap the pony.',hint:'Follow the arrow to Mallow and choose a name.'},
  {id:'brookMural',icon:'🎏',text:'Design a wing-pattern welcome mural.',goal:3,handin:true,prog:()=>C().mural.length,
    start:[['mallow','The butterflies are dancing with the kite now! Let us leave a welcome mural for everyone who visits.']],
    hint:L.mural},
  {id:'brookHome',icon:'🎈',text:'Bring Ripple and Mallow home.',
    start:[['ripple','May we join Pony Village? We brought magic wood for our cottages!'],()=>LG.giftWood(IDS)],
    hint:'Tap the Rainbow Balloon and fly home to Sparkle Valley.'},
  {id:'brookBuild',icon:'🏠',text:'Make cottages for Ripple and Mallow.',goal:2,handin:true,
    prog:()=>IDS.filter(id=>rescued(id)&&state.cottages[state.ponies[id].home]).length,
    start:[()=>{LG.fillCottages(IDS);LG.giftWood(IDS);},['grandma','Let us make cozy homes for our brook friends!']],
    hint:'Go to Pony Village and tap the hammer. The magic wood is a gift!'}
];
addChapter(quests);LG.NEED.brookFly='brook';LG.NEED.brookHome='valley';LG.BUILD.add('brookBuild');
function C(){
  if(!state.ch14||typeof state.ch14!=='object'||Array.isArray(state.ch14))state.ch14={};
  const c=state.ch14;
  for(const key of ['observe','kite','mural'])if(!Array.isArray(c[key]))c[key]=[];
  if(!c.gates||typeof c.gates!=='object')c.gates={boat:false,reeds:true};
  return c;
}
function butterfly(g,x,y,s,pattern){
  g.save();g.translate(x,y);
  for(const side of [-1,1]){
    g.fillStyle=side<0?'#f6c88f':'#d7b9eb';g.beginPath();g.ellipse(side*s*.27,0,s*.3,s*.42,side*.25,0,Math.PI*2);g.fill();
    g.fillStyle='#4c526e';g.font=`bold ${s*.3}px sans-serif`;g.textAlign='center';g.textBaseline='middle';
    g.fillText(pattern,side*s*.28,0);
  }
  g.fillStyle='#4c526e';g.fillRect(-s*.035,-s*.3,s*.07,s*.65);g.restore();
}
ART.butterfly=butterfly;
function play(key,mode='story',pony){
  if(mode==='story'&&qid()!==QUEST[key]){say(Q[state.quest].hint,'narrator');return;}
  const c=mode==='story'?C():{observe:[],kite:[],mural:[],gates:{boat:false,reeds:true}},a=c[key];
  if(key==='route'?c.route:a.length>=3)return;
  const g=LG.screenGame({mode,quest:mode==='story'?QUEST[key]:null,title:'🦋 '+L[key],titleSay:L[key],w:480,h:230,
    draw:(ctx,w,h)=>{
      ctx.fillStyle='#eef7ed';ctx.fillRect(0,0,w,h);
      if(key==='route'){
        ctx.lineWidth=18;ctx.lineCap='round';
        for(const [gate,y] of [['boat',95],['reeds',185]]){
          ctx.strokeStyle=c.gates[gate]?'#6ec7dd':'#d6c29b';ctx.beginPath();ctx.moveTo(50,45);ctx.lineTo(170,45);ctx.lineTo(245,y);ctx.lineTo(415,y);ctx.stroke();
          ctx.fillStyle=c.gates[gate]?'#54aa7c':'#9b7459';ctx.fillRect(257,y-22,12,44);
        }
        ctx.fillStyle='#556178';ctx.font='22px sans-serif';ctx.textAlign='center';
        ctx.fillText('Boat',400,65);ctx.fillText('Butterfly reeds',375,155);
        withCtx(ctx,()=>{drawEmoji('🛶',c.route?400:300,95,54);drawEmoji('🌾',410,188,45);});
      }else if(key==='kite'){
        const n=Math.min(a.length,2),pattern=PATTERNS[n];
        butterfly(ctx,w*.38,h*.5,180,pattern.icon);
        ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(w*.38+49,h*.5,45,67,.25,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#4c526e';ctx.font='48px sans-serif';ctx.textAlign='center';
        ctx.fillText(a[n]?pattern.icon:'?',w*.38+49,h*.5+16);
        ctx.font='22px sans-serif';ctx.fillText(`${a.length} / 3`,390,120);
      }else{
        PATTERNS.forEach((p,i)=>{
          const pattern=key==='mural'&&a[i]?PATTERNS.find(p=>p.key===a[i]):p;
          butterfly(ctx,90+i*150,110,100,pattern.icon);
          if(key==='observe'&&a.includes(p.key)){ctx.fillStyle='#4c526e';ctx.font='30px sans-serif';ctx.fillText('✓',70+i*150,190);}
        });
      }
    },html:'<div class="lgOpts" id="brookOpts"></div>'});
  let finishing=false;
  function persist(){if(mode==='story')saveGame();}
  function finish(){
    finishing=true;$('brookOpts').innerHTML='';LG.screenSay(L.done);
    setTimeout(()=>{
      if(LG.active()!==g)return;
      LG.stop(true);celebrate(true);
      if(mode==='play'&&rescued(pony)){addHeart(pony,2);saveGame();}
    },1200);
  }
  function hint(){
    if(key==='kite')return R('Match the '+PATTERNS[Math.min(a.length,2)].name.toLowerCase()+' on the left wing. Tap '+PATTERNS[Math.min(a.length,2)].name.toLowerCase()+'!');
    if(key==='mural')return R('Choose any pattern for flag '+(a.length+1)+'!');
    if(key==='route')return L.route;
    return L.observe;
  }
  function show(){
    const opts=key==='route'?[
      {key:'boat',icon:'🛶',name:'Boat gate',pressed:c.gates.boat},
      {key:'reeds',icon:'🌾',name:'Reed gate',pressed:c.gates.reeds},
      {key:'float',icon:'▶',name:'Float boat'}]:PATTERNS;
    $('brookOpts').innerHTML=opts.map(o=>{
      const pressed=key==='observe'?a.includes(o.key):o.pressed;
      const name=o.name+(key==='route'&&o.key!=='float'?(o.pressed?' open':' closed'):'');
      return `<div class="brookChoice" data-say="${R(name)}"><button data-brook="${o.key}" aria-label="${name}" title="${name}"${pressed===undefined?'':` aria-pressed="${pressed}"`}>${o.icon}</button><span class="brookLabel">${name}</span></div>`;
    }).join('');
    addSayButtons($('brookOpts'));
    $('brookOpts').querySelectorAll('button[data-brook]').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g||finishing)return;
      const k=b.dataset.brook;
      if(key==='route'){
        if(k==='float'){
          if(!c.gates.boat||c.gates.reeds){LG.screenSay(hint());return;}
          c.route=true;persist();finish();return;
        }
        c.gates[k]=!c.gates[k];persist();show();return;
      }
      if(key==='observe'){
        const i=PATTERNS.findIndex(p=>p.key===k);
        if(!a.includes(k))a.push(k);
        persist();
        if(a.length===3){finish();return;}
        show();LG.screenSay(L.seen[i]);return;
      }
      if(key==='kite'&&k!==PATTERNS[a.length].key){LG.screenSay(L.match+' '+hint());return;}
      a.push(k);persist();sfx('sparkle');if(a.length===3)finish();else show();
    });
    LG.screenSay(hint());
  }
  show();if(mode==='play')LG.screenSay(L.again+' '+hint());
}
HOOK.begin.push(isNew=>{
  const c=C();
  if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi('brookFly');state.qprog=0;updateObjective();talk(Q[state.quest].start);}
  if(!isNew&&['brookHome','brookBuild'].includes(qid())){LG.fillCottages(IDS);LG.giftWood(IDS);}
});
HOOK.update.push(()=>{
  const c=C(),q=qid();
  if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
  if(q==='brookFly'&&hereArea()==='brook')return completeQuest();
  if(q==='brookRoute'&&c.route)return completeQuest();
  const key=Object.keys(QUEST).find(k=>QUEST[k]===q);
  if(key&&key!=='route'&&c[key].length>=3)return completeQuest();
  if(q==='brookRipple'&&rescued('ripple')||q==='brookMallow'&&rescued('mallow'))return completeQuest();
  if(q==='brookHome'&&hereArea()==='valley')return completeQuest();
  if(q==='brookBuild'&&quests[8].prog()===2&&IDS.every(id=>!ents[id].goHome)){
    if(c.done)return completeQuest();
    c.done=true;saveGame();talk([['grandma','The boat is safe, the butterflies have their reeds, and the brook has a beautiful welcome mural!'],
      ['mallow','Now we have cozy homes too. Come play with us!']],()=>{celebrate();completeQuest();});
  }
});
HOOK.tap.push((x,y)=>{
  if(hereArea()!=='brook')return false;
  const p=PADS.brook;if(state.balloonAt==='brook'&&Math.abs(x-p.x)<1.1&&y>p.y-3.6&&y<p.y+.3)return false;
  for(const [key,spot] of Object.entries(SPOTS))if(dist(x,y,spot.x,spot.y-.5)<1.3){
    goDo(spot.x,spot.y+1,2,()=>play(key));return true;
  }
  for(const id of IDS){const e=ents[id];if(!rescued(id)&&dist(x,y,e.x,e.y-.3)<1){
    goDo(e.x,e.y,1.9,()=>{
      if(qid()===(id==='ripple'?'brookRipple':'brookMallow'))
        talk([[id,'Thank you for helping me feel safe! Will you be my friend?']],()=>namePony(id));
      else say(T2.shy,id);
    },e);return true;
  }}
  return false;
});
HOOK.target.push(()=>{
  if(!qid().startsWith('brook'))return undefined;
  if(qid()==='brookHome')return hereArea()==='valley'?null:LG.padTarget();
  if(qid()==='brookBuild')return LG.villageTarget();
  const g=LG.goArea('brook');if(g!==null)return g;
  const key=Object.keys(QUEST).find(k=>QUEST[k]===qid()),spot=SPOTS[key];
  if(spot)return{x:spot.x,y:spot.y-.5};
  const id=qid()==='brookRipple'?'ripple':qid()==='brookMallow'?'mallow':null;
  return id?{x:ents[id].x,y:ents[id].y-.7}:null;
});
HOOK.play.ripple=()=>play('route','play','ripple');
HOOK.play.mallow=()=>play('kite','play','mallow');
HOOK.ground.push(()=>{
  if(hereArea()!=='brook')return;
  const c=C();ctx.save();ctx.lineWidth=ts*.65;ctx.lineCap='round';
  ctx.strokeStyle=c.route?'#6ec7dd':'#d6c29b';ctx.beginPath();ctx.moveTo(SX(21.5),SY(380));ctx.lineTo(SX(28),SY(380));ctx.stroke();
  ctx.strokeStyle='#6ec7dd';ctx.beginPath();ctx.moveTo(SX(21.5),SY(374));ctx.lineTo(SX(21.5),SY(380));ctx.stroke();ctx.restore();
});
HOOK.layer.push(layers=>{
  if(hereArea()!=='brook')return;
  const c=C();
  for(const [key,icon] of [['observe','🔎'],['route','🛶'],['kite','🪁'],['mural','🎏']]){
    const spot=SPOTS[key];layers.push([spot.y,()=>drawEmoji(icon,SX(spot.x),SY(spot.y-.5),ts)]);
  }
  PATTERNS.forEach((p,i)=>layers.push([375,()=>butterfly(ctx,SX(16+i),SY(374.3),ts*.6,p.icon)]));
  if(c.kite.length===3)layers.push([391,()=>{drawEmoji('🪁',SX(33),SY(387),ts*1.4);butterfly(ctx,SX(33.6),SY(387.6),ts*.6,'★');}]);
  c.mural.forEach((key,i)=>layers.push([394,()=>butterfly(ctx,SX(18+i*1.2),SY(393),ts*.8,PATTERNS.find(p=>p.key===key).icon)]));
});
ART.tree=(x,y)=>{drawEmoji('🌾',SX(x+.5),SY(y+1),ts*1.4);};
ART.grassDeco=(x,y,c,s,r)=>{if(r()<.08)butterfly(ctx,(x+.5)*s,(y+.5)*s,s*.3,'●');};
ART.flightScene=(y,s)=>{butterfly(ctx,vw*.35,y,s*1.2,'★');drawEmoji('🌾',vw*.65,y,s);};
})();
