/*
	Chatbot API client utilities (FastAPI Version)
	---------------------------------
	Wrapper untuk memanggil endpoint chatbot eksternal.
	Menggunakan variabel environment:
		- NEXT_PUBLIC_CHATBOT_API_BASE
		- NEXT_PUBLIC_CHATBOT_API_KEY

	API Endpoints:
		1. GET /api/v1/sessions - List session
		2. POST /api/v1/sessions - Create new session
		3. DELETE /api/v1/sessions/{id} - Delete session
		4. GET /api/v1/sessions/{id}/messages - Get chat history
		5. POST /api/v1/chat/{id}/stream - Streaming response (SSE)
*/

import { CHATBOT_API_BASE, CHATBOT_API_KEY } from '@/constant/env';

export interface ChatSession {
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
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
 * Get list of sessions for current user
 */
export async function getSessions(idToken: string): Promise<ChatSession[]> {
  ensureConfigured();

  const res = await fetch(`${CHATBOT_API_BASE}/api/v1/sessions`, {
    method: 'GET',
    headers: {
      'X-API-Key': CHATBOT_API_KEY,
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get sessions: ${res.status}`);
  }

  const data = await res.json();
  return data.sessions || [];
}

/**
 * Create a new chat session
 */
export async function createSession(idToken: string): Promise<ChatSession> {
  ensureConfigured();

  const res = await fetch(`${CHATBOT_API_BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: {
      'X-API-Key': CHATBOT_API_KEY,
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to create session: ${res.status}`);
  }

  return await res.json();
}

/**
 * Delete a chat session
 */
export async function deleteSession(
  sessionId: string,
  idToken: string,
): Promise<void> {
  ensureConfigured();

  const res = await fetch(`${CHATBOT_API_BASE}/api/v1/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': CHATBOT_API_KEY,
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.status}`);
  }
}

/**
 * Get message history for a session
 */
export async function getMessages(
  sessionId: string,
  idToken: string,
  limit = 50,
  startAfterId?: string,
): Promise<ChatMessage[]> {
  ensureConfigured();

  let url = `${CHATBOT_API_BASE}/api/v1/sessions/${sessionId}/messages?limit=${limit}`;
  if (startAfterId) {
    url += `&start_after_id=${startAfterId}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': CHATBOT_API_KEY,
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get messages: ${res.status}`);
  }

  const data = await res.json();
  return data.messages || [];
}

/**
 * Rename a chat session
 */
export async function renameSession(
  sessionId: string,
  title: string,
  idToken: string,
): Promise<void> {
  ensureConfigured();

  const res = await fetch(
    `${CHATBOT_API_BASE}/api/v1/sessions/${sessionId}/title`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CHATBOT_API_KEY,
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ title }),
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to rename session: ${res.status}`);
  }
}

/**
 * Stream chat response using SSE
 */
export async function streamChat(
  sessionId: string,
  prompt: string,
  idToken: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  ensureConfigured();

  const url = `${CHATBOT_API_BASE}/api/v1/chat/${sessionId}/stream?prompt=${encodeURIComponent(
    prompt,
  )}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': CHATBOT_API_KEY,
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();
    let accumulatedBuffer = '';

    const processChunk = (chunk: string) => {
      const parts = (accumulatedBuffer + chunk).split('\n\n');
      accumulatedBuffer = parts.pop() || '';

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const content = part.substring(6);
          if (content === '[DONE]') return 'done';
          if (content.startsWith('Error: ')) return content.substring(7);
          onToken(content);
        }
      }
      return null;
    };

    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();

      if (done) {
        // Flush any bytes held inside the TextDecoder
        const remaining = decoder.decode();
        if (remaining) processChunk(remaining);

        // Process any remaining SSE lines in the buffer
        if (accumulatedBuffer.startsWith('data: ')) {
          const content = accumulatedBuffer.substring(6);
          if (content !== '[DONE]' && !content.startsWith('Error: ')) {
            onToken(content);
          }
        }

        onDone(); // ✅ Always call onDone when the stream closes
        reading = false;
        return;
      }

      const result = processChunk(decoder.decode(value, { stream: true }));

      if (result === 'done') {
        await reader.cancel(); // ✅ Release the connection
        onDone();
        reading = false;
        return;
      }

      if (result !== null) {
        await reader.cancel(); // ✅ Release the connection
        onError(result);
        reading = false;
        return;
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : String(err));
  }
}

// Helper: validasi konfigurasi untuk UI
export function isChatbotConfigured(): boolean {
  return (
    Boolean((CHATBOT_API_BASE || '').trim()) &&
    Boolean((CHATBOT_API_KEY || '').trim())
  );
}
