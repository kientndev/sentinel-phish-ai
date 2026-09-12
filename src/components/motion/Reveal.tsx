'use client';

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Milliseconds (e.g., 100, 200)
  duration?: number; // Default 500ms
  yOffset?: number; // Default 24px
  as?: React.ElementType;
}

export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 500,
  yOffset = 24,
  as: Component = 'div',
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Respect system reduced-motion preferences
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        setIsVisible(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Fire exactly once per mount
        }
      },
      {
        rootMargin: '0px 0px -60px 0px', // Triggers slightly before fully centered
        threshold: 0.1,
      }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={ref}
      className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : `translateY(${yOffset}px) scale(0.985)`,
      }}
    >
      {children}
    </Component>
  );
}
