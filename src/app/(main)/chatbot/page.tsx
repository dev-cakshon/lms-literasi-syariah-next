"use client";
import { AlertCircle, Bot } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChatHistoryItem,sendChatMessage } from "@/lib/chatbot";

import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatMessage } from "@/components/chatbot/ChatMessage";

interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
    timestamp: Date;
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        setError(null);

        // Tambahkan pesan user segera untuk responsif UI
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content.trim(),
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Susun history termasuk pesan baru
        const history: ChatHistoryItem[] = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: content.trim() }];
        try {
            const res = await sendChatMessage(content.trim(), history, {
                // contoh opsi: maxHistory: 20
                maxHistory: 20,
            });
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: res.reply || 'Tidak ada jawaban.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Gagal memuat jawaban: ${errorMessage}`);
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-screen">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="max-w-6xl mx-auto space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                    {messages.length === 0 ? (
                        // Empty State
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                                <Bot className="w-8 h-8 text-primary-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Asisten AI Syariah
                            </h2>
                            <p className="text-gray-600 max-w-md">
                                Tanyakan apa saja tentang ekonomi syariah, perbankan Islam, atau
                                materi pembelajaran. Saya siap membantu Anda!
                            </p>
                        </div>
                    ) : (
                        // Messages List
                        <>
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    role={message.role}
                                    content={message.content}
                                />
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 max-w-[70%] rounded-lg p-4 bg-gray-100">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Chat Input */}
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
    );
}