/**
 * F6 — Aktivitas: True/False (TC-F.23–F.25)
 * Black-box integration tests for the True/False activity.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TrueOrFalseActivityPage from '@/app/(main)/(student)/(course)/course/[courseId]/activity/[activityId]/true-or-false/page';

import { renderWithProviders } from '@/test-utils/render';
import { mockSubmitActivityResponse, mockTrueOrFalseActivity } from '@/test-utils/mocks/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
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
    getStudentActivity: jest.fn(),
    submitActivity: jest.fn(),
    issueCertificate: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    getStudentActivity: jest.Mock;
    submitActivity: jest.Mock;
    issueCertificate: jest.Mock;
  };
}

function getAuthMock() {
  return require('@/contexts/AuthContext') as { useAuth: jest.Mock };
}

const sampleActivity = mockTrueOrFalseActivity();

// ─── F6 — Aktivitas: True/False ────────────────────────────────────────────────

describe('F6 — Aktivitas: True/False', () => {
  beforeEach(() => {
    const { useRouter } = require('next/navigation') as { useRouter: jest.Mock };
    useRouter.mockReturnValue({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });

    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: null,
      loading: false,
      idToken: 'token',
      refreshProfile: jest.fn().mockResolvedValue(undefined),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
      isAdmin: false,
    });

    const { getStudentActivity, issueCertificate } = getApiMocks();
    getStudentActivity.mockResolvedValue(sampleActivity);
    issueCertificate.mockRejectedValue({ code: 'CERTIFICATE_NOT_ELIGIBLE' });
  });

  function renderPage() {
    return renderWithProviders(
      <TrueOrFalseActivityPage
        params={Promise.resolve({ courseId: 'course-1', activityId: 'activity-tf-1' })}
      />,
      { courseLayout: { refreshContentItems: jest.fn() } },
    );
  }

  // TC-F.23 ──────────────────────────────────────────────────────────────────

  it('TC-F.23: Student membuka halaman aktivitas True/False', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('True or False Test')).toBeInTheDocument();
    });

    // All three statements rendered
    expect(screen.getByText('Riba adalah haram dalam Islam')).toBeInTheDocument();
    expect(screen.getByText('Zakat adalah rukun iman')).toBeInTheDocument();
    expect(screen.getByText('Akad murabahah adalah akad jual beli')).toBeInTheDocument();

    // Each statement has Benar + Salah buttons (6 total)
    const benarButtons = screen.getAllByRole('button', { name: /benar/i });
    const salahButtons = screen.getAllByRole('button', { name: /salah/i });
    expect(benarButtons).toHaveLength(3);
    expect(salahButtons).toHaveLength(3);

    // Submit button is NOT visible yet (not all answered)
    expect(screen.queryByRole('button', { name: /kirim jawaban/i })).not.toBeInTheDocument();
  });

  // TC-F.24 ──────────────────────────────────────────────────────────────────

  it('TC-F.24: Student memilih jawaban pada salah satu pernyataan', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Riba adalah haram dalam Islam')).toBeInTheDocument();
    });

    const benarButtons = screen.getAllByRole('button', { name: /benar/i });
    await userEvent.click(benarButtons[0]);

    // After clicking, the button for this statement must be disabled (lock)
    const salahButtons = screen.getAllByRole('button', { name: /salah/i });
    expect(salahButtons[0]).toBeDisabled();
    expect(benarButtons[0]).toBeDisabled();
  });

  // TC-F.25 ──────────────────────────────────────────────────────────────────

  it('TC-F.25: Student menjawab semua pernyataan lalu menekan Submit', async () => {
    const { submitActivity } = getApiMocks();
    submitActivity.mockResolvedValue(mockSubmitActivityResponse({
      score: 3,
      totalItems: 3,
      scorePercent: 100,
      pointsEarned: 30,
    }));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Riba adalah haram dalam Islam')).toBeInTheDocument();
    });

    const benarButtons = screen.getAllByRole('button', { name: /benar/i });
    const salahButtons = screen.getAllByRole('button', { name: /salah/i });

    // Answer all 3 statements
    await userEvent.click(benarButtons[0]);
    await userEvent.click(salahButtons[1]);
    await userEvent.click(benarButtons[2]);

    // Submit button appears only after all answered
    const submitButton = await screen.findByRole('button', { name: /kirim jawaban/i });
    expect(submitButton).toBeInTheDocument();

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitActivity).toHaveBeenCalledWith(
        'course-1',
        'activity-tf-1',
        expect.objectContaining({ answers: expect.any(Object) }),
      );
    });

    // Result screen is shown
    await waitFor(() => {
      expect(screen.getByText(/hasil aktivitas/i)).toBeInTheDocument();
    });
  });
});
