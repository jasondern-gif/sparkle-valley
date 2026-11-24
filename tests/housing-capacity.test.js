const assert=require('node:assert/strict');
const test=require('node:test');
const {browserLaunch,serve}=require('./helpers/browser.cjs');

test('a full older village can still build homes for new rescues',async()=>{
  const server=await serve();let browser;
  try{
    browser=await browserLaunch();const page=await browser.newPage({viewport:{width:1200,height:800}});
    await page.goto(`http://localhost:${server.address().port}/`);
    const old=await page.evaluate(()=>{
      const s=defaultState();s.quest=qi('harborBuild');s.questId='harborBuild';s.balloon=3;
      s.px=20.5;s.py=31.5;s.settings.voice=false;s.settings.music=false;
      for(let n=4;n<=15;n++)s['ch'+n]={done:true};
      for(let i=0;i<20;i++){
        const spot=buildSpots()[0],id=PONY_IDS[i];
        const c={...spot,color:'pink',pony:id,built:-100};applyCottage(c);s.cottages.push(c);
        s.ponies[id]={name:PONIES[id].names[0],hearts:2,home:i,acc:null};
      }
      for(const id of ['sailor','tide'])s.ponies[id]={name:PONIES[id].names[0],hearts:2,home:-1,acc:null};
      localStorage.setItem(SAVE_KEY,JSON.stringify(s));return s.cottages;
    });
    await page.reload();await page.locator('#continueBtn').click();
    for(let i=0;i<30;i++){
      if(await page.locator('#dialog').isVisible()){await page.waitForTimeout(450);await page.locator('#dialog').click();}
      else {await page.waitForTimeout(250);if(!await page.locator('#dialog').isVisible())break;}
    }
    await page.evaluate(()=>{player.x=20.5;player.y=31.5;refreshBar(true);});
    await page.locator('#bar [data-build]').click({force:true});
    await page.locator('#c2body .pick').first().click();
    const spot=await page.evaluate(()=>[placing.spots[0].x+1.5,placing.spots[0].y+1]);
    await page.evaluate(([x,y])=>{player.x=x;player.y=y+2;player.path=[];player.action=null;},spot);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const pt=await page.evaluate(([x,y])=>({x:x*ts-cam.x,y:y*ts-cam.y}),spot);
    await page.mouse.click(pt.x,pt.y);
    await page.locator('#c2body .pick[data-id="sailor"]').click({timeout:10000});
    assert.deepEqual(await page.evaluate(()=>state.cottages.slice(0,20)),old);
    assert.equal(await page.evaluate(()=>state.cottages[state.ponies.sailor.home].pony),'sailor');
    const count=await page.evaluate(()=>{
      let n=state.cottages.length;
      while(n<PONY_IDS.length){const spot=buildSpots()[0];if(!spot)break;applyCottage(spot);n++;}
      return n;
    });
    assert.equal(count,30);
  }finally{try{if(browser)await browser.close();}finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}}
});
