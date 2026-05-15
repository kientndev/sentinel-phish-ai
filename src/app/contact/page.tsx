"use client";

import { useState, useRef } from "react";
import { Send, Upload, CheckCircle2, Paperclip, X } from "lucide-react";
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
      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#fafafa]">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Message Sent</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Thank you for reaching out! Our team will get back to you as soon as possible.
          </p>
          <button 
            onClick={() => setIsSuccess(false)}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Send Another Message
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#fafafa] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">Contact</h1>
          <p className="text-xl text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-400 font-medium">Fill out the form below and we&apos;ll get back to you soon.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Subject *</label>
                <input
                  required
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Message *</label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Tell us more about your request..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* Attachments Zone */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Attachments</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer flex flex-col items-center justify-center text-center"
                >
                  <input 
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,.pdf"
                  />
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Click or drag files here to attach</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                    Images, video or PDF - Max 5 files (5MB each) or 1 video (25MB)
                  </p>
                </div>

                {/* File List */}
                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-wrap gap-2 mt-4"
                    >
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">
                          <Paperclip className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
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
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-400 font-medium">
                This site is protected by reCAPTCHA and the Privacy Policy and Terms of Service of Google apply.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
