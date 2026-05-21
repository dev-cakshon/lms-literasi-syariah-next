import {
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Grid2X2,
  Info,
  Lock,
  Play,
  Search,
} from 'lucide-react';
import Link from 'next/link';

import type { CourseContentItem } from '@/types';

interface Props {
  item: CourseContentItem;
  displayIndex: number;
  isNextUp: boolean;
  courseId: string;
}

export default function CourseContentItemRow({
  item,
  displayIndex,
  isNextUp,
  courseId,
}: Props) {
  const labelPrefix =
    item.itemType === 'chapter'
      ? `Bab ${displayIndex}`
      : `Aktivitas ${displayIndex}`;

  let href: string;
  if (item.itemType === 'chapter') {
    href = `/course/${courseId}/chapter/${item.id}`;
  } else if (item.type === 'drag_drop') {
    href = `/course/${courseId}/drag-drop/${item.id}`;
  } else if (item.type === 'word_search') {
    href = `/course/${courseId}/activity/${item.id}/word-search`;
  } else {
    href = `/course/${courseId}/activity/${item.id}/true-or-false`;
  }

  let DefaultIcon;
  if (item.itemType === 'chapter') {
    DefaultIcon = BookOpen;
  } else if (item.type === 'drag_drop') {
    DefaultIcon = Grid2X2;
  } else if (item.type === 'word_search') {
    DefaultIcon = Search;
  } else {
    DefaultIcon = CheckSquare;
  }

  const bestScore =
    item.itemType === 'activity' ? (item.bestScorePercent ?? 0) : 0;

  if (item.locked) {
    return (
      <div className='relative group/locked'>
        {/* Tooltip */}
        <div className='absolute -top-12 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap z-20 shadow-lg pointer-events-none opacity-0 group-hover/locked:opacity-100 group-focus-within/locked:opacity-100 transition-opacity duration-150'>
          <Info size={12} className='shrink-0' />
          Selesaikan materi sebelumnya untuk membuka
          <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-inverse-surface rotate-45' />
        </div>
        {/* Locked card */}
        <div
          role='button'
          tabIndex={0}
          className='bg-surface-variant border-2 border-outline-variant rounded-2xl p-5 flex items-center gap-4 opacity-70 cursor-not-allowed'
        >
          <div className='w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0'>
            <Lock size={20} className='text-outline' />
          </div>
          <div className='flex flex-col gap-0.5 min-w-0'>
            <span className='text-xs font-bold uppercase tracking-wider text-outline'>
              {labelPrefix}
            </span>
            <span className='font-semibold text-on-surface-soft truncate'>
              {item.title}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (item.completed) {
    return (
      <Link
        href={href}
        className='bg-white border-2 border-accent-lime/40 rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated-2)] transition-all duration-300 group'
      >
        <div className='w-12 h-12 rounded-full bg-accent-lime flex items-center justify-center shrink-0'>
          <CheckCircle2 size={22} className='text-accent-lime-ink' />
        </div>
        <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
          <span className='text-xs font-bold uppercase tracking-wider text-accent-lime-ink'>
            {labelPrefix}
          </span>
          <span className='font-semibold text-on-surface truncate'>
            {item.title}
          </span>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          {bestScore > 0 && (
            <span className='text-xs font-bold bg-primary-50 text-primary-700 rounded-full px-2 py-0.5'>
              {bestScore}%
            </span>
          )}
          <span className='bg-accent-lime/30 text-accent-lime-ink rounded-full px-3 py-1 text-xs font-bold'>
            Selesai
          </span>
        </div>
      </Link>
    );
  }

  if (isNextUp) {
    return (
      <Link
        href={href}
        className='bg-white border-2 border-amber-500 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-[0_8px_24px_rgba(245,158,11,0.12)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated-2)] transition-all duration-300'
      >
        <div className='absolute top-0 inset-x-0 h-1 bg-amber-500' />
        <div className='w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-md'>
          <Play size={22} className='text-white' />
        </div>
        <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
          <span className='text-xs font-bold uppercase tracking-wider text-amber-700'>
            {labelPrefix}
          </span>
          <span className='font-semibold text-amber-700 truncate'>
            {item.title}
          </span>
        </div>
        <span className='shrink-0 bg-amber-500 text-amber-ink rounded-full px-3 py-1 text-xs font-bold animate-pulse'>
          ▶ Kamu di sini
        </span>
      </Link>
    );
  }

  // Unlocked, not completed, not next-up
  return (
    <Link
      href={href}
      className='bg-white border-2 border-surface-variant rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated-1)] transition-all duration-300 group'
    >
      <div className='w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0'>
        <DefaultIcon size={20} className='text-on-surface-soft' />
      </div>
      <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
        <span className='text-xs font-bold uppercase tracking-wider text-outline'>
          {labelPrefix}
        </span>
        <span className='font-semibold text-on-surface truncate group-hover:text-primary-700 transition-colors'>
          {item.title}
        </span>
      </div>
      {bestScore > 0 && (
        <span className='text-xs font-bold bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 shrink-0'>
          {bestScore}%
        </span>
      )}
    </Link>
  );
}
