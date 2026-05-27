import type {
  Course,
  CourseContentActivityItem,
  CourseContentChapterItem,
  CourseProgress,
  LeaderboardUser,
  StudentDragDropActivity,
  StudentTrueOrFalseActivity,
  StudentWordSearchActivity,
  SubmitActivityResponse,
  UserProfile,
} from '@/types';

// Factories for common mock shapes matching the real types exactly.

export const mockUserProfile = (
  overrides: Partial<UserProfile> = {},
): UserProfile => ({
  uid: 'user-1',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'student',
  totalPoints: 0,
  badges: [],
  chatbotEnabled: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'course-1',
  title: 'Ekonomi Syariah Dasar',
  description: 'Deskripsi kursus',
  isPublished: true,
  totalChapters: 2,
  totalActivities: 1,
  ...overrides,
});

export const mockChapterItem = (
  overrides: Partial<CourseContentChapterItem> = {},
): CourseContentChapterItem => ({
  id: 'chapter-1',
  title: 'Pengenalan Ekonomi Syariah',
  itemType: 'chapter',
  position: 1,
  completed: false,
  locked: false,
  ...overrides,
});

export const mockActivityItem = (
  overrides: Partial<CourseContentActivityItem> = {},
): CourseContentActivityItem => ({
  id: 'activity-1',
  title: 'Aktivitas Test',
  itemType: 'activity',
  type: 'true_or_false',
  position: 2,
  completed: false,
  locked: false,
  ...overrides,
});

export const mockCourseProgress = (
  overrides: Partial<CourseProgress> = {},
): CourseProgress => ({
  userId: 'user-1',
  courseId: 'course-1',
  completedChapters: [],
  percentage: 0,
  pointsAwarded: 0,
  badges: [],
  earnedBadges: [],
  ...overrides,
});

export const mockSubmitActivityResponse = (
  overrides: Partial<SubmitActivityResponse> = {},
): SubmitActivityResponse => ({
  score: 2,
  totalItems: 3,
  maxPoints: 30,
  scorePercent: 67,
  pointsEarned: 20,
  earnedBadges: [],
  ...overrides,
});

export const mockTrueOrFalseActivity = (
  overrides: Partial<StudentTrueOrFalseActivity> = {},
): StudentTrueOrFalseActivity => ({
  id: 'activity-tf-1',
  type: 'true_or_false',
  title: 'True or False Test',
  position: 1,
  maxPoints: 30,
  feedbackMode: 'end',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  statements: [
    { id: 'stmt-1', text: 'Riba adalah haram dalam Islam' },
    { id: 'stmt-2', text: 'Zakat adalah rukun iman' },
    { id: 'stmt-3', text: 'Akad murabahah adalah akad jual beli' },
  ],
  ...overrides,
});

export const mockWordSearchActivity = (
  overrides: Partial<StudentWordSearchActivity> = {},
): StudentWordSearchActivity => ({
  id: 'activity-ws-1',
  type: 'word_search',
  title: 'Word Search Test',
  position: 1,
  maxPoints: 30,
  wordList: ['ZAKAT', 'RIBA', 'WAKAF'],
  gridSize: { rows: 8, cols: 8 },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const mockDragDropActivity = (
  overrides: Partial<StudentDragDropActivity> = {},
): StudentDragDropActivity => ({
  id: 'activity-dd-1',
  type: 'drag_drop',
  title: 'Drag Drop Test',
  position: 1,
  maxPoints: 30,
  feedbackMode: 'end',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  categories: ['Halal', 'Haram'],
  items: [
    { id: 'item-1', label: 'Murabahah' },
    { id: 'item-2', label: 'Riba' },
  ],
  ...overrides,
});

export const mockLeaderboardUser = (
  overrides: Partial<LeaderboardUser> = {},
): LeaderboardUser => ({
  uid: 'user-1',
  name: 'Test User',
  totalPoints: 100,
  badges: [],
  ...overrides,
});
