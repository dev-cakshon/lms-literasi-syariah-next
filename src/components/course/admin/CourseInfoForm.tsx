'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError, updateCourse } from '@/lib/api';

import { ImageUpload } from '@/components/course/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { Course } from '@/types';

const courseFormSchema = z.object({
  title: z.string().min(1, 'Judul kursus wajib diisi'),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseInfoFormProps {
  course: Course;
  onCourseUpdated: (updated: Course) => void;
}

type CoursePatchPayload = Partial<
  Pick<Course, 'title' | 'description' | 'thumbnailUrl' | 'isPublished'>
>;

export const CourseInfoForm = ({
  course,
  onCourseUpdated,
}: CourseInfoFormProps) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course.title || '',
      description: course.description || '',
      thumbnailUrl: course.thumbnailUrl || '',
      isPublished: course.isPublished ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      title: course.title || '',
      description: course.description || '',
      thumbnailUrl: course.thumbnailUrl || '',
      isPublished: course.isPublished ?? false,
    });
  }, [course, form]);

  // Reset saved indicator after 2s
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setSaving(true);
      setError(null);
      const patch: CoursePatchPayload = {};

      if (values.title !== course.title) {
        patch.title = values.title;
      }

      if ((values.description || '') !== (course.description || '')) {
        patch.description = values.description || '';
      }

      if ((values.thumbnailUrl || '') !== (course.thumbnailUrl || '')) {
        patch.thumbnailUrl = values.thumbnailUrl || undefined;
      }

      if ((values.isPublished ?? false) !== (course.isPublished ?? false)) {
        patch.isPublished = values.isPublished ?? false;
      }

      if (Object.keys(patch).length === 0) {
        setSaved(true);
        return;
      }

      const updated = await updateCourse(course.id, patch);
      onCourseUpdated(updated);
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menyimpan perubahan.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold'>Info Kursus</h2>
        <p className='text-sm text-muted-foreground'>
          Edit detail kursus Anda.
        </p>
        {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Title */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Kursus</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan judul kursus' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Deskripsi singkat tentang kursus ini...'
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail */}
          <FormField
            control={form.control}
            name='thumbnailUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gambar Thumbnail</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Upload gambar untuk thumbnail kursus.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published */}
          <FormField
            control={form.control}
            name='isPublished'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className='space-y-1 leading-none'>
                  <FormLabel>Publikasikan Kursus</FormLabel>
                  <FormDescription>
                    Kursus yang dipublikasikan akan terlihat oleh semua
                    pengguna.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className='flex items-center gap-3'>
            <Button type='submit' disabled={saving}>
              {saving && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Simpan Perubahan
            </Button>
            {saved && (
              <span className='text-sm text-green-600 font-medium'>
                Tersimpan!
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
