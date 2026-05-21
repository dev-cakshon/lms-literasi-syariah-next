/**
 * F1 — Autentikasi (TC-F.01–F.05)
 * Black-box integration tests for register and login flows.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

import LoginPage from '@/app/(landing-page)/login/page';
import { useAuth } from '@/contexts/AuthContext';

// ─── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function buildMockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  };
}

// ─── F1 — Autentikasi ─────────────────────────────────────────────────────────

describe('F1 — Autentikasi', () => {
  beforeEach(() => {
    const { useRouter } = require('next/navigation') as {
      useRouter: jest.Mock;
    };
    useRouter.mockReturnValue(buildMockRouter());
  });

  // TC-F.01 ──────────────────────────────────────────────────────────────────

  it('TC-F.01: Register dengan data valid (nama, email baru, password ≥ 6 karakter)', async () => {
    const mockSignUp = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      idToken: null,
      signUp: mockSignUp,
      signIn: jest.fn(),
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: false,
    });

    render(<SignupForm />);

    await userEvent.type(
      screen.getByLabelText(/nama lengkap/i),
      'Test Student',
    );
    await userEvent.type(screen.getByLabelText(/^email$/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(
      screen.getByLabelText(/konfirmasi password/i),
      'password123',
    );
    await userEvent.click(screen.getByRole('button', { name: /daftar/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'Test Student',
        'new@test.com',
        'password123',
      );
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // TC-F.02 ──────────────────────────────────────────────────────────────────

  it('TC-F.02: Register dengan email yang sudah terdaftar', async () => {
    const mockSignUp = jest
      .fn()
      .mockRejectedValue(
        new Error(
          'Email sudah terdaftar. Silakan gunakan email lain atau masuk (login) ke akun Anda.',
        ),
      );
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      idToken: null,
      signUp: mockSignUp,
      signIn: jest.fn(),
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: false,
    });

    render(<SignupForm />);

    await userEvent.type(
      screen.getByLabelText(/^email$/i),
      'existing@test.com',
    );
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123');
    await userEvent.type(
      screen.getByLabelText(/konfirmasi password/i),
      'password123',
    );
    await userEvent.click(screen.getByRole('button', { name: /daftar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email sudah terdaftar/i)).toBeInTheDocument();
    });
  });

  // TC-F.03 ──────────────────────────────────────────────────────────────────

  it('TC-F.03: Login sebagai student dengan kredensial valid', async () => {
    const { useRouter } = require('next/navigation') as {
      useRouter: jest.Mock;
    };
    const mockRouter = buildMockRouter();
    useRouter.mockReturnValue(mockRouter);

    const mockUser = {
      uid: 'user-1',
      getIdToken: jest.fn().mockResolvedValue('token-student'),
      getIdTokenResult: jest.fn().mockResolvedValue({
        claims: { role: 'student' },
      }),
    };

    mockUseAuth.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: mockUser as any,
      userProfile: null,
      loading: false,
      idToken: 'token-student',
      signUp: jest.fn(),
      signIn: jest.fn(),
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: false,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
    });
  });

  // TC-F.04 ──────────────────────────────────────────────────────────────────

  it('TC-F.04: Login sebagai admin dengan kredensial valid', async () => {
    const { useRouter } = require('next/navigation') as {
      useRouter: jest.Mock;
    };
    const mockRouter = buildMockRouter();
    useRouter.mockReturnValue(mockRouter);

    const mockAdminUser = {
      uid: 'admin-1',
      getIdToken: jest.fn().mockResolvedValue('token-admin'),
      getIdTokenResult: jest.fn().mockResolvedValue({
        claims: { role: 'admin' },
      }),
    };

    mockUseAuth.mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: mockAdminUser as any,
      userProfile: null,
      loading: false,
      idToken: 'token-admin',
      signUp: jest.fn(),
      signIn: jest.fn(),
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: true,
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin/course');
    });
  });

  // TC-F.05 ──────────────────────────────────────────────────────────────────

  it('TC-F.05: Login dengan password salah', async () => {
    // firebase/app is mocked to export a FirebaseError class. LoginForm uses
    // `instanceof FirebaseError` to map error codes to Indonesian messages.
    const { FirebaseError } = require('firebase/app') as {
      FirebaseError: new (
        code: string,
        msg: string,
      ) => Error & { code: string };
    };
    const wrongPasswordError = new FirebaseError(
      'auth/wrong-password',
      'Wrong password',
    );
    const mockSignIn = jest.fn().mockRejectedValue(wrongPasswordError);

    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      idToken: null,
      signUp: jest.fn(),
      signIn: mockSignIn,
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: false,
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/^email$/i), 'student@test.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'salahpassword');
    await userEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByText(/password salah/i)).toBeInTheDocument();
    });
  });
});
