"use client";

import { useEffect } from "react";

/**
 * Gabster - فقاعة دردشة تطفو على صفحات موقعك
 * cbid: 6a57d58b25f52108aeb403b3
 * النوع: widget (واجهة عائمة)
 */
export default function GabsterWidget() {
  useEffect(() => {
    // تجنب التحميل المكرر عند التنقل بين الصفحات
    if (document.querySelector("script[data-gabster-widget]")) {
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://widget.gabster.ai/loader?cbid=6a57d58b25f52108aeb403b3";
    script.setAttribute("data-gabster-widget", "");
    script.setAttribute("data-embed-type", "widget");
    script.async = true;

    document.body.appendChild(script);

    // لا نحذف السكربت عند unmount لأنه يدير الواجهة العائمة بشكل عام
  }, []);

  return null;
}
