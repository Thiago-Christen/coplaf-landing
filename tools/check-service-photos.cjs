const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],rows=[];
 try{
  const p=await b.newPage({viewport:{width:1440,height:950}});
  p.on('pageerror',e=>errors.push(e.message));await p.route(/fonts\.googleapis|fonts\.gstatic/,r=>r.abort());
  await p.goto('http://127.0.0.1:4173/#solucoes',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>COPLAF_FILM.ready&&!COPLAF_INTRO.active,null,{timeout:60000});
  await p.evaluate(()=>{const section=document.getElementById('solucoes');scrollTo({top:section.offsetTop-105,behavior:'instant'})});
  await p.waitForTimeout(1100);
  for(let i=0;i<9;i++){
   await p.locator('#service-tab-'+i).click();
   await p.waitForFunction(()=>{const img=document.getElementById('service-image');return img.complete&&img.naturalWidth>0&&!document.getElementById('service-panel').classList.contains('image-changing')});
   const row=await p.evaluate(index=>{const img=document.getElementById('service-image'),item=COPLAF_CONTENT.services[index];return {service:item.name,asset:item.image,src:img.getAttribute('src'),alt:img.alt,position:getComputedStyle(img).objectPosition,width:img.naturalWidth}},i);
   assert.equal(row.src,'assets/'+row.asset);assert.ok(row.alt&&row.alt!=='undefined');assert.ok(row.width>0);rows.push(row);
   await p.waitForTimeout(600);
   if([0,2,5,8].includes(i))await p.screenshot({path:path.resolve(__dirname,'../output/servicos-desktop-'+i+'.png')});
  }
  assert.equal(new Set(rows.map(r=>r.asset)).size,9);
  await p.locator('#service-tab-0').focus();await p.keyboard.press('ArrowDown');assert.equal(await p.locator('#service-tab-1').getAttribute('aria-selected'),'true');
  await p.setViewportSize({width:390,height:844});
  await p.evaluate(()=>{const panel=document.getElementById('service-panel');scrollTo({top:panel.getBoundingClientRect().top+scrollY-100,behavior:'instant'})});
  for(const i of [0,2,4,5,8]){
   await p.evaluate(index=>COPLAF_DEMO.setService(index),i);
   await p.waitForFunction(()=>{const img=document.getElementById('service-image');return img.complete&&img.naturalWidth>0&&!document.getElementById('service-panel').classList.contains('image-changing')});
   await p.waitForTimeout(600);
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.screenshot({path:path.resolve(__dirname,'../output/servicos-mobile-'+i+'.png')});
  }
  await p.evaluate(()=>{COPLAF_DEMO.setService(0);COPLAF_DEMO.setService(3);COPLAF_DEMO.setService(8)});
  await p.waitForFunction(()=>{const img=document.getElementById('service-image');return img.complete&&img.naturalWidth>0&&!document.getElementById('service-panel').classList.contains('image-changing')});
  assert.ok((await p.locator('#service-image').getAttribute('src')).includes('laudo-fitossanitario'));
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,uniquePhotos:9,services:rows,errors},null,2));
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
