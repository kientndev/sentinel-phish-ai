"use client";

import { LangCode, LANGUAGES, TranslationKeys, translations } from "./translations";
import { Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AiMode = 'concise' | 'educational';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
  aiMode: AiMode;
  setAiMode: (m: AiMode) => void;
  turboMode: boolean;
  setTurboMode: (t: boolean) => void;
  liveGlow: boolean;
  setLiveGlow: (g: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  setLang,
  aiMode,
  setAiMode,
  turboMode,
  setTurboMode,
  liveGlow,
  setLiveGlow,
}: SettingsModalProps) {
  const t: TranslationKeys = translations[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={onClose}
        >
          {/* Modal panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-[90%] max-w-sm p-5 flex flex-col gap-5 bg-white/10 border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-2xl backdrop-blur-lg h-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/20">
              <Settings className="w-4 h-4 text-[#00d2ff]" />
            </div>
            <h2 className="text-lg font-bold tracking-wide text-white">
              {t.settingsTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">
            {t.settingsLanguage}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {LANGUAGES.map((lng) => (
              <button
                key={lng.code}
                onClick={() => setLang(lng.code)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  lang === lng.code
                    ? "bg-[#00d2ff]/10 border-[#00d2ff]/40 text-white shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                    : "border-white/10 text-[#a1a1aa] hover:border-white/20 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-xl">{lng.flag}</span>
                <span>{lng.name}</span>
                {lang === lng.code && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#00d2ff] shadow-[0_0_6px_#00d2ff]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* AI Mode Toggle */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">
            {t.settingsAiMode}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["concise", "educational"] as AiMode[]).map((mode) => {
              const label =
                mode === "concise" ? t.settingsAiModeConcise : t.settingsAiModeEducational;
              const icon = mode === "concise" ? "⚡" : "📚";
              const isActive = aiMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setAiMode(mode)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#00d2ff]/10 border-[#00d2ff]/40 text-white shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                      : "border-white/10 text-[#a1a1aa] hover:border-white/20 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-center leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Turbo Mode Toggle */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#a1a1aa]">
            {t.settingsTurboMode}
          </label>
          <button
            onClick={() => setTurboMode(!turboMode)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              turboMode
                ? "bg-[#00d2ff]/10 border-[#00d2ff]/40 text-white shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                : "border-white/10 text-[#a1a1aa] hover:border-white/20 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🚀</span>
              <span className="text-xs">Fast Scan Enabled</span>
            </span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${turboMode ? 'bg-[#00d2ff]' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${turboMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Live Threat Glow Toggle */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#a1a1aa]">
            {t.settingsHeuristicLevel}
          </label>
          <button
            onClick={() => setLiveGlow(!liveGlow)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              liveGlow
                ? "bg-[#00d2ff]/10 border-[#00d2ff]/40 text-white shadow-[0_0_12px_rgba(0,210,255,0.15)]"
                : "border-white/10 text-[#a1a1aa] hover:border-white/20 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-xs">{t.settingsLiveGlow}</span>
            </span>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${liveGlow ? 'bg-[#00d2ff]' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${liveGlow ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-sm tracking-wide bg-[#00d2ff]/15 border border-[#00d2ff]/30 text-[#00d2ff] hover:bg-[#00d2ff]/25 transition-all shadow-[0_0_10px_rgba(0,210,255,0.1)]"
        >
          {t.settingsClose}
        </button>

        {/* Developer Credit */}
        <p className="text-center text-xs text-[#52525b] tracking-widest">
          Built by Tri Kien &nbsp;|&nbsp; 8a1
        </p>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
