'use client';

import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { createEnrollmentRequest } from '@/lib/api';

import { Button } from '@/components/ui/button';

import type { Course, EnrollmentRequest } from '@/types';

interface PremiumGateScreenProps {
  course: Pick<Course, 'id' | 'title' | 'description'>;
  /** The student's existing enrollment request for this course, or null. */
  request: EnrollmentRequest | null;
  /** Called when the student submits a new request so the parent can update state. */
  onRequested: (req: EnrollmentRequest) => void;
}

/**
 * Full-screen gate rendered by the course layout when the backend returns
 * 403 PREMIUM_NOT_ENROLLED. Mirrors the centered-state pattern used across
 * activity pages and borrows the Lock icon idiom from CourseContentItemRow.
 */
export function PremiumGateScreen({
  course,
  request,
  onRequested,
}: PremiumGateScreenProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const newReq = await createEnrollmentRequest(course.id);
      onRequested(newReq);
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
    <div className='min-h-screen bg-pattern-organic flex flex-col items-center justify-center px-4'>
      <div className='w-full max-w-md bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-elevated-1)] border border-slate-200 p-8 flex flex-col items-center gap-6 text-center'>
        {/* Lock icon */}
        <div className='w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center'>
          <Lock className='w-8 h-8 text-amber-600' />
        </div>

        {/* Premium badge */}
        <span className='inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700'>
          Premium
        </span>

        {/* Course identity */}
        <div className='space-y-1'>
          <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900'>
            {course.title}
          </h1>
          {course.description && (
            <p className='text-sm text-slate-500 line-clamp-3'>
              {course.description}
            </p>
          )}
        </div>

        {/* Status-driven CTA */}
        {!request && (
          <div className='w-full space-y-3'>
            <p className='text-sm text-slate-600'>
              Kursus ini memerlukan persetujuan admin untuk diakses.
            </p>
            <Button
              className='w-full'
              onClick={handleRequest}
              disabled={submitting}
            >
              {submitting ? 'Mengirim...' : 'Minta Akses'}
            </Button>
          </div>
        )}

        {request?.status === 'pending' && (
          <div className='w-full space-y-3'>
            <p className='text-sm text-slate-600'>
              Permintaan akses kamu sedang ditinjau oleh admin.
            </p>
            <Button className='w-full' disabled>
              Menunggu persetujuan
            </Button>
          </div>
        )}

        {request?.status === 'declined' && (
          <div className='w-full space-y-3'>
            {request.declineReason && (
              <div className='rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-left'>
                <span className='font-semibold'>Alasan penolakan:</span>{' '}
                {request.declineReason}
              </div>
            )}
            <p className='text-sm text-slate-600'>
              Permintaan akses kamu sebelumnya ditolak. Kamu bisa mengajukan
              ulang.
            </p>
            <Button
              className='w-full'
              onClick={handleRequest}
              disabled={submitting}
            >
              {submitting ? 'Mengirim...' : 'Minta Akses lagi'}
            </Button>
          </div>
        )}

        {request?.status === 'revoked' && (
          <div className='w-full space-y-3'>
            <p className='text-sm text-slate-600'>
              Akses kamu ke kursus ini telah dicabut oleh admin. Kamu bisa
              mengajukan akses kembali.
            </p>
            <Button
              className='w-full'
              onClick={handleRequest}
              disabled={submitting}
            >
              {submitting ? 'Mengirim...' : 'Minta Akses lagi'}
            </Button>
          </div>
        )}

        {/* Back link */}
        <Link
          href='/dashboard'
          className='flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors'
        >
          <ArrowLeft size={14} />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
