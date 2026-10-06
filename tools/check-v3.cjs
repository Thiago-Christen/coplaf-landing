const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const out=path.resolve(__dirname,'../output');
const base='http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[],errors=[];
 async function page(options={}){
  const p=await browser.newPage({viewport:{width:1440,height:950},...options});
  p.on('pageerror',e=>errors.push(e.message));
  await p.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.abort());
  return p;
 }
 async function ready(p,url=base){
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:90000});
  assert.equal(await p.evaluate(()=>COPLAF_FILM.verified),596);
 }
 try{
  const p=await page();let release;
  const gate=new Promise(resolve=>release=resolve);
  await p.route('**/assets/scroll-60fps.mp4',async r=>{await gate;await r.continue()});
  await p.goto(base,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(5400);
  assert.equal(await p.evaluate(()=>COPLAF_INTRO.active),true);
  assert.equal(await p.evaluate(()=>COPLAF_FILM.verified),0);
  assert.equal(await p.locator('#loader-progress').getAttribute('value'),'0');
  await p.screenshot({path:path.join(out,'v3-carregamento.png')});
  release();
  await p.waitForFunction(()=>COPLAF_FILM.state.phase==='prepare',null,{timeout:20000});
  await p.screenshot({path:path.join(out,'v3-preparacao.png')});
  await p.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:90000});
  const state=await p.evaluate(()=>({verified:COPLAF_FILM.verified,mode:COPLAF_FILM.mode,duration:COPLAF_INTRO.duration,frame:COPLAF_FILM.frame}));
  assert.equal(state.verified,596);assert.ok(state.duration>5400);assert.ok(state.frame>=0);
  results.push({case:'real loader waits beyond five seconds',...state});
  await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,'v3-inicio-desktop.png')});
  await p.mouse.move(700,600);await p.mouse.wheel(0,1000);await p.waitForTimeout(1200);
  const forward=await p.evaluate(()=>COPLAF_FILM.frame);assert.ok(forward>50);
  await p.mouse.wheel(0,-700);await p.waitForTimeout(1000);
  const reverse=await p.evaluate(()=>COPLAF_FILM.frame);assert.ok(reverse<forward);
  for(const [fraction,chapter] of [[.29,1],[.55,2],[.86,3]]){
   await p.evaluate(f=>{const h=document.querySelector('.hero-scroll'),s=document.querySelector('.hero-stage');scrollTo({top:h.offsetTop+(h.offsetHeight-s.offsetHeight)*f,behavior:'instant'})},fraction);
   await p.waitForTimeout(900);
   assert.equal(await p.evaluate(()=>COPLAF_DEMO.chapter),chapter);
  }
  await p.screenshot({path:path.join(out,'v3-viagem-campus.png')});
  results.push({case:'wheel advances and reverses actual video',forward,reverse});
  await p.locator('#sobre').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
  await p.screenshot({path:path.join(out,'v3-quem-somos.png')});
  await p.locator('#solucoes').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
  for(let i=0;i<9;i++){await p.locator('#service-tab-'+i).click();assert.equal(await p.locator('#service-tab-'+i).getAttribute('aria-selected'),'true')}
  await p.locator('#horizontes').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
  assert.equal(await p.locator('.map-state').count(),27);assert.equal(await p.locator('.map-route').count(),7);
  await p.locator('#state-select').selectOption('AM');assert.equal(await p.locator('#state-name').textContent(),'Amazonas');
  assert.equal(await p.locator('.map-route.active').getAttribute('data-destination'),'AM');
  await p.locator('#national-view').click();assert.equal(await p.locator('#state-name').textContent(),'Brasil');
  await p.locator('[data-state="PR"]').click();
  assert.equal(await p.locator('.map-state.selected').evaluate(e=>getComputedStyle(e).filter),'none');
  await p.waitForTimeout(500);await p.screenshot({path:path.join(out,'v3-mapa-desktop.png')});
  await p.locator('#rede').scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
  for(const i of [0,1,2,3]){await p.locator('[data-entity="'+i+'"]').click();assert.equal(await p.locator('[data-entity="'+i+'"]').getAttribute('aria-pressed'),'true')}
  await p.waitForTimeout(800);await p.screenshot({path:path.join(out,'v3-rede-desktop.png')});
  const logos=await p.locator('.entity-card button img').evaluateAll(els=>els.map(e=>({src:e.getAttribute('src'),loaded:e.complete&&e.naturalWidth>0,width:e.naturalWidth})));
  assert.equal(logos.length,4);assert.ok(logos.every(x=>x.loaded));
  results.push({case:'all services, map states, entity cards and four logos',logos});
  for(const width of [320,390,768,1024,1440]){
   await p.setViewportSize({width,height:width<800?844:950});
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
  }
  await p.close();
  const mobile=await page({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await ready(mobile);
  await mobile.locator('.menu-toggle').click();assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
  await mobile.locator('.site-header nav a[href="#sobre"]').click();await mobile.waitForTimeout(1200);
  assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  await mobile.screenshot({path:path.join(out,'v3-quem-somos-mobile.png')});
  await mobile.locator('#rede').scrollIntoViewIfNeeded();await mobile.waitForTimeout(1000);
  for(const i of [0,1,2,3])await mobile.locator('[data-entity="'+i+'"]').click();
  await mobile.locator('.network-perspective').scrollIntoViewIfNeeded();await mobile.waitForTimeout(800);await mobile.screenshot({path:path.join(out,'v3-rede-mobile.png')});
  results.push({case:'390px touch menu and entity interactions',verified:await mobile.evaluate(()=>COPLAF_FILM.verified)});await mobile.close();
  const reduced=await page({reducedMotion:'reduce'});await ready(reduced);
  await reduced.mouse.move(700,600);await reduced.mouse.wheel(0,1800);await reduced.waitForTimeout(800);
  const reducedFrame=await reduced.evaluate(()=>COPLAF_FILM.frame);assert.ok(reducedFrame>100);
  results.push({case:'reduced motion retains scroll film',frame:reducedFrame});await reduced.close();
  const native=await page();await native.addInitScript(()=>{window.VideoDecoder=undefined});await ready(native);
  await native.mouse.move(700,600);await native.mouse.wheel(0,2000);await native.waitForTimeout(1500);
  assert.equal(await native.evaluate(()=>COPLAF_FILM.mode),'video');assert.ok(await native.evaluate(()=>COPLAF_FILM.frame)>100);
  results.push({case:'native video fallback verifies every frame',mode:await native.evaluate(()=>COPLAF_FILM.mode)});await native.close();
  const local=await page();await ready(local,'file:///'+path.resolve(__dirname,'../dist/index.html').replace(/\\/g,'/'));
  await local.mouse.move(700,600);await local.mouse.wheel(0,1600);await local.waitForTimeout(1000);assert.ok(await local.evaluate(()=>COPLAF_FILM.frame)>100);
  results.push({case:'file preview without JSON fetch',mode:await local.evaluate(()=>COPLAF_FILM.mode)});await local.close();
  const recovery=await page();await recovery.route('**/assets/scroll-60fps.mp4',r=>r.abort());
  await recovery.goto(base,{waitUntil:'domcontentloaded'});await recovery.waitForFunction(()=>COPLAF_FILM.state.phase==='error');
  assert.equal(await recovery.locator('#loader-retry').isVisible(),true);
  await recovery.locator('#skip-intro').click();assert.equal(await recovery.locator('#film-notice').isVisible(),true);
  await recovery.unroute('**/assets/scroll-60fps.mp4');await recovery.locator('#film-retry-inline').click();
  await recovery.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:90000});
  assert.equal(await recovery.evaluate(()=>COPLAF_FILM.verified),596);
  results.push({case:'explicit failure, opt-out and successful retry'});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:true,results,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
