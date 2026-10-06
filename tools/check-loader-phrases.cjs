const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],flows=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.abort());
    for(let run=0;run<3;run++){
      if(run===2)await page.setViewportSize({width:390,height:844});
      await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
      const texts=[];
      for(let phrase=0;phrase<3;phrase++){
        await page.waitForFunction(i=>COPLAF_INTRO.phraseIndex===i,phrase);
        texts.push(await page.locator('#loader-message').innerText());
      }
      const layout=await page.evaluate(()=>({flow:COPLAF_INTRO.phraseFlow,active:COPLAF_INTRO.active,stage:!!document.getElementById('loader-stage'),count:!!document.getElementById('loader-frame-count'),tip:!!document.getElementById('loader-tip'),actions:document.querySelector('.loader-actions').hidden,accessible:document.getElementById('loader-progress').getAttribute('aria-valuetext'),overflow:document.documentElement.scrollWidth>innerWidth,text:document.getElementById('coplaf-loader').innerText}));
      assert.equal(layout.active,true);assert.equal(layout.stage,false);assert.equal(layout.count,false);assert.equal(layout.tip,false);assert.equal(layout.actions,true);assert.equal(layout.overflow,false);
      assert.ok(!/quadros|frames|computar|entrar na|ao descer/i.test(layout.text));assert.match(layout.accessible,/^\d+% carregado$/);assert.equal(new Set(texts).size,3);
      flows.push({flow:layout.flow,texts});
      await page.waitForTimeout(450);
      await page.screenshot({path:path.resolve(__dirname,`../output/loader-simple-${run===2?'mobile':run}.png`)});
      await page.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:90000});
      const ready=await page.evaluate(()=>({verified:COPLAF_FILM.verified,duration:COPLAF_INTRO.duration,inert:document.querySelector('main').inert}));
      assert.equal(ready.verified,596);assert.ok(ready.duration>=5000);assert.equal(ready.inert,false);
    }
    assert.equal(new Set(flows.map(f=>f.flow)).size,3);
    await page.mouse.wheel(0,1600);await page.waitForTimeout(1000);
    assert.ok(await page.evaluate(()=>COPLAF_FILM.frame>50));
    await page.route('**/assets/scroll-60fps.mp4',r=>r.abort());
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>COPLAF_INTRO.phase==='error',null,{timeout:20000});
    assert.equal(await page.locator('#loader-message').innerText(),'A conexão fez uma pausa. Vamos tentar de novo?');
    assert.equal(await page.locator('#loader-retry').isVisible(),true);assert.equal(await page.locator('#skip-intro').isVisible(),true);
    await page.unroute('**/assets/scroll-60fps.mp4');
    await page.locator('#loader-retry').click();
    assert.equal(await page.locator('.loader-actions').isHidden(),true);
    await page.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:90000});
    assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,flows,errorRecovery:true,verified:596,errors},null,2));
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
