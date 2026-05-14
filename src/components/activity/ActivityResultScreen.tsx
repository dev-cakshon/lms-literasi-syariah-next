'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ApiError, issueCertificate } from '@/lib/api';

import CourseCertificateModal from '@/components/course/CourseCertificateModal';
import { BadgeAwardModal } from '@/components/gamification';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, Certificate, SubmitActivityResponse } from '@/types';
import { BADGE_IDS } from '@/types';

function useCountUp(target: number, duration = 800): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

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
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const displayCount = useCountUp(result.score);

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

  const isPerfectScore = result.score === result.totalItems;

  useEffect(() => {
    if (!isPerfectScore) return;
    issueCertificate(courseId)
      .then((cert) => {
        setCertificate(cert);
        setShowCertModal(true);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.code === 'CERTIFICATE_NOT_ELIGIBLE')
          return;
        console.error('Certificate issuance failed:', err);
      });
  }, [isPerfectScore, courseId]);

  return (
    <>
      <BadgeAwardModal
        isOpen={showBadgeModal}
        badges={awardedBadges}
        onClose={() => setShowBadgeModal(false)}
      />
      {showCertModal && certificate && (
        <CourseCertificateModal
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}

      <div className='min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8'>
        <div className='w-full max-w-xl shadow-sm'>
          {/* Header zone */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-t-2xl px-8 py-10 text-center'
            style={{ background: 'linear-gradient(160deg, #174339 0%, #1e5548 100%)' }}
          >
            <p className='text-xs font-bold uppercase tracking-[1.2px] text-white/50'>
              Hasil Aktivitas
            </p>
            <h1 className='mt-3 text-6xl font-bold text-white'>
              {displayCount} / {result.totalItems}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className='mt-2 text-lg font-semibold text-white/70'
            >
              {result.scorePercent}%
            </motion.p>
          </motion.div>

          {/* Body zone */}
          <div className='rounded-b-2xl border border-t-0 bg-white px-8 py-6 space-y-4'>
            {result.pointsEarned > 0 && (
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='flex justify-center'
              >
                <span
                  className='rounded-full px-4 py-1.5 text-sm font-bold'
                  style={{
                    background: 'rgba(144,210,109,0.2)',
                    border: '1px solid rgba(144,210,109,0.35)',
                    color: '#174339',
                  }}
                >
                  ⚡ +{result.pointsEarned} XP
                </span>
              </motion.div>
            )}

            {isPerfectScore && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 300 }}
                className='flex justify-center'
              >
                <span className='rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800'>
                  Sempurna! ⭐
                </span>
              </motion.div>
            )}

            <div className='flex flex-col gap-3 sm:flex-row sm:justify-center pt-2'>
              <Button variant='outline' onClick={onRetry}>
                Coba Lagi
              </Button>
              <Button
                onClick={() => router.push(`/course/${courseId}`)}
                style={{ background: 'linear-gradient(160deg, #174339, #1e5548)' }}
                className='text-white hover:opacity-90'
              >
                Kembali ke Kursus
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
