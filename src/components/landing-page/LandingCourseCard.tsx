'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

import { createEnrollmentRequest } from '@/lib/api';

import { useAuth } from '@/contexts/AuthContext';

import UnstyledLink from '../links/UnstyledLink';

export interface CourseCardProps {
  id: string;
  title: string;
  iconName: string;
  duration: string;
  level?: 'Pemula' | 'Menengah' | 'Lanjutan';
  accessTier?: 'free' | 'premium';
  href: string;
}

export const LandingCourseCard = ({
  id,
  title,
  iconName,
  duration,
  level,
  accessTier,
  href,
}: CourseCardProps) => {
  const isPremium = accessTier === 'premium';
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleRequestAccess = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitting || requested) return;

    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      await createEnrollmentRequest(id);
      setRequested(true);
      toast.success(
        'Permintaan akses telah dikirim. Tunggu persetujuan admin.',
      );
    } catch {
      toast.error('Gagal mengirim permintaan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-surface-variant relative overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300 shadow-sm hover:shadow-md'>
      {/* Watermark star */}
      <span className='material-symbols-outlined absolute -right-10 -top-10 text-[150px] text-surface-variant opacity-40 watermark-star pointer-events-none'>
        brightness_low
      </span>

      {/* Icon tile + level / premium badges */}
      <div className='flex justify-between items-start mb-6 relative z-10'>
        <UnstyledLink href={href} tabIndex={-1} aria-hidden='true'>
          {isPremium ? (
            <div className='w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center'>
              <Lock className='w-7 h-7 text-amber-600' />
            </div>
          ) : (
            <div className='w-16 h-16 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-inner'>
              <span className='material-symbols-outlined text-3xl'>
                {iconName}
              </span>
            </div>
          )}
        </UnstyledLink>

        <div className='flex flex-col items-end gap-1'>
          {level && (
            <span className='bg-accent-lime text-accent-lime-ink px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide'>
              {level}
            </span>
          )}
          {isPremium && (
            <span className='bg-amber-500 text-white px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide'>
              Premium
            </span>
          )}
        </div>
      </div>

      {/* Title — links to course (routes to PremiumGateScreen for gated courses) */}
      <div className='relative z-10 flex-grow'>
        <UnstyledLink href={href}>
          <h3 className='font-display text-xl text-dark mb-2 line-clamp-2 hover:text-primary-700 transition-colors'>
            {title}
          </h3>
        </UnstyledLink>
      </div>

      {/* Footer row */}
      <div className='relative z-10 pt-6 border-t border-surface-variant flex items-center justify-between'>
        <div className='flex items-center gap-2 text-on-surface-soft text-sm'>
          <span className='material-symbols-outlined text-base'>
            format_list_bulleted
          </span>
          <span>{duration}</span>
        </div>

        {isPremium ? (
          requested ? (
            <button
              disabled
              className='text-amber-700 font-bold bg-amber-50 px-4 py-2 rounded-full text-sm opacity-70 cursor-not-allowed flex items-center gap-1.5'
            >
              <Lock className='w-3.5 h-3.5' />
              Menunggu Persetujuan
            </button>
          ) : (
            <button
              onClick={handleRequestAccess}
              disabled={submitting}
              className='text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-full transition-colors text-sm flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-wait'
            >
              <Lock className='w-3.5 h-3.5' />
              {submitting ? 'Mengirim...' : 'Minta Akses'}
            </button>
          )
        ) : (
          <UnstyledLink
            href={href}
            className='text-primary-700 font-bold hover:bg-surface-container px-4 py-2 rounded-full transition-colors flex items-center gap-1'
          >
            Lihat Kursus
            <span className='material-symbols-outlined text-base'>
              chevron_right
            </span>
          </UnstyledLink>
        )}
      </div>
    </div>
  );
};
