'use client';

/**
 * QuizResultScreen
 *
 * Visually mirrors ActivityResultScreen but is bound to QuizSubmitResult and
 * contains NO certificate logic (Option A: cert stays on legacy completion
 * rule; quizzes never trigger issueCertificate).
 *
 * Scoring rules — every field is a distinct concept:
 *   • displayPercent  = Math.round(result.score / result.total * 100)
 *                       (result.score is a RAW correct count, not a percent)
 *   • isPassed        = displayPercent === 100
 *                         ? true
 *                         : quiz.passingGrade > 0
 *                           ? result.pointsAwarded >= quiz.passingGrade
 *                           : true
 *                       A perfect score ALWAYS passes — heals quizzes whose
 *                       passingGrade was authored above max obtainable points.
 *                       DO NOT use result.passed — that is the 100%-only flag.
 *   • Per-question correctness — from result.answers[].correct only.
 *                       NO answer-key reveal (keys are stripped by the BE).
 */

import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Frown, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { BADGE_COPY, getBadgeIcon } from '@/components/gamification';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, Quiz, QuizSubmitResult } from '@/types';
import { BADGE_IDS } from '@/types';

// ── Count-up animation hook (mirrors ActivityResultScreen) ────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

interface QuizResultScreenProps {
  result: QuizSubmitResult;
  /** Full quiz object — used for passingGrade and allowRetake metadata. */
  quiz: Quiz;
  courseId: string;
  onRetry: () => void;
}

export const QuizResultScreen = ({
  result,
  quiz,
  courseId,
  onRetry,
}: QuizResultScreenProps) => {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const confettiFiredRef = useRef(false);

  // ── Scoring (server-truthful) ─────────────────────────────────────────────

  /**
   * Display percentage derived from the raw correct-count / total pair.
   * result.score is NOT a percent — it is the count of correct answers.
   */
  const displayPercent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  /**
   * FE pass/fail rule (PRD §14.9 decision 3, amended 2026-06-10 advisor batch).
   * A perfect score always passes regardless of passingGrade — guards against
   * quizzes authored with an impossible points bar (e.g. passingGrade=100 on a
   * 5-point quiz). Otherwise the raw points comparison applies unchanged.
   * result.passed is the 100%-only server flag — do not use it for pass/fail UI.
   */
  const isPassed =
    displayPercent === 100
      ? true
      : quiz.passingGrade && quiz.passingGrade > 0
        ? result.pointsAwarded >= quiz.passingGrade
        : true;

  const frame = isPassed ? 'celebration' : 'retry';

  const goldStarCount =
    displayPercent === 100
      ? 3
      : displayPercent >= 85
        ? 2
        : displayPercent >= 70
          ? 1
          : 0;

  // ── Badges ────────────────────────────────────────────────────────────────

  const awardedBadges = useMemo<Badge[]>(() => {
    const validBadges = new Set<string>(BADGE_IDS);
    return (result.earnedBadges ?? [])
      .map((b) => b.id)
      .filter(
        (id): id is Badge => typeof id === 'string' && validBadges.has(id),
      );
  }, [result.earnedBadges]);

  // ── Animated counters ─────────────────────────────────────────────────────
  const animatedXP = useCountUp(result.pointsAwarded);

  // ── Side-effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (confettiFiredRef.current || frame !== 'celebration') return;
    confettiFiredRef.current = true;
    void confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#10b981', '#f59e0b', '#b0f58b', '#2c7865', '#ffffff'],
    });
  }, [frame]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
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
        {/* ── CELEBRATION FRAME ── */}
        {frame === 'celebration' && (
          <div className='relative overflow-hidden rounded-3xl bg-surface-container-lowest p-8 text-center shadow-[0_8px_0_0_rgba(5,95,77,0.1)]'>
            <div className='pointer-events-none absolute left-0 top-0 h-32 w-full rounded-t-3xl bg-primary-700/5' />

            {/* Stars — graded by displayPercent */}
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
              {displayPercent === 100 ? 'Sempurna!' : 'Kerja Bagus!'}
            </h2>
            <p className='mb-6 text-base text-on-surface-variant'>
              {result.score} dari {result.total} benar ({displayPercent}%)
            </p>

            {/* Hadiah panel */}
            <div className='relative mb-6 w-full rounded-2xl border-2 border-outline-variant bg-surface-container-low p-5'>
              <div className='absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-0.5 text-xs font-bold uppercase tracking-[0.05em] text-on-surface-variant'>
                Hadiah Anda
              </div>

              <div className='mt-1 flex flex-col items-center gap-4'>
                <div className='rounded-xl border border-amber-300 bg-amber-100 px-6 py-2 text-xl font-bold text-amber-ink'>
                  +{animatedXP} XP
                </div>

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
              onClick={() => router.push(`/course/${courseId}`)}
              className='w-full rounded-xl bg-primary-700 py-4 text-sm font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_0_0_#2c7865] transition-all active:translate-y-1 active:shadow-none'
            >
              Selesai
            </button>

            {/* Retry link if allowed */}
            {quiz.allowRetake !== false && (
              <button
                type='button'
                onClick={onRetry}
                className='mt-3 text-sm text-on-surface-variant transition-colors hover:text-on-surface'
              >
                Coba Lagi
              </button>
            )}
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
              {result.score} dari {result.total} benar ({displayPercent}%)
            </p>

            {/* Retry panel */}
            <div className='mb-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-outline-variant/40 bg-surface-container py-8'>
              <Frown className='h-14 w-14 text-outline-variant' />
              {result.pointsAwarded > 0 && (
                <span className='rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-ink'>
                  +{result.pointsAwarded} XP
                </span>
              )}
            </div>

            {/* Retry button — only when allowRetake is not explicitly disabled */}
            {quiz.allowRetake !== false ? (
              <button
                type='button'
                onClick={onRetry}
                className='mb-3 w-full rounded-xl border-2 border-outline-variant bg-surface-container-high py-4 text-sm font-bold uppercase tracking-[0.05em] text-on-surface transition-transform active:translate-y-1'
              >
                Coba Lagi
              </button>
            ) : null}

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
  );
};
