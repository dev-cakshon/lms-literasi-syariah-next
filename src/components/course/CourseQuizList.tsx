'use client';

import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

import type { Quiz } from '@/types';

interface CourseQuizListProps {
  quizzes: Quiz[];
  courseId: string;
}

/**
 * Renders the "Evaluasi" section on the student course landing page.
 *
 * No completion/lock state is shown here — the pilot has no endpoint for
 * reading prior quiz results, so every quiz row just offers "Mulai".
 */
export default function CourseQuizList({
  quizzes,
  courseId,
}: CourseQuizListProps) {
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
        {quizzes.map((quiz) => (
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
                </p>
              </div>
            </div>

            {/* Right: CTA */}
            <Link
              href={`/course/${courseId}/quiz/${quiz.id}`}
              className='ml-4 shrink-0 rounded-xl bg-primary-700 px-4 py-2 text-sm font-bold text-white shadow-[0_3px_0_0_#2c7865] transition-all active:translate-y-px active:shadow-none'
            >
              Mulai
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
