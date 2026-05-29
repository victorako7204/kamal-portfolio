(function () {
  'use strict';

  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.about-header h1', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' });

  gsap.from('.about-avatar', {
    opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)',
    scrollTrigger: { trigger: '.about-bio-block', start: 'top 80%' }
  });

  gsap.from('.about-bio-text p', {
    opacity: 0, y: 30, duration: 0.7, stagger: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-bio-text', start: 'top 80%' }
  });

  gsap.from('.bento-heading', {
    opacity: 0, y: 30, duration: 0.6, ease: 'power3.out',
    scrollTrigger: { trigger: '.bento-section', start: 'top 80%' }
  });

  gsap.from('.bento-card', {
    opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.bento-grid', start: 'top 80%' }
  });

  var statNumbers = document.querySelectorAll('.bento-stat');
  statNumbers.forEach(function (el) {
    var text = el.textContent;
    var match = text.match(/(\d+)/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = text.replace(match[1], '');
    var obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: function () {
        el.textContent = Math.round(obj.val) + suffix;
      }
    });
  });

})();
