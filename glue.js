'use strict';
// ---------- Glue between modules ----------
(()=>{
  // Pause village pony activities while Chapter 3 mini-games and the party are moving ponies around.
  let next=0;
  HOOK.update.push(()=>{
    if(typeof vilPauseLife!=='function'||state.time<next)return;
    const d=window.ch3Debug,busy=(d&&(d.race||d.tag||d.flies))||['c3race','c3tag','c3party'].includes(qid());
    if(busy){vilPauseLife(2);next=state.time+1;}
  });
})();
