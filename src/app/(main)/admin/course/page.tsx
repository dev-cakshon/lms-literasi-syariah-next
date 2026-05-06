'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import {
  ApiError,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '@/lib/api';

import { CourseCard } from '@/components/course-list/CourseCard';

import type { Course } from '@/types';

export default function AdminCoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      const data = await getCourses();
      const sorted = [...data].sort((a, b) => {
        const ad = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bd = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bd - ad;
      });
      setCourses(sorted);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memuat kursus.');
      }
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
      setError(null);
      const newCourse = await createCourse({
        title: 'Kursus Baru',
        isPublished: false,
      });
      router.push(`/admin/course/${newCourse.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal membuat kursus baru.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      setError(null);
      const updated = await updateCourse(course.id, {
        isPublished: !course.isPublished,
      });
      setCourses((prev) =>
        prev.map((item) =>
          item.id === course.id
            ? {
                ...item,
                ...updated,
              }
            : item,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal memperbarui status publikasi kursus.');
      }
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kursus "${course.title}"?`,
    );
    if (!confirmed) return;

    try {
      setError(null);
      await deleteCourse(course.id);
      setCourses((prev) => prev.filter((item) => item.id !== course.id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Gagal menghapus kursus.');
      }
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='min-h-full bg-linear-to-b from-primary-600 via-primary-50 to-ivory'>
      {/* Header + Search Bar */}
      <div className='bg-primary-600 px-6 py-6'>
        <div className='max-w-4xl mx-auto space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-display text-3xl font-bold text-white tracking-tight mb-1'>
                Kelola Kursus
              </h1>
              <p className='text-primary-100'>
                Buat, edit, dan kelola kursus ekonomi syariah Anda di sini.
              </p>
            </div>
            <button
              onClick={handleCreateCourse}
              disabled={creating}
              className='bg-white hover:bg-gray-50 text-primary-700 font-semibold px-5 py-2.5 rounded-[var(--radius-control)] shadow-[var(--shadow-elevated-1)] transition flex items-center gap-2 cursor-pointer disabled:opacity-50'
            >
              <Plus className='w-4 h-4' />
              {creating ? 'Membuat...' : 'Buat Kursus Baru'}
            </button>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex-1 relative'>
              <input
                type='text'
                placeholder='Cari kursus'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full rounded-full px-5 py-3 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300'
              />
            </div>
            <button className='bg-primary-800 hover:bg-primary-900 text-white font-semibold px-6 py-3 rounded-full transition flex items-center gap-2 cursor-pointer'>
              <Search className='w-4 h-4' />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {error && <p className='text-sm text-red-600'>{error}</p>}
        {loading ? (
          <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='h-64 rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-elevated-1)] animate-pulse'
              />
            ))}
          </div>
        ) : (
          <>
            <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title || 'Kursus Tanpa Judul'}
                  description={course.description}
                  imageUrl={course.thumbnailUrl || null}
                  chaptersLength={course.totalChapters || 0}
                  isPublished={course.isPublished}
                  editUrl={`/admin/course/${course.id}`}
                  actions={
                    <div className='p-4 flex flex-wrap gap-2'>
                      <Link
                        href={`/admin/course/${course.id}`}
                        className='text-sm font-medium px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50'
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className='text-sm font-medium px-3 py-2 rounded-md border border-primary-300 text-primary-700 hover:bg-primary-50 cursor-pointer'
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        className='text-sm font-medium px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 cursor-pointer'
                      >
                        Delete
                      </button>
                    </div>
                  }
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className='text-center text-sm text-muted-foreground mt-10'>
                Tidak ada kursus ditemukan
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
