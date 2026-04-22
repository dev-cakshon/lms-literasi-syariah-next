'use client';
import {
  MessageSquare,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';

interface Chat {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
}: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className='p-3 border-b border-gray-200 flex items-center justify-between gap-2'>
        {!isCollapsed && (
          <h2 className='font-semibold text-ink text-sm pl-1'>Riwayat Chat</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors cursor-pointer'
          title={isCollapsed ? 'Perluas sidebar' : 'Kecilkan sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className='w-5 h-5' />
          ) : (
            <PanelLeftClose className='w-5 h-5' />
          )}
        </button>
      </div>

      {/* New Chat Button */}
      <div className='p-3'>
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-colors font-medium text-sm cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <MessageSquarePlus className='w-5 h-5 shrink-0' />
          {!isCollapsed && <span>Chat Baru</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto'>
        {chats.length === 0 && !isCollapsed ? (
          <div className='px-4 py-8 text-center'>
            <MessageSquare className='w-8 h-8 text-gray-300 mx-auto mb-2' />
            <p className='text-sm text-gray-400'>
              Belum ada chat. Mulai percakapan baru!
            </p>
          </div>
        ) : (
          <div className='space-y-0.5 p-2'>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  activeChatId === chat.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                } ${isCollapsed ? 'flex justify-center' : ''}`}
              >
                {isCollapsed ? (
                  <MessageSquare
                    className={`w-5 h-5 ${
                      activeChatId === chat.id
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    }`}
                  />
                ) : (
                  <div className='space-y-0.5'>
                    <div className='font-medium text-sm truncate'>
                      {chat.title}
                    </div>
                    {chat.lastMessage && (
                      <div className='text-xs text-gray-400 truncate'>
                        {chat.lastMessage}
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
