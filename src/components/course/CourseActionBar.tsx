'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, Lock } from 'lucide-react';

export type NextState =
  | 'enabled'
  | 'last-completable'
  | 'disabled'
  | 'locked'
  | 'loading';

interface PrevAction {
  onClick: () => void;
  label?: string;
}

interface NextAction {
  onClick?: () => void;
  label?: string;
  state: NextState;
  tooltipText?: string;
}

interface CourseActionBarProps {
  prev?: PrevAction | null;
  next: NextAction;
}

export function CourseActionBar({ prev, next }: CourseActionBarProps) {
  const prevLabel = prev?.label ?? 'Sebelumnya';
  const nextLabel =
    next.label ?? (next.state === 'last-completable' ? 'Selesai' : 'Lanjut');

  const prevDisabled = !prev;

  return (
    <nav
      className='fixed bottom-0 left-0 w-full z-40 flex justify-between items-center px-5 md:px-20 py-4
        bg-surface-container-low/95 backdrop-blur-sm border-t-2 border-outline-variant
        shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl font-primary'
      aria-label='Course navigation'
    >
      {/* Sebelumnya */}
      <button
        type='button'
        onClick={prev?.onClick}
        disabled={prevDisabled}
        className={
          prevDisabled
            ? 'flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 border-2 text-sm font-bold tracking-wide border-outline-variant/50 bg-surface-container-highest/50 text-outline opacity-60 cursor-not-allowed'
            : 'flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 border-2 text-sm font-bold tracking-wide border-outline-variant bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-colors active:scale-95'
        }
      >
        <ArrowLeft className='w-4 h-4' />
        <span className='hidden md:inline'>{prevLabel}</span>
      </button>

      {/* Lanjut / Selesai / Disabled / Locked / Loading */}
      {next.state === 'disabled' || next.state === 'locked' ? (
        <div className='relative group'>
          <button
            type='button'
            disabled
            className={
              next.state === 'locked'
                ? 'flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 border-2 border-dashed text-sm font-bold tracking-wide border-outline-variant bg-surface-container-highest text-outline opacity-80 cursor-not-allowed'
                : 'flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 text-sm font-bold tracking-wide bg-surface-variant text-outline squishy-shadow [--tw-shadow-color:#bec9c4] opacity-70 cursor-not-allowed'
            }
          >
            <span className='hidden md:inline'>{nextLabel}</span>
            {next.state === 'locked' ? (
              <Lock className='w-4 h-4' />
            ) : (
              <ArrowRight className='w-4 h-4' />
            )}
          </button>
          {next.tooltipText && (
            <div className='absolute bottom-full right-0 mb-2 hidden group-hover:block w-max pointer-events-none'>
              <div className='bg-inverse-surface text-inverse-on-surface text-xs font-medium px-3 py-2 rounded-lg shadow-lg relative'>
                {next.tooltipText}
                <div className='absolute top-full right-6 w-2.5 h-2.5 bg-inverse-surface transform rotate-45 -mt-1.5' />
              </div>
            </div>
          )}
        </div>
      ) : next.state === 'loading' ? (
        <button
          type='button'
          disabled
          className='flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 text-sm font-bold tracking-wide bg-surface-variant text-outline opacity-70 cursor-not-allowed'
        >
          <span className='hidden md:inline'>{nextLabel}</span>
          <Loader2 className='w-4 h-4 animate-spin' />
        </button>
      ) : next.state === 'last-completable' ? (
        <button
          type='button'
          onClick={next.onClick}
          className='flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 text-sm font-bold tracking-wide text-on-primary-container bg-primary-container squishy-shadow [--tw-shadow-color:#005141] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-transform'
        >
          <span className='hidden md:inline'>{nextLabel}</span>
          <Check className='w-4 h-4' />
        </button>
      ) : (
        /* enabled */
        <button
          type='button'
          onClick={next.onClick}
          className='flex items-center gap-2 rounded-xl px-6 md:px-8 py-3 text-sm font-bold tracking-wide text-on-secondary bg-secondary squishy-shadow [--tw-shadow-color:#1d5200] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-transform'
        >
          <span className='hidden md:inline'>{nextLabel}</span>
          <ArrowRight className='w-4 h-4' />
        </button>
      )}
    </nav>
  );
}
