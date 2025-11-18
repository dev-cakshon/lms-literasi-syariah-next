import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "./firebase";

// Collections
export const COLLECTIONS = {
    COURSES: "courses",
    CHAPTERS: "chapters",
    USERS: "users",
    ENROLLMENTS: "enrollments",
    PROGRESS: "progress",
    CATEGORIES: "categories",
} as const;

// Course Operations
export const getCourse = async (courseId: string) => {
    const courseDoc = await getDoc(doc(db, COLLECTIONS.COURSES, courseId));
    return courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null;
};

export const getAllCourses = async () => {
    const coursesSnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCoursesByCategory = async (categoryId: string) => {
    const q = query(
        collection(db, COLLECTIONS.COURSES),
        where("categoryId", "==", categoryId)
    );
    const coursesSnapshot = await getDocs(q);
    return coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Chapter Operations
export const getCourseChapters = async (courseId: string) => {
    const q = query(
        collection(db, COLLECTIONS.CHAPTERS),
        where("courseId", "==", courseId),
        orderBy("position", "asc")
    );
    const chaptersSnapshot = await getDocs(q);
    return chaptersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getChapter = async (chapterId: string) => {
    const chapterDoc = await getDoc(doc(db, COLLECTIONS.CHAPTERS, chapterId));
    return chapterDoc.exists() ? { id: chapterDoc.id, ...chapterDoc.data() } : null;
};

// User Progress Operations
export const getUserProgress = async (userId: string, courseId: string) => {
    const progressDoc = await getDoc(
        doc(db, COLLECTIONS.PROGRESS, `${userId}_${courseId}`)
    );
    return progressDoc.exists() ? progressDoc.data() : null;
};

export const updateUserProgress = async (
    userId: string,
    courseId: string,
    chapterId: string,
    isCompleted: boolean
) => {
    const progressRef = doc(db, COLLECTIONS.PROGRESS, `${userId}_${courseId}`);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
        await setDoc(progressRef, {
            userId,
            courseId,
            completedChapters: [chapterId],
            lastAccessedChapter: chapterId,
            updatedAt: new Date().toISOString(),
        });
    } else {
        const data = progressDoc.data();
        const completedChapters = data.completedChapters || [];

        if (isCompleted && !completedChapters.includes(chapterId)) {
            completedChapters.push(chapterId);
        }

        await updateDoc(progressRef, {
            completedChapters,
            lastAccessedChapter: chapterId,
            updatedAt: new Date().toISOString(),
        });
    }
};

// Enrollment Operations
export const enrollUserInCourse = async (userId: string, courseId: string) => {
    const enrollmentRef = doc(db, COLLECTIONS.ENROLLMENTS, `${userId}_${courseId}`);
    await setDoc(enrollmentRef, {
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        status: "active",
    });
};

export const getUserEnrollments = async (userId: string) => {
    const q = query(
        collection(db, COLLECTIONS.ENROLLMENTS),
        where("userId", "==", userId)
    );
    const enrollmentsSnapshot = await getDocs(q);
    return enrollmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Category Operations
export const getAllCategories = async () => {
    const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Generic query helper
export const queryCollection = async <T = DocumentData>(
    collectionName: string,
    ...constraints: QueryConstraint[]
) => {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
};
