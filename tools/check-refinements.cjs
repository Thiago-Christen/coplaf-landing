const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
const out=path.resolve(__dirname,'../output');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],results=[];
 async function open(options={}){
  const p=await browser.newPage({viewport:{width:1440,height:950},...options});
  p.on('pageerror',e=>errors.push(e.message));await p.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.abort());
  await p.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:60000});
  assert.equal(await p.evaluate(()=>COPLAF_FILM.verified),596);return p;
 }
 async function show(p,selector){
  await p.evaluate(s=>{const el=document.querySelector(s);scrollTo({top:el.getBoundingClientRect().top+scrollY-110,behavior:'instant'})},selector);
  await p.waitForTimeout(1100);
 }
 async function shot(p,name){await p.screenshot({path:path.join(out,'refinement-'+name+'.png')})}
 try{
  const p=await open();
  await show(p,'.service-gallery');
  await p.waitForFunction(()=>[...document.querySelectorAll('.service-thumbnail')].every(i=>i.complete&&i.naturalWidth>0));
  const gallery=await p.locator('.service-thumbnail').evaluateAll(imgs=>imgs.map(img=>({src:img.getAttribute('src'),display:getComputedStyle(img).display,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,loaded:img.naturalWidth>0})));
  assert.equal(gallery.length,9);assert.equal(new Set(gallery.map(x=>x.src)).size,9);
  assert.ok(gallery.every(x=>x.display!=='none'&&x.width>150&&x.height>120&&x.loaded));
  await shot(p,'services-desktop');
  for(let i=0;i<9;i++){
   await p.locator('#service-tab-'+i).click();
   await p.waitForFunction(()=>{const i=document.getElementById('service-image');return i.complete&&i.naturalWidth>0&&!document.querySelector('.image-changing')});
   assert.equal(await p.locator('#service-image').getAttribute('src'),gallery[i].src);
  }
  await p.locator('#service-tab-0').focus();await p.keyboard.press('ArrowRight');
  assert.equal(await p.locator('#service-tab-1').getAttribute('aria-selected'),'true');
  results.push({case:'nine distinct photo cards, all eight supplied images plus education, click and keyboard',gallery});
  await show(p,'.identity-photo');await shot(p,'campus-desktop');
  const campus=await p.locator('.identity-photo').boundingBox();assert.ok(Math.abs(campus.width-1440)<2);
  const positions=await p.locator('.identity-principles article').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().top));
  assert.ok(positions[1]>positions[0]+60);
  const shift=await p.locator('.identity-photo img').evaluate(el=>getComputedStyle(el).transform);
  await p.mouse.wheel(0,300);await p.waitForTimeout(700);
  assert.notEqual(await p.locator('.identity-photo img').evaluate(el=>getComputedStyle(el).transform),shift);
  await show(p,'.identity-principles');await shot(p,'campus-cards');
  results.push({case:'full-width campus with scroll parallax and cascading story cards',width:campus.width});
  await show(p,'.map-board');await p.mouse.move(1300,600);await p.waitForTimeout(400);
  const map=await p.locator('#brazil-map').boundingBox();assert.ok(map.height>=590);assert.ok(map.width>780);
  await p.locator('.map-state[data-code="AM"]').click();
  assert.equal(await p.locator('#state-name').textContent(),'Amazonas');
  const selection=await p.locator('.map-state[data-code="AM"]').evaluate(el=>({stroke:getComputedStyle(el).stroke,outline:getComputedStyle(el).outlineStyle,filter:getComputedStyle(el).filter}));
  assert.equal(selection.outline,'none');assert.equal(selection.filter,'none');assert.equal(selection.stroke,'rgb(241, 242, 232)');
  await p.mouse.move(1300,600);await p.waitForTimeout(700);await shot(p,'map-desktop');
  await p.keyboard.press('Tab');await p.locator('.map-state[data-code="PR"]').focus();
  await p.waitForTimeout(350);
  assert.equal(await p.locator('.map-state[data-code="PR"]').evaluate(el=>getComputedStyle(el).stroke),'rgb(230, 183, 66)');
  await p.keyboard.press('Enter');assert.equal(await p.locator('#state-name').textContent(),'Paraná');
  results.push({case:'larger map, no dark mouse outline, visible golden keyboard focus',map,selection});
  await show(p,'.network-perspective');
  for(const i of [0,1,2,3]){await p.locator('[data-entity="'+i+'"]').click();assert.equal(await p.locator('[data-entity="'+i+'"]').getAttribute('aria-pressed'),'true')}
  await p.mouse.move(100,900);await p.waitForTimeout(800);
  const card=p.locator('.entity-card').first();const before=await card.evaluate(e=>getComputedStyle(e).transform);
  const box=await card.boundingBox();await p.mouse.move(box.x+box.width*.75,box.y+box.height*.25);await p.waitForTimeout(700);
  const after=await card.evaluate(e=>getComputedStyle(e).transform);assert.notEqual(before,after);
  assert.ok(await p.locator('.entity-card').first().evaluate(e=>e.style.getPropertyValue('--entity-pointer-x')));
  const links=await p.locator('.entity-card-top a').evaluateAll(els=>els.map(el=>({href:el.href,clickable:document.elementFromPoint(el.getBoundingClientRect().x+el.offsetWidth/2,el.getBoundingClientRect().y+el.offsetHeight/2)?.closest('a')===el})));
  assert.ok(links.every(l=>l.clickable));await shot(p,'network-desktop');
  results.push({case:'entity pointer tilt, selection and unobstructed official links',links});
  await p.locator('.site-header .brand').click();
  await p.waitForFunction(()=>!COPLAF_DEMO.navigating);assert.ok(await p.evaluate(()=>scrollY<2));
  await p.locator('nav a[href="#solucoes"]').click();await p.waitForTimeout(250);
  const middle=await p.evaluate(()=>({y:scrollY,top:document.getElementById('solucoes').offsetTop,active:COPLAF_DEMO.navigating}));
  assert.ok(middle.active&&middle.y>0&&middle.y<middle.top-200);
  await p.waitForFunction(()=>!COPLAF_DEMO.navigating);
  assert.equal(await p.evaluate(()=>location.hash),'#solucoes');
  assert.ok(await p.locator('#solucoes').evaluate(e=>Math.abs(e.getBoundingClientRect().top-104)<22));
  await p.locator('nav a[href="#rede"]').click();await p.waitForTimeout(200);
  await p.mouse.wheel(0,-120);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>COPLAF_DEMO.navigating),false);
  results.push({case:'smooth navbar animation reaches offset destination and yields to user scroll',middle});
  for(const width of [320,390,600,768,1024,1440,1920]){
   await p.setViewportSize({width,height:width<800?844:950});
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow at '+width);
  }
  await p.close();
  const mobile=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await show(mobile,'.service-gallery');
  await mobile.locator('#service-tab-8').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>[...document.querySelectorAll('.service-thumbnail')].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await mobile.locator('.service-thumbnail').count(),9);
  await show(mobile,'.service-gallery');await shot(mobile,'services-mobile-top');
  await mobile.locator('#service-tab-2').click();await mobile.waitForFunction(()=>!COPLAF_DEMO.navigating);
  assert.ok(await mobile.locator('#service-panel').evaluate(el=>Math.abs(el.getBoundingClientRect().top-94)<8));
  assert.equal(await mobile.locator('#service-image').getAttribute('src'),'assets/services/cadastro-ambiental-rural.webp');
  await mobile.waitForTimeout(500);await shot(mobile,'service-mobile-detail');
  await show(mobile,'#service-tab-6');await shot(mobile,'services-mobile-bottom');
  await show(mobile,'.identity-photo');assert.ok(Math.abs((await mobile.locator('.identity-photo').boundingBox()).width-390)<2);await shot(mobile,'campus-mobile');
  await show(mobile,'.identity-principles');await shot(mobile,'campus-mobile-cards');
  await show(mobile,'.map-board');await mobile.locator('#state-select').selectOption('SP');assert.equal(await mobile.locator('#state-name').textContent(),'São Paulo');await mobile.waitForTimeout(500);await shot(mobile,'map-mobile');
  await show(mobile,'.network-perspective');
  for(const i of [0,1,2,3]){await mobile.locator('[data-entity="'+i+'"]').click();assert.equal(await mobile.locator('[data-entity="'+i+'"]').getAttribute('aria-pressed'),'true')}
  await show(mobile,'.network-perspective');await shot(mobile,'network-mobile');
  await mobile.locator('.menu-toggle').click();await mobile.locator('nav a[href="#solucoes"]').click();
  await mobile.waitForFunction(()=>!COPLAF_DEMO.navigating);assert.equal(await mobile.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  results.push({case:'390px touch gallery, panorama, state selection, cards and smooth menu',passed:true});await mobile.close();
  const reduced=await open({reducedMotion:'reduce'});
  await reduced.locator('nav a[href="#solucoes"]').click();assert.equal(await reduced.evaluate(()=>COPLAF_DEMO.navigating),false);
  await show(reduced,'.identity-principles');assert.equal(await reduced.locator('.identity-principles article').first().evaluate(e=>getComputedStyle(e).transform),'none');
  await show(reduced,'.network-perspective');assert.equal(await reduced.locator('.entity-card').first().evaluate(e=>getComputedStyle(e).transform),'none');
  await reduced.locator('.site-header .brand').click();await reduced.mouse.move(700,600);await reduced.mouse.wheel(0,1800);await reduced.waitForTimeout(900);
  assert.ok(await reduced.evaluate(()=>COPLAF_FILM.frame>100));
  results.push({case:'reduced motion respects immediate navigation and still drives video frames',frame:await reduced.evaluate(()=>COPLAF_FILM.frame)});await reduced.close();
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,results,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
