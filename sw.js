const CACHE = 'bps-manual-v4';
const STATIC = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase.js',
  './manifest.json',
  './icons/icon.svg',
];

// Install: cache static assets immediately and skip waiting for silent update
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {})
  );
});

// Activate: take control of all clients immediately and remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      ),
    ])
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Firestore/Firebase API calls: always network (let Firebase SDK handle these)
  if (e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('gstatic.com')) return;

  // Static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
