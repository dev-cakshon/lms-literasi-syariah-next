'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, updateActivity } from '@/lib/api';
import { cn } from '@/lib/utils';

import {
  buildActivityPatch,
  validateWordSearchGrid,
} from '@/components/course/admin/activity-edit/activityEditHelpers';
import { ActivityMetaSection } from '@/components/course/admin/activity-edit/ActivityMetaSection';
import { DragDropContentEditor } from '@/components/course/admin/activity-edit/DragDropContentEditor';
import { TrueOrFalseContentEditor } from '@/components/course/admin/activity-edit/TrueOrFalseContentEditor';
import { WordSearchContentEditor } from '@/components/course/admin/activity-edit/WordSearchContentEditor';
import { Button } from '@/components/ui/button';

import type { AdminActivity } from '@/types';

interface ActivityEditFormProps {
  courseId: string;
  activity: AdminActivity;
  onActivitySaved: (updated: AdminActivity) => void;
}

export const ActivityEditForm = ({
  courseId,
  activity,
  onActivitySaved,
}: ActivityEditFormProps) => {
  const [form, setForm] = useState<AdminActivity>(activity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // B2: Resync when parent passes an updated activity (e.g. after redirect or refresh)
  useEffect(() => {
    setForm(activity);
    setSaved(false);
    setError(null);
  }, [activity]);

  // Auto-clear the "Tersimpan" tick after 2s
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const onSave = async () => {
    const gridError = validateWordSearchGrid(form);
    if (gridError) {
      setError(gridError);
      return;
    }

    const patch = buildActivityPatch(form, activity);

    if (Object.keys(patch).length === 0) {
      setSaved(true);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateActivity(courseId, activity.id, patch);
      const merged = { ...form, ...patch } as AdminActivity;
      onActivitySaved(merged);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan perubahan aktivitas.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Sticky save status bar */}
      <div className='sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-white px-4 py-3 shadow-sm'>
        <span className='text-sm font-semibold text-slate-700'>
          Edit Aktivitas
        </span>
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

      <ActivityMetaSection form={form} setForm={setForm} />

      {/* Type-specific content editors */}
      <section className='rounded-lg border bg-white p-4 space-y-4'>
        <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
          Konten
        </h2>

        {form.type === 'drag_drop' && (
          <DragDropContentEditor form={form} setForm={setForm} />
        )}
        {form.type === 'word_search' && (
          <WordSearchContentEditor form={form} setForm={setForm} />
        )}
        {form.type === 'true_or_false' && (
          <TrueOrFalseContentEditor form={form} setForm={setForm} />
        )}
      </section>

      {/* Save button */}
      <div className='flex items-center gap-3'>
        <Button type='button' onClick={onSave} disabled={saving}>
          {saving && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          Simpan Perubahan
        </Button>
      </div>
    </div>
  );
};
