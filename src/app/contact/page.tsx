"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, FileText, MessageSquare, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      files.forEach(f => data.append("files", f));
      const res = await fetch("/api/contact", { method: "POST", body: data });
      if (res.ok) {
        toast.success("Message sent successfully!");
        setForm({ name: "", email: "", subject: "", message: "" });
        setFiles([]);
      } else toast.error("Failed to send message.");
    } catch {
      toast.error("An error occurred.");
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#0b0e14] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#a855f7]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#00d2ff]/10 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#0b0e14] mb-2">Get in Touch</h1>
          <p className="text-gray-500">Have a question? We&apos;d love to hear from you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4" /> Your Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/20 focus:border-[#a855f7] transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/20 focus:border-[#a855f7] transition-all"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4" /> Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/20 focus:border-[#a855f7] transition-all"
              placeholder="How can we help?"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4" /> Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a855f7]/20 focus:border-[#a855f7] transition-all resize-none"
              placeholder="Tell us more..."
            />
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#a855f7] transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag & drop files here or click to upload</p>
            <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="text-sm text-[#a855f7] font-semibold cursor-pointer hover:underline">
              Browse files
            </label>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-[#a855f7] to-[#00d2ff] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
