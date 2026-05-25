'use client';

import { AlertCircle, Bot, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { createSession, getMessages, streamChat } from '@/lib/chatbot';

import { ChatInput } from '@/components/chatbot/ChatInput';
import { ChatMessage } from '@/components/chatbot/ChatMessage';

import { CourseLayoutContext } from '@/app/(main)/(student)/(course)/course/[courseId]/CourseLayoutContext';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Jelaskan konsep bagi hasil',
  'Apa itu riba dalam Islam?',
  'Bagaimana cara menghitung zakat mal?',
  'Perbedaan akad Murabahah & Ijarah',
] as const;

export function ChatbotDrawer() {
  const { isChatOpen, setChatOpen } = useContext(CourseLayoutContext);
  const { idToken } = useAuth();
  const pathname = usePathname();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Auto-close when student navigates to a different route.
  // Skip the first effect run (mount) so opening the drawer doesn't immediately close it.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setChatOpen(false);
  }, [pathname, setChatOpen]);

  // Reset conversation state whenever the drawer is closed, so next open is a clean slate.
  useEffect(() => {
    if (!isChatOpen) {
      setCurrentSessionId(null);
      setMessages([]);
      setIsStreaming(false);
      setIsLoading(false);
      setError(null);
    }
  }, [isChatOpen]);

  // Escape key closes the drawer — mirrors CourseOverlay.tsx:44-51.
  useEffect(() => {
    if (!isChatOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isChatOpen, setChatOpen]);

  // Scroll to latest message during streaming.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || !idToken || isStreaming) return;
      setError(null);

      let sessionId = currentSessionId;

      try {
        if (!sessionId) {
          setIsLoading(true);
          const session = await createSession(idToken);
          sessionId = session.session_id;
          setCurrentSessionId(sessionId);
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
          sessionId,
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
            // Re-fetch the persisted bot message so newlines (block-level markdown) are intact.
            if (sessionId && idToken) {
              getMessages(sessionId, idToken)
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
          },
          (err) => {
            setError(`Gagal memuat jawaban: ${err}`);
            setIsStreaming(false);
          },
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Terjadi kesalahan: ${msg}`);
        setIsStreaming(false);
        setIsLoading(false);
      }
    },
    [currentSessionId, idToken, isStreaming],
  );

  return (
    <>
      {/* Backdrop — matches CourseOverlay z-[60] / bg-inverse-surface/40 */}
      {isChatOpen && (
        <div
          aria-hidden='true'
          className='fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-[60]'
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        aria-label='Asisten AI'
        className={`fixed top-0 right-0 h-full w-full max-w-[420px]
          bg-surface-soft border-l border-outline-variant shadow-2xl z-[70]
          flex flex-col
          transform transition-transform duration-300 ease-out
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <header className='bg-surface-container-lowest border-b border-outline-variant px-5 py-4 flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shrink-0'>
              <Bot className='w-5 h-5' />
            </div>
            <div className='min-w-0'>
              <p className='text-sm font-bold text-on-surface truncate'>
                Asisten AI Ekonomi Syariah
              </p>
              <p className='text-xs text-on-surface-variant truncate'>
                Tanya apa saja soal ekonomi syariah
              </p>
              <Link
                href='/chatbot'
                className='inline-flex items-center gap-0.5 text-xs font-medium text-primary-600 hover:underline mt-0.5'
                onClick={() => setChatOpen(false)}
              >
                Lihat semua chat →
              </Link>
            </div>
          </div>
          <button
            type='button'
            aria-label='Tutup asisten AI'
            onClick={() => setChatOpen(false)}
            className='w-8 h-8 flex items-center justify-center rounded-full
              text-on-surface-variant hover:bg-surface-container-low transition-colors shrink-0 ml-2'
          >
            <X className='w-4 h-4' />
          </button>
        </header>

        {/* Body */}
        <div
          className={`flex-1 overflow-y-auto ${
            messages.length === 0 ? 'bg-pattern-organic' : 'bg-surface-soft'
          }`}
        >
          {messages.length === 0 ? (
            /* Empty state */
            <div className='flex flex-col items-center justify-center text-center p-6 min-h-full'>
              <div className='relative mb-6'>
                <div className='w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center'>
                  <Bot className='w-10 h-10 text-primary-600' />
                </div>
                <Sparkles className='absolute -top-2 -right-2 w-5 h-5 text-action-green' />
              </div>

              <h3 className='font-display text-xl font-semibold text-on-surface mb-3'>
                Halo! Saya Asisten Syariah
              </h3>
              <p className='text-sm text-on-surface-variant max-w-[280px] leading-relaxed mb-8'>
                Mari berdiskusi tentang ekonomi Islam, perbankan syariah, atau
                materi zakat dan wakaf. Pilih topik di bawah untuk memulai:
              </p>

              {error && (
                <div className='flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4 w-full text-left'>
                  <AlertCircle className='w-4 h-4 shrink-0' />
                  <span>{error}</span>
                </div>
              )}

              <div className='grid grid-cols-2 gap-3 w-full'>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type='button'
                    onClick={() => void handleSendMessage(s)}
                    disabled={isLoading || isStreaming}
                    className='bg-surface-container-lowest border border-outline-variant
                      hover:border-primary-600 hover:bg-surface-container-low
                      text-left p-3 rounded-2xl text-xs text-on-surface-variant
                      hover:text-on-surface transition-all shadow-sm
                      disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className='p-4 space-y-4 max-w-full'>
              {error && (
                <div className='flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm'>
                  <AlertCircle className='w-4 h-4 shrink-0' />
                  <span>{error}</span>
                </div>
              )}

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
                  <div className='flex gap-3 animate-in fade-in slide-in-from-bottom-2'>
                    <div className='shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm'>
                      <Bot className='w-5 h-5' />
                    </div>
                    <div className='flex-1 rounded-2xl p-4 bg-surface-container-lowest border border-outline-variant shadow-sm'>
                      <div className='flex items-center gap-2 text-primary-600 font-medium text-sm mb-1'>
                        <Loader2 className='w-4 h-4 animate-spin' />
                        Memproses jawaban...
                      </div>
                      <div className='flex gap-1.5 py-1'>
                        <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce' />
                        <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.2s]' />
                        <div className='w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:0.4s]' />
                      </div>
                    </div>
                  </div>
                )}

              <div ref={messagesEndRef} className='h-2' />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='bg-surface-container-lowest border-t border-outline-variant p-2 shrink-0'>
          <ChatInput
            onSend={(msg) => void handleSendMessage(msg)}
            disabled={isStreaming || isLoading}
          />
          <p className='text-center text-[10px] text-outline mt-1 pb-1'>
            AI dapat membuat kesalahan. Harap periksa kembali info penting.
          </p>
        </div>
      </aside>
    </>
  );
}
