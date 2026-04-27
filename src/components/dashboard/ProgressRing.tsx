'use client';

import { useEffect, useMemo, useState } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export const ProgressRing = ({
  progress,
  size = 144,
  strokeWidth = 10,
  className,
  children,
}: ProgressRingProps) => {
  const normalized = clamp(progress);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetDashOffset = useMemo(
    () => circumference * (1 - normalized / 100),
    [circumference, normalized],
  );
  const [dashOffset, setDashOffset] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setDashOffset(targetDashOffset);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [targetDashOffset]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        className='absolute inset-0 -rotate-90'
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden='true'
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='rgb(5 150 105 / 0.18)'
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='rgb(5 150 105)'
          strokeLinecap='round'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
        />
      </svg>
      <div className='relative z-10'>{children}</div>
    </div>
  );
};

export type { ProgressRingProps };
