'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import { getFirestoreInstance } from '@/lib/firebase';
import { useLeaderboard } from '@/hooks/use-realtime';

import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';

import type { LeaderboardRowVariant } from './LeaderboardRow';
import { LeaderboardRow } from './LeaderboardRow';

import type { Badge, LeaderboardUser } from '@/types';
import { BADGE_IDS } from '@/types';

interface RankedLeaderboardUser extends LeaderboardUser {
  rank: number;
}

interface CurrentUserRankState {
  user: LeaderboardUser;
  rank: number;
}

const VALID_BADGES = new Set<string>(BADGE_IDS);

const isBadge = (value: unknown): value is Badge =>
  typeof value === 'string' && VALID_BADGES.has(value);

const getSafeBadgeArray = (value: unknown): Badge[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Badge => isBadge(item));
};

const mapUserDocToLeaderboardUser = (
  raw: unknown,
  fallbackUid: string,
): LeaderboardUser => {
  const parsed =
    typeof raw === 'object' && raw !== null
      ? (raw as Record<string, unknown>)
      : {};
  return {
    uid: typeof parsed.uid === 'string' ? parsed.uid : fallbackUid,
    name: typeof parsed.name === 'string' ? parsed.name : '',
    totalPoints:
      typeof parsed.totalPoints === 'number' ? parsed.totalPoints : 0,
    badges: getSafeBadgeArray(parsed.badges),
  };
};

const PODIUM_VARIANTS: LeaderboardRowVariant[] = [
  'podium-gold',
  'podium-silver',
  'podium-bronze',
];

export const Leaderboard = () => {
  const { data, loading } = useLeaderboard();
  const { user } = useAuth();
  const currentUserUid = user?.uid ?? null;
  const [currentUserRankState, setCurrentUserRankState] =
    useState<CurrentUserRankState | null>(null);

  const leaderboardData = useMemo<RankedLeaderboardUser[]>(
    () => data.map((u, i) => ({ ...u, rank: i + 1 })),
    [data],
  );

  const currentUserTopEntry = useMemo(
    () =>
      currentUserUid
        ? (leaderboardData.find((u) => u.uid === currentUserUid) ?? null)
        : null,
    [currentUserUid, leaderboardData],
  );

  useEffect(() => {
    if (!currentUserUid || loading || currentUserTopEntry) {
      setCurrentUserRankState(null);
      return;
    }

    let active = true;

    const fetchRank = async () => {
      try {
        const db = getFirestoreInstance();
        const userSnap = await getDoc(doc(db, 'users', currentUserUid));
        if (!userSnap.exists()) return;

        const userData = mapUserDocToLeaderboardUser(
          userSnap.data(),
          userSnap.id,
        );
        const higherQuery = query(
          collection(db, 'users'),
          where('totalPoints', '>', userData.totalPoints),
        );
        const higherSnap = await getDocs(higherQuery);
        if (active) {
          setCurrentUserRankState({
            user: userData,
            rank: higherSnap.size + 1,
          });
        }
      } catch (err) {
        console.error('Leaderboard rank fetch error:', err);
      }
    };

    void fetchRank();
    return () => {
      active = false;
    };
  }, [currentUserUid, loading, currentUserTopEntry]);

  if (loading) {
    return (
      <div className='bg-white rounded-[2rem] shadow-xl border border-[var(--color-surface-container-low)] overflow-hidden'>
        <div className='p-5 lg:p-6 border-b border-[var(--color-surface-container-low)] bg-white'>
          <h2 className='text-xl font-bold text-[var(--color-on-surface)]'>
            🏆 Leaderboard
          </h2>
        </div>
        <div className='p-5 lg:p-6 space-y-3 bg-white'>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className='h-14 rounded-2xl' />
          ))}
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className='bg-white rounded-[2rem] shadow-xl border border-[var(--color-surface-container-low)] overflow-hidden'>
        <div className='p-5 lg:p-6 border-b border-[var(--color-surface-container-low)] bg-white'>
          <h2 className='text-xl font-bold text-[var(--color-on-surface)]'>
            🏆 Leaderboard
          </h2>
        </div>
        <div className='p-5 lg:p-6 text-center py-8 text-gray-500 bg-white'>
          <p>Belum ada data leaderboard.</p>
        </div>
      </div>
    );
  }

  const podiumRows = leaderboardData.slice(0, 3);
  const alwaysRows = leaderboardData.slice(3, 6);
  const extraRows = leaderboardData.slice(6, 10);

  const rankState = currentUserTopEntry
    ? { user: currentUserTopEntry, rank: currentUserTopEntry.rank }
    : currentUserRankState;

  return (
    <section className='bg-white rounded-[2rem] shadow-xl border border-[var(--color-surface-container-low)] overflow-hidden @container'>
      <div className='p-5 lg:p-6 border-b border-[var(--color-surface-container-low)] bg-white'>
        <h2 className='text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2'>
          🏆 Leaderboard
        </h2>
      </div>

      <div className='p-5 lg:p-6 flex flex-col gap-3 bg-white'>
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

        {rankState && rankState.user.uid !== currentUserTopEntry?.uid && (
          <>
            <div className='border-t border-dashed border-[var(--color-outline-variant)] my-1' />
            <p className='text-[10px] font-bold uppercase tracking-widest px-3 text-[var(--color-on-surface-soft)]'>
              Peringkatmu
            </p>
            <LeaderboardRow
              user={rankState.user}
              rank={rankState.rank}
              variant='me'
              isCurrentUser={true}
            />
          </>
        )}
      </div>
    </section>
  );
};
