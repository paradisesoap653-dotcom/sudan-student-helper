import type { Metadata, Viewport } from "next";
import InstallAppButton from "@/components/InstallAppButton";

export const metadata: Metadata = {
  title: "مساعد الشهادة الثانوية السودانية",
  description: "المكتبة الرقمية الشاملة لطلاب الشهادة الثانوية السودانية",

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/icon.svg",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مساعد الشهادة",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          minHeight: "100%",
          margin: 0,
          backgroundColor: "#0f172a",
        }}
      >
        <InstallAppButton />
        {children}
      </body>
    </html>
  );
}
