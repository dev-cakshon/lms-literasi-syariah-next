/**
 * Central API client for the LMS backend.
 *
 * All requests go through `apiFetch()` which:
 *   1. Prepends NEXT_PUBLIC_API_URL + /v1
 *   2. Attaches Authorization: Bearer <idToken> when the user is signed in
 *   3. Parses the standard { success, data } / { success, error } envelope
 *   4. Throws `ApiError` on failure so callers can catch consistently
 *
 * The ID token is obtained directly from Firebase Auth's `currentUser.getIdToken()`
 * — no React wiring needed. This survives HMR and module re-evaluation.
 */

import { getAuthInstance } from '@/lib/firebase';

import { API_URL } from '@/constant/env';

import type {
  AdminActivity,
  Badge,
  Certificate,
  Chapter,
  ChatbotMessageResponse,
  Course,
  CourseContentItem,
  CourseProgress,
  DownloadUrlResponse,
  LeaderboardUser,
  Quiz,
  QuizSubmitResult,
  StudentActivity,
  SubmitActivityRequest,
  SubmitActivityResponse,
  UploadUrlResponse,
  UserProfile,
} from '@/types';
import { BADGE_IDS } from '@/types';

const VALID_BADGES = new Set<string>(BADGE_IDS);

function isBadge(value: unknown): value is Badge {
  return typeof value === 'string' && VALID_BADGES.has(value);
}

function extractBadgeIdsFromEarnedBadges(payload: unknown): Badge[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      const badgeId = (item as { id?: unknown }).id;
      return isBadge(badgeId) ? badgeId : null;
    })
    .filter((badge): badge is Badge => badge !== null);
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ─── Get fresh Firebase ID token ─────────────────────────────────────────────

/**
 * Returns a fresh Firebase ID token (JWT) for the currently signed-in user,
 * or `null` if no user is signed in. The SDK auto-refreshes expired tokens.
 */
async function getFirebaseIdToken(): Promise<string | null> {
  try {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = API_URL.replace(/\/+$/, '');
  const url = `${base}/v1${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Always attach the Firebase ID token when a user is signed in
  const idToken = await getFirebaseIdToken();
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  const res = await fetch(url, { ...options, headers });

  // Handle non-JSON responses
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!res.ok) {
      throw new ApiError('NETWORK_ERROR', `HTTP ${res.status}`, res.status);
    }
    return undefined as unknown as T;
  }

  const body = await res.json();

  if (!res.ok || body.success === false) {
    const code = body?.error?.code || 'UNKNOWN';
    const msg = body?.error?.message || `Request failed (${res.status})`;
    throw new ApiError(code, msg, res.status);
  }

  return body.data as T;
}

// ─── Auth endpoints ──────────────────────────────────────────────────────────

export async function authRegister(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{
  uid: string;
  email: string;
  name: string;
  role: string;
  earnedBadges?: { id: string; name: string; icon: string; color: string }[];
}> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function authSync(data?: {
  email?: string;
  displayName?: string;
}): Promise<{
  message: string;
  uid: string;
  role: string;
  earnedBadges: { id: string; name: string; icon: string; color: string }[];
}> {
  return apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  });
}

export async function authMe(): Promise<UserProfile> {
  return apiFetch('/auth/me');
}

export async function authAssignRole(
  uid: string,
  role: string,
): Promise<{ uid: string; role: string }> {
  return apiFetch('/auth/assign-role', {
    method: 'POST',
    body: JSON.stringify({ uid, role }),
  });
}

// ─── Users endpoints (admin) ─────────────────────────────────────────────────

export async function getUsers(params?: {
  role?: string;
  search?: string;
}): Promise<UserProfile[]> {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  return apiFetch(`/users${query ? `?${query}` : ''}`);
}

export async function getUser(uid: string): Promise<UserProfile> {
  return apiFetch(`/users/${uid}`);
}

export async function updateUser(
  uid: string,
  data: { name?: string; email?: string; chatbotEnabled?: boolean },
): Promise<UserProfile> {
  return apiFetch(`/users/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(uid: string): Promise<{ uid: string }> {
  return apiFetch(`/users/${uid}`, { method: 'DELETE' });
}

// ─── Courses endpoints ───────────────────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  return apiFetch('/courses');
}

export async function getCourse(courseId: string): Promise<Course> {
  return apiFetch(`/courses/${courseId}`);
}

export async function createCourse(data: {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
}): Promise<Course> {
  return apiFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(
  courseId: string,
  data: Partial<
    Pick<Course, 'title' | 'description' | 'thumbnailUrl' | 'isPublished'>
  >,
): Promise<Course> {
  return apiFetch(`/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(
  courseId: string,
): Promise<{ id: string; deleted: boolean }> {
  return apiFetch(`/courses/${courseId}`, { method: 'DELETE' });
}

// ─── Chapters endpoints ──────────────────────────────────────────────────────

export async function getChapters(courseId: string): Promise<Chapter[]> {
  return apiFetch(`/courses/${courseId}/chapters`);
}

export async function getChapter(
  courseId: string,
  chapterId: string,
): Promise<Chapter> {
  return apiFetch(`/courses/${courseId}/chapters/${chapterId}`);
}

export async function createChapter(
  courseId: string,
  data: {
    title: string;
    content?: string;
    mediaType?: 'youtube' | 'slides';
    mediaUrl?: string;
    order?: number;
  },
): Promise<Chapter> {
  return apiFetch(`/courses/${courseId}/chapters`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateChapter(
  courseId: string,
  chapterId: string,
  data: Partial<
    Pick<
      Chapter,
      'title' | 'content' | 'mediaType' | 'mediaUrl' | 'order' | 'isPublished'
    >
  >,
): Promise<Chapter> {
  return apiFetch(`/courses/${courseId}/chapters/${chapterId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteChapter(
  courseId: string,
  chapterId: string,
): Promise<{ id: string; deleted: boolean }> {
  return apiFetch(`/courses/${courseId}/chapters/${chapterId}`, {
    method: 'DELETE',
  });
}

// ─── Quizzes endpoints ───────────────────────────────────────────────────────

export async function getQuizzes(courseId: string): Promise<Quiz[]> {
  return apiFetch(`/courses/${courseId}/quizzes`);
}

export async function getQuiz(courseId: string, quizId: string): Promise<Quiz> {
  return apiFetch(`/courses/${courseId}/quizzes/${quizId}`);
}

export async function createQuiz(
  courseId: string,
  data: {
    title: string;
    questions: Quiz['questions'];
    type?: Quiz['type'];
    gamificationType?: Quiz['gamificationType'];
    passingGrade?: number;
    allowRetake?: boolean;
    showAnswers?: boolean;
  },
): Promise<Quiz> {
  return apiFetch(`/courses/${courseId}/quizzes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuiz(
  courseId: string,
  quizId: string,
  data: Partial<
    Pick<
      Quiz,
      | 'title'
      | 'questions'
      | 'type'
      | 'gamificationType'
      | 'passingGrade'
      | 'allowRetake'
      | 'showAnswers'
    >
  >,
): Promise<Quiz> {
  return apiFetch(`/courses/${courseId}/quizzes/${quizId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteQuiz(
  courseId: string,
  quizId: string,
): Promise<{ id: string; deleted: boolean }> {
  return apiFetch(`/courses/${courseId}/quizzes/${quizId}`, {
    method: 'DELETE',
  });
}

export async function submitQuiz(
  courseId: string,
  quizId: string,
  answers: (number | string)[],
): Promise<QuizSubmitResult> {
  const response = await apiFetch<QuizSubmitResult>(
    `/courses/${courseId}/quizzes/${quizId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ answers }),
    },
  );

  if (!response.badges?.length && response.earnedBadges?.length) {
    return {
      ...response,
      badges: extractBadgeIdsFromEarnedBadges(response.earnedBadges),
    };
  }

  return response;
}

// ─── Progress endpoints ──────────────────────────────────────────────────────

export async function markChapterComplete(
  courseId: string,
  chapterId: string,
): Promise<CourseProgress> {
  const response = await apiFetch<CourseProgress>(
    `/courses/${courseId}/progress`,
    {
      method: 'POST',
      body: JSON.stringify({ chapterId }),
    },
  );

  if (!response.badges?.length && response.earnedBadges?.length) {
    return {
      ...response,
      badges: extractBadgeIdsFromEarnedBadges(response.earnedBadges),
    };
  }

  return response;
}

export async function getCourseProgressApi(
  courseId: string,
): Promise<CourseProgress> {
  return apiFetch(`/courses/${courseId}/progress`);
}

export async function resetCourseProgressApi(courseId: string): Promise<{
  deleted: boolean;
  quizResultsCleared: number;
  activityProgressCleared: number;
}> {
  return apiFetch(`/courses/${courseId}/progress`, {
    method: 'DELETE',
  });
}

// ─── Leaderboard endpoint ────────────────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  return apiFetch('/leaderboard');
}

// ─── Chatbot endpoint ────────────────────────────────────────────────────────

export async function sendChatbotMessage(
  message: string,
  sessionId: string,
): Promise<ChatbotMessageResponse> {
  return apiFetch('/chatbot/message', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

// ─── Storage endpoints ───────────────────────────────────────────────────────

export async function getUploadUrl(data: {
  fileName: string;
  contentType: string;
  folder?: string;
}): Promise<UploadUrlResponse> {
  return apiFetch('/storage/upload-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getDownloadUrl(
  fileId: string,
  path?: string,
): Promise<DownloadUrlResponse> {
  const qs = path ? `?path=${encodeURIComponent(path)}` : '';
  return apiFetch(`/storage/download-url/${fileId}${qs}`);
}

// ─── Activity helpers ────────────────────────────────────────────────────────

// Admin CRUD
export const createActivity = (
  courseId: string,
  body: Omit<AdminActivity, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<{ activityId: string }> =>
  apiFetch(`/courses/${courseId}/activities`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const getActivityAdmin = (
  courseId: string,
  activityId: string,
): Promise<AdminActivity> =>
  apiFetch(`/courses/${courseId}/activities/${activityId}`);

export const updateActivity = (
  courseId: string,
  activityId: string,
  body: Partial<Omit<AdminActivity, 'id' | 'type' | 'createdAt' | 'updatedAt'>>,
): Promise<{ message: string }> =>
  apiFetch(`/courses/${courseId}/activities/${activityId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteActivity = (
  courseId: string,
  activityId: string,
): Promise<{ message: string }> =>
  apiFetch(`/courses/${courseId}/activities/${activityId}`, {
    method: 'DELETE',
  });

// Student endpoints
export const getCourseContent = (
  courseId: string,
): Promise<CourseContentItem[]> => apiFetch(`/courses/${courseId}/content`);

export const getStudentActivity = (
  courseId: string,
  activityId: string,
): Promise<StudentActivity> =>
  apiFetch(`/courses/${courseId}/activities/${activityId}`);

export const submitActivity = (
  courseId: string,
  activityId: string,
  body: SubmitActivityRequest,
): Promise<SubmitActivityResponse> =>
  apiFetch(`/courses/${courseId}/activities/${activityId}/submit`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

// ─── Certificate endpoints ───────────────────────────────────────────────────

export async function issueCertificate(courseId: string): Promise<Certificate> {
  return apiFetch(`/courses/${courseId}/certificates`, { method: 'POST' });
}

export async function getCertificate(courseId: string): Promise<Certificate> {
  return apiFetch(`/courses/${courseId}/certificates/me`);
}

export async function getMyAllCertificates(): Promise<Certificate[]> {
  return apiFetch('/certificates/me');
}
