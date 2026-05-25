'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';
import { getNeighborPaths } from '@/lib/courseUtils';
import { cn } from '@/lib/utils';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';
import { CourseActionBar } from '@/components/course/CourseActionBar';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type {
  StudentActivity,
  StudentTrueOrFalseActivity,
  SubmitActivityResponse,
} from '@/types';

type Params = Promise<{ courseId: string; activityId: string }>;

function getStatementKey(statementId: string, index: number): string {
  const normalized = statementId.trim();
  return normalized.length > 0 ? normalized : `__statement_${index}`;
}

export default function TrueOrFalseActivityPage({
  params,
}: {
  params: Params;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [activity, setActivity] = useState<StudentTrueOrFalseActivity | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<SubmitActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { contentItems, refreshContentItems, setChatFabHidden } =
    useContext(CourseLayoutContext);

  useEffect(() => {
    setChatFabHidden(true);
    return () => setChatFabHidden(false);
  }, [setChatFabHidden]);

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setActivityId(p.activityId);
    });
  }, [params]);

  useEffect(() => {
    if (!courseId || !activityId) return;
    const resolvedCourseId = courseId;
    const resolvedActivityId = activityId;

    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const data = (await getStudentActivity(
          resolvedCourseId,
          resolvedActivityId,
        )) as StudentActivity;

        if (data.type !== 'true_or_false') {
          setError('Aktivitas tidak sesuai dengan halaman ini.');
          setActivity(null);
          return;
        }

        setActivity(data as StudentTrueOrFalseActivity);
      } catch (err) {
        console.error('Failed to load true-or-false activity:', err);
        setError('Gagal memuat aktivitas.');
        setActivity(null);
      } finally {
        setLoading(false);
      }
    }

    void fetchActivity();
  }, [courseId, activityId]);

  const answeredCount = Object.keys(answers).length;
  const total = activity?.statements.length ?? 0;

  const isAllAnswered = useMemo(() => {
    if (!activity) return false;
    return activity.statements.every((statement, index) => {
      const answerKey = getStatementKey(statement.id, index);
      return answers[answerKey] !== undefined;
    });
  }, [activity, answers]);

  const setStatementAnswer = (statementId: string, value: boolean) => {
    if (answers[statementId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [statementId]: value }));
  };

  const onSubmit = async () => {
    if (!courseId || !activityId || !activity) return;
    setSubmitting(true);
    setError(null);
    try {
      const submitResult = await submitActivity(courseId, activityId, {
        answers,
      });
      setResult(submitResult);
      refreshContentItems();
    } catch (err) {
      console.error('Failed to submit true-or-false activity:', err);
      setError('Gagal mengirim jawaban.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-on-surface-variant'>Memuat aktivitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-error'>{error}</p>
      </div>
    );
  }

  if (!courseId || !activityId || !activity) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-on-surface-variant'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    const nextPath = getNeighborPaths(contentItems, activityId, courseId).next;
    return (
      <ActivityResultScreen
        result={result}
        courseId={courseId}
        nextPath={nextPath}
        onRetry={() => {
          setResult(null);
          setAnswers({});
        }}
      />
    );
  }

  const neighbors = getNeighborPaths(contentItems, activityId, courseId);
  const prevPath = neighbors.prev;

  const nextState = submitting
    ? 'loading'
    : isAllAnswered
      ? 'enabled'
      : 'disabled';

  return (
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 pb-8 space-y-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-2'
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs font-bold uppercase tracking-[0.05em] text-primary-700 mb-1'>
              Aktivitas · Benar / Salah
            </p>
            <h1 className='font-display text-on-surface text-2xl md:text-[32px] font-semibold leading-tight'>
              {activity.title}
            </h1>
          </div>
          <div className='shrink-0 bg-amber-50 text-amber-700 text-xs font-bold tracking-[0.05em] px-3 py-1 rounded-full inline-flex items-center gap-1 border border-amber-300 shadow-[0_2px_0_0_var(--color-amber-300)]'>
            <Zap className='w-3 h-3' />
            Hingga {activity.maxPoints} XP
          </div>
        </div>
      </motion.div>

      {/* Instruction row */}
      <div className='bg-surface-container-low rounded-2xl border-2 border-outline-variant shadow-[0_2px_0_0_#bec9c4] p-4 flex items-center justify-between gap-4'>
        <p className='text-sm text-on-surface-variant'>
          🤔 Baca tiap pernyataan, lalu tandai Benar atau Salah.
        </p>
        <span className='shrink-0 bg-surface border border-outline-variant text-on-surface-variant text-xs font-bold uppercase tracking-[0.05em] px-3 py-1 rounded-full'>
          {answeredCount}/{total} DIJAWAB
        </span>
      </div>

      {/* Completion banner */}
      {isAllAnswered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='bg-secondary-container border-2 border-[#95d872] text-on-secondary-container rounded-2xl shadow-[0_4px_0_0_#95d872] px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold'
        >
          <Sparkles className='w-5 h-5' />
          Semua pernyataan sudah dijawab!
        </motion.div>
      )}

      {/* Statement cards */}
      <div className='space-y-4'>
        {activity.statements.map((statement, index) => {
          const answerKey = getStatementKey(statement.id, index);
          const isLocked = answers[answerKey] !== undefined;
          const chosen = answers[answerKey];

          return (
            <div
              key={answerKey}
              className={cn(
                'rounded-2xl border-2 p-6 transition-colors',
                isLocked
                  ? 'bg-surface-container-low border-outline-variant shadow-[0_2px_0_0_#bec9c4]'
                  : 'bg-surface-container-lowest border-outline-variant shadow-[0_4px_0_0_#bec9c4]',
              )}
            >
              <p className='text-on-surface font-medium text-base md:text-[18px] leading-relaxed mb-4'>
                {statement.text}
              </p>
              <div className='grid grid-cols-2 gap-3'>
                <button
                  type='button'
                  onClick={() => setStatementAnswer(answerKey, true)}
                  disabled={isLocked}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.05em] transition-colors',
                    !isLocked &&
                      'bg-surface-container-low text-on-surface-variant border-2 border-outline-variant shadow-[0_2px_0_0_#bec9c4]',
                    isLocked &&
                      chosen === true &&
                      'bg-[#2f8132] text-white border-2 border-[#2f8132] shadow-[0_2px_0_0_#256627]',
                    isLocked &&
                      chosen !== true &&
                      'bg-surface-container-high text-on-surface-variant border-2 border-outline-variant opacity-35 cursor-not-allowed',
                  )}
                >
                  Benar
                </button>
                <button
                  type='button'
                  onClick={() => setStatementAnswer(answerKey, false)}
                  disabled={isLocked}
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-[0.05em] transition-colors',
                    !isLocked &&
                      'bg-surface-container-low text-on-surface-variant border-2 border-outline-variant shadow-[0_2px_0_0_#bec9c4]',
                    isLocked &&
                      chosen === false &&
                      'bg-danger text-white border-2 border-danger shadow-[0_2px_0_0_#9c3024]',
                    isLocked &&
                      chosen !== false &&
                      'bg-surface-container-high text-on-surface-variant border-2 border-outline-variant opacity-35 cursor-not-allowed',
                  )}
                >
                  Salah
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CourseActionBar
        prev={prevPath ? { onClick: () => router.push(prevPath) } : null}
        next={{
          state: nextState,
          label: submitting
            ? 'Mengirim...'
            : isAllAnswered
              ? 'Kirim Jawaban'
              : undefined,
          onClick:
            isAllAnswered && !submitting ? () => void onSubmit() : undefined,
          tooltipText: isAllAnswered
            ? undefined
            : 'Jawab semua pertanyaan untuk lanjut',
        }}
      />
    </div>
  );
}
