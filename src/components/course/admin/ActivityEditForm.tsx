'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ApiError, updateActivity } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    updates: Partial<Pick<AdminActivity, 'title' | 'maxPoints'>>
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
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>Edit Aktivitas</h2>
        <p className='text-sm text-muted-foreground'>
          Perbarui konfigurasi aktivitas ini.
        </p>
        {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
      </div>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Judul Aktivitas</label>
          <Input
            value={form.title}
            onChange={(e) => updateCommon({ title: e.target.value })}
            placeholder='Masukkan judul aktivitas'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Maksimal Poin</label>
          <Input
            type='number'
            min={1}
            value={form.maxPoints}
            onChange={(e) => {
              const next = Number(e.target.value);
              updateCommon({ maxPoints: Number.isFinite(next) ? next : 0 });
            }}
          />
        </div>

        {form.type === 'drag_drop' && (
          <div className='space-y-6 rounded-md border p-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Kategori</h4>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setForm((prev) => {
                      if (prev.type !== 'drag_drop') return prev;
                      return {
                        ...prev,
                        categories: [...prev.categories, ''],
                      };
                    })
                  }
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Tambah
                </Button>
              </div>

              {form.categories.map((category, index) => (
                <div key={`cat-${index}`} className='flex items-center gap-2'>
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
                          (_, i) => i !== index
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
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Items</h4>
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
                            id: `item_${Date.now()}_${prev.items.length}`,
                            label: '',
                            correctCategory: prev.categories[0] ?? '',
                          },
                        ],
                      };
                    });
                  }}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Tambah
                </Button>
              </div>

              {form.items.map((item, index) => (
                <div
                  key={item.id || `item-${index}`}
                  className='grid grid-cols-1 gap-2 md:grid-cols-6'
                >
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
                  <div className='md:col-span-2'>
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
                      {form.categories.map((category, categoryIndex) => (
                        <option
                          key={`${category}-${categoryIndex}`}
                          value={category}
                        >
                          {category || `Kategori ${categoryIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='md:col-span-1'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => {
                        setForm((prev) => {
                          if (prev.type !== 'drag_drop') return prev;
                          if (prev.items.length <= 1) return prev;
                          const items = prev.items.filter(
                            (_, i) => i !== index
                          );
                          return { ...prev, items };
                        });
                      }}
                      disabled={form.items.length <= 1}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Mode Feedback</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    checked={form.feedbackMode === 'immediate'}
                    onChange={() =>
                      setForm((prev) =>
                        prev.type === 'drag_drop'
                          ? { ...prev, feedbackMode: 'immediate' }
                          : prev
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
                        prev.type === 'drag_drop'
                          ? { ...prev, feedbackMode: 'end' }
                          : prev
                      )
                    }
                  />
                  Di Akhir
                </label>
              </div>
            </div>
          </div>
        )}

        {form.type === 'word_search' && (
          <div className='space-y-6 rounded-md border p-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Daftar Kata</h4>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setForm((prev) => {
                      if (prev.type !== 'word_search') return prev;
                      return {
                        ...prev,
                        wordList: [...prev.wordList, ''],
                      };
                    })
                  }
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Tambah
                </Button>
              </div>

              {form.wordList.map((word, index) => (
                <div key={`word-${index}`} className='flex items-center gap-2'>
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
                          (_, i) => i !== index
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
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Grid Rows (8-15)</label>
                <Input
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
                        : prev
                    );
                  }}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Grid Cols (8-15)</label>
                <Input
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
                        : prev
                    );
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {form.type === 'true_or_false' && (
          <div className='space-y-6 rounded-md border p-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold'>Pernyataan</h4>
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
                            id: `tof_${Date.now()}_${prev.statements.length}`,
                            text: '',
                            correct: true,
                          },
                        ],
                      };
                    });
                  }}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Tambah
                </Button>
              </div>

              {form.statements.map((statement, index) => (
                <div
                  key={statement.id || `statement-${index}`}
                  className='space-y-2 rounded-md border p-3'
                >
                  <div className='flex items-start gap-2'>
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
                            (_, i) => i !== index
                          );
                          return { ...prev, statements };
                        });
                      }}
                      disabled={form.statements.length <= 1}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>

                  <label className='flex items-center gap-2 text-sm'>
                    <Checkbox
                      checked={statement.correct}
                      onCheckedChange={(checked) => {
                        setForm((prev) => {
                          if (prev.type !== 'true_or_false') return prev;
                          const statements = [...prev.statements];
                          statements[index] = {
                            ...statements[index],
                            correct: checked === true,
                          };
                          return { ...prev, statements };
                        });
                      }}
                    />
                    Tandai sebagai Benar
                  </label>
                </div>
              ))}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Mode Feedback</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2 text-sm'>
                  <input
                    type='radio'
                    checked={form.feedbackMode === 'immediate'}
                    onChange={() =>
                      setForm((prev) =>
                        prev.type === 'true_or_false'
                          ? { ...prev, feedbackMode: 'immediate' }
                          : prev
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
                        prev.type === 'true_or_false'
                          ? { ...prev, feedbackMode: 'end' }
                          : prev
                      )
                    }
                  />
                  Di Akhir
                </label>
              </div>
            </div>
          </div>
        )}

        <div className='flex items-center gap-3'>
          <Button type='button' onClick={onSave} disabled={saving}>
            {saving && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            Simpan Perubahan
          </Button>
          {saved && (
            <span className='text-sm text-green-600 font-medium'>
              Tersimpan!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
