'use strict';
// The quilt holds finished patches separately from a replay in progress.
(()=>{
const stories={
  toffee:{icon:'🍬',title:'A welcome at the table',steps:[
    ['A new neighbor is nervous about joining the picnic. How shall we invite them?', [['💌','Make an invitation'],['🌼','Bring a flower']]],
    ['They are unsure where to sit. What would make the table feel welcoming?', [['🪑','Pull up a chair'],['🧺','Spread a blanket']]],
    ['Everyone has a favorite snack. How can we share?', [['🍓','Pass a berry plate'],['🧁','Share little cakes']]]
  ],ending:'The neighbor joins the picnic. There is room for everyone at our table!'},
  frost:{icon:'❄️',title:'A quiet kind of welcome',steps:[
    ['The picnic sounds are too loud for a small visitor. How can we help?', [['🤫','Make a quiet corner'],['🌳','Find a shady tree']]],
    ['The visitor wants company, but is not ready to talk. What can we do together?', [['📖','Look at a picture book'],['❄️','Watch snowflakes']]],
    ['They are ready to invite one friend over. How shall we call them?', [['🔔','Ring a gentle bell'],['👋','Give a little wave']]]
  ],ending:'The visitor smiles. Friends can be together quietly, too!'},
  bloom:{icon:'🌸',title:'A garden for everyone',steps:[
    ['The visitor wishes for a garden everyone can enjoy. Where shall we begin?', [['🪴','Set out a flower pot'],['🌱','Prepare a garden bed']]],
    ['A little seedling needs care. What shall we share?', [['💧','Give it water'],['☀️','Find it some sunshine']]],
    ['The flowers are ready for neighbors to enjoy. What shall we add?', [['🪑','Place a resting seat'],['🌈','Make a colorful sign']]]
  ],ending:'The garden welcomes visitors at their own pace. Everyone can enjoy its flowers!'},
  skye:{icon:'🪁',title:'A message on the wind',steps:[
    ['A faraway friend cannot come to the picnic today. How can we include them?', [['💌','Write a friendly note'],['🎨','Draw a picture']]],
    ['The wind can carry our message. What shall we send it on?', [['🪁','A rainbow kite'],['🎈','A floating balloon']]],
    ['A reply arrives! How shall we share the happy news?', [['📣','Tell our friends'],['📌','Put it on the board']]]
  ],ending:'Our faraway friend feels remembered. Friendship can travel a long way!'},
  luma:{icon:'🏮',title:'Lighting the way',steps:[
    ['A visitor wants to find the evening gathering. What landmark shall we show them?', [['🌳','The apple tree'],['💧','The little pond']]],
    ['The path is getting dim. How can we make it easier to follow?', [['🏮','Hang a lantern'],['⭐','Set out star lights']]],
    ['A friend is walking slowly. How can we travel together?', [['🐾','Walk beside them'],['🪑','Stop for a rest']]]
  ],ending:'Everyone reaches the gathering together. There is no hurry on a friendship walk!'},
  pippin:{icon:'🎠',title:'The welcome celebration',steps:[
    ['Our friends are ready to celebrate their welcome quilt. How shall we begin?', [['🎵','Sing a little song'],['👏','Clap a gentle rhythm']]],
    ['Some friends like dancing and some like watching. What shall we offer?', [['🎀','Ribbons to wave'],['🧺','A cozy place to watch']]],
    ['Each friend has helped in a different way. How shall we thank them?', [['💗','Give a heart'],['🌟','Make a thank-you star']]]
  ],ending:'The celebration has space for everyone. Together, our different kindnesses make a beautiful welcome!'}
};
const ids=Object.keys(stories), R=t=>reg('narrator',t);
const hubTitle=R('Welcome quilt stories');
const intro=R('Each rescued friend has a story about making someone feel welcome. Choose any story.');
const locked=R('Rescue this friend first. Other stories are ready whenever you are.');
const done=R('Your story patch is saved on the pavilion. You can read it or play it again.');
const finish=R('Add my patch'),again=R('Play this story again');
for(const s of Object.values(stories)){
  R(s.title);R(s.ending);
  for(const [text,options] of s.steps){R(text);for(const [,label] of options)R(label);}
}
document.head.insertAdjacentHTML('beforeend',`<style>
#storyChoices>div{display:flex;flex-direction:column;align-items:center;gap:4px}
#storyChoices button[data-choice],#storyChoices button[data-story-action]{min-width:120px;min-height:88px;flex-direction:column;font-size:30px}
#storyChoices .sayBtn{width:46px;height:46px;font-size:22px;margin:0}
</style>`);
function valid(value,complete){
  return Array.isArray(value)&&value.length<=3&&(!complete||value.length===3)&&
    value.every(n=>n===0||n===1);
}
function migrate(){
  if(!state.vil.friendStories||typeof state.vil.friendStories!=='object'||Array.isArray(state.vil.friendStories))
    state.vil.friendStories={};
  for(const id of ids){
    const e=state.vil.friendStories[id];
    if(!e)continue;
    if(typeof e!=='object'||Array.isArray(e)){console.warn('Invalid friendship story '+id+'; resetting this story.');delete state.vil.friendStories[id];continue;}
    for(const key of ['draft','keepsake'])if(e[key]!=null&&!valid(e[key],key==='keepsake')){
      console.warn('Invalid friendship story '+id+' '+key+'; resetting this part.');e[key]=null;
    }
  }
}
function entry(id){return state.vil.friendStories[id]||(state.vil.friendStories[id]={draft:null,keepsake:null});}
function hub(){
  closeC2();closePonyMenu();
  openC2(`<h2 data-say="${hubTitle}">📖 ${hubTitle}</h2><p data-say="${intro}">${intro}</p><div class="vilNames">${ids.map(id=>
    `<div data-say="${stories[id].title}"><button class="vilName" data-story="${id}">${stories[id].icon} <span></span>${entry(id).keepsake?' 🧵':''}${rescued(id)?'':' 🔒'}</button></div>`).join('')}</div>`);
  $('c2body').querySelectorAll('[data-story]').forEach(b=>{
    const id=b.dataset.story,name=ponyName(id);
    b.querySelector('span').textContent=name+': '+stories[id].title;
    b.parentNode.dataset.say=name+': '+stories[id].title;
    b.onclick=()=>{initAudio();if(rescued(id))open(id);else say(locked,'narrator');};
  });
  say(intro,'narrator',$('c2body').querySelector('p'));
}
function open(id){
  if(!stories[id]||!rescued(id))return;
  closeC2();vilPauseLife(2);
  const s=stories[id],e=entry(id);
  let finished=!e.draft&&!!e.keepsake;
  if(!finished&&!e.draft){e.draft=[];saveGame();}
  let choices=finished?e.keepsake:e.draft;
  const g=LG.screenGame({mode:'play',title:s.icon+' '+s.title,titleSay:s.title,w:440,h:180,
    draw:(c,w,h)=>{
      c.fillStyle='#fff4fa';c.fillRect(0,0,w,h);
      c.fillStyle='#e2ccf7';c.fillRect(45,28,w-90,124);
      for(let i=0;i<3;i++){
        c.fillStyle=['#ffe2ee','#e1f6ef','#fff0bc'][i];c.fillRect(55+i*110,38,100,104);
        drawEmoji(choices[i]===undefined?'🧵':s.steps[i][1][choices[i]][0],105+i*110,90,42);
      }
    },html:'<div id="storyChoices" class="lgOpts"></div>',onClose:()=>vilPauseLife(2)});
  function button(key,icon,label,action){
    return `<div data-say="${R(label)}"><button ${action?'data-story-action':'data-choice'}="${key}" aria-label="${label}">${icon}<span style="font-size:17px">${label}</span></button></div>`;
  }
  function render(){
    const n=choices.length;
    if(finished){
      const summary=s.ending+' '+s.steps.map((step,i)=>step[1][choices[i]][1]+'.').join(' ')+' '+done;
      $('storyChoices').innerHTML=button('again','🔄',again,true);
      LG.screenSay(R(summary));
    }else if(n===s.steps.length){
      $('storyChoices').innerHTML=button('finish','🧵',finish,true);
      LG.screenSay(R(s.ending+' '+finish));
    }else{
      $('storyChoices').innerHTML=s.steps[n][1].map(([icon,label],i)=>button(i,icon,label,false)).join('');
      LG.screenSay(s.steps[n][0]);
    }
    addSayButtons($('storyChoices'));
    $('storyChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g||finished||choices.length!==n||n>=s.steps.length)return;
      choices.push(Number(b.dataset.choice));saveGame();sfx('sparkle');render();
    });
    $('storyChoices').querySelectorAll('[data-story-action]').forEach(b=>b.onclick=()=>{
      if(LG.active()!==g)return;
      if(b.dataset.storyAction==='again'&&finished){finished=false;choices=e.draft=[];saveGame();render();}
      else if(b.dataset.storyAction==='finish'&&!finished&&choices.length===3){
        e.keepsake=choices.slice();e.draft=null;choices=e.keepsake;finished=true;saveGame();sfx('sparkle');render();
      }
    });
  }
  render();
}
window.openFriendshipStories=hub;
HOOK.begin.push(migrate);
})();
