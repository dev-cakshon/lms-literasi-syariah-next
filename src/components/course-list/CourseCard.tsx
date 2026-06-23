'use client';

import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { buildMediaViewUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  chaptersLength: number;
  isPublished?: boolean;
  accessTier?: 'free' | 'premium';
  category?: string;
  activities?: number;
  author?: string;
  points?: number;
  originalPoints?: number;
  progress?: number;
  editUrl?: string;
  actions?: React.ReactNode;
}

export const CourseCard = ({
  id,
  title,
  description,
  imageUrl,
  chaptersLength,
  isPublished,
  accessTier,
  activities,
  author,
  points,
  originalPoints,
  progress,
  editUrl,
  actions,
}: CourseCardProps) => {
  const normalizedImageUrl = imageUrl ? buildMediaViewUrl(imageUrl) : null;
  const [imgError, setImgError] = useState(false);

  const href = editUrl || `/course/${id}`;
  const showImage = normalizedImageUrl && !imgError;

  const labelChip =
    progress !== undefined && progress > 0 ? (
      <span
        className={cn(
          'absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full',
          progress === 100
            ? 'bg-primary-600 text-white'
            : 'bg-amber-50 text-amber-ink',
        )}
      >
        {progress === 100 ? '✅ Selesai' : 'Sedang Berjalan'}
      </span>
    ) : null;

  return (
    <div className='bg-white group shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-[shadow,transform] overflow-hidden rounded-[var(--radius-card)] h-full flex flex-col'>
      <Link href={href} className='flex flex-col flex-1'>
        {/* Thumbnail */}
        {showImage ? (
          <div className='relative w-full aspect-video overflow-hidden bg-slate-200'>
            <Image
              fill
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover'
              alt={title}
              src={normalizedImageUrl}
              onError={() => setImgError(true)}
            />
            {labelChip}
          </div>
        ) : (
          <div className='relative w-full aspect-video overflow-hidden bg-slate-200 flex items-center justify-center'>
            <BookOpen className='h-10 w-10 text-slate-400' />
            {labelChip}
          </div>
        )}

        {/* Content */}
        <div className='flex flex-col flex-1 p-4'>
          {/* Tags */}
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              {chaptersLength > 0 && (
                <span className='rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-soft'>
                  {chaptersLength} Bab
                </span>
              )}
              {activities !== undefined && activities > 0 && (
                <span className='rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-soft'>
                  {activities} Aktivitas
                </span>
              )}
            </div>
            <div className='flex items-center gap-1.5'>
              {accessTier === 'premium' && (
                <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 uppercase tracking-wide'>
                  Premium
                </span>
              )}
              {typeof isPublished === 'boolean' && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    isPublished
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-warning-bg text-warning',
                  )}
                >
                  {isPublished ? 'Diterbitkan' : 'Draft'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className='font-semibold text-sm text-gray-800 group-hover:text-primary-700 transition line-clamp-2 mb-1'>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className='text-xs text-gray-500 line-clamp-3 mb-3 flex-1'>
              {description}
            </p>
          )}

          {/* Footer: Author + Points */}
          <div className='flex items-center justify-between mt-auto pt-3 border-t border-gray-100'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 rounded-full bg-slate-200' />
              <span className='text-xs text-gray-600'>
                {author || 'Pengajar'}
              </span>
            </div>
            {points !== undefined && (
              <div className='flex items-center gap-1.5'>
                {originalPoints !== undefined && originalPoints > points && (
                  <span className='text-xs text-gray-400 line-through'>
                    {originalPoints} pts
                  </span>
                )}
                <span className='text-sm font-bold text-amber-700'>
                  +{points} pts
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Progress bar + CTA — only when progress is provided (student view) */}
      {progress !== undefined && (
        <div className='px-4 pb-4 space-y-2'>
          <div className='flex items-center justify-between text-xs text-gray-500'>
            <span>
              {progress === 0
                ? 'Belum dimulai'
                : progress === 100
                  ? '✅ Selesai'
                  : 'Progres'}
            </span>
            <span>{progress}%</span>
          </div>
          <div className='h-1.5 bg-surface-container-high rounded-full overflow-hidden'>
            <div
              className={cn(
                'h-full rounded-full',
                progress === 100
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500'
                  : 'bg-gradient-to-r from-amber-300 to-amber-500',
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {actions && <div className='border-t border-gray-100'>{actions}</div>}
    </div>
  );
};
