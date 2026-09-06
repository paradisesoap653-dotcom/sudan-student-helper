"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ChatFAB() {
  const pathname = usePathname();
  // لا نظهر الزر داخل صفحة الدردشة نفسها
  if (pathname === "/chat") return null;

  return (
    <Link
      href="/chat"
      aria-label="افتح الدردشة"
      style={{
        position: "fixed",
        bottom: "18px",
        left: "18px", // في RTL اليسار هو المكان الطبيعي للـ FAB حتى لا يغطي أزرار التثبيت
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "13px 16px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
        textDecoration: "none",
        boxShadow: "0 8px 24px rgba(37,99,235,0.45)",
        border: "1px solid rgba(255,255,255,0.18)",
        direction: "rtl",
      }}
    >
      <span style={{ fontSize: "18px" }}>💬</span>
      <span>الدردشة</span>
    </Link>
  );
}
