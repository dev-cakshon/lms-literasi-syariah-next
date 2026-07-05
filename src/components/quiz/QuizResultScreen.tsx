'use client';

/**
 * QuizResultScreen
 *
 * Visually mirrors ActivityResultScreen but is bound to QuizSubmitResult and
 * contains NO certificate logic (Option A: cert stays on legacy completion
 * rule; quizzes never trigger issueCertificate).
 *
 * PRD21 Change 1 — quizzes are pure assessment: the backend no longer awards
 * gamification points/badges on submit (`earnedBadges` is always `[]`), so
 * this screen carries NO "+XP" / badge reward framing anymore.
 *
 * Scoring rules — every field is a distinct concept:
 *   • displayPercent  = Math.round(result.score / result.total * 100)
 *                       (result.score is a RAW correct count, not a percent;
 *                       unchanged by scoringMode — this is the byte-for-byte
 *                       G5-preserved value.)
 *   • penaltyPercent  = a points-based percentage (result.pointsAwarded /
 *                       max obtainable points), shown instead of
 *                       displayPercent only when quiz.scoringMode ===
 *                       'penalty' — because a wrong answer there can cost
 *                       more than the raw correct-count reflects.
 *   • isPassed        = effectivePercent === 100
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
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { useAuth } from '@/contexts/AuthContext';

import type { Quiz, QuizSubmitResult } from '@/types';

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
   * Unchanged regardless of scoringMode (G5 byte-for-byte guarantee).
   */
  const displayPercent =
    result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

  /**
   * PRD21 §6.5 — in penalty mode, a wrong answer can cost more than the raw
   * correct-count implies, so show a points-based percentage instead:
   * result.pointsAwarded (the penalized, floored assessment score) over the
   * max obtainable points for this quiz. Standard mode is untouched — it
   * always uses displayPercent.
   */
  const maxObtainablePoints = quiz.questions.reduce(
    (sum, q) => sum + (q.points ?? 1),
    0,
  );
  const penaltyPercent =
    maxObtainablePoints > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round((result.pointsAwarded / maxObtainablePoints) * 100),
          ),
        )
      : 0;
  const effectivePercent =
    quiz.scoringMode === 'penalty' ? penaltyPercent : displayPercent;

  /**
   * FE pass/fail rule (PRD §14.9 decision 3, amended 2026-06-10 advisor batch).
   * A perfect score always passes regardless of passingGrade — guards against
   * quizzes authored with an impossible points bar (e.g. passingGrade=100 on a
   * 5-point quiz). Otherwise the raw points comparison applies unchanged.
   * result.passed is the 100%-only server flag — do not use it for pass/fail UI.
   */
  const isPassed =
    effectivePercent === 100
      ? true
      : quiz.passingGrade && quiz.passingGrade > 0
        ? result.pointsAwarded >= quiz.passingGrade
        : true;

  const frame = isPassed ? 'celebration' : 'retry';

  const goldStarCount =
    effectivePercent === 100
      ? 3
      : effectivePercent >= 85
        ? 2
        : effectivePercent >= 70
          ? 1
          : 0;

  // ── Side-effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    void refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

            {/* Stars — graded by effectivePercent (points-based in penalty mode) */}
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
              {effectivePercent === 100 ? 'Sempurna!' : 'Kerja Bagus!'}
            </h2>
            <p
              className={cn(
                'text-base text-on-surface-variant',
                quiz.scoringMode === 'penalty' ? 'mb-1' : 'mb-6',
              )}
            >
              {result.score} dari {result.total} benar ({effectivePercent}%)
            </p>
            {quiz.scoringMode === 'penalty' && (
              <p className='mb-6 text-sm text-on-surface-variant'>
                Skor poin: {result.pointsAwarded} / {maxObtainablePoints}
              </p>
            )}

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
            <p
              className={cn(
                'text-base text-on-surface-variant',
                quiz.scoringMode === 'penalty' ? 'mb-1' : 'mb-6',
              )}
            >
              {result.score} dari {result.total} benar ({effectivePercent}%)
            </p>
            {quiz.scoringMode === 'penalty' && (
              <p className='mb-6 text-sm text-on-surface-variant'>
                Skor poin: {result.pointsAwarded} / {maxObtainablePoints}
              </p>
            )}

            {/* Retry panel */}
            <div className='mb-6 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-outline-variant/40 bg-surface-container py-8'>
              <Frown className='h-14 w-14 text-outline-variant' />
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
