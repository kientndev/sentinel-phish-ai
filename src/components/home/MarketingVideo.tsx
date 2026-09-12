"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MarketingVideoProps {
  src?: string;
  posterSrc?: string;
}

export default function MarketingVideo({
  src = "/marketing_video_horizontal.mp4",
  posterSrc = "/images/dashboard-preview.png",
}: MarketingVideoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl shadow-cyan-950/20">
      {/* Subtle ambient backglow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl pointer-events-none" />

      {!hasError ? (
        <video
          src={src}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => {
            console.warn(`[Video] Failed to load video from ${src}, falling back to poster.`);
            setHasError(true);
          }}
          className="w-full h-auto object-cover rounded-2xl block"
        />
      ) : (
        <div className="relative w-full aspect-video flex items-center justify-center bg-slate-900">
          {posterSrc && (
            <Image
              src={posterSrc}
              alt="SentinelPhish Interface Preview"
              fill
              className="object-cover rounded-2xl opacity-80"
              priority
            />
          )}
        </div>
      )}
    </div>
  );
}
