'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCourse, getCourseContent } from '@/lib/api';

import { CourseNavbar } from '@/components/course/CourseNavbar';
import { CourseSidebar } from '@/components/course/CourseSidebar';

import { useAuth } from '@/contexts/AuthContext';

import { CourseLayoutContext } from './CourseLayoutContext';

import type { CourseContentItem } from '@/types';

interface CourseData {
  id: string;
  title: string;
  price: number;
}

interface CourseLayoutClientProps {
  children: React.ReactNode;
  courseId: string;
}

function CourseLayoutClient({ children, courseId }: CourseLayoutClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseData = useCallback(async () => {
    try {
      const [courseData, courseContentData] = await Promise.all([
        getCourse(courseId),
        getCourseContent(courseId),
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

      setContentItems(
        [...courseContentData].sort((a, b) => a.position - b.position)
      );
    } catch (err) {
      console.error('Failed to load course:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  const refreshContentItems = useCallback(() => {
    void fetchCourseData();
  }, [fetchCourseData]);

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
      <CourseLayoutContext.Provider
        value={{ contentItems, refreshContentItems }}
      >
        <div className='h-[80px] md:pl-80 fixed inset-y-0 w-full z-50'>
          <CourseNavbar
          // course={course}
          // chapters={chapters.map(ch => ({
          //     ...ch,
          //     isCompleted: completedChapterIds.has(ch._id)
          // }))}
          />
        </div>

        <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 bg-white'>
          <CourseSidebar course={course} contentItems={contentItems} />
        </div>
        <main className='md:pl-80 h-full pt-[80px]'>{children}</main>
      </CourseLayoutContext.Provider>
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
