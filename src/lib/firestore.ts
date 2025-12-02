import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    orderBy,
    query,
    QueryConstraint,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";

import type { UserProfile, UserRole } from "@/types";
import { db } from "./firebase";

//----- Collections -----//
export const COLLECTIONS = {
    COURSES: "courses",
    PROGRESS: "progress",
    USERS: "users",
} as const;

//----- Course -----//
export const getCourses = async () => {
    const coursesSnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return coursesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
        };
    });
};

//=== NOT EXIST YET ===//
// export const getCourseByUser = async (userId: string) => {
//     const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, displayName))
//     return "courses owned by " + userId;
// };

export const getCourseDetail = async (courseId: string) => {
    try {
        const courseDoc = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
        if (!courseDoc.exists()) {
            console.log(`Course not found: ${courseId}`);
            return null;
        }
        return { id: courseDoc.id, ...courseDoc.data() };
    } catch (error) {
        console.error(`Error fetching course ${courseId}:`, error);
        return null;
    }
};

//----- Progress -----//
export const getUserProgress = async (userId: string) => {
    const q = query(
        collection(db, COLLECTIONS.PROGRESS),
        where("userId", "==", userId)
    );
    const progressSnapshot = await getDocs(q);
    return progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const getProgressByCourse = async (userId: string, courseId: string) => {
    const q = query(
        collection(db, COLLECTIONS.PROGRESS),
        where("userId", "==", userId),
        where("courseId", "==", courseId)
    );
    const progressSnapshot = await getDocs(q);

    // Return chapters array (each doc is a chapter progress)
    const progressDetail = progressSnapshot.docs.map(doc => ({
        chapterId: doc.data().chapterId,
        isCompleted: doc.data().isCompleted || false,
        pointsAwarded: doc.data().pointsAwarded || 0,
    }));

    return {
        userId,
        courseId,
        progressDetail
    };
};

//----- Chapter -----//
export const getChaptersByCourse = async (courseId: string) => {
    try {
        const q = query(
            collection(db, COLLECTIONS.COURSES, courseId, "chapters"),
            orderBy("order")
        );
        const chaptersSnapshot = await getDocs(q);
        return chaptersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error(`Error fetching chapters for course ${courseId}:`, error);
        return [];
    }
};

export const getChapterDetail = async (courseId: string, chapterId: string) => {
    try {
        const chapterDoc = await getDoc(
            doc(db, COLLECTIONS.COURSES, courseId, "chapters", chapterId)
        );
        if (!chapterDoc.exists()) {
            console.log(`Chapter not found: ${chapterId} in course ${courseId}`);
            return null;
        }
        return { id: chapterDoc.id, ...chapterDoc.data() };
    } catch (error) {
        console.error(`Error fetching chapter ${chapterId}:`, error);
        return null;
    }
};

//----- Progress -----//
export const createProgress = async (userId: string, courseId: string, chapterId: string) => {
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
        console.error("Error creating progress:", error);
        return null;
    }
};

//----- Quiz -----//
export const getQuizzesByCourse = async (courseId: string) => {
    try {
        const quizzesSnapshot = await getDocs(
            collection(db, COLLECTIONS.COURSES, courseId, "quizzes")
        );
        return quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error(`Error fetching quizzes for course ${courseId}:`, error);
        return [];
    }
};

export const getQuizDetail = async (courseId: string, quizId: string) => {
    try {
        const quizDoc = await getDoc(
            doc(db, COLLECTIONS.COURSES, courseId, "quizzes", quizId)
        );
        if (!quizDoc.exists()) {
            console.log(`Quiz not found: ${quizId} in course ${courseId}`);
            return null;
        }
        return { id: quizDoc.id, ...quizDoc.data() };
    } catch (error) {
        console.error(`Error fetching quiz ${quizId}:`, error);
        return null;
    }
};

//----- User -----//
export const createUserProfile = async (userId: string, email: string, displayName?: string): Promise<UserProfile> => {
    const now = Timestamp.now();
    const profile = {
        uid: userId,
        email,
        displayName: displayName || email.split("@")[0],
        role: "student" as UserRole,
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

export const getUserDetail = async (userId: string | null | undefined): Promise<UserProfile | null> => {
    if (!userId) return null;
    try {
        const ref = doc(db, COLLECTIONS.USERS, userId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            return null;
        }
        const data = snap.data();
        const roleValue = (data.role as string) || "student";
        const role: UserRole = ["admin", "student", "instructor"].includes(roleValue)
            ? (roleValue as UserRole)
            : "student";

        // Convert Timestamp to ISO string if exists
        const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : (data.createdAt as string) || new Date().toISOString();
        const updatedAt = data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : (data.updatedAt as string) || new Date().toISOString();

        return {
            uid: userId,
            email: (data.email as string) || "",
            displayName: (data.displayName as string) || "",
            role,
            totalPoints: typeof data.totalPoints === "number" ? data.totalPoints : 0,
            createdAt,
            updatedAt,
        };
    } catch (error) {
        return null;
    }
};

export const getOrCreateUserProfile = async (userId: string, email: string, displayName?: string): Promise<UserProfile> => {
    const existing = await getUserDetail(userId);
    if (existing) return existing;
    return await createUserProfile(userId, email, displayName);
};