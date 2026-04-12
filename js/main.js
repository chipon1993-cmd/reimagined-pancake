/* ========================================
   chepelovskyi.com — main.js
   Navigation toggle, active link, search filter, contact form
   ======================================== */

(function () {
  'use strict';

  // ── Mobile nav toggle ──
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', toggle.classList.contains('open') ? 'true' : 'false');
    });
    // Close menu on link click (mobile)
    links.addEventListener('click', function (e) {
      if (e.target.matches('a')) {
        toggle.classList.remove('open');
        links.classList.remove('open');
      }
    });
  }

  // ── Notes search (client-side filter) ──
  function initSearch() {
    var input = document.querySelector('[data-search]');
    if (!input) return;
    var list = document.querySelector('[data-search-list]');
    var emptyMsg = document.querySelector('[data-search-empty]');
    if (!list) return;

    var cards = Array.prototype.slice.call(list.querySelectorAll('.note-card'));

    function filter() {
      var q = (input.value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var excerpt = (card.getAttribute('data-excerpt') || '').toLowerCase();
        var match = !q || title.indexOf(q) !== -1 || excerpt.indexOf(q) !== -1;
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
    }

    input.addEventListener('input', filter);
  }

  // ── Contact form (Web3Forms, AJAX no-reload) ──
  function initContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');

    function showStatus(kind, text) {
      if (!status) return;
      status.className = 'form-status show ' + kind;
      status.textContent = text;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submit) { submit.disabled = true; submit.textContent = 'Отправляю…'; }

      var data = new FormData(form);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body && res.body.success) {
            showStatus('success', 'Спасибо. Письмо отправлено — отвечу как смогу.');
            form.reset();
          } else {
            showStatus('error', (res.body && res.body.message) || 'Что-то пошло не так. Попробуй ещё раз позже.');
          }
        })
        .catch(function () {
          showStatus('error', 'Не удалось отправить. Проверь интернет и попробуй снова.');
        })
        .then(function () {
          if (submit) { submit.disabled = false; submit.textContent = 'Отправить'; }
        });
    });
  }

  // ── Year in footer ──
  function initYear() {
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }

  // ── Hidden admin entry ──
  // Triple-click the footer year to open /admin.html, OR press Ctrl+Shift+A.
  // The admin page itself is protected by Firebase Auth.
  function initAdminEntry() {
    var y = document.querySelector('[data-year]');
    if (y) {
      y.addEventListener('click', function (e) {
        if (e.detail === 3) {
          window.location.href = '/admin.html';
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.location.href = '/admin.html';
      }
    });
  }

  // ── Register service worker (offline support) ──
  function initSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () { /* silent */ });
    });
  }

  // ── Boot ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNav(); initSearch(); initContactForm(); initYear(); initAdminEntry(); initSW();
    });
  } else {
    initNav(); initSearch(); initContactForm(); initYear(); initAdminEntry(); initSW();
  }
})();
