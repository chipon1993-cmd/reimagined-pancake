// Service Worker — offline caching for Andrii Chepelovskyi site
const CACHE = 'ac-v1';
const SHELL = [
  '/', '/index.html', '/about.html', '/journey.html',
  '/interests.html', '/videos.html', '/contact.html',
  '/interest.html', '/404.html',
  '/style.css', '/site-data.js', '/translations.js',
  '/loader.js', '/nav.js', '/effects.js',
  '/favicon.svg', '/og-image.png', '/manifest.json'
];

// Install: pre-cache app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET, chrome-extension, admin
  if (e.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.includes('admin')) return;

  // HTML pages: network-first (fresh content + offline fallback)
  if (e.request.mode === 'navigate' || e.request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

  // Assets: cache-first (fast), update in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(r => {
        if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
