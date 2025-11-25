// User types
export type UserRole = 'student' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    totalPoints: number;
    createdAt: string;
    updatedAt: string;
}

// Course types
export interface Course {
    id: string;
    title: string;
    description: string;
    totalChapters: number;
    imageUrl: string;
    price?: number;
    categoryId?: string;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Chapter {
    id: string;
    courseId: string;
    title: string;
    content: string;
    order: number;
    videoUrl: string;
    isFree?: boolean;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Assessment types
export type GamificationType = 'standard' | 'timeAttack' | 'survival';

export interface Quiz {
    id: string;
    courseId: string;
    title: string;
    gamificationType: GamificationType;
    questions: QuizQuestion[];
    createdAt?: string;
    updatedAt?: string;
}

export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number; // index of correct option
    points: number;
}

export interface QuizAttempt {
    id: string;
    userId: string;
    quizId: string;
    answers: number[]; // indices of selected options
    score: number;
    passed: boolean;
    completedAt: string;
}

export interface Assignment {
    id: string;
    chapterId: string;
    courseId: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate?: string;
    maxPoints: number;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    userId: string;
    content: string;
    fileUrl?: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
    gradedAt?: string;
    gradedBy?: string; // instructor uid
}

// Progress tracking
export interface UserCourseProgress {
    chapterId: string;
    isCompleted: boolean;
    pointsAwarded: number;
}

export interface UserProgress {
    id: string;
    userId: string;
    courseId: string;
    chapters: UserCourseProgress[];
    lastAccessedChapter?: string;
    updatedAt: string;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: string;
    status: 'active' | 'completed' | 'cancelled';
    completedAt?: string;
}
