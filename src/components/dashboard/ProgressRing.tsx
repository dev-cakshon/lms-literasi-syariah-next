'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  children?: React.ReactNode;
}

export const ProgressRing = ({
  percentage,
  size = 160,
  strokeWidth = 6,
  trackClassName = 'text-gray-200',
  children,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const targetOffset = circumference * (1 - clampedPct / 100);

  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setOffset(targetOffset);
    });
    return () => cancelAnimationFrame(raf);
  }, [targetOffset]);

  return (
    <div
      className='relative inline-flex items-center justify-center'
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className='absolute inset-0 -rotate-90'
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='currentColor'
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
          className='text-emerald-500'
        />
      </svg>
      <div className='relative z-10'>{children}</div>
    </div>
  );
};
