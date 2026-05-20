import { CheckCircle2, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

type ChipState = 'fresh' | 'inprogress' | 'completed';

const CHIP_CONFIG: Record<
  ChipState,
  {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  fresh: { label: 'Kursus Syariah', Icon: Sparkles },
  inprogress: { label: 'Lanjutkan', Icon: Play },
  completed: { label: 'Selesai', Icon: CheckCircle2 },
};

interface CourseOverviewHeroProps {
  title: string;
  description: string;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  ctaLabel: string;
  ctaHref: string;
  ctaDisabled: boolean;
  chipState: ChipState;
}

export default function CourseOverviewHero({
  title,
  description,
  progressPercent,
  completedCount,
  totalCount,
  ctaLabel,
  ctaHref,
  ctaDisabled,
  chipState,
}: CourseOverviewHeroProps) {
  const { label: chipLabel, Icon: ChipIcon } = CHIP_CONFIG[chipState];

  return (
    <section className='relative overflow-hidden bg-primary-container rounded-[2rem] p-8 md:p-12 shadow-lg'>
      {/* Decorative blobs */}
      <div
        className='absolute -top-24 -right-24 w-80 h-80 bg-emerald-deep/30 rounded-full blur-3xl pointer-events-none'
        style={{ animation: 'floatBlob 7s ease-in-out infinite' }}
      />
      <div
        className='absolute -bottom-20 -left-16 w-72 h-72 bg-accent-lime/15 rounded-full blur-[100px] pointer-events-none'
        style={{ animation: 'floatBlob 10s ease-in-out infinite reverse' }}
      />

      <div className='relative z-10 max-w-2xl flex flex-col gap-6'>
        {/* Status chip */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold w-max backdrop-blur-sm ${
            chipState === 'inprogress'
              ? 'bg-amber-500 text-amber-ink'
              : 'bg-white/20 text-on-primary-container'
          }`}
        >
          <ChipIcon size={16} className='shrink-0' />
          {chipLabel}
        </div>

        {/* Title and description */}
        <div className='flex flex-col gap-2'>
          <h1 className='font-display text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight'>
            {title}
          </h1>
          <p className='text-base text-white/85 leading-relaxed max-w-lg'>
            {description || 'Deskripsi kursus belum tersedia.'}
          </p>
        </div>

        {/* Embedded progress card */}
        <div className='bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col gap-3 max-w-md'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-bold uppercase tracking-wider text-white'>
              Progres Belajar
            </span>
            <span className='text-sm font-bold text-white'>
              {completedCount}/{totalCount} selesai ({progressPercent}%)
            </span>
          </div>
          <div className='h-3 w-full bg-white/20 rounded-full overflow-hidden'>
            <div
              className='h-full bg-accent-lime rounded-full transition-all duration-1000 ease-out relative'
              style={{ width: `${progressPercent}%` }}
            >
              <div className='absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-full' />
            </div>
          </div>
        </div>

        {/* CTA */}
        {ctaDisabled ? (
          <span className='w-max bg-accent-lime/50 text-accent-lime-ink rounded-xl px-6 py-3 font-bold opacity-60 cursor-not-allowed'>
            {ctaLabel}
          </span>
        ) : (
          <Link
            href={ctaHref}
            className='w-max bg-accent-lime text-accent-lime-ink rounded-xl px-6 py-3 font-bold shadow-[0_4px_0_0_var(--color-accent-lime-dim)] hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--color-accent-lime-dim)] active:translate-y-[4px] active:shadow-none transition-all'
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
