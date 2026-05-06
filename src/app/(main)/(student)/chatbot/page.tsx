'use client';
import { AlertCircle, Bot, Loader2, MessageSquarePlus, RefreshCw, Trash2, PanelLeftOpen } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isAutoScroll]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load sessions on mount
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
    [idToken, isStreaming]
  );

  const handleDeleteChat = useCallback(async (chatId: string) => {
    if (!idToken || !confirm('Hapus chat ini permanen?')) return;
    try {
      await deleteSession(chatId, idToken);
      if (activeChatId === chatId) handleNewChat();
      void loadSessions();
    } catch (err) {
      alert('Gagal menghapus chat');
    }
  }, [idToken, activeChatId, loadSessions]);

  const handleRenameChat = useCallback(async (chatId: string, newTitle: string) => {
    if (!idToken) return;
    try {
      await renameSession(chatId, newTitle, idToken);
      void loadSessions();
    } catch (err) {
      alert('Gagal mengubah nama chat');
    }
  }, [idToken, loadSessions]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !idToken || isStreaming) return;
    setError(null);
    setIsAutoScroll(true);

    let currentSessionId = activeChatId;

    try {
      // 1. Create session if it doesn't exist
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

      // 2. Add user message to UI
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 3. Prepare bot message placeholder (Hanya SATU bubble)
      const botMessageId = `bot-${Date.now()}`;
      setIsStreaming(true);

      // 4. Start streaming
      let fullContent = '';
      let isFirstToken = true;

      await streamChat(
        currentSessionId,
        content.trim(),
        idToken,
        (token) => {
          if (isFirstToken) {
            // Tambahkan bubble bot saat token pertama masuk
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
            // Update bubble yang sama
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, content: fullContent } : msg
              )
            );
          }
        },
        () => {
          // On Done - mark streaming as complete
          setIsStreaming(false);
          // Poll for title update using FRESH data returned from loadSessions
          // This avoids the stale closure bug where chats state is outdated
          let attempts = 0;
          const sessionIdToCheck = currentSessionId;
          const pollTitle = async () => {
            const freshSessions = await loadSessions();
            attempts++;
            const stillDefault = freshSessions?.find(
              (c) => c.id === sessionIdToCheck && c.title === 'Sesi Baru...'
            );
            if (stillDefault && attempts < 6) {
              setTimeout(pollTitle, 2000);
            }
          };
          // Start first poll after 2s (backend needs time to run background task)
          setTimeout(pollTitle, 2000);
        },
        (err) => {
          setError(`Gagal memuat jawaban: ${err}`);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Terjadi kesalahan: ${errorMessage}`);
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-[calc(100vh-4rem)] bg-white'>
      {/* Improved Chat Sidebar */}
      <div className="hidden md:block">
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
      <div className='flex flex-col flex-1 min-w-0 bg-gray-50'>
        {/* Header UI */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                 <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Asisten AI Ekonomi Syariah</h1>
                <p className="text-xs text-green-600 flex items-center gap-1">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   Sistem Aktif & Terlindungi
                </p>
              </div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={loadSessions}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title="Refresh Riwayat"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {activeChatId && (
                <button 
                   onClick={() => handleDeleteChat(activeChatId)}
                   className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                   title="Hapus Sesi Ini"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
           </div>
        </div>

        {/* Chat Messages */}
        <div 
          className='flex-1 overflow-y-auto p-6 scroll-smooth'
          onWheel={() => setIsAutoScroll(false)}
          onTouchMove={() => setIsAutoScroll(false)}
        >
          <div className='max-w-4xl mx-auto space-y-6'>
            {error && (
              <div className='flex items-center justify-between gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-sm'>
                <div className="flex items-center gap-2">
                   <AlertCircle className='w-5 h-5 shrink-0' />
                   <span>{error}</span>
                </div>
                <button 
                  onClick={() => activeChatId && handleSelectChat(activeChatId)}
                  className="px-3 py-1 bg-white border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            )}
            
            {messages.length === 0 ? (
              // Enhanced Empty State
              <div className='flex flex-col items-center justify-center h-full text-center py-12'>
                <div className='w-24 h-24 rounded-3xl bg-primary-100 flex items-center justify-center mb-6 shadow-sm'>
                  <Bot className='w-12 h-12 text-primary-600' />
                </div>
                <h2 className='text-3xl font-extrabold text-gray-900 mb-3'>
                  Halo! Saya Asisten Syariah
                </h2>
                <p className='text-gray-500 max-w-md mb-10 leading-relaxed'>
                  Mari berdiskusi tentang ekonomi Islam, perbankan syariah, 
                  atau materi zakat dan wakaf. Pilih topik di bawah untuk memulai:
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
                      className='p-4 text-left text-sm bg-white border border-gray-200 text-gray-700 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all shadow-sm'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages List
              <>
                {messages.map((message) => {
                  const isLastBotMsg =
                    message.role === 'bot' &&
                    message.id === [...messages].reverse().find((m) => m.role === 'bot')?.id;
                  return (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                      isStreaming={isStreaming && isLastBotMsg}
                    />
                  );
                })}
                
                {/* Streaming/Loading Indicator */}
                {(isStreaming || isLoading) && !messages.find(m => m.role === 'bot' && m.content) && (
                  <div className='flex gap-4 animate-in fade-in slide-in-from-bottom-2'>
                    <div className='shrink-0 w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-sm'>
                      <Bot className='w-6 h-6' />
                    </div>
                    <div className='flex-1 max-w-[85%] rounded-2xl p-5 bg-white border border-gray-100 shadow-sm'>
                      <div className='flex items-center gap-2 text-primary-600 font-medium text-sm mb-1'>
                         <Loader2 className="w-4 h-4 animate-spin" />
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
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>
          
          {/* Scroll to Bottom Button if user scrolled up */}
          {!isAutoScroll && (isStreaming || messages.length > 5) && (
             <button 
               onClick={() => { setIsAutoScroll(true); scrollToBottom(true); }}
               className="fixed bottom-24 right-10 bg-white shadow-xl border border-gray-200 rounded-full p-2 text-primary-600 hover:bg-gray-50 transition-all animate-bounce"
             >
                <PanelLeftOpen className="w-5 h-5 rotate-90" />
             </button>
          )}
        </div>

        {/* Chat Input Container */}
        <div className='border-t border-gray-200 bg-white p-2'>
          <div className="max-w-4xl mx-auto flex items-center justify-end px-4 py-1">
             {activeChatId && !isStreaming && (
               <button 
                 onClick={handleNewChat}
                 className="text-xs text-primary-600 hover:underline flex items-center gap-1"
               >
                 <MessageSquarePlus className="w-3 h-3" /> Chat Baru
               </button>
             )}
          </div>
          <ChatInput onSend={handleSendMessage} disabled={isStreaming || isLoading} />
        </div>
      </div>
    </div>
  );
}
