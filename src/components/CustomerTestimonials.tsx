"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Chen",
    title: "Security Analyst",
    company: "CyberDefense Corp",
    feedback: "The URL analysis accuracy is incredible. We've reduced phishing incidents by 94% since implementing SentinelPhish.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    title: "Full-Stack Lead",
    company: "TechFlow Solutions",
    feedback: "AI detection speed is unmatched. Our team now scans thousands of URLs in seconds without any false positives.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    title: "DevOps Engineer",
    company: "CloudScale Inc",
    feedback: "The real-time heuristics have transformed our security posture. Best phishing detection tool we've used.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    title: "CTO",
    company: "SecureNet Systems",
    feedback: "SentinelPhish's deep analysis catches sophisticated attacks that other tools miss. Essential for modern security.",
    rating: 5,
  },
  {
    name: "James Park",
    title: "Security Architect",
    company: "Fortress Technologies",
    feedback: "Integration was seamless and the detection accuracy is phenomenal. Our security team trusts it completely.",
    rating: 5,
  },
  {
    name: "Linda Thompson",
    title: "Engineering Manager",
    company: "DataGuard Inc",
    feedback: "The AI detection speed allows us to protect our users in real-time. Outstanding tool for any organization.",
    rating: 5,
  },
  {
    name: "David Kim",
    title: "Senior Developer",
    company: "ShieldTech Solutions",
    feedback: "We've tested many phishing detectors, but SentinelPhish's accuracy and speed are in a league of their own.",
    rating: 5,
  },
  {
    name: "Rachel Green",
    title: "IT Security Lead",
    company: "ProtectEdge Systems",
    feedback: "The global threat network integration provides comprehensive coverage. Highly recommend for enterprise security.",
    rating: 5,
  },
];

export default function CustomerTestimonials() {
  return (
    <section className="w-full max-w-7xl mx-auto mb-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
          Trusted by Security Professionals
        </h2>
        <p className="text-[#a1a1aa] text-sm md:text-base">
          See what industry leaders say about SentinelPhish
        </p>
      </motion.div>

      {/* Infinite Scrolling Marquee */}
      <div className="relative overflow-hidden">
        <div className="flex gap-6 animate-marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-[300px] md:w-[350px] bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-start gap-3 mb-4">
                <Quote className="w-8 h-8 text-[#00d2ff] flex-shrink-0" />
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                &ldquo;{testimonial.feedback}&rdquo;
              </p>
              
              <div className="border-t border-slate-800 pt-4">
                <div className="text-white font-semibold text-sm">
                  {testimonial.name}
                </div>
                <div className="text-[#a1a1aa] text-xs">
                  {testimonial.title} · {testimonial.company}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Gradient fade effect on edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
