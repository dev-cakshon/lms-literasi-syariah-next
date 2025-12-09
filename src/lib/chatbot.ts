/*
	Chatbot API client utilities
	---------------------------------
	Wrapper untuk memanggil endpoint chatbot eksternal.
	Menggunakan variabel environment:
		- NEXT_PUBLIC_CHATBOT_API_BASE
		- NEXT_PUBLIC_CHATBOT_API_KEY

	API Endpoints:
		1. GET /api/v1/chats/{chat_id} - Get chat history
		2. POST /api/v1/chats/{chat_id}/message - Send message to existing chat
		3. POST /api/v1/chats/new - Create new chat

	Contoh penggunaan:
		import { createNewChat, sendMessage, getChatHistory } from '@/lib/chatbot';
		
		// Create new chat
		const reply = await createNewChat('user123', 'Apa prinsip dasar ekonomi syariah?');
		
		// Send message to existing chat
		const response = await sendMessage('chat123', 'user123', 'Jelaskan lebih lanjut');
		
		// Get chat history
		const history = await getChatHistory('chat123');
*/

import { CHATBOT_API_BASE, CHATBOT_API_KEY } from '@/constant/env';

export interface ChatHistoryItem {
  role: string;
  content: string;
  timestamp: string;
}

export interface ChatMessageRequest {
  userId: string;
  newMessage: string;
}

function ensureConfigured() {
  if (!CHATBOT_API_BASE || CHATBOT_API_BASE.trim() === '') {
    throw new Error('CHATBOT_API_BASE belum dikonfigurasi');
  }
  if (!CHATBOT_API_KEY || CHATBOT_API_KEY.trim() === '') {
    throw new Error('CHATBOT_API_KEY belum dikonfigurasi');
  }
}

/**
 * Get chat history
 * GET /api/v1/chats/{chat_id}
 */
export async function getChatHistory(
  chatId: string
): Promise<ChatHistoryItem[]> {
  ensureConfigured();

  const res = await fetch(`${CHATBOT_API_BASE}/api/v1/chats/${chatId}`, {
    method: 'GET',
    headers: {
      'X-API-KEY': CHATBOT_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get chat history: ${res.status}`);
  }

  return await res.json();
}

/**
 * Send message to existing chat
 * POST /api/v1/chats/{chat_id}/message
 */
export async function sendMessage(
  chatId: string,
  userId: string,
  newMessage: string
): Promise<string> {
  ensureConfigured();

  const payload: ChatMessageRequest = {
    userId,
    newMessage,
  };

  const res = await fetch(
    `${CHATBOT_API_BASE}/api/v1/chats/${chatId}/message`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': CHATBOT_API_KEY,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to send message: ${res.status}`);
  }

  const data = await res.json();

  // Handle string response
  if (typeof data === 'string') {
    return data;
  }

  // Handle object response
  return data.reply || data.message || data.response || String(data);
}

export interface CreateChatResponse {
  chatId: string;
  reply: string;
}

/**
 * Create new chat
 * POST /api/v1/chats/new
 */
export async function createNewChat(
  userId: string,
  newMessage: string
): Promise<CreateChatResponse> {
  ensureConfigured();

  const payload: ChatMessageRequest = {
    userId,
    newMessage,
  };

  const res = await fetch(`${CHATBOT_API_BASE}/api/v1/chats/new`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': CHATBOT_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create new chat: ${res.status}`);
  }

  const data = await res.json();

  // If API returns just a string, we need to generate chatId
  if (typeof data === 'string') {
    return {
      chatId: Date.now().toString(),
      reply: data,
    };
  }

  // If API returns an object with chatId and reply
  return {
    chatId: data.chatId || data.chat_id || Date.now().toString(),
    reply: data.reply || data.message || data.response || String(data),
  };
}

// Helper: validasi konfigurasi untuk UI
export function isChatbotConfigured(): boolean {
  return (
    Boolean((CHATBOT_API_BASE || '').trim()) &&
    Boolean((CHATBOT_API_KEY || '').trim())
  );
}
