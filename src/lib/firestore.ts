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

//----- Collections -----//
export const COLLECTIONS = {
    COURSES: "courses",
    PROGRESS: "progress",
    USERS: "users",
} as const;

//----- Course -----//
export const getCourses = async () => {
    const coursesSnapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return coursesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
