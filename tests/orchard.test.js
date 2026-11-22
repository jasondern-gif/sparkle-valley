// Run with: node --test tests/orchard.test.js
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const test=require('node:test');

async function launchBrowser(){
  const isFile=p=>{try{return fs.statSync(p).isFile();}catch(e){if(e.code==='ENOENT'||e.code==='ENOTDIR')return false;throw e;}};
  if(process.env.CHROMIUM_PATH){
    if(!isFile(process.env.CHROMIUM_PATH))throw new Error('CHROMIUM_PATH does not point to a browser executable');
    return chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
  }
  try{return await chromium.launch({headless:true});}
  catch(e){if(!e.message.includes("Executable doesn't exist"))throw e;}
  const names=process.platform==='win32'?['msedge.exe','chrome.exe','chromium.exe']:
    ['chromium','chromium-browser','google-chrome','google-chrome-stable','microsoft-edge','microsoft-edge-stable'];
  const candidates=[];
  if(process.platform==='win32'){
    for(const dir of [process.env['PROGRAMFILES(X86)'],process.env.PROGRAMFILES,process.env.LOCALAPPDATA].filter(Boolean))
      candidates.push(path.join(dir,'Microsoft','Edge','Application','msedge.exe'),path.join(dir,'Google','Chrome','Application','chrome.exe'));
  }else if(process.platform==='darwin'){
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
  }
  for(const dir of (process.env.PATH||'').split(path.delimiter).filter(Boolean))for(const name of names)candidates.push(path.join(dir,name));
  const found=candidates.find(isFile);
  if(!found)throw new Error('No Chromium or Edge browser found. Install Playwright Chromium or set CHROMIUM_PATH.');
  return chromium.launch({executablePath:found,headless:true});
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
    server.once('error',reject);server.listen(0,'127.0.0.1',()=>{server.removeListener('error',reject);resolve(server);});
  });
}

test('Starlight Orchard migration, guided rescue, persistence and replay',async()=>{
  const server=await serve();
  let browser;
  try{
    browser=await launchBrowser();
    const page=await browser.newPage({viewport:{width:1200,height:800}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
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
    async function flightTo(area,x,y,px,py){
      await world(x,y,px,py);
      await page.locator(`#lgPick .lgCard[data-a="${area}"]`).click({force:true});
      await page.evaluate(()=>{flight.t=flight.dur-.05;});
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c11fly');s.questId='freeEnd';s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.ch7={done:true};s.ch8={done:true};s.ch9={done:true};
      s.ch10={done:true,bridge:true,lights:[0,1,2,3,4],beacon:{color:'blue',topper:'star'}};
      s.coins=73;s.settings.voice=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();
    assert.equal(await page.evaluate(()=>qid()),'c11fly');
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.deepEqual(await page.evaluate(()=>state.ch10.beacon),{color:'blue',topper:'star'});
    assert.equal(await page.evaluate(()=>LG.dests().includes('orchard')),true);
    await page.evaluate(()=>{window.utterances=[];speechSynthesis.speak=u=>window.utterances.push(u.text);state.settings.voice=true;});
    await page.locator('#objSay').click();await page.waitForFunction(()=>window.utterances.length>0);
    assert.match(await page.evaluate(()=>window.utterances[0]),/Starlight Orchard/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    await flightTo('orchard',17.5,9,18.8,10.7);await quest('c11guide');
    assert.equal(await page.evaluate(()=>hereArea()),'orchard');
    assert.equal(await page.evaluate(()=>[[21,284],[27,292],[28,295]].every(([x,y])=>bfsTiles(10,281,x,y).length>0)),true);
    await world(21.5,284,21.5,285.5);
    await page.locator('[data-path="flower"]').click();
    assert.equal(await page.evaluate(()=>state.ch11.steps),0);
    await page.locator('[data-path="apple"]').click();
    assert.equal(await page.evaluate(()=>state.ch11.steps),1);
    await page.locator('#lgGameClose').click();
    await world(21.5,284,21.5,285.5);
    assert.equal(await page.locator('[data-path="pond"]').count(),1);
    await page.evaluate(()=>saveGame());await reload();
    assert.equal(await page.evaluate(()=>state.ch11.steps),1);
    await world(21.5,284,21.5,285.5);
    await page.locator('[data-path="pond"]').click();await page.locator('[data-path="star"]').click();
    await quest('c11friend');
    assert.equal(await page.evaluate(()=>state.ch11.steps),3);
    const pony=await page.evaluate(()=>[ents.luma.x,ents.luma.y-.3,ents.luma.x,ents.luma.y+1]);
    await world(...pony);await dialog();await page.locator('#c2body .pick[data-name="Luma"]').click();await dialog();
    await quest('c11home');
    assert.equal(await page.evaluate(()=>rescued('luma')),true);
    await flightTo('valley',9.5,280,10.8,281.8);await quest('c11build');
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});await page.waitForTimeout(500);
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await world(...spot);await page.locator('#c2body .pick[data-id="luma"]').click();
    await page.waitForFunction(()=>dlgOpen||qid()==='freeEnd',null,{timeout:15000});await dialog();await quest('freeEnd');
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.luma.home].pony),'luma');
    assert.equal(await page.evaluate(()=>state.ch11.done),true);
    await page.evaluate(()=>saveGame());await reload();
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.equal(await page.evaluate(()=>state.ch11.steps),3);
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.deepEqual(await page.evaluate(()=>state.ch10.beacon),{color:'blue',topper:'star'});
    const home=await page.evaluate(()=>{const e=ents.luma;e.pause=state.time+20;return [e.x,e.y-.5,e.x,e.y+1];});
    await world(...home);await page.waitForTimeout(1000);
    const hearts=await page.evaluate(()=>state.ponies.luma.hearts);
    await page.locator('#ponyMenu [data-act="play"]').click();
    for(const key of ['apple','pond','star'])await page.locator(`[data-path="${key}"]`).click();
    await page.waitForFunction(()=>!LG.active());
    assert.ok(await page.evaluate(()=>state.ponies.luma.hearts)>hearts);
    assert.equal(await page.evaluate(()=>state.ch11.steps),3);
    await flightTo('orchard',17.5,9,18.8,10.7);
    await page.waitForFunction(()=>!flight&&hereArea()==='orchard');
    assert.equal(await page.evaluate(()=>state.ch11.steps),3);
    // Old numeric-only endings and unfinished Rainbow Island saves retain their progression.
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c11fly');s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.ch7={done:true};s.ch8={done:true};s.ch9={done:true};s.ch10={done:true};
      s.settings.voice=false;started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();assert.equal(await page.evaluate(()=>qid()),'c11fly');
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c10lights');s.questId='c10lights';s.balloon=3;
      s.ch10={bridge:true,lights:[0,1],beacon:null,done:false};s.settings.voice=false;
      started=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();
    assert.equal(await page.evaluate(()=>qid()),'c10lights');
    assert.deepEqual(await page.evaluate(()=>state.ch10.lights),[0,1]);
    assert.equal(await page.evaluate(()=>LG.dests().includes('orchard')),false);
    await page.evaluate(()=>{started=false;localStorage.removeItem(SAVE_KEY);});
    await page.reload();await page.locator('#playBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'meet');
    assert.equal(await page.evaluate(()=>LG.dests().includes('orchard')),false);
    assert.equal(await page.evaluate(()=>Q[qi('c10build')+1].id),'c11fly');
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});
