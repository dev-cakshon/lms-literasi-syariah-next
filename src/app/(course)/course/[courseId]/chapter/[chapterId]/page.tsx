'use client';

import { useEffect, useState } from 'react';

import { getChapter, getCourseContent } from '@/lib/api';

import { ChapterContent } from '@/components/course/ChapterContent';

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
        const [data, courseContent] = await Promise.all([
          getChapter(resolvedCourseId, resolvedChapterId),
          getCourseContent(resolvedCourseId),
        ]);
        setChapterDetail(data);
        setContentItems(courseContent);
      } catch (err) {
        console.error('Failed to load chapter:', err);
        setChapterDetail(null);
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
  const totalCount = contentItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div>
      <ChapterContent
        courseId={courseId}
        chapterId={chapterId}
        title={chapterDetail.title || 'Untitled'}
        mediaUrl={chapterDetail.mediaUrl || ''}
        mediaType={chapterDetail.mediaType || 'youtube'}
        content={chapterDetail.content || ''}
        progressPercent={progressPercent}
        completedCount={completedCount}
        totalCount={totalCount}
      />
    </div>
  );
}
