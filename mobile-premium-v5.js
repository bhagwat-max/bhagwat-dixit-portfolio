(() => {
  'use strict';
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('.section-heading, .project, .more-work, .about-aside, .about-copy, .service, .contact-main, .contact-bottom')];
  const covers = [...document.querySelectorAll('.project-cover')];
  let raf = 0;
  const stopped = () => reduced.matches || root.classList.contains('motion-paused');
  const revealAll = () => targets.forEach(item => item.classList.add('is-mobile-visible'));
  targets.forEach(item => item.classList.add('mobile-lux-item'));

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-mobile-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -7% 0px' }) : null;

  function setMode() {
    root.classList.toggle('mobile-luxe', mobile.matches);
    if (!mobile.matches || stopped() || !observer) revealAll();
    else targets.forEach(item => {
      if (!item.classList.contains('is-mobile-visible')) observer.observe(item);
    });
    updateMotion();
  }

  function paintMotion() {
    raf = 0;
    if (!mobile.matches || stopped()) {
      root.style.removeProperty('--mob-title-y');
      root.style.removeProperty('--mob-title-ry');
      root.style.removeProperty('--mob-art-y');
      root.style.removeProperty('--mob-art-ry');
      root.style.removeProperty('--mob-glow-x');
      if (stopped()) revealAll();
      return;
    }
    const y = Math.max(0, window.scrollY);
    const hero = document.querySelector('.hero');
    const heroHeight = hero ? Math.max(1, hero.offsetHeight) : window.innerHeight;
    const progress = Math.min(1, y / heroHeight);
    root.style.setProperty('--mob-title-y', `${(progress * 12).toFixed(2)}px`);
    root.style.setProperty('--mob-title-ry', `${(-1.2 + progress * 2.4).toFixed(2)}deg`);
    root.style.setProperty('--mob-art-y', `${(-progress * 18).toFixed(2)}px`);
    root.style.setProperty('--mob-art-ry', `${(1.4 - progress * 2.8).toFixed(2)}deg`);
    root.style.setProperty('--mob-glow-x', `${(50 + Math.sin(y / 180) * 18).toFixed(2)}%`);
  }

  function updateMotion() {
    if (raf) return;
    raf = requestAnimationFrame(paintMotion);
  }

  covers.forEach(cover => {
    let touchTimer = 0;
    cover.addEventListener('pointerdown', event => {
      if (!mobile.matches || stopped()) return;
      const box = cover.getBoundingClientRect();
      cover.style.setProperty('--touch-x', `${((event.clientX - box.left) / box.width * 100).toFixed(1)}%`);
      cover.style.setProperty('--touch-y', `${((event.clientY - box.top) / box.height * 100).toFixed(1)}%`);
      cover.classList.add('mobile-touch');
      clearTimeout(touchTimer);
      touchTimer = setTimeout(() => cover.classList.remove('mobile-touch'), 480);
    }, { passive: true });
    cover.addEventListener('pointercancel', () => cover.classList.remove('mobile-touch'));
  });

  window.addEventListener('scroll', updateMotion, { passive: true });
  window.addEventListener('resize', updateMotion, { passive: true });
  mobile.addEventListener('change', setMode);
  reduced.addEventListener('change', setMode);
  new MutationObserver(setMode).observe(root, { attributes: true, attributeFilter: ['class'] });
  setMode();
})();
