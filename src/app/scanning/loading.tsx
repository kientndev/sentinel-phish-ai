export default function ScanningLoading() {
  return (
    <div className="flex flex-col flex-1 items-center px-6 md:px-10 py-10 max-w-6xl w-full mx-auto space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2 text-center md:text-left">
          <div className="h-10 w-48 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-4 w-72 bg-white/5 rounded-lg" />
        </div>
      </div>

      {/* Input box skeleton */}
      <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="h-14 flex-1 bg-white/5 rounded-xl border border-white/10" />
        <div className="h-14 w-36 bg-red-600/30 rounded-xl" />
      </div>

      {/* Result grid skeleton */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="h-64 rounded-2xl bg-white/5 border border-white/10" />
          <div className="h-48 rounded-2xl bg-white/5 border border-white/10" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="h-48 rounded-2xl bg-white/5 border border-white/10" />
          <div className="h-64 rounded-2xl bg-white/5 border border-white/10" />
        </div>
      </div>
    </div>
  );
}
