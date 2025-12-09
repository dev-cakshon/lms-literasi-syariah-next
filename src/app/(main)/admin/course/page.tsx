'use client';

import { useEffect, useState } from 'react';

import { subscribeToCourses } from '@/lib/firestore';

import { CourseList } from '@/components/course-list/CourseList';

interface AdminCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  progress: number;
  chaptersLength: number;
  createdAt?: string;
}

export default function AdminCoursePage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCourses((coursesData) => {
      const mappedCourses: AdminCourse[] = coursesData
        .map((course) => ({
          id: course.id as string,
          title: (course.title as string) || 'Untitled Course',
          imageUrl: (course.imageUrl as string) || null,
          progress: 0, // Admin view doesn't need progress
          chaptersLength: (course.totalChapters as number) || 0,
          createdAt: (course.createdAt as string) || undefined,
        }))
        // Sort by createdAt (newest first)
        .sort((a, b) => {
          const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bd - ad;
        });

      setCourses(mappedCourses);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className='p-8 flex items-center justify-center h-full'>
        <p className='text-sm text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  return (
    <div className='p-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          Admin Course Page
        </h1>
        <p className='text-gray-600'>
          Buat, edit, dan kelola kursus ekonomi syariah Anda di sini.
        </p>
      </div>
      <CourseList items={courses} />
    </div>
  );
}
