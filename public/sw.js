// ROYAL TURF — Service Worker (PWA Offline Caching & Instant Network-First Updates)
const APP_VERSION = 'v38-adana-istanbul-dynamic-cities-20261121';
const CACHE_NAME = `royal-turf-${APP_VERSION}`;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eski önbellek silindi:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED', version: APP_VERSION });
        });
      });
    })
  );
});

// NETWORK-FIRST: Daima canlı sunucudaki en güncel HTML ve yarış verisini çeker,
// sadece internet kesildiğinde önbellekten servis eder.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Sayfa gezinmesi (HTML) veya Canlı Yarış JSON Verileri -> Daima Network First
  const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/');
  const isData = url.pathname.includes('/data/') || url.pathname.endsWith('.json');

  if (isHtml || isData) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (isHtml) return caches.match('./index.html');
            return null;
          });
        })
    );
    return;
  }

  // 2. Statik simgeler ve resimler -> Önbellek, bulunamazsa ağ
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
