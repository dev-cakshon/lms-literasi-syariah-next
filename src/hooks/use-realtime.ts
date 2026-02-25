/**
 * Realtime Firestore hooks for enrollment and progress.
 *
 * These use Firestore `onSnapshot` directly from the client SDK
 * for real-time updates. All other data goes through the API.
 */

import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getFirestoreInstance } from '@/lib/firebase';

import { useAuth } from '@/contexts/AuthContext';

// ─── useEnrollmentStatus ─────────────────────────────────────────────────────

interface EnrollmentRealtimeData {
  enrolled: boolean;
  enrollmentId: string | null;
  loading: boolean;
}

export function useEnrollmentStatus(courseId: string | null): EnrollmentRealtimeData {
  const { user } = useAuth();
  const [data, setData] = useState<EnrollmentRealtimeData>({
    enrolled: false,
    enrollmentId: null,
    loading: true,
  });

  useEffect(() => {
    if (!user || !courseId) {
      setData({ enrolled: false, enrollmentId: null, loading: false });
      return;
    }

    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', user.uid),
      where('courseId', '==', courseId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setData({ enrolled: false, enrollmentId: null, loading: false });
        } else {
          setData({
            enrolled: true,
            enrollmentId: snapshot.docs[0].id,
            loading: false,
          });
        }
      },
      (err) => {
        console.error('useEnrollmentStatus error:', err);
        setData({ enrolled: false, enrollmentId: null, loading: false });
      },
    );

    return unsubscribe;
  }, [user, courseId]);

  return data;
}

// ─── useCourseProgress ───────────────────────────────────────────────────────

interface CourseProgressRealtime {
  completedChapters: string[];
  percentage: number;
  loading: boolean;
}

export function useCourseProgress(courseId: string | null): CourseProgressRealtime {
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

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  totalPoints: number;
}

export function useLeaderboard() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreInstance();
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const entries: LeaderboardEntry[] = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            return {
              uid: doc.id,
              displayName: (d.name as string) || (d.displayName as string) || '',
              totalPoints: (d.totalPoints as number) || 0,
            };
          })
          .sort((a, b) => b.totalPoints - a.totalPoints);
        setUsers(entries);
        setLoading(false);
      },
      (err) => {
        console.error('useLeaderboard error:', err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return { users, loading };
}
