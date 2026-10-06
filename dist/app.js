/* Editorial journey, accessible service explorer, stable map and depth-connected network. */
(() => {
  'use strict';
  const config=window.COPLAF_CONTENT,geo=window.COPLAF_GEOGRAPHY;
  const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=n=>Math.min(1,Math.max(0,n));
  const hero=$('.hero-scroll'),stage=$('.hero-stage'),network=$('#rede'),cards=$('.network-cards');
  const identity=$('.coplaf-identity'),principles=$$('.identity-principles article');
  const stops=[0,.29,.55,.86];
  const navLinks=$$('.site-header nav a'),navSections=navLinks.map(a=>$(a.getAttribute('href')));
  let raf=0,entityIndex=-1,manualEntity=false,serviceIndex=-1,serviceRequest=0,chapterIndex=-1;
  function progress(section,height=innerHeight){return clamp(-section.getBoundingClientRect().top/Math.max(1,section.offsetHeight-height))}
  function animateContent(el){if(reduced.matches)return;el.classList.remove('refreshing');void el.offsetWidth;el.classList.add('refreshing')}
  function update(){
    raf=0;
    const p=progress(hero,stage.offsetHeight);
    window.COPLAF_FILM.setProgress(p);
    const chapter=p<.205?0:p<.415?1:p<.725?2:3;
    $$('.journey-chapter').forEach((el,i)=>{
      let visibility=i===chapter?1:0;
      if(i===chapter&&!reduced.matches){
        const start=i===0?0:i===1?.205:i===2?.415:.725,end=i===0?.205:i===1?.415:i===2?.725:1;
        visibility=Math.min(i===0?1:clamp((p-start)/.045),i===3?1:clamp((end-p)/.045));
      }
      el.style.opacity=String(visibility);
      el.style.transform='translateY(calc(-44% + '+((1-visibility)*22)+'px))';
      el.classList.toggle('is-active',i===chapter);
      el.inert=i!==chapter;
      el.setAttribute('aria-hidden',String(i!==chapter));
    });
    if(chapter!==chapterIndex){
      chapterIndex=chapter;
      $$('[data-jump]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.jump)===chapter)));
    }
    $('.journey-progress span').style.transform='scaleX('+p+')';
    $('.reading-progress span').style.transform='scaleX('+clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))+')';
    $('.site-header').classList.toggle('scrolled',scrollY>70);
    let activeNav=-1;
    navSections.forEach((section,i)=>{if(section.getBoundingClientRect().top<innerHeight*.4)activeNav=i});
    navLinks.forEach((a,i)=>{a.classList.toggle('current',i===activeNav);if(i===activeNav)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
    const n=progress(network);
    if(!manualEntity)setEntity([3,0,1,2,3][Math.min(4,Math.floor(n*5))]);
    if(!reduced.matches){
      cards.style.setProperty('--rotate-x',(3-n*6)+'deg');
      cards.style.setProperty('--rotate-y',(-4+n*8)+'deg');
      const r=identity.getBoundingClientRect();
      if(r.bottom>-100&&r.top<innerHeight+100){
        const position=clamp((innerHeight-r.top)/(innerHeight+r.height));
        identity.style.setProperty('--campus-y',((position-.5)*48).toFixed(2)+'px');
        principles.forEach((card,i)=>card.style.setProperty('--cascade-y',((1-position)*(i?40:18)).toFixed(2)+'px'));
      }
    }else{
      identity.style.setProperty('--campus-y','0px');
      principles.forEach(card=>card.style.setProperty('--cascade-y','0px'));
    }
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(update)}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{window.COPLAF_FILM.resize();schedule()},{passive:true});
  document.addEventListener('coplaf:entered',schedule);reduced.addEventListener('change',schedule);
  $$('[data-jump]').forEach(button=>button.addEventListener('click',()=>{
    const y=hero.offsetTop+stops[Number(button.dataset.jump)]*(hero.offsetHeight-stage.offsetHeight);
    scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'});
  }));
  const menu=$('.menu-toggle'),header=$('.site-header');
  function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu')}
  menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.classList.contains('menu-open')){closeMenu();menu.focus()}});

  /* One interruptible scroll animation; it drives the film through the usual scroll events. */
  let navAnimation=0,previousScrollBehavior='';
  function stopNavigation(){
    if(!navAnimation)return;
    cancelAnimationFrame(navAnimation);navAnimation=0;
    document.documentElement.style.scrollBehavior=previousScrollBehavior;
    header.classList.remove('is-navigating');
  }
  function navigateTo(target,keyboard=false){
    stopNavigation();closeMenu();
    const top=Math.max(0,Math.min(target.getBoundingClientRect().top+scrollY-header.offsetHeight-22,document.documentElement.scrollHeight-innerHeight));
    const from=scrollY,distance=top-from;
    function focusTarget(){
      if(!keyboard)return;
      const heading=target.querySelector('h1,h2')||target;
      heading.tabIndex=-1;heading.focus({preventScroll:true});
    }
    if(reduced.matches||Math.abs(distance)<2){scrollTo({top,behavior:'instant'});focusTarget();return}
    previousScrollBehavior=document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior='auto';header.classList.add('is-navigating');
    const duration=Math.min(1500,Math.max(650,500+Math.abs(distance)*.12));
    let started;
    function move(now){
      if(started===undefined)started=now;
      const p=clamp((now-started)/duration),ease=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
      scrollTo({top:from+distance*ease,behavior:'instant'});
      if(p<1)navAnimation=requestAnimationFrame(move);
      else{stopNavigation();focusTarget();schedule()}
    }
    navAnimation=requestAnimationFrame(move);
  }
  $$('a[href^="#"]').filter(a=>!a.classList.contains('skip-link')).forEach(a=>a.addEventListener('click',e=>{
    if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const hash=a.getAttribute('href'),target=document.getElementById(hash.slice(1));if(!target)return;
    e.preventDefault();if(location.hash!==hash)history.pushState(null,'',hash);
    navigateTo(target,e.detail===0);
  }));
  addEventListener('wheel',stopNavigation,{passive:true});
  addEventListener('touchstart',stopNavigation,{passive:true});
  addEventListener('pointerdown',stopNavigation,{passive:true});
  addEventListener('popstate',stopNavigation);
  addEventListener('keydown',e=>{if(['Escape','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))stopNavigation()});
  reduced.addEventListener('change',stopNavigation);

  /* Manual activation preserves the user's selection, with arrow-key navigation. */
  const serviceList=$('.service-list'),panel=$('#service-panel');
  const imageAlts={'tree.webp':'Copa de uma árvore vista de baixo','forest-new.webp':'Floresta e montanhas em uma paisagem panorâmica','tractor.webp':'Trator em um campo verde','campus.webp':'Edifício de Ciências Florestais da UFPR'};
  function setService(index,focus=false){
    if(index===serviceIndex){if(focus)$('#service-tab-'+index).focus();return}
    serviceIndex=index;const item=config.services[index];
    animateContent($('.service-detail'));
    $$('.service-tab').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1});
    panel.setAttribute('aria-labelledby','service-tab-'+index);
    panel.classList.toggle('preserve-photo',Boolean(item.preserveImage));
    $('#service-name').textContent=item.name;$('#service-description').textContent=item.description;$('#service-category').textContent=item.category.toUpperCase();
    $('.service-number').textContent=String(index+1).padStart(2,'0')+' / 09';
    $('#service-tags').replaceChildren(...item.tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));
    const serial=++serviceRequest;const image=$('#service-image');
    panel.classList.add('image-changing');
    image.src='assets/'+item.image;image.alt=item.alt||imageAlts[item.image]||item.name;
    image.style.objectPosition=item.position||'50% 50%';
    image.decode().catch(()=>{}).finally(()=>{if(serial===serviceRequest)panel.classList.remove('image-changing')});
    if(focus)$('#service-tab-'+index).focus();
  }
  config.services.forEach((item,i)=>{
    const button=document.createElement('button');button.type='button';button.id='service-tab-'+i;button.className='service-tab';
    button.setAttribute('role','tab');button.setAttribute('aria-controls','service-panel');button.setAttribute('aria-selected','false');button.tabIndex=-1;
    button.setAttribute('aria-label',item.name);button.classList.toggle('preserve-photo',Boolean(item.preserveImage));
    const thumbnail=document.createElement('img');thumbnail.className='service-thumbnail';thumbnail.src='assets/'+item.image;
    thumbnail.alt='';thumbnail.loading='lazy';thumbnail.decoding='async';thumbnail.width=497;thumbnail.height=497;
    thumbnail.style.objectPosition=item.position||'50% 50%';
    const label=document.createElement('div');label.className='service-tab-label';
    const number=document.createElement('span');number.className='service-tab-number';number.textContent=String(i+1).padStart(2,'0');number.setAttribute('aria-hidden','true');
    const title=document.createElement('strong');title.textContent=item.name;
    const arrow=document.createElement('span');arrow.className='service-tab-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
    label.append(number,title,arrow);button.append(thumbnail,label);button.addEventListener('click',e=>{
      setService(i);
      if(e.detail>0&&matchMedia('(max-width:800px)').matches)navigateTo(panel);
    });
    button.addEventListener('keydown',e=>{
      let next=i;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%config.services.length;
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i-1+config.services.length)%config.services.length;
      else if(e.key==='Home')next=0;else if(e.key==='End')next=config.services.length-1;else return;
      e.preventDefault();setService(next,true);
    });serviceList.append(button);
  });setService(0);

  /* A cartographic connection atlas. Selection never triggers a burst, ripple or zoom. */
  const svg=$('#brazil-map'),NS='http://www.w3.org/2000/svg';
  const project=([lng,lat])=>[(lng+74.5)*13.1+25,(5.7-lat)*13.1+12];
  function node(name,attrs={}){const el=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);return el}
  function selectState(code){
    const state=geo.states.find(s=>s[0]===code);if(!state)return;
    animateContent($('.map-detail'));svg.querySelectorAll('.map-route').forEach(p=>p.classList.toggle('active',p.dataset.destination===code));
    svg.querySelectorAll('.map-state,.map-df-label').forEach(path=>{const active=path.dataset.code===code;path.classList.toggle('selected',active);path.setAttribute('aria-pressed',String(active))});
    const isPR=code==='PR',visited=config.visitedStates.includes(code);
    $('#state-code').textContent=code;$('#state-name').textContent=state[1];$('#state-region').textContent='REGIÃO '+state[2];
    $('#state-description').textContent=isPR?'É no Paraná que nossas raízes se aprofundam, com projetos especialmente na Região Metropolitana de Curitiba.':visited?state[1]+' faz parte dos nossos horizontes. Paisagens diferentes, conectadas pelo conhecimento florestal.':'Cada território tem seus próprios desafios. Converse com a COPLAF para avaliar as possibilidades de um projeto em '+state[1]+'.';
    $('#state-stat').innerHTML=isPR?'93<span>%</span>':visited?'08':'BR';
    $('#state-stat-label').innerHTML=isPR?'dos projetos apresentados<br>realizados no Paraná':visited?'estados na nossa<br>trajetória':'novos territórios,<br>novas possibilidades';
    $('#city-tags').replaceChildren(...(isPR?['Curitiba','Região Metropolitana']:visited?['Estado destacado','Atuação nacional']:['Vamos conversar']).map(t=>{const s=document.createElement('span');s.textContent=t;return s}));
    $('[data-state="PR"]').classList.toggle('active',isPR);$('#national-view').classList.remove('active');$('#state-select').value=code;svg.dataset.selected=code;
  }
  function national(){
    animateContent($('.map-detail'));svg.querySelectorAll('.map-route').forEach(p=>p.classList.remove('active'));
    svg.querySelectorAll('.map-state,.map-df-label').forEach(p=>{p.classList.remove('selected');p.setAttribute('aria-pressed','false')});
    $('#state-code').textContent='BR';$('#state-name').textContent='Brasil';$('#state-region').textContent='DE NORTE A SUL';
    $('#state-description').textContent='Nosso percurso conecta oito estados brasileiros e 29 cidades, incluindo 22 cidades no Paraná.';
    $('#state-stat').textContent='29';$('#state-stat-label').innerHTML='cidades visitadas<br>na nossa trajetória';
    $('#city-tags').replaceChildren(...['8 estados','22 cidades no Paraná'].map(t=>{const s=document.createElement('span');s.textContent=t;return s}));
    $('#national-view').classList.add('active');$('[data-state="PR"]').classList.remove('active');$('#state-select').value='BR';svg.dataset.selected='BR';
  }
  const brazilOption=document.createElement('option');brazilOption.value='BR';brazilOption.textContent='Brasil';$('#state-select').append(brazilOption);
  [...geo.states].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR')).forEach(state=>{const option=document.createElement('option');option.value=state[0];option.textContent=state[1];$('#state-select').append(option)});
  let dfAnnotation;
  geo.states.forEach((state,i)=>{
    const coords=geo.polygons[state[0]],d=coords.map((point,j)=>{const[x,y]=project(point);return (j?'L':'M')+x.toFixed(1)+','+y.toFixed(1)}).join('')+'Z';
    const path=node('path',{d,class:'map-state'+(config.visitedStates.includes(state[0])?' visited':''),'data-code':state[0],role:'button',tabindex:'0','aria-label':'Explorar '+state[1],'aria-pressed':'false','stroke-linejoin':'round'});
    const title=node('title');title.textContent=state[1];path.append(title);
    path.addEventListener('click',()=>selectState(state[0]));
    function hint(event){
      const tooltip=$('#map-tooltip'),board=$('.map-board').getBoundingClientRect(),r=path.getBoundingClientRect();
      tooltip.replaceChildren();
      const title=document.createElement('strong');title.textContent=state[1];
      const note=document.createElement('small');note.textContent=config.visitedStates.includes(state[0])?'Estado destacado pela COPLAF':'Explore este território';
      tooltip.append(title,note);tooltip.hidden=false;
      const x=event?.clientX?event.clientX-board.left:r.left+r.width/2-board.left;
      const y=event?.clientY?event.clientY-board.top:r.top-board.top;
      tooltip.style.left=Math.max(8,Math.min(board.width-tooltip.offsetWidth-12,x+12))+'px';
      tooltip.style.top=Math.max(8,Math.min(board.height-tooltip.offsetHeight-12,y-55))+'px';
    }
    path.addEventListener('pointerenter',hint);path.addEventListener('pointermove',hint);
    path.addEventListener('focus',()=>hint());path.addEventListener('pointerleave',()=>$('#map-tooltip').hidden=true);path.addEventListener('blur',()=>$('#map-tooltip').hidden=true);
    path.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();selectState(state[0])}
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:-1)+geo.states.length)%geo.states.length;svg.querySelector('[data-code="'+geo.states[next][0]+'"]').focus()}
    });svg.append(path);
    if(state[0]==='DF'){
      const[x,y]=project([state[3],state[4]]);
      dfAnnotation=node('g',{class:'map-df-annotation'});
      dfAnnotation.append(node('path',{d:'M'+x+','+y+' L'+(x+13)+','+(y-18)+' L'+(x+28)+','+(y-18),class:'map-df-callout','aria-hidden':'true'}));
      const label=node('text',{x:x+34,y:y-13,class:'map-label map-df-label','data-code':'DF',role:'button',tabindex:'0','aria-label':'Explorar Distrito Federal','aria-pressed':'false'});
      label.textContent='DF';label.addEventListener('click',()=>selectState('DF'));
      label.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectState('DF')}});
      dfAnnotation.append(label);
    }else if(!['ES','RJ','RN','PB','AL','SE'].includes(state[0])){
      const[x,y]=project([state[3],state[4]]),label=node('text',{x,y,class:'map-label','data-label':state[0]});label.textContent=state[0];svg.append(label);
    }
  });
  const[cityX,cityY]=project([-49.27,-25.43]);
  const routes=node('g',{class:'map-routes','aria-hidden':'true'});
  config.visitedStates.filter(code=>code!=='PR').forEach(code=>{
    const destination=geo.states.find(s=>s[0]===code),[labelX,labelY]=project([destination[3],destination[4]]);
    const x=labelX+(['GO','SP'].includes(code)?-22:22),y=labelY-4;
    const bend=code==='RS'?-45:Math.max(35,Math.abs(x-cityX)*.55);
    const route=node('path',{d:'M'+cityX+','+cityY+' Q'+((cityX+x)/2+bend)+','+((cityY+y)/2-25)+' '+x+','+y,class:'map-route','data-destination':code});
    routes.append(route,node('circle',{cx:x,cy:y,r:3,class:'map-route-dot','data-destination':code}));
  });
  svg.append(routes,node('circle',{cx:cityX,cy:cityY,r:11,class:'map-origin-ring'}),node('circle',{cx:cityX,cy:cityY,r:6,class:'map-origin-ring'}));
  svg.append(node('circle',{cx:cityX,cy:cityY,r:3,class:'map-city'}));
  const city=node('text',{x:cityX+8,y:cityY+12,class:'map-city-label'});city.textContent='Curitiba';svg.append(city);
  if(dfAnnotation)svg.append(dfAnnotation);
  $('#state-select').addEventListener('change',e=>e.target.value==='BR'?national():selectState(e.target.value));
  $('[data-state="PR"]').addEventListener('click',()=>selectState('PR'));$('#national-view').addEventListener('click',national);selectState('PR');

  function setEntity(index,manual=false){
    if(manual)manualEntity=true;
    if(index===entityIndex)return;entityIndex=index;const item=config.entities[index];
    animateContent($('.entity-description'));
    $('#entity-level').textContent=item.level;$('#entity-title').textContent=item.name;$('#entity-description').textContent=item.description;$('#entity-link').href=item.url;
    $('#entity-link').setAttribute('aria-label','Acessar canal oficial de '+item.name);
    $$('[data-entity]').forEach((button,i)=>{const active=i===index;button.setAttribute('aria-pressed',String(active));button.closest('.entity-card').classList.toggle('active',active)});
    cards.dataset.selected=String(index);
  }
  $$('[data-entity]').forEach(button=>button.addEventListener('click',()=>setEntity(Number(button.dataset.entity),true)));
  network.addEventListener('wheel',()=>{manualEntity=false},{passive:true});network.addEventListener('touchmove',()=>{manualEntity=false},{passive:true});setEntity(3);

  /* Pointer depth on the photo panel; touch and reduced-motion stay steady. */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    const surface=$('.depth-surface');
    surface.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=surface.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;surface.style.transform='rotateX('+(-y*4)+'deg) rotateY('+(x*5)+'deg)'});
    surface.addEventListener('pointerleave',()=>surface.style.transform='');
  }
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    const board=$('.map-board');
    board.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=board.getBoundingClientRect();board.style.setProperty('--map-tilt-x',((.5-(e.clientY-r.top)/r.height)*2)+'deg');board.style.setProperty('--map-tilt-y',(((e.clientX-r.left)/r.width-.5)*2.5)+'deg')});
    board.addEventListener('pointerleave',()=>{board.style.setProperty('--map-tilt-x','0deg');board.style.setProperty('--map-tilt-y','0deg')});
    $$('.entity-card').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        if(reduced.matches)return;
        const r=card.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width),y=clamp((e.clientY-r.top)/r.height);
        card.style.setProperty('--entity-pointer-x',((.5-y)*8).toFixed(2)+'deg');
        card.style.setProperty('--entity-pointer-y',((x-.5)*10).toFixed(2)+'deg');
        card.style.setProperty('--glow-x',(x*100).toFixed(1)+'%');card.style.setProperty('--glow-y',(y*100).toFixed(1)+'%');
      });
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--entity-pointer-x','0deg');card.style.setProperty('--entity-pointer-y','0deg')});
    });
  }
  if('IntersectionObserver' in window){
    const view=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.15});
    $$('.map-board,.contact').forEach(el=>view.observe(el));
  }
  if('IntersectionObserver' in window&&!reduced.matches){
    cards.classList.add('motion-ready');
    const networkEntrance=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){cards.classList.add('is-ready');networkEntrance.disconnect()}},{threshold:.12});
    networkEntrance.observe(cards);
    const reveal=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target)}},{threshold:.12});
    $$('.about-heading,.about-copy,.identity-photo,.identity-principles article,.section-heading,.service-explorer,.horizon-stats,.process-grid article,.contact-layout').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--reveal-delay',(i%2)*100+'ms');reveal.observe(el)});
  }
  window.COPLAF_DEMO={get frame(){return window.COPLAF_FILM.frame},get loadedFrames(){return window.COPLAF_FILM.verified},get renderer(){return 'CSS perspective'},setEntity,selectState,setService,get chapter(){return chapterIndex},get navigating(){return Boolean(navAnimation)}};
  schedule();
})();
