import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { Toaster } from "sonner";
import { ClientOnly } from "../components/ClientOnly";
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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  try {
    console.log("Environment check:", {
      clerkKey: clerkKey ? "present" : "missing",
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ? "present" : "missing",
    });
  } catch (e) {
    console.error("Environment check failed:", e);
  }

  // Auth guard - only initialize Clerk if key is present
  if (!clerkKey) {
    console.error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing");
    return (
      <ConvexClientProvider>
        <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        >
          <body className="min-h-full flex flex-col bg-[#0b0e14] text-[#fafafa]">
            <AppProvider>
              <Toaster position="bottom-right" richColors theme="dark" />
              {children}
            </AppProvider>
          </body>
        </html>
      </ConvexClientProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexClientProvider>
        <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        >
          <body className="min-h-full flex flex-col bg-[#0b0e14] text-[#fafafa]">
            <AppProvider>
              <Toaster position="bottom-right" richColors theme="dark" />
              <ClientOnly fallback={null}>
                <Navbar />
              </ClientOnly>
              {children}
            </AppProvider>
            <ClientOnly fallback={null}>
              <GoogleAnalytics gaId="G-WR6V55XDBM" />
            </ClientOnly>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
