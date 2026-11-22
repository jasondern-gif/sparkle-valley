// Run with: node --test tests/candy.test.js
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const test=require('node:test');

function browserPath(){
  const isFile=p=>{try{return fs.statSync(p).isFile();}catch(e){if(e.code==='ENOENT'||e.code==='ENOTDIR')return false;throw e;}};
  if(process.env.CHROMIUM_PATH){
    if(!isFile(process.env.CHROMIUM_PATH))throw new Error('CHROMIUM_PATH does not point to a browser executable');
    return process.env.CHROMIUM_PATH;
  }
  const names=process.platform==='win32'?['msedge.exe','chrome.exe','chromium.exe']:
    ['chromium','chromium-browser','google-chrome','google-chrome-stable','microsoft-edge','microsoft-edge-stable'];
  const candidates=[];
  if(process.platform==='win32'){
    for(const dir of [process.env['PROGRAMFILES(X86)'],process.env.PROGRAMFILES,process.env.LOCALAPPDATA].filter(Boolean)){
      candidates.push(path.join(dir,'Microsoft','Edge','Application','msedge.exe'),path.join(dir,'Google','Chrome','Application','chrome.exe'));
    }
  }else if(process.platform==='darwin'){
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  }
  for(const dir of (process.env.PATH||'').split(path.delimiter).filter(Boolean))for(const name of names)candidates.push(path.join(dir,name));
  const found=candidates.find(isFile);
  if(!found)throw new Error('No Chromium or Edge browser found. Install Playwright Chromium or set CHROMIUM_PATH.');
  return found;
}

async function launchBrowser(){
  if(process.env.CHROMIUM_PATH)return chromium.launch({executablePath:browserPath(),headless:true});
  try{return await chromium.launch({headless:true});}
  catch(e){
    if(!e.message.includes("Executable doesn't exist"))throw e;
    return chromium.launch({executablePath:browserPath(),headless:true});
  }
}

function serve(){
  const root=path.resolve(__dirname,'..');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
    '.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.mp3':'audio/mpeg'};
  const server=http.createServer((req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch(e){res.writeHead(400);res.end('Bad URL');return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    fs.readFile(file,(err,data)=>{
      if(err){res.writeHead(err.code==='ENOENT'?404:500);res.end(err.code==='ENOENT'?'Not found':'Server error');return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
    });
  });
  return new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>{server.removeListener('error',reject);resolve(server);});
  });
}

test('Candy Castle and Snowy Mountain adventures',async()=>{
  const server=await serve();
  let browser;
  try{
  browser=await launchBrowser();
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
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
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
    await page.waitForFunction(()=>dlgOpen||qid()==='c8fly',null,{timeout:15000});await dialog();
    await quest('c8fly');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.toffee.home].pony),'toffee');
    assert.equal(await page.evaluate(()=>state.ch7.done),true);
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c8fly');
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
    // Continue naturally from Candy Castle into the new chapter.
    assert.equal(await page.evaluate(()=>LG.dests().includes('mountain')),true);
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="mountain"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c8flakes');
    assert.equal(await page.evaluate(()=>hereArea()),'mountain');
    assert.equal(await page.evaluate(()=>[[13,190],[19,197],[24,192],[30,198],[34,190],[16,194],[22,185],[28,190]]
      .every(([x,y])=>bfsTiles(10,185,x,y).length>0)),true);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='mountainFlakes');
    for(let i=0;i<2;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>$('objProg').textContent==='2/5');
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='mountainFlakes');
    assert.equal(await page.evaluate(()=>state.ch8.flakes.length),2);
    for(let i=0;i<3;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await quest('c8bells');
    await world(16.5,194,16.5,195.5);
    await page.locator('#lgOpts [data-k="heart"]').click();
    assert.equal(await page.evaluate(()=>LG.active().i),0);
    for(const choice of ['star','heart','star'])await page.locator(`#lgOpts [data-k="${choice}"]`).click();
    await quest('c8lantern');
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c8lantern');
    assert.equal(await page.evaluate(()=>state.ch8.bells),true);
    await world(22.5,184,22.5,186.5);
    await page.locator('#lgGameClose').click();
    assert.equal(await page.evaluate(()=>state.ch8.lantern),null);
    await world(22.5,184,22.5,186.5);
    await page.locator('#lgOpts [data-k="pink"]').click();await page.locator('#lgOpts .go').click({force:true});
    await page.locator('#lgOpts [data-k="heart"]').click();await page.locator('#lgOpts .go').click({force:true});
    await quest('c8friend');
    assert.deepEqual(await page.evaluate(()=>state.ch8.lantern),{color:'pink',topper:'heart'});
    const frost=await page.evaluate(()=>[ents.frost.x,ents.frost.y-.3,ents.frost.x,ents.frost.y+1]);
    await world(...frost);await dialog();
    await page.locator('#c2body .pick[data-name="Frost"]').click();await dialog();
    await quest('c8home');
    assert.equal(await page.evaluate(()=>rescued('frost')),true);
    assert.ok(await page.evaluate(()=>state.inv.wood>=3));
    await world(9.5,184,10.8,185.8);
    await page.locator('#lgPick .lgCard[data-a="valley"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c8build');
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});
    await page.waitForTimeout(500);
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const frostSpot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await world(...frostSpot);
    await page.locator('#c2body .pick[data-id="frost"]').click();
    await page.waitForFunction(()=>dlgOpen||qid()==='c9fly',null,{timeout:15000});await dialog();
    await quest('c9fly');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.frost.home].pony),'frost');
    assert.equal(await page.evaluate(()=>state.ch8.done),true);
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c9fly');
    assert.deepEqual(await page.evaluate(()=>state.ch8.lantern),{color:'pink',topper:'heart'});
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'blue',topper:'star'});
    assert.equal(await page.evaluate(()=>state.coins),37);
    const frostHome=await page.evaluate(()=>{const e=ents.frost;e.pause=state.time+20;return [e.x,e.y-.5,e.x,e.y+1];});
    await world(...frostHome);
    await page.waitForTimeout(1000);
    await page.locator('#ponyMenu [data-act="play"]').click();
    await page.waitForFunction(()=>LG.active()&&LG.active().mode==='play');
    const frostCount=await page.evaluate(()=>LG.active().items.length);
    assert.ok(frostCount>0);
    const frostHearts=await page.evaluate(()=>state.ponies.frost.hearts);
    for(let i=0;i<frostCount;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.frost.hearts)>frostHearts);
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="mountain"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await page.waitForFunction(()=>!flight&&hereArea()==='mountain');
    assert.deepEqual(await page.evaluate(()=>state.ch8.lantern),{color:'pink',topper:'heart'});
    assert.equal(await page.evaluate(()=>qid()),'c9fly');
    assert.deepEqual(errors,[]);
    // An existing completed Candy Castle save starts the new chapter, without losing its rewards.
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('freeEnd')-7;s.questId='freeEnd';s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};
      s.ch7={done:true,sweets:[0,1,2,3,4],castle:{roof:'blue',topper:'star'}};
      s.coins=59;s.settings.voice=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c8fly');
    assert.equal(await page.evaluate(()=>state.coins),59);
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'blue',topper:'star'});
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Snowy Mountain/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
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
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c7sweets');s.questId='c7sweets';s.balloon=3;
      s.ch7={sweets:[0,1],castle:null,done:false};s.settings.voice=false;
      started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c7sweets');
    assert.deepEqual(await page.evaluate(()=>state.ch7.sweets),[0,1]);
    assert.equal(await page.evaluate(()=>LG.dests().includes('mountain')),false);
    await page.evaluate(()=>{started=false;localStorage.removeItem(SAVE_KEY);});
    await page.reload();await page.locator('#playBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>state.quest),0);
    assert.equal(await page.evaluate(()=>LG.dests().includes('mountain')),false);
    assert.equal(await page.evaluate(()=>Q[qi('c7build')+1].id),'c8fly');
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});

test('Secret Garden migration, adventure, persistence and replay',async()=>{
  const server=await serve();
  let browser;
  try{
    browser=await launchBrowser();
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
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c9fly');s.questId='freeEnd';s.balloon=3;s.balloonAt='valley';
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};
      s.ch7={done:true,sweets:[0,1,2,3,4],castle:{roof:'blue',topper:'star'}};
      s.ch8={done:true,flakes:[0,1,2,3,4],bells:true,lantern:{color:'pink',topper:'heart'}};
      s.coins=59;s.settings.voice=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c9fly');
    assert.equal(await page.evaluate(()=>state.coins),59);
    assert.deepEqual(await page.evaluate(()=>state.ch8.lantern),{color:'pink',topper:'heart'});
    assert.equal(await page.evaluate(()=>LG.dests().includes('garden')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Secret Garden/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="garden"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c9path');
    assert.equal(await page.evaluate(()=>hereArea()),'garden');
    assert.equal(await page.evaluate(()=>bfsTiles(10,217,23,226).length),0);
    await world(22.5,220,22.5,220.5);
    await page.locator('#lgOpts [data-k="flower"]').click();
    assert.equal(await page.evaluate(()=>LG.active().i),0);
    for(const choice of ['leaf','flower','leaf'])await page.locator(`#lgOpts [data-k="${choice}"]`).click();
    await quest('c9seeds');
    assert.equal(await page.evaluate(()=>[[12,226],[17,232],[23,234],[30,234],[34,227],[22,229],[28,231]]
      .every(([x,y])=>bfsTiles(10,217,x,y).length>0)),true);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='gardenSeeds');
    await world(22.5,223.5,22.5,220.5);
    await page.waitForFunction(()=>player.y>223,null,{timeout:10000});
    for(let i=0;i<2;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>$('objProg').textContent==='2/5');
    // Saving on the opened path must not send the player back to the valley.
    await page.evaluate(()=>{player.x=22.5;player.y=222.5;saveGame();});
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>hereArea()),'garden');
    assert.equal(await page.evaluate(()=>map[222][22]),'.');
    assert.deepEqual(await page.evaluate(()=>state.ch9.seeds),[0,1]);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='gardenSeeds');
    for(let i=0;i<3;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await quest('c9garden');
    await world(22.5,229,22.5,230.5);
    await page.locator('#lgGameClose').click();
    assert.equal(await page.evaluate(()=>state.ch9.garden),null);
    await world(22.5,229,22.5,230.5);
    await page.locator('#lgOpts [data-k="yellow"]').click();await page.locator('#lgOpts .go').click({force:true});
    await page.locator('#lgOpts [data-k="butterfly"]').click();await page.locator('#lgOpts .go').click({force:true});
    await quest('c9friend');
    assert.deepEqual(await page.evaluate(()=>state.ch9.garden),{color:'yellow',center:'butterfly'});
    const bloom=await page.evaluate(()=>[ents.bloom.x,ents.bloom.y-.3,ents.bloom.x,ents.bloom.y+1]);
    await world(...bloom);await dialog();
    await page.locator('#c2body .pick[data-name="Bloom"]').click();await dialog();
    await quest('c9home');
    assert.equal(await page.evaluate(()=>rescued('bloom')),true);
    assert.ok(await page.evaluate(()=>state.inv.wood>=3));
    await world(9.5,216,10.8,217.8);
    await page.locator('#lgPick .lgCard[data-a="valley"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c9build');
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});
    await page.waitForTimeout(500);
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await world(...spot);
    await page.locator('#c2body .pick[data-id="bloom"]').click();
    await page.waitForFunction(()=>dlgOpen||qid()==='c10fly',null,{timeout:15000});await dialog();
    await quest('c10fly');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.bloom.home].pony),'bloom');
    assert.equal(await page.evaluate(()=>state.ch9.done),true);
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c10fly');
    assert.equal(await page.evaluate(()=>state.coins),59);
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'blue',topper:'star'});
    assert.deepEqual(await page.evaluate(()=>state.ch9.garden),{color:'yellow',center:'butterfly'});
    const home=await page.evaluate(()=>{const e=ents.bloom;e.pause=state.time+20;return [e.x,e.y-.5,e.x,e.y+1];});
    await world(...home);await page.waitForTimeout(1000);
    await page.locator('#ponyMenu [data-act="play"]').click();
    await page.waitForFunction(()=>LG.active()&&LG.active().mode==='play');
    const count=await page.evaluate(()=>LG.active().items.length);
    assert.ok(count>0);
    const hearts=await page.evaluate(()=>state.ponies.bloom.hearts);
    for(let i=0;i<count;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.bloom.hearts)>hearts);
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="garden"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await page.waitForFunction(()=>!flight&&hereArea()==='garden');
    assert.equal(await page.evaluate(()=>map[222][22]),'.');
    assert.deepEqual(await page.evaluate(()=>state.ch9.garden),{color:'yellow',center:'butterfly'});
    // A new game must not unlock the garden or skip earlier chapters.
    await page.evaluate(()=>{started=false;localStorage.removeItem(SAVE_KEY);});
    await page.reload();await page.locator('#playBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'meet');
    assert.equal(await page.evaluate(()=>LG.dests().includes('garden')),false);
    assert.equal(await page.evaluate(()=>Q[qi('c8build')+1].id),'c9fly');
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});

test('Rainbow Island migration, adventure, persistence and replay',async()=>{
  const server=await serve();
  let browser;
  try{
    browser=await launchBrowser();
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
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c10fly');s.questId='freeEnd';s.balloon=3;s.balloonAt='valley';
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.ch7={done:true};s.ch8={done:true};
      s.ch9={done:true,path:true,seeds:[0,1,2,3,4],garden:{color:'yellow',center:'butterfly'}};
      s.coins=59;s.settings.voice=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c10fly');
    assert.equal(await page.evaluate(()=>state.coins),59);
    assert.deepEqual(await page.evaluate(()=>state.ch9.garden),{color:'yellow',center:'butterfly'});
    assert.equal(await page.evaluate(()=>LG.dests().includes('island')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();
    await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Rainbow Island/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="island"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c10bridge');
    assert.equal(await page.evaluate(()=>hereArea()),'island');
    assert.equal(await page.evaluate(()=>bfsTiles(10,249,23,258).length),0);
    await world(22.5,252,22.5,252.5);
    await page.locator('#lgOpts [data-k="cloud"]').click();
    assert.equal(await page.evaluate(()=>LG.active().i),0);
    for(const choice of ['sun','cloud','sun'])await page.locator(`#lgOpts [data-k="${choice}"]`).click();
    await quest('c10lights');
    assert.equal(await page.evaluate(()=>[[12,258],[17,264],[23,266],[30,266],[34,259],[22,261],[28,263]]
      .every(([x,y])=>bfsTiles(10,249,x,y).length>0)),true);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='islandLights');
    await world(22.5,255.5,22.5,252.5);
    await page.waitForFunction(()=>player.y>255,null,{timeout:10000});
    for(let i=0;i<2;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>$('objProg').textContent==='2/5');
    await page.evaluate(()=>{player.x=22.5;player.y=254.5;saveGame();});
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>hereArea()),'island');
    assert.equal(await page.evaluate(()=>map[254][22]),'.');
    assert.deepEqual(await page.evaluate(()=>state.ch10.lights),[0,1]);
    await page.waitForFunction(()=>LG.active()&&LG.active().id==='islandLights');
    for(let i=0;i<3;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await quest('c10beacon');
    await world(22.5,261,22.5,262.5);
    await page.locator('#lgGameClose').click();
    assert.equal(await page.evaluate(()=>state.ch10.beacon),null);
    await world(22.5,261,22.5,262.5);
    await page.locator('#lgOpts [data-k="blue"]').click();await page.locator('#lgOpts .go').click({force:true});
    await page.locator('#lgOpts [data-k="star"]').click();await page.locator('#lgOpts .go').click({force:true});
    await quest('c10friend');
    assert.deepEqual(await page.evaluate(()=>state.ch10.beacon),{color:'blue',topper:'star'});
    const pony=await page.evaluate(()=>[ents.skye.x,ents.skye.y-.3,ents.skye.x,ents.skye.y+1]);
    await world(...pony);await dialog();
    await page.locator('#c2body .pick[data-name="Skye"]').click();await dialog();
    await quest('c10home');
    assert.equal(await page.evaluate(()=>rescued('skye')),true);
    assert.ok(await page.evaluate(()=>state.inv.wood>=3));
    await world(9.5,248,10.8,249.8);
    await page.locator('#lgPick .lgCard[data-a="valley"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await quest('c10build');
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});
    await page.waitForTimeout(500);
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await world(...spot);
    await page.locator('#c2body .pick[data-id="skye"]').click();
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();
    await quest('freeEnd');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.skye.home].pony),'skye');
    assert.equal(await page.evaluate(()=>state.ch10.done),true);
    await page.evaluate(()=>saveGame());await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.equal(await page.evaluate(()=>state.coins),59);
    assert.deepEqual(await page.evaluate(()=>state.ch9.garden),{color:'yellow',center:'butterfly'});
    assert.deepEqual(await page.evaluate(()=>state.ch10.beacon),{color:'blue',topper:'star'});
    const home=await page.evaluate(()=>{const e=ents.skye;e.pause=state.time+20;return [e.x,e.y-.5,e.x,e.y+1];});
    await world(...home);await page.waitForTimeout(1000);
    await page.locator('#ponyMenu [data-act="play"]').click();
    await page.waitForFunction(()=>LG.active()&&LG.active().mode==='play');
    const count=await page.evaluate(()=>LG.active().items.length);
    assert.ok(count>0);
    const hearts=await page.evaluate(()=>state.ponies.skye.hearts);
    for(let i=0;i<count;i++){
      const p=await page.evaluate(()=>{const it=LG.active().items.find(x=>x.st==='on');return [it.x,it.y-.5,it.x,it.y+1];});
      await world(...p);
    }
    await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.skye.hearts)>hearts);
    await world(17.5,9,18.8,10.7);
    await page.locator('#lgPick .lgCard[data-a="island"]').click({force:true});
    await page.evaluate(()=>{flight.t=flight.dur-.05;});
    await page.waitForFunction(()=>!flight&&hereArea()==='island');
    assert.equal(await page.evaluate(()=>map[254][22]),'.');
    assert.deepEqual(await page.evaluate(()=>state.ch10.beacon),{color:'blue',topper:'star'});
    await page.evaluate(()=>{started=false;localStorage.removeItem(SAVE_KEY);});
    await page.reload();await page.locator('#playBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'meet');
    assert.equal(await page.evaluate(()=>LG.dests().includes('island')),false);
    assert.equal(await page.evaluate(()=>Q[qi('c9build')+1].id),'c10fly');
    // Older numeric-only saves at the previous ending enter the new chapter too.
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c10fly');s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.ch7={done:true};s.ch8={done:true};s.ch9={done:true};
      s.coins=73;s.settings.voice=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c10fly');
    assert.equal(await page.evaluate(()=>state.coins),73);
    // An unfinished previous chapter must not be skipped on upgrade.
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c9seeds');s.questId='c9seeds';s.balloon=3;
      s.ch9={path:true,seeds:[0,1],garden:null,done:false};s.settings.voice=false;
      started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await page.reload();await page.locator('#continueBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'c9seeds');
    assert.deepEqual(await page.evaluate(()=>state.ch9.seeds),[0,1]);
    assert.equal(await page.evaluate(()=>LG.dests().includes('island')),false);
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});
