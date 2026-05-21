'use client';

import { Map, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import { getChapterOrdinal } from '@/lib/courseUtils';

import { Logo } from '@/components/Logo';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

interface CourseNavbarProps {
  courseId: string;
}

export const CourseNavbar = ({ courseId }: CourseNavbarProps) => {
  const { contentItems, courseTitle, setPetaOpen, myRank } =
    useContext(CourseLayoutContext);
  const { userProfile } = useAuth();
  const pathname = usePathname();

  const chapterId = pathname.match(/\/chapter\/([^/]+)/)?.[1] ?? null;
  const activityId = pathname.match(/\/activity\/([^/]+)/)?.[1] ?? null;

  const currentItem = (() => {
    if (chapterId) return contentItems.find((i) => i.id === chapterId) ?? null;
    if (activityId)
      return contentItems.find((i) => i.id === activityId) ?? null;
    return null;
  })();

  const currentItemLabel = (() => {
    if (!currentItem) return null;
    if (currentItem.itemType === 'chapter') {
      const ordinal = getChapterOrdinal(contentItems, currentItem.id);
      return `Bab ${ordinal} · ${currentItem.title}`;
    }
    return currentItem.title;
  })();

  const completedCount = contentItems.filter((i) => i.completed).length;
  const totalCount = contentItems.length;

  const xp = userProfile?.totalPoints ?? 0;

  return (
    <nav
      className='fixed top-0 left-0 w-full z-50 flex justify-between items-center h-20 px-5 md:px-20
        bg-emerald-deep border-b-4 border-primary-container shadow-[0_8px_30px_rgba(5,95,77,0.2)]
        rounded-b-[40px] font-primary'
    >
      {/* Left cluster */}
      <div className='flex items-center gap-3 min-w-0'>
        {/* Logo in squishy square */}
        <Link
          href='/dashboard'
          className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0 hover:scale-105 transition-transform'
          aria-label='Beranda'
        >
          <Logo logotype='textless' theme='dark' size='sm' showText={false} />
        </Link>

        <button
          type='button'
          onClick={() => setPetaOpen(true)}
          className='bg-primary-fixed text-on-primary-fixed-variant flex items-center gap-2 rounded-full px-4 py-1.5
              shadow-[0_2px_0_0_#005141] hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm font-bold'
        >
          <Map className='w-4 h-4' />
          Roadmap
        </button>

        {/* Frosted breadcrumb pill (desktop) */}
        <div className='hidden md:flex items-center bg-primary-container/30 backdrop-blur-sm p-1.5 rounded-full border border-primary-fixed/20'>
          <div className='flex items-center gap-2 px-3 text-sm'>
            <Link
              href='/my-courses'
              className='text-primary-fixed/80 hover:text-white transition-colors shrink-0'
            >
              Kursus Saya
            </Link>
            {courseTitle && (
              <>
                <span className='text-primary-fixed/40 shrink-0'>/</span>
                <Link
                  href={`/course/${courseId}`}
                  className={`transition-colors truncate max-w-40 ${currentItemLabel ? 'text-primary-fixed/80 hover:text-white' : 'text-white font-bold'}`}
                  title={courseTitle}
                >
                  {courseTitle}
                </Link>
                {currentItemLabel && (
                  <>
                    <span className='text-primary-fixed/40 shrink-0'>/</span>
                    <span className='text-white font-bold truncate max-w-48'>
                      {currentItemLabel}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right cluster */}
      <div className='flex items-center gap-2 shrink-0'>
        {/* Progress pill */}
        {totalCount > 0 && (
          <div className='flex items-center gap-2 bg-primary-container/40 px-3 py-1.5 rounded-full border border-primary-fixed/20 shadow-inner'>
            <span className='text-sm text-white font-bold mr-1'>
              {completedCount} / {totalCount}
            </span>
            <div className='flex gap-2'>
              {Array.from({ length: totalCount }, (_, i) => (
                <div
                  key={i}
                  className={
                    i < completedCount
                      ? 'w-3 h-3 rounded-full bg-secondary-fixed shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(176,245,139,0.3)]'
                      : 'w-3 h-3 rounded-full bg-white/20 shadow-inner'
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* XP chip */}
        <div className='hidden md:flex items-center gap-2 bg-primary-container text-white px-3 py-1.5 rounded-xl shadow-[0_4px_0_0_#005141] hover:-translate-y-0.5 transition-transform'>
          <Zap className='w-4 h-4 text-amber-300 fill-amber-300' />
          <span className='text-sm font-bold'>{xp}</span>
        </div>

        {/* Rank chip */}
        <div className='hidden md:flex items-center gap-2 bg-primary-container text-white px-3 py-1.5 rounded-xl shadow-[0_4px_0_0_#005141] hover:-translate-y-0.5 transition-transform'>
          <Trophy className='w-4 h-4 text-tertiary-fixed' />
          <span className='text-sm font-bold'>
            {myRank != null ? `#${myRank}` : '#—'}
          </span>
        </div>
      </div>
    </nav>
  );
};
