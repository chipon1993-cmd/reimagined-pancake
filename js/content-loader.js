/* ========================================
   chepelovskyi.com — content-loader.js
   Hydrates public pages from Firestore.
   Gracefully falls back to static HTML if Firestore is unavailable.
   ======================================== */

(function () {
  'use strict';

  // Wait for firebase-config.js to settle (or fail).
  var ready = window.firebaseReady || Promise.resolve(false);

  ready.then(function (ok) {
    if (!ok || !window.db) return; // keep static placeholders
    var page = detectPage();
    if (page === 'index') hydrateIndex();
    else if (page === 'notes') hydrateNotesList();
    else if (page === 'poetry') hydratePoetryList();
    else if (page === 'note') hydrateNote();
    else if (page === 'poem') hydratePoem();
    else if (page === 'path') hydratePath();
    else if (page === 'youtube') hydrateYoutube();
    else if (page === 'contact') hydrateContact();
  });

  // ── Page detection ─────────────────────
  function detectPage() {
    var p = location.pathname.replace(/\/$/, '') || '/';
    if (p === '/' || p === '/index.html') return 'index';
    if (p === '/notes.html') return 'notes';
    if (p === '/poetry.html') return 'poetry';
    if (p === '/note.html') return 'note';
    if (p === '/poem.html') return 'poem';
    if (p === '/path.html') return 'path';
    if (p === '/youtube.html') return 'youtube';
    if (p === '/contact.html') return 'contact';
    return null;
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function getDoc(coll, docId) {
    if (window.fsGet) return window.fsGet(coll, docId);
    return window.db.collection(coll).doc(docId).get()
      .then(function (s) { return s.exists ? s.data() : null; })
      .catch(function () { return null; });
  }

  // Fetch all docs, filter published client-side, sort client-side.
  // Avoids requiring a Firestore composite index on (published, date).
  function listPublished(coll, orderField, direction, limitN) {
    if (!window.db) return Promise.resolve(null);
    return Promise.race([
      window.db.collection(coll).get(),
      new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 5000); })
    ])
      .then(function (snap) {
        var items = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
        items = items.filter(function (x) { return x.published !== false; });
        if (orderField) {
          var dir = (direction || 'desc') === 'desc' ? -1 : 1;
          items.sort(function (a, b) {
            var av = a[orderField] || '';
            var bv = b[orderField] || '';
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
          });
        }
        if (limitN) items = items.slice(0, limitN);
        return items;
      })
      .catch(function () { return null; });
  }

  // ── INDEX ──────────────────────────────
  function hydrateIndex() {
    getDoc('site', 'hero').then(function (d) {
      if (!d) return;
      setText('.hero-quote', d.quote);
      setText('.hero-attr', d.attr);
      setText('.hero-tagline', d.tagline);
      var cta = $('.hero-cta');
      if (cta && d.cta_text) {
        cta.childNodes[0].nodeValue = d.cta_text + ' ';
        if (d.cta_url) cta.setAttribute('href', d.cta_url);
      }
    });

    listPublished('notes', 'date', 'desc', 3).then(function (items) {
      if (!items || !items.length) return;
      var list = $('.note-list');
      if (!list) return;
      list.innerHTML = '';
      items.forEach(function (n) { list.appendChild(renderNoteCard(n, false)); });
    });

    listPublished('poems', 'year', 'desc', 2).then(function (items) {
      if (!items || !items.length) return;
      var grid = $('.poetry-grid');
      if (!grid) return;
      grid.innerHTML = '';
      items.forEach(function (p) { grid.appendChild(renderPoemCard(p)); });
    });
  }

  // ── NOTES list page ────────────────────
  function hydrateNotesList() {
    listPublished('notes', 'date', 'desc', 100).then(function (items) {
      if (!items || !items.length) return;
      var list = $('[data-search-list]') || $('.note-list');
      if (!list) return;
      list.innerHTML = '';
      items.forEach(function (n) { list.appendChild(renderNoteCard(n, true)); });
    });
  }

  // ── POETRY list page ───────────────────
  function hydratePoetryList() {
    listPublished('poems', 'year', 'desc', 100).then(function (items) {
      if (!items || !items.length) return;
      var grid = $('.poetry-grid');
      if (!grid) return;
      grid.innerHTML = '';
      items.forEach(function (p) { grid.appendChild(renderPoemCard(p)); });
    });
  }

  // ── Single NOTE (note.html?id=…) ───────
  function hydrateNote() {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    getDoc('notes', id).then(function (n) {
      if (!n) {
        renderMissing('Запись не найдена.', '/notes.html', '← К запискам');
        return;
      }
      var titleEl = $('.page-title');
      var docTitle = n.title + ' — A. Chepelovskyi';
      document.title = docTitle;
      if (titleEl) titleEl.textContent = n.title;
      var metaDate = $('[data-note-date]');
      var metaLang = $('[data-note-lang]');
      if (metaDate) metaDate.textContent = n.date_label || n.date || '';
      if (metaLang) metaLang.textContent = n.lang || '';
      var article = $('.article');
      if (article) article.innerHTML = renderBody(n.body || '');
    });
  }

  // ── Single POEM (poem.html?id=…) ───────
  function hydratePoem() {
    var id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    getDoc('poems', id).then(function (p) {
      if (!p) {
        renderMissing('Стихотворение не найдено.', '/poetry.html', '← К стихам');
        return;
      }
      document.title = p.title + ' — A. Chepelovskyi';
      setText('.page-title', p.title);
      var full = $('.poem-full');
      if (full) full.textContent = p.body || '';
      var meta = $('.poem-full-meta');
      if (meta) meta.textContent = (p.year || '') + (p.lang ? ' · ' + p.lang : '');
    });
  }

  // ── PATH ───────────────────────────────
  function hydratePath() {
    getDoc('site', 'path').then(function (d) {
      if (!d) return;
      if (d.title) {
        document.title = d.title + ' — A. Chepelovskyi';
        setText('.page-title', d.title);
      }
      if (d.epigraph) setText('.page-epigraph', d.epigraph);
      if (d.body) {
        var article = $('.article');
        if (article) article.innerHTML = renderArticleBody(d.body);
      }
    });
  }

  // ── YOUTUBE ────────────────────────────
  function hydrateYoutube() {
    getDoc('site', 'youtube').then(function (d) {
      if (!d) return;
      if (d.title) { document.title = d.title + ' — A. Chepelovskyi'; setText('.page-title', d.title); }
      if (d.subtitle) setText('.page-subtitle', d.subtitle);
      if (d.intro) {
        var intro = $('.yt-intro');
        if (intro) intro.innerHTML = escapeHtml(d.intro);
      }
      if (d.channel_url) {
        var link = $('a.btn[href*="youtube.com"]');
        if (link) link.setAttribute('href', d.channel_url);
      }
      if (d.videos && d.videos.length) {
        var grid = $('.video-grid');
        if (!grid) return;
        grid.innerHTML = '';
        d.videos.forEach(function (v, i) {
          if (!v.yt_id) return;
          var card = document.createElement('div');
          card.className = 'video-card';
          card.innerHTML =
            '<div class="video-embed">' +
              '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(v.yt_id) + '" title="' + escapeHtml(v.title || ('Видео ' + (i + 1))) + '" loading="lazy" allowfullscreen></iframe>' +
            '</div>' +
            '<div class="video-card-body">' +
              '<p class="video-card-title">' + escapeHtml(v.title || '') + '</p>' +
            '</div>';
          grid.appendChild(card);
        });
      }
    });
  }

  // ── CONTACT ────────────────────────────
  function hydrateContact() {
    getDoc('site', 'contact').then(function (d) {
      if (!d) return;
      if (d.title) { document.title = d.title + ' — A. Chepelovskyi'; setText('.page-title', d.title); }
      if (d.intro) {
        var intro = $('.contact-intro');
        if (intro) intro.textContent = d.intro;
      }
      if (d.foot) {
        var foot = $('.contact-foot');
        if (foot) foot.innerHTML = sanitizeBasic(d.foot);
      }
    });
  }

  // ── Renderers ──────────────────────────
  function renderNoteCard(n, withSearchData) {
    var a = document.createElement('a');
    a.className = 'note-card';
    a.href = '/note.html?id=' + encodeURIComponent(n.id);
    if (withSearchData) {
      a.setAttribute('data-title', n.title || '');
      a.setAttribute('data-excerpt', n.excerpt || '');
    }
    a.innerHTML =
      '<div class="note-card-meta">' +
        '<span>' + escapeHtml(n.date_label || n.date || '') + '</span>' +
        '<span class="note-card-lang">' + escapeHtml(n.lang || '') + '</span>' +
      '</div>' +
      '<h3 class="note-card-title">' + escapeHtml(n.title || '') + '</h3>' +
      '<p class="note-card-excerpt">' + escapeHtml(n.excerpt || '') + '</p>' +
      '<span class="note-card-more">' + (n.lang === 'Укр' ? 'Читати →' : 'Читать →') + '</span>';
    return a;
  }

  function renderPoemCard(p) {
    var a = document.createElement('a');
    a.className = 'poem-card';
    a.href = '/poem.html?id=' + encodeURIComponent(p.id);
    a.innerHTML =
      '<h3 class="poem-card-title">' + escapeHtml(p.title || '') + '</h3>' +
      '<p class="poem-card-preview">' + escapeHtml(p.preview || '') + '</p>' +
      '<div class="poem-card-meta">' +
        '<span class="poem-card-year">' + escapeHtml(p.year || '') + '</span>' +
        '<span>·</span>' +
        '<span class="note-card-lang">' + escapeHtml(p.lang || '') + '</span>' +
      '</div>';
    return a;
  }

  // Render note/simple body: paragraphs separated by blank lines.
  function renderBody(raw) {
    if (!raw) return '';
    var paras = raw.split(/\n{2,}/);
    return paras.map(function (p) {
      var t = p.trim();
      if (!t) return '';
      return '<p>' + escapeHtml(t).replace(/\n/g, '<br />') + '</p>';
    }).join('');
  }

  // Render long-form path body: supports `## heading`, `> quote`, paragraphs.
  function renderArticleBody(raw) {
    if (!raw) return '';
    var blocks = raw.split(/\n{2,}/);
    return blocks.map(function (b) {
      var t = b.trim();
      if (!t) return '';
      if (/^##\s+/.test(t)) {
        return '<h2>' + escapeHtml(t.replace(/^##\s+/, '')) + '</h2>';
      }
      if (/^>\s+/.test(t)) {
        return '<blockquote>' + escapeHtml(t.replace(/^>\s+/, '').replace(/\n>\s*/g, ' ')) + '</blockquote>';
      }
      return '<p>' + inlineEmphasis(escapeHtml(t)).replace(/\n/g, '<br />') + '</p>';
    }).join('');
  }

  // Very small inline formatter: *italic* → <em>
  function inlineEmphasis(s) {
    return s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function renderMissing(msg, backHref, backLabel) {
    var article = $('.article') || $('.poem-full');
    if (article) {
      article.innerHTML = '<p style="color:var(--text-muted);">' + escapeHtml(msg) + '</p>';
    }
    var title = $('.page-title');
    if (title) title.textContent = msg;
    var back = document.querySelector('.back-link');
    if (back && backHref) { back.setAttribute('href', backHref); back.textContent = backLabel; }
  }

  function setText(sel, text) {
    if (text == null) return;
    var el = $(sel);
    if (el) el.textContent = text;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // Allow a tiny whitelist of tags: <a href="">, <em>, <strong>, <br>
  function sanitizeBasic(html) {
    // Strip scripts and event handlers defensively by parsing through DOM.
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var allowed = { A: ['href'], EM: [], STRONG: [], BR: [], I: [], B: [] };
    (function walk(node) {
      Array.prototype.slice.call(node.children || []).forEach(function (c) {
        if (!allowed[c.tagName]) {
          // Replace disallowed element with its text content
          var textNode = document.createTextNode(c.textContent || '');
          c.replaceWith(textNode);
          return;
        }
        // Strip attributes not whitelisted
        Array.prototype.slice.call(c.attributes).forEach(function (attr) {
          if (allowed[c.tagName].indexOf(attr.name) === -1) {
            c.removeAttribute(attr.name);
          }
        });
        if (c.tagName === 'A') {
          var href = c.getAttribute('href') || '';
          if (!/^(https?:|mailto:|\/|#)/i.test(href)) c.removeAttribute('href');
        }
        walk(c);
      });
    })(tpl.content);
    return tpl.innerHTML;
  }

})();
