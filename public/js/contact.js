(function () {
  'use strict';

  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  const budgetMatrix = document.getElementById('budget-matrix');
  const budgetInput = document.getElementById('budget-input');
  const timelineMatrix = document.getElementById('timeline-matrix');
  const timelineInput = document.getElementById('timeline-input');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');

  function initMatrix(container, input) {
    if (!container) return;
    container.querySelectorAll('.matrix-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        input.value = btn.dataset.value;
      });
    });
  }

  initMatrix(budgetMatrix, budgetInput);
  initMatrix(timelineMatrix, timelineInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.className = 'status-msg';
    status.style.display = 'none';

    const fd = new FormData(form);

    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Submission failed');
      }
      form.reset();
      budgetMatrix.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('selected'));
      timelineMatrix.querySelectorAll('.matrix-btn').forEach(b => b.classList.remove('selected'));
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
