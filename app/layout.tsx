import type { Metadata, Viewport } from "next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import InstallAppButton from "@/components/InstallAppButton";
import UpdateBanner from "@/components/UpdateBanner";
import StatsTracker from "@/components/StatsTracker";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"; // ضع هنا معرف قياس جوجل اناليتكس الخاص بك

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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
        <StatsTracker />
        <InstallAppButton />
        <UpdateBanner />
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
