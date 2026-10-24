'use strict';
// ---------- Core: map, data, state, audio, speech ----------
const W = 44, H = 30;
const SAVE_KEY = 'sparkleValley_v1';
const GROW = 5; // seconds per growth stage
const $ = id => document.getElementById(id);

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ---------- Map ----------
// . grass  = path  S soil  W water  T tree  F fence  G magic gate  H house  B barn  C coop hut
// M market  m meadow  g glade  K wishing stone
const map=[];
for(let y=0;y<H;y++) map.push(new Array(W).fill('.'));
function rect(x0,y0,x1,y1,c){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)map[y][x]=c;}
function fenceRect(x0,y0,x1,y1){for(let x=x0;x<=x1;x++){map[y0][x]='F';map[y1][x]='F';}for(let y=y0;y<=y1;y++){map[y][x0]='F';map[y][x1]='F';}}
rect(0,0,W-1,1,'T');rect(0,H-2,W-1,H-1,'T');rect(0,0,1,H-1,'T');rect(W-2,0,W-1,H-1,'T');
rect(29,2,40,7,'m');
rect(3,2,6,5,'H');
rect(9,3,16,6,'S');
rect(5,6,5,8,'=');rect(3,8,40,8,'=');rect(20,9,20,24,'=');rect(6,24,31,24,'=');rect(5,9,5,10,'=');rect(12,9,12,10,'=');
fenceRect(10,11,15,15);map[11][12]='=';map[12][14]='C';
fenceRect(2,11,8,18);map[11][5]='=';rect(3,12,4,13,'B');
rect(22,12,27,16,'W');map[12][22]=map[12][27]=map[16][22]=map[16][27]='.';
rect(16,21,18,22,'M');
rect(33,11,41,27,'g');for(let y=10;y<=27;y++)map[y][32]='F';for(let x=32;x<=41;x++)map[10][x]='F';map[24][32]='G';
map[14][37]='K';
const STONE={x:37.5,y:14.9};

const STARS=[
  {n:'red',c:'#ff4d4d',x:7.5,y:17.5},{n:'orange',c:'#ff9a3c',x:14.5,y:14.5},{n:'yellow',c:'#ffd83d',x:39.5,y:4.5},
  {n:'green',c:'#4fcf5a',x:25.5,y:18.5},{n:'blue',c:'#4da6ff',x:13.5,y:22.5},{n:'purple',c:'#9b5cff',x:2.5,y:4.5},
  {n:'pink',c:'#ff7ad9',x:40.5,y:26.5}];

// Wooden signs in the world. Tap one to hear it read out loud.
const SIGNS=[
  {x:8.5,y:9.6,text:'Welcome to Sparkle Valley!'},{x:3.5,y:7.0,text:"Grandma's House"},{x:8.5,y:3.6,text:'The Farm'},
  {x:6.6,y:10.6,text:'Pony Field'},{x:13.6,y:10.6,text:'Chicken Coop'},{x:21.5,y:11.6,text:'Duck Pond'},
  {x:28.5,y:7.6,text:'Flower Meadow'},{x:31.5,y:25.6,text:'Magic Garden'},{x:21.5,y:23.6,text:'Market'}];
function isWalkChar(c,gate){return c==='.'||c==='='||c==='S'||c==='m'||c==='g'||(c==='G'&&gate);}
// scatter trees while keeping every walkable tile reachable
(function placeTrees(){
  const noTree=[[2,2,8,10],[8,2,17,7],[17,2,28,7],[9,9,16,16],[1,9,9,19],[21,11,28,19],[13,20,20,23],[19,9,21,25],[24,17,27,20]];
  const forest=[[7,19,15,23],[28,9,31,23],[21,20,31,23],[3,25,31,27],[2,19,6,23]];
  const inZ=(zs,x,y)=>zs.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d);
  function reach(){const seen=new Uint8Array(W*H);const q=[5+7*W];seen[q[0]]=1;let n=0;
    while(q.length){const c=q.pop();n++;const x=c%W,y=(c/W)|0;
      for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const k=nx+ny*W;if(!seen[k]&&isWalkChar(map[ny][nx],true)){seen[k]=1;q.push(k);}}}
    return n;}
  const r=mulberry32(7);let base=reach();
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){
    if(map[y][x]!=='.'||inZ(noTree,x,y)||SIGNS.some(s=>Math.floor(s.x)===x&&Math.floor(s.y)===y))continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>map[y+dy][x+dx]==='='||map[y+dy][x+dx]==='G'))continue;
    const p=inZ(forest,x,y)?0.34:0.07;if(r()>p)continue;
    map[y][x]='T';const c=reach();if(c!==base-1)map[y][x]='.';else base=c;
  }
})();

const wildFlowers=[];
(function(){const r=mulberry32(99),used=new Set();const E=['🌸','🌼','🌷','🌺'];
  while(wildFlowers.length<14){const x=29+Math.floor(r()*12),y=2+Math.floor(r()*6),k=x+','+y;
    if(used.has(k)||(x===39&&y===4))continue;used.add(k);wildFlowers.push({x:x+.5,y:y+.5,e:E[wildFlowers.length%4]});}})();

const CROPS={
  carrot:{e:'🥕',name:'carrot',st:['','🌱','🌿','🥕']},
  strawberry:{e:'🍓',name:'strawberry',st:['','🌱','☘️','🍓']},
  sunflower:{e:'🌻',name:'sunflower',st:['','🌱','🌿','🌻']}};
const ICON={carrot:'🥕',strawberry:'🍓',sunflower:'🌻',egg:'🥚',flower:'🌸'};
const PRICE={carrot:2,strawberry:3,sunflower:5,egg:2,flower:1};
const DECOR=[
  {id:'tulips',e:'🌷',name:'Tulip garden',price:5},
  {id:'bow',e:'🎀',name:'Bow for Buttercup',price:8},
  {id:'kitty',e:'🐱',name:'Kitty friend',price:12},
  {id:'fountain',e:'⛲',name:'Fountain',price:20},
  {id:'carousel',e:'🎠',name:'Carousel',price:30},
  {id:'castle',e:'🏰',name:'Princess castle',price:50}];

const SPK={
  grandma:{n:'Grandma',f:'👵',p:1.0,r:.9},
  hops:{n:'Mr. Hops',f:'🐰',p:1.5,r:1.0},
  buttercup:{n:'Buttercup',f:'🐴',p:1.3,r:1.0},
  stardust:{n:'Stardust',f:'🦄',p:1.35,r:.95},
  narrator:{n:'',f:'✨',p:1.1,r:.95}};

function defaultState(){return{
  hero:'👧',dress:'#ff7eb6',name:'Friend',quest:0,qprog:0,time:0,
  inv:{carrot:0,strawberry:0,sunflower:0,egg:0,flower:0},coins:0,
  seeds:{carrot:true,strawberry:false,sunflower:false},seed:'carrot',
  plots:{},eggs:[],flowerAt:{},stars:[],decor:{},
  gateOpen:false,ponyFriend:false,riding:false,uniFollow:false,uniCrown:false,rainbow:false,allDecorSaid:false,
  px:5.5,py:7.3,settings:{voice:true,music:true}};}
let state=defaultState();

function saveGame(){try{state.px=player.x;state.py=player.y;localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){}}
function loadGame(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&typeof s.quest==='number'){const d=defaultState();
  return Object.assign(d,s,{inv:Object.assign(d.inv,s.inv),seeds:Object.assign(d.seeds,s.seeds),settings:Object.assign(d.settings,s.settings)});}}catch(e){}return null;}

// ---------- Audio ----------
let actx=null,master=null,nextNote=0,step=0;
function initAudio(){
  // iOS 17+: let sound play even when the iPad's silent switch is on
  try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
  if(actx){if(actx.state!=='running')actx.resume();return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  actx=new AC();master=actx.createGain();master.gain.value=.7;master.connect(actx.destination);
  // iOS unlock: play a silent buffer inside the gesture
  const b=actx.createBuffer(1,1,22050),s=actx.createBufferSource();s.buffer=b;s.connect(master);s.start(0);
  setInterval(scheduleMusic,100);
}
function note(f,t,dur,type,vol){const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);return o;}
const CHORDS=[[261.6,329.6,392],[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7]];
function scheduleMusic(){
  if(!actx||!state.settings.music||document.hidden||actx.state!=='running'){nextNote=0;return;}
  const now=actx.currentTime;if(nextNote<now)nextNote=now+.05;
  const vol=speaking()?.012:.03;
  while(nextNote<now+.3){const bar=Math.floor(step/8)%4,beat=step%8,ch=CHORDS[bar];
    if(beat===0)note(ch[0]/2,nextNote,1.8,'sine',vol*2);
    const pat=[0,1,2,1,2,1,0,2];if(beat!==7||bar%2===0)note(ch[pat[beat]]*2,nextNote,.5,'triangle',vol);
    nextNote+=.34;step++;}
}
function sfx(n){
  if(!actx)return;const t=actx.currentTime;
  switch(n){
    case 'pop':note(500,t,.12,'sine',.25);note(820,t+.05,.12,'sine',.2);break;
    case 'water':[760,600,470].forEach((f,i)=>note(f,t+i*.07,.14,'sine',.22));break;
    case 'harvest':note(660,t,.15,'triangle',.25);note(990,t+.08,.3,'triangle',.25);break;
    case 'coin':note(988,t,.08,'square',.1);note(1319,t+.08,.35,'square',.1);break;
    case 'sparkle':[1047,1319,1568,2093].forEach((f,i)=>note(f,t+i*.07,.35,'sine',.18));break;
    case 'fanfare':[523,659,784].forEach((f,i)=>note(f,t+i*.13,.35,'triangle',.22));note(1047,t+.4,.9,'triangle',.22);note(784,t+.4,.9,'sine',.12);break;
    case 'neigh':for(let i=0;i<6;i++)note(760-i*45+(i%2)*140,t+i*.055,.08,'sawtooth',.05);break;
    case 'cluck':note(420,t,.07,'square',.06);note(380,t+.1,.07,'square',.06);break;
    case 'quack':note(330,t,.12,'sawtooth',.07);note(290,t+.15,.12,'sawtooth',.07);break;
    case 'meow':note(700,t,.12,'sine',.15);note(950,t+.1,.15,'sine',.15);note(620,t+.24,.2,'sine',.12);break;
    case 'crunch':for(let i=0;i<4;i++)note(140+Math.random()*80,t+i*.09,.06,'square',.08);break;
    case 'tap':note(880,t,.06,'sine',.1);break;
    case 'nope':note(300,t,.12,'sine',.12);note(250,t+.12,.15,'sine',.12);break;
  }
}

// ---------- Speech (reads everything out loud) ----------
// Natural recorded voices live in audio/ (made by make_voices.py). If a line has no recording,
// we fall back to the device's built-in voice, preferring the higher-quality ones.
let voice=null,speakTimer=null,VOICE={};
const hasSpeech='speechSynthesis' in window;
const voiceEl=new Audio();voiceEl.preload='auto';
fetch('audio/manifest.json').then(r=>r.json()).then(j=>{VOICE=j;}).catch(()=>{});
function pickVoice(){if(!hasSpeech)return;const en=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));const id=v=>v.name+' '+v.voiceURI;
  voice=en.find(v=>/premium/i.test(id(v)))||en.find(v=>/enhanced/i.test(id(v)))||en.find(v=>/Natural|Neural/i.test(id(v)))
    ||en.find(v=>/Samantha/i.test(v.name))||en.find(v=>/Karen|Moira|Tessa|Serena|Fiona|Victoria|Zira|Aria|Jenny|Female/i.test(v.name))
    ||en.find(v=>/en-US/i.test(v.lang))||en[0]||null;}
if(hasSpeech){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function cleanSpeech(t){return t.replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D]/gu,'').replace(/\s+/g,' ').trim();}
// Recordings can't know the player's name, so they use a friendly word instead.
function voiceText(t){return cleanSpeech(t.replace(/^Once upon a time, \{name\}/,'Once upon a time, a little farmer').replace(/my sweet \{name\}/g,'my sweetheart')
  .replace(/\{name\}, /g,'').replace(/,\s*\{name\}/g,'').replace(/\{name\}/g,'friend'));}
function voiceKey(t,who){const s=(who||'narrator')+'|'+voiceText(t);let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function speaking(){return (!voiceEl.paused&&!voiceEl.ended)||(hasSpeech&&speechSynthesis.speaking);}
function say(text,who){
  if(!state.settings.voice)return;who=SPK[who]?who:'narrator';
  stopSpeech();
  const f=VOICE[voiceKey(text,who)];
  if(f){voiceEl.src='audio/'+f;const pr=voiceEl.play();if(pr)pr.catch(()=>ttsSay(text,who));return;}
  ttsSay(text,who);
}
function ttsSay(text,who){
  if(!hasSpeech)return;
  const words=cleanSpeech(text.replace(/\{name\}/g,state.name));if(!words)return;
  const sp=SPK[who]||SPK.narrator;
  const u=new SpeechSynthesisUtterance(words);if(voice){u.voice=voice;u.lang=voice.lang;}else u.lang='en-US';
  u.pitch=sp.p;u.rate=sp.r;
  clearTimeout(speakTimer);
  try{
    if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();speakTimer=setTimeout(()=>speechSynthesis.speak(u),90);}
    else speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeech(){try{voiceEl.pause();}catch(e){}if(hasSpeech){clearTimeout(speakTimer);try{speechSynthesis.cancel();}catch(e){}}}

