'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminActivity, DragDropActivity } from '@/types';

interface DragDropContentEditorProps {
  form: DragDropActivity;
  setForm: Dispatch<SetStateAction<AdminActivity>>;
}

export function DragDropContentEditor({
  form,
  setForm,
}: DragDropContentEditorProps) {
  return (
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
  );
}
