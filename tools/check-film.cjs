const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const p=await b.newPage({viewport:{width:1440,height:950}});
  await p.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});await p.evaluate(()=>COPLAF_INTRO.skip());
  await p.waitForFunction(()=>COPLAF_FILM.ready,{},{timeout:25000});
  console.log('Film',await p.evaluate(()=>({mode:COPLAF_FILM.mode,reason:document.querySelector('canvas').dataset.fallbackReason,frame:COPLAF_FILM.frame})));
  const stats=await p.evaluate(()=>new Promise(resolve=>{
   const start=performance.now(),first=COPLAF_FILM.rendered;
   function step(now){
    const elapsed=now-start;
    COPLAF_FILM.setProgress(Math.min(1,elapsed/3500));
    if(elapsed<3500)requestAnimationFrame(step);
    else setTimeout(()=>resolve({renders:COPLAF_FILM.rendered-first,finalFrame:COPLAF_FILM.frame,mode:COPLAF_FILM.mode,verified:COPLAF_FILM.verified}),400);
   }requestAnimationFrame(step);
  }));
  console.log('Smooth scrub',stats);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
