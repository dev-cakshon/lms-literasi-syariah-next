'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, updateActivity } from '@/lib/api';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminActivity } from '@/types';

interface ActivityPatch {
  title?: string;
  maxPoints?: number;
  categories?: string[];
  items?: { id: string; label: string; correctCategory: string }[];
  feedbackMode?: string;
  wordList?: string[];
  gridSize?: { rows: number; cols: number };
  statements?: { id: string; text: string; correct: boolean }[];
}

interface ActivityEditFormProps {
  courseId: string;
  activity: AdminActivity;
  onActivitySaved: (updated: AdminActivity) => void;
}

function areEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
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

  useEffect(() => {
    setForm(activity);
    setSaved(false);
    setError(null);
  }, [activity]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const updateCommon = (
    updates: Partial<Pick<AdminActivity, 'title' | 'maxPoints'>>,
  ) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const validateWordSearchGrid = (): string | null => {
    if (form.type !== 'word_search') return null;
    if (form.gridSize.rows < 8 || form.gridSize.rows > 15) {
      return 'Grid rows harus di antara 8 dan 15.';
    }
    if (form.gridSize.cols < 8 || form.gridSize.cols > 15) {
      return 'Grid cols harus di antara 8 dan 15.';
    }
    return null;
  };

  const buildPatch = (): ActivityPatch => {
    const patch: ActivityPatch = {};

    if (form.title !== activity.title) {
      patch.title = form.title;
    }

    if (form.maxPoints !== activity.maxPoints) {
      patch.maxPoints = form.maxPoints;
    }

    if (form.type === 'drag_drop' && activity.type === 'drag_drop') {
      if (!areEqual(form.categories, activity.categories)) {
        patch.categories = form.categories;
      }
      if (!areEqual(form.items, activity.items)) {
        patch.items = form.items;
      }
      if (form.feedbackMode !== activity.feedbackMode) {
        patch.feedbackMode = form.feedbackMode;
      }
    }

    if (form.type === 'word_search' && activity.type === 'word_search') {
      if (!areEqual(form.wordList, activity.wordList)) {
        patch.wordList = form.wordList;
      }
      if (!areEqual(form.gridSize, activity.gridSize)) {
        patch.gridSize = form.gridSize;
      }
    }

    if (form.type === 'true_or_false' && activity.type === 'true_or_false') {
      if (!areEqual(form.statements, activity.statements)) {
        patch.statements = form.statements;
      }
      if (form.feedbackMode !== activity.feedbackMode) {
        patch.feedbackMode = form.feedbackMode;
      }
    }

    return patch;
  };

  const onSave = async () => {
    const gridError = validateWordSearchGrid();
    if (gridError) {
      setError(gridError);
      return;
    }

    const patch = buildPatch();

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

      {/* Info Dasar */}
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
            onChange={(e) => updateCommon({ title: e.target.value })}
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
              updateCommon({ maxPoints: Number.isFinite(next) ? next : 0 });
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

      {/* Konten */}
      <section className='rounded-lg border bg-white p-4 space-y-4'>
        <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
          Konten
        </h2>

        {/* Drag & Drop */}
        {form.type === 'drag_drop' && (
          <div className='space-y-6'>
            {/* Categories */}
            <div className='space-y-3'>
              <p className='text-sm font-semibold text-slate-700'>Kategori</p>
              {form.categories.map((category, index) => (
                <div
                  key={`cat-${index}`}
                  className='bg-slate-50 rounded-md p-2.5 flex items-center gap-2'
                >
                  <span className='text-xs text-slate-400 w-4 shrink-0'>
                    {index + 1}
                  </span>
                  <Input
                    value={category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => {
                        if (prev.type !== 'drag_drop') return prev;
                        const categories = [...prev.categories];
                        categories[index] = value;
                        return { ...prev, categories };
                      });
                    }}
                    placeholder={`Kategori ${index + 1}`}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setForm((prev) => {
                        if (prev.type !== 'drag_drop') return prev;
                        if (prev.categories.length <= 2) return prev;
                        const categories = prev.categories.filter(
                          (_, i) => i !== index,
                        );
                        const items = prev.items.map((item) => {
                          if (item.correctCategory === category) {
                            return {
                              ...item,
                              correctCategory: categories[0] ?? '',
                            };
                          }
                          return item;
                        });
                        return { ...prev, categories, items };
                      });
                    }}
                    disabled={form.categories.length <= 2}
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
                    if (prev.type !== 'drag_drop') return prev;
                    return { ...prev, categories: [...prev.categories, ''] };
                  })
                }
              >
                <Plus className='w-4 h-4 mr-1' />
                Tambah Kategori
              </Button>
            </div>

            {/* Items */}
            <div className='space-y-3'>
              <p className='text-sm font-semibold text-slate-700'>Items</p>
              {form.items.map((item, index) => (
                <div
                  key={item.id || `item-${index}`}
                  className='bg-slate-50 rounded-md p-2.5 flex items-start gap-2'
                >
                  <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
                    {index + 1}
                  </span>
                  <div className='flex-1 grid grid-cols-1 gap-2 md:grid-cols-6'>
                    <div className='md:col-span-3'>
                      <Input
                        value={item.label}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => {
                            if (prev.type !== 'drag_drop') return prev;
                            const items = [...prev.items];
                            items[index] = { ...items[index], label: value };
                            return { ...prev, items };
                          });
                        }}
                        placeholder='Label item'
                      />
                    </div>
                    <div className='md:col-span-3'>
                      <select
                        value={item.correctCategory}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((prev) => {
                            if (prev.type !== 'drag_drop') return prev;
                            const items = [...prev.items];
                            items[index] = {
                              ...items[index],
                              correctCategory: value,
                            };
                            return { ...prev, items };
                          });
                        }}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      >
                        {form.categories.map((cat, categoryIndex) => (
                          <option key={`${cat}-${categoryIndex}`} value={cat}>
                            {cat || `Kategori ${categoryIndex + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setForm((prev) => {
                        if (prev.type !== 'drag_drop') return prev;
                        if (prev.items.length <= 1) return prev;
                        const items = prev.items.filter((_, i) => i !== index);
                        return { ...prev, items };
                      });
                    }}
                    disabled={form.items.length <= 1}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setForm((prev) => {
                    if (prev.type !== 'drag_drop') return prev;
                    return {
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          id: `item_${crypto.randomUUID().slice(0, 8)}`,
                          label: '',
                          correctCategory: prev.categories[0] ?? '',
                        },
                      ],
                    };
                  });
                }}
              >
                <Plus className='w-4 h-4 mr-1' />
                Tambah Item
              </Button>
            </div>
          </div>
        )}

        {/* Word Search */}
        {form.type === 'word_search' && (
          <div className='space-y-6'>
            <div className='space-y-3'>
              <p className='text-sm font-semibold text-slate-700'>
                Daftar Kata
              </p>
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
                        const wordList = prev.wordList.filter(
                          (_, i) => i !== index,
                        );
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
                              rows: Number.isFinite(next)
                                ? next
                                : prev.gridSize.rows,
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
                              cols: Number.isFinite(next)
                                ? next
                                : prev.gridSize.cols,
                            },
                          }
                        : prev,
                    );
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* True or False */}
        {form.type === 'true_or_false' && (
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
