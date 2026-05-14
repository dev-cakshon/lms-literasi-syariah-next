'use client';

import { Pencil } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useState } from 'react';

import { getChapter } from '@/lib/api';

import { AdminCourseLayoutContext } from '../../AdminCourseLayoutContext';
import { ChapterContent } from '@/components/course/ChapterContent';
import { ChapterEditForm } from '@/components/course/admin/ChapterEditForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Chapter } from '@/types';

function ChapterDetailContent() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshContentItems } = useContext(AdminCourseLayoutContext);

  const courseId = params.courseId;
  const chapterId = params.chapterId;
  const isEditMode = searchParams.get('edit') === 'true';

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const chapterData = await getChapter(courseId, chapterId);
        if (mounted) setChapter(chapterData);
      } catch {
        if (mounted) setChapter(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [courseId, chapterId]);

  const basePath = `/admin/course/${courseId}/chapter/${chapterId}`;

  const handleChapterUpdated = () => {
    getChapter(courseId, chapterId).then(setChapter).catch(() => null);
    refreshContentItems();
    router.push(basePath);
  };

  if (loading) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat bab...</p>
      </div>
    );
  }

  return (
    <div>
      {!chapter ? (
        <div className='flex items-center justify-center h-64'>
          <p className='text-red-500'>Bab tidak ditemukan.</p>
        </div>
      ) : isEditMode ? (
        <div className='max-w-3xl mx-auto p-6'>
          <ChapterEditForm
            courseId={courseId}
            chapter={chapter}
            onChapterUpdated={handleChapterUpdated}
            onCancel={() => router.push(basePath)}
          />
        </div>
      ) : (
        <div className='max-w-3xl mx-auto p-6 space-y-6'>
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
          <ChapterContent
            courseId={courseId}
            chapterId={chapterId}
            title={chapter.title}
            mediaUrl={chapter.mediaUrl}
            mediaType={chapter.mediaType}
            content={chapter.content}
            chapterOrdinal={1}
            courseTitle=""
          />
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
