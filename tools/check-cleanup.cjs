const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const out=path.resolve(__dirname,'../output');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],results=[];
 try{
  const p=await browser.newPage({viewport:{width:1440,height:950}});
  p.on('pageerror',e=>errors.push(e.message));await p.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.abort());
  await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:60000});
  assert.equal(await p.evaluate(()=>COPLAF_FILM.verified),596);
  for(const selector of ['.scroll-cue','.journey-index','#journey-scene','#frame-counter','.tiny-line','.service-source'])assert.equal(await p.locator(selector).count(),0,selector);
  assert.equal(await p.getByText('Conheça nosso site oficial',{exact:true}).count(),0);
  assert.equal(await p.locator('.identity-photo figcaption span').textContent(),'Cifloma UFPR');
  assert.ok(await p.locator('.section-label>span:first-child,.identity-principles article>span,.entity-card-top>span').evaluateAll(els=>els.every(e=>!/^\d+\s*\//.test(e.textContent))));
  const text=await p.locator('main').innerText();
  assert.ok(!text.includes('2026')&&!text.includes('última década')&&!text.includes('material institucional enviado'));
  await p.waitForTimeout(400);await p.screenshot({path:path.join(out,'cleanup-hero.png')});
  await p.mouse.move(700,600);await p.mouse.wheel(0,1500);await p.waitForTimeout(1000);
  const forward=await p.evaluate(()=>COPLAF_FILM.frame);assert.ok(forward>100);
  await p.mouse.wheel(0,-1000);await p.waitForTimeout(1000);const reverse=await p.evaluate(()=>COPLAF_FILM.frame);assert.ok(reverse<forward);
  results.push({case:'removed overlays and references, movie still advances and reverses',forward,reverse});
  async function show(selector){await p.evaluate(s=>{const el=document.querySelector(s);scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'})},selector);await p.waitForTimeout(900)}
  await show('.service-gallery');
  await p.waitForFunction(()=>[...document.querySelectorAll('.service-thumbnail')].every(i=>i.complete&&i.naturalWidth>0));
  const photos=await p.locator('.service-thumbnail').evaluateAll(els=>els.map(i=>i.getAttribute('src')));assert.equal(photos.length,9);assert.equal(new Set(photos).size,9);
  const car=await p.locator('#service-tab-2 .service-thumbnail').evaluate(e=>({fit:getComputedStyle(e).objectFit,position:getComputedStyle(e).objectPosition,width:e.naturalWidth}));
  assert.equal(car.fit,'cover');assert.equal(car.position,'50% 0%');
  await p.locator('#service-tab-4').click();
  await p.waitForFunction(()=>document.getElementById('service-image').complete&&!document.querySelector('.image-changing'));
  assert.ok((await p.locator('#service-image').getAttribute('src')).includes('educacao-ambiental'));
  await p.waitForTimeout(600);await p.mouse.move(30,900);await p.screenshot({path:path.join(out,'cleanup-services-desktop.png')});
  results.push({case:'nine distinct images with dedicated education photo and full-width CAR thumbnail',photos,car});
  async function markers(){
   const rows=await p.locator('.map-route-dot').evaluateAll(dots=>dots.map(dot=>{
    const code=dot.dataset.destination,label=document.querySelector('[data-label="'+code+'"]');
    const d=dot.getBoundingClientRect(),l=label.getBoundingClientRect();
    return {code,xOffset:Number(dot.getAttribute('cx'))-Number(label.getAttribute('x')),clear:d.right<l.left||d.left>l.right||d.bottom<l.top||d.top>l.bottom};
   }));assert.equal(rows.length,7);assert.ok(rows.every(r=>r.clear&&Math.abs(r.xOffset)>=22));return rows;
  }
  await show('.map-board');const desktopMarkers=await markers();
  await p.locator('.map-df-label').click();assert.equal(await p.locator('#state-name').textContent(),'Distrito Federal');
  assert.equal(await p.locator('.map-df-label').getAttribute('aria-pressed'),'true');
  assert.equal(await p.locator('.map-df-callout').count(),1);
  await p.mouse.move(1300,900);await p.waitForTimeout(500);await p.screenshot({path:path.join(out,'cleanup-map-desktop.png')});
  await p.locator('#national-view').click();assert.equal(await p.locator('.map-df-label').getAttribute('aria-pressed'),'false');
  await p.locator('.map-df-label').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#state-select').inputValue(),'DF');
  assert.equal(await p.locator('.data-note').textContent(),'De Curitiba a diferentes regiões do Brasil. As linhas ilustram nossas conexões.');
  results.push({case:'route endpoints alongside all state acronyms and accessible DF annotation',desktopMarkers});
  for(const i of [0,1,2,3]){await p.evaluate(index=>COPLAF_DEMO.setEntity(index,true),i);assert.ok(!/^\d+\s*\//.test(await p.locator('#entity-level').textContent()))}
  await p.setViewportSize({width:390,height:844});
  await show('.service-gallery');await p.screenshot({path:path.join(out,'cleanup-services-mobile-top.png')});
  await show('#service-tab-4');await p.screenshot({path:path.join(out,'cleanup-services-mobile-education.png')});
  await p.locator('#service-tab-4').click();await p.waitForFunction(()=>!COPLAF_DEMO.navigating);await p.waitForTimeout(600);await p.screenshot({path:path.join(out,'cleanup-education-mobile-detail.png')});
  await show('.map-board');const mobileMarkers=await markers();
  await p.locator('.map-df-label').click();await p.waitForTimeout(500);await p.mouse.move(380,800);await p.screenshot({path:path.join(out,'cleanup-map-mobile.png')});
  await show('.identity-photo');await p.screenshot({path:path.join(out,'cleanup-campus-mobile.png')});
  assert.equal(await p.locator('.identity-photo figcaption span').textContent(),'Cifloma UFPR');
  for(const width of [320,390,768,1024,1440,1920]){await p.setViewportSize({width,height:950});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow at '+width)}
  results.push({case:'mobile service detail, CAR crop, DF and separated markers',mobileMarkers});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,results,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
