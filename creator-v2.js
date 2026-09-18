(() => {
  'use strict';
  const scene = document.querySelector('.creator-scene');
  const depth = document.querySelector('.creator-depth');
  if (!scene || !depth) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let queued = false;
  let rx = 0, ry = 0;
  const paused = () => reduced.matches || document.documentElement.classList.contains('motion-paused') || !fine.matches;
  const reset = () => {
    rx = 0; ry = 0;
    depth.style.setProperty('--creator-rx', '0deg');
    depth.style.setProperty('--creator-ry', '0deg');
  };
  scene.addEventListener('pointermove', event => {
    if (paused()) return;
    const box = scene.getBoundingClientRect();
    ry = Math.max(-8, Math.min(8, ((event.clientX - box.left) / box.width - .5) * 16));
    rx = Math.max(-5, Math.min(5, -((event.clientY - box.top) / box.height - .5) * 10));
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (paused()) { reset(); return; }
      depth.style.setProperty('--creator-rx', `${rx.toFixed(2)}deg`);
      depth.style.setProperty('--creator-ry', `${ry.toFixed(2)}deg`);
    });
  }, { passive: true });
  scene.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  new MutationObserver(() => { if (paused()) reset(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
