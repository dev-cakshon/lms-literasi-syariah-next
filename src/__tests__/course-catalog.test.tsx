/**
 * F2 — Katalog Kursus (TC-F.06–F.08)
 * Black-box integration tests for the course catalog and search.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MyCoursesPage from '@/app/(main)/(student)/my-courses/page';
import { mockCourse } from '@/test-utils/mocks/api';

// ─── Module mocks ─────────────────────────────────────────────────────────────

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
    getCourses: jest.fn(),
    getCourseProgressApi: jest.fn(),
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getApiMocks() {
  return require('@/lib/api') as {
    getCourses: jest.Mock;
    getCourseProgressApi: jest.Mock;
  };
}

const sampleCourses = [
  mockCourse({ id: 'c1', title: 'Ekonomi Syariah Dasar', totalChapters: 3 }),
  mockCourse({ id: 'c2', title: 'Perbankan Islam Lanjutan', totalChapters: 5 }),
  mockCourse({
    id: 'c3',
    title: 'Manajemen Zakat dan Wakaf',
    totalChapters: 4,
  }),
];

// ─── F2 — Katalog Kursus ──────────────────────────────────────────────────────

describe('F2 — Katalog Kursus', () => {
  beforeEach(() => {
    const { getCourses, getCourseProgressApi } = getApiMocks();
    getCourses.mockResolvedValue(sampleCourses);
    getCourseProgressApi.mockResolvedValue({ percentage: 0 });
  });

  // TC-F.06 ──────────────────────────────────────────────────────────────────

  it('TC-F.06: Student membuka halaman kursus', async () => {
    render(<MyCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ekonomi Syariah Dasar')).toBeInTheDocument();
      expect(screen.getByText('Perbankan Islam Lanjutan')).toBeInTheDocument();
      expect(screen.getByText('Manajemen Zakat dan Wakaf')).toBeInTheDocument();
    });
  });

  // TC-F.07 ──────────────────────────────────────────────────────────────────

  it('TC-F.07: Student mencari kursus menggunakan kata kunci yang cocok dengan judul', async () => {
    render(<MyCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ekonomi Syariah Dasar')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari kursus/i);
    await userEvent.type(searchInput, 'perbankan');

    await waitFor(() => {
      expect(screen.getByText('Perbankan Islam Lanjutan')).toBeInTheDocument();
      expect(
        screen.queryByText('Ekonomi Syariah Dasar'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Manajemen Zakat dan Wakaf'),
      ).not.toBeInTheDocument();
    });
  });

  // TC-F.08 ──────────────────────────────────────────────────────────────────

  it('TC-F.08: Student mencari kursus dengan kata kunci yang tidak cocok', async () => {
    render(<MyCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ekonomi Syariah Dasar')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/cari kursus/i);
    await userEvent.type(searchInput, 'kursus tidak ada sama sekali xyz');

    await waitFor(() => {
      expect(
        screen.queryByText('Ekonomi Syariah Dasar'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Perbankan Islam Lanjutan'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Manajemen Zakat dan Wakaf'),
      ).not.toBeInTheDocument();
    });
  });
});
