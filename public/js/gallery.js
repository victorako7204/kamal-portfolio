(function () {
  'use strict';

  const API = '/api/gallery';

  const motionGrid = document.getElementById('motion-grid');
  const graphicGrid = document.getElementById('graphic-grid');

  const videoModal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');

  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  let allMedia = [];

  /* ---- Nav active state ---- */
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  /* ---- Tab switching ---- */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tabContents.forEach(tc => tc.classList.remove('active'));
      document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
    });
  });

  /* ---- Modal controls ---- */
  function closeModal(modal) {
    modal.classList.remove('open');
    const vid = modal.querySelector('video');
    if (vid) vid.pause();
  }

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });

  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', () => closeModal(bd.closest('.modal')));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(videoModal);
      closeModal(lightbox);
    }
  });

  /* ---- Load & render gallery ---- */
  async function loadGallery() {
    try {
      const res = await fetch(API);
      allMedia = await res.json();
      renderMotion(allMedia.filter(m => m.category === 'motion'));
      renderGraphic(allMedia.filter(m => m.category === 'graphic'));
    } catch {
      motionGrid.innerHTML = '<p class="empty-msg">Failed to load gallery.</p>';
      graphicGrid.innerHTML = '<p class="empty-msg">Failed to load gallery.</p>';
    }
  }

  function renderMotion(items) {
    if (!items.length) {
      motionGrid.innerHTML = '<p class="empty-msg">New collection dropping soon</p>';
      return;
    }
    motionGrid.innerHTML = items.map(item => `
      <div class="video-card" data-id="${item._id}">
        <div class="video-wrapper">
          <video
            src="${item.assetUrl}"
            muted
            loop
            preload="metadata"
          ></video>
        </div>
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        </div>
      </div>
    `).join('');

    motionGrid.querySelectorAll('.video-card video').forEach(vid => {
      const card = vid.closest('.video-card');
      card.addEventListener('mouseenter', () => vid.play().catch(() => {}));
      card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
      card.addEventListener('click', () => openVideoModal(card.dataset.id));
    });
  }

  function renderGraphic(items) {
    if (!items.length) {
      graphicGrid.innerHTML = '<p class="empty-msg">New collection dropping soon</p>';
      return;
    }
    graphicGrid.innerHTML = items.map(item => `
      <div class="masonry-item" data-id="${item._id}">
        <img src="${item.assetUrl}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div class="card-body">
          <h3>${escapeHtml(item.title)}</h3>
          ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        </div>
      </div>
    `).join('');

    graphicGrid.querySelectorAll('.masonry-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.id));
    });
  }

  function openVideoModal(id) {
    const item = allMedia.find(m => m._id === id);
    if (!item) return;
    modalVideo.src = item.assetUrl;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.description || '';
    videoModal.classList.add('open');
  }

  function openLightbox(id) {
    const item = allMedia.find(m => m._id === id);
    if (!item) return;
    lightboxImg.src = item.assetUrl;
    lightboxImg.alt = item.title;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.description || '';
    lightbox.classList.add('open');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  loadGallery();

})();
