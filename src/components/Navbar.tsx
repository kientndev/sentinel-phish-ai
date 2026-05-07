"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldAlert, Search, UserCircle, Activity, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser, SignOutButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  // Mock user subscription tier - in production, this would come from Clerk/Convex
  const userTier = "free"; // Options: "free", "mid", "pro", "vip"
  const isSubscribed = userTier === "pro" || userTier === "vip";

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Scans", href: "/scanning" },
    { name: "QR Shield", href: "/scan/qr", isNew: true },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Floating Glassmorphism Navbar */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-3">
        <div className="bg-[#0b0e14]/70 backdrop-blur-md border border-white/10 rounded-2xl glow-sm flex items-center justify-between px-4 md:px-6 py-3">
          {/* Left: Logo + Search Bar */}
          <div className="flex items-center gap-4 flex-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-[#00d2ff]/10 p-1.5 rounded-lg group-hover:bg-[#00d2ff]/20 transition-colors border border-[#00d2ff]/20">
                <ShieldAlert size={18} className="text-[#00d2ff]" />
              </div>
              <span className="font-black text-lg tracking-tight text-white group-hover:text-[#00d2ff] transition-colors">
                Sentinel<span className="text-gray-500">Phish</span>
              </span>
            </Link>
            
            {/* Search/Command Bar - Desktop */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-64">
              <Search size={16} className="text-[#52525b]" />
              <input
                type="text"
                placeholder="Search... (⌘K)"
                className="bg-transparent text-white text-sm placeholder:text-[#52525b] focus:outline-none flex-1"
                readOnly
              />
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-[#52525b] bg-white/5 rounded border border-white/10">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Center: Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[#00d2ff]/10 text-[#00d2ff]"
                    : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
                {link.isNew && (
                  <span className="ml-1.5 px-1 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                    NEW
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right: Status + User Actions */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Status Dot */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Engine Active</span>
            </div>

            {/* User Profile or Auth Buttons */}
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] flex items-center justify-center border border-white/10 group-hover:border-[#00d2ff]/30 transition-colors">
                      <span className="text-xs font-bold text-white">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || 'U'}
                      </span>
                    </div>
                    {isSubscribed && (
                      <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-[#a855f7] text-[8px] font-bold rounded-full border border-[#0b0e14]">
                        {userTier === "vip" ? "VIP" : "PRO"}
                      </div>
                    )}
                  </div>
                </Link>
                <SignOutButton>
                  <button className="p-2 text-[#a1a1aa] hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Sign Out">
                    <UserCircle size={18} />
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className="px-3 py-1.5 text-sm font-medium text-[#a1a1aa] hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  Sign In
                </Link>
                <Link href="/sign-up" className="px-4 py-1.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white text-sm font-medium rounded-lg glow-md hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[#a1a1aa] hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 md:px-6 pb-4"
          >
            <div className="bg-[#0b0e14]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 glow-sm flex flex-col gap-2">
              {/* Mobile Search */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-2">
                <Search size={16} className="text-[#52525b]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-white text-sm placeholder:text-[#52525b] focus:outline-none flex-1"
                  readOnly
                />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                    pathname === link.href
                      ? "bg-[#00d2ff]/10 text-[#00d2ff]"
                      : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{link.name}</span>
                  {link.isNew && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30">
                      NEW
                    </span>
                  )}
                </Link>
              ))}

              {/* Mobile Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Engine Active</span>
              </div>

              {isSignedIn ? (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00d2ff] to-[#a855f7] flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-white">
                        {user?.firstName || user?.emailAddresses[0]?.emailAddress.split('@')[0] || 'User'}
                      </span>
                      {isSubscribed && (
                        <span className="ml-2 px-1.5 py-0.5 bg-[#a855f7] text-[10px] font-bold rounded-full text-white">
                          {userTier === "vip" ? "VIP" : "PRO"}
                        </span>
                      )}
                    </div>
                  </Link>
                  <SignOutButton>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-center text-[#a1a1aa] hover:bg-white/5 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-center bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-medium glow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
