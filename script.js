(() => {
  'use strict';
  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.getElementById('motion-toggle');
  const label = document.getElementById('motion-label');
  const art = document.querySelector('.art-frame');
  const hero = document.querySelector('.hero-stage');
  const cursor = document.querySelector('.project-cursor');
  let paused = motionQuery.matches;
  let pointerPending = false;
  let pointerX = 0, pointerY = 0;
  let artX = 0, artY = 0;
  let inHero = false;
  art.addEventListener('animationend', event => {
    if (event.target === art) art.style.animation = 'none';
  });
  function applyMotion() {
    root.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    label.textContent = paused ? 'Enable motion' : 'Pause motion';
    cursor.classList.remove('is-visible');
    if (paused) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      document.querySelectorAll('.line > span').forEach(el => { el.style.animation = 'none'; });
      art.style.animation = 'none';
    }
  }
  applyMotion();
  toggle.addEventListener('click', () => { paused = !paused; applyMotion(); });
  motionQuery.addEventListener('change', event => { paused = event.matches; applyMotion(); });
  if ('IntersectionObserver' in window && !paused) {
    root.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .07 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  if (finePointer.matches) {
    document.addEventListener('pointermove', event => {
      if (paused) return;
      pointerX = event.clientX; pointerY = event.clientY;
      if (!pointerPending) {
        pointerPending = true;
        requestAnimationFrame(() => {
          cursor.style.left = `${pointerX}px`;
          cursor.style.top = `${pointerY}px`;
          if (inHero) art.style.transform = `translate(${artX}px, ${artY}px) rotate(${artX / 8}deg)`;
          pointerPending = false;
        });
      }
    }, { passive: true });
    hero.addEventListener('pointermove', event => {
      if (paused) return;
      const bounds = hero.getBoundingClientRect();
      artX = ((event.clientX - bounds.left) / bounds.width - .5) * 28;
      artY = ((event.clientY - bounds.top) / bounds.height - .5) * 24;
      inHero = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { inHero = false; art.style.transform = ''; });
    document.querySelectorAll('.project-cover').forEach(link => {
      link.addEventListener('pointerenter', () => { if (!paused) cursor.classList.add('is-visible'); });
      link.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    });
  }
  document.querySelectorAll('.project-photo').forEach(img => {
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
