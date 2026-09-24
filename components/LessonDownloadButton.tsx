'use client';

import { useEffect, useState } from 'react';
import { trackDownload } from './StatsTracker';

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

async function saveLessonOffline(lessonId: string, content: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id: lessonId, content, downloadedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function isLessonDownloaded(lessonId: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

async function removeOfflineLesson(lessonId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(lessonId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

interface LessonDownloadButtonProps {
  lessonId: string;
  lessonContent: any;
}

export default function LessonDownloadButton({ lessonId, lessonContent }: LessonDownloadButtonProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    isLessonDownloaded(lessonId).then(setIsDownloaded);
  }, [lessonId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloaded) {
      if (confirm('هل تريد ازالة هذا الدرس من المحتوى المحمل بدون نت؟')) {
        await removeOfflineLesson(lessonId);
        setIsDownloaded(false);
      }
      return;
    }

    setIsDownloading(true);
    try {
      await saveLessonOffline(lessonId, lessonContent);
      setIsDownloaded(true);
      trackDownload();
      alert('✅ تم تحميل الدرس بنجاح! يمكنك فتحه بدون انترنت في اي وقت.');
    } catch (e) {
      console.error('Lesson download error:', e);
      alert('❌ فشل تحميل الدرس، تأكد من الانترنت وحاول مرة اخرى.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!('indexedDB' in window)) return null;

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
      title={isDownloaded ? 'محمل بدون نت - اضغط للازالة' : 'تحميل الدرس للعمل بدون انترنت'}
    >
      {isDownloading ? '⏳' : isDownloaded ? '✅' : '📥'}
    </button>
  );
}
