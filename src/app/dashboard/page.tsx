"use client";

import dynamic from "next/dynamic";
import XPBar from "../../components/XPBar";
import { ClientOnly } from "../../components/ClientOnly";
import { LoginGuard } from "../../components/LoginGuard";
import DashboardLoading from "./loading";

// Dynamically import heavy dashboard charts and history tables
const DashboardMetrics = dynamic(() => import("./DashboardMetrics"), {
  ssr: false,
  loading: () => <DashboardLoading />,
});

export default function DashboardPage() {
  return (
    <LoginGuard>
      <ClientOnly fallback={<DashboardLoading />}>
        <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 relative overflow-hidden">
          <XPBar />

          <div className="max-w-6xl w-full space-y-10">
            {/* Header */}
            <section className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">Agent Analytics</h1>
                <p className="text-[#a1a1aa] font-medium">Real-time threat intelligence performance</p>
              </div>
            </section>

            {/* Lazy loaded metrics & charts */}
            <DashboardMetrics />
          </div>
        </main>
      </ClientOnly>
    </LoginGuard>
  );
}
