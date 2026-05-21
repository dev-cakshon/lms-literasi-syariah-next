/**
 * F3 — Course Viewer (TC-F.09–F.12)
 * Black-box integration tests for course overview, chapter viewer,
 * mark-as-complete, and idempotency.
 *
 * TC-F.13 (cross-tab real-time) is in e2e/course-viewer.spec.ts.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ChapterContent } from '@/components/course/ChapterContent';
import { MarkCompleteButton } from '@/components/course/MarkCompleteButton';

import CourseIdPage from '@/app/(main)/(student)/(course)/course/[courseId]/page';
import {
  mockChapterItem,
  mockCourse,
  mockCourseProgress,
} from '@/test-utils/mocks/api';
import { renderWithProviders } from '@/test-utils/render';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-realtime', () => ({
  useCourseProgress: jest.fn(),
  useLeaderboard: jest.fn(),
}));

jest.mock('@/lib/api', () => {
  class ApiError extends Error {
    code: string;
    status: number;
    constructor(code: string, message: string, status = 500) {
      super(message);
      this.code = code;
      this.status = status;
    }
  }
  return {
    ApiError,
    getCourse: jest.fn(),
    getCourseContent: jest.fn(),
    getCertificate: jest.fn(),
    markChapterComplete: jest.fn(),
    issueCertificate: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/course/course-1/chapter/ch-1'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    getCourse: jest.Mock;
    getCourseContent: jest.Mock;
    getCertificate: jest.Mock;
    markChapterComplete: jest.Mock;
    issueCertificate: jest.Mock;
  };
}

function getHookMocks() {
  return require('@/hooks/use-realtime') as {
    useCourseProgress: jest.Mock;
  };
}

function getAuthMock() {
  return require('@/contexts/AuthContext') as { useAuth: jest.Mock };
}

function buildMockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  };
}

const courseContentItems = [
  mockChapterItem({ id: 'ch-1', title: 'Pengenalan', position: 1 }),
  mockChapterItem({ id: 'ch-2', title: 'Zakat Mal', position: 2 }),
];

// ─── F3 — Course Viewer ───────────────────────────────────────────────────────

describe('F3 — Course Viewer', () => {
  beforeEach(() => {
    const { useRouter } = require('next/navigation') as {
      useRouter: jest.Mock;
    };
    useRouter.mockReturnValue(buildMockRouter());

    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: {
        uid: 'user-1',
        name: 'Student',
        totalPoints: 0,
        badges: [],
      },
      loading: false,
      idToken: 'token',
      refreshProfile: jest.fn().mockResolvedValue(undefined),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
      isAdmin: false,
    });

    getHookMocks().useCourseProgress.mockReturnValue({
      completedChapters: [],
      percentage: 0,
      loading: false,
    });
  });

  // TC-F.09 ──────────────────────────────────────────────────────────────────

  it('TC-F.09: Student membuka halaman overview kursus', async () => {
    const { getCourse, getCourseContent, getCertificate } = getApiMocks();
    getCourse.mockResolvedValue(
      mockCourse({ id: 'course-1', title: 'Ekonomi Syariah Dasar' }),
    );
    getCourseContent.mockResolvedValue(courseContentItems);
    getCertificate.mockRejectedValue({
      code: 'CERTIFICATE_NOT_FOUND',
      status: 404,
    });

    render(<CourseIdPage params={Promise.resolve({ courseId: 'course-1' })} />);

    await waitFor(() => {
      expect(screen.getByText('1. Pengenalan')).toBeInTheDocument();
      expect(screen.getByText('2. Zakat Mal')).toBeInTheDocument();
    });

    // Progress indicator is visible: "0/2 konten selesai"
    expect(screen.getByText(/0\/2 konten selesai/i)).toBeInTheDocument();
  });

  // TC-F.10 ──────────────────────────────────────────────────────────────────

  it('TC-F.10: Student membuka sebuah bab', () => {
    render(
      <ChapterContent
        courseId='course-1'
        chapterId='ch-1'
        title='Pengenalan Ekonomi Syariah'
        mediaUrl='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        mediaType='youtube'
        content='## Materi\n\nEkonomi syariah adalah...'
        chapterOrdinal={1}
        courseTitle='Ekonomi Syariah Dasar'
      />,
    );

    expect(screen.getByText('Pengenalan Ekonomi Syariah')).toBeInTheDocument();
    // react-markdown is mocked — raw markdown string is rendered as-is in a div
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    // Media block is present (YouTube player container)
    expect(screen.getByText(/▶ Video/i)).toBeInTheDocument();
  });

  // TC-F.11 ──────────────────────────────────────────────────────────────────

  it('TC-F.11: Student menekan tombol "Mark as Complete" pada bab yang belum selesai', async () => {
    const { markChapterComplete, issueCertificate } = getApiMocks();
    const { useRouter } = require('next/navigation') as {
      useRouter: jest.Mock;
    };
    const mockRouter = buildMockRouter();
    useRouter.mockReturnValue(mockRouter);

    markChapterComplete.mockResolvedValue(
      mockCourseProgress({ pointsAwarded: 10, percentage: 50 }),
    );
    issueCertificate.mockRejectedValue(new Error('not eligible'));

    const mockRefreshContentItems = jest.fn();

    renderWithProviders(
      <MarkCompleteButton
        courseId='course-1'
        chapterId='ch-1'
        onComplete={jest.fn()}
      />,
      {
        courseLayout: {
          contentItems: courseContentItems,
          refreshContentItems: mockRefreshContentItems,
        },
      },
    );

    const button = screen.getByRole('button', {
      name: /tandai bab ini selesai/i,
    });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    await waitFor(() => {
      expect(markChapterComplete).toHaveBeenCalledWith('course-1', 'ch-1');
      expect(mockRefreshContentItems).toHaveBeenCalled();
    });
  });

  // TC-F.12 ──────────────────────────────────────────────────────────────────

  it('TC-F.12: Student membuka bab yang sudah selesai', () => {
    // useCourseProgress returns ch-1 as already completed
    getHookMocks().useCourseProgress.mockReturnValue({
      completedChapters: ['ch-1'],
      percentage: 50,
      loading: false,
    });

    render(
      <ChapterContent
        courseId='course-1'
        chapterId='ch-1'
        title='Pengenalan'
        mediaUrl=''
        mediaType='youtube'
        content='Konten bab'
        chapterOrdinal={1}
        courseTitle='Ekonomi Syariah'
      />,
    );

    // "Tandai Bab Ini Selesai" completion block must NOT appear
    expect(
      screen.queryByText(/tandai bab ini selesai/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/sudah paham materinya/i),
    ).not.toBeInTheDocument();
  });
});
