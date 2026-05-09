'use client';

import { usePathname, useRouter } from 'next/navigation';

import { getChapterEmoji } from '@/lib/courseUtils';
import { cn } from '@/lib/utils';

interface CourseSidebarItemProps {
  id: string;
  label: string;
  isCompleted: boolean;
  isLocked?: boolean;
  courseId: string;
  type?: 'chapter' | 'quiz' | 'drag_drop' | 'word_search' | 'true_or_false';
  position: number;
  bestScorePercent?: number;
}

const ACTIVITY_CONFIG: Record<
  string,
  { icon: string; tagClass: string; label: string }
> = {
  drag_drop:     { icon: '🎯', tagClass: 'bg-amber-100 text-amber-700',  label: 'Drag & Drop' },
  word_search:   { icon: '🔍', tagClass: 'bg-sky-100 text-sky-700',      label: 'Word Search' },
  true_or_false: { icon: '✅', tagClass: 'bg-violet-100 text-violet-700', label: 'True/False'  },
  quiz:          { icon: '📝', tagClass: 'bg-slate-100 text-slate-600',   label: 'Kuis'        },
};

export const CourseSidebarItem = ({
  id,
  label,
  isCompleted,
  isLocked = false,
  courseId,
  type = 'chapter',
  position,
  bestScorePercent,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = Boolean(pathname?.includes(id));
  const isChapter = type === 'chapter';
  const actConfig = !isChapter ? (ACTIVITY_CONFIG[type] ?? ACTIVITY_CONFIG['quiz']) : null;

  const onClick = () => {
    if (isLocked) return;
    if (type === 'quiz') router.push(`/course/${courseId}/quiz/${id}`);
    else if (type === 'drag_drop') router.push(`/course/${courseId}/drag-drop/${id}`);
    else if (type === 'word_search') router.push(`/course/${courseId}/activity/${id}/word-search`);
    else if (type === 'true_or_false') router.push(`/course/${courseId}/activity/${id}/true-or-false`);
    else router.push(`/course/${courseId}/chapter/${id}`);
  };

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-2.5 px-4 py-3 border-l-[3px] transition-colors text-left',
        isLocked
          ? 'opacity-50 cursor-not-allowed border-l-transparent'
          : isActive
          ? 'bg-primary-50 border-l-primary-700'
          : isCompleted
          ? 'border-l-primary-400 hover:bg-primary-50/40'
          : 'border-l-transparent hover:bg-slate-50',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-8.5 h-8.5 flex items-center justify-center shrink-0 text-lg',
          isChapter ? 'rounded-lg' : 'rounded-xl',
          isLocked && 'grayscale opacity-60',
          !isLocked && isChapter && (isActive ? 'bg-mint' : isCompleted ? 'bg-primary-50' : 'bg-slate-100'),
          !isLocked && !isChapter && (isActive ? 'bg-sky-100' : isCompleted ? 'bg-emerald-50' : 'bg-slate-100'),
        )}
      >
        {isLocked
          ? '🔒'
          : isChapter
          ? getChapterEmoji(position)
          : (actConfig?.icon ?? '📝')}
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <p
          className={cn(
            'text-sm font-semibold truncate leading-snug',
            isLocked
              ? 'text-slate-400'
              : isActive
              ? 'text-primary-700 font-bold'
              : isCompleted
              ? 'text-primary-600'
              : 'text-slate-700',
          )}
        >
          {label}
        </p>
        <div>
          {isChapter ? (
            <span
              className={cn(
                'text-xs',
                isActive ? 'text-primary-500' : 'text-slate-400',
              )}
            >
              📖 Materi
            </span>
          ) : (
            <span
              className={cn(
                'text-xs font-bold rounded px-1 py-0.5',
                actConfig?.tagClass ?? 'bg-slate-100 text-slate-600',
              )}
            >
              {actConfig?.label ?? type}
            </span>
          )}
        </div>
      </div>

      {/* Right badge */}
      <div className='shrink-0 text-sm'>
        {isLocked ? null : !isChapter &&
          bestScorePercent !== undefined &&
          bestScorePercent > 0 ? (
          <span className='text-[10px] font-bold text-primary-600 bg-primary-50 border border-mint rounded-full px-1.5 py-0.5'>
            {bestScorePercent}%
          </span>
        ) : isCompleted ? (
          '✅'
        ) : isActive ? (
          <span className='text-primary-600'>▶</span>
        ) : null}
      </div>
    </button>
  );
};
