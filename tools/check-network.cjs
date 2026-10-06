const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
  await p.evaluate(()=>COPLAF_INTRO.skip());
  await p.locator('#rede').scrollIntoViewIfNeeded();await p.waitForTimeout(900);
  console.log(await p.locator('[data-entity]').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:e.innerText,rect:{x:r.x,y:r.y,w:r.width,h:r.height},hit:hit?.outerHTML.slice(0,180)}})));
  await p.locator('[data-entity="3"]').click();await p.waitForTimeout(700);
  console.log('Selected:',await p.locator('#entity-title').innerText());
  await p.screenshot({path:'qa/refresh-network.png'});
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
