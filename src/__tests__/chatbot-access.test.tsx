/**
 * PRD10 — Chatbot Access gating
 * Verifies that chatbotEnabled controls visibility of chatbot entry points.
 */

import { render, screen } from '@testing-library/react';

import { NavbarRoutes } from '@/components/navbar/NavbarRoutes';

import ChatbotPage from '@/app/(main)/(student)/chatbot/page';
import { mockUserProfile } from '@/test-utils/mocks/api';

// ─── Module mocks ──────────────────────────────────────────────────────────────
// Note: jest.setup.ts calls jest.resetAllMocks() afterEach, which clears mock
// implementations. Re-apply them in beforeEach inside each describe block.

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/chatbot', () => ({
  getSessions: jest.fn(),
  createSession: jest.fn(),
  streamChat: jest.fn(),
  getMessages: jest.fn(),
  deleteSession: jest.fn(),
  renameSession: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthMock() {
  return require('@/contexts/AuthContext') as { useAuth: jest.Mock };
}

function getNavigationMocks() {
  return require('next/navigation') as {
    usePathname: jest.Mock;
    useRouter: jest.Mock;
  };
}

function getChatbotMocks() {
  return require('@/lib/chatbot') as { getSessions: jest.Mock };
}

// ─── ChatbotPage gating ────────────────────────────────────────────────────────

describe('ChatbotPage — access gating', () => {
  beforeEach(() => {
    getChatbotMocks().getSessions.mockResolvedValue([]);
  });

  it('shows denied state when chatbotEnabled is false', () => {
    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: mockUserProfile({ chatbotEnabled: false }),
      loading: false,
      idToken: 'token-123',
      isAdmin: false,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
    });

    render(<ChatbotPage />);

    expect(screen.getByText('Chatbot belum tersedia')).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/ketik pertanyaan anda/i),
    ).not.toBeInTheDocument();
  });

  it('shows chat shell when chatbotEnabled is true', () => {
    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: mockUserProfile({ chatbotEnabled: true }),
      loading: false,
      idToken: 'token-123',
      isAdmin: false,
      refreshProfile: jest.fn(),
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
    });

    render(<ChatbotPage />);

    expect(
      screen.queryByText('Chatbot belum tersedia'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/ketik pertanyaan anda/i),
    ).toBeInTheDocument();
  });
});

// ─── NavbarRoutes gating ───────────────────────────────────────────────────────

describe('NavbarRoutes — chatbot link visibility', () => {
  beforeEach(() => {
    const nav = getNavigationMocks();
    nav.usePathname.mockReturnValue('/dashboard');
    nav.useRouter.mockReturnValue({ push: jest.fn() });
  });

  it('shows Chatbot link when chatbotEnabled is true', () => {
    getAuthMock().useAuth.mockReturnValue({
      userProfile: mockUserProfile({ chatbotEnabled: true }),
      isAdmin: false,
    });

    render(<NavbarRoutes />);

    expect(screen.getByText('Chatbot')).toBeInTheDocument();
  });

  it('hides Chatbot link when chatbotEnabled is false', () => {
    getAuthMock().useAuth.mockReturnValue({
      userProfile: mockUserProfile({ chatbotEnabled: false }),
      isAdmin: false,
    });

    render(<NavbarRoutes />);

    expect(screen.queryByText('Chatbot')).not.toBeInTheDocument();
  });
});
