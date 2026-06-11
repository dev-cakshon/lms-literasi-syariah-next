'use client';

import { CheckCircle2, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getQuizResult } from '@/lib/api';

import type { Quiz, QuizResult } from '@/types';

interface CourseQuizListProps {
  quizzes: Quiz[];
  courseId: string;
}

/**
 * Renders the "Evaluasi" section on the student course landing page.
 *
 * Retake gate: for quizzes with allowRetake === false, the prior-attempt
 * summary is fetched from GET /quizzes/:quizId/result. An already-attempted
 * no-retake quiz shows a "Sudah Dikerjakan" state (with best score) instead
 * of the "Mulai" CTA. The taking page enforces the same gate on deep links.
 */
export default function CourseQuizList({
  quizzes,
  courseId,
}: CourseQuizListProps) {
  /**
   * Per-quiz prior-result map for no-retake quizzes only.
   * undefined = still checking · null = check failed (fail open to "Mulai" —
   * the taking page is the second gate) · QuizResult = check succeeded.
   */
  const [results, setResults] = useState<Record<string, QuizResult | null>>({});

  useEffect(() => {
    let cancelled = false;
    for (const quiz of quizzes) {
      if (quiz.allowRetake !== false) continue;
      getQuizResult(courseId, quiz.id)
        .then((result) => {
          if (!cancelled) {
            setResults((prev) => ({ ...prev, [quiz.id]: result }));
          }
        })
        .catch((err: unknown) => {
          console.error('Failed to check prior quiz result:', err);
          if (!cancelled) {
            setResults((prev) => ({ ...prev, [quiz.id]: null }));
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [quizzes, courseId]);

  if (quizzes.length === 0) return null;

  return (
    <section className='flex flex-col gap-5'>
      {/* Section header */}
      <div className='flex items-center justify-between'>
        <h2 className='font-display text-2xl font-bold text-on-surface'>
          Evaluasi
        </h2>
        <span className='bg-surface-container-high text-on-surface-soft rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider'>
          {quizzes.length} Kuis
        </span>
      </div>

      {/* Quiz rows */}
      <div className='flex flex-col gap-4'>
        {quizzes.map((quiz) => {
          const gated = quiz.allowRetake === false;
          const result = results[quiz.id];
          const isChecking = gated && result === undefined;
          const isDone = gated && result != null && result.attempted;

          return (
            <div
              key={quiz.id}
              className='flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-sm'
            >
              {/* Left: icon + title + metadata */}
              <div className='flex items-center gap-4 min-w-0'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50'>
                  <ClipboardList className='h-5 w-5 text-primary-700' />
                </div>
                <div className='min-w-0'>
                  <p className='truncate font-semibold text-on-surface'>
                    {quiz.title}
                  </p>
                  <p className='text-xs text-on-surface-variant'>
                    {quiz.questions.length} pertanyaan
                    {quiz.passingGrade && quiz.passingGrade > 0
                      ? ` · lulus ≥ ${quiz.passingGrade} poin`
                      : ''}
                    {isDone ? ` · skor terbaik ${result.bestScore}%` : ''}
                  </p>
                </div>
              </div>

              {/* Right: CTA — done state, checking placeholder, or take link */}
              {isDone ? (
                <span className='ml-4 flex shrink-0 items-center gap-1.5 rounded-xl bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface-variant'>
                  <CheckCircle2 className='h-4 w-4 text-primary-700' />
                  Sudah Dikerjakan
                </span>
              ) : isChecking ? (
                <span className='ml-4 shrink-0 animate-pulse rounded-xl bg-surface-container-high px-4 py-2 text-sm font-bold text-transparent'>
                  Mulai
                </span>
              ) : (
                <Link
                  href={`/course/${courseId}/quiz/${quiz.id}`}
                  className='ml-4 shrink-0 rounded-xl bg-primary-700 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_0_#2c7865] transition-all active:translate-y-px active:shadow-none'
                >
                  Mulai
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
