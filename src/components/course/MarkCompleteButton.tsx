'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

import { markChapterComplete } from '@/lib/api';
import { useCourseProgress } from '@/hooks/use-realtime';

import { BadgeAwardModal, PointsToast } from '@/components/gamification';
import { Button } from '@/components/ui/button';

import { CourseLayoutContext } from '@/app/(course)/course/[courseId]/CourseLayoutContext';
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
  const [badgeAwardEventToken, setBadgeAwardEventToken] = useState<string>('');

  const { contentItems, refreshContentItems } = useContext(CourseLayoutContext);
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
      const badges =
        result.badges ?? result.earnedBadges?.map((badge) => badge.id) ?? [];

      if (awarded > 0) {
        setToastPoints(awarded);
      }

      if (badges.length > 0) {
        setAwardedBadges(badges);
        setBadgeAwardEventToken(`${courseId}:${chapterId}:${Date.now()}`);
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
        triggerToken={badgeAwardEventToken}
        onClose={() => setShowBadgeModal(false)}
      />
      <Button onClick={handleMarkComplete} disabled={isLoading}>
        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
        <span>{isLoading ? 'Processing...' : 'Mark as Complete'}</span>
      </Button>
    </>
  );
};
