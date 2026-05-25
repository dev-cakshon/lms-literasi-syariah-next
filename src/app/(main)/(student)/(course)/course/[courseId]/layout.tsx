'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getCourse, getCourseContent } from '@/lib/api';
import { useLeaderboard } from '@/hooks/use-realtime';

import { ChatbotDrawer } from '@/components/course/ChatbotDrawer';
import { ChatbotFab } from '@/components/course/ChatbotFab';
import { CourseNavbar } from '@/components/course/CourseNavbar';
import { CourseRoadmap } from '@/components/course/CourseRoadmap';

import { useAuth } from '@/contexts/AuthContext';

import { CourseLayoutContext } from './CourseLayoutContext';

import type { CourseContentItem } from '@/types';

interface CourseData {
  id: string;
  title: string;
  description: string;
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
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const { data: leaderboardData } = useLeaderboard();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatFabHidden, setIsChatFabHidden] = useState(false);

  const myRank = useMemo(() => {
    if (!user?.uid) return null;
    const idx = leaderboardData.findIndex((e) => e.uid === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [leaderboardData, user?.uid]);

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
        description: courseData.description || '',
        price: 0,
      });

      setContentItems(
        [...courseContentData].sort((a, b) => a.position - b.position),
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
        value={{
          contentItems,
          refreshContentItems,
          courseTitle: course.title,
          courseDescription: course.description,
          isRoadmapOpen,
          setRoadmapOpen: setIsRoadmapOpen,
          myRank,
          isChatOpen,
          setChatOpen: setIsChatOpen,
          isChatFabHidden,
          setChatFabHidden: setIsChatFabHidden,
        }}
      >
        <CourseNavbar courseId={courseId} />
        <main className='pt-20 pb-28 bg-pattern-organic min-h-screen'>
          {children}
        </main>
        <CourseRoadmap
          course={course}
          contentItems={contentItems}
          isOpen={isRoadmapOpen}
          onClose={() => setIsRoadmapOpen(false)}
        />
        <ChatbotFab />
        <ChatbotDrawer />
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
