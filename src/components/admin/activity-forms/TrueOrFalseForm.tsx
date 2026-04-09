'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
      })
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='space-y-3 rounded-md border p-4'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-semibold'>Pernyataan</h4>
            <Button
              type='button'
              variant='outline'
              onClick={() => append({ text: '', isTrue: true })}
            >
              Tambah Pernyataan
            </Button>
          </div>

          {fields.map((statement, index) => (
            <div key={statement.id} className='space-y-2 rounded-md border p-3'>
              <div className='flex items-start gap-2'>
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

              <FormField
                control={form.control}
                name={`statements.${index}.isTrue`}
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FormLabel className='text-sm'>
                      Tandai sebagai Benar
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export type { TrueOrFalseFormProps };
