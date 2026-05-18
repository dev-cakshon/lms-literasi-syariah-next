'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCourse, getCourseContent, getLeaderboard } from '@/lib/api';

import { CourseNavbar } from '@/components/course/CourseNavbar';
import { CourseOverlay } from '@/components/course/CourseOverlay';

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
  const [isPetaOpen, setIsPetaOpen] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);

  const fetchCourseData = useCallback(async () => {
    try {
      const [courseData, courseContentData, leaderboard] = await Promise.all([
        getCourse(courseId),
        getCourseContent(courseId),
        getLeaderboard().catch(() => []),
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
        [...courseContentData].sort((a, b) => a.position - b.position),
      );

      const rankIndex = leaderboard.findIndex((e) => e.uid === user?.uid);
      setMyRank(rankIndex >= 0 ? rankIndex + 1 : null);
    } catch (err) {
      console.error('Failed to load course:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [courseId, router, user?.uid]);

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
        value={{
          contentItems,
          refreshContentItems,
          courseTitle: course.title,
          isPetaOpen,
          setPetaOpen: setIsPetaOpen,
          myRank,
        }}
      >
        <CourseNavbar courseId={courseId} />
        <main className='pt-20 pb-28 bg-pattern-organic min-h-screen'>
          {children}
        </main>
        <CourseOverlay
          course={course}
          contentItems={contentItems}
          isOpen={isPetaOpen}
          onClose={() => setIsPetaOpen(false)}
        />
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
