// Service Worker — chepelovskyi.com v25 (rebuild 2026)
// Purge-all and minimal offline shell caching.
const CACHE = 'ac-v25';
const SHELL = [
  '/',
  '/index.html',
  '/path.html',
  '/notes.html',
  '/poetry.html',
  '/youtube.html',
  '/contact.html',
  '/css/main.css',
  '/js/main.js',
  '/favicon.svg',
  '/favicon.ico',
  '/manifest.json'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Network-first for HTML, stale-while-revalidate for assets.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname !== location.hostname) return; // don't cache cross-origin (fonts, web3forms, youtube)

  var isHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if (isHtml) {
    e.respondWith(
      fetch(req).then(function (r) {
        if (r.ok) {
          var clone = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, clone); });
        }
        return r;
      }).catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('/404.html') || caches.match('/'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cached) {
      var fetched = fetch(req).then(function (r) {
        if (r.ok) {
          var clone = r.clone();
          caches.open(CACHE).then(function (c) { c.put(req, clone); });
        }
        return r;
      }).catch(function () { return cached; });
      return cached || fetched;
    })
  );
});
