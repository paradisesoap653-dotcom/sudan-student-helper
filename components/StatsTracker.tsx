'use client';

import { useEffect, useState } from 'react';

const VISITOR_ID_KEY = 'ss-helper-visitor-id';

function generateId() {
  return 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function trackEvent(event: string) {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    // Use beacon to send without blocking
    const blob = new Blob([JSON.stringify({ event, visitorId })], { type: 'application/json' });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/stats/track', blob);
    } else {
      fetch('/api/stats/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, visitorId }),
        keepalive: true,
      }).catch(() => {});
    }

    // Update local counts
    const counts = JSON.parse(localStorage.getItem('ss-local-stats') || '{"visits":0,"installs":0,"chats":0,"downloads":0}');
    if (event === 'visit') counts.visits++;
    if (event === 'install') counts.installs++;
    if (event === 'chat_message') counts.chats++;
    if (event === 'download') counts.downloads++;
    localStorage.setItem('ss-local-stats', JSON.stringify(counts));
  } catch (e) {}
}

export default function StatsTracker() {
  useEffect(() => {
    // Track first visit
    const lastVisit = localStorage.getItem('ss-last-visit');
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (!lastVisit || Number(lastVisit) < oneHourAgo) {
      trackEvent('visit');
      localStorage.setItem('ss-last-visit', String(Date.now()));
    }

    // Listen for app install event
    const handleInstalled = () => {
      trackEvent('install');
    };
    window.addEventListener('appinstalled', handleInstalled);

    // Expose track function globally for use in other components
    (window as any).trackStatsEvent = trackEvent;

    return () => {
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  return null;
}

export function trackDownload() { trackEvent('download'); }
export function trackChatMessage() { trackEvent('chat_message'); }
