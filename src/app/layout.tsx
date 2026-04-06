import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SentinelPhish - Real-time AI Phishing Detector",
  description: "Advanced URL Scrutiny and Phishing Detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0e14] text-[#fafafa]">
          <AppProvider>
            <Navbar />
            {children}
          </AppProvider>
        <GoogleAnalytics gaId="G-WR6V55XDBM" />
      </body>
    </html>
  );
}
