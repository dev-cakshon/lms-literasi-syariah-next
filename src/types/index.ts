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
export const BADGE_IDS = [
  'newcomer',
  'first_step',
  'active_learner',
  'perfect_score',
  'top_3',
  'number_1',
] as const;

export type Badge = (typeof BADGE_IDS)[number];

export interface EarnedBadge {
  id: Badge;
  name: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  totalPoints: number;
  badges: Badge[];
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
  totalActivities?: number;
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
  mediaType: 'youtube' | 'slides';
  mediaUrl: string;
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
  score: number;
  total: number;
  passed: boolean;
  pointsAwarded: number;
  badges: Badge[];
  earnedBadges?: EarnedBadge[];
  answers: {
    questionId: string;
    correct: boolean;
  }[];
}

// ─── Progress tracking ───
export interface CourseProgress {
  id?: string;
  userId: string;
  courseId: string;
  completedChapters: string[];
  percentage: number;
  pointsAwarded?: number;
  badges?: Badge[];
  earnedBadges?: EarnedBadge[];
  updatedAt?: string;
}

// ─── Leaderboard ───
export interface LeaderboardUser {
  uid: string;
  name: string;
  displayName?: string;
  totalPoints: number;
  badges: Badge[];
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

// ─── Activity Types ─────────────────────────────────────────────────────────
export type ActivityType = 'drag_drop' | 'word_search' | 'true_or_false';

// Admin payloads (include answer data)
export interface DragDropActivity {
  id: string;
  type: 'drag_drop';
  title: string;
  position: number;
  maxPoints: number;
  categories: string[];
  items: { id: string; label: string; correctCategory: string }[];
  feedbackMode: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordSearchActivity {
  id: string;
  type: 'word_search';
  title: string;
  position: number;
  maxPoints: number;
  wordList: string[];
  gridSize: { rows: number; cols: number };
  createdAt: string;
  updatedAt: string;
}

export interface TrueOrFalseActivity {
  id: string;
  type: 'true_or_false';
  title: string;
  position: number;
  maxPoints: number;
  statements: { id: string; text: string; correct: boolean }[];
  feedbackMode: string;
  createdAt: string;
  updatedAt: string;
}

export type AdminActivity =
  | DragDropActivity
  | WordSearchActivity
  | TrueOrFalseActivity;

// Student-facing variants (answers stripped)
export type StudentDragDropActivity = Omit<DragDropActivity, 'items'> & {
  items: { id: string; label: string }[];
};

export type StudentWordSearchActivity = WordSearchActivity;

export type StudentTrueOrFalseActivity = Omit<
  TrueOrFalseActivity,
  'statements'
> & {
  statements: { id: string; text: string }[];
};

export type StudentActivity =
  | StudentDragDropActivity
  | StudentWordSearchActivity
  | StudentTrueOrFalseActivity;

// Course content list item (chapter OR activity, discriminated by itemType)
export interface CourseContentChapterItem {
  itemType: 'chapter';
  id: string;
  title: string;
  position: number;
  locked: boolean;
  completed: boolean;
  isPublished?: boolean;
}

export interface CourseContentActivityItem {
  itemType: 'activity';
  id: string;
  type: ActivityType;
  title: string;
  position: number;
  locked: boolean;
  completed: boolean;
  bestScorePercent?: number;
}

export type CourseContentItem =
  | CourseContentChapterItem
  | CourseContentActivityItem;

// ─── Certificate ────────────────────────────────────────────────────────────
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
  serialNumber: string;
  completionDate: string;
  issuedAt: string;
}

// Submit activity
export interface SubmitActivityRequest {
  answers: Record<string, unknown>;
}

export interface SubmitActivityResponse {
  score: number;
  totalItems: number;
  maxPoints: number;
  scorePercent: number;
  pointsEarned: number;
  earnedBadges?: EarnedBadge[];
  feedback?: Record<string, unknown>;
}
