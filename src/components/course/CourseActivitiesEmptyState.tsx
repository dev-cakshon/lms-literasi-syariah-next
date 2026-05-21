import { Sparkles, Star } from 'lucide-react';

export default function CourseActivitiesEmptyState() {
  return (
    <div className='relative overflow-hidden min-h-[320px] flex flex-col items-center justify-center text-center bg-surface-container rounded-3xl p-8 border border-dashed border-outline-variant'>
      <Sparkles className='absolute inset-0 m-auto w-48 h-48 text-outline-variant opacity-30 pointer-events-none' />
      <div className='relative z-10 flex flex-col items-center gap-4'>
        <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-surface-container-high'>
          <Star className='w-8 h-8 text-primary-500' strokeWidth={1.5} />
        </div>
        <p className='text-base text-on-surface-soft font-medium max-w-[200px]'>
          Belum ada aktivitas untuk kursus ini.
        </p>
        <p className='text-sm text-outline'>Istirahat sejenak!</p>
      </div>
    </div>
  );
}
