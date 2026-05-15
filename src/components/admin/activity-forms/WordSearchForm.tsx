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

const wordSearchFormSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  maxPoints: z.number().int().min(1),
  gridSize: z.object({
    rows: z.number().int().min(8).max(15),
    cols: z.number().int().min(8).max(15),
  }),
  wordList: z
    .array(
      z.object({
        word: z.string().min(1),
      }),
    )
    .min(1),
});

export type WordSearchFormData = z.infer<typeof wordSearchFormSchema>;

interface WordSearchFormProps {
  onBack: () => void;
  onNext: (data: WordSearchFormData) => void;
}

export const WordSearchForm = ({ onBack, onNext }: WordSearchFormProps) => {
  const form = useForm<WordSearchFormData>({
    resolver: zodResolver(wordSearchFormSchema),
    defaultValues: {
      title: '',
      maxPoints: 10,
      gridSize: {
        rows: 10,
        cols: 10,
      },
      wordList: [{ word: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray<
    WordSearchFormData,
    'wordList'
  >({
    control: form.control,
    name: 'wordList',
  });

  const handleSubmit = (data: WordSearchFormData) => {
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
                    placeholder='Contoh: Cari Istilah Ekonomi Syariah'
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

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='gridSize.rows'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Rows (8-15)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={8}
                      max={15}
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
              name='gridSize.cols'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Cols (8-15)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={8}
                      max={15}
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className='text-red-500 text-xs' />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Konten */}
        <section className='rounded-lg border bg-white p-4 space-y-4'>
          <h2 className='text-xs font-bold uppercase tracking-wide text-slate-500 border-l-4 border-primary-400 pl-2'>
            Konten
          </h2>

          {fields.map((wordField, index) => (
            <div
              key={wordField.id}
              className='bg-slate-50 rounded-md p-2.5 flex items-start gap-2'
            >
              <span className='text-xs text-slate-400 mt-2.5 w-4 shrink-0'>
                {index + 1}
              </span>
              <FormField
                control={form.control}
                name={`wordList.${index}.word`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input placeholder={`Kata ${index + 1}`} {...field} />
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
          ))}

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => append({ word: '' })}
          >
            + Tambah Kata
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

export type { WordSearchFormProps };
