import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PWARegister } from "@/components/PWARegister";
import { PullToRefresh } from "@/components/layout/PullToRefresh";

export const metadata: Metadata = {
  title: "OpsBrain Finance",
  description: "המערכת התפעולית הפיננסית של העסק שלך",
  applicationName: "OpsBrain Finance",
  icons: {
    icon: [
      { url: "/brand/brain-icon.png", sizes: "512x512", type: "image/png" },
      { url: "/brand/brain-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OpsBrain",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#121820",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        <PWARegister />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-mobile-nav">
            <PullToRefresh>{children}</PullToRefresh>
          </main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
