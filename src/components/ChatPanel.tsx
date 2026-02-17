"use client";

import { useState, useRef, useEffect } from "react";
import ChatNavbar from "./chat-ui/ChatNavbar";
import HeroSection from "./chat-ui/HeroSection";
import MessageList from "./chat-ui/MessageList";
import FeedbackModal from "./chat-ui/FeedbackModal";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type ChatInputProps = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => Promise<void> | void;
  placeholder?: string;
};

function ChatInput({ input, setInput, onSend, placeholder }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-full gap-2 items-center">
      <input
        className="flex-1 px-6 py-4 border border-gray-700 bg-gray-800 text-gray-100 
                   placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 
                   focus:ring-purple-500/30 transition"
        style={{ borderRadius: 25 }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message..."}
        autoFocus
      />
      <button
        className="px-10 py-10 bg-gradient-to-r from-purple-600 to-indigo-600 
                   hover:from-purple-500 hover:to-indigo-500 text-white font-medium 
                   shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ borderRadius: 25 }}
        onClick={onSend}
        disabled={!input.trim()}
      >
        Send
      </button>
    </div>
  );
}

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Optional: if you still want rating & text in parent (or move to modal internal state)
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    try {
      const saved = localStorage.getItem("velamini_chat_history");
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
    }
  }, []);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("velamini_chat_history", JSON.stringify(messages));
    } else {
      localStorage.removeItem("velamini_chat_history");
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
          useLocalKnowledge: true,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.text ?? data.error ?? "Sorry, something went wrong.",
        },
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "I'm having connection issues right now…",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    localStorage.removeItem("velamini_chat_history");
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-whitesmoke text-gray-100 font-sans overflow-hidden">
      <ChatNavbar
        onShowFeedback={() => setShowFeedbackModal(true)}
        onNewChat={handleNewChat}
      />

      {messages.length === 0 && !isTyping && <HeroSection text="Reka ture ibyaribyo" />}

      <div
        className={`flex-1 flex flex-col items-center px-4 pt-6 pb-20 overflow-y-auto ${
          messages.length === 0 ? "justify-center" : "justify-start"
        }`}
      >
        <div className="w-full max-w-3xl mx-auto flex flex-col min-h-full">
          {messages.length > 0 && (
            <MessageList
              messages={messages}
              isTyping={isTyping}
              bottomRef={bottomRef}
            />
          )}

          {/* Input in the middle if new chat */}
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-full max-w-xl mx-auto">
                <ChatInput
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  placeholder="Ask anything..."
                />
              </div>
            </div>
          ) : (
            <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent">
              <ChatInput
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                placeholder="Ask anything..."
              />
            </div>
          )}
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        rating={rating}
        setRating={setRating}
        feedbackText={feedbackText}
        setFeedbackText={setFeedbackText}
      />
    </div>
  );
}