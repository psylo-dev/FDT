const CACHE_NAME = 'ticket-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/lib/qrcode.min.js',
    '/lib/jquery.min.js',
    '/lib/qrcode.js',
    '/assets/d_ticket_logo.png',
    '/assets/transdev_logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});