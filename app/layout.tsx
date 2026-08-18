import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "مساعد الشهادة الثانوية السودانية",
  description: "المكتبة الرقمية الشاملة لطلاب الشهادة الثانوية السودانية",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مساعد الشهادة",
  },

  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="مساعد الشهادة"
        />
        <meta name="theme-color" content="#0f172a" />
      </head>

      <body>{children}</body>
    </html>
  );
}
