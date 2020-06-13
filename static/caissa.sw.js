self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('sw-cache').then(function(cache) {
            return cache.add('/index.html')
                .then ( () => {
                    // this = ServiceWorkerGlobalScope
                    console.log('Info   :', 'ServiceWorke.cached', '/index.html');
                })
            ;
        }),
    );
});
 
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            console.log('Info   :', 'ServiceWorke.fetch', response);
            return response || fetch(event.request);
        }),
    );
});
