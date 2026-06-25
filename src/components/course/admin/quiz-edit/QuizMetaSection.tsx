'use client';

import type { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';

import type { Quiz } from '@/types';

interface QuizMetaSectionProps {
  form: Quiz;
  setForm: Dispatch<SetStateAction<Quiz>>;
  maxPoints: number;
  passingGradeTooHigh: boolean;
}

export function QuizMetaSection({
  form,
  setForm,
  maxPoints,
  passingGradeTooHigh,
}: QuizMetaSectionProps) {
  return (
    <section className='space-y-4 rounded-lg border bg-white p-4'>
      <h2 className='border-l-4 border-primary-400 pl-2 text-xs font-bold uppercase tracking-wide text-slate-500'>
        Info Dasar
      </h2>

      <div className='space-y-2'>
        <label htmlFor='quiz-title' className='text-sm font-medium'>
          Judul Kuis
        </label>
        <Input
          id='quiz-title'
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder='Masukkan judul kuis'
        />
      </div>

      <div className='space-y-2'>
        <label className='text-sm font-medium'>Tipe Kuis</label>
        <div className='flex gap-4'>
          {(
            [
              ['preTest', 'Pre-Test'],
              ['postTest', 'Post-Test'],
              ['standard', 'Standar'],
            ] as const
          ).map(([val, label]) => (
            <label key={val} className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                checked={form.type === val}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    type: val as Quiz['type'],
                  }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className='space-y-2'>
        <label htmlFor='quiz-passing-grade' className='text-sm font-medium'>
          Passing Grade (poin)
        </label>
        <div className='flex items-center gap-3'>
          <Input
            id='quiz-passing-grade'
            type='number'
            min={0}
            className={cn(
              'w-32',
              passingGradeTooHigh &&
                'border-red-400 focus-visible:ring-red-400',
            )}
            value={form.passingGrade ?? 0}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm((prev) => ({
                ...prev,
                passingGrade: Number.isFinite(next) ? next : 0,
              }));
            }}
          />
          <span className='text-xs text-slate-500'>
            Maks. poin kuis ini: <strong>{maxPoints}</strong>
          </span>
        </div>
        {passingGradeTooHigh ? (
          <p className='text-xs font-medium text-red-600'>
            Passing grade melebihi total poin maksimum ({maxPoints}) — tidak ada
            skor yang bisa lulus. Turunkan nilainya atau tambah poin pertanyaan.
          </p>
        ) : (
          <p className='text-xs text-slate-500'>
            Minimum poin yang harus diraih siswa. Set ke 0 jika tidak ada batas
            kelulusan.
          </p>
        )}
      </div>

      <div className='flex flex-wrap gap-6'>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={form.allowRetake !== false}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, allowRetake: e.target.checked }))
            }
          />
          Izinkan Ulangi (allowRetake)
        </label>
        <label className='flex items-center gap-2 text-sm'>
          <input
            type='checkbox'
            checked={form.showAnswers === true}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, showAnswers: e.target.checked }))
            }
          />
          Tampilkan Jawaban Setelah Kuis (showAnswers)
        </label>
      </div>

      <div className='space-y-2'>
        <label htmlFor='quiz-time-limit' className='text-sm font-medium'>
          Waktu Pengerjaan (menit)
        </label>
        <div className='flex items-center gap-3'>
          <Input
            id='quiz-time-limit'
            type='number'
            min={0}
            className='w-32'
            value={form.timeLimitMinutes ?? 0}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm((prev) => ({
                ...prev,
                timeLimitMinutes: Number.isFinite(next) && next >= 0 ? next : 0,
              }));
            }}
          />
          <span className='text-xs text-slate-500'>
            0 = tidak ada batas waktu
          </span>
        </div>
      </div>
    </section>
  );
}
