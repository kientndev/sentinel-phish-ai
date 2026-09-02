"use client";

import { useState } from "react";
import { MessageSquare, Bot, UserCircle, Lock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { LangCode } from "@/app/translations";
import { AiMode } from "@/app/SettingsModal";

interface ScanResultContext {
  score: number;
  status: string;
  domainAge: string;
  expiryDate: string;
  registrar: string;
  redFlags: string[];
}

interface ChatDrawerProps {
  results: ScanResultContext | null;
  lang: LangCode;
  aiMode: AiMode;
  isFreeUser?: boolean;
  chatPlaceholder: string;
  askAiTitle: string;
  chatEmptyMsg: string;
}

export default function AiChatDrawer({
  results,
  lang,
  aiMode,
  isFreeUser = false,
  chatPlaceholder,
  askAiTitle,
  chatEmptyMsg,
}: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatCount, setChatCount] = useState(0);
  const MAX_FREE_CHAT_MESSAGES = 5;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !results) return;

    if (isFreeUser && chatCount >= MAX_FREE_CHAT_MESSAGES) {
      return;
    }

    const newMessages = [...chatMessages, { role: "user", content: chatInput }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatCount((prev) => prev + 1);
    setIsChatting(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, context: results, lang, aiMode }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setChatMessages([
          ...newMessages,
          { role: "assistant", content: `Error ${res.status}: ${errData.error || res.statusText}` },
        ]);
      }
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Network error — check connection." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="glass-card p-6 border-white/10 transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#a855f7]/20 border border-[#a855f7]/30 group-hover:scale-105 transition-transform">
            <MessageSquare size={18} className="text-[#a855f7]" />
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              {askAiTitle}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20">
                Live Advisor
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Interactive threat assessment &amp; actionable remediation</p>
          </div>
        </div>
        <button className="p-2 text-zinc-400 group-hover:text-white rounded-lg hover:bg-white/5 transition-colors">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          {isFreeUser && (
            <div className="p-4 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-[#a855f7]" />
                <span className="text-xs font-bold text-[#a855f7] uppercase tracking-wider">Free Tier</span>
              </div>
              <p className="text-[10px] text-[#a1a1aa]">
                {chatCount >= MAX_FREE_CHAT_MESSAGES
                  ? `Limit reached (${MAX_FREE_CHAT_MESSAGES}/${MAX_FREE_CHAT_MESSAGES}). Upgrade for unlimited chat.`
                  : `${MAX_FREE_CHAT_MESSAGES - chatCount} free queries remaining for this scan.`}
              </p>
            </div>
          )}

          <div className="h-[280px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#a855f7]/20 flex items-center justify-center shrink-0 border border-[#a855f7]/30">
                <Bot size={18} className="text-[#a855f7]" />
              </div>
              <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 max-w-[85%]">
                <p className="text-xs text-zinc-300">{chatEmptyMsg}</p>
              </div>
            </div>

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.role === "user"
                      ? "bg-white/10 border-white/20"
                      : "bg-[#a855f7]/20 border-[#a855f7]/30"
                  }`}
                >
                  {msg.role === "user" ? <UserCircle size={18} /> : <Bot size={18} className="text-[#a855f7]" />}
                </div>
                <div
                  className={`p-3 rounded-2xl border ${
                    msg.role === "user"
                      ? "bg-[#00d2ff]/10 border-[#00d2ff]/20 rounded-tr-none"
                      : "bg-white/5 border-white/10 rounded-tl-none"
                  } max-w-[85%]`}
                >
                  <p className="text-xs text-white leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isChatting && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#a855f7]" />
                </div>
                <div className="bg-white/5 p-3 rounded-2xl h-8 w-24" />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={chatPlaceholder}
              disabled={isChatting || (isFreeUser && chatCount >= MAX_FREE_CHAT_MESSAGES)}
              className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-[#a855f7]/40 transition-all text-xs placeholder:text-zinc-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isChatting || !chatInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#a855f7] hover:bg-[#a855f7]/80 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Sparkles size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
