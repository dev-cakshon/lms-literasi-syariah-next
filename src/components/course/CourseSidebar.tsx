'use client';

import { useState } from 'react';

import { resetCourseProgressApi } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';

import { CourseSidebarItem } from './CourseSidebarItem';

import type { CourseContentItem } from '@/types';

interface CourseSidebarProps {
  course: {
    id: string;
    title: string;
    price?: number;
  };
  contentItems: CourseContentItem[];
}

export const CourseSidebar = ({ course, contentItems }: CourseSidebarProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const { userProfile } = useAuth();

  const completedCount = contentItems.filter((item) => item.completed).length;
  const totalCount = contentItems.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const xp = userProfile?.totalPoints ?? 0;
  const badgeCount = userProfile?.badges?.length ?? 0;

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
    } catch (error) {
      console.error('Failed to reset progress:', error);
      alert('Failed to reset progress');
      setIsResetting(false);
    }
  };

  return (
    <div className='h-full flex flex-col overflow-hidden border-r'>

      {/* ── Zone 1: Gamification block ── */}
      <div
        className='shrink-0 px-4.5 py-5 relative overflow-hidden'
        style={{ background: 'linear-gradient(160deg, #174339 0%, #1e5548 100%)' }}
      >
        {/* decorative circle */}
        <div
          aria-hidden
          className='absolute -top-5 -right-5 w-[90px] h-[90px] rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.08)' }}
        />

        <p className='text-xs font-bold tracking-[1.2px] uppercase text-white/40 mb-1'>
          Kursus Aktif
        </p>
        <h1 className='font-bold text-white leading-snug mb-3.5'>
          {course.title}
        </h1>

        {/* Stats */}
        <div className='flex gap-2 mb-3'>
          <div
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold'
            style={{
              background: 'rgba(144,210,109,0.2)',
              border: '1px solid rgba(144,210,109,0.35)',
              color: '#d9edbf',
            }}
          >
            ⚡ {xp} XP
          </div>
          <div
            className='flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-white'
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            🏅 {badgeCount} Badge
          </div>
        </div>

        {/* Progress bar */}
        <div className='flex justify-between items-center mb-1.5'>
          <span className='text-[10px] font-semibold text-white/55'>
            {completedCount} dari {totalCount} konten selesai
          </span>
          <span className='text-[10px] font-bold' style={{ color: '#90d26d' }}>
            {progressPct}%
          </span>
        </div>
        <div
          className='h-1.5 rounded-full overflow-hidden'
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <div
            className='h-full rounded-full transition-all'
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #3a9478, #90d26d)',
            }}
          />
        </div>

        {process.env.NEXT_PUBLIC_APP_ENV !== 'production' && (
          <button
            type='button'
            onClick={handleResetProgress}
            disabled={isResetting}
            className='mt-3 text-left text-md text-red-400 hover:underline disabled:opacity-50'
          >
            {isResetting ? 'Mereset...' : 'Reset Progress (Dev)'}
          </button>
        )}
      </div>

      {/* ── Zone 2: Flat content list ── */}
      <div className='flex-1 overflow-y-auto'>
        <p className='text-xs font-bold tracking-[1px] uppercase text-slate-400 px-4 pt-3 pb-1'>
          Konten Kursus
        </p>
        {contentItems.map((item, index) => {
          const isChapter = item.itemType === 'chapter';
          const showDivider =
            isChapter && index < contentItems.length - 1;

          return (
            <div key={item.id}>
              <CourseSidebarItem
                id={item.id}
                courseId={course.id}
                label={item.title}
                isCompleted={item.completed}
                isLocked={item.locked}
                type={isChapter ? 'chapter' : (item.type ?? 'true_or_false')}
                position={item.position}
                bestScorePercent={item.itemType === 'activity' ? item.bestScorePercent : undefined}
              />
              {showDivider && (
                <div className='mx-4 h-px bg-slate-100' />
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
