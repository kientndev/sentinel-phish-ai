import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center p-6 bg-[#0b0e14]">
      <div className="glass-card p-8 border-white/10 shadow-2xl text-center max-w-md">
        <h1 className="text-2xl font-black text-white mb-4">Authentication Disabled</h1>
        <p className="text-zinc-400 mb-6">Sign-in is currently unavailable. Please continue as a guest.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-black font-black rounded-lg transition-colors">
          Go Home
        </Link>
      </div>
    </main>
  );
}
