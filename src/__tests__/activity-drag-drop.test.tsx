/**
 * F8 — Aktivitas: Drag & Drop (TC-F.29)
 * Black-box integration test for the Drag & Drop activity load.
 *
 * TC-F.30 (drag items and submit) requires real drag-and-drop coordinates
 * that cannot be reliably simulated in jsdom → see e2e/activity-drag-drop.spec.ts.
 */

import { render, screen, waitFor } from '@testing-library/react';

import { DragDropPlayer } from '@/components/activity/DragDropPlayer';

import { renderWithProviders } from '@/test-utils/render';
import { mockDragDropActivity } from '@/test-utils/mocks/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  getStudentActivity: jest.fn(),
  submitActivity: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    getStudentActivity: jest.Mock;
    submitActivity: jest.Mock;
  };
}

const sampleActivity = mockDragDropActivity();

// ─── F8 — Aktivitas: Drag & Drop ──────────────────────────────────────────────

describe('F8 — Aktivitas: Drag & Drop', () => {
  beforeEach(() => {
    const { getStudentActivity } = getApiMocks();
    getStudentActivity.mockResolvedValue(sampleActivity);
  });

  function renderPage() {
    return renderWithProviders(
      <DragDropPlayer
        params={Promise.resolve({ courseId: 'course-1', activityId: 'activity-dd-1' })}
      />,
      { courseLayout: { refreshContentItems: jest.fn() } },
    );
  }

  // TC-F.29 ──────────────────────────────────────────────────────────────────

  it('TC-F.29: Student membuka halaman aktivitas Drag & Drop', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Drag Drop Test')).toBeInTheDocument();
    });

    // Category buckets are displayed
    expect(screen.getByText('Halal')).toBeInTheDocument();
    expect(screen.getByText('Haram')).toBeInTheDocument();

    // Pool items are displayed (unassigned)
    expect(screen.getByText('Murabahah')).toBeInTheDocument();
    expect(screen.getByText('Riba')).toBeInTheDocument();

    // Progress: "0/2 terpetakan" (no items assigned yet)
    expect(screen.getByText(/0\/2 terpetakan/i)).toBeInTheDocument();
  });
});
