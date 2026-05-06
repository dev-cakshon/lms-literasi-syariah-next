'use client';

import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { getChapter, getCourse, getCourseContent } from '@/lib/api';

import { AdminCourseSidebar } from '@/components/course/admin/AdminCourseSidebar';
import { ChapterEditForm } from '@/components/course/admin/ChapterEditForm';
import { SlidesPlayer } from '@/components/course/SlidesPlayer';
import { YoutubePlayer } from '@/components/course/YoutubePlayer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import type { Chapter, Course, CourseContentItem } from '@/types';

function ChapterDetailContent() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params.courseId;
  const chapterId = params.chapterId;
  const isEditMode = searchParams.get('edit') === 'true';

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSidebarData = useCallback(async () => {
    try {
      const [courseData, contentData] = await Promise.all([
        getCourse(courseId),
        getCourseContent(courseId),
      ]);
      setCourse(courseData);
      setContentItems(
        [...contentData].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      );
    } catch {
      // sidebar data failure is non-fatal
    }
  }, [courseId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [chapterData] = await Promise.all([
          getChapter(courseId, chapterId),
          fetchSidebarData(),
        ]);
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
  }, [courseId, chapterId, fetchSidebarData]);

  const basePath = `/admin/course/${courseId}/chapters/${chapterId}`;

  const handleChapterUpdated = () => {
    getChapter(courseId, chapterId).then(setChapter).catch(() => null);
    router.push(basePath);
  };

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat bab...</p>
      </div>
    );
  }

  return (
    <div className='h-full'>
      {/* Top navbar */}
      <div className='h-15 md:pl-80 fixed inset-x-0 top-0 z-40 bg-white border-b flex items-center px-4 shadow-sm'>
        <Link
          href='/admin/course'
          className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition'
        >
          <ArrowLeft className='w-4 h-4' />
          Kembali ke Daftar Kursus
        </Link>
      </div>

      {/* Sidebar */}
      <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 bg-white'>
        <AdminCourseSidebar
          course={course}
          contentItems={contentItems}
          activeTab={`chapter:${chapterId}`}
          onTabChange={() => router.push(`/admin/course/${courseId}`)}
          onContentChanged={fetchSidebarData}
        />
      </div>

      {/* Main content */}
      <main className='md:pl-80 h-full pt-16'>
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
      </main>
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
