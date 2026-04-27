import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { getFirestoreInstance } from '@/lib/firebase';
import { useLeaderboard } from '@/hooks/use-realtime';

import { LeaderboardRow } from '@/components/dashboard/LeaderboardRow';
import Skeleton from '@/components/Skeleton';

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

  const topThree = leaderboardData.filter((entry) => entry.rank <= 3);
  const otherRanks = leaderboardData.filter((entry) => entry.rank > 3);
  const pinnedCurrentUser = currentUserTopTenEntry ?? currentUserRankState;
  const pinnedRank = pinnedCurrentUser?.rank ?? null;
  const pinnedUser = pinnedCurrentUser
    ? 'user' in pinnedCurrentUser
      ? pinnedCurrentUser.user
      : pinnedCurrentUser
    : null;

  if (loading) {
    return (
      <div className='rounded-3xl border border-primary-200/70 bg-white/80 p-6 lg:p-8'>
        <h2 className='mb-6 text-xl font-bold text-ink'>Leaderboard</h2>
        <div className='space-y-3'>
          <Skeleton className='h-20 rounded-2xl' />
          <Skeleton className='h-20 rounded-2xl' />
          <Skeleton className='h-14 rounded-xl' />
          <Skeleton className='h-14 rounded-xl' />
        </div>
      </div>
    );
  }

  if (leaderboardData.length === 0) {
    return (
      <div className='rounded-3xl border border-primary-200/70 bg-white/80 p-6 lg:p-8'>
        <h2 className='mb-6 text-xl font-bold text-ink'>Leaderboard</h2>
        <div className='py-8 text-center text-gray-500'>
          <p>Belum ada data leaderboard.</p>
        </div>
      </div>
    );
  }

  return (
    <section className='rounded-3xl border border-primary-200/70 bg-white/80 p-6 lg:p-8'>
      <div className='mb-6 flex items-end justify-between'>
        <h2 className='text-xl font-bold text-ink'>Leaderboard</h2>
        <p className='text-xs font-medium uppercase tracking-[0.12em] text-gray-500'>
          Weekly Pulse
        </p>
      </div>

      <ul className='space-y-3'>
        {topThree.map((entry, index) => (
          <LeaderboardRow
            key={entry.uid}
            user={entry}
            rank={entry.rank}
            isCurrentUser={currentUserUid === entry.uid}
            delay={index * 0.05}
          />
        ))}
      </ul>

      {otherRanks.length > 0 && (
        <ul className='mt-4 rounded-2xl border border-gray-200 bg-white px-4'>
          {otherRanks.map((entry, index) => (
            <LeaderboardRow
              key={entry.uid}
              user={entry}
              rank={entry.rank}
              compact
              isCurrentUser={currentUserUid === entry.uid}
              delay={(topThree.length + index) * 0.05}
            />
          ))}
        </ul>
      )}

      {pinnedUser !== null && pinnedRank !== null && (
        <div className='mt-6 rounded-2xl border-2 border-emerald-500/60 bg-emerald-50/70 p-4'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700'>
            Your rank
          </p>
          <ul>
            <LeaderboardRow
              user={pinnedUser}
              rank={pinnedRank}
              compact
              isCurrentUser
            />
          </ul>
        </div>
      )}
    </section>
  );
};
