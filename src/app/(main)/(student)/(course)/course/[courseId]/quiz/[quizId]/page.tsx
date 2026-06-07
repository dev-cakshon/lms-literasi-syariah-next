'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiError, getQuiz, submitQuiz } from '@/lib/api';

import { MultipleAnswer } from '@/components/quiz/MultipleAnswer';
import { QuizResultScreen } from '@/components/quiz/QuizResultScreen';
import { ShortAnswerInput } from '@/components/quiz/ShortAnswerInput';

import type { Quiz, QuizSubmitResult } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizPageProps {
  params: Promise<{ courseId: string; quizId: string }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalize the question prompt.
 *
 * ★ The live backend stores questions as `questionText` (not renamed to
 * `question` for the student GET), so prefer `questionText` when present.
 */
function getPrompt(q: Quiz['questions'][number]): string {
  return q.questionText ?? q.question ?? '';
}

/**
 * Determine whether an answer slot is considered "filled" for submit-gating.
 * - MC:  any number (selected index)
 * - SA:  non-empty trimmed string
 */
function isAnswered(slot: number | string | null): boolean {
  if (slot === null) return false;
  if (typeof slot === 'number') return true;
  return slot.trim().length > 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();

  // Unwrap async params (Next.js 15 App Router)
  const [courseId, setCourseId] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setQuizId(p.quizId);
    });
  }, [params]);

  // ── Fetch state ────────────────────────────────────────────────────────────
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId || !quizId) return;
    getQuiz(courseId, quizId)
      .then(setQuiz)
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 404) {
          setLoadError('Kuis tidak ditemukan.');
        } else {
          setLoadError('Gagal memuat kuis. Silakan coba lagi.');
          console.error('Failed to load quiz:', err);
        }
      });
  }, [courseId, quizId]);

  // ── Answer + stepper state ─────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<QuizSubmitResult | null>(
    null,
  );

  // Initialise answers array when quiz loads
  useEffect(() => {
    if (quiz) {
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleAnswer(value: number | string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[stepIndex] = value;
      return next;
    });
  }

  function handleNext() {
    if (!quiz) return;
    setStepIndex((i) => Math.min(i + 1, quiz.questions.length - 1));
  }

  function handlePrevious() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    if (!quiz || !courseId || !quizId) return;

    // Guard: all questions must be answered before submit
    if (!answers.every(isAnswered)) return;

    // Trim short-answer slots before sending so extra whitespace doesn't
    // cause a correct answer to grade as wrong on an exact-match backend.
    const payload: (number | string)[] = answers.map((slot) =>
      typeof slot === 'string' ? slot.trim() : (slot as number),
    );

    setIsSubmitting(true);
    try {
      const result = await submitQuiz(courseId, quizId, payload);
      setSubmitResult(result);
    } catch (err) {
      console.error('Quiz submit failed:', err);
      // Surface error to user without losing their answers
      alert('Gagal mengirim jawaban. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Reset taking state for a retry attempt. */
  function handleRetry() {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(null));
    setStepIndex(0);
    setSubmitResult(null);
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (!courseId || !quizId || !quiz) {
    if (loadError) {
      return (
        <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4'>
          <div className='text-center'>
            <p className='mb-4 text-on-surface-variant'>{loadError}</p>
            <button
              type='button'
              onClick={() => router.push(`/course/${courseId ?? ''}`)}
              className='text-sm text-primary-700 underline'
            >
              Kembali ke Kursus
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kuis...</p>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (submitResult) {
    return (
      <QuizResultScreen
        result={submitResult}
        quiz={quiz}
        courseId={courseId}
        onRetry={handleRetry}
      />
    );
  }

  // ── Taking flow ────────────────────────────────────────────────────────────
  const question = quiz.questions[stepIndex];
  const answeredCount = answers.filter(isAnswered).length;
  const isLastQuestion = stepIndex === quiz.questions.length - 1;
  const allAnswered = answers.every(isAnswered);

  // Adapt shared QuizQuestion to MultipleAnswer's local Question shape
  const mcQuestion = {
    id: stepIndex,
    question: getPrompt(question),
    options: question.options ?? [],
    correctAnswer: 0, // stripped by BE; placeholder required by the type
    points: question.points ?? 1,
  };

  const currentMcAnswer =
    typeof answers[stepIndex] === 'number'
      ? (answers[stepIndex] as number)
      : -1;
  const currentSaAnswer =
    typeof answers[stepIndex] === 'string'
      ? (answers[stepIndex] as string)
      : '';

  return (
    <div className='mx-auto w-full max-w-4xl'>
      {/* All-answered gate hint */}
      {isLastQuestion && !allAnswered && (
        <div className='mx-6 mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700'>
          Jawab semua pertanyaan dulu sebelum mengirim.
        </div>
      )}

      {question.type === 'shortAnswer' ? (
        <ShortAnswerInput
          questionText={getPrompt(question)}
          currentQuestion={stepIndex}
          totalQuestions={quiz.questions.length}
          value={currentSaAnswer}
          onChangeValue={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          isLastQuestion={isLastQuestion}
          answeredCount={answeredCount}
          isSubmitting={isSubmitting}
          submitDisabled={!allAnswered}
        />
      ) : (
        /* Default: multipleChoice (also handles undefined type gracefully) */
        <MultipleAnswer
          question={mcQuestion}
          currentQuestion={stepIndex}
          totalQuestions={quiz.questions.length}
          selectedAnswer={currentMcAnswer}
          onSelectAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
          isLastQuestion={isLastQuestion}
          answeredCount={answeredCount}
          isSubmitting={isSubmitting}
          submitDisabled={!allAnswered}
        />
      )}
    </div>
  );
}
