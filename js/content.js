/* ========================================
   content.js — dynamic notes & poems
   Loads from Firestore (if available) and replaces
   the static placeholder cards on index/notes/poetry.
   Falls back silently to the static HTML on any error.
   ======================================== */

(function () {
  'use strict';

  // ── Helpers ──
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var MONTHS_RU = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  function formatDateRu(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var d = parseInt(parts[2], 10);
    var m = parseInt(parts[1], 10) - 1;
    var y = parts[0];
    if (isNaN(d) || isNaN(m)) return iso;
    return d + ' ' + MONTHS_RU[m] + ' ' + y;
  }

  function langLabel(lang) {
    return lang === 'uk' ? 'Укр' : 'Рус';
  }
  function readMoreLabel(lang) {
    return lang === 'uk' ? 'Читати →' : 'Читать →';
  }

  // ── Renderers ──
  function renderNoteCard(n) {
    var href = '/notes/view.html?id=' + encodeURIComponent(n.id);
    return '' +
      '<a class="note-card" href="' + href + '"' +
        ' data-title="' + esc(n.title) + '"' +
        ' data-excerpt="' + esc(n.excerpt || '') + '">' +
        '<div class="note-card-meta">' +
          '<span>' + esc(formatDateRu(n.date)) + '</span>' +
          '<span class="note-card-lang">' + esc(langLabel(n.lang)) + '</span>' +
        '</div>' +
        '<h3 class="note-card-title">' + esc(n.title) + '</h3>' +
        '<p class="note-card-excerpt">' + esc(n.excerpt || '') + '</p>' +
        '<span class="note-card-more">' + esc(readMoreLabel(n.lang)) + '</span>' +
      '</a>';
  }

  function renderPoemCard(p) {
    var href = '/poetry/view.html?id=' + encodeURIComponent(p.id);
    return '' +
      '<a class="poem-card" href="' + href + '">' +
        '<h3 class="poem-card-title">' + esc(p.title) + '</h3>' +
        '<p class="poem-card-preview">' + esc(p.preview || '') + '</p>' +
        '<div class="poem-card-meta">' +
          '<span class="poem-card-year">' + esc(p.year || '') + '</span>' +
          '<span>·</span>' +
          '<span class="note-card-lang">' + esc(langLabel(p.lang)) + '</span>' +
        '</div>' +
      '</a>';
  }

  // ── Loaders ──
  async function loadAndRenderNotes(container, limit) {
    if (!container || typeof window.fsListCollection !== 'function') return;
    try {
      var items = await window.fsListCollection('notes');
      if (!items || !items.length) return; // keep static fallback
      items.sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
      });
      if (limit) items = items.slice(0, limit);
      container.innerHTML = items.map(renderNoteCard).join('');
    } catch (e) {
      /* silent — static fallback stays */
    }
  }

  async function loadAndRenderPoems(container, limit) {
    if (!container || typeof window.fsListCollection !== 'function') return;
    try {
      var items = await window.fsListCollection('poems');
      if (!items || !items.length) return;
      items.sort(function (a, b) {
        return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
      });
      if (limit) items = items.slice(0, limit);
      container.innerHTML = items.map(renderPoemCard).join('');
    } catch (e) {
      /* silent */
    }
  }

  // ── Single note/poem viewer (used on /notes/view.html and /poetry/view.html) ──
  async function loadSingleNote() {
    var container = document.querySelector('[data-note-view]');
    if (!container) return;
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      container.innerHTML = '<p style="color:var(--text-muted)">Не указан идентификатор записки.</p>';
      return;
    }
    try {
      var data = await window.fsGet('notes', id);
      if (!data) {
        container.innerHTML = '<p style="color:var(--text-muted)">Записка не найдена.</p>';
        return;
      }
      document.title = (data.title || 'Записка') + ' — A. Chepelovskyi';
      var paragraphs = String(data.content || '')
        .split(/\n\s*\n/)
        .map(function (p) { return p.trim(); })
        .filter(Boolean)
        .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; })
        .join('');

      container.innerHTML =
        '<header class="page-header">' +
          '<div class="note-card-meta" style="margin-bottom: 16px;">' +
            '<span>' + esc(formatDateRu(data.date)) + '</span>' +
            '<span class="note-card-lang">' + esc(langLabel(data.lang)) + '</span>' +
          '</div>' +
          '<h1 class="page-title">' + esc(data.title || '') + '</h1>' +
        '</header>' +
        '<article class="article">' + paragraphs + '</article>';
    } catch (e) {
      container.innerHTML = '<p style="color:var(--text-muted)">Не удалось загрузить.</p>';
    }
  }

  async function loadSinglePoem() {
    var container = document.querySelector('[data-poem-view]');
    if (!container) return;
    var id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      container.innerHTML = '<p style="color:var(--text-muted)">Не указан идентификатор стиха.</p>';
      return;
    }
    try {
      var data = await window.fsGet('poems', id);
      if (!data) {
        container.innerHTML = '<p style="color:var(--text-muted)">Стих не найден.</p>';
        return;
      }
      document.title = (data.title || 'Стих') + ' — A. Chepelovskyi';
      container.innerHTML =
        '<header class="page-header center">' +
          '<h1 class="page-title">' + esc(data.title || '') + '</h1>' +
        '</header>' +
        '<div class="poem-full">' + esc(data.text || '') + '</div>' +
        '<div class="poem-full-meta">' + esc(data.year || '') + ' · ' + esc(langLabel(data.lang)) + '</div>';
    } catch (e) {
      container.innerHTML = '<p style="color:var(--text-muted)">Не удалось загрузить.</p>';
    }
  }

  // ── Boot ──
  function boot() {
    // List renderers (optional limit via data-limit)
    document.querySelectorAll('[data-notes-list]').forEach(function (el) {
      var lim = parseInt(el.getAttribute('data-limit'), 10) || 0;
      loadAndRenderNotes(el, lim);
    });
    document.querySelectorAll('[data-poems-list]').forEach(function (el) {
      var lim = parseInt(el.getAttribute('data-limit'), 10) || 0;
      loadAndRenderPoems(el, lim);
    });
    // Single viewers
    loadSingleNote();
    loadSinglePoem();
  }

  if (window.firebaseReady && window.firebaseReady.then) {
    window.firebaseReady.then(boot);
  } else {
    // No Firebase — skip silently; static content stays.
  }
})();
