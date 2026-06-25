'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminActivity, WordSearchActivity } from '@/types';

interface WordSearchContentEditorProps {
  form: WordSearchActivity;
  setForm: Dispatch<SetStateAction<AdminActivity>>;
}

export function WordSearchContentEditor({
  form,
  setForm,
}: WordSearchContentEditorProps) {
  return (
    <div className='space-y-6'>
      {/* Word list */}
      <div className='space-y-3'>
        <p className='text-sm font-semibold text-slate-700'>Daftar Kata</p>
        {form.wordList.map((word, index) => (
          <div
            key={`word-${index}`}
            className='bg-slate-50 rounded-md p-2.5 flex items-center gap-2'
          >
            <span className='text-xs text-slate-400 w-4 shrink-0'>
              {index + 1}
            </span>
            <Input
              value={word}
              onChange={(e) => {
                const value = e.target.value;
                setForm((prev) => {
                  if (prev.type !== 'word_search') return prev;
                  const wordList = [...prev.wordList];
                  wordList[index] = value;
                  return { ...prev, wordList };
                });
              }}
              placeholder={`Kata ${index + 1}`}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setForm((prev) => {
                  if (prev.type !== 'word_search') return prev;
                  if (prev.wordList.length <= 1) return prev;
                  const wordList = prev.wordList.filter((_, i) => i !== index);
                  return { ...prev, wordList };
                });
              }}
              disabled={form.wordList.length <= 1}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        ))}
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() =>
            setForm((prev) => {
              if (prev.type !== 'word_search') return prev;
              return { ...prev, wordList: [...prev.wordList, ''] };
            })
          }
        >
          <Plus className='w-4 h-4 mr-1' />
          Tambah Kata
        </Button>
      </div>

      {/* Grid size */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
        <div className='space-y-2'>
          <label
            htmlFor='word-search-grid-rows'
            className='text-sm font-medium'
          >
            Grid Rows (8-15)
          </label>
          <Input
            id='word-search-grid-rows'
            type='number'
            min={8}
            max={15}
            value={form.gridSize.rows}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm((prev) =>
                prev.type === 'word_search'
                  ? {
                      ...prev,
                      gridSize: {
                        ...prev.gridSize,
                        rows: Number.isFinite(next) ? next : prev.gridSize.rows,
                      },
                    }
                  : prev,
              );
            }}
          />
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='word-search-grid-cols'
            className='text-sm font-medium'
          >
            Grid Cols (8-15)
          </label>
          <Input
            id='word-search-grid-cols'
            type='number'
            min={8}
            max={15}
            value={form.gridSize.cols}
            onChange={(e) => {
              const next = Number(e.target.value);
              setForm((prev) =>
                prev.type === 'word_search'
                  ? {
                      ...prev,
                      gridSize: {
                        ...prev.gridSize,
                        cols: Number.isFinite(next) ? next : prev.gridSize.cols,
                      },
                    }
                  : prev,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
