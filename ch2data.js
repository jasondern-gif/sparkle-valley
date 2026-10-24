'use strict';
// ---------- Chapter 2 data: the Rainbow Balloon, Cloud Kingdom and Pony Village ----------
// Every spoken line that isn't written as a ['speaker','text'] pair is registered with reg(),
// so make_voices.py can record it.
const SAY2=[];const reg=(who,t)=>(SAY2.push([who,t]),t);
function extraLines(){return SAY2;}

Object.assign(SPK,{
  cloudberry:{n:'Princess Cloudberry',f:'👸',portrait:true,p:1.2,r:.95},
  twinkle:{n:'Twinkle',f:'🐴',portrait:true,p:1.5,r:.9},
  peaches:{n:'Peaches',f:'🐴',portrait:true,p:1.4,r:1.05},
  puff:{n:'Puff',f:'🐴',portrait:true,p:1.6,r:1.05}});
SPK.buttercup.portrait=SPK.stardust.portrait=true;

Object.assign(CROPS,{
  rcarrot:{e:'🥕',name:'rainbow carrot',st:['','🌱','🌿','🥕'],rainbow:true},
  cloudberry:{e:'🫐',name:'cloudberry',st:['','🌱','☘️','🫐'],glow:true}});
Object.assign(ICON,{rcarrot:'🥕',cloudberry:'🫐',wood:'🪵'});
Object.assign(PRICE,{rcarrot:4,cloudberry:4});
Object.assign(ITEM_NAMES,{rcarrot:'Rainbow carrots',cloudberry:'Cloudberries',wood:'Wood'});
const FOODS=['rcarrot','cloudberry','strawberry','carrot','sunflower'];

const PONIES={
  twinkle:{names:['Twinkle','Sparkle','Daisy','Bella'],fav:'rcarrot',acc:'🌸',home:{x:72.5,y:6.5},
    look:{body:'#fff0f7',mane:['#ff9ad5','#c9a6ff','#9fd3ff'],hoof:'#c9a6ff',snout:'#ffe1ef',wings:'#ffffff',scale:.82}},
  peaches:{names:['Peaches','Rosie','Sunny','Lulu'],fav:'strawberry',acc:'🎀',home:{x:74.5,y:15.5},
    look:{body:'#ffd2a6',mane:['#ff8a5c','#ffb84d','#ff8a5c'],hoof:'#c9774a',snout:'#ffe6cc',wings:'#fff1e0',scale:.95}},
  puff:{names:['Puff','Cotton','Marshmallow','Bubbles'],fav:'cloudberry',acc:'🌟',home:{x:75.5,y:26.6},
    look:{body:'#eef6ff',mane:['#bfe0ff','#ffffff','#d6c9ff'],hoof:'#9fb8e0',snout:'#ffffff',wings:'#ffffff',scale:.72}}};
const PONY_IDS=Object.keys(PONIES);
PONY_IDS.forEach(id=>PONIES[id].names.forEach(n=>reg('narrator',n)));

const COTTAGE_COLORS=[
  {id:'pink',name:'Pink cottage',wall:'#ffe0ef',roof:'#ff7eb6'},{id:'blue',name:'Blue cottage',wall:'#dff0ff',roof:'#5fa8f5'},
  {id:'purple',name:'Purple cottage',wall:'#eee2ff',roof:'#9b6cf0'},{id:'yellow',name:'Yellow cottage',wall:'#fff5cc',roof:'#ffb400'}];
COTTAGE_COLORS.forEach(c=>reg('narrator',c.name));

const PADS={valley:{x:17.5,y:10.4},clouds:{x:50.5,y:13.6}};
const BRIDGE={x:68.5,y:15.5},VILLAGE_GATE={x:20.5,y:31.5};
const LOG_SPOTS=[[7.5,33.5],[12.5,42.5],[26.5,34.5],[33.5,40.5],[37.5,32.5],[16.5,38.5],[29.5,43.5],[9.5,38.5]];

// Spoken lines
const T2={
  pet:['That tickles! Hee hee!','I love you!','You are my best friend!'],
  feedFav:'Yum! That is my favorite!',feed:'Yummy! Thank you!',
  feedNone:'Do you have a snack for me? Grow some food on the farm!',
  brush:['Brush, brush! My mane is so shiny!','Ooh, that feels nice!'],
  play:['Watch me do a trick!',"Wheee! Let's play!"],
  followOn:"Let's go on an adventure together!",followOff:'Okay! I will wait here. Come back soon!',
  best:'We are best friends now! Look at my special present!',
  thanks:'Thank you! I love my new home!',
  hideStart:"Let's play hide and seek! Close your eyes!",found:'You found me! Hee hee! Again, again!',
  greet:"You're back! I missed you! Want to play hide and seek?",
  hungry:{twinkle:'Do you have a rainbow carrot for me?',peaches:'Help! The bridge is broken, and I am stuck!',puff:'Do you have a cloudberry for me?'},
  shy:'Hee hee! Hello!'};
for(const id of PONY_IDS){
  for(const k of ['pet','brush','play'])T2[k].forEach(t=>reg(id,t));
  for(const k of ['feedFav','feed','feedNone','followOn','followOff','best','thanks','shy'])reg(id,T2[k]);
  reg(id,T2.hungry[id]);}
reg('puff',T2.hideStart);reg('puff',T2.found);reg('puff',T2.greet);
const N2={
  count:reg('narrator','One, two, three! Ready or not, here I come! Can you find the hiding pony?'),
  hint:reg('narrator','Look for a little tail peeking out!'),
  pretty:reg('narrator','What a pretty name!'),
  goHome:reg('narrator','Your new friend will fly to your Pony Village on a rainbow. You can visit there!'),
  basket:reg('narrator','This is the balloon basket. It still needs a balloon!'),
  needMagic:reg('narrator','The balloon needs some magic to fly!'),
  up:reg('narrator','Up, up, and away!'),down:reg('narrator','Home we go! Bye bye, Cloud Kingdom!'),
  bridge:reg('narrator','The bridge is broken. Bring 3 sunflowers to fix it!'),
  needWood:reg('narrator','You need 3 pieces of wood. Look for wood around the village!'),
  tapSpot:reg('narrator','Tap a sparkly spot to build your cottage!'),
  badSpot:reg('narrator','Oops! Try a sparkly spot!'),
  empty:reg('narrator','This cottage is ready for a new pony friend!'),
  whoLives:reg('narrator','Who will live in this cottage?'),
  nameIt:reg('narrator','What should we name this pony? Tap a name!'),
  build:reg('narrator','Build a cottage! Pick a color.'),
  typeName:reg('narrator','A grown-up can type a different name.'),
  villageSign:reg('narrator','Pony Village'),
  wood:reg('narrator','Wood'),
  woodReady:reg('narrator','You have 3 pieces of wood! Tap the hammer to build.'),
  princess:['Thank you for helping my ponies!','The Cloud Kingdom is so happy you came!'].map(t=>reg('cloudberry',t)),
};

// ---------- Chapter 2 quests (replace the old "free play" ending) ----------
const CH2Q=[
{id:'letter',icon:'🐦',text:'A bluebird has a letter for you! Tap the bluebird.',
 start:[['narrator','The rainbow is back, and everyone in Sparkle Valley is so happy!'],
   ['narrator','But look! A little bluebird is flying this way. It has a letter!'],()=>{state.ch2seen=true;}],
 hint:'Tap the little bluebird to read the letter!'},
{id:'basket',icon:'🧺',text:'Bring Mr. Hops 5 carrots to make a basket.',goal:5,handin:true,prog:()=>Math.min(5,state.inv.carrot),
 start:[['grandma','First we need a basket. Mr. Hops makes the best baskets!'],
   ['grandma','He will need 5 carrots. Grow some carrots, then take them to him!'],()=>{state.seed='carrot';}],
 hint:'Grow 5 carrots, then take them to Mr. Hops at the market.'},
{id:'sew',icon:'🎈',text:'Bring Grandma 3 sunflowers and 4 flowers for the balloon.',goal:7,handin:true,
 prog:()=>Math.min(3,state.inv.sunflower)+Math.min(4,state.inv.flower),
 start:[['grandma','Now we need a big, colorful balloon! I can sew one with 3 sunflowers and 4 flowers.'],
   ['narrator','Tap the sunflower seeds at the bottom. Then plant them and water them!'],()=>{state.seed='sunflower';}],
 hint:'Grow 3 sunflowers on the farm, and pick 4 flowers in the meadow. Then bring them to Grandma.'},
{id:'magic',icon:'🦄',text:'Ask Stardust to make the balloon fly.',
 start:[['grandma','The balloon is ready! But it needs some magic to fly up to the sky.'],
   ['grandma','I know who has rainbow magic... Stardust! Tap on her!']],
 hint:'Tap on Stardust the unicorn. She has rainbow magic!'},
{id:'fly',icon:'🎈',text:'Tap the Rainbow Balloon to fly to the pony kingdom!',
 start:[['stardust',"The balloon is ready to fly! Tap the balloon and let's go!"]],
 hint:'The Rainbow Balloon is next to the farm, by the big road. Tap it to fly!'},
{id:'findTwinkle',icon:'🌸',text:'Find Twinkle in the flower maze.',
 start:[['cloudberry','Hello! Welcome to the Cloud Kingdom! I am Princess Cloudberry.'],
   ['cloudberry','A big storm blew three of our ponies far away. Twinkle, Peaches, and Puff are lost!'],
   ['cloudberry','Will you help me find them? Here are some magic seeds: rainbow carrots and cloudberries!'],
   ()=>{state.seeds.rcarrot=state.seeds.cloudberry=true;state.seed='rcarrot';refreshBar(true);},
   ['cloudberry','Twinkle is very shy. I think she is hiding in the flower maze.']],
 hint:'Twinkle is hiding in the flower maze. Look for her in the flowers!'},
{id:'feedTwinkle',icon:'🥕',text:'Grow a rainbow carrot and give it to Twinkle.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.rcarrot),
 start:[['narrator','Plant rainbow carrot seeds in the cloud garden. A little rain cloud will water them!'],()=>{state.seed='rcarrot';}],
 hint:'Plant rainbow carrot seeds in the cloud garden, next to the castle. Then give a rainbow carrot to Twinkle.'},
{id:'fixBridge',icon:'🌻',text:'Bring 3 sunflowers to fix the broken bridge.',goal:3,handin:true,prog:()=>Math.min(3,state.inv.sunflower),
 start:[['cloudberry','Oh, look! Peaches is stuck on the little island. The bridge is broken!'],
   ['cloudberry','Sunflowers have bridge magic. Bring 3 sunflowers to the bridge to fix it!'],()=>{state.seed='sunflower';}],
 hint:'Grow 3 sunflowers in the cloud garden, then tap the broken bridge.'},
{id:'meetPeaches',icon:'🍑',text:'Cross the rainbow bridge and say hi to Peaches.',
 hint:'Walk over the rainbow bridge and tap on Peaches.'},
{id:'findPuff',icon:'🐾',text:'Follow the sparkly hoofprints to find Puff.',
 start:[['cloudberry','Only Puff is still lost. He is a baby pony, and he got lost in the fluffy clouds.'],
   ['cloudberry','Look for sparkly hoofprints. They will show you the way!']],
 hint:'Follow the sparkly hoofprints in the fluffy clouds to find Puff.'},
{id:'feedPuff',icon:'🫐',text:'Grow a cloudberry and give it to Puff.',goal:1,handin:true,prog:()=>Math.min(1,state.inv.cloudberry),
 start:[()=>{state.seed='cloudberry';}],
 hint:'Plant cloudberry seeds in the cloud garden. Then give a cloudberry to Puff.'},
{id:'flyHome',icon:'🎈',text:'Fly home to Sparkle Valley in the Rainbow Balloon.',
 start:[['cloudberry','You found all of our lost ponies! Thank you, thank you!'],
   ['cloudberry','They want to live with you, in your very own Pony Village!'],
   ['cloudberry','You can come back and visit me any time in the Rainbow Balloon.']],
 hint:'Tap the Rainbow Balloon to fly home.'},
{id:'build',icon:'🏠',text:'Build a cottage for each pony in Pony Village.',goal:3,prog:()=>state.cottages.length,
 start:[['grandma','Welcome home! Your ponies are waiting for you in Pony Village.'],
   ['grandma','Pony Village is down the road, past the market. Your ponies need cozy homes!'],
   ['narrator','Pick up 3 pieces of wood. Then tap the hammer to build a cottage!']],
 hint:'Pick up 3 pieces of wood in Pony Village. Then tap the hammer to build a cottage!'},
{id:'friends',icon:'💖',text:'Play with your ponies and fill up their friendship hearts.',goal:3,
 prog:()=>PONY_IDS.filter(id=>state.ponies[id]&&state.ponies[id].hearts>=10).length,
 start:[['grandma','What a beautiful Pony Village! Your ponies love their new homes.'],
   ['narrator','Tap on a pony to pet it, feed it, brush it, and play!']],
 hint:'Tap on a pony to pet it, feed it, brush it, and play!'},
{id:'free2',icon:'🏰',text:'Free play! Visit your ponies, fly the balloon, and buy fun things from Mr. Hops.',
 start:[['narrator','Hooray! You rescued the lost ponies and built them a whole village!'],
   ['narrator','Your ponies are your best friends now. More adventures are coming soon!']],
 hint:'Visit your ponies, fly the balloon to the Cloud Kingdom, or buy fun things from Mr. Hops!'},
];
Q.splice(qi('free'),1,...CH2Q);
CH2Q.forEach(q=>reg('cloudberry',q.hint));
const qAt=id=>state.quest>=qi(id);
// Items the current quest still needs, so the market won't sell them
function keepFor(k){const id=qid();
  const need={basket:{carrot:5},sew:{sunflower:3,flower:4},fixBridge:{sunflower:3},feedTwinkle:{rcarrot:1},feedPuff:{cloudberry:1}}[id]||{};
  return k==='wood'?1e9:(need[k]||0);}
