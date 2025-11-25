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
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "./firebase";

import type { Chapter, Course, UserCourseProgress, UserProfile } from "@/types";

// Collections
export const COLLECTIONS = {
    COURSES: "courses",
    PROGRESS: "progress",
    USERS: "users",
    // CHAPTERS: "chapters",
    // ENROLLMENTS: "enrollments",
    // PROGRESS: "progress",
    // CATEGORIES: "categories",
    // QUIZZES: "quizzes",
    // QUIZ_ATTEMPTS: "quiz_attempts",
    // ASSIGNMENTS: "assignments",
    // ASSIGNMENT_SUBMISSIONS: "assignment_submissions",
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
// export const getCourseChapters = async (courseId: string) => {
//     const q = query(
//         collection(db, COLLECTIONS.CHAPTERS),
//         where("courseId", "==", courseId),
//         orderBy("order", "asc")
//     );
//     const chaptersSnapshot = await getDocs(q);
//     return chaptersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// export const getChapter = async (chapterId: string) => {
//     const chapterDoc = await getDoc(doc(db, COLLECTIONS.CHAPTERS, chapterId));
//     return chapterDoc.exists() ? { id: chapterDoc.id, ...chapterDoc.data() } : null;
// };

// // User Progress Operations
// export const getUserProgress = async (userId: string, courseId: string) => {
//     const progressDoc = await getDoc(
//         doc(db, COLLECTIONS.PROGRESS, `${userId}_${courseId}`)
//     );
//     return progressDoc.exists() ? progressDoc.data() : null;
// };

// export const updateUserProgress = async (
//     userId: string,
//     courseId: string,
//     chapterId: string,
//     isCompleted: boolean,
//     pointsAwarded = 0
// ) => {
//     const progressRef = doc(db, COLLECTIONS.PROGRESS, `${userId}_${courseId}`);
//     const progressDoc = await getDoc(progressRef);

//     if (!progressDoc.exists()) {
//         await setDoc(progressRef, {
//             userId,
//             courseId,
//             chapters: [
//                 {
//                     chapterId,
//                     isCompleted,
//                     pointsAwarded,
//                 }
//             ],
//             lastAccessedChapter: chapterId,
//             updatedAt: new Date().toISOString(),
//         });
//     } else {
//         const data = progressDoc.data();
//         const chapters = data.chapters || [];
        
//         // Find existing chapter progress
//         const existingIndex = chapters.findIndex((ch: UserCourseProgress) => ch.chapterId === chapterId);
        
//         if (existingIndex >= 0) {
//             // Update existing chapter
//             chapters[existingIndex] = {
//                 chapterId,
//                 isCompleted,
//                 pointsAwarded,
//             };
//         } else {
//             // Add new chapter progress
//             chapters.push({
//                 chapterId,
//                 isCompleted,
//                 pointsAwarded,
//             });
//         }

//         await updateDoc(progressRef, {
//             chapters,
//             lastAccessedChapter: chapterId,
//             updatedAt: new Date().toISOString(),
//         });
//     }
// };

// // Enrollment Operations
// export const enrollUserInCourse = async (userId: string, courseId: string) => {
//     const enrollmentRef = doc(db, COLLECTIONS.ENROLLMENTS, `${userId}_${courseId}`);
//     await setDoc(enrollmentRef, {
//         userId,
//         courseId,
//         enrolledAt: new Date().toISOString(),
//         status: "active",
//     });
// };

// export const getUserEnrollments = async (userId: string) => {
//     const q = query(
//         collection(db, COLLECTIONS.ENROLLMENTS),
//         where("userId", "==", userId)
//     );
//     const enrollmentsSnapshot = await getDocs(q);
//     return enrollmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// // Category Operations
// export const getAllCategories = async () => {
//     const categoriesSnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
//     return categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// };

// // Generic query helper
// export const queryCollection = async <T = DocumentData>(
//     collectionName: string,
//     ...constraints: QueryConstraint[]
// ) => {
//     const q = query(collection(db, collectionName), ...constraints);
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
// };

// // User Profile Operations
// export const createUserProfile = async (uid: string, email: string, displayName?: string) => {
//     const userRef = doc(db, COLLECTIONS.USERS, uid);
//     const userProfile: Omit<UserProfile, 'uid'> = {
//         email,
//         displayName: displayName || email.split('@')[0],
//         role: 'student', // Default role
//         totalPoints: 0, // Initialize with 0 points
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//     };
//     await setDoc(userRef, userProfile);
//     return { uid, ...userProfile };
// };

// export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
//     const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
//     if (!userDoc.exists()) return null;
//     return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
// };

// export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
//     const userRef = doc(db, COLLECTIONS.USERS, uid);
//     await updateDoc(userRef, {
//         ...updates,
//         updatedAt: new Date().toISOString(),
//     });
// };

// export const updateUserRole = async (uid: string, role: UserProfile['role']) => {
//     await updateUserProfile(uid, { role });
// };

// // Course CRUD Operations (for admin)
// export const createCourse = async (title: string) => {
//     const courseRef = collection(db, COLLECTIONS.COURSES);
//     const newCourse = {
//         title,
//         description: '',
//         totalChapters: 0,
//         imageUrl: '',
//         price: 0,
//         categoryId: '',
//         isPublished: false,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//     };
//     const docRef = await addDoc(courseRef, newCourse);
//     return { id: docRef.id, ...newCourse };
// };

// export const updateCourse = async (courseId: string, updates: Partial<Course>) => {
//     const courseRef = doc(db, COLLECTIONS.COURSES, courseId);
//     await updateDoc(courseRef, {
//         ...updates,
//         updatedAt: new Date().toISOString(),
//     });
// };

// export const deleteCourse = async (courseId: string) => {
//     // Delete course
//     await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
    
//     // Delete all chapters
//     const chapters = await getCourseChapters(courseId);
//     for (const chapter of chapters) {
//         await deleteDoc(doc(db, COLLECTIONS.CHAPTERS, chapter.id));
//     }
    
//     // Note: In production, also delete related quizzes, assignments, etc.
// };

// export const publishCourse = async (courseId: string, isPublished: boolean) => {
//     await updateCourse(courseId, { isPublished });
// };

// // Helper to update totalChapters count when chapters are added/removed
// export const updateCourseTotalChapters = async (courseId: string) => {
//     const chapters = await getCourseChapters(courseId);
//     await updateCourse(courseId, { totalChapters: chapters.length });
// };

// // Chapter CRUD Operations
// export const createChapter = async (courseId: string, title: string, order: number) => {
//     const chapterRef = collection(db, COLLECTIONS.CHAPTERS);
//     const newChapter = {
//         courseId,
//         title,
//         content: '',
//         videoUrl: '',
//         order,
//         isFree: false,
//         isPublished: false,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//     };
//     const docRef = await addDoc(chapterRef, newChapter);
//     return { id: docRef.id, ...newChapter };
// };

// export const updateChapter = async (chapterId: string, updates: Partial<Chapter>) => {
//     const chapterRef = doc(db, COLLECTIONS.CHAPTERS, chapterId);
//     await updateDoc(chapterRef, {
//         ...updates,
//         updatedAt: new Date().toISOString(),
//     });
// };

// export const deleteChapter = async (chapterId: string) => {
//     await deleteDoc(doc(db, COLLECTIONS.CHAPTERS, chapterId));
// };

// export const reorderChapters = async (chapters: { id: string; order: number }[]) => {
//     const promises = chapters.map(({ id, order }) =>
//         updateChapter(id, { order })
//     );
//     await Promise.all(promises);
// };
