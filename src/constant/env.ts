export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

// Chatbot API public config (ensure set in .env.local)
export const CHATBOT_API_BASE = process.env.NEXT_PUBLIC_CHATBOT_API_BASE || 'https://treasury-nomination-helpful-walnut.trycloudflare.com';
export const CHATBOT_API_KEY = process.env.NEXT_PUBLIC_CHATBOT_API_KEY || '';
