'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCourse, getCourseContent } from '@/lib/api';

import { AdminCourseSidebar } from '@/components/course/admin/AdminCourseSidebar';
import UnstyledLink from '@/components/links/UnstyledLink';

import { AdminCourseLayoutContext } from './AdminCourseLayoutContext';

import type { Course, CourseContentItem } from '@/types';

interface AdminCourseLayoutClientProps {
  children: React.ReactNode;
  courseId: string;
}

function AdminCourseLayoutClient({
  children,
  courseId,
}: AdminCourseLayoutClientProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [courseData, contentData] = await Promise.all([
        getCourse(courseId),
        getCourseContent(courseId),
      ]);
      setCourse(courseData);
      setContentItems(
        [...contentData].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      );
    } catch {
      router.push('/admin/course');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  const refreshContentItems = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  return (
    <AdminCourseLayoutContext.Provider
      value={{ refreshContentItems, contentItems, loading }}
    >
      <div className='h-full'>
        <div className='h-15 md:pl-85 fixed inset-x-0 top-0 z-40 bg-white border-b flex items-center px-4 shadow-sm float-end'>
          <UnstyledLink
            href='/admin/course'
            className='text-sm font-medium text-primary hover:underline'
          >
            Kembali ke Daftar Kursus
          </UnstyledLink>
        </div>

        <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 bg-white'>
          <AdminCourseSidebar
            courseId={courseId}
            course={course}
            contentItems={contentItems}
          />
        </div>

        <main className='md:pl-80 h-full pt-16'>{children}</main>
      </div>
    </AdminCourseLayoutContext.Provider>
  );
}

interface AdminCourseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default function AdminCourseLayout({
  children,
  params,
}: AdminCourseLayoutProps) {
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
    <AdminCourseLayoutClient courseId={courseId}>
      {children}
    </AdminCourseLayoutClient>
  );
}
