'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError, deleteChapter, updateChapter } from '@/lib/api';

import { RichTextEditor } from '@/components/course/admin/RichTextEditor';
import { SlidesPlayer } from '@/components/course/SlidesPlayer';
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
  mediaType: z.enum(['youtube', 'slides']),
  mediaUrl: z.string().optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

interface ChapterEditFormProps {
  courseId: string;
  chapter: Chapter;
  onChapterUpdated: () => void;
  onCancel?: () => void;
}

export const ChapterEditForm = ({
  courseId,
  chapter,
  onChapterUpdated,
  onCancel,
}: ChapterEditFormProps) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChapterFormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: {
      title: chapter.title || '',
      mediaType: chapter.mediaType || 'youtube',
      mediaUrl: chapter.mediaUrl || '',
      content: chapter.content || '',
      isPublished: chapter.isPublished ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      title: chapter.title || '',
      mediaType: chapter.mediaType || 'youtube',
      mediaUrl: chapter.mediaUrl || '',
      content: chapter.content || '',
      isPublished: chapter.isPublished ?? false,
    });
  }, [chapter, form]);

  const mediaUrl = form.watch('mediaUrl');
  const mediaType = form.watch('mediaType');

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
        Pick<Chapter, 'title' | 'mediaType' | 'mediaUrl' | 'content' | 'isPublished'>
      > = {};

      if (values.title !== chapter.title) {
        patch.title = values.title;
      }

      if (values.mediaType !== chapter.mediaType) {
        patch.mediaType = values.mediaType;
      }

      if ((values.mediaUrl || '') !== (chapter.mediaUrl || '')) {
        patch.mediaUrl = values.mediaUrl || '';
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

          {/* Media Type Radio Group */}
          <FormField
            control={form.control}
            name='mediaType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Media</FormLabel>
                <FormControl>
                  <div className='flex gap-6'>
                    <label className='flex items-center gap-2 cursor-pointer text-sm'>
                      <input
                        type='radio'
                        value='youtube'
                        checked={field.value === 'youtube'}
                        onChange={() => {
                          field.onChange('youtube');
                        }}
                      />
                      YouTube Video
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer text-sm'>
                      <input
                        type='radio'
                        value='slides'
                        checked={field.value === 'slides'}
                        onChange={() => {
                          field.onChange('slides');
                        }}
                      />
                      Google Slides
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media URL */}
          <FormField
            control={form.control}
            name='mediaUrl'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {mediaType === 'slides' ? 'URL Google Slides' : 'URL Video YouTube'}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      mediaType === 'slides'
                        ? 'https://docs.google.com/presentation/d/...'
                        : 'https://youtube.com/watch?v=...'
                    }
                    {...field}
                  />
                </FormControl>
                {mediaType === 'slides' && (
                  <FormDescription>
                    Pastikan presentasi diatur sebagai &apos;Siapa saja yang memiliki tautan&apos;.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media Preview */}
          {mediaUrl && (
            <div className='rounded-md border p-4 bg-slate-50'>
              <p className='text-sm font-medium mb-2 text-slate-600'>
                Preview Media
              </p>
              {mediaType === 'slides' ? (
                <SlidesPlayer url={mediaUrl} />
              ) : (
                <YoutubePlayer url={mediaUrl} />
              )}
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
            {onCancel && (
              <Button type='button' variant='outline' onClick={onCancel} disabled={saving}>
                Batal
              </Button>
            )}
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
