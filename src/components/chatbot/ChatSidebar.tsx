'use client';
import { MessageSquare, MessageSquarePlus } from 'lucide-react';
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
      className={`h-full bg-white border-r flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className='p-4 border-b flex items-center justify-between'>
        {!isCollapsed && <h2 className='font-semibold text-gray-800'>Chats</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 hover:bg-gray-100 rounded-md text-gray-600'
        >
          <MessageSquare className='w-5 h-5' />
        </button>
      </div>

      {/* New Chat Button */}
      <div className='p-4'>
        <button
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <MessageSquarePlus className='w-5 h-5' />
          {!isCollapsed && <span className='font-medium'>New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div className='flex-1 overflow-y-auto'>
        {chats.length === 0 && !isCollapsed ? (
          <div className='p-4 text-center text-sm text-gray-500'>
            No chats yet. Start a new conversation!
          </div>
        ) : (
          <div className='space-y-1 p-2'>
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeChatId === chat.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-gray-100 text-gray-700'
                } ${isCollapsed ? 'flex justify-center' : ''}`}
              >
                {isCollapsed ? (
                  <MessageSquare className='w-5 h-5' />
                ) : (
                  <div className='space-y-1'>
                    <div className='font-medium text-sm truncate'>
                      {chat.title}
                    </div>
                    {chat.lastMessage && (
                      <div className='text-xs text-gray-500 truncate'>
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
