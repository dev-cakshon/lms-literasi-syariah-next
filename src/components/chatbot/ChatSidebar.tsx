'use client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Edit2,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
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
    if (
      editValue.trim() &&
      editValue !== chats.find((c) => c.id === chatId)?.title
    ) {
      onRenameChat(chatId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      className={`h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className='p-3 border-b border-outline-variant flex items-center justify-between gap-2'>
        {!isCollapsed && (
          <h2 className='font-semibold text-on-surface text-sm pl-1'>
            Riwayat Chat
          </h2>
        )}
        <button
          type='button'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors cursor-pointer'
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
          type='button'
          onClick={onNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm cursor-pointer squishy-shadow shadow-primary-800 squishy-active ${
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
            <MessageSquare className='w-8 h-8 text-outline-variant mx-auto mb-2' />
            <p className='text-sm text-on-surface-variant'>
              Belum ada chat. Mulai percakapan baru!
            </p>
          </div>
        ) : (
          <div className='space-y-0.5 p-2'>
            {chats.map((chat) => (
              <div
                key={chat.id}
                role='button'
                tabIndex={0}
                className={`group relative flex items-center w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                  activeChatId === chat.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'hover:bg-surface-container-low text-on-surface border border-transparent'
                } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => onSelectChat(chat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectChat(chat.id);
                  }
                }}
              >
                {isCollapsed ? (
                  <MessageSquare
                    className={`w-5 h-5 ${
                      activeChatId === chat.id
                        ? 'text-primary-600'
                        : 'text-on-surface-variant'
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
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSaveEdit(chat.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className='w-full bg-surface-container-lowest border border-primary-300 rounded px-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500'
                        />
                      ) : chat.title === 'Sesi Baru...' ? (
                        <div className='pr-6 space-y-1.5'>
                          <div
                            className='h-3 rounded-full w-4/5'
                            style={{
                              background:
                                'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container-high) 50%, var(--color-surface-container-low) 75%)',
                              backgroundSize: '200% 100%',
                              animation: 'shimmer 1.4s infinite linear',
                            }}
                          />
                          <div
                            className='h-2.5 rounded-full w-3/5'
                            style={{
                              background:
                                'linear-gradient(90deg, var(--color-surface-container-low) 25%, var(--color-surface-container-high) 50%, var(--color-surface-container-low) 75%)',
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
                        <div className='text-xs text-on-surface-variant truncate pr-6'>
                          {chat.lastMessage}
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div
                      className='absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            type='button'
                            className='p-1 hover:bg-surface-container-high rounded-md text-on-surface-variant'
                          >
                            <MoreVertical className='w-4 h-4' />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className='min-w-[140px] bg-surface-container-lowest rounded-lg shadow-xl border border-outline-variant p-1 z-50 animate-in fade-in zoom-in-95'
                            sideOffset={5}
                            align='end'
                          >
                            <DropdownMenu.Item
                              className='flex items-center gap-2 px-2 py-1.5 text-sm text-on-surface hover:bg-primary-50 hover:text-primary-700 rounded-md cursor-pointer outline-none'
                              onSelect={() => handleStartEdit(chat)}
                            >
                              <Edit2 className='w-4 h-4' />
                              Ubah Nama
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className='flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer outline-none'
                              onSelect={() => onDeleteChat(chat.id)}
                            >
                              <Trash2 className='w-4 h-4' />
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
