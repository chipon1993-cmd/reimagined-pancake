// nav.js — навигация, язык, темы

// ── SERVICE WORKER (PWA offline/caching) ────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ── ACCESSIBILITY: skip-to-content link ─────────────
(function initA11y() {
  const pw = document.querySelector('.page-wrapper') || document.querySelector('.hero');
  if (pw && !pw.id) pw.id = 'main-content';
  if (pw && !document.querySelector('.skip-link')) {
    const a = document.createElement('a');
    a.className = 'skip-link';
    a.href = '#main-content';
    a.textContent = 'Skip to content';
    document.body.prepend(a);
  }
})();

function toggleMenu() {
  const nl = document.getElementById('navLinks');
  if (!nl) return;
  const open = nl.classList.toggle('open');
  _moveControls(open, nl);
}
function closeMenu() {
  const nl = document.getElementById('navLinks');
  if (!nl) return;
  nl.classList.remove('open');
  _moveControls(false, nl);
}
function _moveControls(intoMenu, nl) {
  const c = document.querySelector('.nav-controls');
  if (!c) return;
  if (intoMenu && window.innerWidth <= 768) {
    nl.appendChild(c);
    c.classList.add('in-menu');
  } else if (c.classList.contains('in-menu')) {
    const navEl = document.querySelector('nav');
    const burger = document.getElementById('burger');
    if (navEl) navEl.insertBefore(c, burger);
    c.classList.remove('in-menu');
  }
}

// Подсветка активной ссылки
(function () {
  let cur = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0];
  // interest.html board pages → highlight Интересы
  if (cur === 'interest.html' || cur === 'post.html') cur = 'interests.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === cur) {
      a.classList.add('active');
      // Also highlight parent dropdown
      const parent = a.closest('.nav-has-sub');
      if (parent) parent.querySelector(':scope > a')?.classList.add('active');
    }
  });
})();

// Intersection Observer для fade-in
window.acObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) setTimeout(() => entry.target.classList.add('visible'), i * 80);
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach(el => window.acObs.observe(el));
  initLangTheme();
});

// ── ЯЗЫК ─────────────────────────────────────────────
function switchLang(lang) {
  localStorage.setItem('ac_lang', lang);
  if (window.AC_RERENDER) window.AC_RERENDER();
  translateNav();
  updateLangButtons();
  try {
    var log = JSON.parse(localStorage.getItem('ac_ship_log') || '[]');
    log.push({ ts: Date.now(), msg: 'Language switched to ' + lang.toUpperCase(), type: 'info' });
    if (log.length > 50) log = log.slice(-50);
    localStorage.setItem('ac_ship_log', JSON.stringify(log));
  } catch(e) {}
}

function translateNav() {
  const lang = localStorage.getItem('ac_lang') || 'ru';
  const t = window.AC_I18N && window.AC_I18N[lang];
  if (!t) return;
  const navD = window.AC_NAV_DATA;
  const navMap = {
    nav_about:'about', nav_journey:'journey', nav_interests:'interests',
    nav_videos:'videos', nav_contact:'contact',
    back_home:'backHome', back_interests:'backInterests'
  };
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    // Section labels handled by loader.js — skip to preserve admin edits
    if (key.startsWith('lbl_')) return;
    // Nav links — use admin-edited data if available
    const nk = navMap[key];
    if (nk && navD && navD[nk]) { el.textContent = navD[nk]; return; }
    // Other UI text — use translations
    if (t[key]) el.textContent = t[key];
  });
  const burger = document.getElementById('burger');
  if (burger && t.menu_label) burger.setAttribute('aria-label', t.menu_label);
}

function updateLangButtons() {
  const lang = localStorage.getItem('ac_lang') || 'ru';
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ── ТЕМА ─────────────────────────────────────────────
function switchTheme(theme) {
  localStorage.setItem('ac_theme', theme);
  applyTheme(theme);
  updateThemeDots(theme);
  try {
    var log = JSON.parse(localStorage.getItem('ac_ship_log') || '[]');
    log.push({ ts: Date.now(), msg: 'Theme changed to ' + theme, type: 'info' });
    if (log.length > 50) log = log.slice(-50);
    localStorage.setItem('ac_ship_log', JSON.stringify(log));
  } catch(e) {}
}

function applyTheme(theme) {
  // Reset custom inline styles first
  var root = document.documentElement;
  ['--accent','--accent2','--bg','--text','--glow','--glow2','--border','--border-h','--grid-accent'].forEach(function(p){
    root.style.removeProperty(p);
  });
  if (theme === 'custom') {
    root.removeAttribute('data-theme');
    if (window.applyCustomColors && window.AC_CUSTOM_COLORS) {
      window.applyCustomColors(window.AC_CUSTOM_COLORS);
    }
  } else if (theme === 'cyan' || !theme) {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

function updateThemeDots(theme) {
  theme = theme || 'cyan';
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === theme);
  });
}

// ── PAGE TRACKING (for console dashboard) ───────────
(function trackPageVisit() {
  var page = document.body && document.body.dataset.page;
  if (!page || page === 'console') return; // console tracks itself

  // Map data-page to page key
  var pageKey = page === 'interest-board' ? 'interests' : page;

  // Increment visit count
  try {
    var visits = JSON.parse(localStorage.getItem('ac_page_visits') || '{}');
    visits[pageKey] = (visits[pageKey] || 0) + 1;
    localStorage.setItem('ac_page_visits', JSON.stringify(visits));

    var lastVisits = JSON.parse(localStorage.getItem('ac_page_last_visit') || '{}');
    lastVisits[pageKey] = Date.now();
    localStorage.setItem('ac_page_last_visit', JSON.stringify(lastVisits));
  } catch(e) {}

  // Add to ship log
  try {
    var LOG_KEY = 'ac_ship_log';
    var log = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    var names = { index:'Home', about:'About', journey:'Journey', interests:'Interests', videos:'Videos', contact:'Contact' };
    log.push({ ts: Date.now(), msg: 'Navigated to ' + (names[pageKey] || pageKey), type: 'nav' });
    if (log.length > 50) log = log.slice(-50);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch(e) {}

  localStorage.setItem('ac_last_page', pageKey);
})();

// ── INIT ─────────────────────────────────────────────
function initLangTheme() {
  const lang  = localStorage.getItem('ac_lang')  || 'ru';
  // Auto-detect system preference for first-time visitors
  let theme = localStorage.getItem('ac_theme');
  if (!theme) {
    theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'cyan';
  }
  applyTheme(theme);
  updateThemeDots(theme);
  updateLangButtons();
  translateNav();
}
