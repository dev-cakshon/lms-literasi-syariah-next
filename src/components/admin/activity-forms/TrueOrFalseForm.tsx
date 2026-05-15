'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';

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

const trueOrFalseFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  maxPoints: z.number().int().min(1),
  feedbackMode: z.enum(['immediate', 'end']),
  statements: z
    .array(
      z.object({
        text: z.string().min(1),
        isTrue: z.boolean(),
      }),
    )
    .min(1),
});

export type TrueOrFalseFormData = z.infer<typeof trueOrFalseFormSchema>;

interface TrueOrFalseFormProps {
  onBack: () => void;
  onNext: (data: TrueOrFalseFormData) => void;
}

export const TrueOrFalseForm = ({ onBack, onNext }: TrueOrFalseFormProps) => {
  const form = useForm<TrueOrFalseFormData>({
    resolver: zodResolver(trueOrFalseFormSchema),
    defaultValues: {
      title: '',
      maxPoints: 10,
      feedbackMode: 'immediate',
      statements: [{ text: '', isTrue: true }],
    },
  });

  const { fields, append, remove } = useFieldArray<
    TrueOrFalseFormData,
    'statements'
  >({
    control: form.control,
    name: 'statements',
  });

  const handleSubmit = (data: TrueOrFalseFormData) => {
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
                    placeholder='Contoh: Pernyataan Konsep Syariah'
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
        <section className='rounded-lg border bg-white p-4 space-y-4'>
          <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
            Konten
          </h2>

          {fields.map((statement, index) => (
            <div
              key={statement.id}
              className='bg-slate-50 rounded-md p-3 space-y-3'
            >
              <div className='flex items-start gap-2'>
                <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
                  {index + 1}
                </span>
                <FormField
                  control={form.control}
                  name={`statements.${index}.text`}
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormControl>
                        <Input
                          placeholder={`Pernyataan ${index + 1}`}
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
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  Hapus
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`statements.${index}.isTrue`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-xs text-slate-500'>
                      Jawaban:
                    </FormLabel>
                    <FormControl>
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() => field.onChange(true)}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium border transition-colors',
                            field.value === true
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                          )}
                        >
                          Benar
                        </button>
                        <button
                          type='button'
                          onClick={() => field.onChange(false)}
                          className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium border transition-colors',
                            field.value === false
                              ? 'bg-red-600 text-white border-red-600'
                              : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                          )}
                        >
                          Salah
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className='text-red-500 text-xs' />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ text: '', isTrue: true })}
          >
            + Tambah Pernyataan
          </Button>
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

export type { TrueOrFalseFormProps };
