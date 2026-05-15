/**
 * F5 — Chatbot AI (TC-F.19–F.22)
 * Black-box integration tests for chatbot session management and messaging.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChatbotPage from '@/app/(main)/(student)/chatbot/page';

// ─── Module mocks ─────────────────────────────────────────────────────────────

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

function getChatbotMocks() {
  return require('@/lib/chatbot') as {
    getSessions: jest.Mock;
    createSession: jest.Mock;
    streamChat: jest.Mock;
    getMessages: jest.Mock;
    deleteSession: jest.Mock;
    renameSession: jest.Mock;
  };
}

const mockSession = {
  session_id: 'sess-1',
  title: 'Bagi Hasil',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockMessage = {
  message_id: 'msg-1',
  role: 'user' as const,
  content: 'Jelaskan konsep bagi hasil',
  timestamp: '2024-01-01T00:00:00Z',
};

const mockBotMessage = {
  message_id: 'msg-2',
  role: 'assistant' as const,
  content: 'Bagi hasil adalah...',
  timestamp: '2024-01-01T00:00:01Z',
};

// ─── F5 — Chatbot AI ──────────────────────────────────────────────────────────

describe('F5 — Chatbot AI', () => {
  beforeEach(() => {
    getAuthMock().useAuth.mockReturnValue({
      user: { uid: 'user-1' },
      userProfile: null,
      loading: false,
      idToken: 'token-123',
      signIn: jest.fn(),
      signUp: jest.fn(),
      logout: jest.fn(),
      refreshProfile: jest.fn(),
      isAdmin: false,
    });

    const mocks = getChatbotMocks();
    mocks.getSessions.mockResolvedValue([]);
    mocks.createSession.mockResolvedValue(mockSession);
    mocks.streamChat.mockImplementation(
      (
        _sessionId: string,
        _prompt: string,
        _token: string,
        onToken: (t: string) => void,
        onDone: () => void,
      ) => {
        onToken('Bagi hasil adalah...');
        onDone();
        return Promise.resolve();
      },
    );
    mocks.getMessages.mockResolvedValue([mockMessage, mockBotMessage]);
    mocks.renameSession.mockResolvedValue(undefined);
  });

  // TC-F.19 ──────────────────────────────────────────────────────────────────

  it('TC-F.19: Student membuka chatbot dan mengirim pesan pertama', async () => {
    const mocks = getChatbotMocks();

    render(<ChatbotPage />);

    const textarea = screen.getByPlaceholderText(/ketik pertanyaan anda/i);
    await userEvent.type(textarea, 'Jelaskan konsep bagi hasil');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mocks.createSession).toHaveBeenCalledWith('token-123');
    });

    // User message appears in chat
    await waitFor(() => {
      expect(
        screen.getByText('Jelaskan konsep bagi hasil'),
      ).toBeInTheDocument();
    });

    // Bot response appears after streaming
    await waitFor(() => {
      expect(screen.getByText('Bagi hasil adalah...')).toBeInTheDocument();
    });
  });

  // TC-F.20 ──────────────────────────────────────────────────────────────────

  it('TC-F.20: Student mengirim pesan lanjutan dalam chat yang sudah ada', async () => {
    const mocks = getChatbotMocks();
    // Pre-set session loaded
    mocks.getSessions.mockResolvedValue([mockSession]);

    // simulasikan sesi sudah aktif dengan pesan sebelumnya
    mocks.getMessages.mockResolvedValue([mockMessage, mockBotMessage]);

    render(<ChatbotPage />);

    // Select the existing session by clicking it in sidebar
    await waitFor(() => {
      expect(mocks.getSessions).toHaveBeenCalled();
    });

    const sessionItem = await screen.findByText('Bagi Hasil');
    await userEvent.click(sessionItem);

    await waitFor(() => {
      // History messages are loaded
      expect(
        screen.getByText('Jelaskan konsep bagi hasil'),
      ).toBeInTheDocument();
      expect(screen.getByText('Bagi hasil adalah...')).toBeInTheDocument();
    });

    // Send a follow-up
    const textarea = screen.getByPlaceholderText(/ketik pertanyaan anda/i);
    await userEvent.type(textarea, 'Apa contoh akadnya?');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      // createSession NOT called again (session already exists)
      expect(mocks.createSession).not.toHaveBeenCalled();
      // streamChat called with existing session id
      expect(mocks.streamChat).toHaveBeenCalledWith(
        'sess-1',
        'Apa contoh akadnya?',
        'token-123',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      );
    });
  });

  // TC-F.21 ──────────────────────────────────────────────────────────────────

  it('TC-F.21: Student menekan tombol "New Chat"', async () => {
    const mocks = getChatbotMocks();
    // Use a unique bot response text that is NOT one of the suggestion chips
    const uniqueBotMsg = {
      ...mockBotMessage,
      content: 'Murabahah adalah akad jual beli...',
    };
    mocks.getSessions.mockResolvedValue([mockSession]);
    mocks.getMessages.mockResolvedValue([mockMessage, uniqueBotMsg]);

    render(<ChatbotPage />);

    // Load an existing session first
    const sessionItem = await screen.findByText('Bagi Hasil');
    await userEvent.click(sessionItem);

    // Bot message from history is visible
    await waitFor(() => {
      expect(
        screen.getByText('Murabahah adalah akad jual beli...'),
      ).toBeInTheDocument();
    });

    // Multiple "Chat Baru" buttons exist (sidebar + chat area). Click the first.
    const newChatButtons = screen.getAllByRole('button', {
      name: /chat baru/i,
    });
    await userEvent.click(newChatButtons[0]);

    // Chat history is cleared (bot response no longer shown)
    await waitFor(() => {
      expect(
        screen.queryByText('Murabahah adalah akad jual beli...'),
      ).not.toBeInTheDocument();
    });

    // Welcome / empty state is shown
    expect(screen.getByText(/asisten syariah/i)).toBeInTheDocument();
  });

  // TC-F.22 ──────────────────────────────────────────────────────────────────

  it('TC-F.22: Student memilih chat lama dari sidebar', async () => {
    const mocks = getChatbotMocks();
    mocks.getSessions.mockResolvedValue([mockSession]);
    mocks.getMessages.mockResolvedValue([mockMessage, mockBotMessage]);

    render(<ChatbotPage />);

    const sessionItem = await screen.findByText('Bagi Hasil');
    await userEvent.click(sessionItem);

    await waitFor(() => {
      expect(mocks.getMessages).toHaveBeenCalledWith('sess-1', 'token-123');
    });

    // Both messages (user + bot) from history are rendered
    expect(screen.getByText('Jelaskan konsep bagi hasil')).toBeInTheDocument();
    expect(screen.getByText('Bagi hasil adalah...')).toBeInTheDocument();
  });
});
