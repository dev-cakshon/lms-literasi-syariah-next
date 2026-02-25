'use client';

import { useCallback, useEffect, useState } from 'react';

import { getCourses } from '@/lib/api';

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

  const fetchCourses = useCallback(async () => {
    try {
      const data = await getCourses();
      const mapped: AdminCourse[] = data
        .map((course) => ({
          id: course.id,
          title: course.title || 'Untitled Course',
          imageUrl: course.thumbnailUrl || course.imageUrl || null,
          progress: 0,
          chaptersLength: course.totalChapters || 0,
          createdAt: course.createdAt || undefined,
        }))
        .sort((a, b) => {
          const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
          const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
          return bd - ad;
        });
      setCourses(mapped);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
