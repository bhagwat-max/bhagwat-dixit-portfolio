(() => {
  'use strict';
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.getElementById('motion-toggle');
  const scene = document.querySelector('.creator-scene');
  const art = scene?.querySelector('.art-frame');
  const depth = scene?.querySelector('.creator-depth');
  const reveals = [...document.querySelectorAll('.reveal')];
  let autoEnabled = false;
  let frame = 0;
  let observer;

  function forceDesktopMotionOnMobile() {
    if (!mobile.matches || autoEnabled || !reduced.matches || !toggle) return;
    autoEnabled = true;
    if (root.classList.contains('motion-paused') && toggle.getAttribute('aria-pressed') === 'true') toggle.click();
  }

  function setupDesktopReveals() {
    if (!mobile.matches || root.classList.contains('motion-paused')) return;
    root.classList.add('js-motion');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(item => item.classList.add('visible'));
      return;
    }
    observer?.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .07 });
    reveals.forEach(item => {
      const box = item.getBoundingClientRect();
      if (box.top > innerHeight * .92) item.classList.remove('visible');
      if (!item.classList.contains('visible')) observer.observe(item);
    });
  }

  function resetDepth() {
    if (!art || !depth) return;
    art.style.setProperty('--mobile-art-x', '0px');
    art.style.setProperty('--mobile-art-y', '0px');
    art.style.setProperty('--mobile-art-r', '0deg');
    depth.style.setProperty('--creator-rx', '0deg');
    depth.style.setProperty('--creator-ry', '0deg');
  }

  function moveDepth(event) {
    if (!mobile.matches || root.classList.contains('motion-paused') || !scene || !art || !depth) return;
    const box = scene.getBoundingClientRect();
    const px = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
    const py = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const x = (px - .5) * 18;
      const y = (py - .5) * 14;
      art.style.setProperty('--mobile-art-x', `${x.toFixed(2)}px`);
      art.style.setProperty('--mobile-art-y', `${y.toFixed(2)}px`);
      art.style.setProperty('--mobile-art-r', `${(x / 8).toFixed(2)}deg`);
      depth.style.setProperty('--creator-rx', `${(-(py - .5) * 7).toFixed(2)}deg`);
      depth.style.setProperty('--creator-ry', `${((px - .5) * 10).toFixed(2)}deg`);
    });
  }

  function initialize() {
    forceDesktopMotionOnMobile();
    setupDesktopReveals();
    if (!mobile.matches) resetDepth();
  }

  scene?.addEventListener('pointerdown', moveDepth, { passive: true });
  scene?.addEventListener('pointermove', moveDepth, { passive: true });
  scene?.addEventListener('pointerup', resetDepth, { passive: true });
  scene?.addEventListener('pointercancel', resetDepth, { passive: true });
  window.addEventListener('scroll', resetDepth, { passive: true });
  mobile.addEventListener('change', initialize);
  requestAnimationFrame(initialize);
})();
