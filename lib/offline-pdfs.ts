// Offline PDF and book storage utilities
export async function downloadPDFOffline(pdfUrl: string, title: string, onProgress?: (progress: number) => void): Promise<boolean> {
  if (!('caches' in window) || !('serviceWorker' in navigator && navigator.serviceWorker.controller)) {
    alert('المتصفح عندك لا يدعم التحميل بدون انترنت، جرب متصفح كروم الاحدث.');
    return false;
  }

  try {
    onProgress?.(10);
    // Open cache for PDFs
    const cache = await caches.open('sudan-student-offline-pdfs');
    onProgress?.(30);

    // Fetch the PDF and cache it
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('فشل تحميل الملف');
    onProgress?.(60);
    
    await cache.put(pdfUrl, response.clone());
    onProgress?.(90);

    // Save metadata in IndexedDB so we can list downloaded files
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('sudan-student-offline', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'url' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('pdfs', 'readwrite');
      const store = tx.objectStore('pdfs');
      store.put({ url: pdfUrl, title, downloadedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    onProgress?.(100);
    return true;
  } catch (err) {
    console.error('PDF download failed:', err);
    return false;
  }
}

export async function isPDFDownloaded(pdfUrl: string): Promise<boolean> {
  if (!('caches' in window)) return false;
  const cache = await caches.open('sudan-student-offline-pdfs');
  const match = await cache.match(pdfUrl);
  return !!match;
}

export async function removePDFOffline(pdfUrl: string): Promise<void> {
  const cache = await caches.open('sudan-student-offline-pdfs');
  await cache.delete(pdfUrl);
  
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('sudan-student-offline', 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  await new Promise<void>((resolve) => {
    const tx = db.transaction('pdfs', 'readwrite');
    const store = tx.objectStore('pdfs');
    store.delete(pdfUrl);
    tx.oncomplete = () => resolve();
  });
}
