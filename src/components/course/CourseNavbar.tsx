'use client';

import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext } from 'react';

import { getChapterOrdinal } from '@/lib/courseUtils';

import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

interface CourseNavbarProps {
  courseId: string;
}

export const CourseNavbar = ({ courseId }: CourseNavbarProps) => {
  const { contentItems, courseTitle } = useContext(CourseLayoutContext);
  const { user, userProfile, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const chapterMatch = pathname.match(/\/chapter\/([^/]+)/);
  const activityMatch = pathname.match(/\/activity\/([^/]+)/);
  const chapterId = chapterMatch?.[1] ?? null;
  const activityId = activityMatch?.[1] ?? null;

  const currentItemLabel = (() => {
    if (chapterId) {
      const item = contentItems.find((i) => i.id === chapterId);
      const ordinal = getChapterOrdinal(contentItems, chapterId);
      return item ? `Bab ${ordinal} · ${item.title}` : null;
    }
    if (activityId) {
      const item = contentItems.find((i) => i.id === activityId);
      return item ? item.title : null;
    }
    return null;
  })();

  const completedCount = contentItems.filter((i) => i.completed).length;
  const totalCount = contentItems.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const displayName = userProfile?.name || user?.email || 'Student';

  return (
    <div className='px-4 h-full flex items-center gap-4 bg-white border-b border-slate-200 shadow-sm'>
      {/* Logo */}
      <Link href='/dashboard' className='shrink-0'>
        <Logo logotype='textless' theme='light' size='sm' />
      </Link>

      {/* Breadcrumb */}
      <nav className='flex items-center gap-1.5 text-xs flex-1 min-w-0'>
        <Link
          href='/my-courses'
          className='text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap'
        >
          Kursus Saya
        </Link>
        <span className='text-slate-300 shrink-0'>›</span>
        <Link
          href={`/course/${courseId}`}
          className='text-slate-500 hover:text-slate-800 transition-colors truncate max-w-45'
          title={courseTitle}
        >
          {courseTitle}
        </Link>
        {currentItemLabel && (
          <>
            <span className='text-slate-300 shrink-0'>›</span>
            <span
              className='text-slate-800 font-semibold truncate max-w-55'
              title={currentItemLabel}
            >
              {currentItemLabel}
            </span>
          </>
        )}
      </nav>

      {/* Right side: progress pill + profile */}
      <div className='flex items-center gap-2 shrink-0'>
        {totalCount > 0 && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold border ${
              allDone
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {!allDone && (
              <span className='w-1.25 h-1.25 rounded-full bg-amber-400 shrink-0 animate-pulse' />
            )}
            {completedCount} / {totalCount} selesai
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition cursor-pointer'>
              <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0'>
                <User className='w-4 h-4 text-primary-600' />
              </div>
              <span className='text-sm font-medium text-slate-700 max-w-28 truncate hidden sm:block'>
                {displayName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-44'>
            <DropdownMenuItem
              onClick={handleSignOut}
              className='cursor-pointer'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
