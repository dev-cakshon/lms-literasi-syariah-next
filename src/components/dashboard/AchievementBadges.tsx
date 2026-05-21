'use client';

import { useAuth } from '@/contexts/AuthContext';

import { BADGE_DEFINITIONS } from './badgeDefinitions';
import { BadgeTile } from './BadgeTile';

export const AchievementBadges = () => {
  const { userProfile: profile, loading } = useAuth();

  const isUnlocked = (id: string) =>
    profile?.badges?.some((b) => b === id) ?? false;

  return (
    <section className='bg-white rounded-[2rem] shadow-xl border border-[var(--color-amber-100)] overflow-hidden flex flex-col relative'>
      <div className='p-5 lg:p-6 border-b border-[var(--color-amber-300)] flex items-center bg-gradient-to-r from-[var(--color-amber-300)] to-[var(--color-amber-100)]'>
        <h2 className='text-xl font-bold text-[var(--color-amber-ink)]'>
          🎖️ Badges
        </h2>
      </div>

      <div className='p-5 lg:p-6 flex-grow bg-[var(--color-amber-50)] flex flex-col gap-6 lg:gap-8'>
        {loading ? (
          <>
            <div className='grid grid-cols-3 gap-4'>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className='flex flex-col items-center gap-2 animate-pulse'
                >
                  <div className='w-16 h-16 rounded-full bg-gray-200' />
                  <div className='h-3 w-14 rounded bg-gray-200' />
                </div>
              ))}
            </div>
            <div className='grid grid-cols-3 gap-4'>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className='flex flex-col items-center gap-2 animate-pulse'
                >
                  <div className='w-16 h-16 rounded-full bg-gray-200' />
                  <div className='h-3 w-14 rounded bg-gray-200' />
                </div>
              ))}
            </div>
          </>
        ) : (
          [0, 3].map((start) => (
            <div key={start} className='relative'>
              <div className='grid grid-cols-3 gap-4'>
                {BADGE_DEFINITIONS.slice(start, start + 3).map((def) => (
                  <BadgeTile
                    key={def.id}
                    definition={def}
                    unlocked={isUnlocked(def.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className='confetti-dot bg-blue-400 top-20 right-10 opacity-30' />
      <div className='confetti-dot bg-[var(--color-primary-400)] bottom-32 left-8 opacity-30' />
      <div className='confetti-dot bg-pink-400 top-1/2 right-4 opacity-30' />
    </section>
  );
};
