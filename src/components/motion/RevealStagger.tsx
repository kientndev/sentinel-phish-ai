'use client';

import React from 'react';
import { Reveal } from './Reveal';

interface RevealStaggerProps {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
  interval?: number; // Default 80ms
  duration?: number;
  yOffset?: number;
  as?: React.ElementType;
}

export function RevealStagger({
  children,
  className = '',
  baseDelay = 0,
  interval = 80,
  duration = 500,
  yOffset = 24,
  as: Component = 'div',
}: RevealStaggerProps) {
  const childArray = React.Children.toArray(children);

  return (
    <Component className={className}>
      {childArray.map((child, index) => (
        <Reveal
          key={React.isValidElement(child) && child.key ? child.key : index}
          delay={baseDelay + index * interval}
          duration={duration}
          yOffset={yOffset}
        >
          {child}
        </Reveal>
      ))}
    </Component>
  );
}
