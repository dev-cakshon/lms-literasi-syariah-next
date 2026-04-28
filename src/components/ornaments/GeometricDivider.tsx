import * as React from 'react';

import { cn } from '@/lib/utils';

interface GeometricDividerProps {
  className?: string;
  /** Width of the SVG in pixels. Height scales proportionally (1:1 viewBox). */
  size?: number;
}

/**
 * Eight-point star / interlaced-knot decorative ornament.
 * Rendered as an SVG at 1.5px stroke, currentColor at 40% opacity.
 * Use `text-*` utilities on the parent to set the fill/stroke hue.
 */
export const GeometricDivider = ({
  className,
  size = 240,
}: GeometricDividerProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 200 200'
      width={size}
      height={size}
      className={cn('text-current', className)}
      aria-hidden
    >
      {/* Outer eight-point star */}
      <polygon
        points='100,8 117,55 164,38 147,85 194,100 147,115 164,162 117,145 100,192 83,145 36,162 53,115 6,100 53,85 36,38 83,55'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.4'
        strokeLinejoin='round'
      />

      {/* Inner rotated square (45°) — interlaced-knot framing */}
      <rect
        x='58'
        y='58'
        width='84'
        height='84'
        rx='4'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.4'
        transform='rotate(45 100 100)'
      />

      {/* Axis cross */}
      <line
        x1='100'
        y1='30'
        x2='100'
        y2='170'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.25'
      />
      <line
        x1='30'
        y1='100'
        x2='170'
        y2='100'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.25'
      />

      {/* Diagonal cross */}
      <line
        x1='50'
        y1='50'
        x2='150'
        y2='150'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.2'
      />
      <line
        x1='150'
        y1='50'
        x2='50'
        y2='150'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.2'
      />

      {/* Centre dot */}
      <circle
        cx='100'
        cy='100'
        r='5'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeOpacity='0.5'
      />
    </svg>
  );
};
