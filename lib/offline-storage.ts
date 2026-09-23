// Utility functions for offline lesson storage using IndexedDB

const DB_NAME = 'sudan-student-offline';
const DB_VERSION = 1;
const STORE_NAME = 'lessons';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result as IDBDatabase);
    req.onerror = () => reject(req.error);
  });
}

export async function saveLessonOffline(lessonId: string, content: any, onProgress?: (p: number) => void): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Simulate progress for UI feedback
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress <= 100) onProgress(progress);
        if (progress >= 100) clearInterval(interval);
      }, 100);
    }
    store.put({ id: lessonId, content, downloadedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineLesson(lessonId: string): Promise<any | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(lessonId);
    req.onsuccess = () => resolve(req.result?.content || null);
    req.onerror = () => reject(req.error);
  });
}

export async function isLessonDownloaded(lessonId: string): Promise<boolean> {
  const lesson = await getOfflineLesson(lessonId);
  return lesson !== null;
}

export async function removeOfflineLesson(lessonId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(lessonId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheLessonAssets(lessonId: string, assets: string[]): Promise<void> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  // Cache lesson assets via service worker
  const cache = await caches.open('sudan-student-offline-lessons');
  await Promise.all(assets.map(url => cache.add(url).catch(() => undefined)));
}

// Register event to listen for service worker messages for download progress
export function listenForDownloadProgress(callback: (lessonId: string, progress: number) => void) {
  if (!('serviceWorker' in navigator)) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'DOWNLOAD_PROGRESS') {
      callback(event.data.lessonId, event.data.progress);
    }
  };
  navigator.serviceWorker.addEventListener('message', handler);
  return () => navigator.serviceWorker.removeEventListener('message', handler);
}
