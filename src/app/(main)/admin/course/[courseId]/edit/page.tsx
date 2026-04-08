'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { getChapters, getCourse } from '@/lib/api';

import { AdminCourseSidebar } from '@/components/course/admin/AdminCourseSidebar';
import { ChapterEditForm } from '@/components/course/admin/ChapterEditForm';
import { CourseInfoForm } from '@/components/course/admin/CourseInfoForm';

import type { Chapter, Course } from '@/types';

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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | string>('info');

  const fetchData = useCallback(async () => {
    try {
      const [courseData, chaptersData] = await Promise.all([
        getCourse(courseId),
        getChapters(courseId),
      ]);
      setCourse(courseData);
      setChapters(
        chaptersData
          .map((ch) => ({ ...ch, courseId }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (err) {
      void err;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCourseUpdated = (updated: Course) => {
    setCourse(updated);
  };

  const handleChaptersChanged = () => {
    fetchData();
  };

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  const activeChapter =
    activeTab !== 'info' ? chapters.find((ch) => ch.id === activeTab) : null;

  return (
    <div className='h-full'>
      {/* Top navbar */}
      <div className='h-15 md:pl-80 fixed inset-x-0 top-0 z-40 bg-white border-b flex items-center px-4 shadow-sm'>
        <Link
          href='/admin/course'
          className='flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition'
        >
          <ArrowLeft className='w-4 h-4' />
          Kembali ke Daftar Kursus
        </Link>
      </div>

      {/* Sidebar */}
      <div className='hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50 bg-white'>
        <AdminCourseSidebar
          course={course}
          chapters={chapters}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onChaptersChanged={handleChaptersChanged}
        />
      </div>

      {/* Main content */}
      <main className='md:pl-80 h-full pt-16'>
        <div className='max-w-3xl mx-auto p-6'>
          {activeTab === 'info' ? (
            <CourseInfoForm
              course={course}
              onCourseUpdated={handleCourseUpdated}
            />
          ) : activeChapter ? (
            <ChapterEditForm
              key={activeChapter.id}
              courseId={courseId}
              chapter={activeChapter}
              onChapterUpdated={handleChaptersChanged}
            />
          ) : (
            <p className='text-muted-foreground'>Pilih bab untuk diedit.</p>
          )}
        </div>
      </main>
    </div>
  );
}
