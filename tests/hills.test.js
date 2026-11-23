// Run with: node --test tests/hills.test.js
const assert=require('node:assert/strict');
const test=require('node:test');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

test('Sunflower Hills rescues, checkpoints, old saves and replay',async()=>{
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
    async function flightTo(area,x,y,px,py){
      await world(x,y,px,py);await page.locator(`#lgPick .lgCard[data-a="${area}"]`).click({force:true});
      await page.evaluate(()=>{flight.t=flight.dur-.05;});
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    async function choose(...keys){for(const key of keys)await page.locator(`#hillsOpts [data-hills="${key}"]`).click();}
    async function pony(id){
      const pos=await page.evaluate(id=>[ents[id].x,ents[id].y-.3,ents[id].x,ents[id].y+1],id);
      await world(...pos);await dialog();await page.locator(`#c2body .pick[data-name="${id==='sunny'?'Sunny':'Briar'}"]`).click();await dialog();
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c12fly');s.questId='freeEnd';s.balloon=3;
      for(let n=4;n<=12;n++)s['ch'+n]={done:true};
      s.ch12.rounds=3;s.coins=73;s.settings.voice=false;s.settings.music=false;
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'hillsFly');
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.equal(await page.evaluate(()=>LG.dests().includes('hills')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Sunflower Hills/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await flightTo('hills',17.5,9,18.8,10.7);await quest('hillsBridge');
    assert.equal(await page.evaluate(()=>[[20,348],[20,356],[27,355],[16,361],[28,348],[30,359]].every(([x,y])=>bfsTiles(10,345,x,y).length>0)),true);
    await world(20.5,348);await choose('rope');assert.deepEqual(await page.evaluate(()=>state.ch13.bridge),[]);
    await page.evaluate(()=>{window.utterances=[];state.settings.voice=true;});
    await page.locator('#lgSay .sayBtn').click();await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/stones/i);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await choose('stone');await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>state.ch13.bridge),['stone']);
    await world(20.5,348);await choose('plank','rope');await quest('hillsSunny');
    await pony('sunny');await quest('hillsFlowers');
    await world(20.5,356);await choose('sunflower','clover','water');await quest('hillsBells');
    await world(27.5,355);await choose('sun','flower');await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>state.ch13.bells),['sun','flower']);
    await world(27.5,355);await choose('moon');await quest('hillsBriar');
    await pony('briar');await quest('hillsGarden');
    await world(16.5,361);await choose('tulip','sunflower','blossom');await quest('hillsHome');
    await flightTo('valley',9.5,344,10.8,345.8);await quest('hillsBuild');
    for(const id of ['sunny','briar']){
      await dialog();
      await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});await page.waitForTimeout(500);
      await page.locator('#bar [data-build]').click({force:true});await page.locator('#c2body .pick').first().click();
      const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
      await world(...spot);
      await page.waitForFunction(()=>!placing,null,{timeout:10000});
      await page.locator(`#c2body .pick[data-id="${id}"]`).click();await dialog();
      await page.waitForFunction(id=>!ents[id].goHome,id,{timeout:15000});
    }
    await page.waitForFunction(()=>dlgOpen||qid()==='brookFly',null,{timeout:15000});await dialog();
    await quest('brookFly');await reload();
    assert.equal(await page.evaluate(()=>state.ch13.done),true);
    assert.deepEqual(await page.evaluate(()=>state.ch13.garden),['tulip','sunflower','blossom']);
    assert.deepEqual(await page.evaluate(()=>['sunny','briar'].map(id=>state.cottages[state.ponies[id].home].pony)),['sunny','briar']);
    assert.equal(await page.evaluate(()=>state.coins),73);
    for(const [id,keys] of [['sunny',['stone','plank','rope']],['briar',['sun','flower','moon']]]){
      const pos=await page.evaluate(id=>{const e=ents[id];e.pause=state.time+20;return[e.x,e.y-.5,e.x,e.y+1];},id);
      await world(...pos);await page.waitForTimeout(1000);
      const hearts=await page.evaluate(id=>state.ponies[id].hearts,id);
      await page.locator('#ponyMenu [data-act="play"]').click();await choose(...keys);
      await page.waitForFunction(()=>!LG.active());
      assert.ok(await page.evaluate(id=>state.ponies[id].hearts,id)>hearts);
    }
    await reload();assert.equal(await page.evaluate(()=>qid()),'brookFly');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('hillsFly');s.balloon=3;
      for(let n=4;n<=12;n++)s['ch'+n]={done:true};
      s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'hillsFly');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('hillsBuild');s.questId='hillsBuild';s.balloon=3;
      for(let n=4;n<=12;n++)s['ch'+n]={done:true};
      for(const id of ['sunny','briar'])s.ponies[id]={name:PONIES[id].names[0],hearts:2,home:-1,acc:null};
      s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>state.inv.wood),6);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c12balance');s.questId='c12balance';s.balloon=3;
      s.ch12={rounds:1};s.settings.voice=false;s.settings.music=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'c12balance');
    assert.equal(await page.evaluate(()=>state.ch12.rounds),1);
    assert.equal(await page.evaluate(()=>LG.dests().includes('hills')),false);
    assert.deepEqual(errors,[]);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});
