import * as React from 'react';

import UnstyledLink from '../links/UnstyledLink';

export interface CourseCardProps {
  title: string;
  iconName: string;
  duration: string;
  level?: 'Pemula' | 'Menengah' | 'Lanjutan';
  href: string;
}

export const LandingCourseCard = ({
  title,
  iconName,
  duration,
  level,
  href,
}: CourseCardProps) => {
  return (
    <div className='bg-white rounded-xl p-6 border border-surface-variant relative overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md'>
      {/* Watermark star */}
      <span className='material-symbols-outlined absolute -right-10 -top-10 text-[150px] text-surface-variant opacity-40 watermark-star pointer-events-none'>
        brightness_low
      </span>

      {/* Icon tile + level badge */}
      <div className='flex justify-between items-start mb-6 relative z-10'>
        <div className='w-16 h-16 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-inner'>
          <span className='material-symbols-outlined text-3xl'>{iconName}</span>
        </div>
        {level && (
          <span className='bg-accent-lime text-accent-lime-ink px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide'>
            {level}
          </span>
        )}
      </div>

      {/* Title */}
      <div className='relative z-10 flex-grow'>
        <h3 className='font-display text-xl text-dark mb-2 line-clamp-2'>
          {title}
        </h3>
      </div>

      {/* Footer row */}
      <div className='relative z-10 pt-6 border-t border-surface-variant flex items-center justify-between'>
        <div className='flex items-center gap-2 text-on-surface-soft text-sm'>
          <span className='material-symbols-outlined text-base'>
            format_list_bulleted
          </span>
          <span>{duration}</span>
        </div>
        <UnstyledLink
          href={href}
          className='text-primary-700 font-bold hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-1'
        >
          Lihat Kursus
          <span className='material-symbols-outlined text-base'>
            chevron_right
          </span>
        </UnstyledLink>
      </div>
    </div>
  );
};
