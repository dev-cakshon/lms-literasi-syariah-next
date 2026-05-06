'use client';

import { useCallback, useEffect, useState } from 'react';

import { getCourse } from '@/lib/api';

import { CourseInfoForm } from '@/components/course/admin/CourseInfoForm';

import type { Course } from '@/types';

interface EditPageProps {
  params: Promise<{ courseId: string }>;
}

export default function AdminCourseEditPage({ params }: EditPageProps) {
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

  return <EditPageContent courseId={courseId} />;
}

function EditPageContent({ courseId }: { courseId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch (err) {
      void err;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCourseUpdated = (updated: Course) => {
    setCourse(updated);
  };

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6'>
      <CourseInfoForm course={course} onCourseUpdated={handleCourseUpdated} />
    </div>
  );
}
