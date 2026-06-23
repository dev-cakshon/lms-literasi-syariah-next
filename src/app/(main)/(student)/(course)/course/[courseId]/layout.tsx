'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ApiError,
  getCourse,
  getCourseContent,
  getMyEnrollmentRequests,
} from '@/lib/api';
import { useLeaderboard } from '@/hooks/use-realtime';

import { ChatbotDrawer } from '@/components/course/ChatbotDrawer';
import { ChatbotFab } from '@/components/course/ChatbotFab';
import { CourseNavbar } from '@/components/course/CourseNavbar';
import { CourseRoadmap } from '@/components/course/CourseRoadmap';
import { PremiumGateScreen } from '@/components/course/PremiumGateScreen';

import { useAuth } from '@/contexts/AuthContext';

import { CourseLayoutContext } from './CourseLayoutContext';

import type { CourseContentItem, EnrollmentRequest } from '@/types';

interface CourseData {
  id: string;
  title: string;
  description: string;
  accessTier?: 'free' | 'premium';
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
  const [gated, setGated] = useState(false);
  const [enrollmentRequest, setEnrollmentRequest] =
    useState<EnrollmentRequest | null>(null);
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
      // getCourse (metadata) is never gated — always fetch first.
      const courseData = await getCourse(courseId);

      if (!courseData) {
        router.push('/');
        return;
      }

      setCourse({
        id: courseData.id,
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        accessTier: courseData.accessTier,
        price: 0,
      });

      // getCourseContent is gated on premium courses.
      // A 403 PREMIUM_NOT_ENROLLED means we should show the gate screen,
      // not bounce the user away — so we catch it specifically here.
      try {
        const courseContentData = await getCourseContent(courseId);
        setContentItems(
          [...courseContentData].sort((a, b) => a.position - b.position),
        );
      } catch (contentErr) {
        if (
          contentErr instanceof ApiError &&
          (contentErr.code === 'PREMIUM_NOT_ENROLLED' ||
            contentErr.status === 403)
        ) {
          // Show the premium gate screen. Fetch the student's request state
          // so the gate can render the right CTA immediately.
          const reqs = await getMyEnrollmentRequests();
          const myReq = reqs.find((r) => r.courseId === courseId) ?? null;
          setEnrollmentRequest(myReq);
          setGated(true);
          return;
        }
        // Any other content error (404, 500, …) falls through to the outer catch.
        throw contentErr;
      }
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

  // Memoize the context value unconditionally (before early returns) to satisfy
  // Rules of Hooks. course may be null here — use optional chaining in deps.
  const courseContextValue = useMemo(
    () => ({
      contentItems,
      refreshContentItems,
      courseTitle: course?.title ?? '',
      courseDescription: course?.description ?? '',
      isRoadmapOpen,
      setRoadmapOpen: setIsRoadmapOpen,
      myRank,
      isChatOpen,
      setChatOpen: setIsChatOpen,
      isChatFabHidden,
      setChatFabHidden: setIsChatFabHidden,
    }),
    [
      contentItems,
      refreshContentItems,
      course?.title,
      course?.description,
      isRoadmapOpen,
      myRank,
      isChatOpen,
      isChatFabHidden,
    ],
  );

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  if (gated) {
    return (
      <PremiumGateScreen
        course={course}
        request={enrollmentRequest}
        onRequested={(req) => setEnrollmentRequest(req)}
      />
    );
  }

  return (
    <div className='h-full'>
      <CourseLayoutContext.Provider value={courseContextValue}>
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
