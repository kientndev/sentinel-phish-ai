"use client";

import { useState, useRef } from "react";
import { Send, Upload, CheckCircle2, Paperclip, X, MessageSquare, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.contact.generateUploadUrl);
  const sendContact = useMutation(api.contact.send);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        toast.error("Max 5 files allowed");
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
      const attachmentIds = [];
      
      // Upload files to Convex storage
      for (const file of files) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        attachmentIds.push(storageId);
      }

      await sendContact({
        ...formData,
        attachmentIds,
      });

      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setFiles([]);
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0b0e14]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center glow-sm"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4">Message Sent</h1>
          <p className="text-[#a1a1aa] mb-8 font-medium">
            Thank you for reaching out! Our security team will get back to you as soon as possible.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full py-4 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all uppercase tracking-widest text-xs"
          >
            Send Another Message
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#0b0e14] py-20 px-6 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#00d2ff]/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-40 right-1/4 w-[500px] h-[500px] bg-[#a855f7]/5 rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="text-[10px] font-bold tracking-widest text-[#a855f7] uppercase">Secure Outreach</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight italic">
            Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d2ff] to-[#a855f7]">Touch</span>
          </h1>
          <p className="text-lg text-[#a1a1aa] font-medium max-w-lg mx-auto leading-relaxed italic">
            Have questions about SentinelPhish or looking for commercial licensing? We&apos;re here to help.
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden glow-sm"
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Send Us a Message</h2>
                <p className="text-[#a1a1aa] font-medium text-sm italic">Encrypted & secure communication channel.</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">End-to-End Secure</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#fafafa] uppercase tracking-widest ml-1">Your Name</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 focus:border-[#00d2ff]/40 transition-all text-white placeholder:text-gray-600 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#fafafa] uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 focus:border-[#00d2ff]/40 transition-all text-white placeholder:text-gray-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#fafafa] uppercase tracking-widest ml-1">Subject</label>
                <input
                  required
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 focus:border-[#00d2ff]/40 transition-all text-white placeholder:text-gray-600 font-medium"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#fafafa] uppercase tracking-widest ml-1">Message</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us more about your request..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#00d2ff]/40 focus:border-[#00d2ff]/40 transition-all text-white placeholder:text-gray-600 font-medium resize-none"
                />
              </div>

              {/* Attachments Zone */}
              <div className="space-y-3">
                <label className="text-xs font-black text-[#fafafa] uppercase tracking-widest ml-1">Attachments</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-white/10 rounded-3xl p-10 transition-all hover:border-[#00d2ff]/40 hover:bg-[#00d2ff]/5 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden"
                >
                  <input 
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                  />
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
                    <Upload className="w-6 h-6 text-[#a1a1aa] group-hover:text-[#00d2ff]" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">Click or drag files here to attach</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
                    Images, video or PDF - Max 5 files (5MB each)
                  </p>
                </div>

                {/* File List */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-3 mt-6"
                    >
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-[#fafafa] group hover:border-[#00d2ff]/40 transition-colors">
                          <Paperclip className="w-3.5 h-3.5 text-[#00d2ff]" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-gradient-to-r from-[#00d2ff] to-[#a855f7] text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-xs"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Secure Message
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-500 font-medium tracking-wide">
                SentinelPhish AI Security Protocol v4.0 — All interactions are monitored and logged.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
