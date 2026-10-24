'use strict';
// ---------- Story & quests ----------
const countPlots=f=>Object.values(state.plots).filter(f).length;
const Q=[
{id:'meet',icon:'👵',text:'Say hi to Grandma! Tap on her.'},
{id:'plant',icon:'🥕',text:'Plant 3 carrot seeds. Tap the brown dirt!',goal:3,prog:()=>Object.keys(state.plots).length,
 hint:'Tap the brown dirt next to the house to plant a seed.'},
{id:'water',icon:'💧',text:'Water your seeds. Tap each seed!',goal:3,prog:()=>countPlots(p=>p.w),
 start:[['grandma','Good job! Seeds get thirsty. Tap each seed to give it water. 💧']],
 hint:'See the water drops? Tap the seeds to water them.'},
{id:'harvest',icon:'🥕',text:'Watch the carrots grow, then pick 3!',goal:3,prog:()=>state.inv.carrot,
 start:[['grandma','Now the sunshine and water will help them grow. Watch them get big!'],['grandma','When you see an orange carrot, tap it to pick it.']],
 hint:'Carrots need a little time to grow. If a seed has a water drop, tap it to water it!'},
{id:'pony',icon:'🐴',text:'Give Buttercup the pony a carrot.',
 start:[['grandma','Yummy carrots! You know who LOVES carrots? Buttercup the pony!'],['grandma','She lives in the pony field, by the red barn.']],
 hint:'Buttercup is in the pony field by the red barn. Tap on her!'},
{id:'eggs',icon:'🥚',text:'Find 3 eggs in the chicken coop.',goal:3,prog:()=>state.inv.egg,
 start:[['grandma','The chickens are laying eggs! Can you find 3 eggs in the chicken coop?']],
 hint:'The chicken coop is next to the farm. Look for white eggs!'},
{id:'market',icon:'🐰',text:'Take the eggs to Mr. Hops at the market.',
 start:[['grandma','Wonderful! Take the eggs to Mr. Hops. His market is down the road.']],
 hint:'Mr. Hops the bunny has a market at the bottom of the road.'},
{id:'berries',icon:'🍓',text:'Grow and pick 3 strawberries.',goal:3,prog:()=>state.inv.strawberry,
 start:[['narrator','Tap the strawberry seeds at the bottom. Then plant them in the dirt and water them!']],
 hint:'Pick the strawberry seeds at the bottom of the screen. Then plant and water them!'},
{id:'flowers',icon:'🌸',text:'Pick 5 flowers in the meadow.',goal:5,prog:()=>state.inv.flower,
 start:[['grandma','Mmm, sweet strawberries! Oh! I just remembered something.'],['grandma','Unicorns LOVE flower crowns. Can you pick 5 flowers in the meadow?'],['grandma','The meadow is at the end of the road, past the big pond.']],
 hint:'The flower meadow is at the end of the top road.'},
{id:'crown',icon:'👵',text:'Bring the flowers to Grandma.',
 start:[['narrator','What pretty flowers! Bring them to Grandma.']]},
{id:'unicorn',icon:'🦄',text:'Go through the magic gate and find the unicorn!',
 hint:'The magic gate is at the end of the bottom road. The unicorn is inside!'},
{id:'feedUni',icon:'🍓',text:'Give Stardust a strawberry.',
 hint:'Stardust is hungry. Bring her a strawberry! You can grow more on the farm.'},
{id:'stars',icon:'⭐',text:'Find the 7 rainbow stars!',goal:7,prog:()=>state.stars.length,
 start:[['stardust','The rainbow broke into 7 rainbow stars. They fell all over Sparkle Valley.'],['stardust',"If we find all 7, the rainbow will come back! I'll come with you!"],['narrator','Follow the yellow arrow to find the stars!']],
 hint:'Follow the yellow arrow to find the rainbow stars!'},
{id:'finale',icon:'🌈',text:'Put the stars on the Wishing Stone in the magic garden.',
 start:[['stardust',"You found them ALL! Let's put them on the Wishing Stone in my magic garden!"]],
 hint:'The Wishing Stone is in the magic garden, where you met Stardust.'},
{id:'free',icon:'🏰',text:'Free play! Sell food to Mr. Hops and buy fun things for your farm.',goal:6,prog:()=>Object.keys(state.decor).length,
 start:[['narrator','THE END! But the fun keeps going!'],['narrator','Grow food and sell it to Mr. Hops. Then buy fun things for your farm, like a real castle!']],
 hint:'Grow food and sell it to Mr. Hops. Then buy fun things, like a castle!'},
];
const qi=id=>Q.findIndex(q=>q.id===id);
const qid=()=>Q[state.quest].id;

// ---------- Dialogue (every line is read out loud) ----------
const dq=[];let dlgOpen=false,dlgReadyAt=0,curLine=null;
const fillName=t=>t.replace(/\{name\}/g,state.name);
function talk(lines,cb){for(const l of lines)dq.push(l);if(cb)dq.push(cb);if(!dlgOpen)nextDlg();}
function nextDlg(){
  while(dq.length){const it=dq.shift();
    if(typeof it==='function'){dlgOpen=true;it();continue;}
    showLine(it);return;}
  closeDlg();
}
function showLine([who,text]){
  const sp=SPK[who]||SPK.narrator;curLine=[who,fillName(text),text];dlgOpen=true;
  $('dlgFace').textContent=sp.f;$('dlgName').textContent=sp.n;$('dlgText').textContent=curLine[1];
  $('dialog').style.display='flex';$('bar').style.display='none';dlgReadyAt=performance.now()+400;
  say(text,who,$('dlgText'));
}
function closeDlg(){dlgOpen=false;curLine=null;$('dialog').style.display='none';refreshBar(true);}
function advanceDlg(){if(performance.now()<dlgReadyAt)return;sfx('tap');nextDlg();}

let toastTimer=null;
function showToast(text,speak){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove('show'),2000);if(speak!==false)say(text,'narrator',el);}

function sayObjective(){say(Q[state.quest].text,'narrator',$('objText'));}
function updateObjective(){
  const q=Q[state.quest];$('objIcon').textContent=q.icon;$('objText').textContent=q.text;
  $('objProg').textContent=q.goal?`${Math.min(state.qprog,q.goal)}/${q.goal}`:'';
}
function completeQuest(){
  sfx('fanfare');burst(player.x,player.y-1,'⭐',10);showToast(GREAT_JOB);
  state.quest=Math.min(state.quest+1,Q.length-1);state.qprog=0;updateObjective();saveGame();
  const q=Q[state.quest];
  setTimeout(()=>talk(q.start||[],()=>{updateObjective();sayObjective();}),1500);
}
function checkQuest(){
  const q=Q[state.quest];if(!q.goal)return;
  state.qprog=Math.max(state.qprog,q.prog());
  if(q.id==='free'){if(state.qprog>=q.goal&&!state.allDecorSaid&&!dlgOpen){state.allDecorSaid=true;celebrate();
    talk([['hops',"Wow, {name}! You bought EVERYTHING! You're a super farmer! 🏆"]]);}return;}
  if(state.qprog>=q.goal&&!dlgOpen)completeQuest();
}

// ---------- Interactions ----------
const CHEERS=["You're doing great, {name}!",'I love you, sweetie!','The farm looks so pretty!','What a good helper you are!'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const UNI_LINES=['I love you, {name}!','Sparkle, sparkle!',"Let's go on an adventure!",'You are my best friend!'];
const msgStar=st=>`You found the ${st.n} star! ⭐`;
const msgBought=d=>`Yay! You got the ${d.name}! ${d.id==='bow'?'Buttercup looks so pretty!':'Go see it next to your farm!'}`;
const msgOwned=d=>`You already have the ${d.name}!`;
const msgCost=d=>`The ${d.name} costs ${d.price} coins. Grow more food to sell!`;
const SHOP_HELLO='Hippity hop! Welcome to my market! Tap the basket to sell your food. Then pick something fun to buy!';
const SHOP_THANKS='Thank you! Here are your coins!';
const GREAT_JOB='⭐ Great job! ⭐';
const GROWING='It is still growing. Wait a little bit!';
const COINS_SAY='These are your coins! Sell food to Mr. Hops to get more.';
const ITEM_NAMES={carrot:'Carrots',strawberry:'Strawberries',sunflower:'Sunflowers',egg:'Eggs',flower:'Flowers'};
const SELL_SAY='Tap here to sell your food for coins!';
const BASKET_EMPTY='Your basket is empty. Grow some food to sell!';
const msgItem=d=>`${d.name}. It costs ${d.price} coins.`;
function hearts(e){burst(e.x,e.y-1,'💖',5);}

function interactGrandma(){
  const id=qid();hearts(ents.grandma);
  if(id==='meet'){talk([
    ['grandma',"Hello, my sweet {name}! I'm so happy you're here!"],
    ['grandma','A long time ago, a big beautiful rainbow shined over Sparkle Valley. And a magic unicorn lived here too!'],
    ['grandma','But one stormy night, the rainbow broke into pieces. The unicorn got sad and went away to hide.'],
    ['grandma','Maybe if we take good care of the farm and make lots of friends, the magic will come back!'],
    ['grandma',"Let's start by planting some carrots. Here are some carrot seeds!"],
    ['grandma','Tap the brown dirt to plant a seed. 🥕']],completeQuest);return;}
  if(id==='crown'&&state.inv.flower>=5){talk([
    ['grandma','Ooh, what pretty flowers! Let me make them into a flower crown...'],
    ['grandma','Twist, twist, twist... Ta-da! A flower crown! 👑'],
    ['grandma','Last night, I saw sparkly hoof prints by the magic gate. Here is the key! 🗝️'],
    ['grandma','The magic gate is at the end of the bottom road. Go find the unicorn!'],
    ['grandma','And bring a strawberry. Unicorns get hungry!']],
    ()=>{state.inv.flower-=5;state.gateOpen=true;sfx('sparkle');completeQuest();});return;}
  if(state.rainbow){talk([['grandma',"You did it, {name}! The rainbow is back! I'm so proud of you!"]]);return;}
  const h=Q[state.quest].hint;talk([['grandma',h||pick(CHEERS)]]);
}
function interactPony(){
  const id=qid();
  if(!state.ponyFriend){
    if(id==='pony'){
      if(state.inv.carrot>0){state.inv.carrot--;sfx('crunch');hearts(ents.pony);talk([
        ['buttercup','Neigh! Crunch, crunch... Yum!'],
        ['buttercup','Thank you, {name}! Will you be my best friend?'],
        ['buttercup',"I'll follow you everywhere!"],
        ['narrator','Buttercup is your friend now! Tap on her to ride her!']],()=>{state.ponyFriend=true;completeQuest();});}
      else{sfx('neigh');talk([["buttercup","Neigh? I'm hungry! Do you have a carrot?"]]);}
    }else{sfx('neigh');hearts(ents.pony);}
    return;}
  toggleRide();
}
function toggleRide(){
  if(!state.ponyFriend)return;
  if(state.riding){state.riding=false;ents.pony.x=player.x-.9;ents.pony.y=player.y;trail.length=0;sfx('tap');}
  else{state.riding=true;sfx('neigh');hearts(player);say('Giddy up!','buttercup');}
  refreshBar(true);
}
function interactHops(){
  const id=qid();hearts(ents.hops);
  if(id==='market'){
    if(state.inv.egg>=3){talk([
      ['hops','Hippity hop! Hello there! Are those fresh eggs?'],
      ['hops','I will buy them! Here are some shiny coins! 🪙'],
      ()=>{const n=state.inv.egg;state.coins+=n*PRICE.egg;state.inv.egg=0;sfx('coin');burst(player.x,player.y-1,'🪙',6);},
      ['hops','And here is something special: strawberry seeds and sunflower seeds!'],
      ['hops','Come back any time to sell your food. You can buy fun things for your farm!']],
      ()=>{state.seeds.strawberry=state.seeds.sunflower=true;state.seed='strawberry';completeQuest();});}
    else talk([['hops','Hippity hop! Do you have 3 eggs for me?']]);
    return;}
  if(state.quest<qi('market')){talk([['hops','Hippity hop! My market is not open yet. Come back later!']]);return;}
  openShop();
}
function interactUnicorn(){
  const id=qid();
  if(!state.gateOpen){talk([['narrator','The magic gate is locked. Maybe Grandma can help later!']]);return;}
  hearts(ents.unicorn);
  if(id==='unicorn'){talk([
    ['stardust','Oh! Hello there! Is that a flower crown? For ME?'],
    ['narrator','You put the flower crown on the unicorn. She looks so pretty!'],
    ['stardust','Thank you! My name is Stardust. I used to sparkle and shine.'],
    ['stardust',"But when the rainbow broke, I lost my sparkle. And now I'm sooo hungry."],
    ['stardust','Do you have a strawberry? Strawberries are my favorite!']],()=>{state.uniCrown=true;completeQuest();});return;}
  if(id==='feedUni'){
    if(state.inv.strawberry>0){state.inv.strawberry--;sfx('crunch');talk([
      ['stardust','Mmm! Sweet and yummy! I feel a little bit better already!']],()=>{state.uniFollow=true;sfx('sparkle');completeQuest();});}
    else talk([["stardust","I'm so hungry... Can you grow a strawberry for me? 🍓"]]);
    return;}
  sfx('sparkle');
  if(state.uniFollow)talk([['stardust',pick(UNI_LINES)]]);
}
function interactStone(){
  if(qid()==='finale'){talk([['narrator','You put the 7 rainbow stars on the Wishing Stone...']],()=>{
    state.rainbow=true;celebrate();
    talk([['stardust','Look! Look! The RAINBOW is back! And my sparkle too!'],
      ['stardust','{name}, you are the kindest and bravest friend in all of Sparkle Valley!'],
      ['stardust','Thank you for bringing the magic back. I love you!']],completeQuest);});return;}
  if(state.rainbow)talk([['narrator','The Wishing Stone glows with rainbow magic! ✨']]);
  else talk([['narrator','This is the Wishing Stone. It looks like something is missing...']]);
}
function interactSoil(tx,ty){
  const k=tx+','+ty,p=state.plots[k],cx=tx+.5,cy=ty+.5;
  if(!p){if(!state.seeds[state.seed])state.seed='carrot';state.plots[k]={c:state.seed,w:false,g:0};sfx('pop');burst(cx,cy,'🟤',3,.5);return;}
  if(!p.w){p.w=true;sfx('water');burst(cx,cy-.2,'💧',5,.6);return;}
  if(stageOf(p)>=3){delete state.plots[k];state.inv[p.c]++;sfx('harvest');floatText(cx,cy-.3,'+1 '+CROPS[p.c].e);return;}
  floatText(cx,cy-.3,'🌱 growing!');say(GROWING,'narrator');
}
function collectEgg(i){const e=state.eggs[i];state.eggs.splice(i,1);state.inv.egg++;sfx('harvest');floatText(e.x,e.y-.3,'+1 🥚');}
function collectFlower(i){const f=wildFlowers[i];state.flowerAt[i]=state.time+30;state.inv.flower++;sfx('harvest');floatText(f.x,f.y-.3,'+1 '+f.e);}
function collectStar(i){const st=STARS[i];state.stars.push(i);sfx('sparkle');burst(st.x,st.y-.4,'✨',10);
  showToast(msgStar(st));}

// ---------- Shop ----------
function sellable(){const keep={flower:state.quest<=qi('crown')?1e9:0,strawberry:state.quest<=qi('feedUni')?1:0};const out={};
  for(const k of Object.keys(ICON)){const n=Math.max(0,state.inv[k]-(keep[k]||0));if(n>0)out[k]=n;}return out;}
function openShop(){renderShop();$('shop').classList.add('show');
  say(SHOP_HELLO,'hops');}
function closeShop(){$('shop').classList.remove('show');stopSpeech();}
function renderShop(){
  const s=sellable();let total=0,what='';for(const k in s){total+=s[k]*PRICE[k];what+=`${ICON[k]}×${s[k]} `;}
  let html=`<div class="sell" data-say="${total?SELL_SAY:BASKET_EMPTY}" data-who="hops"><span class="what">${what||'🧺 Your basket is empty'}</span>
    <button class="big green" id="sellBtn" ${total?'':'disabled'}>🧺 Sell${total?` for 🪙 ${total}`:''}</button></div><div class="items">`;
  for(const d of DECOR){const own=state.decor[d.id],can=state.coins>=d.price;
    html+=`<div class="item ${own?'owned':can?'':'cant'}" data-id="${d.id}" data-say="${msgItem(d)}" data-who="hops"><span class="e">${d.e}</span>${d.name}<span class="buy">${own?'✅ Yours!':'🪙 '+d.price}</span></div>`;}
  $('shopBody').innerHTML=html+'</div>';addSayButtons($('shopBody'));
  $('sellBtn').onclick=()=>{const s2=sellable();let n=0;for(const k in s2){n+=s2[k]*PRICE[k];state.inv[k]-=s2[k];}
    if(n){state.coins+=n;sfx('coin');say(SHOP_THANKS,'hops');floatText(player.x,player.y-1,'+'+n+' 🪙');renderShop();saveGame();}};
  $('shopBody').querySelectorAll('.item').forEach(b=>b.onclick=()=>{
    const d=DECOR.find(x=>x.id===b.dataset.id);
    if(state.decor[d.id]){say(msgOwned(d),'hops');return;}
    if(state.coins<d.price){sfx('nope');say(msgCost(d),'hops');return;}
    state.coins-=d.price;state.decor[d.id]=true;sfx('fanfare');celebrate(true);
    say(msgBought(d),'hops');
    renderShop();saveGame();});
}

