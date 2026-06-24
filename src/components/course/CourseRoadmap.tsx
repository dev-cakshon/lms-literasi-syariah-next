'use client';

import { BookOpen, Check, Lock, Play, Trophy, X, Zap } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import { resetCourseProgressApi } from '@/lib/api';
import { getItemPath } from '@/lib/courseUtils';
import { useLeaderboard } from '@/hooks/use-realtime';

import { useAuth } from '@/contexts/AuthContext';

import type { CourseContentItem } from '@/types';

interface CourseRoadmapProps {
  course: { id: string; title: string };
  contentItems: CourseContentItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function CourseRoadmap({
  course,
  contentItems,
  isOpen,
  onClose,
}: CourseRoadmapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const { data: leaderboardData } = useLeaderboard();
  const [isResetting, setIsResetting] = useState(false);

  const xp = userProfile?.totalPoints ?? 0;
  const completedCount = contentItems.filter((i) => i.completed).length;
  const totalCount = contentItems.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeId =
    pathname.match(/\/chapter\/([^/]+)/)?.[1] ??
    pathname.match(/\/activity\/([^/]+)/)?.[1] ??
    null;

  const myRank = useMemo(() => {
    if (!user?.uid) return null;
    const idx = leaderboardData.findIndex((e) => e.uid === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboardData, user?.uid]);

  // useEffectEvent: onClose identity may change on each parent render,
  // but we only want to re-subscribe when isOpen changes, not on every render.
  const onEscape = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleItemClick = (item: CourseContentItem) => {
    if (item.locked) return;
    router.push(getItemPath(item, course.id));
    onClose();
  };

  const handleResetProgress = async () => {
    if (
      !window.confirm(
        'Reset all progress for this course? This is for dev/testing only.',
      )
    )
      return;
    setIsResetting(true);
    try {
      await resetCourseProgressApi(course.id);
      window.location.reload();
    } catch {
      alert('Failed to reset progress');
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden='true'
          className='fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[60]'
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-full max-w-[320px] bg-surface-container-low z-[70] flex flex-col border-emerald-deep/10 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label='Roadmap Kursus'
      >
        {/* Header */}
        <header className='p-6 bg-emerald-deep text-white flex items-center justify-between'>
          <div className='flex flex-col'>
            <h2 className='font-display text-xl font-semibold'>
              {course.title}
            </h2>
            {process.env.NEXT_PUBLIC_APP_ENV !== 'production' && (
              <div className='bg-surface-container-lowest'>
                <button
                  type='button'
                  onClick={() => void handleResetProgress()}
                  disabled={isResetting}
                  className='font-primary text-sm font-bold text-error-pop/60 hover:text-error-pop hover:underline transition-colors focus:outline-none disabled:opacity-50'
                >
                  {isResetting ? 'Mereset...' : 'Reset Progress (Dev)'}
                </button>
              </div>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup Roadmap'
            className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50'
          >
            <X className='w-5 h-5' />
          </button>
        </header>

        {/* Scrollable body */}
        <div className='flex-grow overflow-y-auto p-6 space-y-8'>
          {/* Stats pills */}
          <div className='flex gap-3'>
            <div className='bg-primary-container text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_0_0_#005141]'>
              <Zap className='w-4 h-4 text-amber-300 fill-amber-300' />
              <span className='text-sm font-bold tracking-wide'>{xp} XP</span>
            </div>
            <div className='bg-primary-container text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_4px_0_0_#005141]'>
              <Trophy className='w-4 h-4 text-tertiary-fixed' />
              <span className='text-sm font-bold tracking-wide'>
                {myRank != null ? `#${myRank}` : '#—'}
              </span>
            </div>
          </div>

          {/* Progress section */}
          <div className='space-y-3'>
            <div className='flex justify-between items-end px-1'>
              <span className='text-sm font-bold text-on-surface-variant tracking-wide'>
                Progress Bab
              </span>
              <span className='text-emerald-deep font-bold'>
                {progressPct}%
              </span>
            </div>
            <div className='h-4 w-full bg-surface-container-highest rounded-full overflow-hidden shadow-inner'>
              <div
                className='h-full bg-emerald-deep rounded-full shadow-[0_0_12px_rgba(5,95,77,0.4)] transition-all duration-500'
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Lesson list */}
          <div className='space-y-3'>
            <h3 className='px-1 text-xs font-bold text-on-surface-variant uppercase tracking-widest'>
              Daftar Materi
            </h3>
            {contentItems.map((item) => {
              const isCurrent = item.id === activeId;

              if (item.locked) {
                return (
                  <div
                    key={item.id}
                    className='flex items-center gap-4 p-4 rounded-2xl bg-surface-container-highest/50 border-2 border-dashed border-outline-variant opacity-60'
                  >
                    <div className='w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center text-on-surface-variant flex-shrink-0'>
                      <Lock className='w-5 h-5' />
                    </div>
                    <span className='font-bold text-on-surface-variant'>
                      {item.title}
                    </span>
                  </div>
                );
              }

              if (isCurrent) {
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleItemClick(item)}
                    className='w-full flex items-center gap-4 p-4 rounded-2xl bg-primary-fixed text-on-primary-fixed-variant
                      border-2 border-emerald-deep shadow-[0_4px_0_0_#005141] transition-all text-left'
                  >
                    <div className='w-10 h-10 rounded-full bg-emerald-deep flex items-center justify-center text-white flex-shrink-0'>
                      <Play className='w-5 h-5 animate-pulse fill-current' />
                    </div>
                    <span className='font-bold'>{item.title}</span>
                  </button>
                );
              }

              if (item.completed) {
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => handleItemClick(item)}
                    className='w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-outline-variant/30
                      hover:border-secondary-container transition-all text-left'
                  >
                    <div
                      className='w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center
                      text-on-secondary-container shadow-[0_4px_0_0_#367218] flex-shrink-0'
                    >
                      <Check className='w-5 h-5' />
                    </div>
                    <span className='font-bold text-on-surface'>
                      {item.title}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type='button'
                  onClick={() => handleItemClick(item)}
                  className='w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-outline-variant/30
                    hover:border-emerald-deep/40 transition-all text-left'
                >
                  <div
                    className='w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center
                    text-on-surface-variant border border-outline-variant flex-shrink-0'
                  >
                    <BookOpen className='w-5 h-5' />
                  </div>
                  <span className='font-bold text-on-surface'>
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
