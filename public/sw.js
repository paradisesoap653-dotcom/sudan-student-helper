const VERSION = "v8-2026-09-15-offline-button-fix";
const CACHE_NAME = "sudan-student-helper-" + VERSION;
const LESSONS_CACHE = "sudan-student-offline-lessons";
const PDF_CACHE = "sudan-student-offline-pdfs";

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
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          // حذف جميع الكاش القديم تماما لضمان التحديث
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
  // تفعيل النسخة الجديدة فورا بدون انتظار اغلاق التبويب
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  // Handle bulk cache of lesson assets from the app
  if (event.data && event.data.type === "CACHE_LESSON_URLS") {
    event.waitUntil(
      caches.open(LESSONS_CACHE).then(cache =>
        Promise.all(event.data.urls.map(url => cache.add(url).catch(() => {})))
      )
    );
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API responses (especially health) must never be cached
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Cache all PDFs automatically so they work offline when you open them once
  if (url.pathname.endsWith('.pdf') || url.hostname.includes('supabase.co') ) {
    event.respondWith(
      caches.open(PDF_CACHE).then(pdfCache =>
        pdfCache.match(request).then(async cachedPdf => {
          // Always fetch from network first and update the cache automatically
          return fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              pdfCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // If network fails return cached PDF if available
            return cachedPdf || caches.match("/");
          });
        })
      )
    );
    return;
  }

  // Check for cached lesson pages first for perfect offline support
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      // Return cached response immediately if available, then update cache in background
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          // Also cache lesson pages in the lessons cache if they are lesson pages
          if (url.pathname.startsWith("/lessons/")) {
            caches.open(LESSONS_CACHE).then(cache => cache.put(request, copy.clone()));
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to lessons cache if main cache miss
          return caches.open(LESSONS_CACHE).then(cache => cache.match(request));
        });

      return cachedResponse || fetchPromise.catch(() => caches.match("/"));
    })
  );
});

