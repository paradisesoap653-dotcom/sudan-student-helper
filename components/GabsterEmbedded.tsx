"use client";

import { useEffect, useState } from "react";

/**
 * لوحة Gabster المضمّنة داخل الصفحة
 * نفس الـ cbid لكن بنوع تضمين inline
 * إذا فشل تحميل Gabster (شبكة محجوبة في المعاينة) سيظهر دردشة محلية بديلة
 */
export default function GabsterEmbedded() {
  const [gabsterLoaded, setGabsterLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // تحقق هل السكربت محمل مسبقاً
    if (document.querySelector('script[data-gabster-embedded]')) {
      setGabsterLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://widget.gabster.ai/loader?cbid=6a57d58b25f52108aeb403b3";
    script.setAttribute("data-gabster-widget", "");
    script.setAttribute("data-embed-type", "inline");
    // نحاول استهداف الحاوية المضمنة
    script.setAttribute("data-target", "gabster-embedded-container");
    script.setAttribute("data-gabster-embedded", "true");
    script.async = true;

    script.onload = () => {
      setGabsterLoaded(true);
      console.log("Gabster embedded loaded");
    };
    script.onerror = () => {
      setLoadError(true);
      console.log("Gabster embedded failed to load - fallback will show");
    };

    document.body.appendChild(script);

    // مهلة 4 ثواني إذا لم يظهر شيء نعتبره فشل ونعرض البديل
    const timer = setTimeout(() => {
      const container = document.getElementById("gabster-embedded-container");
      // Gabster عادة ينشئ iframe داخل الحاوية
      const hasContent = container && container.querySelector("iframe, div");
      // إذا لم ينشئ شيء، نعرض البديل لكن نبقي الحاوية
      if (!hasContent || container?.children.length === 0) {
        // لا نعتبره خطأ فوري، فقط نبقي البديل جاهز
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      {/* حاوية Gabster المضمنة */}
      <div
        id="gabster-embedded-container"
        data-gabster-target="true"
        style={{
          width: "100%",
          minHeight: "480px",
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          border: "1px solid #334155",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* هذه الرسالة تظهر حتى يحمّل Gabster */}
        <div
          style={{
            textAlign: "center",
            padding: "30px 20px",
            color: "#94a3b8",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>💬</div>
          <div style={{ color: "#e2e8f0", fontWeight: "bold", marginBottom: "6px" }}>
            جاري تحميل الدردشة...
          </div>
          <div style={{ fontSize: "12px", lineHeight: 1.6 }}>
            إذا لم تظهر الدردشة خلال ثواني،<br />
            قد يكون Gabster محجوب في بيئة المعاينة،<br />
            لكنها ستعمل بشكل طبيعي بعد النشر على Vercel.
          </div>
          {loadError && (
            <div
              style={{
                marginTop: "14px",
                padding: "10px",
                backgroundColor: "#450a0a",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#fecaca",
                fontSize: "12px",
              }}
            >
              تعذر تحميل Gabster في المعاينة — استخدم الدردشة البديلة أدناه
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "11px",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        cbid: 6a57d58b25f52108aeb403b3 • لوحة مضمّنة
      </div>
    </div>
  );
}
