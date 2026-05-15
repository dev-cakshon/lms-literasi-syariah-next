'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const dragDropFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  maxPoints: z.number().int().min(1),
  feedbackMode: z.enum(['immediate', 'end']),
  categories: z
    .array(
      z.object({
        name: z.string().min(1),
      }),
    )
    .min(2, 'Minimal 2 kategori'),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        categoryIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export type DragDropFormData = z.infer<typeof dragDropFormSchema>;

interface DragDropFormProps {
  onBack: () => void;
  onNext: (data: DragDropFormData) => void;
}

export const DragDropForm = ({ onBack, onNext }: DragDropFormProps) => {
  const form = useForm<DragDropFormData>({
    resolver: zodResolver(dragDropFormSchema),
    defaultValues: {
      title: '',
      maxPoints: 10,
      feedbackMode: 'immediate',
      categories: [{ name: '' }, { name: '' }],
      items: [{ label: '', categoryIndex: 0 }],
    },
  });

  const {
    fields: categoryFields,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray<DragDropFormData, 'categories'>({
    control: form.control,
    name: 'categories',
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray<DragDropFormData, 'items'>({
    control: form.control,
    name: 'items',
  });

  const categories = form.watch('categories');

  const handleSubmit = (data: DragDropFormData) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        {/* Info Dasar */}
        <section className='rounded-lg border bg-white p-4 space-y-4'>
          <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
            Info Dasar
          </h2>

          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Aktivitas</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Contoh: Klasifikasi Akad Syariah'
                    {...field}
                  />
                </FormControl>
                <FormMessage className='text-red-500 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='maxPoints'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimal Poin</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className='text-red-500 text-xs' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='feedbackMode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode Feedback</FormLabel>
                <FormControl>
                  <div className='flex gap-4'>
                    <label className='flex items-center gap-2 text-sm'>
                      <input
                        type='radio'
                        checked={field.value === 'immediate'}
                        onChange={() => field.onChange('immediate')}
                      />
                      Langsung
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                      <input
                        type='radio'
                        checked={field.value === 'end'}
                        onChange={() => field.onChange('end')}
                      />
                      Di Akhir
                    </label>
                  </div>
                </FormControl>
                <FormMessage className='text-red-500 text-xs' />
              </FormItem>
            )}
          />
        </section>

        {/* Konten */}
        <section className='rounded-lg border bg-white p-4 space-y-6'>
          <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
            Konten
          </h2>

          {/* Categories sub-section */}
          <div className='space-y-3'>
            <p className='text-sm font-semibold text-slate-700'>Kategori</p>

            {categoryFields.map((category, index) => (
              <div
                key={category.id}
                className='bg-slate-50 rounded-md p-2.5 flex items-start gap-2'
              >
                <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
                  {index + 1}
                </span>
                <FormField
                  control={form.control}
                  name={`categories.${index}.name`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder={`Kategori ${index + 1}`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-red-500 text-xs' />
                    </FormItem>
                  )}
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => removeCategory(index)}
                  disabled={categoryFields.length <= 2}
                >
                  Hapus
                </Button>
              </div>
            ))}

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => appendCategory({ name: '' })}
            >
              + Tambah Kategori
            </Button>
          </div>

          {/* Items sub-section */}
          <div className='space-y-3'>
            <p className='text-sm font-semibold text-slate-700'>
              Item Drag &amp; Drop
            </p>

            {itemFields.map((item, index) => (
              <div
                key={item.id}
                className='bg-slate-50 rounded-md p-2.5 flex items-start gap-2'
              >
                <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
                  {index + 1}
                </span>
                <div className='flex-1 grid grid-cols-1 gap-2 md:grid-cols-5'>
                  <div className='md:col-span-3'>
                    <FormField
                      control={form.control}
                      name={`items.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder='Label item' {...field} />
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <FormField
                      control={form.control}
                      name={`items.${index}.categoryIndex`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <select
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                            >
                              {categories.map((cat, catIndex) => (
                                <option
                                  key={`${cat.name}-${catIndex}`}
                                  value={catIndex}
                                >
                                  {cat.name || `Kategori ${catIndex + 1}`}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage className='text-red-500 text-xs' />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => removeItem(index)}
                  disabled={itemFields.length <= 1}
                >
                  Hapus
                </Button>
              </div>
            ))}

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => appendItem({ label: '', categoryIndex: 0 })}
            >
              + Tambah Item
            </Button>
          </div>
        </section>

        <div className='flex items-center justify-end gap-2 border-t pt-4'>
          <Button type='button' variant='outline' onClick={onBack}>
            Kembali
          </Button>
          <Button type='submit'>Selanjutnya →</Button>
        </div>
      </form>
    </Form>
  );
};

export type { DragDropFormProps };
