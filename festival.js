'use strict';
(()=>{
const ids=['toffee','frost','bloom','skye','luma','pippin'];
const R=t=>reg('narrator',t);
const invitations=[
  {key:'picture',icon:'🎨',label:'Picture invitation',hint:'A friend who cannot read would like a picture invitation.'},
  {key:'quiet',icon:'🤫',label:'Quiet invitation',hint:'A friend who likes quiet would like a quiet invitation.'},
  {key:'far',icon:'💌',label:'Faraway invitation',hint:'A faraway friend would like an invitation sent by post.'}
];
const features=[
  {key:'seat',icon:'🪑',label:'Resting seats'},
  {key:'shade',icon:'🌳',label:'Shady corner'},
  {key:'path',icon:'🛤️',label:'Wide smooth path'},
  {key:'water',icon:'💧',label:'Water table'}
];
const colors=[
  {key:'rose',icon:'🌸',label:'Rose pink',color:'#ed568f'},
  {key:'sky',icon:'☁️',label:'Sky blue',color:'#58a8df'},
  {key:'sun',icon:'☀️',label:'Sunny yellow',color:'#f4c64d'}
];
const title=R('Village friendship festival');
const locked=R('The festival brings all six new friends together. Rescue them first, then come back to the pavilion.');
const finish=R('Open the festival');
const again=R('Plan another festival');
const done=R('The friendship festival is open! Your banner stays on the pavilion. Everyone is welcome, and there is room to rest.');
const inviteIntro=()=>ponyName('toffee')+' and '+ponyName('frost')+' are inviting everyone. Match each invitation to the friend who needs it. There is no hurry.';
const siteIntro=()=>ponyName('bloom')+' and '+ponyName('skye')+' are planning a comfortable festival site. Pick three different things to include.';
const bannerIntro=()=>ponyName('luma')+' and '+ponyName('pippin')+' are making a festival banner. Pick a color for each of the six flags. Every pattern is lovely.';
for(const o of [...invitations,...features,...colors])R(o.label);
for(const o of invitations)R(o.hint);
document.head.insertAdjacentHTML('beforeend',`<style>
#festivalChoices>div{display:flex;flex-direction:column;align-items:center;gap:4px}
#festivalChoices button{min-width:110px;min-height:88px;flex-direction:column;font-size:30px}
#festivalChoices .sayBtn{width:46px;height:46px;min-width:46px;min-height:46px;font-size:22px;margin:0}
</style>`);
function valid(d,complete){
  if(!d||typeof d!=='object'||Array.isArray(d)||!Array.isArray(d.invites)||!Array.isArray(d.features)||!Array.isArray(d.colors))return false;
  return d.invites.length<=3&&d.invites.every((k,i)=>k===invitations[i].key)&&
    d.features.length<=3&&new Set(d.features).size===d.features.length&&d.features.every(k=>features.some(o=>o.key===k))&&
    d.colors.length<=6&&d.colors.every(k=>colors.some(o=>o.key===k))&&
    (!d.features.length||d.invites.length===3)&&(!d.colors.length||d.features.length===3)&&
    (!complete||(d.invites.length===3&&d.features.length===3&&d.colors.length===6));
}
function migrate(){
  const f=state.vil.festival;
  if(!f||typeof f!=='object'||Array.isArray(f)){
    if(f!=null)console.warn('Invalid festival save; resetting only the festival.');
    state.vil.festival={draft:null,keepsake:null};return;
  }
  for(const key of ['draft','keepsake'])if(f[key]!=null&&!valid(f[key],key==='keepsake')){
    console.warn('Invalid festival '+key+'; resetting only this part.');f[key]=null;
  }
}
function blank(){return {invites:[],features:[],colors:[]};}
function open(){
  if(!ids.every(rescued)){say(locked,'narrator');return;}
  closeC2();closePonyMenu();vilPauseLife(2);
  const e=state.vil.festival;
  let finished=!e.draft&&!!e.keepsake;
  if(!finished&&!e.draft){e.draft=blank();saveGame();}
  let d=finished?e.keepsake:e.draft;
  const g=LG.screenGame({mode:'play',title:'🎏 '+title,titleSay:title,w:440,h:180,
    html:'<div id="festivalChoices" class="lgOpts"></div>',onClose:()=>vilPauseLife(2),
    draw:(c,w,h)=>{
      c.fillStyle='#f0fbff';c.fillRect(0,0,w,h);
      c.fillStyle='#8ccf8a';c.fillRect(0,125,w,55);
      for(let i=0;i<3;i++)drawEmoji(i<d.invites.length?invitations[i].icon:'✉️',65+i*58,42,30);
      for(let i=0;i<d.features.length;i++)drawEmoji(features.find(o=>o.key===d.features[i]).icon,70+i*80,110,38);
      c.strokeStyle='#8a628e';c.lineWidth=3;c.beginPath();c.moveTo(228,40);c.lineTo(422,40);c.stroke();
      for(let i=0;i<6;i++){
        c.fillStyle=d.colors[i]?colors.find(o=>o.key===d.colors[i]).color:'#eee';
        c.beginPath();c.moveTo(232+i*31,40);c.lineTo(258+i*31,40);c.lineTo(245+i*31,72);c.closePath();c.fill();
      }
      if(d.colors.length===6)ids.forEach((id,i)=>drawEmoji(PONIES[id].acc,240+i*31,122,26));
    }});
  function button(key,icon,label,action){
    return `<div data-say="${R(label)}"><button ${action?'data-festival-action':'data-festival-choice'}="${key}" aria-label="${label}">${icon}<span style="font-size:17px">${label}</span></button></div>`;
  }
  function render(message){
    const phase=d.invites.length<3?'invite':d.features.length<3?'site':d.colors.length<6?'banner':'ready';
    const stamp=phase+':'+d.invites.length+':'+d.features.length+':'+d.colors.length;
    let options=[],prompt;
    if(finished){
      options=[button('again','🔄',again,true)];
      prompt=done+' '+ids.map(ponyName).join(', ')+' '+R('are celebrating together!')+' '+R('Festival site:')+' '+d.features.map(k=>features.find(o=>o.key===k).label).join(', ')+'. '+
        R('Banner colors:')+' '+d.colors.map(k=>colors.find(o=>o.key===k).label).join(', ')+'.';
    }else if(phase==='invite'){
      options=invitations.map(o=>button(o.key,o.icon,o.label,false));
      prompt=(d.invites.length===0?inviteIntro()+' ':'')+invitations[d.invites.length].hint;
    }else if(phase==='site'){
      options=features.filter(o=>!d.features.includes(o.key)).map(o=>button(o.key,o.icon,o.label,false));
      prompt=siteIntro()+' '+R('Chosen:')+' '+(d.features.map(k=>features.find(o=>o.key===k).label).join(', ')||R('none yet'))+'. '+R('Choose')+' '+(3-d.features.length)+' '+R('more.');
    }else if(phase==='banner'){
      options=colors.map(o=>button(o.key,o.icon,o.label,false));
      prompt=bannerIntro()+' '+R('Flag')+' '+(d.colors.length+1)+' '+R('of six.');
    }else{
      options=[button('finish','🎉',finish,true)];
      prompt=R('The invitations, site and banner are ready. Open the festival together!');
    }
    $('festivalChoices').innerHTML=options.join('');
    addSayButtons($('festivalChoices'));
    LG.screenSay(R(message||prompt));
    $('festivalChoices').querySelectorAll('[data-festival-choice]').forEach(b=>b.onclick=()=>{
      const now=(d.invites.length<3?'invite':d.features.length<3?'site':d.colors.length<6?'banner':'ready')+':'+d.invites.length+':'+d.features.length+':'+d.colors.length;
      if(LG.active()!==g||finished||stamp!==now)return;
      const k=b.dataset.festivalChoice;
      if(phase==='invite'){
        if(k!==invitations[d.invites.length].key){render(R('Let us try together. ')+invitations[d.invites.length].hint);return;}
        d.invites.push(k);
      }else if(phase==='site'&&features.some(o=>o.key===k)&&!d.features.includes(k))d.features.push(k);
      else if(phase==='banner'&&colors.some(o=>o.key===k))d.colors.push(k);
      else return;
      saveGame();sfx('sparkle');render();
    });
    $('festivalChoices').querySelectorAll('[data-festival-action]').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g)return;
      if(b.dataset.festivalAction==='again'&&finished){finished=false;d=e.draft=blank();saveGame();render();}
      else if(b.dataset.festivalAction==='finish'&&!finished&&valid(d,true)){
        e.keepsake={invites:d.invites.slice(),features:d.features.slice(),colors:d.colors.slice()};
        e.draft=null;d=e.keepsake;finished=true;saveGame();sfx('fanfare');celebrate(true);render();
      }
    });
  }
  render();
}
window.openVillageFestival=open;
HOOK.begin.push(migrate);
})();
