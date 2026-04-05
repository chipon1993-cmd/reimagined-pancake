// Service Worker — offline caching for Andrii Chepelovskyi site
const CACHE = 'ac-v20';
const SHELL = [
  '/', '/index.html', '/about.html', '/journey.html',
  '/interests.html', '/videos.html', '/contact.html',
  '/interest.html', '/post.html', '/404.html',
  '/style.css', '/site-data.js', '/translations.js',
  '/firebase-config.js', '/loader.js', '/nav.js', '/effects.js',
  '/favicon.svg', '/og-image.png', '/manifest.json'
];

// Install: pre-cache app shell, skip waiting to activate immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean ALL old caches, claim clients
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip: non-GET, extensions, admin, Firebase/external APIs
  if (e.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.includes('admin')) return;
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) return;

  // HTML pages + site-data: network-first (always fresh, offline fallback)
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html') || url.pathname.endsWith('site-data.js')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r.ok) {
            const clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return r;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/404.html')))
    );
    return;
  }

  // JS/CSS/images: stale-while-revalidate (fast + fresh in background)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
