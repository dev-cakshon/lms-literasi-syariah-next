'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError, deleteChapter, updateChapter } from '@/lib/api';

import { RichTextEditor } from '@/components/course/admin/RichTextEditor';
import { YoutubePlayer } from '@/components/course/YoutubePlayer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

import type { Chapter } from '@/types';

const chapterFormSchema = z.object({
  title: z.string().min(1, 'Judul bab wajib diisi'),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

interface ChapterEditFormProps {
  courseId: string;
  chapter: Chapter;
  onChapterUpdated: () => void;
}

export const ChapterEditForm = ({
  courseId,
  chapter,
  onChapterUpdated,
}: ChapterEditFormProps) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      title: chapter.title || '',
      videoUrl: chapter.videoUrl || '',
      content: chapter.content || '',
      isPublished: chapter.isPublished ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      title: chapter.title || '',
      videoUrl: chapter.videoUrl || '',
      content: chapter.content || '',
      isPublished: chapter.isPublished ?? false,
    });
  }, [chapter, form]);

  const videoUrl = form.watch('videoUrl');

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const onSubmit = async (values: ChapterFormValues) => {
    try {
      setSaving(true);
      setError(null);
      const patch: Partial<
        Pick<Chapter, 'title' | 'videoUrl' | 'content' | 'isPublished'>
      > = {};

      if (values.title !== chapter.title) {
        patch.title = values.title;
      }

      if ((values.videoUrl || '') !== (chapter.videoUrl || '')) {
        patch.videoUrl = values.videoUrl || '';
      }

      if ((values.content || '') !== (chapter.content || '')) {
        patch.content = values.content || '';
      }

      if ((values.isPublished ?? false) !== (chapter.isPublished ?? false)) {
        patch.isPublished = values.isPublished ?? false;
      }

      if (Object.keys(patch).length === 0) {
        setSaved(true);
        return;
      }

      await updateChapter(courseId, chapter.id, patch);
      onChapterUpdated();
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

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await deleteChapter(courseId, chapter.id);
      onChapterUpdated();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus bab.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold'>Edit Bab</h2>
          <p className='text-sm text-muted-foreground'>Edit konten bab ini.</p>
          {error && <p className='text-sm text-red-600 mt-2'>{error}</p>}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' disabled={deleting}>
              <Trash2 className='w-4 h-4 mr-2' />
              Hapus Bab
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Bab?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak bisa dibatalkan. Bab &quot;{chapter.title}
                &quot; akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Title */}
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Bab</FormLabel>
                <FormControl>
                  <Input placeholder='Masukkan judul bab' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video URL */}
          <FormField
            control={form.control}
            name='videoUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Video YouTube</FormLabel>
                <FormControl>
                  <Input
                    placeholder='https://youtube.com/watch?v=...'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Masukkan link video YouTube untuk bab ini.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video Preview */}
          {videoUrl && (
            <div className='rounded-md border p-4 bg-slate-50'>
              <p className='text-sm font-medium mb-2 text-slate-600'>
                Preview Video
              </p>
              <YoutubePlayer videoUrl={videoUrl} />
            </div>
          )}

          {/* Content (Rich Text Editor) */}
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konten Bab</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>
                  Tulis konten materi bab ini. Mendukung formatting teks.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Published checkbox */}
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
                  <FormLabel>Diterbitkan</FormLabel>
                  <FormDescription>
                    Bab yang diterbitkan akan terlihat oleh siswa.
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
