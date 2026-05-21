'use client';

import {
  AlertCircle,
  ArrowDown,
  Bot,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createSession,
  deleteSession,
  getMessages,
  getSessions,
  renameSession,
  streamChat,
} from '@/lib/chatbot';

import { ChatInput } from '@/components/chatbot/ChatInput';
import { ChatMessage } from '@/components/chatbot/ChatMessage';
import { ChatSidebar } from '@/components/chatbot/ChatSidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';

import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const { idToken } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatPendingDelete, setChatPendingDelete] = useState<string | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const scrollToBottom = useCallback(
    (force = false) => {
      if (force || isAutoScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    [isAutoScroll],
  );

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadSessions = useCallback(async () => {
    if (!idToken) return [];
    try {
      const sessions = await getSessions(idToken);
      const mapped = sessions.map((s) => ({
        id: s.session_id,
        title: s.title,
        timestamp: new Date(s.updated_at),
      }));
      setChats(mapped);
      return mapped;
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Gagal memuat riwayat chat. Pastikan koneksi backend aktif.');
      return [];
    }
  }, [idToken]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
    setIsAutoScroll(true);
  };

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      if (!idToken || isStreaming) return;
      setActiveChatId(chatId);
      setIsLoading(true);
      setError(null);
      setIsAutoScroll(true);
      try {
        const history = await getMessages(chatId, idToken);
        const loadedMessages: Message[] = history.map((item) => ({
          id: item.message_id,
          role: item.role === 'assistant' ? 'bot' : 'user',
          content: item.content,
          timestamp: new Date(item.timestamp),
        }));
        setMessages(loadedMessages);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Gagal memuat riwayat chat: ${errorMessage}`);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    },
    [idToken, isStreaming],
  );

  const handleDeleteChat = useCallback((chatId: string) => {
    setChatPendingDelete(chatId);
  }, []);

  const confirmDeleteChat = useCallback(async () => {
    if (!idToken || !chatPendingDelete) return;
    const chatId = chatPendingDelete;
    setChatPendingDelete(null);
    try {
      await deleteSession(chatId, idToken);
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
        setError(null);
        setIsAutoScroll(true);
      }
      void loadSessions();
    } catch {
      setError('Gagal menghapus chat');
    }
  }, [idToken, chatPendingDelete, activeChatId, loadSessions]);

  const handleRenameChat = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!idToken) return;
      try {
        await renameSession(chatId, newTitle, idToken);
        void loadSessions();
      } catch {
        setError('Gagal mengubah nama chat');
      }
    },
    [idToken, loadSessions],
  );

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !idToken || isStreaming) return;
    setError(null);
    setIsAutoScroll(true);

    let currentSessionId = activeChatId;

    try {
      if (!currentSessionId) {
        setIsLoading(true);
        const session = await createSession(idToken);
        currentSessionId = session.session_id;
        setActiveChatId(currentSessionId);
        setChats((prev) => [
          {
            id: session.session_id,
            title: 'Sesi Baru...',
            timestamp: new Date(session.created_at),
          },
          ...prev,
        ]);
        setIsLoading(false);
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const botMessageId = `bot-${Date.now()}`;
      setIsStreaming(true);

      let fullContent = '';
      let isFirstToken = true;

      await streamChat(
        currentSessionId,
        content.trim(),
        idToken,
        (token) => {
          if (isFirstToken) {
            setMessages((prev) => [
              ...prev,
              {
                id: botMessageId,
                role: 'bot',
                content: token,
                timestamp: new Date(),
              },
            ]);
            isFirstToken = false;
            fullContent = token;
          } else {
            fullContent += token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? { ...msg, content: fullContent }
                  : msg,
              ),
            );
          }
        },
        () => {
          setIsStreaming(false);
          // Re-fetch the persisted bot message so newlines (and thus block-level
          // markdown) are intact, identical to what a page reload would show.
          if (currentSessionId && idToken) {
            getMessages(currentSessionId, idToken)
              .then((history) => {
                const lastAssistant = [...history]
                  .reverse()
                  .find((m) => m.role === 'assistant');
                if (
                  lastAssistant &&
                  lastAssistant.content.length >= fullContent.length
                ) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: lastAssistant.content }
                        : msg,
                    ),
                  );
                }
              })
              .catch(() => {
                // keep the streamed fullContent on error
              });
          }
          let attempts = 0;
          const sessionIdToCheck = currentSessionId;
          const pollTitle = async () => {
            const freshSessions = await loadSessions();
            attempts++;
            const stillDefault = freshSessions?.find(
              (c) => c.id === sessionIdToCheck && c.title === 'Sesi Baru...',
            );
            if (stillDefault && attempts < 6) {
              setTimeout(pollTitle, 2000);
            }
          };
          setTimeout(pollTitle, 2000);
        },
        (err) => {
          setError(`Gagal memuat jawaban: ${err}`);
          setIsStreaming(false);
        },
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Terjadi kesalahan: ${errorMessage}`);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-[calc(100vh-4rem)]'>
      {/* Sidebar */}
      <div className='hidden md:block'>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      </div>

      {/* Main Chat Area */}
      <div className='flex flex-col flex-1 min-w-0'>
        {/* Header */}
        <div className='bg-surface-container-lowest border-b border-outline-variant p-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white'>
              <Bot className='w-6 h-6' />
            </div>
            <div>
              <h1 className='text-base font-bold text-on-surface'>
                Asisten AI Ekonomi Syariah
              </h1>
              <p className='text-xs text-on-surface-variant'>
                Tanya apa saja soal ekonomi syariah
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <button
              onClick={loadSessions}
              className='p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors'
              title='Refresh Riwayat'
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>
            {activeChatId && (
              <button
                onClick={() => setChatPendingDelete(activeChatId)}
                className='p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors'
                title='Hapus Sesi Ini'
              >
                <Trash2 className='w-5 h-5' />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto p-6 scroll-smooth ${
            messages.length === 0 ? 'bg-pattern-organic' : 'bg-surface-soft'
          }`}
          onWheel={() => setIsAutoScroll(false)}
          onTouchMove={() => setIsAutoScroll(false)}
        >
          <div className='max-w-4xl mx-auto space-y-6'>
            {error && (
              <div className='flex items-center justify-between gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm'>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='w-5 h-5 shrink-0' />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => activeChatId && handleSelectChat(activeChatId)}
                  className='px-3 py-1 bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium'
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center text-center py-12'>
                <div className='w-24 h-24 rounded-xl bg-primary-100 flex items-center justify-center mb-6 shadow-sm'>
                  <Bot className='w-12 h-12 text-primary-600' />
                </div>
                <h2 className='text-2xl font-bold text-on-surface mb-3'>
                  Halo! Saya Asisten Syariah
                </h2>
                <p className='text-on-surface-variant max-w-md mb-10 leading-relaxed'>
                  Mari berdiskusi tentang ekonomi Islam, perbankan syariah, atau
                  materi zakat dan wakaf. Pilih topik di bawah untuk memulai:
                </p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg'>
                  {[
                    'Jelaskan konsep bagi hasil',
                    'Apa itu riba dalam Islam?',
                    'Bagaimana cara menghitung zakat mal?',
                    'Perbedaan akad Murabahah & Ijarah',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className='p-4 text-left text-sm bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-control hover:bg-surface-container-low hover:text-on-surface transition-all shadow-sm'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isLastBotMsg =
                    message.role === 'bot' &&
                    message.id ===
                      [...messages].reverse().find((m) => m.role === 'bot')?.id;
                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      isStreaming={isStreaming && isLastBotMsg}
                    />
                  );
                })}

                {(isStreaming || isLoading) &&
                  !messages.find((m) => m.role === 'bot' && m.content) && (
                    <div className='flex gap-4 animate-in fade-in slide-in-from-bottom-2'>
                      <div className='shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm'>
                        <Bot className='w-6 h-6' />
                      </div>
                      <div className='flex-1 max-w-[85%] rounded-2xl p-5 bg-surface-container-lowest border border-outline-variant shadow-sm'>
                        <div className='flex items-center gap-2 text-primary-600 font-medium text-sm mb-1'>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          Memproses jawaban...
                        </div>
                        <div className='flex gap-1.5 py-2'>
                          <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce' />
                          <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]' />
                          <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]' />
                        </div>
                      </div>
                    </div>
                  )}
                <div ref={messagesEndRef} className='h-4' />
              </>
            )}
          </div>

          {!isAutoScroll && (isStreaming || messages.length > 5) && (
            <button
              onClick={() => {
                setIsAutoScroll(true);
                scrollToBottom(true);
              }}
              className='fixed bottom-24 right-10 bg-surface-container-lowest shadow-elevated-2 border border-outline-variant rounded-full p-2 text-primary-600 hover:bg-surface-container-low transition-all'
            >
              <ArrowDown className='w-5 h-5' />
            </button>
          )}
        </div>

        {/* Input */}
        <div className='border-t border-outline-variant bg-surface-container-lowest p-2'>
          <ChatInput
            onSend={handleSendMessage}
            disabled={isStreaming || isLoading}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={chatPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setChatPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus chat ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Percakapan ini akan dihapus secara permanen dan tidak dapat
              dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={confirmDeleteChat}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
