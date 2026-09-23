'use client';

import { useEffect, useState } from 'react';
import { isLessonDownloaded, saveLessonOffline, removeOfflineLesson } from '../lib/offline-storage';

interface OfflineDownloadButtonProps {
  lessonId: string;
  lessonContent: any;
}

export default function OfflineDownloadButton({ lessonId, lessonContent }: OfflineDownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    isLessonDownloaded(lessonId).then(setIsDownloaded);
  }, [lessonId]);

  const handleDownload = async () => {
    if (isDownloaded) {
      if (confirm('هل تريد ازالة هذا الدرس من الذاكرة؟')) {
        await removeOfflineLesson(lessonId);
        setIsDownloaded(false);
      }
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    try {
      await saveLessonOffline(lessonId, lessonContent, (p) => setProgress(p));
      setIsDownloaded(true);
      alert('✅ تم تحميل الدرس بنجاح! يمكنك فتحه بدون انترنت في اي وقت.');
    } catch (e) {
      alert('❌ حدث خطأ اثناء التحميل، حاول مرة اخرى.');
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  if (!('indexedDB' in window)) {
    return null;
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 20px',
        borderRadius: '12px',
        border: isDownloaded ? '2px solid #22c55e' : 'none',
        backgroundColor: isDownloaded ? '#14532d' : '#16a34a',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: isDownloading ? 'wait' : 'pointer',
        boxShadow: '0 4px 15px rgba(22,163,74,0.35)',
        width: '100%',
        marginBottom: '15px'
      }}
    >
      {isDownloading ? (
        <>⏳ جاري التحميل... {progress}%</>
      ) : isDownloaded ? (
        <>✅ تم التحميل - يعمل بدون نت</>
      ) : (
        <>📥 اضغط هنا لتحميل الدرس للعمل بدون انترنت</>
      )}
    </button>
  );
}
