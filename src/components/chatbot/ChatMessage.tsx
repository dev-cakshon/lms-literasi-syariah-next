import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  role: 'user' | 'bot';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isBot = role === 'bot';

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot
            ? 'bg-primary-100 text-primary-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {isBot ? <Bot className='w-5 h-5' /> : <User className='w-5 h-5' />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[70%] rounded-2xl p-4 ${
          isBot ? 'bg-primary-50 text-ink' : 'bg-primary-600 text-white'
        }`}
      >
        <div
          className={`text-sm prose prose-sm max-w-none ${
            isBot ? 'prose-slate' : 'prose-invert'
          }`}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
              strong: ({ children }) => (
                <strong className='font-bold'>{children}</strong>
              ),
              em: ({ children }) => <em className='italic'>{children}</em>,
              ul: ({ children }) => (
                <ul className='list-disc list-inside mb-2'>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className='list-decimal list-inside mb-2'>{children}</ol>
              ),
              li: ({ children }) => <li className='mb-1'>{children}</li>,
              code: ({ children }) => (
                <code
                  className={`px-1 py-0.5 rounded text-xs ${
                    isBot ? 'bg-primary-100' : 'bg-primary-700'
                  }`}
                >
                  {children}
                </code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
