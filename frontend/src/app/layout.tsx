import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "YongHealth - 운동 일지",
  description: "하루하루 운동 기록을 관리하는 웹 애플리케이션",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YongHealth",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 env-safe">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-4 md:px-4 md:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
