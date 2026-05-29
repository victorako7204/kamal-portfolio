(function () {
  'use strict';

  var currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  var budgetMatrix = document.getElementById('budget-matrix');
  var budgetInput = document.getElementById('budget-input');
  var timelineMatrix = document.getElementById('timeline-matrix');
  var timelineInput = document.getElementById('timeline-input');
  var form = document.getElementById('contact-form');
  var status = document.getElementById('contact-status');

  function initMatrix(container, input) {
    if (!container) return;
    container.querySelectorAll('.matrix-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.matrix-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        input.value = btn.dataset.value;
      });
    });
  }

  initMatrix(budgetMatrix, budgetInput);
  initMatrix(timelineMatrix, timelineInput);

  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.contact-header h1', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' });
    gsap.from('.contact-header p', { opacity: 0, y: 20, duration: 0.8, delay: 0.2, ease: 'power3.out' });

    gsap.from('.contact-form .form-group', {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form', start: 'top 80%' }
    });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var email = document.getElementById('email').value.trim();
    var clientName = document.getElementById('clientName').value.trim();

    if (!clientName) {
      status.textContent = 'Please enter your name.';
      status.className = 'status-msg error';
      status.style.display = 'block';
      return;
    }

    if (!email || !validateEmail(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.className = 'status-msg error';
      status.style.display = 'block';
      return;
    }

    var btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.className = 'status-msg';
    status.style.display = 'none';

    var fd = new FormData(form);

    try {
      var res = await fetch('/api/contact', { method: 'POST', body: fd });
      if (!res.ok) {
        var err = await res.json();
        throw new Error(err.message || 'Submission failed');
      }
      form.reset();
      budgetMatrix.querySelectorAll('.matrix-btn').forEach(function (b) { b.classList.remove('selected'); });
      timelineMatrix.querySelectorAll('.matrix-btn').forEach(function (b) { b.classList.remove('selected'); });
      budgetInput.value = '';
      timelineInput.value = '';
      status.textContent = 'Inquiry sent successfully. I will respond within 48 hours.';
      status.className = 'status-msg success';
      status.style.display = 'block';
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status-msg error';
      status.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Inquiry';
    }
  });

})();
