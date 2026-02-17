"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "../chat-ui/HeroSection";
import MessageList from "../chat-ui/MessageList";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

interface DashboardChatProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  knowledgeBase?: any; // ← still unused — consider removing or implementing
}

function ChatInput({
  input,
  setInput,
  onSend,
  placeholder,
}: {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void | Promise<void>;
  placeholder?: string;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-full gap-2 items-center">
      <input
        className="flex-1 px-6 py-4 border border-transparent bg-[#18192A] text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-500 transition shadow-md"
        style={{ fontSize: 18, fontWeight: 500 }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message..."}
        autoFocus
      />
      <button
        className="px-7 py-4 ml-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ fontSize: 18 }}
        onClick={onSend}
        disabled={!input.trim()}
      >
        Send
      </button>
    </div>
  );
}

export default function DashboardChat({ user }: DashboardChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("velamini_dashboard_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse dashboard chat history:", err);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("velamini_dashboard_chat_history", JSON.stringify(messages));
    } else {
      localStorage.removeItem("velamini_dashboard_chat_history");
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const recentHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: recentHistory,
          // userId: user?.email,     // ← optional: send user context if backend supports it
          // knowledgeBaseId: ...     // ← if you plan to use knowledgeBase prop
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply ?? data.text ?? data.message ?? "Sorry, I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, there was a connection issue. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const avatarSrc = user?.image || "/logo.png"; // fallback same for user & assistant

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-whitesmoke from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-2xl h-[90vh] flex flex-col  shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 flex items-center gap-3">
          <img
            src={avatarSrc}
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-purple-400 shadow-sm object-cover"
          />
          <div>
            <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              {user?.name || "Velamini Dashboard"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              AI Assistant
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-70 select-none">
              <img
                src="/logo.png"
                alt="Assistant"
                className="w-20 h-20 mb-5 rounded-full shadow-lg"
              />
              <div className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
                Start a conversation
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                How can I help you today?
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-5 items-end gap-2`}
            >
              {msg.role === "assistant" && (
                <img
                  src="/logo.png"
                  alt="Assistant"
                  className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm border border-purple-200 dark:border-purple-800"
                />
              )}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none"
                }`}
              >
                {msg.content}
                <div className="text-[10px] text-right opacity-70 mt-1 select-none">
                  {new Date(msg.id).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {msg.role === "user" && (
                <img
                  src={avatarSrc}
                  alt="User"
                  className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm border border-blue-200 dark:border-blue-800"
                />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start items-end mb-5">
              <img
                src="/logo.png"
                alt="Assistant"
                className="w-8 h-8 rounded-full mr-2 shadow-sm border border-purple-200 dark:border-purple-800"
              />
              <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none">
                <div className="flex gap-1.5 items-center h-6">
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:180ms]"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:360ms]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-6 py-4 bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            placeholder="Ask anything..."
          />
        </div>
      </div>

      {/* Optional global styles – better to move to globals.css or component CSS module */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(1); }
          40% { transform: scale(1.35); }
        }
        .animate-bounce {
          animation: bounce 1.3s infinite;
        }
      `}</style>
    </div>
  );
}