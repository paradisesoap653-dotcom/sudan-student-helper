import type { Metadata } from "next";
import InstallAppButton from "@/components/InstallAppButton";

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
      <body>
        <InstallAppButton />
        {children}
      </body>
    </html>
  );
}
