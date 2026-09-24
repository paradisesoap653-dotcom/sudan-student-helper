const VERSION = "v9-2026-09-24-a";
const CACHE_NAME = "sudan-student-helper-" + VERSION;

const APP_SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          APP_SHELL.map((path) =>
            cache.add(path).catch(() => undefined)
          )
        )
      )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== 'sudan-student-offline-pdfs' && key !== 'sudan-student-offline-lessons')
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API responses must never be cached.
  if (url.pathname.startsWith("/api/")) return;

  // For PDF files from external storage: use cache-first strategy
  if (url.pathname.endsWith('.pdf')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const copy = response.clone();
          caches.open('sudan-student-offline-pdfs').then(cache => cache.put(request, copy)).catch(() => {});
          return response;
        }).catch(() => caches.match("/"));
      })
    );
    return;
  }

  // Original app shell strategy for same-origin navigation/assets
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();

        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, copy))
          .catch(() => undefined);

        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("/"))
      )
  );
});
