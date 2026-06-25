'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminActivity, TrueOrFalseActivity } from '@/types';

interface TrueOrFalseContentEditorProps {
  form: TrueOrFalseActivity;
  setForm: Dispatch<SetStateAction<AdminActivity>>;
}

export function TrueOrFalseContentEditor({
  form,
  setForm,
}: TrueOrFalseContentEditorProps) {
  return (
    <div className='space-y-3'>
      {form.statements.map((statement, index) => (
        <div
          key={statement.id || `statement-${index}`}
          className='bg-slate-50 rounded-md p-3 space-y-3'
        >
          <div className='flex items-start gap-2'>
            <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
              {index + 1}
            </span>
            <Input
              value={statement.text}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => {
                  if (prev.type !== 'true_or_false') return prev;
                  const statements = [...prev.statements];
                  statements[index] = {
                    ...statements[index],
                    text: value,
                  };
                  return { ...prev, statements };
                });
              }}
              placeholder={`Pernyataan ${index + 1}`}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setForm((prev) => {
                  if (prev.type !== 'true_or_false') return prev;
                  if (prev.statements.length <= 1) return prev;
                  const statements = prev.statements.filter(
                    (_, i) => i !== index,
                  );
                  return { ...prev, statements };
                });
              }}
              disabled={form.statements.length <= 1}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>

          <div className='flex gap-2 pl-6'>
            <button
              type='button'
              onClick={() =>
                setForm((prev) => {
                  if (prev.type !== 'true_or_false') return prev;
                  const statements = [...prev.statements];
                  statements[index] = {
                    ...statements[index],
                    correct: true,
                  };
                  return { ...prev, statements };
                })
              }
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium border transition-colors',
                statement.correct === true
                  ? 'bg-green-600 text-white border-green-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50',
              )}
            >
              Benar
            </button>
            <button
              type='button'
              onClick={() =>
                setForm((prev) => {
                  if (prev.type !== 'true_or_false') return prev;
                  const statements = [...prev.statements];
                  statements[index] = {
                    ...statements[index],
                    correct: false,
                  };
                  return { ...prev, statements };
                })
              }
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium border transition-colors',
                statement.correct === false
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50',
              )}
            >
              Salah
            </button>
          </div>
        </div>
      ))}

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => {
          setForm((prev) => {
            if (prev.type !== 'true_or_false') return prev;
            return {
              ...prev,
              statements: [
                ...prev.statements,
                {
                  id: `tof_${crypto.randomUUID().slice(0, 8)}`,
                  text: '',
                  correct: true,
                },
              ],
            };
          });
        }}
      >
        <Plus className='w-4 h-4 mr-1' />
        Tambah Pernyataan
      </Button>
    </div>
  );
}
