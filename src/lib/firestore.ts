import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

import type { UserProfile, UserRole } from '@/types';

//----- Collections -----//
export const COLLECTIONS = {
  COURSES: 'courses',
  PROGRESS: 'progress',
  USERS: 'users',
} as const;

//----- Course -----//
export const subscribeToCourses = (
  callback: (courses: Record<string, unknown>[]) => void
) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTIONS.COURSES),
    (snapshot) => {
      const courses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate().toISOString()
              : data.updatedAt,
        };
      });
      callback(courses);
    },
    (_error) => {
      callback([]);
    }
  );
  return unsubscribe;
};

//=== NOT EXIST YET ===//
// export const getCourseByUser = async (userId: string) => {
//     const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, displayName))
//     return "courses owned by " + userId;
// };

export const subscribeToCourseDetail = (
  courseId: string,
  callback: (course: Record<string, unknown> | null) => void
) => {
  const unsubscribe = onSnapshot(
    doc(db, COLLECTIONS.COURSES, courseId),
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    },
    (_error) => {
      callback(null);
    }
  );
  return unsubscribe;
};

//----- Progress -----//
export const subscribeToUserProgress = (
  userId: string,
  callback: (progress: Record<string, unknown>[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.PROGRESS),
    where('userId', '==', userId)
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const progress = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(progress);
    },
    (_error) => {
      callback([]);
    }
  );
  return unsubscribe;
};

export const subscribeToProgressByCourse = (
  userId: string,
  courseId: string,
  callback: (progress: {
    userId: string;
    courseId: string;
    progressDetail: {
      chapterId: string;
      isCompleted: boolean;
      pointsAwarded: number;
    }[];
  }) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.PROGRESS),
    where('userId', '==', userId),
    where('courseId', '==', courseId)
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const progressDetail = snapshot.docs.map((doc) => ({
        chapterId: doc.data().chapterId,
        isCompleted: doc.data().isCompleted || false,
        pointsAwarded: doc.data().pointsAwarded || 0,
      }));
      callback({
        userId,
        courseId,
        progressDetail,
      });
    },
    (_error) => {
      callback({ userId, courseId, progressDetail: [] });
    }
  );
  return unsubscribe;
};

//----- Chapter -----//
export const subscribeToChaptersByCourse = (
  courseId: string,
  callback: (chapters: Record<string, unknown>[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.COURSES, courseId, 'chapters'),
    orderBy('order')
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const chapters = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(chapters);
    },
    (_error) => {
      callback([]);
    }
  );
  return unsubscribe;
};

export const getChapterDetail = async (courseId: string, chapterId: string) => {
  try {
    const chapterDoc = await getDoc(
      doc(db, COLLECTIONS.COURSES, courseId, 'chapters', chapterId)
    );
    if (!chapterDoc.exists()) {
      // eslint-disable-next-line no-console
      console.log(`Chapter not found: ${chapterId} in course ${courseId}`);
      return null;
    }
    return { id: chapterDoc.id, ...chapterDoc.data() };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching chapter ${chapterId}:`, error);
    return null;
  }
};

//----- Progress -----//
export const createProgress = async (
  userId: string,
  courseId: string,
  chapterId: string
) => {
  const progressId = `${courseId}_${chapterId}_${userId}`;
  const progressData = {
    userId,
    courseId,
    chapterId,
    isCompleted: true,
    pointsAwarded: 0,
    completedAt: serverTimestamp(),
  };

  try {
    const progressRef = doc(db, COLLECTIONS.PROGRESS, progressId);
    await setDoc(progressRef, progressData);
    return { id: progressId, ...progressData };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating progress:', error);
    return null;
  }
};

//----- Quiz -----//
export const subscribeToQuizzesByCourse = (
  courseId: string,
  callback: (quizzes: Record<string, unknown>[]) => void
) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTIONS.COURSES, courseId, 'quizzes'),
    (snapshot) => {
      const quizzes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(quizzes);
    },
    (_error) => {
      callback([]);
    }
  );
  return unsubscribe;
};

// Sync versions for server components
export const getChaptersByCourse = async (courseId: string) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.COURSES, courseId, 'chapters'),
      orderBy('order')
    );
    const chaptersSnapshot = await getDocs(q);
    return chaptersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    return [];
  }
};

export const getQuizzesByCourse = async (courseId: string) => {
  try {
    const quizzesSnapshot = await getDocs(
      collection(db, COLLECTIONS.COURSES, courseId, 'quizzes')
    );
    return quizzesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    return [];
  }
};

export const getQuizDetail = async (courseId: string, quizId: string) => {
  try {
    const quizDoc = await getDoc(
      doc(db, COLLECTIONS.COURSES, courseId, 'quizzes', quizId)
    );
    if (!quizDoc.exists()) {
      // eslint-disable-next-line no-console
      console.log(`Quiz not found: ${quizId} in course ${courseId}`);
      return null;
    }
    return { id: quizDoc.id, ...quizDoc.data() };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching quiz ${quizId}:`, error);
    return null;
  }
};

//----- User -----//
export const createUserProfile = async (
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile> => {
  const now = Timestamp.now();
  const profile = {
    uid: userId,
    email,
    displayName: displayName || email.split('@')[0],
    role: 'student' as UserRole,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, COLLECTIONS.USERS, userId), profile);

  return {
    ...profile,
    createdAt: now.toDate().toISOString(),
    updatedAt: now.toDate().toISOString(),
  };
};

export const getUserDetail = async (
  userId: string | null | undefined
): Promise<UserProfile | null> => {
  if (!userId) return null;
  try {
    const ref = doc(db, COLLECTIONS.USERS, userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    const roleValue = (data.role as string) || 'student';
    const role: UserRole = ['admin', 'student', 'instructor'].includes(
      roleValue
    )
      ? (roleValue as UserRole)
      : 'student';

    // Convert Timestamp to ISO string if exists
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string) || new Date().toISOString();
    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string) || new Date().toISOString();

    return {
      uid: userId,
      email: (data.email as string) || '',
      displayName: (data.displayName as string) || '',
      role,
      totalPoints: typeof data.totalPoints === 'number' ? data.totalPoints : 0,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    return null;
  }
};

export const getOrCreateUserProfile = async (
  userId: string,
  email: string,
  displayName?: string
): Promise<UserProfile> => {
  const existing = await getUserDetail(userId);
  if (existing) return existing;
  return await createUserProfile(userId, email, displayName);
};

export const subscribeToUserPoints = (
  userId: string,
  callback: (totalPoints: number) => void
) => {
  const unsubscribe = onSnapshot(
    doc(db, COLLECTIONS.USERS, userId),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const totalPoints =
          typeof data.totalPoints === 'number' ? data.totalPoints : 0;
        callback(totalPoints);
      } else {
        callback(0);
      }
    },
    (_error) => {
      callback(0);
    }
  );
  return unsubscribe;
};

export const subscribeToLeaderboard = (
  callback: (users: Record<string, unknown>[]) => void
) => {
  const q = query(
    collection(db, COLLECTIONS.USERS),
    orderBy('totalPoints', 'desc')
  );
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          displayName: (data.displayName as string) || '',
          totalPoints:
            typeof data.totalPoints === 'number' ? data.totalPoints : 0,
        };
      });
      callback(users);
    },
    (_error) => {
      callback([]);
    }
  );
  return unsubscribe;
};
