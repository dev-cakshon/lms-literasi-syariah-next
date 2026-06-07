'use client';

import { useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, getCertificate, getQuizzes } from '@/lib/api';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import CourseCompletionBanner from '@/components/course/CourseCompletionBanner';
import CourseContentList from '@/components/course/CourseContentList';
import CourseOverviewHero from '@/components/course/CourseOverviewHero';
import CourseQuizList from '@/components/course/CourseQuizList';

import { CourseLayoutContext } from './CourseLayoutContext';

import type { Certificate, CourseContentItem, Quiz } from '@/types';

function routeFor(item: CourseContentItem, courseId: string): string {
  if (item.itemType === 'chapter')
    return `/course/${courseId}/chapter/${item.id}`;
  if (item.type === 'drag_drop')
    return `/course/${courseId}/activity/${item.id}/drag-drop`;
  if (item.type === 'word_search')
    return `/course/${courseId}/activity/${item.id}/word-search`;
  return `/course/${courseId}/activity/${item.id}/true-or-false`;
}

function deriveCtaInfo(
  items: CourseContentItem[],
  courseId: string,
): { label: string; href: string; disabled: boolean } {
  if (items.length === 0)
    return { label: 'Belum ada konten', href: '#', disabled: true };

  const anyCompleted = items.some((i) => i.completed);
  const allCompleted = items.every((i) => i.completed);

  if (allCompleted)
    return {
      label: 'Tinjau ulang materi',
      href: routeFor(items[0], courseId),
      disabled: false,
    };

  const next = items.find((i) => !i.locked && !i.completed);
  if (next) {
    const prefix = anyCompleted ? 'Lanjut belajar' : 'Mulai';
    return {
      label: `${prefix}: ${next.title}`,
      href: routeFor(next, courseId),
      disabled: false,
    };
  }

  return { label: 'Selesaikan materi sebelumnya', href: '#', disabled: true };
}

export default function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { contentItems, courseTitle, courseDescription } =
    useContext(CourseLayoutContext);

  const [courseId, setCourseId] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

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

  // Quizzes are NOT included in /content — fetch separately for the Evaluasi section.
  useEffect(() => {
    if (!courseId) return;
    getQuizzes(courseId)
      .then(setQuizzes)
      .catch((err: unknown) => {
        // Silently ignore missing quizzes; the section simply won't render.
        if (err instanceof ApiError && err.status === 404) return;
        console.error('Failed to load quizzes:', err);
      });
  }, [courseId]);

  const completedCount = useMemo(
    () => contentItems.filter((i) => i.completed).length,
    [contentItems],
  );

  const progressPercent = useMemo(
    () =>
      contentItems.length > 0
        ? Math.round((completedCount / contentItems.length) * 100)
        : 0,
    [completedCount, contentItems.length],
  );

  const chipState =
    progressPercent === 100
      ? 'completed'
      : progressPercent > 0
        ? 'inprogress'
        : 'fresh';

  const nextUpId = useMemo(
    () => contentItems.find((i) => !i.locked && !i.completed)?.id ?? null,
    [contentItems],
  );

  const cta = useMemo(
    () =>
      courseId
        ? deriveCtaInfo(contentItems, courseId)
        : { label: '...', href: '#', disabled: true },
    [contentItems, courseId],
  );

  return (
    <>
      {showCertModal && certificate && (
        <CourseCertificateModal
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
      <div className='mx-auto w-full max-w-5xl flex flex-col gap-8 p-4 md:p-8'>
        {certificate && (
          <CourseCompletionBanner onView={() => setShowCertModal(true)} />
        )}
        <CourseOverviewHero
          title={courseTitle}
          description={courseDescription}
          progressPercent={progressPercent}
          completedCount={completedCount}
          totalCount={contentItems.length}
          ctaLabel={cta.label}
          ctaHref={cta.href}
          ctaDisabled={cta.disabled}
          chipState={chipState}
        />
        {courseId && (
          <CourseContentList
            items={contentItems}
            courseId={courseId}
            nextUpId={nextUpId}
          />
        )}
        {/* Evaluasi: quizzes are fetched separately because /content excludes them */}
        {courseId && quizzes.length > 0 && (
          <CourseQuizList quizzes={quizzes} courseId={courseId} />
        )}
      </div>
    </>
  );
}
