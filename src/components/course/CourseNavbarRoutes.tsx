import { ChevronLeft } from 'lucide-react';

import UnstyledLink from '@/components/links/UnstyledLink';

export const CourseNavbarRoutes = () => {
  return (
    <div className='flex items-center gap-1'>
      <ChevronLeft className='text-white w-4 h-4' />
      <UnstyledLink
        className='text-sm font-medium text-white'
        href='/my-courses'
      >
        Kembali ke Kursus Saya
      </UnstyledLink>
    </div>
  );
};
