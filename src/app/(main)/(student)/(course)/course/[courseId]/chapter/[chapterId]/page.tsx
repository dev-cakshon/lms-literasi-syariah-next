'use client';

import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

import { getChapter } from '@/lib/api';
import { getChapterOrdinal, getNeighborPaths } from '@/lib/courseUtils';
import { useCourseProgress } from '@/hooks/use-realtime';

import { ChapterContent } from '@/components/course/ChapterContent';
import { CourseActionBar } from '@/components/course/CourseActionBar';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';

import type { Chapter } from '@/types';

export default function ChapterIdPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [chapterDetail, setChapterDetail] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  const { contentItems, courseTitle } = useContext(CourseLayoutContext);
  const { completedChapters } = useCourseProgress(courseId ?? '');

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
      <div className='flex items-center justify-center h-[60vh]'>
        <p className='text-muted-foreground'>Memuat bab...</p>
      </div>
    );
  }

  if (!chapterDetail || !courseId || !chapterId) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <p className='text-xl text-red-500'>Chapter not found</p>
      </div>
    );
  }

  const chapterOrdinal = getChapterOrdinal(contentItems, chapterId);
  const neighbors = getNeighborPaths(contentItems, chapterId, courseId);
  const isCompleted = completedChapters.includes(chapterId);
  const isLastItem = neighbors.next === null;

  const nextState = isCompleted
    ? isLastItem
      ? 'last-completable'
      : 'enabled'
    : 'disabled';

  const nextOnClick = isCompleted
    ? () => router.push(neighbors.next ?? `/course/${courseId}`)
    : undefined;

  const prevPath = neighbors.prev;

  return (
    <>
      <ChapterContent
        courseId={courseId}
        chapterId={chapterId}
        title={chapterDetail.title || 'Untitled'}
        mediaUrl={chapterDetail.mediaUrl || ''}
        mediaType={chapterDetail.mediaType || 'youtube'}
        content={chapterDetail.content || ''}
        chapterOrdinal={chapterOrdinal}
        courseTitle={courseTitle}
      />
      <CourseActionBar
        prev={prevPath ? { onClick: () => router.push(prevPath) } : null}
        next={{
          state: nextState,
          onClick: nextOnClick,
          tooltipText: isCompleted
            ? undefined
            : 'Tandai bab selesai untuk lanjut',
        }}
      />
    </>
  );
}
