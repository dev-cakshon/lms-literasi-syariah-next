'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getChapters, markChapterComplete } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import Button from '@/components/buttons/Button';
import { BadgeAwardModal, PointsToast } from '@/components/gamification';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge } from '@/types';

interface MarkCompleteButtonProps {
  courseId: string;
  chapterId: string;
}

export const MarkCompleteButton = ({
  courseId,
  chapterId,
}: MarkCompleteButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [toastPoints, setToastPoints] = useState(0);
  const [awardedBadges, setAwardedBadges] = useState<Badge[]>([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const { completedChapters } = useCourseProgress(courseId);
  const isCompleted = completedChapters.includes(chapterId);

  // Reset loading spinner when route changes (component persists in layout)
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
      const badges = result.badges ?? [];

      if (awarded > 0) {
        setToastPoints(awarded);
      }

      if (badges.length > 0) {
        setAwardedBadges(badges);
        setShowBadgeModal(true);
      }

      await refreshProfile();

      // Fetch chapters to find the next one
      const chapters = await getChapters(courseId);
      const sortedChapters = [...chapters].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      const currentIndex = sortedChapters.findIndex(
        (ch) => ch.id === chapterId
      );
      const nextPath =
        currentIndex !== -1 && currentIndex < sortedChapters.length - 1
          ? `/course/${courseId}/chapter/${sortedChapters[currentIndex + 1].id}`
          : `/course/${courseId}`;
      setIsLoading(false);

      if (awarded > 0) {
        setTimeout(() => {
          router.push(nextPath);
        }, 1600);
      } else {
        router.push(nextPath);
      }
    } catch (error) {
      console.error('Error marking as complete:', error);
      alert('Failed to mark as complete');
      setIsLoading(false);
    }
  };

  // Hide button if already completed
  if (isCompleted) return null;

  return (
    <>
      <PointsToast points={toastPoints} isOpen={toastPoints > 0} />
      <BadgeAwardModal
        isOpen={showBadgeModal}
        badges={awardedBadges}
        onClose={() => setShowBadgeModal(false)}
      />
      <Button onClick={handleMarkComplete} isLoading={isLoading}>
        Mark as Complete
      </Button>
    </>
  );
};
