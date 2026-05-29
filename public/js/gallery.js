(function () {
  'use strict';

  const API = '/api/gallery';

  const motionGrid = document.getElementById('motion-grid');
  const graphicGrid = document.getElementById('graphic-grid');

  const videoModal = document.getElementById('video-modal');
  const modalPlayer = document.getElementById('modal-player');
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
    modalPlayer.innerHTML = '';
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

  /* ---- Helpers ---- */
  function getYoutubeEmbedUrl(url) {
    var match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? 'https://www.youtube.com/embed/' + match[1] + '?autoplay=1&rel=0' : null;
  }

  function cloudinaryTransform(url) {
    return url ? url.replace(/\/upload\//, '/upload/f_auto,q_auto/') : url;
  }

  function animateCards(selector) {
    if (typeof gsap === 'undefined') return;
    gsap.fromTo(selector,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
    );
  }

  /* ---- Load & render gallery ---- */
  async function loadGallery() {
    try {
      const res = await fetch(API);
      allMedia = await res.json();
      renderMotion(allMedia.filter(m => m.category === 'motion'));
      renderGraphic(allMedia.filter(m => m.category === 'graphic'));
      animateCards('.video-card');
      animateCards('.masonry-item');
    } catch (err) {
      motionGrid.innerHTML = '<p class="empty-msg">Failed to load gallery.</p>';
      graphicGrid.innerHTML = '<p class="empty-msg">Failed to load gallery.</p>';
    }
  }

  function renderMotion(items) {
    if (!items.length) {
      motionGrid.innerHTML = '<p class="empty-msg">New collection dropping soon</p>';
      return;
    }
    motionGrid.innerHTML = items.map(item => {
      var playerHtml;
      if (item.sourceType === 'youtube') {
        var embed = getYoutubeEmbedUrl(item.mediaUrl);
        playerHtml = embed
          ? '<iframe src="' + embed + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="width:100%;aspect-ratio:16/9;display:block"></iframe>'
          : '<video src="' + item.mediaUrl + '" muted loop preload="metadata" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000"></video>';
      } else {
        playerHtml = '<video src="' + item.mediaUrl + '" muted playsinline loop autoplay preload="metadata" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#000"></video>';
      }
      return '<div class="video-card" data-id="' + item._id + '">' +
        '<div class="video-wrapper">' + playerHtml + '</div>' +
        '<div class="card-body">' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          (item.description ? '<p>' + escapeHtml(item.description) + '</p>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    motionGrid.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function () { openVideoModal(card.dataset.id); });
    });
  }

  function renderGraphic(items) {
    if (!items.length) {
      graphicGrid.innerHTML = '<p class="empty-msg">New collection dropping soon</p>';
      return;
    }
    graphicGrid.innerHTML = items.map(item => {
      var src = item.sourceType === 'cloudinary' ? cloudinaryTransform(item.mediaUrl) : item.mediaUrl;
      return '<div class="masonry-item" data-id="' + item._id + '">' +
        '<img src="' + src + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<div class="card-body">' +
          '<h3>' + escapeHtml(item.title) + '</h3>' +
          (item.description ? '<p>' + escapeHtml(item.description) + '</p>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    graphicGrid.querySelectorAll('.masonry-item').forEach(el => {
      el.addEventListener('click', () => openLightbox(el.dataset.id));
    });
  }

  function openVideoModal(id) {
    const item = allMedia.find(m => m._id === id);
    if (!item) return;
    if (item.sourceType === 'youtube') {
      var embed = getYoutubeEmbedUrl(item.mediaUrl);
      if (embed) {
        modalPlayer.innerHTML = '<iframe src="' + embed + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen style="width:100%;aspect-ratio:16/9;display:block;background:#000"></iframe>';
      } else {
        modalPlayer.innerHTML = '<video src="' + item.mediaUrl + '" controls autoplay style="width:100%;max-height:68vh;display:block;background:#000"></video>';
      }
    } else {
      modalPlayer.innerHTML = '<video src="' + item.mediaUrl + '" controls autoplay style="width:100%;max-height:68vh;display:block;background:#000"></video>';
    }
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.description || '';
    videoModal.classList.add('open');
  }

  function openLightbox(id) {
    const item = allMedia.find(m => m._id === id);
    if (!item) return;
    var src = item.sourceType === 'cloudinary' ? cloudinaryTransform(item.mediaUrl) : item.mediaUrl;
    lightboxImg.src = src;
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
