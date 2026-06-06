/**
 * Service Worker de Cafecito.
 * Estrategia "network-first" con respaldo en caché: intenta traer lo más
 * reciente de internet; si no hay señal, sirve lo último guardado. Así la
 * app abre aunque la tienda no tenga internet.
 */
const CACHE = 'cafecito-v1';
const APP_SHELL = ['/', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Solo manejamos navegaciones y peticiones GET del mismo origen.
  if (req.method !== 'GET') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copia)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
  );
});
