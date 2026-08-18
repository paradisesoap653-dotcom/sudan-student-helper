"use client";

import { useEffect, useState } from "react";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // =========================================
    // التحقق هل التطبيق مثبت بالفعل
    // =========================================

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
    }

    // =========================================
    // التحقق من iPhone / iPad
    // =========================================

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !(window.navigator as any).standalone;

    setIsIOS(ios);

    // =========================================
    // Android / Chrome
    // =========================================

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      setDeferredPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    // =========================================
    // تسجيل Service Worker
    // =========================================

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          console.log("Service Worker registered successfully");
        })
        .catch((error) => {
          console.log("Service Worker registration error:", error);
        });
    }

    // =========================================
    // مراقبة اكتمال التثبيت
    // =========================================

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    // =========================================
    // تنظيف الأحداث
    // =========================================

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  // =========================================
  // زر التثبيت
  // =========================================

  const handleInstall = async () => {
    // -----------------------------------------
    // iPhone / iPad
    // -----------------------------------------

    if (isIOS) {
      setShowIOS(true);
      return;
    }

    // -----------------------------------------
    // Android / Chrome
    // -----------------------------------------

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();

        const result = await deferredPrompt.userChoice;

        if (result.outcome === "accepted") {
          setInstalled(true);
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.log("Install prompt error:", error);
      }

      return;
    }

    // -----------------------------------------
    // المتصفح لا يدعم نافذة التثبيت المباشر
    // -----------------------------------------

    alert(
      "لتثبيت التطبيق، افتح قائمة المتصفح واختر «إضافة إلى الشاشة الرئيسية»."
    );
  };

  // =========================================
  // إذا كان التطبيق مثبتًا لا نعرض الزر
  // =========================================

  if (installed) {
    return null;
  }

  return (
    <>
      {/* =====================================
          زر تثبيت التطبيق
      ===================================== */}

      <button
        onClick={handleInstall}
        aria-label="تثبيت التطبيق"
        style={{
          position: "fixed",
          top: "12px",
          right: "12px",
          zIndex: 99999,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          gap: "7px",

          padding: "9px 14px",

          border: "none",
          borderRadius: "999px",

          background:
            "linear-gradient(135deg, #2563eb, #0ea5e9)",

          color: "#fff",

          fontSize: "13px",
          fontWeight: "bold",

          boxShadow:
            "0 5px 18px rgba(0,0,0,0.35)",

          cursor: "pointer",

          direction: "rtl",
        }}
      >
        📲 تثبيت التطبيق
      </button>

      {/* =====================================
          نافذة شرح iPhone
      ===================================== */}

      {showIOS && (
        <div
          onClick={() => setShowIOS(false)}
          style={{
            position: "fixed",
            inset: 0,

            zIndex: 100000,

            background: "rgba(0,0,0,0.65)",

            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",

            padding: "20px",

            direction: "rtl",
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",

              background: "#fff",
              color: "#111827",

              borderRadius: "22px",

              padding: "24px",

              textAlign: "center",

              boxShadow:
                "0 -10px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* الأيقونة */}

            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              📱
            </div>

            {/* العنوان */}

            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "21px",
              }}
            >
              تثبيت التطبيق على الآيفون
            </h2>

            {/* الشرح */}

            <p
              style={{
                margin: "0 0 18px",

                lineHeight: 1.8,

                color: "#475569",

                fontSize: "15px",
              }}
            >
              اضغط على زر <b>المشاركة ⬆️</b>
              <br />
              ثم اختر <b>إضافة إلى الشاشة الرئيسية</b>
            </p>

            {/* خطوات */}

            <div
              style={{
                background: "#f1f5f9",

                borderRadius: "14px",

                padding: "14px",

                marginBottom: "18px",

                fontSize: "14px",

                lineHeight: 2,
              }}
            >
              📤 المشاركة
              <span style={{ margin: "0 8px" }}>
                →
              </span>
              ➕ إضافة إلى الشاشة الرئيسية
            </div>

            {/* زر الإغلاق */}

            <button
              onClick={() => setShowIOS(false)}
              style={{
                width: "100%",

                padding: "12px",

                border: "none",

                borderRadius: "10px",

                background: "#2563eb",

                color: "#fff",

                fontWeight: "bold",

                fontSize: "15px",

                cursor: "pointer",
              }}
            >
              فهمت 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
                }
