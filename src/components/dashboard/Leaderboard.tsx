'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { useLeaderboard } from '@/hooks/use-realtime';

import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';

import type { LeaderboardRowVariant } from './LeaderboardRow';
import { LeaderboardRow } from './LeaderboardRow';

import type { LeaderboardUser } from '@/types';

interface RankedLeaderboardUser extends LeaderboardUser {
  rank: number;
}

const PODIUM_VARIANTS: LeaderboardRowVariant[] = [
  'podium-gold',
  'podium-silver',
  'podium-bronze',
];

export const Leaderboard = () => {
  const { data, loading } = useLeaderboard();
  const { user } = useAuth();
  const currentUserUid = user?.uid ?? null;

  const leaderboardData = useMemo<RankedLeaderboardUser[]>(
    () => data.map((u, i) => ({ ...u, rank: i + 1 })),
    [data],
  );

  const currentUserEntry = useMemo(
    () =>
      currentUserUid
        ? (leaderboardData.find((u) => u.uid === currentUserUid) ?? null)
        : null,
    [currentUserUid, leaderboardData],
  );

  const showMyRank = currentUserEntry !== null && currentUserEntry.rank > 10;

  if (loading) {
    return (
      <div className='bg-[var(--color-tertiary-fixed)] rounded-[2rem] shadow-xl border border-[var(--color-tertiary-fixed)] overflow-hidden'>
        <div className='p-5 lg:p-6 border-b border-[var(--color-tertiary-fixed-dim)] bg-[var(--color-tertiary-fixed-dim)]'>
          <h2 className='text-xl font-bold text-[var(--color-on-primary-fixed-variant)]'>
            🏆 Leaderboard
          </h2>
        </div>
        <div className='p-5 lg:p-6 space-y-3 bg-[var(--color-tertiary-fixed)]'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-14 rounded-2xl' />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className='bg-[var(--color-tertiary-fixed)] rounded-[2rem] shadow-xl border border-[var(--color-tertiary-fixed)] overflow-hidden'>
        <div className='p-5 lg:p-6 border-b border-[var(--color-tertiary-fixed-dim)] bg-[var(--color-tertiary-fixed-dim)]'>
          <h2 className='text-xl font-bold text-[var(--color-on-primary-fixed-variant)]'>
            🏆 Leaderboard
          </h2>
        </div>
        <div className='p-5 lg:p-6 text-center py-8 text-gray-500 bg-[var(--color-tertiary-fixed)]'>
          <p>Belum ada data leaderboard.</p>
        </div>
      </div>
    );
  }

  const podiumRows = leaderboardData.slice(0, 3);
  const alwaysRows = leaderboardData.slice(3, 6);
  const extraRows = leaderboardData.slice(6, 10);

  return (
    <section className='bg-[var(--color-tertiary-fixed)] rounded-[2rem] shadow-xl border border-[var(--color-tertiary-fixed)] overflow-hidden @container'>
      <div className='p-5 lg:p-6 border-b border-[var(--color-tertiary-fixed-dim)] bg-[var(--color-tertiary-fixed-dim)]'>
        <h2 className='text-xl font-bold text-[var(--color-on-primary-fixed-variant)] flex items-center gap-2'>
          🏆 Leaderboard
        </h2>
      </div>

      <div className='p-5 lg:p-6 flex flex-col gap-3 bg-[var(--color-tertiary-fixed)]'>
        {podiumRows.map((entry) => (
          <LeaderboardRow
            key={entry.uid}
            user={entry}
            rank={entry.rank}
            variant={PODIUM_VARIANTS[(entry.rank - 1) as 0 | 1 | 2]}
            isCurrentUser={entry.uid === currentUserUid}
          />
        ))}

        {(alwaysRows.length > 0 || extraRows.length > 0) && (
          <div className='mt-1 space-y-1'>
            {alwaysRows.map((entry, idx) => (
              <motion.div
                key={entry.uid}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
              >
                <LeaderboardRow
                  user={entry}
                  rank={entry.rank}
                  variant='simplified'
                  isCurrentUser={entry.uid === currentUserUid}
                />
              </motion.div>
            ))}

            {extraRows.map((entry, idx) => (
              <motion.div
                key={entry.uid}
                className='hidden @[40rem]:block'
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (idx + alwaysRows.length) * 0.05,
                  duration: 0.2,
                }}
              >
                <LeaderboardRow
                  user={entry}
                  rank={entry.rank}
                  variant='simplified'
                  isCurrentUser={entry.uid === currentUserUid}
                />
              </motion.div>
            ))}
          </div>
        )}

        {showMyRank && currentUserEntry && (
          <>
            <div className='border-t border-dashed border-[var(--color-outline-variant)] my-1' />
            <p className='text-[10px] font-bold uppercase tracking-widest px-3 text-[var(--color-on-surface-soft)]'>
              Peringkatmu
            </p>
            <LeaderboardRow
              user={currentUserEntry}
              rank={currentUserEntry.rank}
              variant='me'
              isCurrentUser={true}
            />
          </>
        )}
      </div>
    </section>
  );
};
