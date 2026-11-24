const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright-core');

const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg'};
const missing=new Set();
let server,browser,base;

before(async()=>{
  server=http.createServer((req,res)=>{
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(missing.has(name)){res.writeHead(404);res.end();return;}
    const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
      res.writeHead(404);res.end();return;
    }
    res.setHeader('content-type',types[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://localhost:${server.address().port}/index.html`;
  const candidates=[
    process.env.CHROMIUM_PATH,
    process.platform==='win32'&&path.join(process.env['ProgramFiles(x86)']||'C:\\Program Files (x86)','Microsoft','Edge','Application','msedge.exe'),
    '/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'
  ];
  const executablePath=candidates.find(p=>p&&fs.existsSync(p));
  browser=await chromium.launch(executablePath?{executablePath}:{});
});

after(async()=>{
  if(browser)await browser.close();
  if(server)await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
});

async function open(suffix='',manifest=null){
  const context=await browser.newContext({viewport:{width:1180,height:820}});
  const page=await context.newPage(),errors=[],warnings=[],requests=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('console',msg=>{if(msg.type()==='warning')warnings.push(msg.text());});
  page.on('request',req=>requests.push(new URL(req.url()).pathname));
  await page.clock.install();
  if(manifest)await page.route('**/assets/manifest.json',route=>route.fulfill({
    contentType:'application/json',body:JSON.stringify(manifest)
  }));
  await page.goto(base+suffix);
  const status=await page.evaluate(()=>Assets.ready);
  return{context,page,status,errors,warnings,requests};
}

test('enabled assets preserve travel and saves in both art modes',async()=>{
  for(const mode of ['on','off']){
    const {context,page,status,errors}=await open(mode==='off'?'?assets=off':'');
    try{
      if(mode==='on'){
        assert.deepEqual(status.ready.sort(),['farmhouse','tree']);
        assert.deepEqual(status.disabled.sort(),['buttercup','crop_carrot']);
      }
      else assert.equal(status.manifest,'off');
      await page.locator('#playBtn').click();
      await page.evaluate(()=>{dq.length=0;closeDlg();state.settings.voice=false;state.settings.music=false;state.balloon=3;});
      for(const area of ['forest','lagoon','meadow','valley']){
        await page.evaluate(area=>{dq.length=0;closeDlg();startFlight(area);},area);
        await page.clock.runFor(7600);
        assert.deepEqual(await page.evaluate(()=>({area:hereArea(),flight:!!flight,balloon:state.balloonAt})),
          {area,flight:false,balloon:area});
      }
      await page.evaluate(()=>saveGame());
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sparkleValley_v1')));
      assert.equal(saved.balloonAt,'valley');
      await page.reload();
      await page.locator('#continueBtn').click();
      assert.deepEqual(await page.evaluate(()=>({x:player.x,y:player.y,balloon:state.balloonAt})),
        {x:saved.px,y:saved.py,balloon:'valley'});
      assert.deepEqual(errors,[]);
    }finally{await context.close();}
  }
});

test('missing manifest installs the worker and still works offline',async()=>{
  missing.add('/assets/manifest.json');
  const {context,page,status,errors,warnings}=await open();
  try{
    assert.equal(status.manifest,'failed');
    assert.equal(warnings.filter(w=>w.includes('could not load manifest')).length,1);
    await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:15000});
    await context.setOffline(true);
    await page.reload();
    assert.equal(await page.evaluate(()=>Assets.ready.then(s=>s.manifest)),'failed');
    assert.equal(await page.title(),'Sparkle Valley');
    assert.deepEqual(errors,[]);
  }finally{missing.clear();await context.close();}
});

test('all chapters and prototype assets load offline with an older save',async()=>{
  const {context,page,errors}=await open();
  try{
    await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:15000});
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('c12fly');delete s.questId;s.balloon=3;
      s.ch4={done:true};s.ch5={done:true};s.ch6={done:true};s.ch7={done:true};
      s.ch8={done:true};s.ch9={done:true};s.ch10={done:true};s.ch11={done:true,steps:3};
      s.coins=73;s.settings.voice=false;localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await context.setOffline(true);
    await page.reload();
    const status=await page.evaluate(()=>Assets.ready);
    assert.deepEqual(status.ready.sort(),['farmhouse','tree']);
    assert.deepEqual(status.disabled.sort(),['buttercup','crop_carrot']);
    await page.locator('#continueBtn').click();
    assert.deepEqual(await page.evaluate(()=>({quest:qid(),coins:state.coins,steps:state.ch11.steps,
      carnival:LG.dests().includes('carnival')})),{quest:'c12fly',coins:73,steps:3,carnival:true});
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('disabled placeholder art keeps procedural drawings without warnings',async()=>{
  const {context,page,status,errors,warnings,requests}=await open();
  try{
    assert.deepEqual(status.disabled.sort(),['buttercup','crop_carrot']);
    assert.deepEqual(status.pending,[]);
    assert.equal(await page.evaluate(()=>['buttercup','crop_carrot'].every(id=>
      !Assets.has(id)&&Assets.get(id)===null&&!drawAssetSprite(id,0,0))),true);
    assert.equal(requests.includes('/assets/characters/buttercup.png'),false);
    assert.equal(requests.includes('/assets/crops/carrot.png'),false);
    await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:15000});
    assert.equal(await page.evaluate(async()=>Boolean(
      await caches.match('assets/characters/buttercup.png')||await caches.match('assets/crops/carrot.png')
    )),false);
    assert.deepEqual(warnings.filter(w=>w.startsWith('[assets]')),[]);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('disabled entries can be enabled when their replacement art is ready',async()=>{
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets','manifest.json'),'utf8'));
  manifest.assets.buttercup.enabled=true;
  manifest.assets.crop_carrot.enabled=true;
  const {context,page,status,errors}=await open('',manifest);
  try{
    assert.deepEqual(status.ready.sort(),['buttercup','crop_carrot','farmhouse','tree']);
    assert.deepEqual(status.disabled,[]);
    assert.equal(await page.evaluate(()=>Assets.hasAnim('buttercup','walk')&&
      Assets.hasAnim('crop_carrot','stage3')&&drawAssetSprite('buttercup',0,0)),true);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('device speech speaks immediately after iPad gesture unlock',async()=>{
  const {context,page,status,errors}=await open();
  try{
    await page.evaluate(()=>{
      window.speechCalls=[];
      speechSynthesis.resume=()=>{};
      speechSynthesis.cancel=()=>{};
      speechSynthesis.speak=u=>window.speechCalls.push(u.text);
      speechUnlocked=false;
      initAudio();
      ttsSay('Read these words for Maddie','narrator',null);
    });
    const calls=await page.evaluate(()=>window.speechCalls);
    assert.equal(calls[calls.length-1],'Read these words for Maddie');
    assert.equal(calls.length>=2,true);
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});

test('a missing image falls back without affecting other assets',async()=>{
  missing.add('/assets/buildings/farmhouse.png');
  const {context,page,status,errors,warnings}=await open();
  try{
    assert.deepEqual(status.failed,['farmhouse']);
    assert.deepEqual(status.ready,['tree']);
    assert.equal(await page.evaluate(()=>Array.from({length:10},()=>Assets.has('farmhouse')).some(Boolean)),false);
    assert.equal(warnings.filter(w=>w.includes('"farmhouse"')).length,1);
    assert.deepEqual(errors,[]);
  }finally{missing.clear();await context.close();}
});
