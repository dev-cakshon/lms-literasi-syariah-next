'use client';

import { useEffect, useState } from 'react';

import { getChapter } from '@/lib/api';

import { ChapterContent } from '@/components/course/ChapterContent';

import type { Chapter } from '@/types';

export default function ChapterIdPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [chapterDetail, setChapterDetail] = useState<Chapter | null>(null);
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
        const data = await getChapter(resolvedCourseId, resolvedChapterId);
        setChapterDetail(data);
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

  return (
    <div>
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
