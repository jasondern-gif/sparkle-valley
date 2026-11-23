'use strict';
// Tidepool Harbor and Crystal Observatory: saved, untimed collaborative activities.
(()=>{
const R=t=>reg('narrator',t);
document.head.insertAdjacentHTML('beforeend',`<style>
#adventureOpts .adventureChoice{display:grid;grid-template-columns:84px 44px;gap:4px;align-items:center}
#adventureOpts .sayBtn{width:44px;height:44px;font-size:20px;border-width:2px;grid-column:2;grid-row:1}
#adventureOpts .adventureLabel{grid-column:1 / -1;text-align:center;font-size:18px;max-width:132px}
</style>`);

const lands=[
  {id:'harbor',prefix:'harbor',chapter:'Tidepool Harbor',icon:'⛵',y:432,ch:16,
    sky:['#a9dfe9','#fff1d2'],tree:'🌴',deco:'🐚',
    intro:'Sailor’s boat needs a repair, and Tide is waiting by the sheltered dock.',
    ponies:[
      {id:'sailor',names:['Sailor','Skipper','Marina','Wave'],body:'#b9e8e7',mane:['#6fb9c9','#f8e6ac','#f5b5a7']},
      {id:'tide',names:['Tide','Shell','Pebble','Sandy'],body:'#f9d1bd',mane:['#df9f9e','#f9e6ae','#9ecfd1']}
    ],
    activities:[
      {key:'patch',icon:'🔺',title:'Fit the boat patches',hint:'Choose a patch and turn it to match each hole. Then fit it to the boat.'},
      {key:'sail',icon:'⛵',title:'Sail through the channel',hint:'Set the sail with the wind and steer toward the next buoy, then sail.'},
      {key:'dock',icon:'⚓',title:'Open a safe dock for Tide',hint:'Open the boat gate and close the tidepool gate before bringing the boat in.'},
      {key:'display',icon:'🎏',title:'Build a harbor welcome display',hint:'Choose three decorations for the harbor welcome display.'}
    ]},
  {id:'observatory',prefix:'observatory',chapter:'Crystal Observatory',icon:'🔭',y:464,ch:17,
    sky:['#c6c3ef','#ffe3e8'],tree:'🌲',deco:'✨',
    intro:'Astra’s telescope needs its lenses and focus, and Orbit needs help reading the night sky.',
    ponies:[
      {id:'astra',names:['Astra','Nova','Stella','Comet'],body:'#d7cdf4',mane:['#a894dc','#f8c7d9','#f5e5a7']},
      {id:'orbit',names:['Orbit','Cosmo','Twirl','Galaxy'],body:'#d0e7f5',mane:['#7caacf','#c5a5e8','#f6d2d7']}
    ],
    activities:[
      {key:'lens',icon:'🔭',title:'Calibrate the telescope',hint:'Fit the lenses from largest to smallest, then turn the focus until the star is clear.'},
      {key:'chart',icon:'🗺️',title:'Align the sky chart',hint:'Turn the chart until its highlighted landmark points up, then check it against the sky.'},
      {key:'stars',icon:'🌟',title:'Trace a constellation',hint:'Connect the glowing stars in order to draw a path through the sky.'},
      {key:'mobile',icon:'🪐',title:'Make a planet mobile',hint:'Choose three planets for a lasting mobile in the observatory.'}
    ]}
];
const patches=[{shape:'triangle',turn:1},{shape:'corner',turn:2},{shape:'triangle',turn:3}];
const sails=[{wind:'east',rudder:'left'},{wind:'west',rudder:'right'},{wind:'east',rudder:'right'}];
const charts=[{name:'Moon',icon:'🌙',turn:1},{name:'Star',icon:'⭐',turn:3},{name:'Planet',icon:'🪐',turn:2}];
const outputs={
  display:[['shell','Shell','🐚'],['flag','Flag','🎏'],['anchor','Anchor','⚓']],
  mobile:[['earth','Blue planet','🌍'],['ring','Ringed planet','🪐'],['moon','Moon','🌙']]
};
function shape(ctx,name,turn,x,y,fill){
  ctx.save();ctx.translate(x,y);ctx.rotate(turn*Math.PI/2);ctx.beginPath();
  if(name==='triangle'){ctx.moveTo(0,-38);ctx.lineTo(35,30);ctx.lineTo(-35,30);ctx.closePath();}
  else{ctx.moveTo(-34,-34);ctx.lineTo(34,-34);ctx.lineTo(34,-10);ctx.lineTo(-10,-10);ctx.lineTo(-10,34);ctx.lineTo(-34,34);ctx.closePath();}
  ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#40516a';ctx.lineWidth=3;ctx.stroke();ctx.restore();
}
for(const land of lands){
  const {id,prefix,y,ponies,activities}=land,ids=ponies.map(p=>p.id),art=LandArt[id];
  for(const [i,p] of ponies.entries()){
    SPK[p.id]={n:p.names[0],f:'🐴',portrait:true,p:1.3,r:1};
    PONIES[p.id]={names:p.names,fav:'carrot',acc:land.icon,home:{x:28.5+i*2,y:y+12.5+i*10},
      look:{body:p.body,mane:p.mane,hoof:'#a78a99',snout:'#fff3ee',scale:.84}};
    PONY_IDS.push(p.id);p.names.forEach(R);
    for(const k of ['pet','brush','play'])T2[k].forEach(t=>reg(p.id,t));
    for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])reg(p.id,T2[k]);
    reg(p.id,'Mmm! A cupcake! I love cupcakes!');
    if(window.VIL_PERSONA)VIL_PERSONA[p.id]={likes:['pond','playground']};
  }
  const fly=prefix+'Fly',home=prefix+'Home',build=prefix+'Build',aq=a=>prefix+a.key;
  Object.assign(AREAS[id],{name:R(land.chapter),icon:land.icon,sky:land.sky,seeds:[],
    go:R('Let us visit '+land.chapter+'!'),unlocked:()=>state.quest>=qi(fly),
    cam:{x0:3,y0:y+2,x1:41,y1:y+30}});
  PADS[id]={x:9.5,y:y+9.4};rect(0,y,43,y+31,'T');rect(5,y+3,38,y+28,'.');
  SIGNS.push({x:12.5,y:y+11.7,text:land.chapter});
  const spots=activities.map((a,i)=>({x:[18.5,22.5,24.5,17.5][i],y:y+[8.5,15.5,22.5,25.5][i]}));
  function activityQuest(a){return{id:aq(a),icon:a.icon,text:a.title+'.',handin:true,
    start:[['grandma',a.hint]],hint:a.hint};}
  const quests=[
    {id:fly,chapter:land.chapter,chapterIcon:land.icon,icon:'🎈',text:'Discover '+land.chapter+'.',
      start:[['grandma',land.intro],['grandma','Let us visit and help our new friends together!']],
      hint:'Tap the Rainbow Balloon, then '+land.chapter+'!'},
    activityQuest(activities[0]),activityQuest(activities[1]),
    {id:prefix+'Friend1',icon:'🐴',text:'Welcome '+ponies[0].names[0]+'. Tap the pony.',hint:'Follow the arrow to the pony and choose a name.'},
    activityQuest(activities[2]),
    {id:prefix+'Friend2',icon:'🐴',text:'Welcome '+ponies[1].names[0]+'. Tap the pony.',hint:'Follow the arrow to the pony and choose a name.'},
    activityQuest(activities[3]),
    {id:home,icon:'🎈',text:'Bring your new friends home.',start:[[ponies[1].id,'May we join Pony Village? We brought magic wood for our cottages!'],()=>LG.giftWood(ids)],hint:'Fly home to Sparkle Valley.'},
    {id:build,icon:'🏠',text:'Make cottages for your new friends.',goal:2,handin:true,
      prog:()=>ids.filter(p=>rescued(p)&&state.cottages[state.ponies[p].home]).length,
      start:[()=>{LG.fillCottages(ids);LG.giftWood(ids);},['grandma','Let us make cozy homes for our new friends!']],
      hint:'Go to Pony Village and tap the hammer. The magic wood is a gift!'}
  ];
  addChapter(quests);LG.NEED[fly]=id;LG.NEED[home]='valley';LG.BUILD.add(build);
  function C(){
    const k='ch'+land.ch;
    if(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k]))state[k]={};
    const c=state[k];
    for(const a of activities)if(!c[a.key]||typeof c[a.key]!=='object'||Array.isArray(c[a.key]))c[a.key]={};
    return c;
  }
  function initial(key){
    if(key==='patch')return{step:0,shape:'triangle',turn:0};
    if(key==='sail')return{step:0,sail:'left',rudder:'left'};
    if(key==='dock')return{boat:false,pool:true,done:false};
    if(key==='lens')return{placed:[],focus:0,done:false};
    if(key==='chart')return{step:0,turn:0};
    if(key==='stars')return{step:0};
    return{choices:[]};
  }
  function progress(key,story){
    if(!story)return initial(key);
    const c=C(),defaults=initial(key);
    for(const k in defaults)if(c[key][k]===undefined)c[key][k]=defaults[k];
    return c[key];
  }
  function done(key,p){
    if(key==='dock'||key==='lens')return p.done;
    if(key==='display'||key==='mobile')return p.choices.length>=3;
    return p.step>=(key==='stars'?4:3);
  }
  function play(a,mode='story',pony){
    if(mode==='story'&&qid()!==aq(a)){say(Q[state.quest].hint,'narrator');return;}
    const p=progress(a.key,mode==='story'),key=a.key;
    if(done(key,p))return;
    const g=LG.screenGame({mode,quest:mode==='story'?aq(a):null,title:a.icon+' '+a.title,titleSay:R(a.hint),w:440,h:190,
      draw:(ctx,w,h)=>{
        ctx.fillStyle=id==='harbor'?'#e7f7f5':'#e9e9fa';ctx.fillRect(0,0,w,h);
        ctx.textAlign='center';ctx.fillStyle='#404b66';ctx.font='20px sans-serif';
        if(key==='patch'){
          const target=patches[Math.min(p.step,2)];
          ctx.fillText('Hole',110,30);ctx.fillText('Your patch',330,30);
          shape(ctx,target.shape,target.turn,110,100,'#d7c6a9');shape(ctx,p.shape,p.turn,330,100,'#f8aa92');
          ctx.fillText((p.step+1)+' / 3',220,180);
        }else if(key==='sail'){
          const s=sails[Math.min(p.step,2)];
          ctx.fillText('Wind '+s.wind+' '+(s.wind==='east'?'→':'←'),220,25);
          ctx.fillText('Next buoy: '+s.rudder,220,50);
          ctx.fillStyle='#8ccedc';ctx.fillRect(0,130,w,60);
          ctx.fillStyle='#a97b62';ctx.beginPath();ctx.moveTo(165,125);ctx.lineTo(275,125);ctx.lineTo(255,152);ctx.lineTo(185,152);ctx.closePath();ctx.fill();
          ctx.strokeStyle='#5e5869';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(220,125);ctx.lineTo(220,64);ctx.stroke();
          ctx.fillStyle='#ffedbd';ctx.beginPath();ctx.moveTo(220,67);ctx.lineTo(220,120);ctx.lineTo(p.sail==='right'?260:180,120);ctx.closePath();ctx.fill();ctx.stroke();
          ctx.strokeStyle='#5e5869';ctx.beginPath();ctx.moveTo(220,152);ctx.lineTo(p.rudder==='right'?235:205,172);ctx.stroke();
          ctx.fillStyle='#d85d71';ctx.beginPath();ctx.arc(s.rudder==='left'?70:370,145,10,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#404b66';ctx.font='18px sans-serif';ctx.fillText('Sail: '+p.sail+'   Rudder: '+p.rudder,220,185);
        }else if(key==='dock'){
          ctx.fillText('Boat gate: '+(p.boat?'open':'closed'),220,50);
          ctx.fillText('Tidepool gate: '+(p.pool?'open':'closed'),220,85);
          ctx.font='44px sans-serif';ctx.fillText('⛵  ⚓  🐚',220,150);
        }else if(key==='lens'){
          ctx.fillText('Lenses: '+(p.placed.join(' → ')||'none'),220,40);
          ctx.fillText('Focus: '+p.focus+' / 3',220,75);
          ctx.font=(p.focus===3?'54':'34')+'px sans-serif';ctx.globalAlpha=p.focus===3?1:.35;ctx.fillText('⭐',220,145);ctx.globalAlpha=1;
        }else if(key==='chart'){
          const c=charts[Math.min(p.step,2)];
          ctx.fillText('Find '+c.name+' at the top',220,28);
          ctx.save();ctx.translate(220,105);ctx.rotate(p.turn*Math.PI/2);
          ctx.strokeStyle='#7075a7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,65,0,Math.PI*2);ctx.stroke();
          ctx.font='28px sans-serif';ctx.fillText(c.icon,Math.sin(c.turn*Math.PI/2)*65,-Math.cos(c.turn*Math.PI/2)*65);
          ctx.fillText('✦',0,8);ctx.restore();ctx.font='20px sans-serif';ctx.fillText('↑',220,50);
        }else if(key==='stars'){
          const points=[[70,130],[160,60],[270,110],[370,45]];
          ctx.strokeStyle='#8885bc';ctx.lineWidth=3;ctx.beginPath();
          points.slice(0,p.step).forEach(([x,yy],i)=>i?ctx.lineTo(x,yy):ctx.moveTo(x,yy));ctx.stroke();
          points.forEach(([x,yy],i)=>{ctx.fillStyle=i<p.step?'#e5a52b':i===p.step?'#e05b8f':'#a7a5bc';ctx.font='28px sans-serif';ctx.fillText('★',x,yy);ctx.font='16px sans-serif';ctx.fillText(''+(i+1),x,yy+22);});
        }else{
          ctx.font='45px sans-serif';for(let i=0;i<3;i++){const o=outputs[key].find(c=>c[0]===p.choices[i]);ctx.fillText(o?o[2]:'○',110+i*110,105);}
        }
      },html:'<div class="lgOpts" id="adventureOpts"></div>'});
    let finishing=false;
    function hint(){
      const dirs=['up','right','down','left'];
      if(key==='patch'){const t=patches[p.step];return R('Hole: '+t.shape+' pointing '+dirs[t.turn]+'. Patch: '+p.shape+' pointing '+dirs[p.turn]+'. Match the hole, then tap Fit.');}
      if(key==='sail'){const s=sails[p.step];return R('Wind blows '+s.wind+'. Point the sail '+(s.wind==='east'?'right':'left')+' and steer '+s.rudder+' toward the buoy. Sail: '+p.sail+'. Rudder: '+p.rudder+'.');}
      if(key==='dock')return R('Open the boat gate and close the tidepool gate to protect the little creatures. Boat gate '+(p.boat?'open':'closed')+'. Tidepool gate '+(p.pool?'open':'closed')+'.');
      if(key==='lens')return R(p.placed.length<3?'Choose lenses from largest to smallest. Fitted: '+(p.placed.join(', ')||'none')+'.':'Turn the focus until the star is clear, then check. Focus '+p.focus+'.');
      if(key==='chart')return R('Turn the chart until '+charts[p.step].name+' is at the top. It is pointing '+dirs[(p.turn+charts[p.step].turn)%4]+'. Then check.');
      if(key==='stars')return R('Connect star '+(p.step+1)+'.');
      return R(a.hint);
    }
    function options(){
      if(key==='patch')return [['triangle','Triangle','🔺'],['corner','Corner','◩'],['rotate','Rotate patch','↻'],['fit','Fit patch','✔']];
      if(key==='sail')return [['sailLeft','Sail left','◀'],['sailRight','Sail right','▶'],['steerLeft','Steer left','⬅'],['steerRight','Steer right','➡'],['go','Sail onward','⛵']];
      if(key==='dock')return [['boat','Toggle boat gate','🚪'],['pool','Toggle tidepool gate','🐚'],['go','Bring boat in','⛵']];
      if(key==='lens')return p.placed.length<3?[['large','Large lens','🔵'],['medium','Medium lens','🟦'],['small','Small lens','🔹'],['undo','Remove last lens','↶']]:
        [['less','Focus down','−'],['more','Focus up','＋'],['check','Check focus','✔'],['undo','Remove last lens','↶']];
      if(key==='chart')return [['rotate','Rotate chart','↻'],['check','Check alignment','✔']];
      if(key==='stars')return [1,2,3,4].map(n=>['star'+n,'Star '+n,'⭐']);
      return outputs[key];
    }
    function show(focus){
      $('adventureOpts').innerHTML=options().map(([k,name,icon])=>{
        const selected=key==='patch'&&(k==='triangle'||k==='corner')?p.shape===k:
          key==='dock'&&(k==='boat'||k==='pool')?p[k]:
          key==='sail'&&k.startsWith('sail')?p.sail===(k==='sailLeft'?'left':'right'):
          key==='sail'&&k.startsWith('steer')?p.rudder===(k==='steerLeft'?'left':'right'):undefined;
        return `<div class="adventureChoice" data-say="${R(name)}"><button data-adventure="${k}" aria-label="${name}" title="${name}"${selected===undefined?'':` aria-pressed="${selected}"`}>${icon}</button><span class="adventureLabel">${name}</span></div>`;
      }).join('');
      addSayButtons($('adventureOpts'));
      $('adventureOpts').querySelectorAll('[data-adventure]').forEach(b=>b.onclick=e=>{
        if(LG.active()!==g||finishing)return;
        const k=b.dataset.adventure;let good=true;
        if(key==='patch'){
          if(k==='rotate')p.turn=(p.turn+1)%4;
          else if(k==='fit'){const t=patches[p.step];if(p.shape===t.shape&&p.turn===t.turn){p.step++;p.turn=0;}else good=false;}
          else p.shape=k;
        }else if(key==='sail'){
          if(k==='go'){const s=sails[p.step];if(p.sail===(s.wind==='east'?'right':'left')&&p.rudder===s.rudder)p.step++;else good=false;}
          else if(k.startsWith('sail'))p.sail=k==='sailLeft'?'left':'right';
          else p.rudder=k==='steerLeft'?'left':'right';
        }else if(key==='dock'){
          if(k==='boat')p.boat=!p.boat;else if(k==='pool')p.pool=!p.pool;
          else if(p.boat&&!p.pool)p.done=true;else good=false;
        }else if(key==='lens'){
          if(k==='undo')p.placed.pop();
          else if(k==='less')p.focus=Math.max(0,p.focus-1);
          else if(k==='more')p.focus=Math.min(4,p.focus+1);
          else if(k==='check'){if(p.focus===3)p.done=true;else good=false;}
          else if(k===['large','medium','small'][p.placed.length])p.placed.push(k);else good=false;
        }else if(key==='chart'){
          if(k==='rotate')p.turn=(p.turn+1)%4;
          else if((p.turn+charts[p.step].turn)%4===0){p.step++;p.turn=0;}else good=false;
        }else if(key==='stars'){
          if(k==='star'+(p.step+1))p.step++;else good=false;
        }else p.choices.push(k);
        if(mode==='story')saveGame();
        if(!good){LG.screenSay(R('Not quite yet. Try again; there is no hurry!')+' '+hint());return;}
        sfx('sparkle');
        if(done(key,p)){
          finishing=true;$('adventureOpts').innerHTML='';LG.screenSay(R('Wonderful teamwork!'));
          setTimeout(()=>{if(LG.active()!==g)return;LG.stop(true);celebrate(true);
            if(mode==='play'&&rescued(pony)){addHeart(pony,2);saveGame();}},1200);
        }else show(e.detail===0?k:null);
      });
      if(focus){const b=$('adventureOpts').querySelector(`[data-adventure="${focus}"]`);if(b)b.focus();}
      LG.screenSay(hint());
    }
    show();
  }
  HOOK.begin.push(isNew=>{
    const c=C();
    if(!isNew&&qid()==='freeEnd'&&!c.done){state.quest=qi(fly);state.qprog=0;updateObjective();talk(Q[state.quest].start);}
    if(!isNew&&[home,build].includes(qid())){LG.fillCottages(ids);LG.giftWood(ids);}
  });
  HOOK.update.push(()=>{
    const c=C(),q=qid();
    if(dlgOpen||player.action||flight||$('c2modal').classList.contains('show')||$('lgGame').classList.contains('show'))return;
    if(q===fly&&hereArea()===id)return completeQuest();
    const a=activities.find(a=>aq(a)===q);
    if(a&&done(a.key,progress(a.key,true)))return completeQuest();
    if(q===prefix+'Friend1'&&rescued(ids[0])||q===prefix+'Friend2'&&rescued(ids[1]))return completeQuest();
    if(q===home&&hereArea()==='valley')return completeQuest();
    if(q===build&&quests[8].prog()===2&&ids.every(p=>!ents[p].goHome)){
      if(c.done)return completeQuest();
      c.done=true;saveGame();talk([['grandma','Our new friends have a home, and their welcome will stay here for everyone!']],()=>{celebrate();completeQuest();});
    }
  });
  HOOK.tap.push((x,wy)=>{
    if(hereArea()!==id)return false;
    const pad=PADS[id];if(state.balloonAt===id&&Math.abs(x-pad.x)<1.1&&wy>pad.y-3.6&&wy<pad.y+.3)return false;
    for(const [i,spot] of spots.entries())if(dist(x,wy,spot.x,spot.y-.5)<1.3){
      goDo(spot.x,spot.y+1,2,()=>play(activities[i]));return true;
    }
    for(const [i,p] of ids.entries()){const e=ents[p];if(!rescued(p)&&dist(x,wy,e.x,e.y-.3)<1){
      goDo(e.x,e.y,1.9,()=>{if(qid()===prefix+'Friend'+(i+1))talk([[p,'Thank you for helping! Will you be my friend?']],()=>namePony(p));else say(T2.shy,p);},e);return true;
    }}
    return false;
  });
  HOOK.target.push(()=>{
    if(!qid().startsWith(prefix))return undefined;
    if(qid()===home)return hereArea()==='valley'?null:LG.padTarget();
    if(qid()===build)return LG.villageTarget();
    const g=LG.goArea(id);if(g!==null)return g;
    const i=activities.findIndex(a=>aq(a)===qid());if(i>=0)return{x:spots[i].x,y:spots[i].y-.5};
    const p=qid()===prefix+'Friend1'?ids[0]:qid()===prefix+'Friend2'?ids[1]:null;
    return p?{x:ents[p].x,y:ents[p].y-.7}:null;
  });
  HOOK.play[ids[0]]=()=>play(activities[0],'play',ids[0]);
  HOOK.play[ids[1]]=()=>play(activities[1],'play',ids[1]);
  HOOK.layer.push(layers=>{
    if(hereArea()!==id)return;
    activities.forEach((a,i)=>layers.push([spots[i].y,()=>drawEmoji(a.icon,SX(spots[i].x),SY(spots[i].y-.5),ts)]));
    const key=activities[3].key;
    (C()[key].choices||[]).forEach((choice,i)=>{const item=outputs[key].find(c=>c[0]===choice);
      if(item)layers.push([y+27,()=>drawEmoji(item[2],SX(15+i*1.1),SY(y+27),ts*.8)]);});
  });
  art.tree=(x,wy)=>drawEmoji(land.tree,SX(x+.5),SY(wy+1),ts*1.4);
  art.grassDeco=(x,wy,c,s,r)=>{if(r()<.05)drawEmoji(land.deco,(x+.5)*s,(wy+.5)*s,s*.4);};
  art.flightScene=(fy,s)=>{drawEmoji(land.icon,vw*.45,fy,s*1.2);drawEmoji(land.deco,vw*.7,fy,s);};
}
})();
