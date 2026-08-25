"use client";

import { useEffect, useState } from "react";

let reloading = false;

export default function UpdateBanner() {
  const [waiting, setWaiting] =
    useState<ServiceWorker | null>(null);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const watch = (worker: ServiceWorker | null) => {
      if (!worker) return;

      worker.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setWaiting(worker);
        }
      });
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registration = reg;

        if (reg.waiting && navigator.serviceWorker.controller) {
          setWaiting(reg.waiting);
        }

        reg.addEventListener("updatefound", () => {
          watch(reg.installing);
        });
      })
      .catch(() => undefined);

    const onControllerChange = () => {
      if (reloading) return;

      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    const check = () => {
      if (registration) {
        registration.update().catch(() => undefined);
      }
    };

    const timer = window.setInterval(check, 60000);

    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        onVisible
      );

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  if (!waiting) return null;

  const refresh = () => {
    setBusy(true);

    waiting.postMessage({ type: "SKIP_WAITING" });

    window.setTimeout(() => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    }, 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        backgroundColor: "#1e293b",
        border: "1px solid #334155",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        color: "#e2e8f0",
        fontFamily: "inherit",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700 }}>
        يوجد تحديث جديد للتطبيق
      </span>

      <button
        onClick={refresh}
        disabled={busy}
        style={{
          flexShrink: 0,
          padding: "9px 18px",
          borderRadius: 10,
          border: "none",
          cursor: busy ? "default" : "pointer",
          backgroundColor: busy ? "#475569" : "#22c55e",
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "inherit",
        }}
      >
        {busy ? "جارٍ التحديث" : "تحديث"}
      </button>
    </div>
  );
}
