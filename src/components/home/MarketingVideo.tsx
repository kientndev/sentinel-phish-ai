"use client";

import React from "react";

interface MarketingVideoProps {
  src?: string;
  posterSrc?: string;
}

export default function MarketingVideo({
  src = "/marketing_video_horizontal.mp4",
  posterSrc = "/images/dashboard-preview.png",
}: MarketingVideoProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl shadow-cyan-950/20 aspect-video flex items-center justify-center">
      {/* Subtle ambient backglow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

      <video
        src={src}
        poster={posterSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover rounded-2xl block"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
