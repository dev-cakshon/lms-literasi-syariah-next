'use client';

import { CheckSquare, Grid2X2, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';

import {
  ApiError,
  getCertificate,
  getCourse,
  getCourseContent,
} from '@/lib/api';
import { cn } from '@/lib/utils';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { CourseSidebarItem } from '@/components/course/CourseSidebarItem';
import { ProgressRing } from '@/components/dashboard/ProgressRing';

import type { Certificate, Course, CourseContentItem } from '@/types';

export default function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [contentItems, setContentItems] = useState<CourseContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  useEffect(() => {
    if (!courseId) return;
    const resolvedCourseId = courseId;

    async function loadOverviewData() {
      try {
        const [courseData, courseContentData] = await Promise.all([
          getCourse(resolvedCourseId),
          getCourseContent(resolvedCourseId),
        ]);

        setCourse(courseData);
        setContentItems(courseContentData);
      } catch (err) {
        console.error('Failed to load course overview:', err);
        setError('Gagal memuat kursus');
      } finally {
        setLoading(false);
      }
    }

    loadOverviewData();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    getCertificate(courseId)
      .then((cert) => setCertificate(cert))
      .catch((err: unknown) => {
        if (
          err instanceof ApiError &&
          (err.code === 'CERTIFICATE_NOT_FOUND' || err.status === 404)
        )
          return;
        console.error('Failed to load certificate:', err);
      });
  }, [courseId]);

  const sortedContentItems = useMemo(
    () => [...contentItems].sort((a, b) => a.position - b.position),
    [contentItems],
  );

  const completedCount = sortedContentItems.filter(
    (item) => item.completed,
  ).length;

  if (error) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Memuat kursus...</p>
      </div>
    );
  }

  if (!courseId || !course) {
    return (
      <div className='h-full flex items-center justify-center'>
        <p className='text-muted-foreground'>Kursus tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <>
      {showCertModal && certificate && (
        <CourseCertificateModal
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
      <div className='mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8'>
        <section className='rounded-(--radius-card) border bg-white p-6 shadow-(--shadow-elevated-1)'>
          <h1 className='font-display text-3xl font-bold text-slate-900 tracking-tight md:text-4xl'>
            {course.title}
          </h1>
          <p className='mt-3 text-sm text-slate-600 md:text-base'>
            {course.description || 'Deskripsi kursus belum tersedia.'}
          </p>
          <div className='mt-4 flex items-center gap-4'>
            <ProgressRing
              percentage={
                sortedContentItems.length > 0
                  ? Math.round(
                      (completedCount / sortedContentItems.length) * 100,
                    )
                  : 0
              }
              size={64}
              strokeWidth={5}
            >
              <span className='text-xs font-bold text-primary-700'>
                {sortedContentItems.length > 0
                  ? Math.round(
                      (completedCount / sortedContentItems.length) * 100,
                    )
                  : 0}
                %
              </span>
            </ProgressRing>
            <p className='text-sm font-medium text-slate-700'>
              {completedCount}/{sortedContentItems.length} konten selesai
            </p>
          </div>
          {certificate && (
            <button
              onClick={() => setShowCertModal(true)}
              className='mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors'
            >
              Lihat Sertifikat
            </button>
          )}
        </section>

        <section className='rounded-lg border bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-slate-900'>
              Daftar Konten
            </h2>
            <span className='text-sm text-slate-500'>
              Urut berdasarkan materi
            </span>
          </div>

          {sortedContentItems.length === 0 ? (
            <p className='text-sm text-slate-500'>
              Belum ada konten yang tersedia.
            </p>
          ) : (
            <div className='overflow-hidden rounded-md border'>
              {sortedContentItems.map((item) => {
                if (item.itemType === 'chapter') {
                  return (
                    <CourseSidebarItem
                      key={item.id}
                      id={item.id}
                      courseId={courseId}
                      label={`${item.position}. ${item.title}`}
                      isCompleted={item.completed}
                      isLocked={item.locked}
                      type='chapter'
                      position={item.position}
                    />
                  );
                }

                const activityLabelPrefix = `${item.position}.`;
                const ActivityIcon =
                  item.type === 'drag_drop'
                    ? Grid2X2
                    : item.type === 'word_search'
                      ? Search
                      : CheckSquare;
                const bestScorePercent = item.bestScorePercent ?? 0;
                const activityHref =
                  item.type === 'drag_drop'
                    ? `/course/${courseId}/drag-drop/${item.id}`
                    : item.type === 'word_search'
                      ? `/course/${courseId}/activity/${item.id}/word-search`
                      : `/course/${courseId}/activity/${item.id}/true-or-false`;

                const activityContent = (
                  <>
                    <ActivityIcon
                      size={22}
                      className={cn(
                        'text-slate-500',
                        item.completed && 'text-primary-700',
                      )}
                    />
                    <span>{`${activityLabelPrefix} ${item.title}`}</span>
                    {bestScorePercent > 0 && (
                      <span className='ml-auto text-xs font-medium text-primary-700 bg-primary-50 rounded px-2 py-0.5'>
                        {bestScorePercent}%
                      </span>
                    )}
                  </>
                );

                if (item.locked) {
                  return (
                    <div
                      key={item.id}
                      className='flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 py-4 opacity-50 cursor-not-allowed'
                    >
                      {activityContent}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={activityHref}
                    className={cn(
                      'flex items-center gap-x-2 text-slate-500 text-sm font-medium pl-6 py-4 transition-all hover:text-slate-600 hover:bg-slate-300/20',
                      item.completed &&
                        'text-primary-700 hover:text-primary-700',
                    )}
                  >
                    {activityContent}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
