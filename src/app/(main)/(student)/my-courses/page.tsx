'use client';

import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ApiError, getCourses, getMyEnrollments } from '@/lib/api';

import { CourseList } from '@/components/course-list/CourseList';

import type { Course, Enrollment } from '@/types';

interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
}

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchMyCoursesData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [myEnrollments, allCourses] = await Promise.all([
          getMyEnrollments(),
          getCourses(),
        ]);

        if (!active) {
          return;
        }

        setEnrollments(myEnrollments);
        setCourses(allCourses);
      } catch (err) {
        if (!active) {
          return;
        }

        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Gagal memuat data kursus Anda.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchMyCoursesData();

    return () => {
      active = false;
    };
  }, []);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((enrollment) => enrollment.courseId)),
    [enrollments]
  );

  const coursesWithStatus = useMemo<CourseWithEnrollment[]>(
    () =>
      courses.map((course) => ({
        ...course,
        isEnrolled: enrolledIds.has(course.id),
      })),
    [courses, enrolledIds]
  );

  const filteredCourses = useMemo(
    () =>
      coursesWithStatus
        .filter((course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.thumbnailUrl ?? course.imageUrl ?? null,
          chaptersLength: course.totalChapters ?? 0,
          isPublished: course.isPublished,
          locked: !course.isEnrolled,
        })),
    [coursesWithStatus, searchQuery]
  );

  return (
    <div className='min-h-full bg-linear-to-br from-slate-50 to-gray-100'>
      {/* Search Bar */}
      <div className='bg-primary-600 px-6 py-6'>
        <div className='max-w-4xl mx-auto flex items-center gap-3'>
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

      {/* Content */}
      <div className='max-w-7xl mx-auto p-6 lg:p-8 space-y-6'>
        {loading ? (
          <div className='grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className='h-64 rounded-xl border bg-white animate-pulse'
              />
            ))}
          </div>
        ) : error ? (
          <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
            {error}
          </div>
        ) : (
          <CourseList items={filteredCourses} />
        )}
      </div>
    </div>
  );
}
