(function () {
  var loginGate = document.getElementById('login-gate');
  var adminPanel = document.getElementById('admin-panel');
  var loginForm = document.getElementById('login-form');
  var loginStatus = document.getElementById('login-status');
  var logoutBtn = document.getElementById('logout-btn');

  var uploadForm = document.getElementById('upload-form');
  var uploadStatus = document.getElementById('upload-status');
  var mediaTbody = document.getElementById('media-tbody');
  var inquiriesTbody = document.getElementById('inquiries-tbody');

  function showLogin() {
    loginGate.style.display = 'flex';
    adminPanel.style.display = 'none';
    logoutBtn.style.display = 'none';
  }

  function showDashboard() {
    loginGate.style.display = 'none';
    adminPanel.style.display = 'block';
    logoutBtn.style.display = 'block';
  }

  function checkAuth() {
    fetch('/api/admin/me')
      .then(function (r) {
        if (r.ok) { showDashboard(); loadMedia(); loadInquiries(); }
        else { showLogin(); }
      })
      .catch(function () { showLogin(); });
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = loginForm.querySelector('.btn-submit');
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    loginStatus.className = 'status-msg';
    loginStatus.style.display = 'none';

    var fd = new FormData(loginForm);
    var data = JSON.stringify({
      username: fd.get('username'),
      password: fd.get('password'),
    });

    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Invalid credentials');
        checkAuth();
      })
      .catch(function (err) {
        loginStatus.textContent = err.message;
        loginStatus.className = 'status-msg error';
        loginStatus.style.display = 'block';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      });
  });

  logoutBtn.addEventListener('click', function () {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(function () { showLogin(); })
      .catch(function () { showLogin(); });
  });

  function loadMedia() {
    fetch('/api/gallery')
      .then(function (r) { return r.json(); })
      .then(function (data) { renderMedia(data); })
      .catch(function () {
        mediaTbody.innerHTML = '<tr><td colspan="5" class="empty-msg">Failed to load media.</td></tr>';
      });
  }

  function renderMedia(items) {
    if (!items || !items.length) {
      mediaTbody.innerHTML = '<tr><td colspan="5" class="empty-msg">No media uploaded yet.</td></tr>';
      return;
    }
    mediaTbody.innerHTML = items.map(function (item) {
      return '<tr>' +
        '<td><div class="table-preview ' + (item.fileType === 'video' ? 'video-preview' : '') + '">' +
          (item.fileType === 'video'
            ? '<video src="' + item.assetUrl + '" muted preload="metadata"></video>'
            : '<img src="' + item.assetUrl + '" alt="">') +
        '</div></td>' +
        '<td>' + esc(item.title) + '</td>' +
        '<td><span class="category-badge ' + item.category + '">' + (item.category === 'motion' ? 'Motion Graphics' : 'Graphic Design') + '</span></td>' +
        '<td>' + item.fileType + '</td>' +
        '<td><button class="btn-delete" data-id="' + item._id + '">Delete</button></td>' +
      '</tr>';
    }).join('');

    mediaTbody.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteMedia(btn.dataset.id); });
    });
  }

  function deleteMedia(id) {
    if (!confirm('Soft-delete this item? It will be permanently removed after 5 days.')) return;
    fetch('/api/upload/' + id, { method: 'DELETE' })
      .then(function (r) { if (r.ok) loadMedia(); else showUploadStatus('Failed to delete.', 'error'); })
      .catch(function () { showUploadStatus('Failed to delete.', 'error'); });
  }

  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var fileInput = document.getElementById('asset');
    if (fileInput && fileInput.files && fileInput.files[0]) {
      var maxBytes = 4.5 * 1024 * 1024;
      if (fileInput.files[0].size > maxBytes) {
        showUploadStatus('Asset size exceeds 4.5MB serverless limitation. Please optimize the image/video compression before uploading.', 'file-error');
        return;
      }
    }

    var btn = uploadForm.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = 'Uploading...';
    uploadStatus.className = 'status-msg';
    uploadStatus.style.display = 'none';

    var fd = new FormData(uploadForm);

    fetch('/api/upload', { method: 'POST', body: fd })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (e) { throw new Error(e.message || 'Upload failed'); });
        uploadForm.reset();
        showUploadStatus('Uploaded successfully!', 'success');
        loadMedia();
      })
      .catch(function (err) { showUploadStatus(err.message, 'error'); })
      .finally(function () { btn.disabled = false; btn.textContent = 'Upload'; });
  });

  function loadInquiries() {
    fetch('/api/admin/inquiries')
      .then(function (r) {
        if (!r.ok) throw new Error('Unauthorized');
        return r.json();
      })
      .then(function (data) { renderInquiries(data); })
      .catch(function () {
        if (inquiriesTbody) inquiriesTbody.innerHTML = '<tr><td colspan="7" class="empty-msg">Failed to load inquiries.</td></tr>';
      });
  }

  function renderInquiries(items) {
    if (!items || !items.length) {
      if (inquiriesTbody) inquiriesTbody.innerHTML = '<tr><td colspan="7" class="empty-msg">No inquiries yet.</td></tr>';
      return;
    }
    var budgetLabels = { '2k-5k': '$2k\u2013$5k', '5k-10k': '$5k\u2013$10k', '10k+': '$10k+' };
    var timelineLabels = { 'urgent': '<1 Month', 'standard': '1\u20133 Months', 'flexible': '3+ Months' };

    inquiriesTbody.innerHTML = items.map(function (item) {
      var date = item.submissionDate ? new Date(item.submissionDate).toLocaleDateString() : '';
      var briefLink = item.briefFile ? '<a href="' + item.briefFile + '" target="_blank" class="brief-link">View</a>' : '\u2014';
      return '<tr>' +
        '<td>' + esc(item.clientName || '\u2014') + '</td>' +
        '<td>' + esc(item.companyName || '\u2014') + '</td>' +
        '<td>' + esc(item.email || '\u2014') + '</td>' +
        '<td>' + (budgetLabels[item.budgetRange] || '\u2014') + '</td>' +
        '<td>' + (timelineLabels[item.timelineUrgency] || '\u2014') + '</td>' +
        '<td>' + briefLink + '</td>' +
        '<td>' + date + '</td>' +
      '</tr>';
    }).join('');
  }

  function showUploadStatus(msg, type) {
    uploadStatus.textContent = msg;
    uploadStatus.className = 'status-msg ' + type;
    uploadStatus.style.display = 'block';
  }

  function esc(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  checkAuth();

})();
