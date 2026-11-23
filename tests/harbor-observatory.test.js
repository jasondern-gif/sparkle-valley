const assert=require('node:assert/strict');
const test=require('node:test');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

test('harbor and observatory journeys preserve checkpoints, rescues and replays',async()=>{
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
    async function choose(...keys){for(const key of keys)await page.locator(`#adventureOpts [data-adventure="${key}"]`).click();}
    async function pony(id,name){
      const pos=await page.evaluate(id=>[ents[id].x,ents[id].y-.3,ents[id].x,ents[id].y+1],id);
      await world(...pos);await dialog();await page.locator(`#c2body .pick[data-name="${name}"]`).click();await dialog();
    }
    async function cottages(ids){
      for(const id of ids){
        await dialog();await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});await page.waitForTimeout(500);await dialog();
        await page.locator('#bar [data-build]').waitFor({state:'visible',timeout:15000});
        await page.locator('#bar [data-build]').click({force:true});await page.locator('#c2body .pick').first().click();
        const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
        await world(...spot);await page.waitForFunction(()=>!placing,null,{timeout:10000});
        await page.locator(`#c2body .pick[data-id="${id}"]`).click();await dialog();
        await page.waitForFunction(id=>!ents[id].goHome,id,{timeout:15000});
      }
    }
    await page.goto(`http://localhost:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=147;delete s.questId;s.balloon=3;
      for(let n=4;n<=15;n++)s['ch'+n]={done:true};
      s.coins=73;s.inv.carrot=8;s.settings.voice=false;s.settings.music=false;
      s.ponies.piper={name:'Piper',hearts:4,home:0,acc:'🎀'};
      s.cottages=[{x:6,y:37,color:'pink',pony:'piper',built:-100}];
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });

    await reload();assert.equal(await page.evaluate(()=>qid()),'harborFly');
    assert.equal(await page.evaluate(()=>Q.length-1),165);
    assert.equal(await page.evaluate(()=>areaAt(10,431)==='railway'&&areaAt(10,432)==='harbor'&&areaAt(10,464)==='observatory'),true);
    await fly('harbor',17.5,9,18.8,10.7);await quest('harborpatch');
    await page.setViewportSize({width:390,height:844});await world(18.5,440);
    assert.equal(await page.locator('#adventureOpts .adventureChoice').evaluateAll(cs=>cs.every(c=>{
      const a=c.querySelector('[data-adventure]').getBoundingClientRect(),s=c.querySelector('.sayBtn').getBoundingClientRect();
      return a.width>=44&&a.height>=44&&s.width>=44&&s.height>=44&&s.left>=a.right&&s.right<=innerWidth;
    })),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#adventureOpts .sayBtn').first().click();await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Triangle/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await choose('fit');assert.equal(await page.evaluate(()=>state.ch16.patch.step),0);
    await page.locator('[data-adventure="rotate"]').focus();await page.keyboard.press('Enter');
    await page.locator('#lgGameClose').click();await reload();
    assert.equal(await page.evaluate(()=>state.ch16.patch.turn),1);
    await page.setViewportSize({width:1200,height:800});await world(18.5,440);
    await choose('fit','corner','rotate','rotate','fit','triangle','rotate','rotate','rotate','fit');
    await quest('harborsail');await page.setViewportSize({width:390,height:844});await world(22.5,447);
    assert.equal(await page.locator('#adventureOpts .adventureChoice').evaluateAll(cs=>cs.length===5&&cs.every(c=>{
      const a=c.querySelector('[data-adventure]').getBoundingClientRect(),s=c.querySelector('.sayBtn').getBoundingClientRect();
      return a.width>=44&&a.height>=44&&s.width>=44&&s.height>=44&&a.left>=0&&s.right<=innerWidth;
    })),true);
    await choose('go');assert.equal(await page.evaluate(()=>state.ch16.sail.step),0);
    await choose('sailRight','go','sailLeft','steerRight');
    await page.locator('#lgGameClose').click();await reload();
    assert.deepEqual(await page.evaluate(()=>[state.ch16.sail.step,state.ch16.sail.sail,state.ch16.sail.rudder]),[1,'left','right']);
    await page.setViewportSize({width:1200,height:800});await world(22.5,447);await choose('go','sailRight','go');await quest('harborFriend1');
    await pony('sailor','Sailor');await quest('harbordock');await world(24.5,454);
    await choose('boat','go');assert.equal(await page.evaluate(()=>state.ch16.dock.done),false);
    await choose('pool');await page.locator('#lgGameClose').click();await reload();
    await world(24.5,454);await choose('go');await quest('harborFriend2');
    await pony('tide','Tide');await quest('harbordisplay');await world(17.5,457);
    await choose('shell');await page.locator('#lgGameClose').click();await reload();
    await world(17.5,457);await choose('flag','anchor');await quest('harborHome');
    await fly('valley',9.5,440,10.8,441.8);await quest('harborBuild');await cottages(['sailor','tide']);
    await page.waitForFunction(()=>dlgOpen||qid()==='observatoryFly',null,{timeout:15000});await dialog();await quest('observatoryFly');
    await fly('observatory',17.5,9,18.8,10.7);await quest('observatorylens');await world(18.5,472);
    await choose('small');assert.deepEqual(await page.evaluate(()=>state.ch17.lens.placed),[]);
    await choose('large','medium');await page.locator('#lgGameClose').click();await reload();
    await world(18.5,472);await choose('small','more','more','more','check');await quest('observatorychart');
    await world(22.5,479);await choose('check','rotate');
    await page.locator('#lgGameClose').click();await reload();
    assert.equal(await page.evaluate(()=>state.ch17.chart.turn),1);
    await world(22.5,479);await choose('rotate','rotate','check','rotate','check','rotate','rotate','check');
    await quest('observatoryFriend1');await pony('astra','Astra');await quest('observatorystars');await world(24.5,486);
    await choose('star2');assert.equal(await page.evaluate(()=>state.ch17.stars.step),0);
    await choose('star1','star2');await page.locator('#lgGameClose').click();await reload();
    await world(24.5,486);await choose('star3','star4');await quest('observatoryFriend2');
    await pony('orbit','Orbit');await quest('observatorymobile');await world(17.5,489);
    await choose('earth','ring');await page.locator('#lgGameClose').click();await reload();
    await world(17.5,489);await choose('moon');await quest('observatoryHome');
    await fly('valley',9.5,472,10.8,473.8);await quest('observatoryBuild');await cottages(['astra','orbit']);
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();await quest('freeEnd');await reload();
    const completed=await page.evaluate(()=>JSON.parse(JSON.stringify([state.ch16,state.ch17])));
    assert.deepEqual(completed[0].display.choices,['shell','flag','anchor']);
    assert.deepEqual(completed[1].mobile.choices,['earth','ring','moon']);
    assert.deepEqual(await page.evaluate(()=>['sailor','tide','astra','orbit'].map(id=>state.cottages[state.ponies[id].home].pony)),['sailor','tide','astra','orbit']);
    assert.deepEqual(await page.evaluate(()=>[state.coins,state.inv.carrot,state.ponies.piper.acc]),[73,8,'🎀']);
    const pos=await page.evaluate(()=>{vilPauseLife(20);const e=ents.sailor;e.x=21.5;e.y=34.5;e.pause=state.time+20;return[21.5,34,21.5,35.5];});
    await world(...pos);await page.waitForFunction(()=>menuPony==='sailor');await page.locator('#ponyMenu [data-act="play"]').click();
    await choose('rotate','fit');await page.locator('#lgGameClose').click();
    assert.deepEqual(await page.evaluate(()=>[state.ch16,state.ch17]),completed);
    const astra=await page.evaluate(()=>{vilPauseLife(20);for(const id of ['sailor','tide','astra','orbit','piper']){const e=ents[id];e.x=id==='astra'?21.5:33.5;e.y=34.5;e.pause=state.time+20;}return[21.5,34,21.5,35.5];});
    const hearts=await page.evaluate(()=>state.ponies.astra.hearts);
    await world(...astra);await page.waitForFunction(()=>menuPony==='astra');await page.locator('#ponyMenu [data-act="play"]').click();
    await choose('large','medium','small','more','more','more','check');await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.astra.hearts)>hearts);
    assert.deepEqual(await page.evaluate(()=>[state.ch16,state.ch17]),completed);
    await reload();assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.deepEqual(errors,[]);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});

test('questId saves migrate to the next unfinished land without losing older progress',async()=>{
  const server=await serve();let browser;
  try{
    browser=await browserLaunch();
    const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`http://localhost:${server.address().port}/`);
    async function load(save){
      await page.evaluate(s=>{started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));},save);
      await page.reload();await page.locator('#continueBtn').click();
      await page.waitForTimeout(1000);
    }
    const saved=await page.evaluate(()=>{
      const s=defaultState();s.quest=0;s.questId='freeEnd';s.balloon=3;
      for(let n=4;n<=16;n++)s['ch'+n]={done:true};
      s.ponies.piper={name:'Chime',hearts:8,home:0,acc:'🎀'};
      s.cottages=[{x:6,y:37,color:'pink',pony:'piper',built:-100}];
      s.settings.voice=false;s.settings.music=false;return s;
    });
    await load(saved);
    assert.equal(await page.evaluate(()=>qid()),'observatoryFly');
    assert.equal(await page.evaluate(()=>Assets.ready.then(s=>s.manifest)),'loaded');
    assert.deepEqual(await page.evaluate(()=>[state.ponies.piper.name,state.ponies.piper.acc,state.cottages[0].pony]),['Chime','🎀','piper']);
    saved.questId='railSignals';saved.quest=0;saved.ch15={signals:['soft']};
    await load(saved);
    assert.equal(await page.evaluate(()=>qid()),'railSignals');
    assert.deepEqual(await page.evaluate(()=>state.ch15.signals),['soft']);
    saved.questId='harborpatch';saved.ch15={done:true};saved.px=18.5;saved.py=441.5;
    await load(saved);
    for(let i=0;i<20;i++){
      if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(450);await page.locator('#dialog').click();}
      else {await page.waitForTimeout(200);if(!await page.locator('#dialog').isVisible())break;}
    }
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const point=await page.evaluate(()=>({x:18.5*ts-cam.x,y:440*ts-cam.y}));
    await page.mouse.click(point.x,point.y);
    await page.locator('[data-adventure="rotate"]').click();
    await page.locator('[data-adventure="fit"]').click();
    assert.equal(await page.evaluate(()=>state.ch16.patch.step),1);
    await page.locator('#lgGameClose').click();
    await page.reload();await page.locator('#continueBtn').click();
    assert.equal(await page.evaluate(()=>state.ch16.patch.step),1);
    saved.questId='freeEnd';saved.ch15={done:true};saved.ch17={done:true};
    await load(saved);assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.deepEqual(errors,[]);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});
