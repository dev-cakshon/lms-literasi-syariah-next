'use client';

import * as React from 'react';

import { ApiError, getCourses } from '@/lib/api';

import { LandingCourseCard } from './LandingCourseCard';
import ButtonLink from '../links/ButtonLink';

import type { Course } from '@/types';

interface LandingCourse {
  id: string;
  title: string;
  illustration: React.ReactNode;
  duration: string;
  modules?: string;
  href: string;
}

function getLevelFromChapters(totalChapters?: number): string | undefined {
  if (!totalChapters || totalChapters <= 0) return undefined;
  if (totalChapters <= 5) return 'Pemula';
  if (totalChapters <= 9) return 'Menengah';
  return 'Lanjutan';
}

function toLandingCourse(course: Course): LandingCourse {
  const totalChapters = course.totalChapters ?? 0;

  return {
    id: course.id,
    title: course.title,
    illustration: (
      <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50 text-primary-700'>
        <span className='text-sm font-bold'>Kursus</span>
      </div>
    ),
    duration: totalChapters > 0 ? `${totalChapters} Bab` : 'Materi tersedia',
    modules: getLevelFromChapters(totalChapters),
    href: `/course/${course.id}`,
  };
}

export const CourseSection = () => {
  const [courses, setCourses] = React.useState<LandingCourse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError(null);

        const allCourses = await getCourses();
        const publishedCourses = allCourses
          .filter((course) => course.isPublished === true)
          .map(toLandingCourse);

        if (isMounted) {
          setCourses(publishedCourses);
        }
      } catch (err) {
        if (!isMounted) return;

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Gagal memuat kursus.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id='course' className='bg-white py-20'>
      <div className='layout'>
        {/* Section Header */}
        <div className='mb-12 text-center'>
          <h2 className='mb-3 text-3xl font-bold text-dark md:text-4xl'>
            Kursus Ekonomi Syariah Unggulan
          </h2>
          <p className='text-lg text-gray-600'>
            Pelajari prinsip ekonomi Islam dari dasar hingga penerapan praktis
            di industri keuangan syariah
          </p>
        </div>

        {/* Courses Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:gap-8'>
          {loading && (
            <p className='col-span-full text-center text-gray-600'>
              Memuat kursus...
            </p>
          )}

          {!loading && error && (
            <p className='col-span-full text-center text-sm text-red-600'>
              {error}
            </p>
          )}

          {!loading && !error && courses.length === 0 && (
            <p className='col-span-full text-center text-gray-600'>
              Belum ada kursus yang dipublikasikan.
            </p>
          )}

          {courses.map((course, index) => (
            <LandingCourseCard
              key={course.id || index}
              title={course.title}
              illustration={course.illustration}
              duration={course.duration}
              modules={course.modules}
              href={course.href}
            />
          ))}
        </div>

        {/* Bottom CTA - View All Courses */}
        <div className='mt-12 text-center'>
          <ButtonLink href='/course'>Lihat Semua Kursus</ButtonLink>
        </div>
      </div>
    </section>
  );
};
