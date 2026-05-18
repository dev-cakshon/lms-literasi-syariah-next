import { Trophy } from 'lucide-react';

interface CourseCompletionBannerProps {
  onView: () => void;
}

export default function CourseCompletionBanner({
  onView,
}: CourseCompletionBannerProps) {
  return (
    <section className='bg-gradient-to-r from-accent-lime to-primary-container rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[var(--shadow-elevated-2)]'>
      <div className='flex items-center gap-5'>
        <div className='bg-white rounded-full p-4 shrink-0 shadow-sm'>
          <Trophy className='w-8 h-8 text-primary-700' strokeWidth={1.5} />
        </div>
        <div>
          <h2 className='font-display text-xl md:text-2xl font-bold text-primary-700 leading-snug'>
            Selamat! Kamu telah menyelesaikan kursus ini.
          </h2>
          <p className='text-sm text-primary-700/80 mt-1'>
            Sertifikat kamu siap diunduh.
          </p>
        </div>
      </div>
      <button
        onClick={onView}
        className='shrink-0 bg-white text-primary-700 font-bold rounded-xl px-6 py-3 shadow-[0_4px_0_0_var(--color-primary-700)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--color-primary-700)] active:translate-y-[4px] active:shadow-none transition-all whitespace-nowrap'
      >
        Lihat Sertifikat
      </button>
    </section>
  );
}
