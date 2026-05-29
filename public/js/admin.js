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

  var sourceRadios = document.querySelectorAll('input[name="sourceType"]');
  var cloudinaryGroup = document.getElementById('cloudinary-group');
  var youtubeGroup = document.getElementById('youtube-group');

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
      var previewHtml;
      if (item.sourceType === 'youtube') {
        previewHtml = '<div class="table-preview video-preview" style="background:#111;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.7rem">YT</div>';
      } else if (item.category === 'graphic') {
        previewHtml = '<img src="' + item.mediaUrl + '" alt="" style="width:56px;height:40px;object-fit:cover">';
      } else {
        previewHtml = '<div class="table-preview video-preview" style="background:#111;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.7rem">Cloud</div>';
      }
      return '<tr>' +
        '<td>' + previewHtml + '</td>' +
        '<td>' + esc(item.title) + '</td>' +
        '<td><span class="category-badge ' + item.category + '">' + (item.category === 'motion' ? 'Motion Graphics' : 'Graphic Design') + '</span></td>' +
        '<td>' + item.sourceType + '</td>' +
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

  /* ---- Source type toggle ---- */
  sourceRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (this.value === 'cloudinary') {
        cloudinaryGroup.style.display = '';
        youtubeGroup.style.display = 'none';
      } else {
        cloudinaryGroup.style.display = 'none';
        youtubeGroup.style.display = '';
      }
    });
  });

  /* ---- Upload lifecycle ---- */
  function postToServer(payload) {
    return fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.error || 'Upload failed'); });
      return r.json();
    });
  }

  function uploadToCloudinary(file) {
    return fetch('/api/upload/signature')
      .then(function (r) { return r.json(); })
      .then(function (sig) {
        var targetCloud = sig.cloudName;

        console.log("🚀 SUBMITTING TO CLOUDINARY TARGET URL:", 'https://api.cloudinary.com/v1_1/' + targetCloud + '/auto/upload');
        console.log("📡 Cloud Name from backend:", targetCloud);
        console.log("🔑 API Key from backend:", sig.apiKey ? 'Present (length: ' + sig.apiKey.length + ')' : 'MISSING');

        if (!targetCloud || targetCloud === 'undefined' || targetCloud === 'null') {
          console.error("❌ CRITICAL: The cloud name variable evaluated to a literal undefined string.");
          throw new Error('Cloud name is missing from server configuration. Check CLOUDINARY_CLOUD_NAME environment variable.');
        }

        var fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', sig.timestamp);
        fd.append('signature', sig.signature);
        if (sig.uploadPreset) fd.append('upload_preset', sig.uploadPreset);

        return fetch('https://api.cloudinary.com/v1_1/' + targetCloud + '/auto/upload', {
          method: 'POST',
          body: fd,
        });
      })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (e) { throw new Error(e.error.message || 'Cloudinary upload failed'); });
        return r.json();
      });
  }

  uploadForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = uploadForm.querySelector('.btn-primary');
    btn.disabled = true;
    uploadStatus.className = 'status-msg';
    uploadStatus.style.display = 'none';

    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var category = document.getElementById('category').value;
    var sourceType = document.querySelector('input[name="sourceType"]:checked').value;

    if (sourceType === 'youtube') {
      btn.textContent = 'Publishing...';
      var youtubeUrl = document.getElementById('youtubeUrl').value;
      if (!youtubeUrl) {
        showUploadStatus('Please paste a YouTube URL.', 'error');
        btn.disabled = false;
        btn.textContent = 'Upload';
        return;
      }
      postToServer({ title: title, description: description, category: category, sourceType: 'youtube', mediaUrl: youtubeUrl })
        .then(function () {
          uploadForm.reset();
          cloudinaryGroup.style.display = '';
          youtubeGroup.style.display = 'none';
          showUploadStatus('Published successfully!', 'success');
          loadMedia();
        })
        .catch(function (err) { showUploadStatus(err.message, 'error'); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Upload'; });
    } else {
      var fileInput = document.getElementById('file');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        showUploadStatus('Please select a file to upload.', 'error');
        btn.disabled = false;
        btn.textContent = 'Upload';
        return;
      }
      btn.textContent = 'Uploading to Cloudinary...';
      uploadToCloudinary(fileInput.files[0])
        .then(function (cldResult) {
          btn.textContent = 'Saving to gallery...';
          return postToServer({
            title: title,
            description: description,
            category: category,
            sourceType: 'cloudinary',
            mediaUrl: cldResult.secure_url,
            cloudinaryPublicId: cldResult.public_id,
          });
        })
        .then(function () {
          uploadForm.reset();
          cloudinaryGroup.style.display = '';
          youtubeGroup.style.display = 'none';
          showUploadStatus('Published successfully!', 'success');
          loadMedia();
        })
        .catch(function (err) { showUploadStatus(err.message, 'error'); })
        .finally(function () { btn.disabled = false; btn.textContent = 'Upload'; });
    }
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
