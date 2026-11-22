// Run with a local server on port 8765: node tests/candy.test.js
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  async function dialog(){
    for(let i=0;i<30;i++){
      if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(450);await page.locator('#dialog').click();}
      else {await page.waitForTimeout(200);if(!await page.locator('#dialog').isVisible())return;}
    }
    throw new Error('dialog did not finish');
  }
  async function quest(id){
    await page.waitForFunction(id=>qid()===id,id,{timeout:15000});
    await page.waitForTimeout(1700);await dialog();
  }
  async function world(x,y,px=x,py=y+1){
    await page.evaluate(([px,py])=>{player.x=px;player.y=py;player.path=[];player.action=null;},[px,py]);
    await page.waitForTimeout(350);
    const p=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),[x,y]);
    await page.mouse.click(p.x,p.y);
  }
  try{
    await page.goto('http://127.0.0.1:8765/');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('freeEnd');s.questId='freeEnd';s.balloon=3;s.balloonAt='valley';
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.coins=37;s.settings.voice=false;
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c7fly');
    assert.equal(await page.evaluate(()=>state.coins),37);
    assert.equal(await page.evaluate(()=>LG.dests().includes('candy')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Candy Castle/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="candy"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c7sweets');
    assert.equal(await page.evaluate(()=>hereArea()),'candy');
    assert.equal(await page.evaluate(()=>[[13,158],[17,164],[23,160],[29,165],[34,158],[22,154],[28,158]]
      .every(([x,y])=>bfsTiles(10,153,x,y).length>0)),true);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='candySweets');
    for(let i=0;i<2;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    assert.equal(await page.evaluate(()=>state.ch7.sweets.length),2);
    await page.waitForFunction(()=>$('objProg').textContent==='2/5');
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='candySweets');
    assert.equal(await page.evaluate(()=>state.ch7.sweets.length),2);
    for(let i=0;i<3;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await quest('c7castle');
    await world(22.5,152,22.5,154.5);
    await page.locator('#lgOpts [data-k="blue"]').click();await page.locator('#lgOpts .go').click({force:true});
    await page.locator('#lgOpts [data-k="star"]').click();await page.locator('#lgOpts .go').click({force:true});
    await quest('c7friend');
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'blue',topper:'star'});
    const pony=await page.evaluate(()=>[ents.toffee.x,ents.toffee.y-.3,ents.toffee.x,ents.toffee.y+1]);
    await world(...pony);await dialog();
    await page.locator('#c2body .pick[data-name="Toffee"]').click();await dialog();
    await quest('c7home');
    assert.equal(await page.evaluate(()=>rescued('toffee')),true);
    assert.ok(await page.evaluate(()=>state.inv.wood>=3));
    await world(9.5,152,10.8,153.8);
    await page.locator('#lgPick .lgCard[data-a="valley"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c7build');
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});
    await page.waitForTimeout(500);
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await world(...spot);
    await page.locator('#c2body .pick[data-id="toffee"]').click();
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();
    await quest('freeEnd');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.toffee.home].pony),'toffee');
    assert.equal(await page.evaluate(()=>state.ch7.done),true);
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'blue',topper:'star'});
    assert.equal(await page.evaluate(()=>state.coins),37);
    const home=await page.evaluate(()=>{const e=ents.toffee;e.pause=state.time+20;return [e.x,e.y-.5,e.x,e.y+1];});
    await world(...home);
    await page.waitForTimeout(1000);
    await page.locator('#ponyMenu [data-act="play"]').click();
    await page.waitForFunction(()=>LG.active()&&LG.active().mode==='play');
    const count=await page.evaluate(()=>LG.active().items.length);
    assert.ok(count>0);
    const hearts=await page.evaluate(()=>state.ponies.toffee.hearts);
    for(let i=0;i<count;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.toffee.hearts)>hearts);
    assert.deepEqual(errors,[]);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('n6bells');s.questId='n6bells';s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:false,duskAwake:false};s.coins=21;
      s.settings.voice=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'n6bells');
    assert.equal(await page.evaluate(()=>state.coins),21);
    await page.evaluate(()=>{state.quest=qi('n6build');completeQuest();});
    assert.equal(await page.evaluate(()=>qid()),'c7fly');
    console.log('Candy Castle: old save, spoken objective, flight, collection/resume, builder, pony, cottage, replay and completed save passed.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
