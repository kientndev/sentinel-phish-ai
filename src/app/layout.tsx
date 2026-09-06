import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { AppProvider } from "../context/AppContext";
import { PartnerProvider } from "../../contexts/PartnerContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Toaster } from "sonner";
import { ClientOnly } from "../components/ClientOnly";
import CapacitorListener from "../components/CapacitorListener";
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
  title: "SentinelShield AI - Real-time AI Phishing Detector",
  description: "Advanced URL Scrutiny and Phishing Detection.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  try {
    console.log("=== ENVIRONMENT CHECK ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10)}...` : "MISSING (Using placeholder)");
    console.log("NEXT_PUBLIC_CONVEX_URL:", convexUrl || "MISSING");
    console.log("========================");
  } catch {
    // Fail silently in environment check
  }

  return (
    <ClerkProvider 
      publishableKey={clerkKey}
      appearance={{
        elements: {
          rootBox: "display: contents",
        },
      }}
    >
      <ConvexClientProvider>
        <PartnerProvider>
          <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
          >
            <body className="min-h-full flex flex-col bg-[#0b0e14] text-[#fafafa]">
              <AppProvider>
                <CapacitorListener />
                <Toaster position="bottom-right" richColors theme="dark" />
                <ClientOnly fallback={null}>
                  <Navbar />
                </ClientOnly>
                <div className="flex-1 flex flex-col">
                  {children}
                </div>
                <Footer />
              </AppProvider>
              <ClientOnly fallback={null}>
                <GoogleAnalytics gaId="G-WR6V55XDBM" />
              </ClientOnly>
            </body>
          </html>
        </PartnerProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
