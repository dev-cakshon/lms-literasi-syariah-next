'use client';

import type { Dispatch, SetStateAction } from 'react';

import { Input } from '@/components/ui/input';

import type { AdminActivity } from '@/types';

interface ActivityMetaSectionProps {
  form: AdminActivity;
  setForm: Dispatch<SetStateAction<AdminActivity>>;
}

export function ActivityMetaSection({
  form,
  setForm,
}: ActivityMetaSectionProps) {
  return (
    <section className='rounded-lg border bg-white p-4 space-y-4'>
      <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
        Info Dasar
      </h2>

      <div className='space-y-2'>
        <label htmlFor='activity-title' className='text-sm font-medium'>
          Judul Aktivitas
        </label>
        <Input
          id='activity-title'
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder='Masukkan judul aktivitas'
        />
      </div>

      <div className='space-y-2'>
        <label htmlFor='activity-max-points' className='text-sm font-medium'>
          Maksimal Poin
        </label>
        <Input
          id='activity-max-points'
          type='number'
          min={1}
          value={form.maxPoints}
          onChange={(e) => {
            const next = Number(e.target.value);
            setForm((prev) => ({
              ...prev,
              maxPoints: Number.isFinite(next) ? next : 0,
            }));
          }}
        />
      </div>

      {(form.type === 'drag_drop' || form.type === 'true_or_false') && (
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Mode Feedback</label>
          <div className='flex gap-4'>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                checked={form.feedbackMode === 'immediate'}
                onChange={() =>
                  setForm((prev) =>
                    prev.type === 'drag_drop' || prev.type === 'true_or_false'
                      ? { ...prev, feedbackMode: 'immediate' }
                      : prev,
                  )
                }
              />
              Langsung
            </label>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='radio'
                checked={form.feedbackMode === 'end'}
                onChange={() =>
                  setForm((prev) =>
                    prev.type === 'drag_drop' || prev.type === 'true_or_false'
                      ? { ...prev, feedbackMode: 'end' }
                      : prev,
                  )
                }
              />
              Di Akhir
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
