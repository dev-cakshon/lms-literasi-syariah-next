'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

import { ApiError, issueCertificate, markChapterComplete } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { BadgeAwardModal } from '@/components/gamification';
import { Button } from '@/components/ui/button';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

import type { Badge, Certificate } from '@/types';

interface MarkCompleteButtonProps {
  courseId: string;
  chapterId: string;
  onComplete: (points: number) => void;
}

export const MarkCompleteButton = ({
  courseId,
  chapterId,
  onComplete,
}: MarkCompleteButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [awardedBadges, setAwardedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const pendingNavRef = useRef<string>('');

  const { contentItems, refreshContentItems } = useContext(CourseLayoutContext);
  const { completedChapters } = useCourseProgress(courseId);
  const isCompleted = completedChapters.includes(chapterId);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname, courseId, chapterId]);

  const handleMarkComplete = async () => {
    if (!user) {
      alert('Please login to mark as complete');
      return;
    }

    setIsLoading(true);
    try {
      const result = await markChapterComplete(courseId, chapterId);
      const awarded = result.pointsAwarded ?? 0;
      const badges =
        result.badges ?? result.earnedBadges?.map((badge) => badge.id) ?? [];

      if (awarded > 0) {
        onComplete(awarded);
      }

      if (badges.length > 0) {
        setAwardedBadges(badges);
        setShowBadgeModal(true);
      }

      const currentIndex = contentItems.findIndex(
        (item) => item.id === chapterId,
      );
      const nextItem =
        currentIndex !== -1 && currentIndex < contentItems.length - 1
          ? contentItems[currentIndex + 1]
          : null;
      const nextPath = nextItem
        ? nextItem.itemType === 'chapter'
          ? `/course/${courseId}/chapter/${nextItem.id}`
          : `/course/${courseId}/activity/${nextItem.id}/${
              nextItem.type === 'drag_drop'
                ? 'drag-drop'
                : nextItem.type === 'word_search'
                  ? 'word-search'
                  : 'true-or-false'
            }`
        : `/course/${courseId}`;

      await refreshProfile();
      refreshContentItems();
      setIsLoading(false);

      let certIssued = false;
      if (result.percentage === 100) {
        try {
          const cert = await issueCertificate(courseId);
          setCertificate(cert);
          pendingNavRef.current = nextPath;
          setShowCertModal(true);
          certIssued = true;
        } catch (err: unknown) {
          if (
            !(
              err instanceof ApiError && err.code === 'CERTIFICATE_NOT_ELIGIBLE'
            )
          ) {
            console.error('Certificate issuance failed:', err);
          }
        }
      }

      if (!certIssued) {
        if (awarded > 0) {
          setTimeout(() => {
            router.push(nextPath);
          }, 1600);
        } else {
          router.push(nextPath);
        }
      }
    } catch (error) {
      console.error('Error marking as complete:', error);
      alert('Failed to mark as complete');
      setIsLoading(false);
    }
  };

  if (showCertModal && certificate) {
    return (
      <CourseCertificateModal
        certificate={certificate}
        onClose={() => {
          setShowCertModal(false);
          router.push(pendingNavRef.current);
        }}
      />
    );
  }

  if (isCompleted) return null;

  return (
    <>
      <BadgeAwardModal
        isOpen={showBadgeModal}
        badges={awardedBadges}
        onClose={() => setShowBadgeModal(false)}
      />
      <Button
        onClick={handleMarkComplete}
        disabled={isLoading}
        className='bg-[#306b11] text-white text-sm font-bold tracking-[0.05em] rounded-xl px-8 py-4 shadow-[0_4px_0_0_#1d5200] hover:-translate-y-1 hover:shadow-[0_6px_0_0_#1d5200] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 h-auto'
      >
        {isLoading ? (
          <>
            <Loader2 className='animate-spin h-4 w-4' />
            Memuat...
          </>
        ) : (
          <>
            <CheckCircle className='h-4 w-4' />
            Tandai Bab Selesai
          </>
        )}
      </Button>
    </>
  );
};
