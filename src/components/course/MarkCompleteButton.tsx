'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

import { ApiError, issueCertificate, markChapterComplete } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { BadgeAwardModal, PointsToast } from '@/components/gamification';
import { Button } from '@/components/ui/button';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

import type { Badge, Certificate } from '@/types';

interface MarkCompleteButtonProps {
  courseId: string;
  chapterId: string;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const MarkCompleteButton = ({
  courseId,
  chapterId,
  className,
  label,
  style,
}: MarkCompleteButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [toastPoints, setToastPoints] = useState(0);
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
    setToastPoints(0);
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
        setToastPoints(awarded);
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
      <PointsToast points={toastPoints} isOpen={toastPoints > 0} />
      <BadgeAwardModal
        isOpen={showBadgeModal}
        badges={awardedBadges}
        onClose={() => setShowBadgeModal(false)}
      />
      <Button onClick={handleMarkComplete} disabled={isLoading} className={className} style={style}>
        {isLoading ? (
          <>
            <Loader2 className='animate-spin h-4 w-4 mr-2' />
            Loading...
          </>
        ) : (
          label ?? 'Mark as Complete'
        )}
      </Button>
    </>
  );
};
