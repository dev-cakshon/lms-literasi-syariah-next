'use client';

import * as React from 'react';

import { ApiError, getCourses } from '@/lib/api';

import { LandingCourseCard } from './LandingCourseCard';
import UnstyledLink from '../links/UnstyledLink';

import type { Course } from '@/types';

const ICONS = ['account_balance', 'trending_up', 'volunteer_activism'] as const;

interface LandingCourse {
  id: string;
  title: string;
  iconName: string;
  duration: string;
  level?: 'Pemula' | 'Menengah' | 'Lanjutan';
  accessTier?: 'free' | 'premium';
  href: string;
}

function getLevelFromChapters(
  totalChapters?: number,
): 'Pemula' | 'Menengah' | 'Lanjutan' | undefined {
  if (!totalChapters || totalChapters <= 0) return undefined;
  if (totalChapters <= 5) return 'Pemula';
  if (totalChapters <= 9) return 'Menengah';
  return 'Lanjutan';
}

function toLandingCourse(course: Course, index: number): LandingCourse {
  const totalChapters = course.totalChapters ?? 0;

  return {
    id: course.id,
    title: course.title,
    iconName: ICONS[index % ICONS.length],
    duration: totalChapters > 0 ? `${totalChapters} Bab` : 'Materi tersedia',
    level: getLevelFromChapters(totalChapters),
    accessTier: course.accessTier,
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
    <section id='course' className='scroll-mt-20 bg-surface-soft py-24'>
      <div className='layout'>
        {/* Section Header */}
        <div className='flex items-end justify-between mb-12 gap-4 flex-wrap'>
          <div>
            <p className='text-primary-700 tracking-widest uppercase text-sm font-bold mb-3'>
              Mulai dari sini
            </p>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-dark'>
              Mulai Petualanganmu di Sini
            </h2>
          </div>
          <UnstyledLink
            href='/my-courses'
            className='text-primary-700 font-bold hover:text-primary-500 flex items-center gap-1 transition-colors flex-shrink-0'
          >
            Lihat Semua Kursus
            <span className='material-symbols-outlined text-base'>
              arrow_forward
            </span>
          </UnstyledLink>
        </div>

        {/* Courses Grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
          {loading && (
            <p className='col-span-full text-center text-on-surface-soft py-12'>
              Memuat kursus...
            </p>
          )}

          {!loading && error && (
            <p className='col-span-full text-center text-sm text-error-pop py-12'>
              {error}
            </p>
          )}

          {!loading && !error && courses.length === 0 && (
            <p className='col-span-full text-center text-on-surface-soft py-12'>
              Belum ada kursus yang dipublikasikan.
            </p>
          )}

          {courses.slice(0, 3).map((course, index) => (
            <LandingCourseCard
              key={course.id || index}
              id={course.id}
              title={course.title}
              iconName={course.iconName}
              duration={course.duration}
              level={course.level}
              accessTier={course.accessTier}
              href={course.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
