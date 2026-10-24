'use strict';
// ---------- My Magic Quest Book: a picture book of story quests, all read out loud ----------
(()=>{
  // Chapters are found by their first quest id; later chapters can set `chapter:'Title'` (and `chapterIcon`) on their first quest.
  const KNOWN=[{id:'meet',title:'Sparkle Valley',icon:'🌈'},{id:'letter',title:'The Rainbow Balloon',icon:'🎈'}];
  const QB_SAY={
    title:reg('narrator','My Magic Quest Book'),
    now:reg('narrator','This is your adventure right now!'),
    done:reg('narrator','You did it!'),
    next:reg('narrator','Coming next!'),
    secret:reg('narrator','It is a secret! Keep playing to find out!'),
  };
  KNOWN.forEach(c=>reg('narrator',c.title));
  function chapters(){
    const out=[];
    Q.forEach((q,i)=>{
      if(q.id==='freeEnd')return;
      const k=KNOWN.find(c=>c.id===q.id);
      if(k||q.chapter)out.push({title:q.chapter||k.title,icon:q.chapterIcon||(k&&k.icon)||'📖',start:i});
      else if(!out.length)out.push({title:'Sparkle Valley',icon:'🌈',start:i});
      else if(i>0&&Q[i-1].id==='friends')out.push({title:'The Rain Fountain',icon:'⛲',start:i});
    });
    out.forEach((c,j)=>c.end=(j+1<out.length?out[j+1].start:qi('freeEnd')));
    return out;
  }
  // chapter titles found at load time also need recordings
  setTimeout(()=>chapters().forEach(c=>reg('narrator',c.title)),0);
  document.head.insertAdjacentHTML('beforeend',`<style>
#qbBtn{pointer-events:auto;font-size:30px;width:60px;height:60px;}
.qbTabs{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;}
.qbTab{font-size:30px;width:64px;height:64px;border-radius:18px;background:#fff6fb;border:3px solid #ffd0e8;position:relative;}
.qbTab.on{background:#ffe08a;border-color:#ff9a3c;transform:scale(1.08);}
.qbTab.locked{opacity:.4;}
.qbTab .ck{position:absolute;right:-6px;bottom:-6px;font-size:18px;}
.qbChap{font-size:26px;font-weight:bold;text-align:center;color:#d94f9b;margin:4px 0 8px;}
.qbList{display:flex;flex-direction:column;gap:8px;}
.qbRow{display:flex;align-items:center;gap:12px;background:#fff6fb;border:3px solid #ffd0e8;border-radius:18px;padding:8px 12px;font-size:21px;font-weight:bold;}
.qbRow .ic{font-size:38px;width:50px;text-align:center;flex:none;}
.qbRow .tx{flex:1;}
.qbRow .st{font-size:15px;color:#a0709a;}
.qbRow.done{background:#eefbea;border-color:#b4e6a8;}
.qbRow.done .tx{opacity:.75;}
.qbRow.now{background:#fff3c4;border-color:#ffb800;transform:scale(1.02);box-shadow:0 0 14px #ffd34d;}
.qbRow.next .tx{opacity:.55;}
.qbRow.secret .ic{filter:blur(5px);}
</style>`);
  $('menuBtn').insertAdjacentHTML('beforebegin','<button id="qbBtn" class="panel" aria-label="Quest book">📖</button>');
  document.body.insertAdjacentHTML('beforeend',`<div id="qbModal" class="modal"><div class="panel box"><button class="close" id="qbClose">✖</button>
    <h2 data-say="${QB_SAY.title}">📖 My Magic Quest Book</h2><div class="qbTabs" id="qbTabs"></div><div id="qbBody"></div></div></div>`);
  let shown=-1;
  function open(){const cs=chapters();shown=Math.max(0,cs.findIndex(c=>state.quest>=c.start&&state.quest<c.end));
    if(state.quest>=qi('freeEnd'))shown=cs.length-1;render();$('qbModal').classList.add('show');sfx('pop');
    say(QB_SAY.title,'narrator',$('qbModal').querySelector('h2'));}
  function render(){
    const cs=chapters(),c=cs[shown];
    $('qbTabs').innerHTML=cs.map((ch,i)=>{const unlocked=state.quest>=ch.start,done=state.quest>=ch.end;
      return `<button class="qbTab ${i===shown?'on':''} ${unlocked?'':'locked'}" data-i="${i}" aria-label="${ch.title}">${unlocked?ch.icon:'🔒'}${done?'<span class="ck">✅</span>':''}</button>`;}).join('');
    let rows='';let nextShown=0;
    for(let i=c.start;i<c.end;i++){const q=Q[i];
      if(i<state.quest)rows+=`<div class="qbRow done" data-say="${q.text}"><span class="ic">${q.icon}</span><span class="tx">${q.text}<div class="st">✅ ${QB_SAY.done}</div></span></div>`;
      else if(i===state.quest)rows+=`<div class="qbRow now" data-say="${q.text}"><span class="ic">${q.icon}</span><span class="tx">${q.text}<div class="st">⭐ ${QB_SAY.now}</div></span></div>`;
      else if(nextShown<2){nextShown++;rows+=`<div class="qbRow next" data-say="${q.text}"><span class="ic">${q.icon}</span><span class="tx">${q.text}<div class="st">🔜 ${QB_SAY.next}</div></span></div>`;}
      else{rows+=`<div class="qbRow next secret" data-say="${QB_SAY.secret}"><span class="ic">${q.icon}</span><span class="tx">❓❓❓</span></div>`;break;}
    }
    if(state.quest<c.start)rows=`<div class="qbRow next secret" data-say="${QB_SAY.secret}"><span class="ic">🔒</span><span class="tx">❓❓❓</span></div>`;
    $('qbBody').innerHTML=`<div class="qbChap" data-say="${state.quest>=c.start?c.title:QB_SAY.secret}">${c.icon} ${state.quest>=c.start?c.title:'???'}</div><div class="qbList">${rows}</div>`;
    addSayButtons($('qbModal'));
    const now=$('qbBody').querySelector('.qbRow.now');if(now)setTimeout(()=>now.scrollIntoView({block:'center',behavior:'smooth'}),60);
    $('qbTabs').querySelectorAll('.qbTab').forEach(b=>b.onclick=()=>{shown=+b.dataset.i;sfx('tap');render();
      const ch=chapters()[shown];say(state.quest>=ch.start?ch.title:QB_SAY.secret,'narrator',$('qbBody').querySelector('.qbChap'));});
  }
  $('qbBtn').onclick=()=>{initAudio();open();};
  $('qbClose').onclick=()=>{stopSpeech();$('qbModal').classList.remove('show');};
})();
