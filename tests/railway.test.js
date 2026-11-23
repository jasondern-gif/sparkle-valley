const assert=require('node:assert/strict');
const test=require('node:test');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

test('Rainbow Railway: safe journeys, two rescues, checkpoints and replay',async()=>{
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
      await page.evaluate(([px,py])=>{player.x=px;player.y=py;player.path=[];player.action=null;},[px,py]);
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const p=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),[x,y]);await page.mouse.click(p.x,p.y);
    }
    async function fly(area,x,y,px,py){
      await world(x,y,px,py);await page.locator(`#lgPick .lgCard[data-a="${area}"]`).click({force:true});
      await page.evaluate(()=>{flight.t=flight.dur-.05;});
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    async function choose(...keys){for(const key of keys)await page.locator(`#railOpts [data-rail="${key}"]`).click();}
    async function pony(id,name){
      const pos=await page.evaluate(id=>[ents[id].x,ents[id].y-.3,ents[id].x,ents[id].y+1],id);
      await world(...pos);await dialog();await page.locator(`#c2body .pick[data-name="${name}"]`).click();await dialog();
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('brookFly');s.questId='freeEnd';s.balloon=3;
      for(let n=4;n<=14;n++)s['ch'+n]={done:true};
      s.coins=73;s.inv.carrot=8;s.settings.voice=false;s.settings.music=false;
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'railFly');
    assert.equal(await page.evaluate(()=>LG.dests().includes('railway')),true);
    await fly('railway',17.5,9,18.8,10.7);await quest('railBridge');
    assert.equal(await page.evaluate(()=>areaAt(10,399)==='brook'&&areaAt(10,400)==='railway'&&groundClass(10,410)===15),true);
    assert.equal(await page.evaluate(()=>[[17,408],[21,413],[24,420],[20,425],[16,422],[28,412],[30,422]].every(([x,y])=>bfsTiles(10,409,x,y).length>0)),true);
    await world(17.5,408);await choose('check');
    assert.equal(await page.evaluate(()=>state.ch15.bridge),0);
    await choose('place');await page.locator('#lgGameClose').click();await reload();
    assert.equal(await page.evaluate(()=>state.ch15.bridgePlaced),true);
    await world(17.5,408);await choose('check','place','check','place','check');
    await page.locator('#lgGameClose').click();await reload();await quest('railOutbound');
    await page.setViewportSize({width:390,height:844});await world(21.5,413);
    assert.deepEqual(await page.locator('#railOpts .sayBtn').evaluateAll(bs=>({
      count:bs.length,accessible:bs.every(b=>{
        const r=b.getBoundingClientRect(),choice=b.closest('.railChoice').getBoundingClientRect();
        const action=b.parentElement.querySelector('[data-rail]').getBoundingClientRect();
        return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&choice.left>=0&&choice.right<=innerWidth&&r.left>=action.right;
      })
    })),{count:4,accessible:true});
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#railOpts .railChoice').first().locator('.sayBtn').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Flower station/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await choose('hill','travel');assert.deepEqual(await page.evaluate(()=>state.ch15.outbound),[]);
    await choose('flower','travel','hill');await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>[state.ch15.outbound,state.ch15.outboundSwitch]),[['flower'],'hill']);
    await page.setViewportSize({width:1200,height:800});await world(21.5,413);await choose('travel');await quest('railPiper');
    await pony('piper','Piper');await quest('railSignals');
    await world(24.5,420);await choose('wave');assert.deepEqual(await page.evaluate(()=>state.ch15.signals),[]);
    await choose('soft');await page.locator('#lgGameClose').click();await reload();
    await world(24.5,420);await choose('wave','rest');await quest('railReturn');
    await world(20.5,425);await choose('hill','travel','flower','travel');
    await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>state.ch15.returning),['hill','flower']);
    await world(20.5,425);await choose('home','travel');await quest('railTinsel');
    await pony('tinsel','Tinsel');await quest('railFlags');
    await world(16.5,422);await choose('hill');await page.locator('#lgGameClose').click();await reload();
    await world(16.5,422);await choose('home','flower');await quest('railHome');
    await fly('valley',9.5,408,10.8,409.8);await quest('railBuild');
    for(const id of ['piper','tinsel']){
      await dialog();await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});await page.waitForTimeout(500);
      await page.locator('#bar [data-build]').click({force:true});await page.locator('#c2body .pick').first().click();
      const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
      await world(...spot);await page.waitForFunction(()=>!placing,null,{timeout:10000});
      await page.locator(`#c2body .pick[data-id="${id}"]`).click();await dialog();
      await page.waitForFunction(id=>!ents[id].goHome,id,{timeout:15000});
    }
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();await quest('freeEnd');await reload();
    const completed=await page.evaluate(()=>JSON.parse(JSON.stringify(state.ch15)));
    assert.equal(completed.done,true);assert.deepEqual(completed.flags,['hill','home','flower']);
    assert.deepEqual(await page.evaluate(()=>['piper','tinsel'].map(id=>state.cottages[state.ponies[id].home].pony)),['piper','tinsel']);
    assert.deepEqual(await page.evaluate(()=>[state.coins,state.inv.carrot]),[73,8]);
    for(const [id,keys] of [['piper',['flower','travel','hill','travel']],['tinsel',['soft','wave','rest']]]){
      const pos=await page.evaluate(id=>{vilPauseLife(20);const e=ents[id];e.pause=state.time+20;return[e.x,e.y-.5,e.x,e.y+1];},id);
      await world(...pos);await page.waitForTimeout(1000);
      const hearts=await page.evaluate(id=>state.ponies[id].hearts,id);
      await page.locator('#ponyMenu [data-act="play"]').click();await choose(keys[0]);await page.locator('#lgGameClose').click();
      assert.equal(await page.evaluate(id=>state.ponies[id].hearts,id),hearts);
      await page.waitForFunction(id=>coolLeft(id,'play')===0,id);
      const next=await page.evaluate(id=>{vilPauseLife(20);const e=ents[id];e.pause=state.time+20;return[e.x,e.y-.5,e.x,e.y+1];},id);
      await world(...next);await page.waitForTimeout(500);await page.locator('#ponyMenu [data-act="play"]').click();await choose(...keys);
      await page.waitForFunction(()=>!LG.active());
      assert.ok(await page.evaluate(id=>state.ponies[id].hearts,id)>hearts);
      assert.deepEqual(await page.evaluate(()=>state.ch15),completed);
    }
    await reload();assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('brookKite');s.questId='brookKite';s.balloon=3;s.ch14={kite:['spots']};
      s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'brookKite');
    assert.deepEqual(await page.evaluate(()=>state.ch14.kite),['spots']);
    assert.equal(await page.evaluate(()=>LG.dests().includes('railway')),false);
    assert.deepEqual(errors,[]);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});
