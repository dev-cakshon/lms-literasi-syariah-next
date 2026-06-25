'use client';

import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, updateQuiz } from '@/lib/api';
import { cn } from '@/lib/utils';

import {
  emptyMcQuestion,
  emptyShortAnswerQuestion,
  maxObtainablePoints,
  validateQuiz,
} from '@/components/course/admin/quiz-edit/quizEditHelpers';
import { QuizMetaSection } from '@/components/course/admin/quiz-edit/QuizMetaSection';
import { QuizQuestionCard } from '@/components/course/admin/quiz-edit/QuizQuestionCard';
import { QuizXmlImport } from '@/components/course/admin/quiz-edit/QuizXmlImport';
import { Button } from '@/components/ui/button';

import type { Quiz } from '@/types';

// ─── Component ────────────────────────────────────────────────────────────────

interface QuizEditFormProps {
  courseId: string;
  quiz: Quiz;
  onQuizSaved: (updated: Quiz) => void;
}

export const QuizEditForm = ({
  courseId,
  quiz,
  onQuizSaved,
}: QuizEditFormProps) => {
  const [form, setForm] = useState<Quiz>(quiz);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // B2: Resync when parent passes an updated quiz (e.g. after redirect or refresh)
  useEffect(() => {
    setForm(quiz);
    setSaved(false);
    setError(null);
  }, [quiz]);

  // Auto-clear the "Tersimpan" tick after 2s — mirrors ActivityEditForm
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const maxPoints = maxObtainablePoints(form.questions);
  const passingGradeTooHigh = (form.passingGrade ?? 0) > maxPoints;

  const onSave = async () => {
    const validationError = validateQuiz(form.questions);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (passingGradeTooHigh) {
      setError(
        `Passing grade (${form.passingGrade}) melebihi total poin maksimum kuis ini ` +
          `(${maxPoints}) — tidak ada skor yang bisa lulus. Turunkan passing grade atau ` +
          `tambah poin pertanyaan.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // ⚠️  Correctness crux: send questionText (not question) and
      // correctAnswerIndex (not correctAnswer). Both fail silently student-side.
      const updated = await updateQuiz(courseId, quiz.id, {
        title: form.title,
        questions: form.questions,
        type: form.type,
        gamificationType: form.gamificationType, // round-trip — no UI control
        passingGrade: form.passingGrade,
        allowRetake: form.allowRetake,
        showAnswers: form.showAnswers,
        timeLimitMinutes: form.timeLimitMinutes,
      });

      onQuizSaved(updated);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan perubahan kuis.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* ── Sticky save status bar ── mirrors ActivityEditForm chrome */}
      <div className='sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm'>
        <span className='text-sm font-semibold text-slate-700'>Edit Kuis</span>
        <span
          className={cn(
            'text-xs font-semibold',
            saving
              ? 'text-slate-400'
              : saved
                ? 'text-green-600'
                : error
                  ? 'text-red-500'
                  : 'text-slate-300',
          )}
        >
          {saving
            ? 'Menyimpan...'
            : saved
              ? '✓ Tersimpan'
              : error
                ? `Error: ${error}`
                : '—'}
        </span>
      </div>

      <QuizMetaSection
        form={form}
        setForm={setForm}
        maxPoints={maxPoints}
        passingGradeTooHigh={passingGradeTooHigh}
      />

      {/* ── Pertanyaan ─────────────────────────────────────────────────────── */}
      <section className='space-y-4 rounded-lg border bg-white p-4'>
        <h2 className='border-l-4 border-primary-400 pl-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
          Pertanyaan
        </h2>

        {form.questions.map((q, qIndex) => (
          <QuizQuestionCard
            key={qIndex}
            question={q}
            index={qIndex}
            setForm={setForm}
            disableDelete={form.questions.length <= 1}
          />
        ))}

        {/* Tambah Pertanyaan — defaults to MC */}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              questions: [...prev.questions, emptyMcQuestion()],
            }))
          }
        >
          <Plus className='mr-1 h-4 w-4' />
          Tambah Pertanyaan (Pilihan Ganda)
        </Button>

        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              questions: [...prev.questions, emptyShortAnswerQuestion()],
            }))
          }
        >
          <Plus className='mr-1 h-4 w-4' />
          Tambah Pertanyaan (Isian Singkat)
        </Button>

        <QuizXmlImport setForm={setForm} onError={setError} />
      </section>

      {/* ── Save ────────────────────────────────────────────────────────────── */}
      <div className='flex items-center gap-3'>
        <Button type='button' onClick={onSave} disabled={saving}>
          {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
};
