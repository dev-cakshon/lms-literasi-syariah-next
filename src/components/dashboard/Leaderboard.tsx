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

import { LeaderboardRow } from './LeaderboardRow';

import type { Badge, LeaderboardUser } from '@/types';
import { BADGE_IDS } from '@/types';

interface LeaderboardProps {
  users?: unknown;
  loading?: unknown;
}

interface RankedLeaderboardUser extends LeaderboardUser {
  rank: number;
}

interface CurrentUserRankState {
  user: LeaderboardUser;
  rank: number;
}

const VALID_BADGES = new Set<string>(BADGE_IDS);

const isBadge = (value: unknown): value is Badge => {
  return typeof value === 'string' && VALID_BADGES.has(value);
};

const getSafeBadgeArray = (value: unknown): Badge[] => {
  if (!Array.isArray(value)) {
    return [];
  }
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

  const uidValue = parsed.uid;
  const nameValue = parsed.name;
  const pointsValue = parsed.totalPoints;
  const badgesValue = parsed.badges;

  return {
    uid: typeof uidValue === 'string' ? uidValue : fallbackUid,
    name: typeof nameValue === 'string' ? nameValue : '',
    totalPoints: typeof pointsValue === 'number' ? pointsValue : 0,
    badges: getSafeBadgeArray(badgesValue),
  };
};

export const Leaderboard = (_props: LeaderboardProps) => {
  const { data, loading } = useLeaderboard();
  const { user } = useAuth();
  const currentUserUid = user?.uid ?? null;
  const [currentUserRankState, setCurrentUserRankState] =
    useState<CurrentUserRankState | null>(null);

  const leaderboardData = useMemo<RankedLeaderboardUser[]>(
    () =>
      data.map((leaderboardUser, index) => ({
        ...leaderboardUser,
        rank: index + 1,
      })),
    [data],
  );

  const currentUserTopTenEntry = useMemo(
    () =>
      currentUserUid
        ? (leaderboardData.find(
            (leaderboardUser) => leaderboardUser.uid === currentUserUid,
          ) ?? null)
        : null,
    [currentUserUid, leaderboardData],
  );

  useEffect(() => {
    if (!currentUserUid || loading || currentUserTopTenEntry) {
      setCurrentUserRankState(null);
      return;
    }

    let active = true;

    const fetchCurrentUserRank = async () => {
      try {
        const db = getFirestoreInstance();
        const userRef = doc(db, 'users', currentUserUid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          if (active) {
            setCurrentUserRankState(null);
          }
          return;
        }

        const userData = mapUserDocToLeaderboardUser(
          userSnap.data(),
          userSnap.id,
        );

        const higherScoreQuery = query(
          collection(db, 'users'),
          where('totalPoints', '>', userData.totalPoints),
        );
        const higherScoreSnapshot = await getDocs(higherScoreQuery);
        const rank = higherScoreSnapshot.size + 1;

        if (active) {
          setCurrentUserRankState({
            user: userData,
            rank,
          });
        }
      } catch (err) {
        console.error('Leaderboard current user rank error:', err);
        if (active) {
          setCurrentUserRankState(null);
        }
      }
    };

    void fetchCurrentUserRank();

    return () => {
      active = false;
    };
  }, [currentUserUid, loading, currentUserTopTenEntry]);

  if (loading) {
    return (
      <div className='bg-white rounded-2xl p-5 border border-primary-100 shadow-elevated-1'>
        <h2 className='text-xl font-bold text-gray-800 mb-6'>Leaderboard</h2>
        <div className='space-y-3'>
          <Skeleton className='h-12 rounded-lg' />
          <Skeleton className='h-12 rounded-lg' />
          <Skeleton className='h-12 rounded-lg' />
          <Skeleton className='h-12 rounded-lg' />
          <Skeleton className='h-12 rounded-lg' />
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className='bg-white rounded-2xl p-5 border border-primary-100 shadow-elevated-1'>
        <h2 className='text-xl font-bold text-gray-800 mb-6'>Leaderboard</h2>
        <div className='text-center py-8 text-gray-500'>
          <p>Belum ada data leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-2xl p-5 border border-primary-100 shadow-elevated-1'>
      <h2 className='text-xl font-bold text-gray-800 mb-6'>Leaderboard</h2>

      <div className='space-y-2'>
        {leaderboardData.map((leaderboardUser, index) => (
          <motion.div
            key={leaderboardUser.uid}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
          >
            <LeaderboardRow
              user={leaderboardUser}
              rank={leaderboardUser.rank}
              isCurrentUser={
                currentUserUid !== null &&
                leaderboardUser.uid === currentUserUid
              }
            />
          </motion.div>
        ))}
      </div>

      {currentUserUid && !currentUserTopTenEntry && currentUserRankState ? (
        <div className='mt-4'>
          <div className='border-t border-dashed border-primary-300 mb-3' />
          <p className='text-xs text-primary-700 font-semibold mb-2'>
            Peringkatmu
          </p>
          <LeaderboardRow
            user={currentUserRankState.user}
            rank={currentUserRankState.rank}
            isCurrentUser={true}
          />
        </div>
      ) : null}
    </div>
  );
};
