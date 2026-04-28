import { Clock, FileText } from 'lucide-react';
import * as React from 'react';

import ButtonLink from '../links/ButtonLink';

export interface CourseCardProps {
  title: string;
  illustration: React.ReactNode;
  duration: string;
  modules?: string;
  href: string;
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
        <h3 className='flex-1 text-xl font-bold text-dark leading-tight'>
          {title}
        </h3>
        <div className='flex-shrink-0 transition-transform duration-300 group-hover:scale-110'>
          {illustration}
        </div>
      </div>

      {/* Middle Section - Course Info */}
      <div className='flex-1 space-y-2 px-6'>
        <div className='flex items-center gap-2 text-gray-600'>
          <Clock className='h-5 w-5' />
          <span className='text-sm'>{duration}</span>
        </div>

        {modules && (
          <div className='flex items-center gap-2 text-gray-600'>
            <FileText className='h-5 w-5' />
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
