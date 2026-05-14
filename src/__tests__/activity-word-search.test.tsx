/**
 * F7 — Aktivitas: Word Search (TC-F.26)
 * Black-box integration test for the Word Search activity load.
 *
 * TC-F.27 (drag to find word) and TC-F.28 (auto-submit) require
 * DOM drag events with precise cell coordinates → see e2e/activity-word-search.spec.ts.
 */

import { render, screen, waitFor } from '@testing-library/react';

import WordSearchActivityPage from '@/app/(main)/(student)/(course)/course/[courseId]/activity/[activityId]/word-search/page';

import { renderWithProviders } from '@/test-utils/render';
import { mockWordSearchActivity } from '@/test-utils/mocks/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  getStudentActivity: jest.fn(),
  submitActivity: jest.fn(),
}));

jest.mock('@/lib/wordSearch', () => ({
  createSeedFromActivityId: jest.fn(() => 42),
  generateWordSearch: jest.fn(() => ({
    grid: Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => 'A'),
    ),
    placements: [],
  })),
  normalizeWord: jest.fn((w: string) => w.toUpperCase().replace(/\s/g, '')),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    getStudentActivity: jest.Mock;
    submitActivity: jest.Mock;
  };
}

const sampleActivity = mockWordSearchActivity();

// ─── F7 — Aktivitas: Word Search ──────────────────────────────────────────────

describe('F7 — Aktivitas: Word Search', () => {
  beforeEach(() => {
    const { getStudentActivity } = getApiMocks();
    getStudentActivity.mockResolvedValue(sampleActivity);
  });

  function renderPage() {
    return renderWithProviders(
      <WordSearchActivityPage
        params={Promise.resolve({ courseId: 'course-1', activityId: 'activity-ws-1' })}
      />,
      { courseLayout: { refreshContentItems: jest.fn() } },
    );
  }

  // TC-F.26 ──────────────────────────────────────────────────────────────────

  it('TC-F.26: Student membuka halaman aktivitas Word Search', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Word Search Test')).toBeInTheDocument();
    });

    // Grid is rendered (8×8 = 64 letter cells)
    const gridButtons = screen.getAllByRole('button');
    expect(gridButtons.length).toBeGreaterThanOrEqual(64);

    // Word list is displayed with all words unchecked
    expect(screen.getByText('ZAKAT')).toBeInTheDocument();
    expect(screen.getByText('RIBA')).toBeInTheDocument();
    expect(screen.getByText('WAKAF')).toBeInTheDocument();

    // Progress bar starts at 0 — "0/3 kata"
    expect(screen.getByText(/0\/3 kata/i)).toBeInTheDocument();
  });
});
