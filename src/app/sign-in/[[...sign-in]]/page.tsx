import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col flex-1 items-center justify-center p-6 bg-[#0b0e14]">
      <div className="w-full max-w-md">
        <SignIn />
      </div>
    </main>
  );
}
