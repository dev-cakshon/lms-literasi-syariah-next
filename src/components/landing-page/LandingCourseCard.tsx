import { BookOpenText, Clock3 } from 'lucide-react';
import * as React from 'react';

import ButtonLink from '../links/ButtonLink';

// Props interface for CourseCard
export interface CourseCardProps {
  title: string;
  illustration: React.ReactNode; // Can be image or SVG
  duration: string; // e.g., "30 Jam Konten"
  modules?: string; // Optional, e.g., "Modul 4"
  href: string; // Link to course page
}

export const LandingCourseCard = ({
  title,
  illustration,
  duration,
  modules,
  href,
}: CourseCardProps) => {
  return (
    <div className='group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl'>
      {/* Top Section - Title & Illustration */}
      <div className='flex items-center justify-between gap-4 p-6 pb-4'>
        {/* Title */}
        <h3 className='flex-1 text-xl font-bold text-dark leading-tight'>
          {title}
        </h3>

        {/* Illustration */}
        <div className='flex-shrink-0 transition-transform duration-300 group-hover:scale-110'>
          {illustration}
        </div>
      </div>

      {/* Middle Section - Course Info */}
      <div className='flex-1 space-y-2 px-6'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Clock3 className='h-5 w-5' />
          <span className='text-sm'>{duration}</span>
        </div>

        {modules && (
          <div className='flex items-center gap-2 text-gray-600'>
            <BookOpenText className='h-5 w-5' />
            <span className='text-sm'>{modules}</span>
          </div>
        )}
      </div>

      {/* Bottom Section - CTA Button */}
      <div className='p-6 pt-4'>
        <ButtonLink href={href}>Lihat Kursus</ButtonLink>
      </div>
    </div>
  );
};
