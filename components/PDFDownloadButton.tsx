'use client';

import { useEffect, useState } from 'react';
import { trackDownload } from './StatsTracker';

interface PDFDownloadButtonProps {
  fileUrl: string;
  fileName: string;
}

export default function PDFDownloadButton({ fileUrl, fileName }: PDFDownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function check() {
      if (!('caches' in window)) return;
      try {
        const cache = await caches.open('sudan-student-offline-pdfs');
        const match = await cache.match(fileUrl);
        setIsDownloaded(!!match);
      } catch (e) {}
    }
    check();
  }, [fileUrl]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloaded) {
      if (confirm(`هل تريد ازالة "${fileName}" من الملفات المحملة بدون نت؟`)) {
        const cache = await caches.open('sudan-student-offline-pdfs');
        await cache.delete(fileUrl);
        const saved = JSON.parse(localStorage.getItem('offline-file-titles') || '{}');
        delete saved[fileUrl];
        localStorage.setItem('offline-file-titles', JSON.stringify(saved));
        setIsDownloaded(false);
      }
      return;
    }

    setIsDownloading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const cache = await caches.open('sudan-student-offline-pdfs');
      // Use no-cors mode to bypass CORS restrictions for external PDF storage
      const res = await fetch(fileUrl, { signal: controller.signal, mode: 'no-cors' });
      clearTimeout(timeoutId);
      await cache.put(fileUrl, res);
      const saved = JSON.parse(localStorage.getItem('offline-file-titles') || '{}');
      saved[fileUrl] = fileName;
      localStorage.setItem('offline-file-titles', JSON.stringify(saved));
      setIsDownloaded(true);
      trackDownload();
      alert('✅ تم تحميل الكتاب بنجاح! يمكنك فتحه بدون انترنت في اي وقت.');
    } catch (e) {
      console.error('Download error:', e);
      alert('❌ فشل التحميل، تأكد من استقرار الانترنت وحاول مرة اخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!('caches' in window)) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isDownloading}
      style={{
        flexShrink: 0,
        width: '48px',
        height: '48px',
        marginLeft: '8px',
        borderRadius: '8px',
        border: isDownloaded ? '2px solid #22c55e' : 'none',
        backgroundColor: isDownloaded ? '#14532d' : '#1e40af',
        color: 'white',
        fontWeight: 'bold',
        cursor: isDownloading ? 'wait' : 'pointer',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={isDownloaded ? 'محمل بدون نت - اضغط للازالة' : 'تحميل للعمل بدون انترنت'}
    >
      {isDownloading ? '⏳' : isDownloaded ? '✅' : '📥'}
    </button>
  );
}
