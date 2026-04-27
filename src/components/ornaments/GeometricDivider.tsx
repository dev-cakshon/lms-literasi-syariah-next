import * as React from 'react';

interface GeometricDividerProps {
  className?: string;
}

export const GeometricDivider = ({ className }: GeometricDividerProps) => {
  return (
    <div className={className} aria-hidden='true'>
      <svg
        viewBox='0 0 120 120'
        className='h-full w-full'
        fill='none'
        role='presentation'
      >
        <g stroke='currentColor' strokeWidth='1.5' strokeOpacity='0.4'>
          <path d='M60 8v104M8 60h104' />
          <path d='M22 22l76 76M98 22L22 98' />
          <circle cx='60' cy='60' r='18' />
          <circle cx='60' cy='60' r='32' />
          <circle cx='60' cy='60' r='46' />
        </g>
      </svg>
    </div>
  );
};
