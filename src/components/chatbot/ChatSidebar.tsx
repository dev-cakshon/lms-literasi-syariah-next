'use client';
import {
  Edit2,
  MoreVertical,
  MessageSquare,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

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
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

export const ChatSidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}: ChatSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditValue(chat.title);
  };

  const handleSaveEdit = (chatId: string) => {
    if (editValue.trim() && editValue !== chats.find(c => c.id === chatId)?.title) {
      onRenameChat(chatId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className='p-3 border-b border-gray-200 flex items-center justify-between gap-2'>
        {!isCollapsed && (
          <h2 className='font-semibold text-gray-800 text-sm pl-1'>
            Riwayat Chat
          </h2>
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
              <div
                key={chat.id}
                className={`group relative flex items-center w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  activeChatId === chat.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => onSelectChat(chat.id)}
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
                  <>
                    <div className='flex-1 min-w-0 space-y-0.5'>
                      {editingId === chat.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(chat.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(chat.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white border border-primary-300 rounded px-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      ) : chat.title === 'Sesi Baru...' ? (
                        /* Skeleton shimmer for title being generated */
                        <div className='pr-6 space-y-1.5'>
                          <div
                            className='h-3 rounded-full w-4/5'
                            style={{
                              background:
                                'linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.4s infinite linear',
                            }}
                          />
                          <div
                            className='h-2.5 rounded-full w-3/5'
                            style={{
                              background:
                                'linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.4s infinite linear 0.2s',
                            }}
                          />
                        </div>
                      ) : (
                        <div className='font-medium text-sm truncate pr-6'>
                          {chat.title}
                        </div>
                      )}
                      {chat.title !== 'Sesi Baru...' && chat.lastMessage && (
                        <div className='text-xs text-gray-400 truncate pr-6'>
                          {chat.lastMessage}
                        </div>
                      )}
                    </div>

                    {/* Actions Menu (Three Dots) */}
                    <div 
                      className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-1 hover:bg-gray-200 rounded-md text-gray-500">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 p-1 z-50 animate-in fade-in zoom-in-95"
                            sideOffset={5}
                            align="end"
                          >
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-md cursor-pointer outline-none"
                              onSelect={() => handleStartEdit(chat)}
                            >
                              <Edit2 className="w-4 h-4" />
                              Ubah Nama
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer outline-none"
                              onSelect={() => onDeleteChat(chat.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Hapus
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
