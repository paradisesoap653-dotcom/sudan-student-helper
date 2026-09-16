'use client';

import { useEffect, useState } from 'react';
import { isPDFDownloaded, downloadPDFOffline, removePDFOffline } from '../lib/offline-pdfs';

interface PDFDownloadButtonProps {
  fileUrl: string;
  fileName: string;
}

export default function PDFDownloadButton({ fileUrl, fileName }: PDFDownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    isPDFDownloaded(fileUrl).then(setIsDownloaded);
  }, [fileUrl]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloaded) {
      if (confirm(`هل تريد ازالة "${fileName}" من الملفات المحملة بدون نت؟`)) {
        await removePDFOffline(fileUrl);
        setIsDownloaded(false);
      }
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    const success = await downloadPDFOffline(fileUrl, fileName, (p) => setProgress(p));
    if (success) {
      setIsDownloaded(true);
      alert('✅ تم تحميل الملف بنجاح! يمكنك فتحه بدون انترنت في اي وقت.');
    } else {
      alert('❌ فشل التحميل، حاول مرة اخرى عند توفر انترنت.');
    }
    setIsDownloading(false);
    setProgress(0);
  };

  if (!('caches' in window) || !navigator.serviceWorker?.controller) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDownloading}
      style={{
        flexShrink: 0,
        width: '38px',
        height: '38px',
        marginLeft: '8px',
        borderRadius: '8px',
        backgroundColor: isDownloaded ? '#14532d' : '#1e40af',
        color: 'white',
        fontWeight: 'bold',
        cursor: isDownloading ? 'wait' : 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isDownloaded ? '1px solid #22c55e' : 'none',
      }}
      title={isDownloaded ? 'محمل بدون نت - اضغط للازالة' : 'تحميل للعمل بدون انترنت'}
    >
      {isDownloading ? `${progress}%` : isDownloaded ? '✅' : '📥'}
    </button>
  );
}
