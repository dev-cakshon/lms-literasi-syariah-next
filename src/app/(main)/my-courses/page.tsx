'use client';

import { CheckCircle, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { getCourseProgressApi,getCourses } from '@/lib/api';

import { CourseList } from '@/components/course-list/CourseList';
import { InfoCard } from '@/components/course-list/InfoCard';

import { useAuth } from '@/contexts/AuthContext';

interface DisplayCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  progress: number;
  category: string;
  chaptersLength: number;
  createdAt?: string;
}

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<DisplayCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const allCourses = await getCourses();

      // Fetch progress for each course in parallel
      const coursesWithProgress = await Promise.all(
        allCourses.map(async (course) => {
          let progressPct = 0;
          try {
            const progress = await getCourseProgressApi(course.id);
            progressPct = progress.percentage || 0;
          } catch {
            // No progress yet — default to 0
          }

          return {
            id: course.id,
            title: course.title || 'Untitled Course',
            imageUrl: course.thumbnailUrl || course.imageUrl || null,
            progress: progressPct,
            category: '',
            chaptersLength: course.totalChapters || 0,
            createdAt: course.createdAt || undefined,
          };
        }),
      );

      // Sort newest first
      coursesWithProgress.sort((a, b) => {
        const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bd - ad;
      });

      setCourses(coursesWithProgress);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchCourses();
  }, [authLoading, fetchCourses]);

  if (authLoading || loading) {
    return (
      <div className='p-6 bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center h-full'>
        <p className='text-sm text-muted-foreground'>Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen'>
        <p className='text-sm text-muted-foreground'>
          Silakan login untuk melihat kursus Anda.
        </p>
      </div>
    );
  }

  const completedCourses = courses.filter(
    (c) => c.progress !== null && c.progress === 100
  );
  const courseInProgress = courses.filter(
    (c) => c.progress !== null && c.progress < 100
  );

  return (
    <div className='p-6 space-y-4 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Kursus Saya</h1>
        <p className='text-gray-600'>
          Deskripsi singkat tentang kursus Anda dan progres belajar Anda.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <InfoCard
          icon={Clock}
          label='In Progress'
          numberOfItems={courseInProgress.length}
        />
        <InfoCard
          icon={CheckCircle}
          label='Completed'
          numberOfItems={completedCourses.length}
          variant='success'
        />
      </div>
      <CourseList items={[...completedCourses, ...courseInProgress]} />
    </div>
  );
}
