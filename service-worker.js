// ===============================
// STINE PWA — SERVICE WORKER OTIMIZADO
// ===============================

const CACHE_VERSION = "stine-pwa-v2";
const STATIC_CACHE = CACHE_VERSION + "-static";

// Arquivos essenciais (somente o necessário)
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.json"
];

// ===============================
// INSTALL — Cache básico
// ===============================
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
  );
});

// ===============================
// ACTIVATE — Limpa cache antigo
// ===============================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===============================
// FETCH — Estratégia inteligente
// ===============================
self.addEventListener("fetch", event => {
  const req = event.request;

  // HTML → sempre tenta rede primeiro
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Outros arquivos → cache primeiro
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
});
