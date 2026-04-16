'use client';

import {
  CheckCircle,
  CheckSquare,
  Grid2X2,
  Lock,
  PlayCircle,
  Search,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface CourseSidebarItemProps {
  id: string;
  label: string;
  isCompleted: boolean;
  isLocked?: boolean;
  courseId: string;
  type?: 'chapter' | 'quiz' | 'drag_drop' | 'word_search' | 'true_or_false';
}

export const CourseSidebarItem = ({
  id,
  label,
  isCompleted,
  isLocked = false,
  courseId,
  type = 'chapter',
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const ActivityIcon =
    type === 'drag_drop'
      ? Grid2X2
      : type === 'word_search'
      ? Search
      : type === 'true_or_false'
      ? CheckSquare
      : PlayCircle;

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : ActivityIcon;

  const isActive = pathname?.includes(id);

  const onClick = () => {
    if (isLocked) return;

    if (type === 'quiz') {
      router.push(`/course/${courseId}/quiz/${id}`);
    } else if (type === 'drag_drop') {
      router.push(`/course/${courseId}/drag-drop/${id}`);
    } else if (type === 'word_search') {
      router.push(`/course/${courseId}/activity/${id}/word-search`);
    } else if (type === 'true_or_false') {
      router.push(`/course/${courseId}/activity/${id}/true-or-false`);
    } else {
      router.push(`/course/${courseId}/chapter/${id}`);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20',
        isActive && 'text-slate-700 bg-slate-200/20 hover:text-slate-700',
        isCompleted && 'text-primary-700 hover:text-primary-700',
        isCompleted && isActive && 'bg-primary-200/20',
        isLocked &&
          'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-slate-500'
      )}
    >
      {/* ICON */}
      <div className='flex items-center gap-x-2 py-4'>
        <Icon
          size={22}
          className={cn(
            'text-slate-500',
            isActive && 'text-slate-700',
            isCompleted && 'text-primary-700'
          )}
        />
        {label}
      </div>
      {/* VERTICAL BOOKMARK */}
      <div
        className={cn(
          'ml-auto opacity-0 border-2 border-slate-700 h-full transition-all',
          isActive && 'opacity-100',
          isCompleted && 'border-primary-700'
        )}
      />
    </button>
  );
};
