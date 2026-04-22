'use client';

import { Loader2 } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';

import { getStudentActivity, submitActivity } from '@/lib/api';

import { ActivityResultScreen } from '@/components/activity/ActivityResultScreen';
import { Button } from '@/components/ui/button';

import { CourseLayoutContext } from '@/app/(course)/course/[courseId]/CourseLayoutContext';

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
  const { refreshContentItems } = useContext(CourseLayoutContext);

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

  const isAllAnswered = useMemo(() => {
    if (!activity) return false;
    return activity.statements.every((statement, index) => {
      const answerKey = getStatementKey(statement.id, index);
      return answers[answerKey] !== undefined;
    });
  }, [activity, answers]);

  const setStatementAnswer = (statementId: string, value: boolean) => {
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

  return (
    <div className='mx-auto w-full max-w-4xl p-4 md:p-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold text-slate-900'>
          {activity.title}
        </h1>
        <p className='text-sm text-slate-600 mt-1'>
          Pilih benar atau salah untuk setiap pernyataan.
        </p>
      </div>

      <div className='rounded-lg border bg-white p-4 md:p-6 space-y-4'>
        {activity.statements.map((statement, index) => {
          const answerKey = getStatementKey(statement.id, index);

          return (
            <div key={answerKey} className='rounded-md border p-3 space-y-2'>
              <p className='text-sm font-medium text-slate-800'>
                {statement.text}
              </p>
              <div className='flex gap-2'>
                <Button
                  variant={answers[answerKey] === true ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatementAnswer(answerKey, true)}
                  className={
                    answers[answerKey] === true
                      ? 'border-green-600 bg-green-600 hover:bg-green-700 text-white'
                      : 'text-slate-700 border-slate-300 hover:bg-slate-50'
                  }
                >
                  Benar
                </Button>
                <Button
                  variant={answers[answerKey] === false ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setStatementAnswer(answerKey, false)}
                  className={
                    answers[answerKey] === false
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

      <div className='flex justify-end'>
        <Button onClick={onSubmit} disabled={!isAllAnswered || submitting}>
          {submitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          <span>Kirim Jawaban</span>
        </Button>
      </div>
    </div>
  );
}
