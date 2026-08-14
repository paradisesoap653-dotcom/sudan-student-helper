import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مساعد الشهادة السودانية",
  description: "مكتبة رقمية شاملة لطلاب الشهادة السودانية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
