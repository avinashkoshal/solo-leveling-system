const CACHE_NAME = 'solo-leveling-v3';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/engine.js',
    './js/quests.js',
    './js/smart.js',
    './js/firebase-config.js',
    './js/ui.js',
    './js/app.js',
    './manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
        }).catch(() => caches.match('./index.html'))
    );
});
