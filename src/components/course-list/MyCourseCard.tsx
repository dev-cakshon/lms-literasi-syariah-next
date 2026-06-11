'use client';

import { ArrowRight, Award, BookOpen, CheckCircle2, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { buildMediaViewUrl } from '@/lib/media';

interface MyCourseCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl: string | null;
  chaptersLength: number;
  activities?: number;
  progress: number;
  accessTier?: 'free' | 'premium';
  onViewCertificate?: () => void;
}

export function MyCourseCard({
  id,
  title,
  description,
  imageUrl,
  chaptersLength,
  activities,
  progress,
  accessTier,
  onViewCertificate,
}: MyCourseCardProps) {
  const normalizedImageUrl = imageUrl ? buildMediaViewUrl(imageUrl) : null;
  const [imgError, setImgError] = useState(false);
  const showImage = normalizedImageUrl && !imgError;

  const status =
    progress >= 100 ? 'completed' : progress > 0 ? 'running' : 'not-started';

  const ctaClass =
    'w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors';

  return (
    <div
      className={[
        'group bg-white rounded-3xl overflow-hidden border',
        'shadow-[var(--shadow-elevated-1)] hover:shadow-[var(--shadow-elevated-2)] hover:-translate-y-1 transition-all duration-500',
        'flex flex-col',
        status === 'completed'
          ? 'border-primary-300/30'
          : 'border-surface-variant/50',
      ].join(' ')}
    >
      {/* Thumbnail */}
      <Link href={`/course/${id}`} tabIndex={-1} aria-hidden='true'>
        <div
          className={[
            'relative aspect-[16/10] overflow-hidden bg-slate-200',
            status === 'not-started' ? 'grayscale-[0.2]' : '',
          ].join(' ')}
        >
          {showImage ? (
            <Image
              fill
              className='object-cover group-hover:scale-110 transition-transform duration-700'
              alt={title}
              src={normalizedImageUrl}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <BookOpen className='w-12 h-12 text-slate-400' />
            </div>
          )}

          {status === 'running' && (
            <span className='absolute top-4 left-4 bg-amber-500 text-amber-ink text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md'>
              Sedang Berjalan
            </span>
          )}
          {status === 'completed' && (
            <span className='absolute top-4 left-4 bg-primary-100 text-primary-700 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1'>
              <CheckCircle2 className='w-3 h-3' />
              Selesai
            </span>
          )}
          {status === 'not-started' && (
            <span className='absolute top-4 left-4 bg-slate-300 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md'>
              Belum Mulai
            </span>
          )}
          {accessTier === 'premium' && (
            <span className='absolute top-4 right-4 bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md'>
              Premium
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div
        className={[
          'p-6 flex flex-col flex-grow',
          status === 'completed' ? 'bg-primary-50/40' : '',
        ].join(' ')}
      >
        {/* Info chips */}
        <div className='flex gap-2 mb-3 flex-wrap'>
          {status === 'completed' ? (
            <span className='bg-surface-container text-on-surface-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md'>
              Sertifikat
            </span>
          ) : (
            <>
              {chaptersLength > 0 && (
                <span className='bg-surface-container text-on-surface-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md'>
                  {chaptersLength} BAB
                </span>
              )}
              {activities !== undefined && activities > 0 && (
                <span className='bg-surface-container text-on-surface-soft text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md'>
                  {activities} Aktivitas
                </span>
              )}
            </>
          )}
        </div>

        {/* Title */}
        <Link href={`/course/${id}`}>
          <h3 className='font-display text-[20px] leading-[28px] font-semibold text-on-surface mb-2 line-clamp-2 hover:text-primary-600 transition-colors'>
            {title}
          </h3>
        </Link>

        {/* Description */}
        {description && (
          <p className='text-[14px] leading-[22px] text-on-surface-soft line-clamp-2 mb-4 flex-grow'>
            {description}
          </p>
        )}

        {/* Progress block */}
        <div className='mt-auto'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-on-surface-soft text-[11px] font-bold uppercase tracking-wider'>
              {status === 'completed' ? 'Lulus' : 'Progress'}
            </span>
            <span
              className={`text-[11px] font-bold ${
                status === 'completed'
                  ? 'text-primary-700'
                  : status === 'running'
                    ? 'text-amber-700'
                    : 'text-slate-500'
              }`}
            >
              {progress}%
            </span>
          </div>
          <div className='w-full bg-surface-variant rounded-full h-2 mb-4'>
            <div
              className={`h-2 rounded-full ${
                status === 'completed'
                  ? 'bg-primary-600'
                  : status === 'running'
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* CTAs */}
          {status === 'running' && (
            <Link
              href={`/course/${id}`}
              className={`${ctaClass} bg-amber-500 text-amber-ink hover:bg-amber-600`}
            >
              Lanjutkan <ArrowRight className='w-4 h-4' />
            </Link>
          )}
          {status === 'not-started' && (
            <Link
              href={`/course/${id}`}
              className={`${ctaClass} border border-outline-variant text-on-surface-soft hover:bg-surface-container`}
            >
              Mulai <Play className='w-4 h-4' />
            </Link>
          )}
          {status === 'completed' &&
            (onViewCertificate ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewCertificate();
                }}
                className={`${ctaClass} border border-primary-300 text-primary-700 hover:bg-primary-50`}
              >
                <Award className='w-4 h-4' /> Lihat Sertifikat
              </button>
            ) : (
              <Link
                href={`/course/${id}`}
                className={`${ctaClass} border border-primary-300 text-primary-700 hover:bg-primary-50`}
              >
                <Award className='w-4 h-4' /> Lihat Sertifikat
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
