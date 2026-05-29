(function () {
  'use strict';

  var navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-label', { opacity: 0, y: 30, duration: 0.8, delay: 0.3, ease: 'power3.out' });
  gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, delay: 0.5, ease: 'power3.out' });
  gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.8, delay: 0.8, ease: 'power3.out' });
  gsap.from('.hero-divider', { opacity: 0, scaleX: 0, duration: 0.6, delay: 1, ease: 'power3.out' });
  gsap.from('.hero-tagline', { opacity: 0, y: 20, duration: 0.8, delay: 1.1, ease: 'power3.out' });
  gsap.from('.hero-cta-group', { opacity: 0, y: 20, duration: 0.8, delay: 1.3, ease: 'power3.out' });
  gsap.from('.scroll-indicator', { opacity: 0, y: 20, duration: 0.8, delay: 1.8, ease: 'power3.out' });

  gsap.utils.toArray('.section').forEach(function (section) {
    gsap.fromTo(section,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
      }
    );
  });

  gsap.utils.toArray('.service-card').forEach(function (card, i) {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%' }
      }
    );
  });

  gsap.utils.toArray('.process-card').forEach(function (card, i) {
    gsap.fromTo(card,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%' }
      }
    );
  });

  var statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(function (el) {
    var target = parseInt(el.dataset.target, 10);
    var obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: function () {
        el.textContent = Math.round(obj.val);
      }
    });
  });

  gsap.utils.toArray('.stat-item').forEach(function (item, i) {
    gsap.fromTo(item,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.6, delay: i * 0.2, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 85%' }
      }
    );
  });

  var ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    gsap.fromTo('.cta-content',
      { opacity: 0, scale: 0.95 },
      {
        opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ctaSection, start: 'top 75%' }
      }
    );
  }

})();
