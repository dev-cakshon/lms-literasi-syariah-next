/**
 * F4 — Gamifikasi (TC-F.14–F.18)
 * Black-box integration tests for points, badges, dashboard, and leaderboard.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MarkCompleteButton } from '@/components/course/MarkCompleteButton';
import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ProfileInfo } from '@/components/dashboard/ProfileOverview';

import { renderWithProviders } from '@/test-utils/render';
import {
  mockCourseProgress,
  mockLeaderboardUser,
  mockUserProfile,
} from '@/test-utils/mocks/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-realtime', () => ({
  useCourseProgress: jest.fn(),
  useLeaderboard: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  markChapterComplete: jest.fn(),
  issueCertificate: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/course/c1/chapter/ch-1'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    markChapterComplete: jest.Mock;
    issueCertificate: jest.Mock;
  };
}

function getHookMocks() {
  return require('@/hooks/use-realtime') as {
    useCourseProgress: jest.Mock;
    useLeaderboard: jest.Mock;
  };
}

function getAuthMock() {
  return require('@/contexts/AuthContext') as { useAuth: jest.Mock };
}

function buildMockRouter() {
  return { push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() };
}

const contentItems = [
  { id: 'ch-1', title: 'Bab 1', itemType: 'chapter' as const, position: 1, completed: false, locked: false },
  { id: 'ch-2', title: 'Bab 2', itemType: 'chapter' as const, position: 2, completed: false, locked: false },
];

// ─── F4 — Gamifikasi ──────────────────────────────────────────────────────────

describe('F4 — Gamifikasi', () => {
  beforeEach(() => {
    const { useRouter } = require('next/navigation') as { useRouter: jest.Mock };
    useRouter.mockReturnValue(buildMockRouter());

    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: mockUserProfile({ uid: 'user-1', totalPoints: 50, badges: ['first_step'] }),
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

    getHookMocks().useLeaderboard.mockReturnValue({
      data: [],
      loading: false,
    });
  });

  // TC-F.14 ──────────────────────────────────────────────────────────────────

  it('TC-F.14: Student menyelesaikan bab untuk pertama kali', async () => {
    const { markChapterComplete, issueCertificate } = getApiMocks();
    markChapterComplete.mockResolvedValue(
      mockCourseProgress({ pointsAwarded: 10, percentage: 50 }),
    );
    issueCertificate.mockRejectedValue(new Error('not eligible'));

    const mockOnComplete = jest.fn();

    renderWithProviders(
      <MarkCompleteButton
        courseId='c1'
        chapterId='ch-1'
        onComplete={mockOnComplete}
        label='Tandai Selesai'
      />,
      { courseLayout: { contentItems, refreshContentItems: jest.fn() } },
    );

    await userEvent.click(screen.getByRole('button', { name: /tandai selesai/i }));

    await waitFor(() => {
      // onComplete called with 10 poin → drives the PointsToast in ChapterContent
      expect(mockOnComplete).toHaveBeenCalledWith(10);
    });
  });

  // TC-F.15 ──────────────────────────────────────────────────────────────────

  it('TC-F.15: Student menekan "Mark as Complete" pada bab yang sudah pernah diselesaikan', () => {
    // When completedChapters already includes ch-1, MarkCompleteButton returns null.
    getHookMocks().useCourseProgress.mockReturnValue({
      completedChapters: ['ch-1'],
      percentage: 50,
      loading: false,
    });

    renderWithProviders(
      <MarkCompleteButton
        courseId='c1'
        chapterId='ch-1'
        onComplete={jest.fn()}
        label='Tandai Selesai'
      />,
      { courseLayout: { contentItems, refreshContentItems: jest.fn() } },
    );

    // Button is absent → no second API call possible from the UI
    expect(screen.queryByRole('button', { name: /tandai selesai/i })).not.toBeInTheDocument();
  });

  // TC-F.16 ──────────────────────────────────────────────────────────────────

  it('TC-F.16: Student mencapai kondisi unlock badge untuk pertama kali', async () => {
    const { markChapterComplete, issueCertificate } = getApiMocks();
    markChapterComplete.mockResolvedValue(
      mockCourseProgress({
        pointsAwarded: 10,
        percentage: 50,
        badges: ['first_step'],
      }),
    );
    issueCertificate.mockRejectedValue(new Error('not eligible'));

    renderWithProviders(
      <MarkCompleteButton
        courseId='c1'
        chapterId='ch-1'
        onComplete={jest.fn()}
        label='Tandai Selesai'
      />,
      { courseLayout: { contentItems, refreshContentItems: jest.fn() } },
    );

    await userEvent.click(screen.getByRole('button', { name: /tandai selesai/i }));

    await waitFor(() => {
      // BadgeAwardModal shows "Badge Unlocked" dialog when awardedBadges.length > 0
      expect(screen.getByText(/badge unlocked/i)).toBeInTheDocument();
    });
  });

  // TC-F.17 ──────────────────────────────────────────────────────────────────

  it('TC-F.17: Student membuka halaman Dashboard — Points & Badges', () => {
    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: mockUserProfile({ uid: 'user-1', totalPoints: 150, badges: ['first_step', 'active_learner'] }),
      loading: false,
      idToken: 'token',
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
      isAdmin: false,
    });

    render(<ProfileInfo />);

    // totalPoints displayed
    expect(screen.getByText('150')).toBeInTheDocument();
    // badge count displayed (2 badges)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // TC-F.18 ──────────────────────────────────────────────────────────────────

  it('TC-F.18: Student membuka halaman Dashboard — Leaderboard', () => {
    const leaderboardUsers = [
      mockLeaderboardUser({ uid: 'u1', name: 'Siti Aminah', totalPoints: 300 }),
      mockLeaderboardUser({ uid: 'u2', name: 'Budi Santoso', totalPoints: 250 }),
      mockLeaderboardUser({ uid: 'u3', name: 'Dewi Rahmawati', totalPoints: 200 }),
    ];

    getHookMocks().useLeaderboard.mockReturnValue({
      data: leaderboardUsers,
      loading: false,
    });

    // current user (user-1) is in the leaderboard → no extra Firestore calls
    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'u1' },
      userProfile: mockUserProfile({ uid: 'u1', name: 'Siti Aminah' }),
      loading: false,
      idToken: 'token',
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
      isAdmin: false,
    });

    render(<Leaderboard />);

    // All three users appear
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Dewi Rahmawati')).toBeInTheDocument();

    // Verify descending order by DOM position:
    // Siti (300 poin) must appear before Budi (250 poin) in the document
    const sitiPosition = screen.getByText('Siti Aminah').compareDocumentPosition(
      screen.getByText('Budi Santoso'),
    );
    // Node.DOCUMENT_POSITION_FOLLOWING (4) means Budi comes after Siti → correct order
    expect(sitiPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
