'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import {
  getActivityAdmin,
  getCourse,
  getCourseContent,
} from '@/lib/api';

import { ActivityEditForm } from '@/components/course/admin/ActivityEditForm';
import { AdminCourseSidebar } from '@/components/course/admin/AdminCourseSidebar';
import { CourseInfoForm } from '@/components/course/admin/CourseInfoForm';

import type {
  AdminActivity,
  Course,
  CourseContentItem,
} from '@/types';

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
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [selectedActivity, setSelectedActivity] =
    useState<AdminActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | string>('info');

  const fetchData = useCallback(async () => {
    try {
      const [courseData, courseContent] = await Promise.all([
        getCourse(courseId),
        getCourseContent(courseId),
      ]);
      setCourse(courseData);
      setContentItems(
        [...courseContent].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
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

  const activeActivityId = activeTab.startsWith('activity:')
    ? activeTab.replace('activity:', '')
    : null;

  useEffect(() => {
    if (!activeActivityId) {
      setSelectedActivity(null);
      setActivityError(null);
      return;
    }

    let mounted = true;

    const loadActivity = async () => {
      try {
        setActivityLoading(true);
        setActivityError(null);
        const data = await getActivityAdmin(courseId, activeActivityId);
        if (!mounted) return;
        setSelectedActivity(data);
      } catch (err) {
        if (!mounted) return;
        setSelectedActivity(null);
        setActivityError('Gagal memuat detail aktivitas.');
      } finally {
        if (mounted) {
          setActivityLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      mounted = false;
    };
  }, [activeActivityId, courseId]);

  const handleActivitySaved = (updated: AdminActivity) => {
    setSelectedActivity(updated);
    setContentItems((prev) =>
      prev.map((item) =>
        item.itemType === 'activity' && item.id === updated.id
          ? { ...item, title: updated.title }
          : item
      )
    );
  };

  if (loading || !course) {
    return (
      <div className='h-screen flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

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
          contentItems={contentItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onContentChanged={handleChaptersChanged}
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
          ) : activeActivityId ? (
            activityLoading ? (
              <p className='text-muted-foreground'>Memuat aktivitas...</p>
            ) : activityError ? (
              <p className='text-red-600'>{activityError}</p>
            ) : selectedActivity ? (
              <ActivityEditForm
                key={selectedActivity.id}
                courseId={courseId}
                activity={selectedActivity}
                onActivitySaved={handleActivitySaved}
              />
            ) : (
              <p className='text-muted-foreground'>
                Aktivitas tidak ditemukan.
              </p>
            )
          ) : (
            <p className='text-muted-foreground'>Pilih konten untuk diedit.</p>
          )}
        </div>
      </main>
    </div>
  );
}
