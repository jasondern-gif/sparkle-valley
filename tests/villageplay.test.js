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
  const server=http.createServer((req,res)=>{
    let pathname;
    try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch(e){res.writeHead(400);res.end('Bad URL');return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    fs.readFile(file,(err,data)=>{
      if(err){res.writeHead(err.code==='ENOENT'?404:500);res.end('Not found');return;}
      const type={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.mp3':'audio/mpeg'}[path.extname(file)];
      res.writeHead(200,{'Content-Type':type||'application/octet-stream'});res.end(data);
    });
  });
  return new Promise((resolve,reject)=>{
    server.once('error',reject);server.listen(0,'127.0.0.1',()=>{server.removeListener('error',reject);resolve(server);});
  });
}
const IDS=['toffee','frost','bloom','skye','luma','pippin'];
test('six village activities: old saves, interruption, keepsakes, accessible play and replay',async()=>{
  const server=await serve();let browser;
  try{
    browser=await launchBrowser();
    const page=await browser.newPage({viewport:{width:1200,height:850}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    async function dialog(){
      for(let i=0;i<35;i++){
        if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(400);await page.locator('#dialog').click();}
        else{await page.waitForTimeout(100);if(!await page.locator('#dialog').isVisible())return;}
      }
      throw new Error('dialog did not finish');
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    async function hub(){await page.locator('#bar .slot').filter({hasText:'pavilion'}).click();}
    async function open(id){await hub();await page.locator(`[data-friend="${id}"]`).click();}
    async function tap(k){await page.locator(`[data-vkey="${k}"]`).click();}
    async function data(id){return page.evaluate(id=>state.vil.activities[id],id);}
    await page.goto(`http://127.0.0.1:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('freeEnd');s.questId='freeEnd';s.balloon=3;s.px=20.5;s.py=34.5;
      for(let n=4;n<=12;n++)s['ch'+n]={done:true};
      for(const [i,id] of ['toffee','frost','bloom','skye','luma','pippin'].entries()){
        s.ponies[id]={name:PONIES[id].names[0],hearts:2,home:i,acc:null};
        s.cottages.push({x:6+i*4,y:37,color:'pink',pony:id,built:-100});
      }
      s.coins=73;s.inv.wood=9;s.settings.voice=false;s.settings.music=false;
      s.ch7.castle={roof:'pink',topper:'star'};
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });

    await reload();
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.equal(await page.evaluate(()=>state.vil.store.pavilion),1);
    assert.equal(await page.evaluate(()=>state.vil.pavilionGift),true);
    // Free placement uses the established collision-safe decorator rather than covering old cottages.
    await page.locator('#bar .slot').filter({hasText:'decorate'}).click();
    await page.locator('[data-c="shop"]').click();
    await page.locator('[data-k="pavilion"][data-src="store"]').click();
    const spot=await page.evaluate(()=>{const s=vilDebug().mode.spots[0];return [s.x+1.5,s.y+1];});
    await page.evaluate(([x,y])=>{player.x=x;player.y=y+2;player.path=[];},spot);await page.waitForTimeout(350);
    const p=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),spot);
    await page.mouse.click(p.x,p.y);
    await page.waitForFunction(()=>state.vil.decor.some(d=>d.k==='pavilion'));
    assert.equal(await page.evaluate(()=>vilFind('pavilion').length),1);
    assert.equal(await page.evaluate(()=>state.inv.wood),9);
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.equal(await page.evaluate(()=>state.cottages.every(c=>bfsTiles(20,34,c.x+1,c.y+2).length>0)),true);
    // The building itself opens the same hub through a real world tap.
    const pavilion=await page.evaluate(()=>{const d=state.vil.decor.find(d=>d.k==='pavilion');return [d.x+1.5,d.y+1,d.y+2.7];});
    await page.evaluate(([x,y,py])=>{player.x=x;player.y=py;player.path=[];},pavilion);await page.waitForTimeout(350);
    const hit=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),pavilion);
    await page.mouse.click(hit.x,hit.y);await page.locator('[data-friend="toffee"]').waitFor();
    await page.locator('#c2close').click();
    await page.evaluate(()=>{player.x=20.5;player.y=34.5;refreshBar(true);});
    // Voice buttons speak the instructions without making a game move.
    await open('toffee');
    await page.evaluate(()=>{window.spoken=[];speechSynthesis.speak=u=>window.spoken.push(u.text);state.settings.voice=true;});
    await page.locator('#lgSay .sayBtn').click();
    await page.waitForFunction(()=>window.spoken.length>0);
    assert.match(await page.evaluate(()=>window.spoken.at(-1)),/treat/);
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    assert.equal(await page.locator('#lgGame button button').count(),0);
    await tap('serve2');assert.deepEqual((await data('toffee')).draft.items,[null,null,null]);
    await tap('berry');await tap('serve2');
    assert.equal(await page.locator('[data-vkey="finish"]').count(),0);
    await page.locator('#lgGameClose').click();await reload();await open('toffee');
    assert.deepEqual((await data('toffee')).draft.items,[null,null,'berry']);
    await tap('cake');await tap('serve0');await tap('apple');await tap('serve1');
    const toffeeHearts=await page.evaluate(()=>state.ponies.toffee.hearts);
    // Two already-queued clicks on the same (now detached) button still reward only once.
    await page.evaluate(()=>{const b=document.querySelector('[data-vkey="finish"]');b.click();b.click();});
    assert.equal(await page.evaluate(()=>state.ponies.toffee.hearts),toffeeHearts+1);
    assert.deepEqual((await data('toffee')).keepsake.items,['cake','apple','berry']);
    await tap('again');assert.deepEqual((await data('toffee')).draft.items,[null,null,null]);
    assert.deepEqual((await data('toffee')).keepsake.items,['cake','apple','berry']);
    await page.locator('#lgGameClose').click();
    const sequences={
      frost:['high','low','high','middle'],
      bloom:['tulip','pot2','rose','pot1','daisy','water'],
      skye:['right','up','left','left','down','down','right','right','right','up'],
      luma:['star','apple','pond','star'],
      pippin:['drum','bell','clap','drum']
    };
    const expected={frost:['low','high','middle'],bloom:['tulip','daisy','rose'],
      skye:['star','star','star'],luma:['apple','pond','star'],pippin:['drum','bell','clap','drum']};
    for(const id of IDS.slice(1)){
      await open(id);
      const keys=sequences[id];
      await tap(keys[0]);
      if(id==='frost'||id==='luma')assert.deepEqual((await data(id)).draft.items,[]);
      await tap(keys[1]);
      const before=(await data(id)).draft;
      await page.locator('#lgGameClose').click();await reload();await open(id);
      assert.deepEqual((await data(id)).draft,before);
      for(const k of keys.slice(2))await tap(k);
      await tap('finish');assert.equal((await data(id)).draft,null);
      const keepsake=(await data(id)).keepsake;assert.ok(keepsake);
      assert.deepEqual(keepsake.items,expected[id]);
      if(id==='bloom')assert.equal(keepsake.watered,true);
      if(id==='skye'){assert.equal(keepsake.x,2);assert.equal(keepsake.y,0);}
      // Repeated clicks on the finish area cannot grant another heart.
      const hearts=await page.evaluate(id=>state.ponies[id].hearts,id);
      assert.equal(await page.locator('[data-vkey="finish"]').count(),0);
      await tap('again');assert.deepEqual((await data(id)).keepsake,keepsake);
      assert.equal(await page.evaluate(id=>state.ponies[id].hearts,id),hearts);
      for(const k of keys)await tap(k);
      await tap('finish');await page.locator('#lgGameClose').click();await dialog();
    }
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)));
    await reload();
    assert.equal(await page.evaluate(()=>state.vil.store.pavilion||0),0);
    assert.equal(await page.evaluate(()=>vilFind('pavilion').length),1);
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.equal(await page.evaluate(()=>state.inv.wood),9);
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'pink',topper:'star'});
    assert.equal(await page.evaluate(()=>Object.values(state.vil.activities).filter(a=>a.keepsake).length),6);
    assert.deepEqual(await page.evaluate(()=>state.cottages),saved.cottages);
    await open('pippin');
    await page.evaluate(()=>{window.played=[];const prev=note;note=function(f,...args){window.played.push(f);return prev(f,...args);};});
    await tap('listen');await page.waitForFunction(()=>window.played.length===4);
    assert.deepEqual(await page.evaluate(()=>window.played),[131,523,784,131]);
    assert.equal((await data('pippin')).draft,null);
    await page.locator('#lgGameClose').click();
    // Original rescue replay is still on the Play button, alongside the new village activity button.
    await page.evaluate(()=>{openPonyMenu('pippin');});
    assert.equal(await page.locator('#pmExtra button[aria-label="activity"]').count(),1);
    await page.locator('#ponyMenu [data-act="play"]').click();
    assert.equal(await page.locator('#carnivalOpts [data-move="-1"]').count(),1);
    await page.locator('#lgGameClose').click();
    // Small screens retain large keyboard-operable controls, with no horizontal overflow.
    await page.setViewportSize({width:390,height:844});await open('bloom');
    assert.equal((await data('bloom')).draft,null);
    await tap('again');
    await page.locator('[data-vkey="rose"]').focus();await page.keyboard.press('Enter');
    assert.equal((await data('bloom')).draft.items[0],'rose');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.ok(await page.locator('[data-vkey="rose"]').evaluate(el=>el.getBoundingClientRect().width>=80));
    await page.locator('#lgGameClose').click();
    // Malformed activity drafts do not wipe unrelated saves or finished creations.
    await page.evaluate(()=>{
      state.vil.activities.frost.draft={items:['unknown']};saveGame();
    });
    await reload();
    assert.equal((await data('frost')).draft,null);
    assert.deepEqual((await data('frost')).keepsake,saved.vil.activities.frost.keepsake);
    assert.equal(await page.evaluate(()=>state.coins),73);
    // An earlier rescue unlocks only its own activity, and gifts the building once.
    await page.evaluate(()=>{
      delete state.ponies.frost;saveGame();
    });
    await reload();await hub();await page.locator('[data-friend="frost"]').click();
    assert.equal(await page.locator('#lgGame').isVisible(),false);
    assert.equal(await page.evaluate(()=>state.vil.store.pavilion||0),0);
    await page.locator('#c2close').click();
    await page.evaluate(()=>{started=false;localStorage.removeItem(SAVE_KEY);});
    await page.reload();await page.locator('#playBtn').click();await dialog();
    assert.equal(await page.evaluate(()=>qid()),'meet');
    assert.equal(await page.evaluate(()=>!!state.vil.pavilionGift),false);
    assert.equal(await page.locator('#bar .slot').filter({hasText:'pavilion'}).count(),0);
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});

test('welcome quilt stories unlock on rescue and preserve interrupted and completed choices',async()=>{
  const server=await serve();let browser;
  try{
    browser=await launchBrowser();
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    async function dialog(){
      for(let i=0;i<35;i++){
        if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(400);await page.locator('#dialog').click();}
        else{await page.waitForTimeout(100);if(!await page.locator('#dialog').isVisible())return;}
      }
      throw new Error('dialog did not finish');
    }
    async function reload(){await page.reload();await page.locator('#continueBtn').click();await dialog();}
    async function hub(){
      await page.locator('#bar .slot').filter({hasText:'pavilion'}).click();
      await page.locator('#friendStories').click();
    }
    async function open(id){await hub();await page.locator(`[data-story="${id}"]`).click();}
    async function choose(n){await page.locator(`[data-choice="${n}"]`).click();}
    async function data(id){return page.evaluate(id=>state.vil.friendStories[id],id);}
    await page.goto(`http://127.0.0.1:${server.address().port}/?assets=off`);
    await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('freeEnd');s.questId='freeEnd';s.balloon=3;s.px=20.5;s.py=34.5;
      for(let n=4;n<=12;n++)s['ch'+n]={done:true};
      s.ponies.toffee={name:'Caramel',hearts:2,home:0,acc:null};
      s.cottages.push({x:6,y:37,color:'pink',pony:'toffee',built:-100});
      s.coins=73;s.inv.wood=9;s.settings.voice=false;s.settings.music=false;
      s.ch7.castle={roof:'pink',topper:'star'};
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));
    });
    await reload();await hub();
    assert.match(await page.locator('[data-story="toffee"]').innerText(),/Caramel/);
    await page.locator('[data-story="frost"]').click();
    assert.equal(await page.locator('#lgGame').isVisible(),false);
    await page.locator('[data-story="toffee"]').click();
    await page.evaluate(()=>{window.spoken=[];speechSynthesis.speak=u=>window.spoken.push(u.text);state.settings.voice=true;});
    await page.locator('#lgSay .sayBtn').click();
    await page.waitForFunction(()=>window.spoken.some(t=>t.includes('nervous')));
    await page.evaluate(()=>{state.settings.voice=false;stopSpeech();});
    assert.equal(await page.locator('#lgGame button button').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('[data-choice="1"]').focus();await page.keyboard.press('Enter');
    assert.deepEqual((await data('toffee')).draft,[1]);
    await page.locator('#lgGameClose').click();await reload();await open('toffee');
    assert.match(await page.locator('#lgSay').innerText(),/where to sit/);
    assert.deepEqual((await data('toffee')).draft,[1]);
    await page.evaluate(()=>{const b=document.querySelector('[data-choice="0"]');b.click();b.click();});
    assert.deepEqual((await data('toffee')).draft,[1,0]);
    await choose(1);
    await page.locator('#lgGameClose').click();await reload();await open('toffee');
    assert.equal(await page.locator('[data-story-action="finish"]').count(),1);
    await page.locator('[data-story-action="finish"]').click();
    assert.deepEqual((await data('toffee')).keepsake,[1,0,1]);
    assert.match(await page.locator('#lgSay').innerText(),/room for everyone/);
    await page.locator('[data-story-action="again"]').click();await choose(0);
    assert.deepEqual((await data('toffee')).keepsake,[1,0,1]);
    await page.locator('#lgGameClose').click();await reload();await open('toffee');
    assert.deepEqual((await data('toffee')).draft,[0]);
    await choose(1);await choose(0);await page.locator('[data-story-action="finish"]').click();
    await page.locator('#lgGameClose').click();
    await page.evaluate(()=>{
      for(const [i,id] of ['frost','bloom','skye','luma','pippin'].entries())
        state.ponies[id]={name:PONIES[id].names[0],hearts:2,home:i+1,acc:null};
      saveGame();
    });
    for(const id of IDS.slice(1)){
      await open(id);await choose(0);await choose(1);await choose(0);
      await page.locator('[data-story-action="finish"]').click();
      assert.deepEqual((await data(id)).keepsake,[0,1,0]);
      await page.locator('#lgGameClose').click();
    }
    await reload();await hub();
    for(const id of IDS)assert.match(await page.locator(`[data-story="${id}"]`).innerText(),/🧵/);
    assert.equal(await page.evaluate(()=>qid()),'freeEnd');
    assert.equal(await page.evaluate(()=>state.coins),73);
    assert.equal(await page.evaluate(()=>state.inv.wood),9);
    assert.deepEqual(await page.evaluate(()=>state.ch7.castle),{roof:'pink',topper:'star'});
    assert.equal(await page.evaluate(()=>state.cottages.length),1);
    await page.locator('#c2close').click();
    await page.evaluate(()=>{state.vil.friendStories.frost.draft=[7];saveGame();});
    await reload();
    assert.equal((await data('frost')).draft,null);
    assert.deepEqual((await data('frost')).keepsake,[0,1,0]);
    assert.deepEqual(errors,[]);
  }finally{
    try{if(browser)await browser.close();}
    finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
  }
});
