"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldAlert, Coins, UserCircle, LogOut } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { creditBalance } = useAppContext();

  const navLinks = [
    { name: "Scanning", href: "/scanning" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Community Vault", href: "/reports" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0b0e14]/80 backdrop-blur-2xl border-b border-white/5">
      <div className="w-full flex items-center justify-between px-6 md:px-10 py-4">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-[#00d2ff]/10 p-2 rounded-xl group-hover:bg-[#00d2ff]/20 transition-colors border border-[#00d2ff]/20">
              <ShieldAlert className="w-5 h-5 text-[#00d2ff]" />
            </div>
            <span className="font-black text-xl tracking-tight text-white group-hover:text-[#00d2ff] transition-colors uppercase italic">
              Sentinel<span className="text-gray-500">Phish</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-black uppercase tracking-widest transition-all ${
                pathname === link.href
                  ? "text-[#00d2ff]"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-4">
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-lg transition-all group">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400 font-bold text-sm">
                  {creditBalance.toLocaleString()}
                </span>
              </div>
              
              <Link href="/profile" className="flex items-center gap-2 group border border-white/5 bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] flex items-center justify-center p-[2px]">
                  <div className="w-full h-full bg-[#0b0e14] rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white uppercase italic">G</span>
                  </div>
                </div>
                <span className="hidden sm:inline text-xs font-black uppercase tracking-widest text-[#fafafa]">
                  Guest Agent
                </span>
              </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#a1a1aa] hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-0 right-0 p-4"
          >
            <div className="bg-[#0b0e14]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl font-bold bg-white/5 ${
                    pathname === link.href ? "text-[#00d2ff] border border-[#00d2ff]/30" : "text-[#a1a1aa]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10" />
              <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-[#a1a1aa] font-medium flex items-center gap-2">
                    <UserCircle className="w-5 h-5" /> Guest Agent
                  </span>
                  <span className="text-yellow-400 font-bold flex items-center gap-1">
                    {creditBalance} <Coins className="w-4 h-4" />
                  </span>
                </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
