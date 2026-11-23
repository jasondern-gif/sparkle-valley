'use strict';
// Free village activities; drafts and finished keepsakes are separate so replay never erases a creation.
(()=>{
const IDS=['toffee','frost','bloom','skye','luma','pippin'];
document.head.insertAdjacentHTML('beforeend',`<style>
#vplayOpts>div,#vplayActions>div{display:flex;flex-direction:column;align-items:center;gap:4px;}
#vplayOpts button[data-vkey],#vplayActions button[data-vkey]{width:110px;height:110px;flex-direction:column;font-size:40px;}
#vplayOpts button[aria-pressed=true]{border-color:#d94f9b;background:#ffe3f2;}
#vplayOpts .sayBtn,#vplayActions .sayBtn{width:46px;height:46px;font-size:22px;margin:0;}
</style>`);
const titles={toffee:'Share a picnic',frost:'Echo the snow bells',bloom:'Grow a flower basket',
  skye:'Fly a rainbow kite',luma:'Plan a lantern walk',pippin:'Compose a pony parade'};
const icons={toffee:'🍬',frost:'🔔',bloom:'🌸',skye:'🪁',luma:'🏮',pippin:'🥁'};
const opts={
  toffee:[['berry','🍓','Strawberry'],['cake','🧁','Cupcake'],['apple','🍎','Apple']],
  frost:[['low','🔔','Low bell'],['middle','🔔','Middle bell'],['high','🔔','High bell']],
  bloom:[['daisy','🌼','Daisy'],['rose','🌹','Rose'],['tulip','🌷','Tulip']],
  luma:[['apple','🍎','Apple tree'],['pond','💧','Pond'],['star','⭐','Star lantern']],
  pippin:[['drum','🥁','Drum'],['bell','🔔','Bell'],['clap','👏','Clap']]
};
const R=t=>reg('narrator',t);
const L={hub:R('Friendship Pavilion! Choose a friend to play with.'),
  gift:R('Your new friend brought a free Friendship Pavilion! Find it in the decoration treasure box.'),
  done:R('Your keepsake is saved! You can play again whenever you like.'),
  again:R('Play again'),finish:R('Save my keepsake'),listen:R('Listen again'),
  water:R('Water the basket'),parade:R('Hear my parade'),
  locked:R('Rescue this friend first. Your other friends are ready to play!')};
for(const id of IDS){R(titles[id]);for(const o of opts[id]||[])R(o[2]);}
['Frost','Bloom','Skye'].forEach(R);
const phrases=[
  'Choose a treat, then share it with each friend. Every treat is welcome!',
  'Listen to the bells, then echo them. There is no hurry!',
  'Choose a flower for each pot, then water your basket.',
  'Move your kite to the star. The wind will wait for you!',
  'Light a path from the apple tree, to the pond, to the star lantern.',
  'Choose four sounds for our parade. Every song is welcome!'
].map(R);
const echo=['low','high','middle'],route=['apple','pond','star'];
const valid=id=>new Set((opts[id]||[]).map(o=>o[0]));
function good(id,d){
  if(!d||typeof d!=='object'||!Array.isArray(d.items))return false;
  if(id==='skye')return d.items.length<=3&&d.items.every(k=>k==='star')&&
    Number.isInteger(d.x)&&Math.abs(d.x)<=2&&Number.isInteger(d.y)&&Math.abs(d.y)<=2;
  const max=id==='pippin'?4:3,keys=valid(id);
  return d.items.length<=max&&d.items.every(k=>k===null||keys.has(k))&&
    (d.choice===null||keys.has(d.choice))&&Number.isInteger(d.pot)&&d.pot>=0&&d.pot<3&&
    typeof d.watered==='boolean'&&
    (id!=='frost'||d.items.every((k,i)=>k===echo[i]))&&
    (id!=='luma'||d.items.every((k,i)=>k===route[i]));
}
function blank(id){return id==='skye'?{items:[],x:0,y:0}:
  {items:id==='toffee'||id==='bloom'?[null,null,null]:[],choice:null,pot:0,watered:false};}
function entry(id){
  const all=state.vil.activities||(state.vil.activities={});
  if(!all[id]||typeof all[id]!=='object'||Array.isArray(all[id]))all[id]={draft:null,keepsake:null};
  return all[id];
}
function ready(id,d){return d.items.length===(id==='pippin'?4:3)&&d.items.every(Boolean)&&(id!=='bloom'||d.watered);}
function migrate(){
  if(!state.vil.activities||typeof state.vil.activities!=='object'||Array.isArray(state.vil.activities))state.vil.activities={};
  for(const id of IDS){const e=entry(id);
    for(const key of ['draft','keepsake'])if(e[key]!=null&&(!good(id,e[key])||(key==='keepsake'&&!ready(id,e[key])))){
      console.warn('Invalid village activity '+id+' '+key+'; resetting only this activity.');e[key]=null;
    }
  }
}
function gift(){
  if(!state.vil||state.vil.pavilionGift||!IDS.some(rescued))return;
  state.vil.pavilionGift=true;
  if(!state.vil.decor.some(d=>d.k==='pavilion'))state.vil.store.pavilion=(state.vil.store.pavilion||0)+1;
  saveGame();
}
function tone(k){initAudio();if(actx)note(({low:262,middle:330,high:392,drum:131,bell:523,clap:784})[k]||330,actx.currentTime,.3,'triangle',.12);}
function listen(items,g){
  items.forEach((k,i)=>setTimeout(()=>{if(LG.active()===g)tone(k);},i*450));
}
function hub(){
  closePonyMenu();
  openC2(`<h2 data-say="${L.hub}">💗 Friendship Pavilion</h2><p data-say="${L.gift}">${L.gift}</p><div class="vilNames">${IDS.map(id=>
    `<div data-say="${titles[id]}"><button class="vilName" data-friend="${id}" aria-label="${titles[id]}">${icons[id]} <span class="vpName"></span>${entry(id).keepsake?' 💗':''}${rescued(id)?'':' 🔒'}</button></div>`).join('')}</div><div class="row" data-say="Open the welcome quilt stories"><button class="big" id="friendStories">📖 Welcome quilt stories</button></div><div class="row" data-say="Open the village friendship festival"><button class="big" id="villageFestival">🎏 Village friendship festival${state.vil.festival&&state.vil.festival.keepsake?' ⭐':''}${IDS.every(rescued)?'':' 🔒'}</button></div>${IDS.every(rescued)?'':`<p data-say="The festival brings all six new friends together. Rescue them first, then come back to the pavilion.">The festival brings all six new friends together. Rescue them first, then come back to the pavilion.</p>`}`);
  $('c2body').querySelectorAll('[data-friend]').forEach(b=>{
    const name=ponyName(b.dataset.friend);
    b.querySelector('.vpName').textContent=name;
    b.setAttribute('aria-label',name+': '+titles[b.dataset.friend]);
    b.parentNode.dataset.say=R(name+': '+titles[b.dataset.friend]);
  });
  say(L.hub,'narrator',$('c2body').querySelector('h2'));
  $('friendStories').onclick=()=>window.openFriendshipStories();
  $('villageFestival').onclick=()=>window.openVillageFestival();
  $('c2body').querySelectorAll('[data-friend]').forEach(b=>b.onclick=()=>{initAudio();if(rescued(b.dataset.friend))open(b.dataset.friend);else say(L.locked,'narrator');});
}
function open(id){
  if(!IDS.includes(id)||!rescued(id))return;
  closeC2();closePonyMenu();vilPauseLife(2);
  const e=entry(id);
  let finished=!e.draft&&!!e.keepsake;
  if(!finished&&!e.draft){e.draft=blank(id);saveGame();}
  let d=finished?e.keepsake:e.draft;
  const g=LG.screenGame({mode:'play',title:`${icons[id]} ${titles[id]}`,titleSay:titles[id],w:440,h:210,
    onClose:()=>vilPauseLife(2),
    draw:(c,w,h)=>{
      c.fillStyle='#f2fbff';c.fillRect(0,0,w,h);
      if(id==='skye'){
        const target=[[1,-1],[-1,1],[2,0]][Math.min(d.items.length,2)];
        drawEmoji('⭐',w/2+target[0]*65,h/2+target[1]*45,40);
        drawEmoji('🪁',w/2+d.x*65,h/2+d.y*45,50);
      }else{
        const n=id==='pippin'?4:3;
        for(let i=0;i<n;i++){
          const o=(opts[id]||[]).find(o=>o[0]===d.items[i]);
          drawEmoji(o?o[1]:(id==='bloom'?'🪴':'💗'),(i+1)*w/(n+1),h*.55,55);
          if(id==='bloom'&&d.watered)drawEmoji('💧',(i+1)*w/(n+1),h*.25,25);
        }
      }
    },html:'<div id="vplayOpts" class="lgOpts"></div><div id="vplayActions" class="lgOpts"></div>'});
  function prompt(text){
    if(!text&&id==='skye'&&d.items.length<3){
      const t=[[1,-1],[-1,1],[2,0]][d.items.length],dx=t[0]-d.x,dy=t[1]-d.y;
      text=phrases[3]+' '+(dx?`Move ${Math.abs(dx)} ${dx<0?'left':'right'}. `:'')+
        (dy?`Move ${Math.abs(dy)} ${dy<0?'up':'down'}.`:'');
    }
    LG.screenSay(R(text||phrases[IDS.indexOf(id)]));
  }
  function button(k,icon,label,attr=''){return `<div data-say="${R(label)}"><button data-vkey="${k}" ${attr} aria-label="${label}">${icon}<span style="display:block;font-size:17px">${label}</span></button></div>`;}
  function render(){
    let html='';
    if(!finished&&!ready(id,d)){
      if(id==='skye')html=[['left','⬅️','Left'],['up','⬆️','Up'],['down','⬇️','Down'],['right','➡️','Right']].map(o=>button(...o)).join('');
      else html=opts[id].map(o=>button(...o,`aria-pressed="${d.choice===o[0]}"`)).join('');
      if(id==='toffee')html+=['Frost','Bloom','Skye'].map((n,i)=>button('serve'+i,'🐴',n,`aria-pressed="${!!d.items[i]}"`)).join('');
      if(id==='bloom')html+=[0,1,2].map(i=>button('pot'+i,'🪴','Pot '+(i+1),`aria-pressed="${d.pot===i}"`)).join('');
    }
    $('vplayOpts').innerHTML=html;
    $('vplayActions').innerHTML=finished?
      (id==='pippin'?button('listen','🔊',L.parade):id==='frost'?button('listen','🔊',L.listen):'')+button('again','🔄',L.again):
      (id==='frost'?button('listen','🔊',L.listen):id==='pippin'?button('listen','🔊',L.parade):id==='bloom'?button('water','💧',L.water):'')+
      (ready(id,d)?button('finish','💗',L.finish):'');
    for(const b of $('lgGame').querySelectorAll('[data-vkey]'))b.onclick=()=>tap(b.dataset.vkey);
    addSayButtons($('lgGame'));
  }
  function tap(k){
    if(LG.active()!==g)return;
    initAudio();
    if(k==='again'){finished=false;d=e.draft=blank(id);saveGame();render();prompt();return;}
    if(k==='listen'){listen(id==='frost'?echo:d.items,g);prompt(finished?L.done:undefined);return;}
    if(k==='finish'&&!finished&&ready(id,d)){
      e.keepsake=JSON.parse(JSON.stringify(d));e.draft=null;finished=true;
      addHeart(id,1);saveGame();sfx('sparkle');render();prompt(L.done);return;
    }
    if(finished||ready(id,d))return;
    if(id==='skye'){
      const delta={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]}[k];
      if(!delta)return;
      d.x=clamp(d.x+delta[0],-2,2);d.y=clamp(d.y+delta[1],-2,2);
      const t=[[1,-1],[-1,1],[2,0]][d.items.length];
      if(t&&d.x===t[0]&&d.y===t[1]){d.items.push('star');sfx('sparkle');}
    }else if(id==='toffee'){
      if(k.startsWith('serve')&&d.choice)d.items[Number(k.slice(5))]=d.choice;
      else if(valid(id).has(k))d.choice=k;
    }else if(id==='bloom'){
      if(k.startsWith('pot'))d.pot=Number(k.slice(3));
      else if(k==='water'&&d.items.length===3&&d.items.every(Boolean))d.watered=true;
      else if(valid(id).has(k)){d.items[d.pot]=k;d.watered=false;}
    }else if(id==='pippin'){
      if(d.items.length<4&&valid(id).has(k)){d.items.push(k);tone(k);}
    }else{
      const sequence=id==='frost'?echo:route;
      if(d.items.length<3&&k===sequence[d.items.length]){d.items.push(k);if(id==='frost')tone(k);sfx('sparkle');}
      else{prompt(id==='frost'?'Try the '+opts.frost.find(o=>o[0]===echo[d.items.length])[2]+'. We can listen again!':
        'Next is the '+(opts.luma.find(o=>o[0]===route[d.items.length])||['','','star lantern'])[2]+'. Your path is safe!');return;}
    }
    saveGame();render();prompt(ready(id,d)?L.finish:undefined);
  }
  render();prompt(finished?L.done:undefined);if(id==='frost')listen(echo,g);
}
window.villagePlay=id=>id?open(id):hub();
HOOK.begin.push(()=>{migrate();gift();});
HOOK.update.push(gift);
HOOK.ponyButtons.push({act:'activity',icon:'💗',show:id=>IDS.includes(id)&&rescued(id)&&hereArea()==='valley'&&inVillage(player.x,player.y),
  onTap:id=>open(id)});
HOOK.bar.push(()=>state.vil&&IDS.some(rescued)&&hereArea()==='valley'&&inVillage(player.x,player.y)&&!placing&&!vilDebug().mode?
  [{key:'vpavilion',html:'💗',label:'pavilion',onTap:hub}]:[]);
})();
