/* ========================================
   chepelovskyi.com — admin.js
   Firebase Auth + Firestore editor for all site content.
   ======================================== */

(function () {
  'use strict';

  var auth = null;
  var db = null;

  // ── Boot ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      showBootError('Не удалось загрузить Firebase. Проверь интернет.');
      return;
    }
    auth = firebase.auth();
    db = window.db || firebase.firestore();

    auth.onAuthStateChanged(function (user) {
      if (user) {
        showApp(user);
      } else {
        showLogin();
      }
    });

    bindLogin();
    bindLogout();
    bindTabs();
    bindForms();
  });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function showBootError(msg) {
    var boot = $('#view-boot');
    if (boot) boot.innerHTML = '<div style="padding:20px;color:#991B1B;font-size:14px;text-align:center;">' + escapeHtml(msg) + '</div>';
  }

  function showLogin() {
    $('#view-boot').hidden = true;
    $('#view-app').hidden = true;
    $('#view-login').hidden = false;
    var email = $('#login-email');
    if (email) setTimeout(function () { email.focus(); }, 50);
  }

  function showApp(user) {
    $('#view-boot').hidden = true;
    $('#view-login').hidden = true;
    $('#view-app').hidden = false;
    $('#admin-user').textContent = user.email || '';
    loadAll();
  }

  // ── Login ───────────────────────────────────
  function bindLogin() {
    var form = $('#login-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#login-email').value.trim();
      var password = $('#login-password').value;
      var errBox = $('#login-error');
      errBox.hidden = true;
      var submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      var originalLabel = submit.textContent;
      submit.textContent = 'Входим…';

      auth.signInWithEmailAndPassword(email, password)
        .catch(function (err) {
          var msg = 'Не удалось войти.';
          if (err && err.code === 'auth/wrong-password') msg = 'Неверный пароль.';
          else if (err && err.code === 'auth/user-not-found') msg = 'Такого пользователя нет.';
          else if (err && err.code === 'auth/invalid-email') msg = 'Неверный email.';
          else if (err && err.code === 'auth/too-many-requests') msg = 'Слишком много попыток. Подожди минуту.';
          else if (err && err.code === 'auth/invalid-credential') msg = 'Неверный email или пароль.';
          else if (err && err.message) msg = err.message;
          errBox.textContent = msg;
          errBox.hidden = false;
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = originalLabel;
        });
    });
  }

  function bindLogout() {
    var btn = $('#btn-logout');
    if (btn) btn.addEventListener('click', function () { auth.signOut(); });
  }

  // ── Tabs ────────────────────────────────────
  function bindTabs() {
    $$('.admin-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var which = tab.getAttribute('data-tab');
        $$('.admin-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
        $$('.admin-panel').forEach(function (p) {
          p.classList.toggle('active', p.getAttribute('data-panel') === which);
        });
        if (which === 'history') loadHistory();
      });
    });
  }

  // ── Load everything on sign-in ─────────────
  function loadAll() {
    loadHero();
    loadPath();
    loadNotes();
    loadPoems();
    loadYoutube();
    loadContact();
  }

  // ── HERO ────────────────────────────────────
  function loadHero() {
    fsGetDoc('site', 'hero').then(function (d) {
      if (!d) d = {};
      $('#hero-quote').value = d.quote || '«Тот, кто нигде не дома, везде дома».';
      $('#hero-attr').value = d.attr || '— Сенека';
      $('#hero-tagline').value = d.tagline || 'Я не несу философию. Философия моей жизни — это и есть я.';
      $('#hero-cta-text').value = d.cta_text || 'Читать дальше';
      $('#hero-cta-url').value = d.cta_url || '/path.html';
    });
  }

  function bindForms() {
    bindForm('#form-hero', 'hero-status', function () {
      return {
        quote: $('#hero-quote').value,
        attr: $('#hero-attr').value,
        tagline: $('#hero-tagline').value,
        cta_text: $('#hero-cta-text').value,
        cta_url: $('#hero-cta-url').value
      };
    }, function (data) {
      return saveSection('site', 'hero', data);
    });

    bindForm('#form-path', 'path-status', function () {
      return {
        title: $('#path-title').value,
        epigraph: $('#path-epigraph').value,
        body: $('#path-body').value
      };
    }, function (data) {
      return saveSection('site', 'path', data);
    });

    bindForm('#form-youtube', 'yt-status', function () {
      return {
        title: $('#yt-title').value,
        subtitle: $('#yt-subtitle').value,
        intro: $('#yt-intro').value,
        channel_url: $('#yt-channel-url').value,
        videos: readYtVideos()
      };
    }, function (data) {
      return saveSection('site', 'youtube', data);
    });

    bindForm('#form-contact', 'contact-status', function () {
      return {
        title: $('#contact-title').value,
        intro: $('#contact-intro').value,
        foot: $('#contact-foot').value
      };
    }, function (data) {
      return saveSection('site', 'contact', data);
    });

    bindForm('#form-note', 'note-status', readNoteForm, saveNote);
    bindForm('#form-poem', 'poem-status', readPoemForm, savePoem);

    $('#btn-new-note').addEventListener('click', function () { openNoteEditor(null); });
    $('#btn-close-note').addEventListener('click', function () { closeNoteEditor(); });
    $('#btn-delete-note').addEventListener('click', deleteNote);

    $('#btn-new-poem').addEventListener('click', function () { openPoemEditor(null); });
    $('#btn-close-poem').addEventListener('click', function () { closePoemEditor(); });
    $('#btn-delete-poem').addEventListener('click', deletePoem);

    $('#btn-yt-add').addEventListener('click', function () {
      addYtVideoRow({ title: '', yt_id: '' });
    });
  }

  function bindForm(selector, statusId, readFn, saveFn) {
    var form = $(selector);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('#' + statusId);
      var submit = form.querySelector('button[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = 'Сохраняем…'; }
      status.className = 'admin-save-status';
      status.textContent = '';
      var data = readFn();
      Promise.resolve(saveFn(data))
        .then(function () {
          status.textContent = 'Сохранено ✓';
          status.className = 'admin-save-status ok';
        })
        .catch(function (err) {
          status.textContent = 'Ошибка: ' + (err && err.message ? err.message : err);
          status.className = 'admin-save-status error';
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = 'Сохранить'; }
          setTimeout(function () {
            if (status.classList.contains('ok')) { status.textContent = ''; status.className = 'admin-save-status'; }
          }, 3000);
        });
    });
  }

  // ── PATH ────────────────────────────────────
  function loadPath() {
    fsGetDoc('site', 'path').then(function (d) {
      if (!d) d = {};
      $('#path-title').value = d.title || 'Путь';
      $('#path-epigraph').value = d.epigraph || 'Не план. Следствие.';
      $('#path-body').value = d.body || '';
    });
  }

  // ── NOTES ───────────────────────────────────
  function loadNotes() {
    var list = $('#list-notes');
    list.innerHTML = '<p class="admin-list-empty">Загружаю…</p>';
    db.collection('notes').orderBy('date', 'desc').get()
      .then(function (snap) {
        var items = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderNoteList(items);
      })
      .catch(function () {
        // Fallback: try without order (empty collection or no field)
        db.collection('notes').get()
          .then(function (snap) { renderNoteList(snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })); })
          .catch(function (err) {
            list.innerHTML = '<p class="admin-list-empty">Ошибка: ' + escapeHtml(err.message) + '</p>';
          });
      });
  }

  function renderNoteList(items) {
    var list = $('#list-notes');
    if (!items || !items.length) {
      list.innerHTML = '<p class="admin-list-empty">Пока нет записок. Нажми "+ Новая записка".</p>';
      return;
    }
    list.innerHTML = '';
    items.forEach(function (n) {
      var row = document.createElement('div');
      row.className = 'admin-item';
      var draft = n.published === false ? '<span class="admin-item-badge-draft">черновик</span>' : '';
      row.innerHTML =
        '<div class="admin-item-main">' +
          '<h4 class="admin-item-title">' + escapeHtml(n.title || '(без названия)') + draft + '</h4>' +
          '<div class="admin-item-meta">' + escapeHtml(n.date_label || n.date || '') + ' · ' + escapeHtml(n.lang || '') + ' · /' + escapeHtml(n.id) + '</div>' +
        '</div>' +
        '<div class="admin-item-actions">' +
          '<button class="admin-btn-ghost" type="button" data-edit="' + escapeHtml(n.id) + '">Редактировать</button>' +
        '</div>';
      list.appendChild(row);
    });
    $$('#list-notes [data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-edit');
        var item = items.filter(function (x) { return x.id === id; })[0];
        openNoteEditor(item);
      });
    });
  }

  function openNoteEditor(item) {
    var form = $('#form-note');
    form.hidden = false;
    $('#note-editor-title').textContent = item ? 'Редактирование: ' + (item.title || item.id) : 'Новая записка';
    $('#note-id').value = item ? item.id : '';
    $('#note-title').value = item ? (item.title || '') : '';
    $('#note-slug').value = item ? (item.id || '') : '';
    $('#note-date-label').value = item ? (item.date_label || '') : '';
    $('#note-date').value = item ? (item.date || '') : new Date().toISOString().slice(0, 10);
    $('#note-lang').value = item ? (item.lang || 'Рус') : 'Рус';
    $('#note-excerpt').value = item ? (item.excerpt || '') : '';
    $('#note-body').value = item ? (item.body || '') : '';
    $('#note-published').checked = item ? (item.published !== false) : true;
    $('#btn-delete-note').style.display = item ? '' : 'none';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function closeNoteEditor() { $('#form-note').hidden = true; }

  function readNoteForm() {
    return {
      _id: $('#note-id').value.trim(),
      title: $('#note-title').value.trim(),
      slug: $('#note-slug').value.trim(),
      date: $('#note-date').value,
      date_label: $('#note-date-label').value.trim() || formatDateLabel($('#note-date').value),
      lang: $('#note-lang').value,
      excerpt: $('#note-excerpt').value.trim(),
      body: $('#note-body').value,
      published: $('#note-published').checked
    };
  }

  function saveNote(data) {
    var id = data._id || data.slug || slugify(data.date + '-' + data.title);
    if (!id) return Promise.reject(new Error('Нужен заголовок или slug.'));
    var payload = {
      title: data.title,
      date: data.date,
      date_label: data.date_label,
      lang: data.lang,
      excerpt: data.excerpt,
      body: data.body,
      published: data.published,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    var prevId = data._id;
    return snapshotHistory('notes', prevId || id)
      .then(function () {
        // Rename: if slug changed, delete old and write new
        if (prevId && prevId !== id) {
          return db.collection('notes').doc(id).set(payload)
            .then(function () { return db.collection('notes').doc(prevId).delete(); });
        }
        return db.collection('notes').doc(id).set(payload, { merge: true });
      })
      .then(function () { loadNotes(); closeNoteEditor(); });
  }

  function deleteNote() {
    var id = $('#note-id').value.trim();
    if (!id) return;
    if (!confirm('Удалить записку "' + ($('#note-title').value || id) + '"? Снимок останется в Истории.')) return;
    var status = $('#note-status');
    status.textContent = 'Удаляем…';
    status.className = 'admin-save-status';
    snapshotHistory('notes', id)
      .then(function () { return db.collection('notes').doc(id).delete(); })
      .then(function () {
        status.textContent = 'Удалено';
        status.className = 'admin-save-status ok';
        loadNotes();
        closeNoteEditor();
      })
      .catch(function (err) {
        status.textContent = 'Ошибка: ' + err.message;
        status.className = 'admin-save-status error';
      });
  }

  // ── POEMS ───────────────────────────────────
  function loadPoems() {
    var list = $('#list-poems');
    list.innerHTML = '<p class="admin-list-empty">Загружаю…</p>';
    db.collection('poems').orderBy('year', 'desc').get()
      .then(function (snap) {
        var items = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        renderPoemList(items);
      })
      .catch(function () {
        db.collection('poems').get()
          .then(function (snap) { renderPoemList(snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); })); })
          .catch(function (err) {
            list.innerHTML = '<p class="admin-list-empty">Ошибка: ' + escapeHtml(err.message) + '</p>';
          });
      });
  }

  function renderPoemList(items) {
    var list = $('#list-poems');
    if (!items || !items.length) {
      list.innerHTML = '<p class="admin-list-empty">Пока нет стихов. Нажми "+ Новое стихотворение".</p>';
      return;
    }
    list.innerHTML = '';
    items.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'admin-item';
      var draft = p.published === false ? '<span class="admin-item-badge-draft">черновик</span>' : '';
      row.innerHTML =
        '<div class="admin-item-main">' +
          '<h4 class="admin-item-title">' + escapeHtml(p.title || '(без названия)') + draft + '</h4>' +
          '<div class="admin-item-meta">' + escapeHtml(p.year || '') + ' · ' + escapeHtml(p.lang || '') + ' · /' + escapeHtml(p.id) + '</div>' +
        '</div>' +
        '<div class="admin-item-actions">' +
          '<button class="admin-btn-ghost" type="button" data-edit="' + escapeHtml(p.id) + '">Редактировать</button>' +
        '</div>';
      list.appendChild(row);
    });
    $$('#list-poems [data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-edit');
        var item = items.filter(function (x) { return x.id === id; })[0];
        openPoemEditor(item);
      });
    });
  }

  function openPoemEditor(item) {
    var form = $('#form-poem');
    form.hidden = false;
    $('#poem-editor-title').textContent = item ? 'Редактирование: ' + (item.title || item.id) : 'Новое стихотворение';
    $('#poem-id').value = item ? item.id : '';
    $('#poem-title').value = item ? (item.title || '') : '';
    $('#poem-slug').value = item ? (item.id || '') : '';
    $('#poem-year').value = item ? (item.year || '') : String(new Date().getFullYear());
    $('#poem-lang').value = item ? (item.lang || 'Рус') : 'Рус';
    $('#poem-preview').value = item ? (item.preview || '') : '';
    $('#poem-body').value = item ? (item.body || '') : '';
    $('#poem-published').checked = item ? (item.published !== false) : true;
    $('#btn-delete-poem').style.display = item ? '' : 'none';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function closePoemEditor() { $('#form-poem').hidden = true; }

  function readPoemForm() {
    return {
      _id: $('#poem-id').value.trim(),
      title: $('#poem-title').value.trim(),
      slug: $('#poem-slug').value.trim(),
      year: $('#poem-year').value.trim(),
      lang: $('#poem-lang').value,
      preview: $('#poem-preview').value,
      body: $('#poem-body').value,
      published: $('#poem-published').checked
    };
  }

  function savePoem(data) {
    var id = data._id || data.slug || slugify(data.title);
    if (!id) return Promise.reject(new Error('Нужен заголовок или slug.'));
    var payload = {
      title: data.title,
      year: data.year,
      lang: data.lang,
      preview: data.preview,
      body: data.body,
      published: data.published,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    var prevId = data._id;
    return snapshotHistory('poems', prevId || id)
      .then(function () {
        if (prevId && prevId !== id) {
          return db.collection('poems').doc(id).set(payload)
            .then(function () { return db.collection('poems').doc(prevId).delete(); });
        }
        return db.collection('poems').doc(id).set(payload, { merge: true });
      })
      .then(function () { loadPoems(); closePoemEditor(); });
  }

  function deletePoem() {
    var id = $('#poem-id').value.trim();
    if (!id) return;
    if (!confirm('Удалить стихотворение "' + ($('#poem-title').value || id) + '"? Снимок останется в Истории.')) return;
    var status = $('#poem-status');
    status.textContent = 'Удаляем…';
    status.className = 'admin-save-status';
    snapshotHistory('poems', id)
      .then(function () { return db.collection('poems').doc(id).delete(); })
      .then(function () {
        status.textContent = 'Удалено';
        status.className = 'admin-save-status ok';
        loadPoems();
        closePoemEditor();
      })
      .catch(function (err) {
        status.textContent = 'Ошибка: ' + err.message;
        status.className = 'admin-save-status error';
      });
  }

  // ── YOUTUBE ─────────────────────────────────
  function loadYoutube() {
    fsGetDoc('site', 'youtube').then(function (d) {
      if (!d) d = {};
      $('#yt-title').value = d.title || 'Стихи вслух';
      $('#yt-subtitle').value = d.subtitle || 'Тексты, которые проще услышать, чем прочитать.';
      $('#yt-intro').value = d.intro || '';
      $('#yt-channel-url').value = d.channel_url || 'https://www.youtube.com/';
      renderYtVideos(d.videos || []);
    });
  }

  function renderYtVideos(videos) {
    var wrap = $('#yt-videos');
    wrap.innerHTML = '';
    if (!videos.length) {
      wrap.innerHTML = '<p class="admin-list-empty">Нет видео. Добавь кнопкой ниже.</p>';
      return;
    }
    videos.forEach(function (v) { addYtVideoRow(v); });
  }

  function addYtVideoRow(v) {
    var wrap = $('#yt-videos');
    // Remove empty state
    var empty = wrap.querySelector('.admin-list-empty');
    if (empty) empty.remove();
    var row = document.createElement('div');
    row.className = 'yt-video-row';
    row.innerHTML =
      '<input type="text" placeholder="Название видео" class="yt-video-title" value="' + escapeHtml(v.title || '') + '" />' +
      '<input type="text" placeholder="YouTube ID (dQw4w9WgXcQ)" class="yt-video-id" value="' + escapeHtml(v.yt_id || '') + '" />' +
      '<button class="admin-btn-danger" type="button">×</button>';
    row.querySelector('.admin-btn-danger').addEventListener('click', function () {
      row.remove();
      if (!$('#yt-videos').querySelector('.yt-video-row')) {
        $('#yt-videos').innerHTML = '<p class="admin-list-empty">Нет видео. Добавь кнопкой ниже.</p>';
      }
    });
    wrap.appendChild(row);
  }

  function readYtVideos() {
    return $$('#yt-videos .yt-video-row').map(function (row) {
      return {
        title: row.querySelector('.yt-video-title').value.trim(),
        yt_id: extractYtId(row.querySelector('.yt-video-id').value.trim())
      };
    }).filter(function (v) { return v.title || v.yt_id; });
  }

  function extractYtId(input) {
    if (!input) return '';
    var m = input.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (m) return m[1];
    return input; // assume raw id
  }

  // ── CONTACT ─────────────────────────────────
  function loadContact() {
    fsGetDoc('site', 'contact').then(function (d) {
      if (!d) d = {};
      $('#contact-title').value = d.title || 'Написать';
      $('#contact-intro').value = d.intro || 'Если хочешь написать — просто напиши.';
      $('#contact-foot').value = d.foot || 'Или посмотри <a href="/youtube.html">YouTube канал</a> — стихи вслух.';
    });
  }

  // ── HISTORY ─────────────────────────────────
  function loadHistory() {
    var list = $('#list-history');
    list.innerHTML = '<p class="admin-list-empty">Загружаю…</p>';
    db.collection('history').orderBy('created_at', 'desc').limit(30).get()
      .then(function (snap) {
        if (snap.empty) {
          list.innerHTML = '<p class="admin-list-empty">История пока пустая. Появится после первого сохранения.</p>';
          return;
        }
        list.innerHTML = '';
        snap.docs.forEach(function (doc) {
          var h = doc.data();
          var ts = h.created_at && h.created_at.toDate ? h.created_at.toDate() : null;
          var when = ts ? ts.toLocaleString('ru-RU') : '—';
          var row = document.createElement('div');
          row.className = 'admin-item admin-history-item';
          row.innerHTML =
            '<div class="admin-item-main">' +
              '<h4 class="admin-item-title">' + escapeHtml(h.collection + '/' + h.doc_id) + '</h4>' +
              '<div class="admin-item-meta">' + escapeHtml(when) + '</div>' +
            '</div>' +
            '<div class="admin-item-actions">' +
              '<button class="admin-btn-ghost" type="button" data-restore="' + escapeHtml(doc.id) + '">Откатить</button>' +
            '</div>';
          list.appendChild(row);
        });
        $$('#list-history [data-restore]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            restoreFromHistory(btn.getAttribute('data-restore'));
          });
        });
      })
      .catch(function (err) {
        list.innerHTML = '<p class="admin-list-empty">Ошибка: ' + escapeHtml(err.message) + '</p>';
      });
  }

  function restoreFromHistory(historyId) {
    if (!confirm('Откатить к этому снимку? Текущее значение сохранится в истории.')) return;
    db.collection('history').doc(historyId).get()
      .then(function (doc) {
        if (!doc.exists) throw new Error('Запись истории не найдена');
        var h = doc.data();
        return snapshotHistory(h.collection, h.doc_id)
          .then(function () {
            if (h.payload === null) {
              // Was deleted. Recreate from snapshot? We can't if payload is null.
              return db.collection(h.collection).doc(h.doc_id).delete();
            }
            return db.collection(h.collection).doc(h.doc_id).set(h.payload);
          });
      })
      .then(function () {
        alert('Откачено.');
        loadAll();
        loadHistory();
      })
      .catch(function (err) {
        alert('Ошибка: ' + err.message);
      });
  }

  // ── Save helpers ────────────────────────────
  function saveSection(coll, docId, data) {
    data.updated_at = firebase.firestore.FieldValue.serverTimestamp();
    return snapshotHistory(coll, docId).then(function () {
      return db.collection(coll).doc(docId).set(data, { merge: true });
    });
  }

  function snapshotHistory(coll, docId) {
    return db.collection(coll).doc(docId).get()
      .then(function (snap) {
        var payload = snap.exists ? snap.data() : null;
        return db.collection('history').add({
          collection: coll,
          doc_id: docId,
          payload: payload,
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .catch(function () { /* non-fatal */ });
  }

  function fsGetDoc(coll, docId) {
    return db.collection(coll).doc(docId).get()
      .then(function (snap) { return snap.exists ? snap.data() : null; })
      .catch(function () { return null; });
  }

  // ── Utilities ───────────────────────────────
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function slugify(s) {
    if (!s) return '';
    var translitMap = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
      'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
      'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
      'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
      'і':'i','ї':'yi','є':'ye','ґ':'g'
    };
    return s.toLowerCase().split('').map(function (c) {
      if (translitMap[c] !== undefined) return translitMap[c];
      return c;
    }).join('').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
  }

  function formatDateLabel(iso) {
    if (!iso) return '';
    var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    var d = parseInt(parts[2], 10);
    var m = parseInt(parts[1], 10) - 1;
    var y = parts[0];
    if (isNaN(d) || isNaN(m) || !months[m]) return iso;
    return d + ' ' + months[m] + ' ' + y;
  }

})();
