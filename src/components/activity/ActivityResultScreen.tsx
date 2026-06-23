'use client';

import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Award, Frown, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ApiError, issueCertificate } from '@/lib/api';
import { cn } from '@/lib/utils';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { BADGE_COPY, getBadgeIcon } from '@/components/gamification';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, Certificate, SubmitActivityResponse } from '@/types';
import { BADGE_IDS } from '@/types';

function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

interface ActivityResultScreenProps {
  result: SubmitActivityResponse;
  courseId: string;
  nextPath: string | null;
  onRetry: () => void;
}

export const ActivityResultScreen = ({
  result,
  courseId,
  nextPath,
  onRetry,
}: ActivityResultScreenProps) => {
  const router = useRouter();
  const { refreshProfile, userProfile } = useAuth();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const confettiFiredRef = useRef(false);

  const isPerfect = result.score === result.totalItems;
  const passed = result.scorePercent >= 70;

  const frame = certificate
    ? 'course-complete'
    : passed
      ? 'celebration'
      : 'retry';

  const goldStarCount =
    result.scorePercent === 100
      ? 3
      : result.scorePercent >= 85
        ? 2
        : result.scorePercent >= 70
          ? 1
          : 0;

  const awardedBadges = useMemo<Badge[]>(() => {
    const validBadges = new Set<string>(BADGE_IDS);
    return (result.earnedBadges ?? [])
      .map((b) => b.id)
      .filter(
        (id): id is Badge => typeof id === 'string' && validBadges.has(id),
      );
  }, [result.earnedBadges]);

  const animatedXP = useCountUp(result.pointsEarned);
  const animatedTotalXP = useCountUp(userProfile?.totalPoints ?? 0);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!isPerfect) return;
    issueCertificate(courseId)
      .then((cert) => {
        setCertificate(cert);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === 'CERTIFICATE_NOT_ELIGIBLE')
          return;
        console.error('Certificate issuance failed:', err);
      });
  }, [isPerfect, courseId]);

  useEffect(() => {
    if (confettiFiredRef.current) return;
    if (frame === 'celebration' || frame === 'course-complete') {
      confettiFiredRef.current = true;
      void confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#10b981', '#f59e0b', '#b0f58b', '#2c7865', '#ffffff'],
      });
    }
  }, [frame]);

  return (
    <>
      {showCertModal && certificate && (
        <CourseCertificateModal
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}

      <div
        className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8'
        style={{
          backgroundImage:
            'radial-gradient(circle, #e7e9e4 2px, transparent 2px)',
          backgroundSize: '24px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='w-full max-w-md'
        >
          {/* ── COURSE-COMPLETE FRAME ── */}
          {frame === 'course-complete' && (
            <div className='overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_8px_0_0_rgba(5,95,77,0.1)]'>
              {/* Cert-stripes header */}
              <div
                className='relative p-8 text-center'
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #b0f58b, #b0f58b 10px, #95d872 10px, #95d872 20px)',
                }}
              >
                <div className='absolute inset-0 bg-white/20' />
                <Award
                  fill='currentColor'
                  className='relative z-10 mx-auto mb-3 h-14 w-14'
                  style={{ color: '#1d5200' }}
                />
                <h2
                  className='relative z-10 font-display text-3xl font-bold'
                  style={{ color: '#1d5200' }}
                >
                  Luar Biasa!
                </h2>
                <p
                  className='relative z-10 mt-1 text-sm font-semibold'
                  style={{ color: '#367218' }}
                >
                  Materi Selesai
                </p>
              </div>

              <div className='flex flex-col items-center gap-5 p-8'>
                {/* Stars — always 3 gold */}
                <div className='flex items-center justify-center gap-1'>
                  {[0, 1, 2].map((i) => (
                    <Star
                      key={i}
                      fill='currentColor'
                      className={cn(
                        i === 1 ? '-mt-4 h-12 w-12' : 'h-8 w-8',
                        'text-amber-500',
                      )}
                    />
                  ))}
                </div>

                {/* Cumulative XP chip */}
                <div className='rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-sm font-bold text-amber-ink'>
                  Total XP: {animatedTotalXP}
                </div>

                {/* Primary button */}
                <button
                  type='button'
                  onClick={() => setShowCertModal(true)}
                  className='w-full rounded-xl bg-primary-700 py-4 text-sm font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_0_0_#2c7865] transition-all active:translate-y-1 active:shadow-none'
                >
                  Lihat Sertifikat
                </button>

                {/* Quiet escape */}
                <button
                  type='button'
                  onClick={() => router.push(`/course/${courseId}`)}
                  className='text-sm text-on-surface-variant transition-colors hover:text-on-surface'
                >
                  Kembali ke Kursus
                </button>
              </div>
            </div>
          )}

          {/* ── CELEBRATION FRAME ── */}
          {frame === 'celebration' && (
            <div className='relative overflow-hidden rounded-3xl bg-surface-container-lowest p-8 text-center shadow-[0_8px_0_0_rgba(5,95,77,0.1)]'>
              {/* Subtle top tint */}
              <div className='pointer-events-none absolute left-0 top-0 h-32 w-full rounded-t-3xl bg-primary-700/5' />

              {/* Stars — graded */}
              <div className='mb-5 flex items-center justify-center gap-1'>
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    fill={i < goldStarCount ? 'currentColor' : 'none'}
                    className={cn(
                      i === 1 ? '-mt-4 h-12 w-12' : 'h-8 w-8',
                      i < goldStarCount
                        ? 'text-amber-500'
                        : 'text-outline-variant',
                    )}
                  />
                ))}
              </div>

              {/* Headline */}
              <h2 className='mb-1 font-display text-3xl font-bold text-primary-700'>
                {result.scorePercent === 100 ? 'Sempurna!' : 'Kerja Bagus!'}
              </h2>
              <p className='mb-6 text-base text-on-surface-variant'>
                {result.score} dari {result.totalItems} benar
              </p>

              {/* Hadiah Anda panel */}
              <div className='relative mb-6 w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low p-5'>
                <div className='absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-0.5 text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant'>
                  Hadiah Anda
                </div>

                <div className='mt-1 flex flex-col items-center gap-4'>
                  {/* XP badge */}
                  <div className='rounded-xl border border-amber-300 bg-amber-100 px-6 py-2 text-xl font-bold text-amber-ink'>
                    +{animatedXP} XP
                  </div>

                  {/* Inline earned badges */}
                  {awardedBadges.length > 0 && (
                    <div className='flex flex-wrap justify-center gap-4'>
                      {awardedBadges.map((badge) => (
                        <div
                          key={badge}
                          className='flex flex-col items-center gap-1'
                        >
                          <div className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-700 bg-primary-100'>
                            {getBadgeIcon(badge)}
                          </div>
                          <span className='max-w-[72px] text-center text-xs font-bold text-on-surface-variant'>
                            {BADGE_COPY[badge].labelId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary button */}
              <button
                type='button'
                onClick={() => router.push(nextPath ?? `/course/${courseId}`)}
                className='w-full rounded-xl bg-primary-700 py-4 text-sm font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_0_0_#2c7865] transition-all active:translate-y-1 active:shadow-none'
              >
                {nextPath ? 'Lanjut' : 'Selesai'}
              </button>
            </div>
          )}

          {/* ── RETRY FRAME ── */}
          {frame === 'retry' && (
            <div className='rounded-3xl bg-surface-container-lowest p-8 text-center opacity-90 shadow-[0_8px_0_0_rgba(5,95,77,0.1)]'>
              {/* Stars — all grey */}
              <div className='mb-5 flex items-center justify-center gap-1'>
                {[0, 1, 2].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      i === 1 ? '-mt-4 h-12 w-12' : 'h-8 w-8',
                      'text-outline-variant',
                    )}
                  />
                ))}
              </div>

              {/* Headline */}
              <h2 className='mb-1 font-display text-3xl font-bold text-on-surface'>
                Coba Sekali Lagi
              </h2>
              <p className='mb-6 text-base text-on-surface-variant'>
                {result.score} dari {result.totalItems} benar
              </p>

              {/* Retry panel */}
              <div className='mb-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-outline-variant/40 bg-surface-container py-8'>
                <Frown className='h-14 w-14 text-outline-variant' />
                {result.pointsEarned > 0 && (
                  <span className='rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-ink'>
                    +{result.pointsEarned} XP
                  </span>
                )}
              </div>

              {/* Primary button */}
              <button
                type='button'
                onClick={onRetry}
                className='mb-3 w-full rounded-xl border-2 border-outline-variant bg-surface-container-high py-4 text-sm font-bold uppercase tracking-[0.05em] text-on-surface transition-transform active:translate-y-1'
              >
                Coba Lagi
              </button>

              {/* Quiet escape */}
              <button
                type='button'
                onClick={() => router.push(`/course/${courseId}`)}
                className='text-sm text-on-surface-variant transition-colors hover:text-on-surface'
              >
                Kembali ke Kursus
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};
