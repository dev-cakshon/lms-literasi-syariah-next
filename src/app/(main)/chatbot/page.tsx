'use client';
import { AlertCircle, Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  type CreateChatResponse,
  createNewChat,
  getChatHistory,
  sendMessage,
} from '@/lib/chatbot';

import { ChatInput } from '@/components/chatbot/ChatInput';
import { ChatMessage } from '@/components/chatbot/ChatMessage';
import { ChatSidebar } from '@/components/chatbot/ChatSidebar';

import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: string;
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
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  };

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    setIsLoading(true);
    try {
      // Load messages for selected chat
      const history = await getChatHistory(chatId);
      const loadedMessages: Message[] = history.map((item, index) => ({
        id: `${chatId}-${index}`,
        role: item.role,
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
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    setError(null);

    // Tambahkan pesan user segera untuk responsif UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let botReply: string;

      if (!activeChatId) {
        // Create new chat for first message
        const response: CreateChatResponse = await createNewChat(
          user.uid,
          content.trim()
        );
        botReply = response.reply;
        const newChatId = response.chatId;
        setActiveChatId(newChatId);

        // Add to chat list
        const newChat: Chat = {
          id: newChatId,
          title:
            content.trim().slice(0, 30) + (content.length > 30 ? '...' : ''),
          lastMessage:
            botReply.length > 50 ? botReply.slice(0, 50) + '...' : botReply,
          timestamp: new Date(),
        };
        setChats((prev) => [newChat, ...prev]);
      } else {
        // Send message to existing chat
        botReply = await sendMessage(activeChatId, user.uid, content.trim());

        // Update last message in chat list
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  lastMessage:
                    botReply.length > 50
                      ? botReply.slice(0, 50) + '...'
                      : botReply,
                  timestamp: new Date(),
                }
              : chat
          )
        );
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botReply || 'Tidak ada jawaban.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Gagal memuat jawaban: ${errorMessage}`);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex h-full max-h-screen bg-gray-50'>
      {/* Chat Sidebar */}
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className='flex flex-col flex-1'>
        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto p-6'>
          <div className='max-w-4xl mx-auto space-y-4'>
            {error && (
              <div className='flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm'>
                <AlertCircle className='w-4 h-4' />
                <span>{error}</span>
              </div>
            )}
            {messages.length === 0 ? (
              // Empty State
              <div className='flex flex-col items-center justify-center h-full text-center py-20'>
                <div className='w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4'>
                  <Bot className='w-8 h-8 text-primary-600' />
                </div>
                <h2 className='text-2xl font-bold text-gray-800 mb-2'>
                  Asisten AI Syariah
                </h2>
                <p className='text-gray-600 max-w-md'>
                  Tanyakan apa saja tentang ekonomi syariah, perbankan Islam,
                  atau materi pembelajaran. Saya siap membantu Anda!
                </p>
              </div>
            ) : (
              // Messages List
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role as 'user' | 'bot'}
                    content={message.content}
                  />
                ))}
                {isLoading && (
                  <div className='flex gap-3'>
                    <div className='flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center'>
                      <Bot className='w-5 h-5' />
                    </div>
                    <div className='flex-1 max-w-[70%] rounded-lg p-4 bg-gray-100'>
                      <div className='flex gap-1'>
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]' />
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]' />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className='border-t border-gray-200 bg-white'>
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
