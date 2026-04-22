'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { BadgeAwardModal } from '@/components/gamification';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, SubmitActivityResponse } from '@/types';
import { BADGE_IDS } from '@/types';

interface ActivityResultScreenProps {
  result: SubmitActivityResponse;
  courseId: string;
  onRetry: () => void;
}

export const ActivityResultScreen = ({
  result,
  courseId,
  onRetry,
}: ActivityResultScreenProps) => {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const awardedBadges = useMemo<Badge[]>(() => {
    const validBadges = new Set<string>(BADGE_IDS);
    return (result.earnedBadges ?? [])
      .map((badge) => badge.id)
      .filter(
        (badgeId): badgeId is Badge =>
          typeof badgeId === 'string' && validBadges.has(badgeId),
      );
  }, [result.earnedBadges]);

  useEffect(() => {
    void refreshProfile();
    // Intentionally run once on mount for result sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShowBadgeModal(awardedBadges.length > 0);
  }, [awardedBadges]);

  const isPerfectScore = result.score === result.maxPoints;

  return (
    <>
      <BadgeAwardModal
        isOpen={showBadgeModal}
        badges={awardedBadges}
        onClose={() => setShowBadgeModal(false)}
      />

      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-xl rounded-2xl border bg-white p-8 shadow-sm'>
          <div className='text-center'>
            <p className='text-sm font-medium uppercase tracking-wide text-muted-foreground'>
              Hasil Aktivitas
            </p>
            <h1 className='mt-3 text-5xl font-bold text-slate-900'>
              {result.score} / {result.maxPoints}
            </h1>
            <p className='mt-2 text-lg font-medium text-slate-600'>
              {result.scorePercent}%
            </p>
          </div>

          {result.pointsEarned > 0 && (
            <div className='mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-green-800'>
              Kamu mendapat +{result.pointsEarned} poin! 🎉
            </div>
          )}

          {isPerfectScore && (
            <div className='mt-4 flex justify-center'>
              <span className='inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800'>
                Sempurna! ⭐
              </span>
            </div>
          )}

          <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center'>
            <Button variant='outline' onClick={onRetry}>
              Coba Lagi
            </Button>
            <Button onClick={() => router.push(`/course/${courseId}`)}>
              Kembali ke Kursus
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
