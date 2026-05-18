'use client';

import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { ApiError, getCourseProgressApi, getCourses } from '@/lib/api';
import { useMyCertificates } from '@/hooks/use-certificates';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { MyCourseCard } from '@/components/course-list/MyCourseCard';

import type { Certificate, Course } from '@/types';

export default function MyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);

  const { certificates } = useMyCertificates();

  const certByCourseId = useMemo(
    () => Object.fromEntries(certificates.map((c) => [c.courseId, c])),
    [certificates],
  );

  useEffect(() => {
    let active = true;

    const fetchMyCoursesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allCourses = await getCourses();

        if (!active) return;

        setCourses(allCourses);

        const results = await Promise.allSettled(
          allCourses.map((c) => getCourseProgressApi(c.id)),
        );

        if (!active) return;

        const map: Record<string, number> = {};
        results.forEach((result, i) => {
          map[allCourses[i].id] =
            result.status === 'fulfilled' ? (result.value.percentage ?? 0) : 0;
        });
        setProgressMap(map);
      } catch (err) {
        if (!active) return;

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

  const filteredCourses = useMemo(
    () =>
      courses
        .filter((course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .map((course) => ({
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.thumbnailUrl ?? course.imageUrl ?? null,
          chaptersLength: course.totalChapters ?? 0,
          activities: course.totalActivities,
          progress: progressMap[course.id] ?? 0,
        })),
    [courses, searchQuery, progressMap],
  );

  return (
    <div className='min-h-full bg-surface-soft'>
      {/* Hero */}
      <section className='relative h-[280px] w-full bg-primary-500 overflow-hidden flex items-center px-4 sm:px-6 lg:px-8'>
        <div
          className='absolute top-[-100px] left-[-50px] w-[300px] h-[300px] bg-white/10 rounded-full blur-[100px] opacity-30'
          style={{ animation: 'floatBlob 7s ease-in-out infinite' }}
        />
        <div
          className='absolute bottom-[-150px] right-[-50px] w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] opacity-20'
          style={{ animation: 'floatBlob 10s ease-in-out infinite reverse' }}
        />

        <div className='relative z-10 w-full max-w-[80rem] mx-auto flex flex-col md:flex-row justify-between items-center gap-6'>
          <div>
            <h1 className='font-display text-3xl md:text-5xl font-bold text-white mb-2'>
              Kursus Saya
            </h1>
            <p className='text-lg text-white/90'>
              Lanjutkan misi belajar dan raih berkah finansial Anda.
            </p>
          </div>

          <div className='w-full md:w-[450px]'>
            <div className='bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center px-5 py-4 shadow-2xl focus-within:bg-white/20 transition-all group'>
              <Search className='w-5 h-5 text-white/70 mr-3 shrink-0 group-focus-within:text-white transition-colors' />
              <input
                type='text'
                placeholder='Cari kursus yang sedang Anda ikuti...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='bg-transparent border-none text-white placeholder:text-white/60 w-full focus:outline-none focus:ring-0 p-0 text-sm'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className='max-w-[80rem] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16'>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='h-[440px] rounded-3xl bg-white border border-surface-variant/50 animate-pulse'
              />
            ))}
          </div>
        ) : error ? (
          <div className='rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 gap-4 text-on-surface-soft'>
            <Search className='w-12 h-12 opacity-30' />
            <p className='text-sm font-medium'>Tidak ada kursus ditemukan</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
            {filteredCourses.map((course) => (
              <MyCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                imageUrl={course.imageUrl}
                chaptersLength={course.chaptersLength}
                activities={course.activities}
                progress={course.progress}
                onViewCertificate={
                  course.progress >= 100 && certByCourseId[course.id]
                    ? () =>
                        setSelectedCertificate(
                          certByCourseId[course.id] ?? null,
                        )
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </main>

      {selectedCertificate && (
        <CourseCertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
