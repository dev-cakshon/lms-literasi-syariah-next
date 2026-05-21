'use client';
import { Send } from 'lucide-react';
import { useRef, useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resetHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      resetHeight();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4'>
      <div className='flex gap-3 items-end max-w-4xl mx-auto'>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder='Ketik pertanyaan Anda...'
          disabled={disabled}
          rows={1}
          className='flex-1 min-h-[3rem] max-h-[140px] overflow-y-auto resize-none rounded-xl border border-outline-variant px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-surface-container-low disabled:cursor-not-allowed text-sm'
        />
        <button
          type='submit'
          disabled={!message.trim() || disabled}
          className='h-12 w-12 flex items-center justify-center rounded-control bg-primary-600 text-white
            hover:bg-primary-700 transition-colors cursor-pointer
            disabled:bg-outline-variant disabled:cursor-not-allowed shrink-0
            squishy-shadow shadow-primary-800 squishy-active'
        >
          <Send className='w-5 h-5' />
        </button>
      </div>
    </form>
  );
};
