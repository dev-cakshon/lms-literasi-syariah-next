'use client';

import { useEffect, useState } from 'react';

import { getChapter, getCourseContent } from '@/lib/api';

import { ChapterContent } from '@/components/course/ChapterContent';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

import type { Chapter, CourseContentItem } from '@/types';

export default function ChapterIdPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [chapterDetail, setChapterDetail] = useState<Chapter | null>(null);
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setChapterId(p.chapterId);
    });
  }, [params]);

  useEffect(() => {
    if (!courseId || !chapterId) return;
    const resolvedCourseId = courseId;
    const resolvedChapterId = chapterId;

    async function fetchChapter() {
      try {
        const [chapterData, courseContentData] = await Promise.all([
          getChapter(resolvedCourseId, resolvedChapterId),
          getCourseContent(resolvedCourseId),
        ]);
        setChapterDetail(chapterData);
        setContentItems(courseContentData);
      } catch (err) {
        console.error('Failed to load chapter:', err);
        setChapterDetail(null);
        setContentItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChapter();
  }, [courseId, chapterId]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-muted-foreground'>Memuat bab...</p>
      </div>
    );
  }

  if (!chapterDetail || !courseId || !chapterId) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-xl text-red-500'>Chapter not found</p>
      </div>
    );
  }

  const completedCount = contentItems.filter((item) => item.completed).length;
  const completionPercent =
    contentItems.length === 0
      ? 0
      : (completedCount / contentItems.length) * 100;

  return (
    <div>
      <div className='mx-auto flex max-w-6xl justify-end px-4 pt-4'>
        <ProgressRing progress={completionPercent} size={84} strokeWidth={7}>
          <div className='text-center'>
            <p className='text-sm font-semibold text-primary-700'>
              {completedCount}/{contentItems.length}
            </p>
            <p className='text-[10px] uppercase tracking-wide text-slate-500'>
              Progress
            </p>
          </div>
        </ProgressRing>
      </div>
      <ChapterContent
        courseId={courseId}
        chapterId={chapterId}
        title={chapterDetail.title || 'Untitled'}
        videoUrl={chapterDetail.videoUrl || ''}
        content={chapterDetail.content || ''}
      />
    </div>
  );
}
