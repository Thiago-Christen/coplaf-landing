const {chromium}=require('C:/Users/thiag/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
const path=require('path');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage();
  page.on('console',message=>console.log(message.text()));
  await page.goto('http://127.0.0.1:4173/assets/sequence.json',{waitUntil:'domcontentloaded'});
  const timeout=setTimeout(async()=>{console.error('Video export timed out');await browser.close();process.exitCode=1;},25000);
  const base64=await page.evaluate(async()=>{
    const images=await Promise.all(Array.from({length:144},(_,i)=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=`/assets/frames/${String(i).padStart(3,'0')}.webp`;})));
    console.log('Sequence loaded for movie');
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
    const context=canvas.getContext('2d');context.drawImage(images[0],0,0);
    const type='video/webm;codecs=vp8';
    const stream=canvas.captureStream(0);const track=stream.getVideoTracks()[0];
    const chunks=[];const recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:5500000});
    const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=reject;});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start(100);
    for(const image of images){context.drawImage(image,0,0);track.requestFrame();await new Promise(resolve=>setTimeout(resolve,1000/24));}
    console.log('Movie frames recorded');recorder.stop();await done;track.stop();
    const blob=new Blob(chunks,{type});return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(blob);});
  });
  clearTimeout(timeout);
  const out=path.resolve(__dirname,'..','output');fs.mkdirSync(out,{recursive:true});
  const file=path.join(out,'coplaf-sequencia-florestal.webm');fs.writeFileSync(file,Buffer.from(base64,'base64'));
  console.log(JSON.stringify({file,size:fs.statSync(file).size}));await browser.close();
})().catch(e=>{console.error(e.message);process.exitCode=1;});
