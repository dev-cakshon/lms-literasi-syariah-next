'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getChapters, getCourse } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import { CourseNavbar } from '@/components/course/CourseNavbar';
import { CourseSidebar } from '@/components/course/CourseSidebar';

import { useAuth } from '@/contexts/AuthContext';

interface CourseData {
  id: string;
  title: string;
  price: number;
}

interface ChapterData {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl: string;
  order: number;
  isFree: boolean;
}

interface CourseLayoutClientProps {
  children: React.ReactNode;
  courseId: string;
}

function CourseLayoutClient({ children, courseId }: CourseLayoutClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);

  const { completedChapters } = useCourseProgress(courseId);
  const completedChapterIds = new Set(completedChapters);

  const fetchCourseData = useCallback(async () => {
    try {
      const [courseData, chaptersData] = await Promise.all([
        getCourse(courseId),
        getChapters(courseId),
      ]);

      if (!courseData) {
        router.push('/');
        return;
      }

      setCourse({
        id: courseData.id,
        title: courseData.title || 'Untitled Course',
        price: 0,
      });

      const formatted: ChapterData[] = chaptersData
        .map((ch) => ({
          id: ch.id,
          courseId: courseId,
          title: ch.title || 'Untitled Chapter',
          content: ch.content || '',
          videoUrl: ch.videoUrl || '',
          order: ch.order || 0,
          isFree: ch.isFree || false,
        }))
        .sort((a, b) => a.order - b.order);

      setChapters(formatted);
    } catch (err) {
      console.error('Failed to load course:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCourseData();
  }, [user, fetchCourseData]);

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  return (
    <div className='h-full'>
      <div className='h-[80px] md:pl-80 fixed inset-y-0 w-full z-50'>
        <CourseNavbar
        // course={course}
        // chapters={chapters.map(ch => ({
        //     ...ch,
        //     isCompleted: completedChapterIds.has(ch._id)
        // }))}
        />
      </div>

      <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50'>
        <CourseSidebar
          course={course}
          chapters={chapters}
          completedChapterIds={completedChapterIds}
        />
      </div>
      <main className='md:pl-80 h-full pt-[80px]'>{children}</main>
    </div>
  );
}

interface CourseLayoutWrapperProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default function CourseLayout({
  children,
  params,
}: CourseLayoutWrapperProps) {
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  if (!courseId) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat...</p>
      </div>
    );
  }

  return (
    <CourseLayoutClient courseId={courseId}>{children}</CourseLayoutClient>
  );
}
