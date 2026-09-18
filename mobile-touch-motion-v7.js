(() => {
  'use strict';
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 700px)');
  const stage = document.querySelector('.hero-stage');
  const title = document.getElementById('hero-title');
  const scene = document.querySelector('.creator-scene');
  const art = scene?.querySelector('.art-frame');
  const depth = scene?.querySelector('.creator-depth');
  if (!stage || !title || !art || !depth) return;

  let frame = 0;
  let active = false;
  let px = .5;
  let py = .5;
  let releaseTimer = 0;
  const stopped = () => root.classList.contains('motion-paused');
  const clamp = (min, value, max) => Math.max(min, Math.min(max, value));

  function paint() {
    frame = 0;
    if (!mobile.matches || !active || stopped()) return;

    /* These ranges are the same values used by the laptop mouse parallax. */
    const titleRx = clamp(-3, (.5 - py) * 6, 3);
    const titleRy = clamp(-4, (px - .5) * 8, 4);
    const artX = (px - .5) * 28;
    const artY = (py - .5) * 24;
    const creatorRx = clamp(-5, -(py - .5) * 10, 5);
    const creatorRy = clamp(-8, (px - .5) * 16, 8);

    title.style.setProperty('--touch-title-rx', `${titleRx.toFixed(2)}deg`);
    title.style.setProperty('--touch-title-ry', `${titleRy.toFixed(2)}deg`);
    title.style.setProperty('--touch-title-scale', '1.006');
    art.style.setProperty('--mobile-art-x', `${artX.toFixed(2)}px`);
    art.style.setProperty('--mobile-art-y', `${artY.toFixed(2)}px`);
    art.style.setProperty('--mobile-art-r', `${(artX / 8).toFixed(2)}deg`);
    depth.style.setProperty('--creator-rx', `${creatorRx.toFixed(2)}deg`);
    depth.style.setProperty('--creator-ry', `${creatorRy.toFixed(2)}deg`);
  }

  function queuePaint() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function readTouch(touch) {
    if (!mobile.matches || stopped()) return;
    const box = stage.getBoundingClientRect();
    px = clamp(0, (touch.clientX - box.left) / Math.max(1, box.width), 1);
    py = clamp(0, (touch.clientY - box.top) / Math.max(1, box.height), 1);
    active = true;
    clearTimeout(releaseTimer);
    root.classList.add('hero-touch-active');
    queuePaint();
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    active = false;
    root.classList.remove('hero-touch-active');
    title.style.setProperty('--touch-title-rx', '0deg');
    title.style.setProperty('--touch-title-ry', '0deg');
    title.style.setProperty('--touch-title-scale', '1');
    art.style.setProperty('--mobile-art-x', '0px');
    art.style.setProperty('--mobile-art-y', '0px');
    art.style.setProperty('--mobile-art-r', '0deg');
    depth.style.setProperty('--creator-rx', '0deg');
    depth.style.setProperty('--creator-ry', '0deg');
  }

  function start(event) {
    const touch = event.touches?.[0];
    if (touch) readTouch(touch);
  }

  function move(event) {
    const touch = event.touches?.[0];
    if (touch && active) readTouch(touch);
  }

  function finish() {
    clearTimeout(releaseTimer);
    releaseTimer = setTimeout(reset, 90);
  }

  function setMode() {
    root.classList.toggle('mobile-touch-v7', mobile.matches);
    if (!mobile.matches || stopped()) reset();
  }

  stage.addEventListener('touchstart', start, { passive:true, capture:true });
  stage.addEventListener('touchmove', move, { passive:true, capture:true });
  stage.addEventListener('touchend', finish, { passive:true, capture:true });
  stage.addEventListener('touchcancel', finish, { passive:true, capture:true });

  /* v6 reset on scroll; repaint after it so scrolling fingers keep control. */
  window.addEventListener('scroll', () => { if (active) queuePaint(); }, { passive:true });
  mobile.addEventListener('change', setMode);
  new MutationObserver(() => { if (stopped()) reset(); }).observe(root, { attributes:true, attributeFilter:['class'] });
  setMode();
})();
