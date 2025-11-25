/*
	Chatbot API client utilities
	---------------------------------
	Wrapper untuk memanggil endpoint chatbot eksternal.
	Menggunakan variabel environment:
		- NEXT_PUBLIC_CHATBOT_API_BASE
		- NEXT_PUBLIC_CHATBOT_API_KEY

	Contoh penggunaan:
		import { sendChatMessage } from '@/lib/chatbot';
		const res = await sendChatMessage('Apa prinsip dasar ekonomi syariah?', []);
		console.log(res.reply);
*/

import { CHATBOT_API_BASE, CHATBOT_API_KEY } from '@/constant/env';

export type ChatRole = 'user' | 'bot';

export interface ChatHistoryItem {
	role: ChatRole;
	content: string;
}

export interface ChatRequestPayload {
	message: string;
	history: ChatHistoryItem[];
}

export interface ChatResponse {
	reply: string; // teks jawaban bot sudah dipilih
	raw: unknown;  // raw response JSON untuk debugging / fitur lanjutan
}

export interface ChatbotAPIOptions {
	baseUrl?: string;        // override base url bila perlu
	apiKey?: string;         // override api key bila perlu
	signal?: AbortSignal;    // untuk pembatalan request
	maxHistory?: number;     // limit jumlah history yang dikirim
	retries?: number;        // jumlah retry otomatis
	retryDelayMs?: number;   // jeda antar retry
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 600;

function ensureConfigured(baseUrl?: string, apiKey?: string) {
	if (!baseUrl || baseUrl.trim() === '') {
		throw new Error('CHATBOT_API_BASE belum dikonfigurasi');
	}
	if (!apiKey || apiKey.trim() === '') {
		throw new Error('CHATBOT_API_KEY belum dikonfigurasi');
	}
}

function buildPayload(message: string, history: ChatHistoryItem[], maxHistory?: number): ChatRequestPayload {
	const trimmedHistory = maxHistory && maxHistory > 0
		? history.slice(-maxHistory)
		: history;
	return {
		message,
		history: trimmedHistory.map(h => ({ role: h.role, content: h.content }))
	};
}

function parseReply(json: unknown): string {
	if (json == null) return '';
	if (typeof json === 'string') return json;
	if (typeof json === 'object') {
		const obj = json as Record<string, unknown>;
		// Check for "response" field first (API format)
		if (typeof (obj as { response?: unknown }).response === 'string') {
			return (obj as { response: string }).response;
		}
		if (typeof (obj as { reply?: unknown }).reply === 'string') {
			return (obj as { reply: string }).reply;
		}
		if (typeof (obj as { message?: unknown }).message === 'string') {
			return (obj as { message: string }).message;
		}
		return JSON.stringify(obj);
	}
	return String(json);
}

async function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendChatMessage(
	message: string,
	history: ChatHistoryItem[],
	options: ChatbotAPIOptions = {}
): Promise<ChatResponse> {
	const baseUrl = options.baseUrl || CHATBOT_API_BASE;
	const apiKey = options.apiKey || CHATBOT_API_KEY;
	ensureConfigured(baseUrl, apiKey);

	const payload = buildPayload(message, history, options.maxHistory);
	const retries = options.retries ?? DEFAULT_RETRIES;
	const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY;
	let attempt = 0;
	let lastError: unknown;

	while (attempt <= retries) {
		try {
			const res = await fetch(`${baseUrl}/api/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-KEY': apiKey,
				},
				body: JSON.stringify(payload),
				signal: options.signal,
			});

			if (!res.ok) {
				throw new Error(`Request gagal status ${res.status}`);
			}

			const json = await res.json();
			return { reply: parseReply(json), raw: json };
		} catch (err) {
			lastError = err;
			// Jika sudah mencapai attempt terakhir, lempar error
			if (attempt === retries) {
				throw err;
			}
			// Backoff sederhana
			await delay(retryDelayMs * (attempt + 1));
			attempt++;
		}
	}

	throw lastError instanceof Error ? lastError : new Error('Unknown error');
}

// Helper opsional: validasi konfigurasi untuk UI
export function isChatbotConfigured(): boolean {
	return Boolean((CHATBOT_API_BASE || '').trim()) && Boolean((CHATBOT_API_KEY || '').trim());
}

// Helper untuk menyiapkan pesan baru ke history
export function appendUserMessage(history: ChatHistoryItem[], content: string): ChatHistoryItem[] {
	return [...history, { role: 'user', content }];
}

export function appendBotMessage(history: ChatHistoryItem[], content: string): ChatHistoryItem[] {
	return [...history, { role: 'bot', content }];
}

// Contoh fungsi tingkat lebih tinggi (menggabungkan pengiriman & update history)
export async function chatFlow(
	userInput: string,
	history: ChatHistoryItem[],
	options?: ChatbotAPIOptions
): Promise<{ reply: string; history: ChatHistoryItem[]; raw: unknown }> {
	const newHistory = appendUserMessage(history, userInput);
	const res = await sendChatMessage(userInput, newHistory, options);
	const finalHistory = appendBotMessage(newHistory, res.reply);
	return { reply: res.reply, history: finalHistory, raw: res.raw };
}

