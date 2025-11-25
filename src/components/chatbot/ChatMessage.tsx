import { Bot, User } from "lucide-react";

interface ChatMessageProps {
    role: "user" | "bot";
    content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
    const isBot = role === "bot";

    return (
        <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isBot
                        ? "bg-primary-100 text-primary-600"
                        : "bg-blue-100 text-blue-600"
                }`}
            >
                {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            {/* Message Content */}
            <div
                className={`flex-1 max-w-[70%] rounded-lg p-4 ${
                    isBot
                        ? "bg-gray-100 text-gray-800"
                        : "bg-primary-600 text-white"
                }`}
            >
                <div className="text-sm whitespace-pre-wrap break-words">
                    {content}
                </div>
            </div>
        </div>
    );
};
