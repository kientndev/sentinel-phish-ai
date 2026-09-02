export default function RootLoading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        {/* Header wireframe */}
        <div className="space-y-3 text-center flex flex-col items-center">
          <div className="h-10 w-64 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-4 w-96 max-w-full bg-white/5 rounded-lg" />
        </div>

        {/* Content card wireframe */}
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="h-14 w-full bg-white/5 rounded-xl border border-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="h-32 bg-white/5 rounded-xl" />
            <div className="h-32 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
