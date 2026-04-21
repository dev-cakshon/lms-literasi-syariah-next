/**
 * Realtime Firestore hooks for progress and leaderboard.
 *
 * These use Firestore `onSnapshot` directly from the client SDK
 * for real-time updates. All other data goes through the API.
 */

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getFirestoreInstance } from '@/lib/firebase';

import { useAuth } from '@/contexts/AuthContext';

import type { Badge, LeaderboardUser } from '@/types';

const VALID_BADGES: Badge[] = ['perfect_score', 'top_3'];

const isBadge = (value: unknown): value is Badge => {
  return typeof value === 'string' && VALID_BADGES.includes(value as Badge);
};

// ─── useCourseProgress ───────────────────────────────────────────────────────

interface CourseProgressRealtime {
  completedChapters: string[];
  percentage: number;
  loading: boolean;
}

export function useCourseProgress(
  courseId: string | null,
): CourseProgressRealtime {
  const { user } = useAuth();
  const [data, setData] = useState<CourseProgressRealtime>({
    completedChapters: [],
    percentage: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user || !courseId) {
      setData({ completedChapters: [], percentage: 0, loading: false });
      return;
    }

    const db = getFirestoreInstance();
    const progressId = `${user.uid}_${courseId}`;
    const progressRef = doc(db, 'progress', progressId);

    const unsubscribe = onSnapshot(
      progressRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setData({ completedChapters: [], percentage: 0, loading: false });
        } else {
          const d = snapshot.data();
          setData({
            completedChapters: (d?.completedChapters as string[]) || [],
            percentage: (d?.percentage as number) || 0,
            loading: false,
          });
        }
      },
      (err) => {
        console.error('useCourseProgress error:', err);
        setData({ completedChapters: [], percentage: 0, loading: false });
      },
    );

    return unsubscribe;
  }, [user, courseId]);

  return data;
}

// ─── useLeaderboard (realtime) ───────────────────────────────────────────────

interface LeaderboardRealtimeData {
  data: LeaderboardUser[];
  loading: boolean;
}

export function useLeaderboard(): LeaderboardRealtimeData {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreInstance();
    const usersRef = query(
      collection(db, 'users'),
      orderBy('totalPoints', 'desc'),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const entries: LeaderboardUser[] = snapshot.docs.map((userDoc) => {
          const raw = userDoc.data();

          const uidValue = raw.uid;
          const nameValue = raw.name;
          const pointsValue = raw.totalPoints;
          const badgesValue = raw.badges;

          const uid = typeof uidValue === 'string' ? uidValue : userDoc.id;
          const name = typeof nameValue === 'string' ? nameValue : '';
          const totalPoints = typeof pointsValue === 'number' ? pointsValue : 0;
          const badges = Array.isArray(badgesValue)
            ? badgesValue.filter((badge): badge is Badge => isBadge(badge))
            : [];

          return {
            uid,
            name,
            totalPoints,
            badges,
          };
        });

        setData(entries);
        setLoading(false);
      },
      (err) => {
        console.error('useLeaderboard error:', err);
        setData([]);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return { data, loading };
}
