'use client';

import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { getChapter } from '@/lib/api';

import { ChapterEditForm } from '@/components/course/admin/ChapterEditForm';
import { SlidesPlayer } from '@/components/course/SlidesPlayer';
import { YoutubePlayer } from '@/components/course/YoutubePlayer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Chapter } from '@/types';

function ChapterDetailContent() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params.courseId;
  const chapterId = params.chapterId;
  const isEditMode = searchParams.get('edit') === 'true';

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChapter(courseId, chapterId)
      .then(setChapter)
      .catch(() => setChapter(null))
      .finally(() => setLoading(false));
  }, [courseId, chapterId]);

  const basePath = `/admin/course/${courseId}/chapters/${chapterId}`;

  const handleChapterUpdated = () => {
    getChapter(courseId, chapterId).then(setChapter).catch(() => null);
    router.push(basePath);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-muted-foreground'>Memuat bab...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-red-500'>Bab tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-6'>
      <Link
        href={`/admin/course/${courseId}/edit`}
        className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition'
      >
        <ArrowLeft className='w-4 h-4' />
        Kembali ke Edit Kursus
      </Link>

      {isEditMode ? (
        <ChapterEditForm
          courseId={courseId}
          chapter={chapter}
          onChapterUpdated={handleChapterUpdated}
          onCancel={() => router.push(basePath)}
        />
      ) : (
        <div className='space-y-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1'>
              <h1 className='text-2xl font-bold'>{chapter.title}</h1>
              <Badge variant={chapter.isPublished ? 'default' : 'secondary'}>
                {chapter.isPublished ? 'Diterbitkan' : 'Draft'}
              </Badge>
            </div>
            <Button onClick={() => router.push(`${basePath}?edit=true`)}>
              <Pencil className='w-4 h-4 mr-2' />
              Edit
            </Button>
          </div>

          {chapter.mediaUrl && (
            <div className='rounded-md border overflow-hidden'>
              {chapter.mediaType === 'slides' ? (
                <SlidesPlayer url={chapter.mediaUrl} title={chapter.title} />
              ) : (
                <YoutubePlayer url={chapter.mediaUrl} title={chapter.title} />
              )}
            </div>
          )}

          {chapter.content && (
            <div className='prose prose-slate max-w-none'>
              <ReactMarkdown>{chapter.content}</ReactMarkdown>
            </div>
          )}

          {!chapter.mediaUrl && !chapter.content && (
            <p className='text-sm text-muted-foreground italic'>
              Bab ini belum memiliki konten.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminChapterDetailPage() {
  return (
    <Suspense>
      <ChapterDetailContent />
    </Suspense>
  );
}
