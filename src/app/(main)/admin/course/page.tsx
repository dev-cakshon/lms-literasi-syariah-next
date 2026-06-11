'use client';

import { Library, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  ApiError,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '@/lib/api';

import { CourseCard } from '@/components/course-list/CourseCard';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import type { Course } from '@/types';

export default function AdminCoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await getCourses();
      const sorted = [...data].sort((a, b) => {
        const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bd - ad;
      });
      setCourses(sorted);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Gagal memuat kursus.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = async () => {
    try {
      setCreating(true);
      const newCourse = await createCourse({
        title: 'Kursus Baru',
        isPublished: false,
      });
      router.push(`/admin/course/${newCourse.id}`);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal membuat kursus baru.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = await updateCourse(course.id, {
        isPublished: !course.isPublished,
      });
      setCourses((prev) =>
        prev.map((item) =>
          item.id === course.id ? { ...item, ...updated } : item,
        ),
      );
      toast.success(
        updated.isPublished ? 'Kursus diterbitkan.' : 'Kursus diarsipkan.',
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : 'Gagal memperbarui status publikasi kursus.',
      );
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((item) => item.id !== course.id));
      toast.success('Kursus dihapus.');
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Gagal menghapus kursus.',
      );
      throw err; // keep the ConfirmDialog open so the user can retry
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'>
      {/* Page header */}
      <div className='mb-6'>
        <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
          Kelola Kursus
        </h1>
        <p className='mt-1 text-sm text-slate-500'>
          Buat, edit, dan kelola kursus ekonomi syariah Anda.
        </p>
      </div>

      {/* Toolbar */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        {/* Live search */}
        <div className='relative w-full sm:w-72'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
            placeholder='Cari kursus…'
            aria-label='Cari kursus'
          />
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Create */}
        <Button onClick={handleCreateCourse} disabled={creating}>
          <Plus className='mr-1.5 h-4 w-4' />
          {creating ? 'Membuat…' : 'Buat Kursus'}
        </Button>
      </div>

      {/* Load error */}
      {!loading && loadError && (
        <EmptyState
          icon={Library}
          title='Gagal memuat kursus'
          description={loadError}
          action={
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setLoading(true);
                fetchCourses();
              }}
            >
              Coba lagi
            </Button>
          }
        />
      )}

      {/* Loading skeleton grid */}
      {loading && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className='h-64 w-full rounded-[var(--radius-card)]'
            />
          ))}
        </div>
      )}

      {/* Course grid */}
      {!loading && !loadError && (
        <>
          {filteredCourses.length > 0 ? (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title || 'Kursus Tanpa Judul'}
                  description={course.description}
                  imageUrl={course.thumbnailUrl || null}
                  chaptersLength={course.totalChapters || 0}
                  activities={course.totalActivities}
                  isPublished={course.isPublished}
                  accessTier={course.accessTier}
                  editUrl={`/admin/course/${course.id}`}
                  actions={
                    <div className='flex items-center gap-2 p-4'>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/admin/course/${course.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant={course.isPublished ? 'outline' : 'tonal'}
                        size='sm'
                        onClick={() => handleTogglePublish(course)}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='ml-auto text-red-600 hover:bg-red-50 hover:text-red-700'
                        onClick={() => setDeleteTarget(course)}
                        aria-label={`Hapus kursus ${course.title}`}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Library}
              title='Belum ada kursus'
              description={
                searchQuery
                  ? 'Coba kata kunci pencarian yang berbeda.'
                  : 'Buat kursus pertama Anda untuk memulai.'
              }
              action={
                !searchQuery ? (
                  <Button onClick={handleCreateCourse} disabled={creating}>
                    <Plus className='mr-1.5 h-4 w-4' />
                    Buat Kursus
                  </Button>
                ) : undefined
              }
            />
          )}
        </>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Hapus kursus?'
        description={
          deleteTarget
            ? `Yakin ingin menghapus kursus "${deleteTarget.title}"? Tindakan ini tidak dapat dibatalkan.`
            : undefined
        }
        confirmLabel='Hapus'
        destructive
        onConfirm={async () => {
          if (deleteTarget) await handleDeleteCourse(deleteTarget);
        }}
      />
    </div>
  );
}
