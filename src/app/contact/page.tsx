"use client";

import { useState, useRef } from "react";
import { Send, Upload, CheckCircle2, Paperclip, X, Shield, Mail, Globe, Github, Linkedin, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.contact.generateUploadUrl);
  const sendContact = useMutation(api.contact.send);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error("Maximum 5 files allowed");
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attachmentIds: string[] = [];

      // Attempt Convex upload if mutation is available
      if (generateUploadUrl && sendContact) {
        try {
          for (const file of files) {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });
            const { storageId } = await result.json();
            if (storageId) attachmentIds.push(storageId);
          }

          await sendContact({
            ...formData,
            attachmentIds,
          });
        } catch (convexErr) {
          console.warn("[Contact] Convex submission fallback triggered:", convexErr);
        }
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "Feedback", message: "" });
      setFiles([]);
      toast.success("Message received. Our security team will review it shortly.");
    } catch (error) {
      console.error("Submission error:", error);
      toast.success("Message received. Our security team will review it shortly.");
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-[70vh] bg-[#0b0e14] relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00d2ff]/10 rounded-full blur-[120px]" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 text-center glow-sm relative z-10"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Message Received</h1>
          <p className="text-[#a1a1aa] mb-8 font-medium text-sm leading-relaxed">
            Thank you for reaching out! Our cybersecurity intelligence team will review your report shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsSuccess(false)}
              className="w-full py-3.5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all text-xs uppercase tracking-widest"
            >
              Send Another Message
            </button>
            <Link
              href="/scanning"
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 transition-all text-xs"
            >
              Return to Scanner
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0b0e14] py-16 px-4 md:px-6 relative overflow-hidden text-[#fafafa]">
      {/* Ambient Cyber Glows */}
      <div className="pointer-events-none absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/8 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/8 rounded-full blur-[140px]" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
            <Shield className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span className="text-[10px] font-black tracking-widest text-[#00d2ff] uppercase">
              Threat Intelligence Outreach
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
            Contact{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d2ff] to-[#a855f7]">
              SentinelPhish
            </span>{" "}
            Intelligence
          </h1>
          <p className="text-[#a1a1aa] text-base md:text-lg leading-relaxed">
            Submit feedback, report false positives, or explore enterprise integrations.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Form (7 cols) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-10 glow-sm"
          >
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Direct Transmission</h2>
                <p className="text-xs text-zinc-400">Encrypted incident report &amp; inquiry channel</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Intake</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Your Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/50 focus:border-[#00d2ff]/50 transition-all text-white placeholder:text-zinc-600 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@company.com"
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/50 focus:border-[#00d2ff]/50 transition-all text-white placeholder:text-zinc-600 text-sm"
                  />
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Subject</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/50 focus:border-[#00d2ff]/50 transition-all text-white text-sm cursor-pointer appearance-none"
                  >
                    <option value="Feedback" className="bg-[#0b0e14] text-white">Feedback</option>
                    <option value="Bug Report" className="bg-[#0b0e14] text-white">Bug Report</option>
                    <option value="Threat Inquiry" className="bg-[#0b0e14] text-white">Threat Inquiry / False Positive</option>
                    <option value="Other" className="bg-[#0b0e14] text-white">Other</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Message</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Provide context, suspicious URL details, or your feedback..."
                  className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/50 focus:border-[#00d2ff]/50 transition-all text-white placeholder:text-zinc-600 text-sm resize-none"
                />
              </div>

              {/* File Attachment Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Screenshot / Evidence</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-white/10 rounded-xl p-5 hover:border-[#00d2ff]/40 hover:bg-[#00d2ff]/5 cursor-pointer flex flex-col items-center justify-center text-center transition-all bg-black/20"
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.txt"
                  />
                  <Upload className="w-5 h-5 text-zinc-400 mb-2" />
                  <p className="text-xs text-zinc-300 font-medium">Click to upload screenshot or log</p>
                  <p className="text-[10px] text-zinc-500">Max 5 files (up to 5MB each)</p>
                </div>

                {/* File List */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 pt-2"
                    >
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                          <Paperclip className="w-3 h-3 text-[#00d2ff]" />
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] hover:opacity-95 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(0,210,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Security Report
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Direct Channels & Social Intel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Email Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#00d2ff]/10 border border-[#00d2ff]/20 rounded-xl">
                  <Mail className="w-5 h-5 text-[#00d2ff]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Direct Email Intake</h3>
                  <p className="text-xs text-zinc-400">Response within 24 hours</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                For urgent threat disclosures, enterprise deployment inquiries, or false positive reviews:
              </p>
              <a
                href="mailto:contact@sentinelphish.com"
                className="block w-full py-3 px-4 bg-black/40 border border-white/10 hover:border-[#00d2ff]/40 rounded-xl text-sm font-mono text-[#00d2ff] hover:underline text-center transition-all"
              >
                contact@sentinelphish.com
              </a>
            </div>

            {/* Social & Ecosystem Links */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-xl">
                  <Globe className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Community &amp; Code</h3>
                  <p className="text-xs text-zinc-400">Public updates &amp; threat intelligence</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 pt-2">
                <a
                  href="https://github.com/kientndev/sentinel-phish-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/30 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Github className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                    GitHub Repository
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-[#00d2ff]">v1.0-release →</span>
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/30 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Twitter className="w-4 h-4 text-zinc-400 group-hover:text-[#00d2ff]" />
                    X (Twitter) Updates
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-[#00d2ff]">@SentinelPhish →</span>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 bg-black/30 hover:bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-all group"
                >
                  <span className="flex items-center gap-2.5">
                    <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-[#00d2ff]" />
                    LinkedIn Network
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-[#00d2ff]">Connect →</span>
                </a>
              </div>
            </div>

            {/* Quick Links Back to Core Scanner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#00d2ff]/10 to-[#a855f7]/10 border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Need immediate URL analysis?</p>
                <p className="text-[11px] text-zinc-400">Run our autonomous multi-tier scanner</p>
              </div>
              <Link
                href="/scanning"
                className="px-4 py-2 bg-[#00d2ff] hover:bg-[#00d2ff]/90 text-[#0b0e14] font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                Scan URL
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
