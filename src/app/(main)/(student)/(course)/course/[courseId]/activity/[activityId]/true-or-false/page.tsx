'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';
import { getNeighborPaths } from '@/lib/courseUtils';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';
import { CourseActionBar } from '@/components/course/CourseActionBar';
import { Button } from '@/components/ui/button';

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
  const { contentItems, refreshContentItems } = useContext(CourseLayoutContext);

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
        <p className='text-muted-foreground'>Memuat aktivitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  if (!courseId || !activityId || !activity) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Aktivitas tidak ditemukan.</p>
      </div>
    );
  }

  if (result) {
    return (
      <ActivityResultScreen
        result={result}
        courseId={courseId}
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
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 space-y-6'>
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative overflow-hidden rounded-2xl px-5 py-5'
        style={{
          background: 'linear-gradient(160deg, #174339 0%, #1e5548 100%)',
        }}
      >
        <div
          aria-hidden
          className='absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.08)' }}
        />
        <div
          aria-hidden
          className='absolute -bottom-8 -left-4 w-20 h-20 rounded-full pointer-events-none'
          style={{ background: 'rgba(144,210,109,0.08)' }}
        />

        <div className='relative z-10 flex items-start gap-3'>
          <span className='rounded-xl bg-white/10 p-2 text-2xl leading-none select-none'>
            ✅
          </span>
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-bold uppercase tracking-wide text-white/60 mb-0.5'>
              True/False · {answeredCount}/{total} dijawab
            </p>
            <h1 className='font-bold text-white text-xl leading-snug mb-2'>
              {activity.title}
            </h1>
            <div
              className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold'
              style={{
                background: 'rgba(144,210,109,0.2)',
                border: '1px solid rgba(144,210,109,0.35)',
                color: '#d9edbf',
              }}
            >
              ⚡ Hingga {activity.maxPoints} XP
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statement cards */}
      <div className='rounded-lg border bg-white p-4 md:p-6 space-y-4'>
        {activity.statements.map((statement, index) => {
          const answerKey = getStatementKey(statement.id, index);
          const isLocked = answers[answerKey] !== undefined;
          const chosen = answers[answerKey];

          return (
            <div
              key={answerKey}
              className={`rounded-md border p-3 space-y-2 transition-colors ${
                isLocked ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <p className='text-sm font-medium text-slate-800'>
                {statement.text}
              </p>
              <div className='flex gap-2'>
                <Button
                  variant={chosen === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatementAnswer(answerKey, true)}
                  disabled={isLocked}
                  className={
                    chosen === true
                      ? 'border-green-600 bg-green-600 hover:bg-green-700 text-white'
                      : 'text-slate-700 border-slate-300 hover:bg-slate-50'
                  }
                >
                  Benar
                </Button>
                <Button
                  variant={chosen === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatementAnswer(answerKey, false)}
                  disabled={isLocked}
                  className={
                    chosen === false
                      ? 'border-red-600 bg-red-600 hover:bg-red-700 text-white'
                      : 'text-slate-700 border-slate-300 hover:bg-slate-50'
                  }
                >
                  Salah
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <CourseActionBar
        prev={prevPath ? { onClick: () => router.push(prevPath) } : null}
        next={{
          state: nextState,
          label: submitting ? 'Mengirim...' : 'Kirim Jawaban',
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
