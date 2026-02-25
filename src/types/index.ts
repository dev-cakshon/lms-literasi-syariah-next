// ─── API response wrappers ───
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── User types ───
export type UserRole = 'student' | 'admin' | 'instructor';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  totalPoints: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Course types ───
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  totalChapters?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  courseId?: string;
  title: string;
  content: string;
  order: number;
  videoUrl: string;
  isFree?: boolean;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Assessment types ───
export type GamificationType = 'standard' | 'timeAttack' | 'survival';

export interface QuizQuestion {
  question: string;
  questionText?: string;
  options: string[];
  correctAnswer?: number;
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  points?: number;
  type?: string;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  type?: 'preTest' | 'postTest' | 'standard';
  gamificationType?: GamificationType;
  questions: QuizQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizSubmitResult {
  id: string;
  userId: string;
  courseId: string;
  quizId: string;
  answers: number[];
  score: number;
  correctCount: number;
  totalQuestions: number;
  submittedAt: string | null;
}

// ─── Enrollment types ───
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status?: 'active' | 'completed' | 'cancelled';
  completedAt?: string;
}

export interface EnrollmentStatus {
  enrolled: boolean;
}

// ─── Progress tracking ───
export interface CourseProgress {
  id?: string;
  userId: string;
  courseId: string;
  completedChapters: string[];
  percentage: number;
  updatedAt?: string;
}

// ─── Leaderboard ───
export interface LeaderboardUser {
  uid: string;
  name: string;
  displayName?: string;
  totalPoints: number;
}

// ─── Storage ───
export interface UploadUrlResponse {
  uploadUrl: string;
  filePath: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  filePath: string;
}

// ─── Chatbot ───
export interface ChatbotMessageResponse {
  sessionId: string;
  response: string;
}
