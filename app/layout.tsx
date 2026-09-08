import type { Metadata, Viewport } from "next";
import InstallAppButton from "@/components/InstallAppButton";
import UpdateBanner from "@/components/UpdateBanner";

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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
          crossOrigin="anonymous"
        />
      </head>
      <body
        style={{
          minHeight: "100%",
          margin: 0,
          backgroundColor: "#0f172a",
        }}
      >
        <InstallAppButton />
        <UpdateBanner />
        {children}
      </body>
    </html>
  );
}
