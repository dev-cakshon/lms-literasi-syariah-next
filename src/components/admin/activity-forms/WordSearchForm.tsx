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
      })
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
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
              <FormMessage />
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
              <FormMessage />
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-3 rounded-md border p-4'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-semibold'>Daftar Kata</h4>
            <Button
              type='button'
              variant='outline'
              onClick={() => append({ word: '' })}
            >
              Tambah Kata
            </Button>
          </div>

          {fields.map((wordField, index) => (
            <div key={wordField.id} className='flex items-start gap-2'>
              <FormField
                control={form.control}
                name={`wordList.${index}.word`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input placeholder={`Kata ${index + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type='button'
                variant='outline'
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              >
                Hapus
              </Button>
            </div>
          ))}
        </div>

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
