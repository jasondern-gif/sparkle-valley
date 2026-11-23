const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

async function install({missingManifest=false,missingImage=false}={}){
  const events={},cached=[],warnings=[];
  const cache={
    async addAll(files){cached.push(...files);},
    async add(file){
      if((missingManifest&&file==='assets/manifest.json')||
         (missingImage&&file==='assets/tiles/tree.png'))throw new Error('not found');
      cached.push(file);
    },
    async match(){return{async json(){return{assets:{tree:{src:'tiles/tree.png'},house:{src:'buildings/farmhouse.png'}}};}};}
  };
  const self={addEventListener(name,fn){events[name]=fn;},skipWaiting(){},clients:{claim(){}}};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{
    self,caches:{async open(){return cache;}},console:{warn(message){warnings.push(message);}},
    async fetch(){return{async json(){return{};}};}
  });
  let installation;
  events.install({waitUntil(promise){installation=promise;}});
  await installation;
  return{cached,warnings};
}

test('caches the manifest and prototype images',async()=>{
  const {cached,warnings}=await install();
  assert.ok(cached.includes('assets/manifest.json'));
  assert.ok(cached.includes('assets/tiles/tree.png'));
  assert.ok(cached.includes('assets/buildings/farmhouse.png'));
  for(const script of ['assets/assetManager.js','assets/wrappers.js','lands.js','forest.js','lagoon.js','meadow.js'])
    assert.ok(cached.includes(script),`${script} must be available offline`);
  const html=fs.readFileSync('index.html','utf8');
  for(const [,script] of html.matchAll(/<script\s+src="([^"]+)"/g))
    assert.ok(cached.includes(script),`${script} must be available offline`);
  assert.deepEqual(warnings,[]);
});

test('installs even when the art manifest is missing',async()=>{
  const {cached,warnings}=await install({missingManifest:true});
  assert.ok(cached.includes('index.html'));
  assert.equal(warnings.length,1);
  assert.match(warnings[0],/art manifest/);
});

test('installs and caches other images when an image is missing',async()=>{
  const {cached,warnings}=await install({missingImage:true});
  assert.ok(cached.includes('assets/buildings/farmhouse.png'));
  assert.equal(warnings.length,1);
  assert.match(warnings[0],/tree/);
});

test('game loads offline with assets enabled and disabled',async()=>{
  const server=await serve();let browser;
  try{
    browser=await browserLaunch();
    for(const query of ['', '?assets=off']){
      const context=await browser.newContext();
      try{
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        const url=`http://localhost:${server.address().port}/${query}`;
        await page.goto(url);
        await page.waitForFunction(()=>navigator.serviceWorker.controller,null,{timeout:30000});
        await context.setOffline(true);
        await page.reload();
        await page.waitForFunction(()=>typeof qid==='function'&&typeof LG==='object');
        const status=await page.evaluate(()=>Assets.ready);
        if(query)assert.equal(status.manifest,'off');
        else assert.deepEqual(status.ready.sort(),['buttercup','crop_carrot','farmhouse','tree']);
        assert.ok(await page.locator('#playBtn').isVisible());
        assert.deepEqual(errors,[]);
      }finally{await context.close();}
    }
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}}
});
