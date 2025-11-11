// Service Worker for Tension Chart PWA
// Strategy: App Shell + Stale-While-Revalidate

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `tension-chart-${CACHE_VERSION}`;

// Files to cache immediately on install (App Shell)
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://cdn.tailwindcss.com'
];

// ============================================
// Install Event
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching App Shell');
      return cache.addAll(APP_SHELL);
    }).then(() => {
      // Force activation immediately
      return self.skipWaiting();
    })
  );
});

// ============================================
// Activate Event
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);

  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// ============================================
// Fetch Event - Stale-While-Revalidate
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Fetch from network in background
        const fetchPromise = fetch(request).then((networkResponse) => {
          // Update cache with fresh response
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.log('[SW] Fetch failed, using cache:', request.url);
          // Network failed, return cached version if available
          return cachedResponse;
        });

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// ============================================
// Message Event (for manual cache updates)
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        return self.clients.matchAll();
      }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED' });
        });
      })
    );
  }
});

// ============================================
// Sync Event (Background Sync - future enhancement)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-entries') {
    console.log('[SW] Background sync triggered');
    // Future: sync with backend when available
  }
});

// ============================================
// Push Event (Push Notifications - future enhancement)
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  const options = {
    body: event.data ? event.data.text() : '今日のチャートを入力しましょう！',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: '開く'
      },
      {
        action: 'close',
        title: '閉じる'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('緊張構造チャート', options)
  );
});

// ============================================
// Notification Click Event
// ============================================
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

console.log('[SW] Service Worker loaded', CACHE_VERSION);
