/* Minimum five-second intro + true readiness of every video frame.
   No silent static fallback: a failed preparation offers retry or an explicit opt-out. */
(() => {
  'use strict';
  const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('intro-pending');
  let active=true,started=0,finished=0,overlay,initialized=false,transition=false,timer;
  const phraseFlows=[
    ['Um instante. Nossa história já vai começar.','Tudo começa com uma pequena semente.','Que bom ter você por aqui.'],
    ['Estamos abrindo caminho para você.','Entre raízes e ideias, há muito para descobrir.','Vamos conhecer novos horizontes juntos.'],
    ['Chegue mais. A COPLAF está de portas abertas.','Conhecimento cresce quando é compartilhado.','Seu próximo projeto pode começar aqui.']
  ];
  let flow=Math.floor(Math.random()*phraseFlows.length),phrase=-1,phraseTimers=[];
  try{
    const previous=Number(sessionStorage.getItem('coplaf-loader-flow'));
    if(sessionStorage.getItem('coplaf-loader-flow')!==null&&Number.isInteger(previous)&&previous>=0&&previous<phraseFlows.length)flow=(previous+1)%phraseFlows.length;
    sessionStorage.setItem('coplaf-loader-flow',String(flow));
  }catch{/* Storage can be unavailable; the random initial flow still works. */}
  function say(message){
    const el=document.getElementById('loader-message');
    if(el.textContent===message)return;
    el.getAnimations().forEach(animation=>animation.cancel());el.textContent=message;
    if(!reduced.matches)el.animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,easing:'ease-out'});
  }
  function stopPhrases(){phraseTimers.forEach(clearTimeout);phraseTimers=[]}
  function startPhrases(){
    stopPhrases();phrase=0;say(phraseFlows[flow][phrase]);
    [1650,3300].forEach((delay,index)=>phraseTimers.push(setTimeout(()=>{
      if(active&&status.phase!=='error'){phrase=index+1;say(phraseFlows[flow][phrase])}
    },delay)));
  }
  let status={phase:'download',progress:0,verified:0,total:596,message:'Preparando a viagem'};
  function expose(){
    root.classList.remove('intro-pending');
    document.querySelectorAll('[data-intro-inert]').forEach(el=>{el.inert=false;el.removeAttribute('data-intro-inert')});
    document.querySelector('main')?.removeAttribute('aria-busy');
  }
  function complete(reason){
    if(!active)return;active=false;finished=performance.now();clearTimeout(timer);stopPhrases();expose();
    if(overlay){overlay.hidden=true;overlay.dataset.phase='complete';overlay.dataset.reason=reason;overlay.dataset.duration=String(Math.round(finished-started));overlay.setAttribute('aria-busy','false')}
    document.removeEventListener('keydown',key);
    if(!reduced.matches){root.classList.add('page-entering');setTimeout(()=>root.classList.remove('page-entering'),1800)}
    if(document.activeElement?.closest('#coplaf-loader'))document.querySelector('.brand')?.focus({preventScroll:true});
    document.dispatchEvent(new CustomEvent('coplaf:entered'));
  }
  function tryEnter(){
    if(!active||!initialized||transition||!window.COPLAF_FILM?.ready||status.verified!==status.total)return;
    const remaining=5000-(performance.now()-started);
    if(remaining>0){clearTimeout(timer);timer=setTimeout(tryEnter,remaining);return}
    transition=true;overlay.dataset.phase='transition';
    if(reduced.matches){complete('ready');return}
    expose();setTimeout(()=>complete('ready'),750);
  }
  function render(){
    if(!initialized||!active)return;
    const percent=Math.floor(Math.min(1,status.progress)*100),error=status.phase==='error';
    overlay.dataset.phase=error?'error':status.phase==='ready'?'ready':status.phase;
    if(error){stopPhrases();say('A conexão fez uma pausa. Vamos tentar de novo?')}
    document.getElementById('loader-percent').textContent=percent+'%';
    const progress=document.getElementById('loader-progress');progress.value=percent;
    progress.setAttribute('aria-valuetext',percent+'% carregado');
    document.querySelector('.loader-actions').hidden=!error;
    document.getElementById('loader-retry').hidden=!error;
    document.getElementById('skip-intro').hidden=!error;
    tryEnter();
  }
  function leave(){
    if(window.COPLAF_FILM?.ready){complete('ready');return}
    document.documentElement.classList.add('film-opted-out');
    document.getElementById('film-notice').hidden=false;complete('without-video');
  }
  function key(e){if(e.key==='Escape'&&active&&status.phase==='error'){e.preventDefault();leave()}}
  function initialize(){
    initialized=true;started=performance.now();overlay=document.getElementById('coplaf-loader');
    if(!overlay){complete('missing-loader');return}
    overlay.hidden=false;
    document.querySelectorAll('.site-header,main,.site-footer,.skip-link').forEach(el=>{if(!el.inert){el.inert=true;el.setAttribute('data-intro-inert','')}});
    document.querySelector('main')?.setAttribute('aria-busy','true');
    document.getElementById('skip-intro').addEventListener('click',leave);
    document.getElementById('loader-retry').addEventListener('click',()=>{transition=false;window.COPLAF_FILM?.retry();startPhrases()});
    document.getElementById('film-retry-inline').addEventListener('click',prepareAgain);
    document.addEventListener('keydown',key);
    status=window.COPLAF_FILM?.state||status;startPhrases();render();
  }
  function prepareAgain(){
    if(active)return;
    active=true;transition=false;started=performance.now();finished=0;
    root.classList.add('intro-pending');root.classList.remove('film-opted-out');
    overlay.hidden=false;overlay.setAttribute('aria-busy','true');
    document.querySelectorAll('.site-header,main,.site-footer,.skip-link').forEach(el=>{if(!el.inert){el.inert=true;el.setAttribute('data-intro-inert','')}});
    document.querySelector('main')?.setAttribute('aria-busy','true');
    document.getElementById('film-notice').hidden=true;document.addEventListener('keydown',key);
    scrollTo({top:0,behavior:'instant'});window.COPLAF_FILM.setProgress(0);window.COPLAF_FILM.retry();
    startPhrases();
  }
  document.addEventListener('coplaf:film-progress',e=>{status=e.detail;if(!active&&status.phase==='error')document.getElementById('film-notice').hidden=false;render()});
  window.COPLAF_INTRO={get active(){return active},get phase(){return overlay?.dataset.phase||'boot'},get duration(){return (finished||performance.now())-started},get phraseFlow(){return flow},get phraseIndex(){return phrase},skip:leave,prepare:prepareAgain};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
  setTimeout(()=>{if(!initialized)complete('boot-timeout')},15000);
  addEventListener('pageshow',e=>{if(e.persisted)complete('restored')});
})();
