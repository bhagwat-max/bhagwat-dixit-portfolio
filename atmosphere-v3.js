(() => {
  'use strict';
  const title = document.getElementById('hero-title');
  const stage = document.querySelector('.hero-stage');
  if (!title || !stage) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const disabled = () => reduced.matches || !fine.matches || root.classList.contains('motion-paused');
  let frame = 0, rx = 0, ry = 0;
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0; rx = 0; ry = 0;
    title.style.removeProperty('--title-rx');
    title.style.removeProperty('--title-ry');
  }
  stage.addEventListener('pointermove', event => {
    if (disabled()) return;
    const box = stage.getBoundingClientRect();
    rx = Math.max(-3, Math.min(3, (.5 - (event.clientY - box.top) / box.height) * 6));
    ry = Math.max(-4, Math.min(4, ((event.clientX - box.left) / box.width - .5) * 8));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (disabled()) return reset();
      title.style.setProperty('--title-rx', `${rx.toFixed(2)}deg`);
      title.style.setProperty('--title-ry', `${ry.toFixed(2)}deg`);
    });
  }, { passive: true });
  stage.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', reset);
  new MutationObserver(() => { if (disabled()) reset(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
