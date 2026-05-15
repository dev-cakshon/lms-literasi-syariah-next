'use client';

import {
  BookOpen,
  CheckSquare,
  Grid2X2,
  Pencil,
  Search,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useContext, useEffect, useState } from 'react';

import { getCourse } from '@/lib/api';

import { CourseInfoForm } from '@/components/course/admin/CourseInfoForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { AdminCourseLayoutContext } from './AdminCourseLayoutContext';

import type { Course } from '@/types';

interface EditPageProps {
  params: Promise<{ courseId: string }>;
}

export default function AdminCourseOverviewPage({ params }: EditPageProps) {
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  if (!courseId) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat...</p>
      </div>
    );
  }

  return <OverviewPageContent courseId={courseId} />;
}

function OverviewPageContent({ courseId }: { courseId: string }) {
  const { refreshContentItems, contentItems } = useContext(
    AdminCourseLayoutContext,
  );
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const courseData = await getCourse(courseId);
      setCourse(courseData);
    } catch (err) {
      void err;
    } finally {
      setCourseLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

  const handleCourseUpdated = (updated: Course) => {
    setCourse(updated);
    refreshContentItems();
  };

  if (courseLoading || !course) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6 p-6'>
      <section className='rounded-lg border bg-white p-6 shadow-sm'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-2xl font-bold text-slate-900'>
                {course.title}
              </h1>
              <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                {course.isPublished ? 'Diterbitkan' : 'Draft'}
              </Badge>
            </div>
            <p className='mt-2 text-sm text-slate-600'>
              {course.description || 'Deskripsi kursus belum tersedia.'}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setEditingInfo((prev) => !prev)}
            className='shrink-0'
          >
            {editingInfo ? (
              <>
                <X className='w-4 h-4 mr-1' />
                Tutup
              </>
            ) : (
              <>
                <Pencil className='w-4 h-4 mr-1' />
                Edit Info
              </>
            )}
          </Button>
        </div>

        {editingInfo && (
          <div className='mt-6 pt-6 border-t'>
            <CourseInfoForm
              course={course}
              onCourseUpdated={handleCourseUpdated}
            />
          </div>
        )}
      </section>

      <section className='rounded-lg border bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-lg font-semibold text-slate-900'>
          Daftar Konten
        </h2>

        {contentItems.length === 0 ? (
          <p className='text-sm text-slate-500'>
            Belum ada konten yang ditambahkan.
          </p>
        ) : (
          <div className='overflow-hidden rounded-md border'>
            {contentItems.map((item) => {
              if (item.itemType === 'chapter') {
                return (
                  <Link
                    key={item.id}
                    href={`/admin/course/${courseId}/chapter/${item.id}`}
                    className='flex items-center gap-x-3 border-b px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 last:border-b-0'
                  >
                    <BookOpen size={16} className='shrink-0 text-slate-400' />
                    <span className='flex-1 truncate font-medium'>
                      {item.title}
                    </span>
                    <Badge
                      variant={item.isPublished ? 'default' : 'secondary'}
                      className='text-xs'
                    >
                      {item.isPublished ? 'Diterbitkan' : 'Draft'}
                    </Badge>
                  </Link>
                );
              }

              const ActivityIcon =
                item.type === 'drag_drop'
                  ? Grid2X2
                  : item.type === 'word_search'
                    ? Search
                    : CheckSquare;

              const activityLabel =
                item.type === 'drag_drop'
                  ? 'Drag & Drop'
                  : item.type === 'word_search'
                    ? 'Word Search'
                    : 'True/False';

              const href =
                item.type === 'drag_drop'
                  ? `/admin/course/${courseId}/drag-drop/${item.id}`
                  : item.type === 'word_search'
                    ? `/admin/course/${courseId}/activity/${item.id}/word-search`
                    : `/admin/course/${courseId}/activity/${item.id}/true-or-false`;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className='flex items-center gap-x-3 border-b px-4 py-3 text-sm text-slate-600 transition hover:bg-slate-50 last:border-b-0'
                >
                  <ActivityIcon size={16} className='shrink-0 text-slate-400' />
                  <span className='flex-1 truncate font-medium'>
                    {item.title}
                  </span>
                  <span className='shrink-0 text-xs text-slate-400'>
                    {activityLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
