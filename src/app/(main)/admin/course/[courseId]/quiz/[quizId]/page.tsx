'use client';

import { useParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useState } from 'react';

import { ApiError, getQuiz } from '@/lib/api';

import { QuizEditForm } from '@/components/course/admin/QuizEditForm';

// ⚠️  Import depth: quiz/[quizId]/page.tsx is 2 hops from [courseId]/
// → '../../AdminCourseLayoutContext'  (NOT '../../../' like the true-or-false sibling)
import { AdminCourseLayoutContext } from '../../AdminCourseLayoutContext';

import type { Quiz } from '@/types';

// ─── Inner component (needs Suspense wrapper for useParams) ───────────────────

function QuizEditContent() {
  const { courseId, quizId } = useParams<{
    courseId: string;
    quizId: string;
  }>();
  const { refreshContentItems } = useContext(AdminCourseLayoutContext);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !quizId) return;

    // Admin GET returns full quiz including correctAnswerIndex / correctAnswerText
    getQuiz(courseId, quizId)
      .then(setQuiz)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setLoadError('Kuis tidak ditemukan.');
        } else {
          setLoadError('Gagal memuat kuis. Silakan coba lagi.');
          console.error('[AdminQuizEditPage] load error', err);
        }
      });
  }, [courseId, quizId]);

  if (loadError) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <p className='text-sm text-slate-500'>{loadError}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className='flex min-h-64 items-center justify-center'>
        <p className='text-sm text-slate-400'>Memuat kuis...</p>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl p-6 space-y-6'>
      <div>
        <h1 className='text-xl font-bold text-slate-900'>{quiz.title}</h1>
        <p className='mt-1 text-xs text-slate-500'>
          {quiz.type === 'preTest'
            ? 'Pre-Test'
            : quiz.type === 'postTest'
              ? 'Post-Test'
              : 'Kuis Standar'}
        </p>
      </div>

      <QuizEditForm
        courseId={courseId}
        quiz={quiz}
        onQuizSaved={(updated) => {
          setQuiz(updated);
          // contentItems excludes quizzes so this is a no-op for sidebar,
          // but calling it keeps the context fresh in case future code relies on it.
          void refreshContentItems();
        }}
      />
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function AdminQuizEditPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-64 items-center justify-center'>
          <p className='text-sm text-slate-400'>Memuat...</p>
        </div>
      }
    >
      <QuizEditContent />
    </Suspense>
  );
}
