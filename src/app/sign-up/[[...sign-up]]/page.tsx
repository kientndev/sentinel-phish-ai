import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center p-6 bg-[#0b0e14]">
      <div className="glass-card p-2 border-white/10 shadow-2xl">
        <SignUp appearance={{
          elements: {
            card: "bg-transparent shadow-none",
            headerTitle: "text-white font-black",
            headerSubtitle: "text-zinc-400",
            formButtonPrimary: "bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-black font-black",
            socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
            formFieldLabel: "text-zinc-500 font-black uppercase text-[10px] tracking-widest",
            formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl",
            footerActionText: "text-zinc-500",
            footerActionLink: "text-[#00d2ff] hover:text-[#00d2ff]/80 font-bold",
          }
        }} />
      </div>
    </main>
  );
}
