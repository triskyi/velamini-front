"use client";

import { useState, useRef, useEffect } from "react";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

import { getAISystemPrompt } from "@/lib/ai-config";

interface DashboardChatProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  knowledgeBase?: any; // Now used for persona
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
    <div className="flex w-full gap-2 items-center bg-transparent">
      <div className="flex-1 flex items-center bg-zinc-800/80 rounded-2xl px-4 py-3 shadow-md border border-transparent focus-within:ring-2 focus-within:ring-purple-500/70">
        <input
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-lg font-medium"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message..."}
          autoFocus
        />
        <button
          className="ml-2 p-2 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none outline-none"
          onClick={onSend}
          disabled={!input.trim()}
          aria-label="Send"
          type="button"
        >
          <PaperPlaneIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

function DashboardChat({ user, knowledgeBase }: DashboardChatProps) {
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

      // Prepare system prompt for this user
      const systemPrompt = getAISystemPrompt({
        type: "personal",
        name: user?.name || undefined,
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: recentHistory,
          knowledgeBase: knowledgeBase || null,
          systemPrompt,
          // userId: user?.email, // Optionally send user context
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
    <div className="relative flex-1 min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* HUD grid background */}
      <div className="pointer-events-none absolute inset-0 hud-grid opacity-20" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400 animate-float"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 29) % 100}%`,
              animationDelay: `${(i % 7) * 0.5}s`,
              animationDuration: `${3 + (i % 5)}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col h-screen w-full items-center justify-center bg-transparent relative z-10">
        <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-transparent overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 flex items-center gap-3">
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
                  className={`max-w-[75%] px-4 py-3 rounded-xl text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-cyan-600/90 text-white rounded-br-md"
                      : "bg-zinc-800/90 text-zinc-100 rounded-bl-md"
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
          <div className="px-6 py-4 mt-3">
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={sendMessage}
              placeholder="Ask anything..."
            />
          </div>
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
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .hud-grid {
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}

export default DashboardChat;