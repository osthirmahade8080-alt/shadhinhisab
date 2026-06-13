// স্বাধীন হিসাব PRO - Service Worker
const VERSION = 'v1.0.0';
const CACHE_NAME = `shadhinhisab-${VERSION}`;

const ASSETS = [
  '/',
  '/index.html'
];

// Install - cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Activate immediately
});

// Activate - delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET and chrome-extension requests
  if (e.request.method !== 'GET' || e.request.url.startsWith('chrome-extension')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh response
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)) // Offline fallback
  );
});

// Listen for skip-waiting message from UI
self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
