export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 max-w-6xl w-full mx-auto space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2 text-center md:text-left">
          <div className="h-10 w-56 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-4 w-80 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 rounded-full bg-white/10" />
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-8 w-16 bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="w-full h-72 rounded-2xl bg-white/5 border border-white/10 p-8 space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded" />
        <div className="h-44 w-full bg-white/5 rounded-xl" />
      </div>

      {/* History table skeleton */}
      <div className="w-full h-64 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
        <div className="h-6 w-40 bg-white/10 rounded" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="h-10 w-full bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
