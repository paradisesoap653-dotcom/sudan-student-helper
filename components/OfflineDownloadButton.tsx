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
    return null; // Hide on unsupported browsers
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isDownloaded
          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isDownloading ? (
        <>
          <span className="animate-spin">⏳</span>
          جاري التحميل... {progress}%
        </>
      ) : isDownloaded ? (
        <>
          ✅ محمل بدون نت
        </>
      ) : (
        <>
          📥 تحميل للعمل بدون انترنت
        </>
      )}
    </button>
  );
}
