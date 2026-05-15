import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  role: 'user' | 'bot';
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) => {
  const isBot = role === 'bot';

  return (
    <div
      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isBot
            ? 'bg-primary-100 text-primary-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {isBot ? <Bot className='w-5 h-5' /> : <User className='w-5 h-5' />}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 min-w-0 max-w-[85%] rounded-2xl p-4 shadow-sm break-words ${
          isBot
            ? 'bg-white border border-gray-100 text-gray-800'
            : 'bg-primary-600 text-white'
        }`}
      >
        {/* During streaming: render raw text to avoid broken markdown flicker */}
        {isBot && isStreaming ? (
          <div className='text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-800'>
            {content}
            <span className='inline-block w-2 h-4 ml-0.5 bg-primary-400 animate-pulse rounded-sm align-middle' />
          </div>
        ) : (
          <div
            className={`text-sm prose prose-sm max-w-none break-words ${
              isBot ? 'prose-slate' : 'prose-invert'
            } prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className='mb-3 last:mb-0 leading-relaxed'>{children}</p>
                ),
                h1: ({ children }) => (
                  <h1 className='text-lg font-bold mb-2 mt-4'>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className='text-base font-bold mb-2 mt-3'>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className='text-sm font-bold mb-1 mt-2'>{children}</h3>
                ),
                strong: ({ children }) => (
                  <strong className='font-bold text-inherit opacity-90'>
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className='list-disc list-inside mb-3 space-y-1'>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className='list-decimal list-inside mb-3 space-y-1'>
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className='ml-1'>{children}</li>,
                table: ({ children }) => (
                  <div className='overflow-x-auto my-4 rounded-xl border border-gray-200 shadow-sm'>
                    <table className='min-w-full divide-y divide-gray-200 text-sm'>
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className='bg-gray-50'>{children}</thead>
                ),
                th: ({ children }) => (
                  <th className='px-4 py-2 text-left text-xs font-bold text-gray-900 uppercase tracking-wider border-b'>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className='px-4 py-2 text-xs text-gray-700 border-b'>
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code
                    className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] font-medium ${
                      isBot
                        ? 'bg-gray-100 text-primary-700'
                        : 'bg-primary-700 text-white'
                    }`}
                  >
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className='p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto my-3 shadow-inner'>
                    {children}
                  </pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
