const assert=require('node:assert/strict');
const test=require('node:test');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

test('Butterfly Brook: both rescues, saved interactions, speech, cottages and replay',async()=>{
  const server=await serve();let browser;
  try{
    browser=await browserLaunch();
    const page=await browser.newPage({viewport:{width:1200,height:800}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    async function dialog(){
      for(let i=0;i<40;i++){
        if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(450);await page.locator('#dialog').click();}
        else{await page.waitForTimeout(200);if(!await page.locator('#dialog').isVisible())return;}
      }
      throw new Error('dialog did not finish');
    }
    async function quest(id){await page.waitForFunction(id=>qid()===id,id,{timeout:15000});await page.waitForTimeout(1700);await dialog();}
    async function world(x,y,px=x,py=y+1){
      // Skip travel time, but use the actual canvas tap and all interaction/quest handlers.
      await page.evaluate(([px,py])=>{player.x=px;player.y=py;player.path=[];player.action=null;},[px,py]);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const p=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),[x,y]);await page.mouse.click(p.x,p.y);
    }
    async function fly(area,x,y,px,py){
      await world(x,y,px,py);await page.locator(`#lgPick .lgCard[data-a="${area}"]`).click({force:true});
      await page.evaluate(()=>{flight.t=flight.dur-.05;});
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    async function choose(...keys){for(const key of keys)await page.locator(`#brookOpts [data-brook="${key}"]`).click();}
    async function pony(id){
      const pos=await page.evaluate(id=>[ents[id].x,ents[id].y-.3,ents[id].x,ents[id].y+1],id);
      await world(...pos);await dialog();await page.locator(`#c2body .pick[data-name="${id==='ripple'?'Ripple':'Mallow'}"]`).click();await dialog();
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('hillsFly');s.questId='freeEnd';s.balloon=3;
      for(let n=4;n<=13;n++)s['ch'+n]={done:true};
      s.coins=73;s.inv.carrot=8;s.settings.voice=false;s.settings.music=false;
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'brookFly');
    assert.equal(await page.evaluate(()=>LG.dests().includes('brook')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Butterfly Brook/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await fly('brook',17.5,9,18.8,10.7);await quest('brookObserve');
    assert.equal(await page.evaluate(()=>[[17,376],[21,381],[24,388],[17,393],[27,380],[30,390]].every(([x,y])=>bfsTiles(10,377,x,y).length>0)),true);
    assert.equal(await page.evaluate(()=>areaAt(10,367)==='hills'&&areaAt(10,368)==='brook'&&groundClass(10,380)===14),true);
    await world(17.5,376);await choose('stars','stars');
    assert.deepEqual(await page.evaluate(()=>state.ch14.observe),['stars']);
    await page.locator('#lgGameClose').click();await reload();
    await world(17.5,376);await choose('spots','stripes');await quest('brookRoute');
    await world(21.5,381);await choose('float');
    assert.equal(await page.evaluate(()=>!!state.ch14.route),false);
    await choose('boat');await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>state.ch14.gates),{boat:true,reeds:true});
    await page.setViewportSize({width:390,height:844});
    await world(21.5,381);
    assert.equal(await page.locator('#brookOpts [data-brook]').evaluateAll(bs=>bs.every(b=>{
      const r=b.getBoundingClientRect();return r.width>=80&&r.left>=0&&r.right<=innerWidth;
    })),true);
    assert.equal(await page.locator('[data-brook="boat"]').getAttribute('aria-pressed'),'true');
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#brookOpts .brookChoice').first().locator('.sayBtn').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Boat gate open/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await choose('float');assert.equal(await page.evaluate(()=>!!state.ch14.route),false);
    await choose('reeds','float');
    // A fully completed activity survives closing before its celebration callback.
    await page.locator('#lgGameClose').click();await page.setViewportSize({width:1200,height:800});await reload();await quest('brookRipple');
    assert.equal(await page.evaluate(()=>state.ch14.route),true);
    await pony('ripple');await quest('brookKite');
    await world(24.5,388);await choose('stars');
    assert.deepEqual(await page.evaluate(()=>state.ch14.kite),[]);
    await choose('spots','stripes');await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>state.ch14.kite),['spots','stripes']);
    assert.equal(await page.evaluate(()=>rescued('ripple')),true);
    await world(24.5,388);await choose('stars');await quest('brookMallow');
    await pony('mallow');await quest('brookMural');
    await world(17.5,393);await choose('stripes');await page.locator('#lgGameClose').click();await reload();
    await world(17.5,393);await choose('stars','spots');await quest('brookHome');
    await fly('valley',9.5,376,10.8,377.8);await quest('brookBuild');
    for(const id of ['ripple','mallow']){
      await dialog();
      await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});await page.waitForTimeout(500);
      await page.locator('#bar [data-build]').click({force:true});await page.locator('#c2body .pick').first().click();
      const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
      await world(...spot);await page.waitForFunction(()=>!placing,null,{timeout:10000});
      await page.locator(`#c2body .pick[data-id="${id}"]`).click();await dialog();
      await page.waitForFunction(id=>!ents[id].goHome,id,{timeout:15000});
    }
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();
    await quest('freeEnd');await reload();
    const completed=await page.evaluate(()=>JSON.parse(JSON.stringify(state.ch14)));
    assert.equal(completed.done,true);assert.deepEqual(completed.mural,['stripes','stars','spots']);
    assert.deepEqual(await page.evaluate(()=>['ripple','mallow'].map(id=>state.cottages[state.ponies[id].home].pony)),['ripple','mallow']);
    assert.deepEqual(await page.evaluate(()=>[state.coins,state.inv.carrot]),[73,8]);
    for(const [id,keys] of [['ripple',['boat','reeds','float']],['mallow',['spots','stripes','stars']]]){
      const pos=await page.evaluate(id=>{vilPauseLife(20);const e=ents[id];e.pause=state.time+20;return[e.x,e.y-.5,e.x,e.y+1];},id);
      await world(...pos);await page.waitForTimeout(1000);
      const hearts=await page.evaluate(id=>state.ponies[id].hearts,id);
      await page.locator('#ponyMenu [data-act="play"]').click();await choose(keys[0]);await page.locator('#lgGameClose').click();
      assert.equal(await page.evaluate(id=>state.ponies[id].hearts,id),hearts);
      // Restart an interrupted replay; story checkpoints must not become its starting state.
      await page.waitForFunction(id=>coolLeft(id,'play')===0,id);
      const nextPos=await page.evaluate(id=>{vilPauseLife(20);const e=ents[id];e.pause=state.time+20;return[e.x,e.y-.5,e.x,e.y+1];},id);
      await world(...nextPos);await page.waitForTimeout(500);await page.locator('#ponyMenu [data-act="play"]').click();await choose(...keys);
      await page.waitForFunction(()=>!LG.active());
      assert.ok(await page.evaluate(id=>state.ponies[id].hearts,id)>hearts);
      assert.deepEqual(await page.evaluate(()=>state.ch14),completed);
    }
    await reload();assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('hillsBells');s.questId='hillsBells';s.balloon=3;
      s.ch13={bells:['sun']};s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'hillsBells');
    assert.deepEqual(await page.evaluate(()=>state.ch13.bells),['sun']);
    assert.equal(await page.evaluate(()=>LG.dests().includes('brook')),false);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('brookBuild');s.questId='brookBuild';s.balloon=3;
      for(let n=4;n<=13;n++)s['ch'+n]={done:true};
      for(const id of ['ripple','mallow'])s.ponies[id]={name:PONIES[id].names[0],hearts:2,home:-1,acc:null};
      s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>state.inv.wood),6);
    assert.deepEqual(errors,[]);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});
