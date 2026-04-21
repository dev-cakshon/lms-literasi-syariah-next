'use client';

import { BookOpen, Gamepad2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  chaptersLength: number;
  isPublished?: boolean;
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
  activities,
  author,
  points,
  originalPoints,
  editUrl,
  actions,
}: CourseCardProps) => {
  const normalizedImageUrl = imageUrl
    ? imageUrl.startsWith('http') || imageUrl.startsWith('/')
      ? imageUrl
      : `/${imageUrl}`
    : null;

  const href = editUrl || `/course/${id}`;

  return (
    <div className='bg-white group hover:shadow-md transition-shadow overflow-hidden border rounded-xl h-full flex flex-col'>
      <Link href={href} className='flex flex-col flex-1'>
        {/* Thumbnail */}
        {normalizedImageUrl ? (
          <div className='relative w-full aspect-video overflow-hidden bg-slate-200'>
            <Image
              fill
              className='object-cover'
              alt={title}
              src={normalizedImageUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className='relative w-full aspect-video overflow-hidden bg-slate-200 flex items-center justify-center'>
            <BookOpen className='h-10 w-10 text-slate-400' />
          </div>
        )}

        {/* Content */}
        <div className='flex flex-col flex-1 p-4'>
          {/* Tags */}
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-2'>
              {chaptersLength > 0 && (
                <span className='text-xs text-gray-500 flex items-center gap-1'>
                  <BookOpen className='w-3 h-3' />
                  {chaptersLength} Bab
                </span>
              )}
              {activities !== undefined && activities > 0 && (
                <span className='text-xs text-gray-500 flex items-center gap-1'>
                  <Gamepad2 className='w-3 h-3' />
                  {activities} Aktivitas
                </span>
              )}
            </div>
            {typeof isPublished === 'boolean' && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isPublished
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700',
                )}
              >
                {isPublished ? 'Diterbitkan' : 'Draft'}
              </span>
            )}
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
                <span className='text-sm font-bold text-primary-600'>
                  +{points} pts
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {actions && <div className='border-t border-gray-100'>{actions}</div>}
    </div>
  );
};
