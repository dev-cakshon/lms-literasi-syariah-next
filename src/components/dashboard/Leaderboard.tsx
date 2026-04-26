import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Medal, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { getFirestoreInstance } from '@/lib/firebase';
import { useLeaderboard } from '@/hooks/use-realtime';

import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className='w-5 h-5 text-yellow-500' />;
      case 2:
        return <Medal className='w-5 h-5 text-gray-400' />;
      case 3:
        return <Medal className='w-5 h-5 text-amber-600' />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400 text-white';
      case 2:
        return 'bg-gray-300 text-white';
      case 3:
        return 'bg-amber-500 text-white';
      default:
        return 'bg-primary-100 text-primary-700';
    }
  };

  if (loading) {
    return (
      <div className='bg-primary-200/40 rounded-2xl p-6 lg:p-8'>
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
      <div className='bg-primary-200/40 rounded-2xl p-6 lg:p-8'>
        <h2 className='text-xl font-bold text-gray-800 mb-6'>Leaderboard</h2>
        <div className='text-center py-8 text-gray-500'>
          <p>Belum ada data leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-primary-200/40 rounded-2xl p-6 lg:p-8'>
      <h2 className='text-xl font-bold text-gray-800 mb-6'>Leaderboard</h2>

      <div className='overflow-hidden rounded-xl'>
        <table className='w-full'>
          <thead>
            <tr className='bg-primary-600 text-white text-sm'>
              <th className='py-3 px-4 text-left font-semibold'>Rank</th>
              <th className='py-3 px-4 text-left font-semibold'>Nama</th>
              <th className='py-3 px-4 text-right font-semibold'>Poin</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((leaderboardUser, index) => {
              const isCurrentUser =
                currentUserUid !== null &&
                leaderboardUser.uid === currentUserUid;

              return (
                <tr
                  key={leaderboardUser.uid}
                  className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                    isCurrentUser
                      ? 'bg-primary-100'
                      : index % 2 === 0
                        ? 'bg-white'
                        : 'bg-gray-100/80'
                  }`}
                >
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(
                          leaderboardUser.rank,
                        )}`}
                      >
                        {leaderboardUser.rank <= 3
                          ? getRankIcon(leaderboardUser.rank)
                          : leaderboardUser.rank}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm'>
                        {leaderboardUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className='font-medium text-gray-800'>
                        {leaderboardUser.name}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <span className='font-bold text-primary-600'>
                      {leaderboardUser.totalPoints.toLocaleString()}
                    </span>
                  </td>
                </tr>
              );
            })}

            {currentUserUid &&
            !currentUserTopTenEntry &&
            currentUserRankState ? (
              <>
                <tr>
                  <td colSpan={3} className='py-2 px-4'>
                    <div className='border-t border-dashed border-primary-300' />
                    <p className='text-xs text-primary-700 font-semibold mt-2'>
                      Your rank
                    </p>
                  </td>
                </tr>
                <tr className='bg-primary-100 border-b border-gray-100'>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(
                          currentUserRankState.rank,
                        )}`}
                      >
                        {currentUserRankState.rank <= 3
                          ? getRankIcon(currentUserRankState.rank)
                          : currentUserRankState.rank}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm'>
                        {currentUserRankState.user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className='font-medium text-gray-800'>
                        {currentUserRankState.user.name}
                      </span>
                    </div>
                  </td>
                  <td className='py-3 px-4 text-right'>
                    <span className='font-bold text-primary-600'>
                      {currentUserRankState.user.totalPoints.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
};
