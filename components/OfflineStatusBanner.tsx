'use client';

import { useEffect, useState } from 'react';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '10px 16px',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: isOnline ? '#10b981' : '#ef4444',
      }}
    >
      {isOnline ? '✅ عاد الاتصال بالانترنت، تم تحديث المحتوى' : '📴 انت الان غير متصل بالانترنت — تعمل على المحتوى المحمل مسبقا'}
    </div>
  );
}
