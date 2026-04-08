'use client';
import { Send } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4'>
      <div className='flex gap-3 items-center max-w-4xl mx-auto'>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ketik pertanyaan Anda...'
          disabled={disabled}
          rows={1}
          className='flex-1 h-12 resize-none rounded-xl border border-gray-300 px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-100 disabled:cursor-not-allowed text-sm'
        />
        <button
          type='submit'
          disabled={!message.trim() || disabled}
          className='h-12 w-12 flex items-center justify-center rounded-xl bg-primary-600 text-white
            hover:bg-primary-700 active:bg-primary-800 transition-colors cursor-pointer
            disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0'
        >
          <Send className='w-5 h-5' />
        </button>
      </div>
    </form>
  );
};
