(() => {
  'use strict';
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 700px)');
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const title = document.getElementById('hero-title');
  const scene = document.querySelector('.creator-scene');
  const art = scene?.querySelector('.art-frame');
  const depth = scene?.querySelector('.creator-depth');
  const toggle = document.getElementById('motion-toggle');
  if (!hero || !stage || !title || !art || !depth) return;

  let touchFrame = 0;
  let scrollFrame = 0;
  let active = false;
  let px = .5;
  let py = .5;
  let releaseTimer = 0;
  let autoEnabled = false;
  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));
  const stopped = () => root.classList.contains('motion-paused');

  function enableMobileMotion() {
    if (!mobile.matches || autoEnabled || !toggle) return;
    if (root.classList.contains('motion-paused') && toggle.getAttribute('aria-pressed') === 'true') {
      autoEnabled = true;
      toggle.click();
    }
  }

  function paintTouch() {
    touchFrame = 0;
    if (!mobile.matches || !active || stopped()) return;
    const titleRx = clamp(-3, (.5 - py) * 6, 3);
    const titleRy = clamp(-4, (px - .5) * 8, 4);
    const artX = (px - .5) * 28;
    const artY = (py - .5) * 20;
    title.style.setProperty('--v8-title-rx', `${titleRx.toFixed(2)}deg`);
    title.style.setProperty('--v8-title-ry', `${titleRy.toFixed(2)}deg`);
    art.style.setProperty('--v8-art-x', `${artX.toFixed(2)}px`);
    art.style.setProperty('--v8-art-y', `${artY.toFixed(2)}px`);
    art.style.setProperty('--v8-art-r', `${(artX / 9).toFixed(2)}deg`);
    depth.style.setProperty('--v8-depth-rx', `${clamp(-5, -(py - .5) * 10, 5).toFixed(2)}deg`);
    depth.style.setProperty('--v8-depth-ry', `${clamp(-8, (px - .5) * 16, 8).toFixed(2)}deg`);
  }

  function queueTouch() {
    if (!touchFrame) touchFrame = requestAnimationFrame(paintTouch);
  }

  function readTouch(touch) {
    if (!mobile.matches || stopped()) return;
    const box = stage.getBoundingClientRect();
    px = clamp(0, (touch.clientX - box.left) / Math.max(1, box.width), 1);
    py = clamp(0, (touch.clientY - box.top) / Math.max(1, box.height), 1);
    active = true;
    clearTimeout(releaseTimer);
    root.classList.add('v8-touching');
    queueTouch();
  }

  function resetTouch() {
    cancelAnimationFrame(touchFrame);
    touchFrame = 0;
    active = false;
    root.classList.remove('v8-touching');
    title.style.setProperty('--v8-title-rx', '0deg');
    title.style.setProperty('--v8-title-ry', '0deg');
    art.style.setProperty('--v8-art-x', '0px');
    art.style.setProperty('--v8-art-y', '0px');
    art.style.setProperty('--v8-art-r', '0deg');
    depth.style.setProperty('--v8-depth-rx', '0deg');
    depth.style.setProperty('--v8-depth-ry', '0deg');
  }

  function updateScroll() {
    scrollFrame = 0;
    if (!mobile.matches || stopped()) return;
    const heroBox = hero.getBoundingClientRect();
    const progress = clamp(0, -heroBox.top / Math.max(1, heroBox.height), 1);
    title.style.setProperty('--v8-title-scroll', `${(progress * 8).toFixed(2)}px`);
    art.style.setProperty('--v8-art-scroll', `${(-progress * 12).toFixed(2)}px`);
  }

  function queueScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }

  function setMode() {
    root.classList.toggle('mobile-v8', mobile.matches);
    enableMobileMotion();
    if (!mobile.matches || stopped()) resetTouch();
    queueScroll();
  }

  root.classList.add('v8-boot');
  requestAnimationFrame(() => root.classList.add('v8-ready'));
  stage.addEventListener('touchstart', event => { const touch=event.touches?.[0]; if(touch) readTouch(touch); }, { passive:true, capture:true });
  stage.addEventListener('touchmove', event => { const touch=event.touches?.[0]; if(touch&&active) readTouch(touch); }, { passive:true, capture:true });
  stage.addEventListener('touchend', () => { clearTimeout(releaseTimer); releaseTimer=setTimeout(resetTouch,100); }, { passive:true, capture:true });
  stage.addEventListener('touchcancel', () => { clearTimeout(releaseTimer); releaseTimer=setTimeout(resetTouch,100); }, { passive:true, capture:true });
  window.addEventListener('scroll', () => { queueScroll(); if(active) queueTouch(); }, { passive:true });
  window.addEventListener('resize', queueScroll, { passive:true });
  mobile.addEventListener('change', setMode);
  new MutationObserver(() => { if(stopped()) resetTouch(); }).observe(root,{attributes:true,attributeFilter:['class']});
  setMode();
})();

/* mobile-motion-v9: independent reveals and lightweight project parallax. */
(() => {
  'use strict';
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 700px)');
  const targets = [...document.querySelectorAll('.section-top,.section-heading,.project,.more-work,.about-aside,.about-copy,.service,.contact-main,.contact-bottom,.footer')];
  const covers = [...document.querySelectorAll('.project-cover')];
  let observer;
  let frame = 0;
  const clamp = (min,value,max) => Math.max(min,Math.min(max,value));
  const stopped = () => root.classList.contains('motion-paused');

  targets.forEach((item,index) => {
    item.classList.add('v9-reveal');
    item.style.setProperty('--v9-delay',`${(index%4)*55}ms`);
  });

  function revealAll(){
    targets.forEach(item => item.classList.add('v9-show'));
  }

  function setupReveals(){
    observer?.disconnect();
    if(!mobile.matches||stopped()||!('IntersectionObserver' in window)){
      revealAll();
      return;
    }
    targets.forEach(item => item.classList.remove('v9-show'));
    observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('v9-show');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.08,rootMargin:'0px 0px -7% 0px'});
    targets.forEach(item=>{
      const box=item.getBoundingClientRect();
      if(box.top<innerHeight*.94&&box.bottom>0)item.classList.add('v9-show');
      else observer.observe(item);
    });
  }

  function paintCards(){
    frame=0;
    if(!mobile.matches||stopped())return;
    const viewport=innerHeight||1;
    covers.forEach(cover=>{
      const box=cover.getBoundingClientRect();
      if(box.bottom<0||box.top>viewport)return;
      const offset=clamp(-1,(box.top+box.height/2-viewport/2)/(viewport+box.height),1);
      cover.style.setProperty('--v9-card-y',`${(-offset*7).toFixed(2)}px`);
      cover.style.setProperty('--v9-card-rx',`${(offset*1.4).toFixed(2)}deg`);
      cover.style.setProperty('--v9-image-y',`${(offset*10).toFixed(2)}px`);
      cover.style.setProperty('--v9-inner-y',`${(-offset*5).toFixed(2)}px`);
    });
  }

  function queueCards(){
    if(!frame)frame=requestAnimationFrame(paintCards);
  }

  covers.forEach(cover=>{
    let release=0;
    const press=event=>{
      if(!mobile.matches||stopped())return;
      const touch=event.touches?.[0];
      const x=touch?.clientX??event.clientX;
      const y=touch?.clientY??event.clientY;
      const box=cover.getBoundingClientRect();
      cover.style.setProperty('--v9-touch-x',`${clamp(0,(x-box.left)/box.width*100,100).toFixed(1)}%`);
      cover.style.setProperty('--v9-touch-y',`${clamp(0,(y-box.top)/box.height*100,100).toFixed(1)}%`);
      clearTimeout(release);
      cover.classList.add('v9-pressed');
    };
    const lift=()=>{
      clearTimeout(release);
      release=setTimeout(()=>cover.classList.remove('v9-pressed'),180);
    };
    cover.addEventListener('touchstart',press,{passive:true});
    cover.addEventListener('touchend',lift,{passive:true});
    cover.addEventListener('touchcancel',lift,{passive:true});
  });

  function setMode(){
    setupReveals();
    queueCards();
  }

  window.addEventListener('scroll',queueCards,{passive:true});
  window.addEventListener('resize',queueCards,{passive:true});
  mobile.addEventListener('change',setMode);
  new MutationObserver(()=>{if(stopped())revealAll();}).observe(root,{attributes:true,attributeFilter:['class']});
  requestAnimationFrame(setMode);
})();
