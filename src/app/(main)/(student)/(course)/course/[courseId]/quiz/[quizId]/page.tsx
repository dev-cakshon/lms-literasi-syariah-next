'use client';

import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApiError, getQuiz, getQuizResult, submitQuiz } from '@/lib/api';
import { buildMediaViewUrl } from '@/lib/media';

import { MultipleAnswer } from '@/components/quiz/MultipleAnswer';
import { QuizResultScreen } from '@/components/quiz/QuizResultScreen';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ShortAnswerInput } from '@/components/quiz/ShortAnswerInput';

import type { Quiz, QuizResult, QuizSubmitResult } from '@/types';

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

  // ── Retake gate (allowRetake === false) ────────────────────────────────────
  // Prior-attempt check so a deep link / refresh cannot bypass the Evaluasi
  // list gate. Fails open on fetch error (server does not enforce retakes;
  // blocking a first attempt would be worse than allowing a retake).
  const [priorResult, setPriorResult] = useState<QuizResult | null>(null);
  const [retakeGateChecked, setRetakeGateChecked] = useState(false);

  useEffect(() => {
    if (!quiz || !courseId || !quizId) return;
    if (quiz.allowRetake !== false) {
      setRetakeGateChecked(true);
      return;
    }
    let cancelled = false;
    getQuizResult(courseId, quizId)
      .then((result) => {
        if (!cancelled) setPriorResult(result);
      })
      .catch((err: unknown) => {
        console.error('Failed to check prior quiz result:', err);
      })
      .finally(() => {
        if (!cancelled) setRetakeGateChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [quiz, courseId, quizId]);

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

  function handleExpire() {
    if (isSubmitting || submitResult) return;
    if (!quiz || !courseId || !quizId) return;
    const payload: (number | string)[] = answers.map((slot, i) => {
      if (slot !== null) return typeof slot === 'string' ? slot.trim() : slot;
      return quiz.questions[i]?.type === 'shortAnswer' ? '' : -1;
    });
    setIsSubmitting(true);
    submitQuiz(courseId, quizId, payload)
      .then(setSubmitResult)
      .catch((err) => console.error('Auto-submit on timer expiry failed:', err))
      .finally(() => setIsSubmitting(false));
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (!courseId || !quizId || !quiz || !retakeGateChecked) {
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
  // Checked BEFORE the retake gate: a fresh same-session submission must show
  // its result screen even though the quiz is now "attempted".
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

  // ── Retake gate — blocked screen ───────────────────────────────────────────
  if (quiz.allowRetake === false && priorResult?.attempted) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md rounded-3xl bg-surface-container-lowest p-8 text-center shadow-[0_8px_0_0_rgba(5,95,77,0.1)]'>
          <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50'>
            <CheckCircle2 className='h-9 w-9 text-primary-700' />
          </div>
          <h2 className='mb-1 font-display text-2xl font-bold text-on-surface'>
            Kuis Sudah Dikerjakan
          </h2>
          <p className='mb-6 text-sm text-on-surface-variant'>
            Kuis ini hanya bisa dikerjakan satu kali. Skor terbaik Anda:{' '}
            <strong className='text-on-surface'>
              {priorResult.bestScore}%
            </strong>
          </p>
          <button
            type='button'
            onClick={() => router.push(`/course/${courseId}`)}
            className='w-full rounded-xl bg-primary-700 py-4 text-sm font-bold uppercase tracking-[0.05em] text-white shadow-[0_4px_0_0_#2c7865] transition-all active:translate-y-1 active:shadow-none'
          >
            Kembali ke Kursus
          </button>
        </div>
      </div>
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
      {quiz.timeLimitMinutes && quiz.timeLimitMinutes > 0 && (
        <div className='flex justify-end px-6 pt-4'>
          <QuizTimer
            totalSeconds={quiz.timeLimitMinutes * 60}
            onExpire={handleExpire}
          />
        </div>
      )}

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
          imageUrl={
            question.imageUrl ? buildMediaViewUrl(question.imageUrl) : undefined
          }
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
          imageUrl={
            question.imageUrl ? buildMediaViewUrl(question.imageUrl) : undefined
          }
        />
      )}
    </div>
  );
}
