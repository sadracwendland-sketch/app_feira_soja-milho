// ===============================
// STINE PWA — SERVICE WORKER SEGURO
// ===============================

const CACHE_NAME = "stine-cache-v1";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// NÃO intercepta navegação principal
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Só cache para arquivos estáticos
  if (
    event.request.destination === "script" ||
    event.request.destination === "style" ||
    event.request.destination === "image" ||
    event.request.destination === "font"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        });
      })
    );
  }
});
