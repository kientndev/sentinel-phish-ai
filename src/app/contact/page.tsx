"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, MessageSquare, Upload, X, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.contact.generateUploadUrl);
  const sendContact = useMutation(api.contact.send);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let attachmentId = undefined;
      
      if (file) {
        // Step 1: Get upload URL
        const postUrl = await generateUploadUrl();
        
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        
        if (!result.ok) throw new Error("Upload failed");
        
        const { storageId } = await result.json();
        attachmentId = storageId;
      }

      // Step 3: Save to database
      await sendContact({
        ...form,
        attachmentId,
      });

      toast.success("Message received. Our agents are analyzing...");
      setForm({ name: "", email: "", message: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 items-center px-6 md:px-10 py-16 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#a855f7]/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00d2ff]/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-2xl w-full text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-[#a855f7]" />
          <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tight uppercase">
            Outreach
          </h1>
        </div>
        <p className="text-[#a1a1aa] font-medium text-lg italic">
          Secure communication channel with SentinelPhish HQ
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full glass-card p-8 md:p-10 glow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest flex items-center gap-2">
                <User className="w-3 h-3 text-[#00d2ff]" /> Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-white placeholder:text-[#52525b] text-sm"
                placeholder="Agent Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3 text-[#00d2ff]" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-white placeholder:text-[#52525b] text-sm"
                placeholder="secure@sentinel.ai"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-[#00d2ff]" /> Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 transition-all text-white placeholder:text-[#52525b] text-sm resize-none"
              placeholder="Report findings or request deployment assistance..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#a1a1aa] tracking-widest flex items-center gap-2">
              <Upload className="w-3 h-3 text-[#a855f7]" /> Attachment (Max 10MB)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                file ? "border-[#a855f7] bg-[#a855f7]/5" : "border-white/10 hover:border-white/20 bg-white/2"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                className="hidden" 
              />
              {file ? (
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm text-white font-medium truncate">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {file.name}
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }} 
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-[#a1a1aa] mx-auto opacity-50" />
                  <p className="text-xs text-[#a1a1aa]">Securely upload logs, screenshots, or threat samples</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Transmit Securely</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}

