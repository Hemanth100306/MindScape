// MindScape Service Worker — Cache-first strategy for offline support
const CACHE_NAME = 'mindscape-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Skip non-GET and cross-origin requests (Firebase, Groq API, etc.)
    if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;

    e.respondWith(
        caches.match(e.request).then((cached) => {
            const networkFetch = fetch(e.request).then((response) => {
                // Cache HTML and static assets
                if (response.ok && (e.request.url.endsWith('.html') || e.request.url.endsWith('/') || e.request.url.match(/\.(js|css|woff2|png|svg)$/))) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached); // Fall back to cache if offline

            return cached || networkFetch;
        })
    );
});
