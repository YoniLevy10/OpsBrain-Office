import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PWARegister } from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "OpsBrain Finance",
  description: "המערכת התפעולית הפיננסית של העסק שלך",
  applicationName: "OpsBrain Finance",
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
  themeColor: "#FFFFFF",
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
          <main className="flex-1 min-w-0 pb-mobile-nav">{children}</main>
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
