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
  displayNameConfirmed?: boolean;
  photoURL?: string;
  role: UserRole;
  totalPoints: number;
  badges: Badge[];
  isActive?: boolean;
  chatbotEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Batch register (PRD14) + batch enrollment (PRD20) ───
export interface BatchRegisterRow {
  name?: string;
  email: string;
  password?: string;
  courseId?: string;
}

// PRD20 — per-row enrollment outcome, independent of the registration
// outcome. Present only when the row carried a resolved courseId.
export interface BatchEnrollmentResult {
  courseId: string;
  status: 'enrolled' | 'already_enrolled' | 'course_not_found' | 'failed';
  reason?: string;
}

export interface BatchRegisterResultRow {
  email: string;
  status: 'created' | 'skipped' | 'failed';
  uid?: string;
  reason?: string;
  enrollment?: BatchEnrollmentResult;
}

export interface BatchRegisterResponse {
  summary: {
    total: number;
    created: number;
    skipped: number;
    failed: number;
    enrolled: number;
    alreadyEnrolled: number;
    enrollFailed: number;
  };
  results: BatchRegisterResultRow[];
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
  accessTier?: 'free' | 'premium';
  createdAt?: string;
  updatedAt?: string;
}

// ─── Enrollment request types ───
export type RequestStatus = 'pending' | 'approved' | 'declined' | 'revoked';

export interface EnrollmentRequest {
  id: string;
  userId: string;
  courseId: string;
  status: RequestStatus;
  requestedAt: string;
  decidedAt?: string | null;
  decidedBy?: string | null;
  declineReason?: string | null;
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
  type?: 'multipleChoice' | 'shortAnswer';
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  type?: 'preTest' | 'postTest' | 'standard';
  gamificationType?: GamificationType;
  questions: QuizQuestion[];
  /** Minimum pointsAwarded to be considered passing (FE-only display hint; not server-enforced). */
  passingGrade?: number;
  /** Whether the student may retake the quiz (FE-only display hint; not server-enforced). */
  allowRetake?: boolean;
  /** Whether to reveal correct answers after submission (FE-only; pilot: always false). */
  showAnswers?: boolean;
  timeLimitMinutes?: number;
  /**
   * PRD21 — 'standard' (default) is today's behavior: wrong answers score 0.
   * 'penalty' subtracts a fixed proportion of a question's weight on a wrong
   * answer, floors the score at 0, and lets students leave questions blank
   * (blank always scores 0, never negative). Server-enforced.
   */
  scoringMode?: 'standard' | 'penalty';
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

/**
 * Aggregated prior-attempt summary from GET /courses/:courseId/quizzes/:quizId/result.
 * Used to gate retakes FE-side when allowRetake === false.
 */
export interface QuizResult {
  attempted: boolean;
  attemptCount: number;
  /** Best score across attempts, as a percentage (0–100). */
  bestScore: number;
  /** Best raw points across attempts. */
  bestPointsAwarded: number;
  totalQuestions: number;
  passingGrade: number;
  passed: boolean;
  /** ISO timestamp of the most recent attempt, or null if never attempted. */
  lastSubmittedAt: string | null;
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
