/* Full preparation of every frame before releasing the scroll journey.
   Frames are verified then closed: keep compressed data, not ~2 GB of bitmaps. */
(() => {
  'use strict';
  const canvas=document.getElementById('forest-sequence'),video=document.getElementById('forest-video');
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true}),meta=window.COPLAF_FILM_INDEX;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),N=meta.frameCount;
  let bytes,decoder,blobUrl,ready=false,pending=false,requested=-1,painted=-1,fallback=false,disposed=false;
  let raf=0,target=0,position=0,last=0,renders=0,run=0,preparing=true,verified=0;
  let verifyOutput=null,decodeFailure=null;
  let state={phase:'download',progress:0,loadedBytes:0,totalBytes:0,verified:0,total:N,message:'Carregando a viagem'};
  const controller=new AbortController();
  function emit(part){
    state={...state,...part};
    document.dispatchEvent(new CustomEvent('coplaf:film-progress',{detail:{...state}}));
  }
  function cover(frame){
    const w=frame.displayWidth||frame.videoWidth,h=frame.displayHeight||frame.videoHeight;
    if(!w||!h||!ctx)return;
    const scale=Math.max(canvas.width/w,canvas.height/h);
    ctx.drawImage(frame,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);
  }
  function resize(){
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.max(1,Math.round(canvas.clientWidth*ratio));canvas.height=Math.max(1,Math.round(canvas.clientHeight*ratio));
    requested=-1;painted=-1;if(ready)request();
  }
  const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
  async function readMovie(){
    if(location.protocol==='file:'){emit({phase:'download',progress:.15,message:'Abrindo o vídeo local'});return null}
    const response=await fetch('assets/scroll-60fps.mp4',{signal:controller.signal});
    if(!response.ok)throw Error('O vídeo não foi encontrado.');
    const length=Number(response.headers.get('content-length')),parts=[];
    let total=0;
    if(response.body?.getReader){
      const reader=response.body.getReader();
      for(;;){
        const {value,done}=await reader.read();if(done)break;
        parts.push(value);total+=value.byteLength;
        emit({loadedBytes:total,totalBytes:length,progress:length?.68*total/length:0,message:'Carregando o vídeo'});
      }
      const data=new Uint8Array(total);let offset=0;for(const part of parts){data.set(part,offset);offset+=part.byteLength}parts.length=0;
      return data;
    }
    const data=new Uint8Array(await response.arrayBuffer());
    emit({loadedBytes:data.length,totalBytes:data.length,progress:.68});return data;
  }
  function validateIndex(){
    if(meta.samples.length!==N)throw Error('O índice está incompleto.');
    const seen=new Set();
    for(const sample of meta.samples){
      if(sample.offset<0||sample.size<=0||bytes&&sample.offset+sample.size>bytes.length||seen.has(sample.timestamp))throw Error('O índice de quadros não corresponde ao vídeo.');
      seen.add(sample.timestamp);
    }
  }
  function markVerified(count){
    verified=count;
    if(count%6===0||count===N)emit({phase:'prepare',verified:count,progress:.68+.30*count/N,message:'Preparando os quadros'});
  }
  async function verifyWebCodecs(config,id){
    const seen=new Uint8Array(N);let count=0;
    preparing=true;decodeFailure=null;
    verifyOutput=frame=>{
      const index=Math.round(frame.timestamp/1e6*meta.fps);
      try{
        if(index<0||index>=N||!frame.displayWidth||!frame.displayHeight)throw Error('Quadro inválido.');
        if(!seen[index]){seen[index]=1;markVerified(++count)}
      }finally{frame.close()}
    };
    decoder=new VideoDecoder({output:frame=>{
      if(preparing&&verifyOutput){verifyOutput(frame);return}
      const index=Math.max(0,Math.min(N-1,Math.round(frame.timestamp/1e6*meta.fps)));
      try{cover(frame)}finally{frame.close()}
      report(index);
    },error:error=>{decodeFailure=error;if(ready)fail('A reprodução foi interrompida. Tente preparar o vídeo novamente.')}});
    decoder.configure(config);
    for(let i=0;i<N;i++){
      if(id!==run||disposed)return;
      const s=meta.samples[i];
      decoder.decode(new EncodedVideoChunk({type:'key',timestamp:s.timestamp,data:bytes.subarray(s.offset,s.offset+s.size)}));
      if(decoder.decodeQueueSize>=8){await decoder.flush();await pause()}
      if(decodeFailure)throw decodeFailure;
    }
    await decoder.flush();
    if(count!==N)throw Error('Não foi possível preparar todos os quadros.');
    verifyOutput=null;preparing=false;
  }
  async function loadHTML(){
    fallback=true;video.hidden=false;video.preload='auto';video.classList.remove('ready');
    if(bytes){blobUrl=URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));video.src=blobUrl}
    else video.src='assets/scroll-60fps.mp4';
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{clean();reject(Error('O vídeo demorou para responder.'))},25000);
      function clean(){clearTimeout(timer);video.removeEventListener('loadeddata',done);video.removeEventListener('error',error)}
      function done(){clean();resolve()}
      function error(){clean();reject(Error('O navegador não conseguiu abrir o vídeo.'))}
      video.addEventListener('loadeddata',done,{once:true});video.addEventListener('error',error,{once:true});video.load();
    });
  }
  function seek(time){
    if(Math.abs(video.currentTime-time)<.00001&&video.readyState>=2)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{clean();reject(Error('Um quadro não respondeu.'))},7000);
      function clean(){clearTimeout(timer);video.removeEventListener('seeked',done);video.removeEventListener('error',error)}
      function done(){clean();resolve()}
      function error(){clean();reject(Error('Não foi possível preparar o quadro.'))}
      video.addEventListener('seeked',done,{once:true});video.addEventListener('error',error,{once:true});
      try{video.currentTime=time}catch(e){clean();reject(e)}
    });
  }
  async function verifyHTML(id){
    for(let i=0;i<N;i++){
      if(id!==run||disposed)return;
      await seek(Math.min((i+.5)/meta.fps,video.duration-.001));
      if(!video.videoWidth||video.readyState<2)throw Error('Quadro não disponível.');
      markVerified(i+1);
      if(i%12===0)await pause();
    }
    await seek(.5/meta.fps);
    video.addEventListener('seeked',onSeek);preparing=false;
  }
  function onSeek(){if(ready&&!preparing)report(requested)}
  function report(index){
    pending=false;painted=index;renders++;
    canvas.dataset.frame=String(index);canvas.dataset.renders=String(renders);
    (fallback?video:canvas).classList.add('ready');
    if(index!==Math.round(position*(N-1)))request();
  }
  function request(){if(!raf&&ready&&!disposed&&!document.hidden)raf=requestAnimationFrame(tick)}
  function show(index){
    if(pending||requested===index)return;
    requested=index;pending=true;
    if(fallback){
      const time=Math.min((index+.5)/meta.fps,video.duration-.001);
      if(Math.abs(video.currentTime-time)<.00001){report(index);return}
      try{video.currentTime=time}catch{pending=false}
    }else{
      const sample=meta.samples[index];
      try{decoder.decode(new EncodedVideoChunk({type:'key',timestamp:sample.timestamp,data:bytes.subarray(sample.offset,sample.offset+sample.size)}))}
      catch{fail('O vídeo não pôde continuar. Tente carregá-lo novamente.')}
    }
  }
  function tick(now){
    raf=0;if(!ready||disposed)return;
    const dt=last?Math.min((now-last)/1000,.05):1/60;last=now;
    position=reduced.matches?target:position+(target-position)*(1-Math.exp(-dt/.09));
    if(Math.abs(position-target)<.00001)position=target;
    show(Math.round(position*(N-1)));canvas.dataset.position=position.toFixed(5);
    if(Math.abs(position-target)>.00001)request();
  }
  function fail(message){
    ready=false;pending=false;preparing=false;
    cancelAnimationFrame(raf);raf=0;canvas.classList.remove('ready');video.classList.remove('ready');video.hidden=true;
    emit({phase:'error',message,verified,progress:state.progress});
    canvas.dataset.mode='error';
  }
  async function start(){
    const id=++run;ready=false;preparing=true;verified=0;requested=-1;painted=-1;fallback=false;
    video.removeEventListener('seeked',onSeek);
    if(decoder&&decoder.state!=='closed')decoder.close();decoder=null;
    if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null}
    video.hidden=true;resize();emit({phase:'download',progress:0,verified:0,message:'Carregando o vídeo'});
    try{
      bytes=await readMovie();if(id!==run||disposed)return;
      validateIndex();emit({phase:'prepare',progress:.68,message:'Preparando os quadros'});
      let config={codec:meta.codec,codedWidth:meta.width,codedHeight:meta.height,description:Uint8Array.from(atob(meta.description),c=>c.charCodeAt(0)),optimizeForLatency:true,hardwareAcceleration:'no-preference'};
      let supported=false;
      if(bytes&&ctx&&typeof VideoDecoder==='function')try{supported=(await VideoDecoder.isConfigSupported(config)).supported}catch{}
      if(supported){
        try{await verifyWebCodecs(config,id)}
        catch{if(decoder&&decoder.state!=='closed')decoder.close();decoder=null;verifyOutput=null;await loadHTML();await verifyHTML(id)}
      }else{await loadHTML();await verifyHTML(id)}
      if(id!==run||disposed)return;
      canvas.dataset.mode=fallback?'video':'webcodecs';canvas.dataset.ready='true';
      ready=true;preparing=false;requested=-1;position=target;show(Math.round(position*(N-1)));
      if(!fallback)await decoder.flush();
      else{video.classList.add('ready');report(Math.round(position*(N-1)))}
      emit({phase:'ready',progress:1,verified:N,message:'Viagem pronta para explorar'});
      document.dispatchEvent(new CustomEvent('coplaf:film-ready'));
    }catch(error){if(id===run&&!disposed)fail(error.message||'Não foi possível carregar a experiência.')}
  }
  window.COPLAF_FILM={
    setProgress(p){target=Math.max(0,Math.min(1,p));request()},resize,retry:start,
    get ready(){return ready},get frame(){return painted},get rendered(){return renders},get verified(){return verified},get total(){return N},
    get mode(){return canvas.dataset.mode||'preparing'},get state(){return {...state}}
  };
  document.addEventListener('visibilitychange',()=>{last=0;request()});
  addEventListener('pagehide',e=>{cancelAnimationFrame(raf);raf=0;if(!e.persisted){disposed=true;controller.abort();if(decoder&&decoder.state!=='closed')decoder.close();if(blobUrl)URL.revokeObjectURL(blobUrl)}});
  addEventListener('pageshow',()=>{last=0;request()});
  start();
})();
